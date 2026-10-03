import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Article, HotspotZone, UAPCoordinates } from '../types';
import { UAP_HOTSPOTS, calculateHaversineDistance } from '../services/mapsService';
import { 
  Compass, 
  Crosshair, 
  Locate, 
  Radio, 
  Radar, 
  ShieldAlert, 
  Target, 
  ZoomIn, 
  ZoomOut, 
  X, 
  Navigation, 
  RotateCcw,
  Globe as GlobeIcon,
  Play,
  Pause,
  Layers,
  MapPin,
  Sparkles
} from 'lucide-react';

interface UAPTacticalMapProps {
  articles: Article[];
  selectedArticle: Article | null;
  onSelectArticle: (article: Article) => void;
  onOpenDossier: (article: Article) => void;
}

type ProjectionMode = '3d-globe' | '2d-radar';
type RadarGridType = 'hybrid' | 'satellite' | 'vector';

// Simplified continent landmass polygons (lat, lng points) for authentic Earth globe rendering
const CONTINENT_POLYGONS: [number, number][][] = [
  // North America
  [
    [70, -165], [71, -130], [70, -90], [60, -65], [45, -60], [30, -80], [25, -80],
    [15, -85], [10, -75], [18, -100], [25, -110], [35, -120], [48, -125], [60, -140],
    [65, -168], [70, -165]
  ],
  // South America
  [
    [10, -75], [5, -50], [-10, -35], [-25, -45], [-45, -65], [-55, -70], [-50, -75],
    [-20, -70], [-5, -80], [10, -75]
  ],
  // Eurasia
  [
    [75, 10], [70, 40], [75, 80], [70, 130], [65, 170], [50, 140], [35, 120], [20, 110],
    [10, 105], [20, 85], [25, 60], [30, 35], [35, -10], [45, -5], [55, 5], [65, 15],
    [75, 10]
  ],
  // Africa
  [
    [35, -10], [37, 10], [30, 32], [12, 45], [0, 42], [-15, 40], [-34, 20], [-34, 18],
    [-18, 12], [5, 2], [10, -15], [20, -18], [35, -10]
  ],
  // Australia
  [
    [-12, 130], [-15, 145], [-25, 152], [-38, 148], [-35, 115], [-22, 114], [-12, 130]
  ],
  // Antarctica
  [
    [-65, -180], [-68, -120], [-70, -60], [-65, 0], [-68, 60], [-70, 120], [-65, 180]
  ]
];

const UAPTacticalMap: React.FC<UAPTacticalMapProps> = ({
  articles,
  selectedArticle,
  onSelectArticle,
  onOpenDossier,
}) => {
  const [projectionMode, setProjectionMode] = useState<ProjectionMode>('3d-globe');
  const [gridType, setGridType] = useState<RadarGridType>('hybrid');
  
  // 3D Globe camera rotation (angles in radians)
  // rotLng: Y-axis rotation (longitude), rotLat: X-axis rotation (latitude/pitch)
  const [rotLng, setRotLng] = useState<number>(-1.65); // Centered over North America
  const [rotLat, setRotLat] = useState<number>(0.55);  // ~32° North tilt
  const [globeZoom, setGlobeZoom] = useState<number>(1.15); // Zoom multiplier
  const [isAutoRotating, setIsAutoRotating] = useState<boolean>(true);

  const [activeMarkerArticle, setActiveMarkerArticle] = useState<Article | null>(null);
  const [userLocation, setUserLocation] = useState<UAPCoordinates | null>(null);
  const [selectedHotspot, setSelectedHotspot] = useState<HotspotZone | null>(null);
  const [locatingUser, setLocatingUser] = useState<boolean>(false);

  // Interaction State
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [hoveredArticle, setHoveredArticle] = useState<Article | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(performance.now());
  const radarSweepAngleRef = useRef<number>(0);

  // Focus on selected article when updated
  useEffect(() => {
    if (selectedArticle && selectedArticle.coordinates) {
      setActiveMarkerArticle(selectedArticle);
      // Smoothly rotate globe to face the selected article
      const targetLng = (selectedArticle.coordinates.lng * Math.PI) / 180;
      const targetLat = (selectedArticle.coordinates.lat * Math.PI) / 180;
      setRotLng(-targetLng);
      setRotLat(targetLat * 0.7);
      setGlobeZoom(1.85);
      setIsAutoRotating(false);
    }
  }, [selectedArticle]);

  // Handle GPS location
  const handleLocateUser = () => {
    if (!navigator.geolocation) return;
    setLocatingUser(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords: UAPCoordinates = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        setUserLocation(coords);
        const targetLng = (coords.lng * Math.PI) / 180;
        const targetLat = (coords.lat * Math.PI) / 180;
        setRotLng(-targetLng);
        setRotLat(targetLat * 0.7);
        setGlobeZoom(1.85);
        setSelectedHotspot(null);
        setIsAutoRotating(false);
        setLocatingUser(false);
      },
      (err) => {
        console.warn('Geolocation denied or unavailable:', err);
        setLocatingUser(false);
      },
      { timeout: 8000 }
    );
  };

  const handleResetCenter = () => {
    setRotLng(-1.65);
    setRotLat(0.55);
    setGlobeZoom(1.15);
    setSelectedHotspot(null);
    setIsAutoRotating(true);
  };

  // Reference point for distance calculations
  const referencePoint: UAPCoordinates = useMemo(() => {
    if (userLocation) return userLocation;
    if (selectedHotspot) return selectedHotspot.coordinates;
    if (selectedArticle && selectedArticle.coordinates) return selectedArticle.coordinates;
    return { lat: 37.0902, lng: -95.7129 };
  }, [userLocation, selectedHotspot, selectedArticle]);

  // Proximate reports calculation
  const proximateArticles = useMemo(() => {
    return articles
      .map((art) => {
        const coords = art.coordinates || { lat: 37.0902, lng: -95.7129 };
        const dist = calculateHaversineDistance(referencePoint, coords);
        return {
          ...art,
          distanceKm: dist.km,
          distanceMiles: dist.miles,
        };
      })
      .sort((a, b) => (a.distanceKm || 0) - (b.distanceKm || 0));
  }, [articles, referencePoint]);

  const closestReport = proximateArticles[0] || null;

  const handleMarkerClick = (art: Article) => {
    setActiveMarkerArticle(art);
    onSelectArticle(art);
    if (art.coordinates) {
      const targetLng = (art.coordinates.lng * Math.PI) / 180;
      const targetLat = (art.coordinates.lat * Math.PI) / 180;
      setRotLng(-targetLng);
      setRotLat(targetLat * 0.7);
      setGlobeZoom(1.85);
      setIsAutoRotating(false);
    }
  };

  const handleSelectHotspotSector = (hotspot: HotspotZone) => {
    setSelectedHotspot(hotspot);
    setUserLocation(null);
    const targetLng = (hotspot.coordinates.lng * Math.PI) / 180;
    const targetLat = (hotspot.coordinates.lat * Math.PI) / 180;
    setRotLng(-targetLng);
    setRotLat(targetLat * 0.7);
    setGlobeZoom(1.95);
    setIsAutoRotating(false);
  };

  // Convert 3D spherical coordinates (lat, lng in degrees) to 2D screen coordinates
  // Returns screen { x, y }, depth z (positive = facing camera, negative = back hemisphere), and visibility
  const project3DToScreen = useCallback(
    (latDeg: number, lngDeg: number, centerX: number, centerY: number, radius: number) => {
      const lat = (latDeg * Math.PI) / 180;
      const lng = (lngDeg * Math.PI) / 180;

      // Rotate around Y-axis (rotLng)
      const x1 = Math.cos(lat) * Math.sin(lng + rotLng);
      const y1 = Math.sin(lat);
      const z1 = Math.cos(lat) * Math.cos(lng + rotLng);

      // Rotate around X-axis (rotLat)
      const x2 = x1;
      const y2 = y1 * Math.cos(rotLat) - z1 * Math.sin(rotLat);
      const z2 = y1 * Math.sin(rotLat) + z1 * Math.cos(rotLat);

      const screenX = centerX + x2 * radius;
      const screenY = centerY - y2 * radius;

      return {
        x: screenX,
        y: screenY,
        z: z2,
        isFacingCamera: z2 > -0.05,
      };
    },
    [rotLng, rotLat]
  );

  // Mouse & Touch Drag Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    setIsAutoRotating(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !dragStart) {
      // Check hover over blips on canvas
      checkHoveredBlip(e.clientX, e.clientY);
      return;
    }

    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;

    setRotLng((prev) => prev + dx * 0.007);
    setRotLat((prev) => Math.max(-1.3, Math.min(1.3, prev - dy * 0.007)));
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDragStart(null);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setGlobeZoom((prev) => Math.max(0.8, Math.min(4.5, prev + delta)));
  };

  // Check if click was on a blip on the globe
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) * 0.72 * globeZoom;

    // Find clicked article
    for (const art of articles) {
      const coords = art.coordinates || { lat: 37.0902, lng: -95.7129 };
      const proj = project3DToScreen(coords.lat, coords.lng, centerX, centerY, radius);

      if (proj.isFacingCamera) {
        const dist = Math.hypot(proj.x - mouseX, proj.y - mouseY);
        if (dist <= 18) {
          handleMarkerClick(art);
          return;
        }
      }
    }
  };

  const checkHoveredBlip = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = clientX - rect.left;
    const mouseY = clientY - rect.top;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) * 0.72 * globeZoom;

    let found: Article | null = null;
    for (const art of articles) {
      const coords = art.coordinates || { lat: 37.0902, lng: -95.7129 };
      const proj = project3DToScreen(coords.lat, coords.lng, centerX, centerY, radius);

      if (proj.isFacingCamera) {
        const dist = Math.hypot(proj.x - mouseX, proj.y - mouseY);
        if (dist <= 18) {
          found = art;
          break;
        }
      }
    }
    setHoveredArticle(found);
  };

  // Continuous animation & rendering loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let isMounted = true;

    const render = (time: number) => {
      if (!isMounted) return;

      const dt = (time - lastTimeRef.current) / 1000;
      lastTimeRef.current = time;

      // Auto-rotation when not dragging
      if (isAutoRotating && !isDragging) {
        setRotLng((prev) => prev + 0.0035);
      }

      radarSweepAngleRef.current = (radarSweepAngleRef.current + 1.2) % 360;

      // Canvas dimensions
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2;
      const baseRadius = Math.min(centerX, centerY) * 0.72;
      const radius = baseRadius * globeZoom;

      if (projectionMode === '3d-globe') {
        render3DGlobe(ctx, centerX, centerY, radius, time);
      } else {
        render2DPlanarRadar(ctx, centerX, centerY, radius, time);
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      isMounted = false;
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [projectionMode, gridType, globeZoom, isAutoRotating, isDragging, rotLng, rotLat, articles, selectedArticle, closestReport, userLocation, project3DToScreen]);

  // Render 3D Earth Globe on Canvas
  const render3DGlobe = (
    ctx: CanvasRenderingContext2D,
    centerX: number,
    centerY: number,
    radius: number,
    time: number
  ) => {
    ctx.save();

    // 1. Atmosphere Rim Glow Outer Shadow
    const atmoGrad = ctx.createRadialGradient(
      centerX, centerY, radius * 0.9,
      centerX, centerY, radius * 1.15
    );
    atmoGrad.addColorStop(0, gridType === 'vector' ? 'rgba(34, 197, 94, 0.35)' : 'rgba(56, 189, 248, 0.3)');
    atmoGrad.addColorStop(0.6, gridType === 'vector' ? 'rgba(22, 101, 52, 0.15)' : 'rgba(14, 165, 233, 0.1)');
    atmoGrad.addColorStop(1, 'transparent');

    ctx.fillStyle = atmoGrad;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 1.15, 0, Math.PI * 2);
    ctx.fill();

    // 2. Earth Globe Ocean Sphere
    const oceanGrad = ctx.createRadialGradient(
      centerX - radius * 0.35, centerY - radius * 0.35, radius * 0.1,
      centerX, centerY, radius
    );

    if (gridType === 'satellite') {
      oceanGrad.addColorStop(0, '#0a2e46');
      oceanGrad.addColorStop(0.6, '#041724');
      oceanGrad.addColorStop(1, '#020b12');
    } else if (gridType === 'vector') {
      oceanGrad.addColorStop(0, '#04170d');
      oceanGrad.addColorStop(0.7, '#020b06');
      oceanGrad.addColorStop(1, '#010503');
    } else {
      // Hybrid
      oceanGrad.addColorStop(0, '#063228');
      oceanGrad.addColorStop(0.7, '#031914');
      oceanGrad.addColorStop(1, '#010c0a');
    }

    ctx.fillStyle = oceanGrad;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fill();

    // Clip to globe circle so continents and lines curve naturally
    ctx.save();
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.clip();

    // 3. Latitude & Longitude Graticule Circles
    ctx.lineWidth = 1;
    ctx.strokeStyle = gridType === 'vector' ? 'rgba(34, 197, 94, 0.22)' : 'rgba(16, 185, 129, 0.18)';

    // Latitude parallels
    const latSteps = [-60, -30, 0, 30, 60];
    for (const latDeg of latSteps) {
      ctx.beginPath();
      let first = true;
      for (let lngDeg = -180; lngDeg <= 180; lngDeg += 5) {
        const pt = project3DToScreen(latDeg, lngDeg, centerX, centerY, radius);
        if (pt.isFacingCamera) {
          if (first) {
            ctx.moveTo(pt.x, pt.y);
            first = false;
          } else {
            ctx.lineTo(pt.x, pt.y);
          }
        } else {
          first = true;
        }
      }
      ctx.stroke();
    }

    // Longitude meridians
    for (let lngDeg = -180; lngDeg < 180; lngDeg += 30) {
      ctx.beginPath();
      let first = true;
      for (let latDeg = -85; latDeg <= 85; latDeg += 5) {
        const pt = project3DToScreen(latDeg, lngDeg, centerX, centerY, radius);
        if (pt.isFacingCamera) {
          if (first) {
            ctx.moveTo(pt.x, pt.y);
            first = false;
          } else {
            ctx.lineTo(pt.x, pt.y);
          }
        } else {
          first = true;
        }
      }
      ctx.stroke();
    }

    // 4. Continent Landmasses
    ctx.fillStyle = gridType === 'vector' ? 'rgba(22, 101, 52, 0.45)' : 'rgba(13, 148, 136, 0.35)';
    ctx.strokeStyle = gridType === 'vector' ? 'rgba(74, 222, 128, 0.8)' : 'rgba(52, 211, 153, 0.7)';
    ctx.lineWidth = 1.5;

    for (const poly of CONTINENT_POLYGONS) {
      ctx.beginPath();
      let hasPoints = false;
      for (let i = 0; i < poly.length; i++) {
        const [latDeg, lngDeg] = poly[i];
        const pt = project3DToScreen(latDeg, lngDeg, centerX, centerY, radius);
        if (pt.isFacingCamera) {
          if (!hasPoints) {
            ctx.moveTo(pt.x, pt.y);
            hasPoints = true;
          } else {
            ctx.lineTo(pt.x, pt.y);
          }
        }
      }
      if (hasPoints) {
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }
    }

    // 5. Radar Sweep Line sweeping around the globe
    const sweepRad = (radarSweepAngleRef.current * Math.PI) / 180;
    const sweepEnd = {
      x: centerX + Math.cos(sweepRad) * radius,
      y: centerY + Math.sin(sweepRad) * radius,
    };
    const sweepGrad = ctx.createLinearGradient(centerX, centerY, sweepEnd.x, sweepEnd.y);
    sweepGrad.addColorStop(0, 'rgba(34, 197, 94, 0.7)');
    sweepGrad.addColorStop(1, 'rgba(34, 197, 94, 0.05)');

    ctx.strokeStyle = sweepGrad;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(sweepEnd.x, sweepEnd.y);
    ctx.stroke();

    ctx.restore(); // Exit globe clipping

    // 6. Perimeter Tactical HUD Ring & Azimuth Marks
    ctx.strokeStyle = 'rgba(34, 197, 94, 0.5)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.stroke();

    // Cardinal Azimuth Marks
    ctx.font = '9px monospace';
    ctx.fillStyle = '#4ade80';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('000° N', centerX, centerY - radius - 12);
    ctx.fillText('180° S', centerX, centerY + radius + 12);
    ctx.fillText('270° W', centerX - radius - 24, centerY);
    ctx.fillText('090° E', centerX + radius + 24, centerY);

    // 7. Render GPS User Beacon
    if (userLocation) {
      const pt = project3DToScreen(userLocation.lat, userLocation.lng, centerX, centerY, radius);
      if (pt.isFacingCamera) {
        ctx.fillStyle = '#3b82f6';
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    }

    // 8. Render Sighting Contact Blips on the 3D Globe
    for (let i = 0; i < articles.length; i++) {
      const art = articles[i];
      const coords = art.coordinates || { lat: 37.0902, lng: -95.7129 };
      const pt = project3DToScreen(coords.lat, coords.lng, centerX, centerY, radius);

      const isSelected = selectedArticle?.id === art.id;
      const isClosest = closestReport?.id === art.id;

      if (pt.isFacingCamera) {
        // Front hemisphere: Fully visible, interactive beacon with pulsing ring
        const pulse = (Math.sin(time / 220 + i) + 1) / 2;
        const color = isSelected ? '#ef4444' : isClosest ? '#eab308' : '#22c55e';

        // Outer pulse circle
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.5;
        ctx.globalAlpha = 0.8 - pulse * 0.5;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 7 + pulse * 10, 0, Math.PI * 2);
        ctx.stroke();

        // Inner solid core
        ctx.globalAlpha = 1;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, isSelected ? 6.5 : 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Callout Tag if selected or hovered
        if (isSelected || hoveredArticle?.id === art.id) {
          ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
          ctx.strokeStyle = color;
          ctx.lineWidth = 1;
          const tagText = `#${i + 1} ${art.title.slice(0, 24)}...`;
          const textWidth = ctx.measureText(tagText).width;

          ctx.beginPath();
          ctx.roundRect(pt.x + 10, pt.y - 10, textWidth + 12, 20, 4);
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = color;
          ctx.font = 'bold 9px monospace';
          ctx.textAlign = 'left';
          ctx.textBaseline = 'middle';
          ctx.fillText(tagText, pt.x + 16, pt.y);
        }
      } else {
        // Back hemisphere: Dimmed ghost beacon indicating behind globe curvature
        ctx.globalAlpha = 0.2;
        ctx.fillStyle = isSelected ? '#ef4444' : '#166534';
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }
    }

    ctx.restore();
  };

  // Render 2D Planar Radar Mode
  const render2DPlanarRadar = (
    ctx: CanvasRenderingContext2D,
    centerX: number,
    centerY: number,
    radius: number,
    time: number
  ) => {
    ctx.save();

    // 1. Radar Backdrop
    const radarGrad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
    radarGrad.addColorStop(0, '#041f11');
    radarGrad.addColorStop(0.8, '#020e07');
    radarGrad.addColorStop(1, '#010503');

    ctx.fillStyle = radarGrad;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fill();

    // 2. Concentric Range Rings
    ctx.strokeStyle = 'rgba(34, 197, 94, 0.28)';
    ctx.lineWidth = 1;
    const ringSteps = [0.25, 0.5, 0.75, 1.0];
    for (const factor of ringSteps) {
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius * factor, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Crosshairs
    ctx.beginPath();
    ctx.moveTo(centerX - radius, centerY);
    ctx.lineTo(centerX + radius, centerY);
    ctx.moveTo(centerX, centerY - radius);
    ctx.lineTo(centerX, centerY + radius);
    ctx.stroke();

    // 3. Rotating Sweep Line
    const sweepRad = (radarSweepAngleRef.current * Math.PI) / 180;
    const sweepEnd = {
      x: centerX + Math.cos(sweepRad) * radius,
      y: centerY + Math.sin(sweepRad) * radius,
    };
    ctx.strokeStyle = 'rgba(34, 197, 94, 0.8)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(sweepEnd.x, sweepEnd.y);
    ctx.stroke();

    // 4. Incident Blips projected on planar circular radar
    for (let i = 0; i < articles.length; i++) {
      const art = articles[i];
      const coords = art.coordinates || { lat: 37.0902, lng: -95.7129 };
      const dist = calculateHaversineDistance(referencePoint, coords).km;
      const angle = Math.atan2(coords.lat - referencePoint.lat, coords.lng - referencePoint.lng);
      const rDist = Math.min(radius * 0.92, (dist / 4000) * radius * globeZoom);

      const blipX = centerX + Math.cos(angle) * rDist;
      const blipY = centerY - Math.sin(angle) * rDist;

      const isSelected = selectedArticle?.id === art.id;
      const isClosest = closestReport?.id === art.id;
      const color = isSelected ? '#ef4444' : isClosest ? '#eab308' : '#22c55e';

      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(blipX, blipY, isSelected ? 6 : 4.5, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  };

  return (
    <div className="flex flex-col xl:flex-row gap-6 w-full h-[850px] max-h-[88vh] font-mono select-none">
      
      {/* Primary 3D Radar Operations Deck */}
      <div className="flex-1 relative rounded-xl overflow-hidden border border-green-800/60 bg-black flex flex-col shadow-[0_0_40px_rgba(0,0,0,0.8)]">
        
        {/* Top Tactical Radar HUD Bar */}
        <div className="absolute top-3 left-3 right-3 z-30 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
          
          {/* Status Badge */}
          <div className="bg-black/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-green-800/80 pointer-events-auto flex items-center gap-2 shadow-xl">
            <GlobeIcon className="text-green-400 animate-spin [animation-duration:12s]" size={16} />
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-green-400">
              {projectionMode === '3d-globe' ? '3D EARTH ORBITAL RADAR' : '2D PLANAR TACTICAL RADAR'}
            </span>
            <span className="text-[9px] text-green-600 border-l border-green-900/60 pl-2">
              BLIPS: {articles.length}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 pointer-events-auto">
            {/* Projection Mode Toggle */}
            <div className="bg-black/90 backdrop-blur-md p-1 rounded-lg border border-green-800/80 flex items-center gap-1 shadow-lg text-[9px]">
              <button
                onClick={() => setProjectionMode('3d-globe')}
                className={`px-2.5 py-1 rounded font-bold uppercase transition-all flex items-center gap-1 ${
                  projectionMode === '3d-globe'
                    ? 'bg-green-600 text-black shadow-[0_0_10px_rgba(34,197,94,0.5)]'
                    : 'text-green-400 hover:text-white'
                }`}
                title="Interactive Rotating 3D Earth Globe with Simulated Coordinates"
              >
                <GlobeIcon size={11} />
                <span>3D Globe</span>
              </button>
              <button
                onClick={() => setProjectionMode('2d-radar')}
                className={`px-2.5 py-1 rounded font-bold uppercase transition-all flex items-center gap-1 ${
                  projectionMode === '2d-radar'
                    ? 'bg-green-600 text-black shadow-[0_0_10px_rgba(34,197,94,0.5)]'
                    : 'text-green-400 hover:text-white'
                }`}
                title="Planar Polar Radar Grid"
              >
                <Radar size={11} />
                <span>Planar</span>
              </button>
            </div>

            {/* Grid Style Toggle */}
            <div className="bg-black/90 backdrop-blur-md p-1 rounded-lg border border-green-800/80 flex items-center gap-1 shadow-lg text-[9px]">
              <button
                onClick={() => setGridType('hybrid')}
                className={`px-2 py-1 rounded font-bold uppercase transition-all ${
                  gridType === 'hybrid' ? 'bg-green-600 text-black' : 'text-green-500 hover:text-green-200'
                }`}
              >
                Hybrid
              </button>
              <button
                onClick={() => setGridType('satellite')}
                className={`px-2 py-1 rounded font-bold uppercase transition-all ${
                  gridType === 'satellite' ? 'bg-green-600 text-black' : 'text-green-500 hover:text-green-200'
                }`}
              >
                Satellite
              </button>
              <button
                onClick={() => setGridType('vector')}
                className={`px-2 py-1 rounded font-bold uppercase transition-all ${
                  gridType === 'vector' ? 'bg-green-600 text-black' : 'text-green-500 hover:text-green-200'
                }`}
              >
                Vector
              </button>
            </div>

            {/* Auto-Rotation Toggle */}
            {projectionMode === '3d-globe' && (
              <button
                onClick={() => setIsAutoRotating(!isAutoRotating)}
                className={`bg-black/90 backdrop-blur-md px-2.5 py-1.5 rounded-lg border border-green-800/80 text-[9px] font-bold uppercase transition-all flex items-center gap-1 shadow-lg ${
                  isAutoRotating ? 'text-green-400 border-green-500' : 'text-gray-400 hover:text-green-300'
                }`}
                title={isAutoRotating ? 'Pause Globe Auto-Rotation' : 'Resume Globe Auto-Rotation'}
              >
                {isAutoRotating ? <Pause size={11} /> : <Play size={11} />}
                <span>{isAutoRotating ? 'Orbiting' : 'Paused'}</span>
              </button>
            )}

            {/* Zoom Controls */}
            <div className="bg-black/90 backdrop-blur-md p-1 rounded-lg border border-green-800/80 flex items-center gap-1 shadow-lg text-green-400">
              <button
                onClick={() => setGlobeZoom((z) => Math.min(z + 0.25, 4.5))}
                className="p-1 hover:bg-green-900/50 rounded"
                title="Zoom In Globe"
              >
                <ZoomIn size={14} />
              </button>
              <span className="text-[9px] font-bold px-1 text-green-300">
                {globeZoom.toFixed(1)}X
              </span>
              <button
                onClick={() => setGlobeZoom((z) => Math.max(z - 0.25, 0.8))}
                className="p-1 hover:bg-green-900/50 rounded"
                title="Zoom Out Globe"
              >
                <ZoomOut size={14} />
              </button>
            </div>

            {/* Reset View */}
            <button
              onClick={handleResetCenter}
              className="bg-black/90 backdrop-blur-md hover:bg-green-900/50 p-1.5 rounded-lg border border-green-800/80 text-green-400 hover:text-green-200 transition-all shadow-lg"
              title="Reset Globe Orientation & Zoom"
            >
              <RotateCcw size={13} />
            </button>

            {/* GPS Proximity Lock */}
            <button
              onClick={handleLocateUser}
              disabled={locatingUser}
              className="bg-black/90 backdrop-blur-md hover:bg-green-900/50 px-2.5 py-1.5 rounded-lg border border-green-800/80 text-green-400 hover:text-green-200 transition-all flex items-center gap-1.5 text-[9px] uppercase font-bold shadow-lg"
              title="Center Globe on My GPS Coordinates"
            >
              <Locate size={13} className={locatingUser ? 'animate-spin' : ''} />
              <span className="hidden sm:inline">GPS Lock</span>
            </button>
          </div>
        </div>

        {/* 3D Earth Globe Canvas Viewport */}
        <div className="flex-1 w-full h-full relative overflow-hidden flex items-center justify-center bg-black">
          <canvas
            ref={canvasRef}
            width={1200}
            height={800}
            onClick={handleCanvasClick}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={handleWheel}
            className={`w-full h-full object-contain ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
          />

          {/* Locked Radar Target Floating Card on Canvas */}
          {activeMarkerArticle && (
            <div className="absolute bottom-4 left-4 z-30 max-w-sm w-full bg-black/90 border border-green-700/80 p-3.5 rounded-xl shadow-2xl backdrop-blur-md pointer-events-auto">
              <div className="flex justify-between items-start mb-1.5">
                <div className="flex items-center gap-1.5">
                  <ShieldAlert size={14} className="text-red-500 animate-pulse" />
                  <span className="text-[9px] font-bold text-red-400 uppercase tracking-widest">
                    LOCKED GLOBE TARGET
                  </span>
                </div>
                <button
                  onClick={() => setActiveMarkerArticle(null)}
                  className="text-green-700 hover:text-red-400 p-0.5"
                >
                  <X size={14} />
                </button>
              </div>

              <h4 className="text-xs font-bold text-gray-100 uppercase tracking-tight line-clamp-1 mb-1">
                {activeMarkerArticle.title}
              </h4>
              <p className="text-[10px] text-gray-300 line-clamp-2 mb-2.5 font-sans leading-relaxed">
                {activeMarkerArticle.description}
              </p>

              <div className="flex items-center justify-between text-[9px] bg-green-950/40 p-1.5 rounded border border-green-900/60 mb-2.5">
                <span className="text-green-600">SECTOR: {activeMarkerArticle.location || 'Classified'}</span>
                <span className="text-green-300 font-bold">
                  {activeMarkerArticle.distanceKm ? `${activeMarkerArticle.distanceKm} km` : 'InRange'}
                </span>
              </div>

              <button
                onClick={() => onOpenDossier(activeMarkerArticle)}
                className="w-full py-2 bg-green-600 hover:bg-green-500 text-black font-black text-[10px] uppercase tracking-wider rounded transition-all flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(34,197,94,0.3)] cursor-pointer"
              >
                <Radio size={12} />
                <span>Open Dossier & Nano Banana Simulation</span>
              </button>
            </div>
          )}
        </div>

        {/* Bottom Radar Status Bar */}
        <div className="bg-black/90 p-2.5 border-t border-green-900/50 flex flex-wrap items-center justify-between text-[9px] text-green-600 font-mono gap-2 z-20">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Compass size={11} className="text-green-400" />
              YAW: {(((-rotLng * 180) / Math.PI) % 360).toFixed(1)}° // PITCH: {(((rotLat * 180) / Math.PI)).toFixed(1)}°
            </span>
            <span>ZOOM: {globeZoom.toFixed(1)}X</span>
            <span>
              MODE: <span className="text-green-400 font-bold uppercase">{projectionMode} ({gridType})</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-green-400 font-bold">UAP INTEL NEXUS // 3D GLOBE SIMULATION</span>
          </div>
        </div>
      </div>

      {/* Right Column: Proximate Sighting Intelligence Roster (320px) */}
      <div className="xl:w-80 bg-gray-950 border border-green-800/60 rounded-xl p-4 flex flex-col justify-between shadow-xl">
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-green-900/50 pb-2">
            <div className="flex items-center gap-1.5">
              <Navigation size={14} className="text-green-400" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-green-400">
                PROXIMATE GLOBE BLIPS
              </span>
            </div>
            <span className="text-[9px] bg-green-950/80 text-green-400 border border-green-800 px-1.5 py-0.5 rounded">
              TOP {Math.min(proximateArticles.length, 6)}
            </span>
          </div>

          {/* Sighting Roster List */}
          <div className="space-y-2 max-h-[500px] overflow-y-auto custom-scrollbar pr-1">
            {proximateArticles.slice(0, 8).map((art, idx) => {
              const isSelected = selectedArticle?.id === art.id;
              return (
                <div
                  key={art.id}
                  onClick={() => handleMarkerClick(art)}
                  className={`p-2.5 rounded-lg border text-left cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-green-950/60 border-green-400 text-green-200 shadow-[0_0_12px_rgba(34,197,94,0.2)]'
                      : 'bg-black/50 border-green-900/40 text-green-500 hover:bg-gray-900 hover:border-green-700'
                  }`}
                >
                  <div className="flex justify-between items-start gap-1 mb-1">
                    <span className="text-[8px] font-bold text-green-600 uppercase">
                      #{idx + 1} // {art.id}
                    </span>
                    <span className="text-[9px] font-bold text-green-400">
                      {art.distanceKm ? `${art.distanceKm} km` : 'InRange'}
                    </span>
                  </div>
                  <h4 className="text-[10px] font-bold uppercase text-gray-200 line-clamp-1 mb-1">
                    {art.title}
                  </h4>
                  <div className="text-[8px] text-green-600 truncate mb-2">
                    {art.location || 'Classified Sector'}
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenDossier(art);
                    }}
                    className="w-full py-1 bg-gray-900 hover:bg-green-600 hover:text-black text-gray-300 hover:border-green-500 border border-gray-700 rounded text-[8px] font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-1"
                  >
                    <Radio size={9} />
                    <span>Open Intel Dossier</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Hotspot Sectors Quick Jumper */}
        <div className="pt-3 border-t border-green-900/50 mt-3">
          <div className="text-[9px] text-green-600 uppercase font-bold tracking-widest mb-1.5 flex items-center gap-1">
            <Target size={11} className="text-green-400" />
            <span>Hotspot Sectors:</span>
          </div>
          <div className="grid grid-cols-2 gap-1 text-[8px]">
            {UAP_HOTSPOTS.slice(0, 4).map((h) => (
              <button
                key={h.id}
                onClick={() => handleSelectHotspotSector(h)}
                className="p-1 rounded bg-black/50 border border-green-900/40 text-green-400 hover:bg-green-900/40 truncate text-left"
                title={h.name}
              >
                {h.codeName}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UAPTacticalMap;
