import React, { useState, useEffect, useMemo, useRef } from 'react';
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
  Layers,
  MapPin,
  RotateCcw
} from 'lucide-react';

interface UAPTacticalMapProps {
  articles: Article[];
  selectedArticle: Article | null;
  onSelectArticle: (article: Article) => void;
  onOpenDossier: (article: Article) => void;
}

type RadarGridType = 'hybrid' | 'satellite' | 'vector';

const UAPTacticalMap: React.FC<UAPTacticalMapProps> = ({
  articles,
  selectedArticle,
  onSelectArticle,
  onOpenDossier,
}) => {
  const [mapCenter, setMapCenter] = useState<UAPCoordinates>({ lat: 37.0902, lng: -95.7129 });
  const [mapZoom, setMapZoom] = useState<number>(4);
  const [activeMarkerArticle, setActiveMarkerArticle] = useState<Article | null>(null);
  const [userLocation, setUserLocation] = useState<UAPCoordinates | null>(null);
  const [selectedHotspot, setSelectedHotspot] = useState<HotspotZone | null>(null);
  const [gridType, setGridType] = useState<RadarGridType>('hybrid');
  const [locatingUser, setLocatingUser] = useState<boolean>(false);
  
  // Tactical Radar Drag/Pan State
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const radarContainerRef = useRef<HTMLDivElement | null>(null);

  // Focus on selected article when updated
  useEffect(() => {
    if (selectedArticle && selectedArticle.coordinates) {
      setMapCenter(selectedArticle.coordinates);
      setMapZoom(7);
      setActiveMarkerArticle(selectedArticle);
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
        setMapCenter(coords);
        setMapZoom(7);
        setSelectedHotspot(null);
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
    setMapCenter({ lat: 37.0902, lng: -95.7129 });
    setMapZoom(4);
    setSelectedHotspot(null);
  };

  // Determine current reference point for distance calculations
  const referencePoint: UAPCoordinates = useMemo(() => {
    if (userLocation) return userLocation;
    if (selectedHotspot) return selectedHotspot.coordinates;
    if (selectedArticle && selectedArticle.coordinates) return selectedArticle.coordinates;
    return mapCenter;
  }, [userLocation, selectedHotspot, selectedArticle, mapCenter]);

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
      setMapCenter(art.coordinates);
    }
  };

  const handleSelectHotspotSector = (hotspot: HotspotZone) => {
    setSelectedHotspot(hotspot);
    setUserLocation(null);
    setMapCenter(hotspot.coordinates);
    setMapZoom(7);
  };

  // Tactical Radar Pan Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !dragStart) return;
    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;
    
    // Scale movement to coordinate delta based on zoom
    const factor = 360 / (Math.pow(2, mapZoom) * 400);
    setMapCenter((prev) => ({
      lat: Math.max(-85, Math.min(85, prev.lat + dy * factor)),
      lng: prev.lng - dx * factor,
    }));
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDragStart(null);
  };

  // Project lat/lng coordinates to percentage on zoomed tactical radar surface
  const getProjectedPosition = (coords?: UAPCoordinates) => {
    if (!coords) return { left: '50%', top: '50%', visible: false };
    const lngSpan = 360 / Math.pow(2, mapZoom - 1);
    const latSpan = 180 / Math.pow(2, mapZoom - 1);

    const xPercent = 50 + ((coords.lng - mapCenter.lng) / lngSpan) * 100;
    const yPercent = 50 - ((coords.lat - mapCenter.lat) / latSpan) * 100;

    const visible = xPercent >= -15 && xPercent <= 115 && yPercent >= -15 && yPercent <= 115;
    return { left: `${xPercent}%`, top: `${yPercent}%`, visible };
  };

  // Standby / Tactical Radar backdrop texture based on active gridType
  const getRadarBackdropStyle = (): React.CSSProperties => {
    if (gridType === 'satellite') {
      return {
        backgroundImage: 'radial-gradient(circle at center, rgba(3, 15, 8, 0.2) 0%, rgba(2, 6, 4, 0.9) 100%), url(https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1600&q=80)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      };
    }
    if (gridType === 'hybrid') {
      return {
        backgroundImage: 'radial-gradient(circle at center, rgba(6, 78, 59, 0.3) 0%, rgba(2, 6, 4, 0.94) 100%), url(https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1600&q=80)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      };
    }
    // Vector Mode: Deep pitch black with tactical neon phosphor matrix
    return {
      background: 'radial-gradient(ellipse at center, #062414 0%, #010804 100%)',
    };
  };

  return (
    <div className="flex flex-col xl:flex-row gap-6 w-full h-[850px] max-h-[88vh] font-mono select-none">
      
      {/* Primary Radar Operations Deck */}
      <div className="flex-1 relative rounded-xl overflow-hidden border border-green-800/60 bg-black flex flex-col shadow-[0_0_40px_rgba(0,0,0,0.8)]">
        
        {/* Top Tactical Radar HUD Bar */}
        <div className="absolute top-3 left-3 right-3 z-30 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
          
          {/* Status Badge */}
          <div className="bg-black/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-green-800/80 pointer-events-auto flex items-center gap-2 shadow-xl">
            <Radar className="text-green-400 animate-spin" size={15} />
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-green-400">
              TACTICAL RADAR & LOCATION GRID
            </span>
            <span className="text-[9px] text-green-600 border-l border-green-900/60 pl-2">
              TARGETS: {articles.length}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 pointer-events-auto">
            {/* Grid Type Switcher */}
            <div className="bg-black/90 backdrop-blur-md p-1 rounded-lg border border-green-800/80 flex items-center gap-1 shadow-lg text-[9px]">
              <button
                onClick={() => setGridType('hybrid')}
                className={`px-2.5 py-1 rounded font-bold uppercase transition-all ${
                  gridType === 'hybrid'
                    ? 'bg-green-600 text-black shadow-[0_0_10px_rgba(34,197,94,0.5)]'
                    : 'text-green-500 hover:text-green-200'
                }`}
                title="Satellite Composite with Tactical Coordinates Grid"
              >
                Hybrid Grid
              </button>
              <button
                onClick={() => setGridType('satellite')}
                className={`px-2.5 py-1 rounded font-bold uppercase transition-all ${
                  gridType === 'satellite'
                    ? 'bg-green-600 text-black shadow-[0_0_10px_rgba(34,197,94,0.5)]'
                    : 'text-green-500 hover:text-green-200'
                }`}
                title="High-Resolution Orbital Satellite Earth Layer"
              >
                Satellite
              </button>
              <button
                onClick={() => setGridType('vector')}
                className={`px-2.5 py-1 rounded font-bold uppercase transition-all ${
                  gridType === 'vector'
                    ? 'bg-green-600 text-black shadow-[0_0_10px_rgba(34,197,94,0.5)]'
                    : 'text-green-500 hover:text-green-200'
                }`}
                title="Deep Phosphor Military Vector Matrix"
              >
                Vector Grid
              </button>
            </div>

            {/* Zoom Controls */}
            <div className="bg-black/90 backdrop-blur-md p-1 rounded-lg border border-green-800/80 flex items-center gap-1 shadow-lg text-green-400">
              <button
                onClick={() => setMapZoom((z) => Math.min(z + 1, 14))}
                className="p-1 hover:bg-green-900/50 rounded"
                title="Zoom In Radar"
              >
                <ZoomIn size={14} />
              </button>
              <span className="text-[9px] font-bold px-1 text-green-300">
                {mapZoom}X
              </span>
              <button
                onClick={() => setMapZoom((z) => Math.max(z - 1, 2))}
                className="p-1 hover:bg-green-900/50 rounded"
                title="Zoom Out Radar"
              >
                <ZoomOut size={14} />
              </button>
            </div>

            {/* Reset View */}
            <button
              onClick={handleResetCenter}
              className="bg-black/90 backdrop-blur-md hover:bg-green-900/50 p-1.5 rounded-lg border border-green-800/80 text-green-400 hover:text-green-200 transition-all shadow-lg"
              title="Reset Radar Center to North America"
            >
              <RotateCcw size={13} />
            </button>

            {/* GPS Proximity Lock */}
            <button
              onClick={handleLocateUser}
              disabled={locatingUser}
              className="bg-black/90 backdrop-blur-md hover:bg-green-900/50 px-2.5 py-1.5 rounded-lg border border-green-800/80 text-green-400 hover:text-green-200 transition-all flex items-center gap-1.5 text-[9px] uppercase font-bold shadow-lg"
              title="Lock Proximity to My GPS Coordinates"
            >
              <Locate size={13} className={locatingUser ? 'animate-spin' : ''} />
              <span className="hidden sm:inline">GPS Lock</span>
            </button>
          </div>
        </div>

        {/* Radar Viewport Area */}
        <div className="flex-1 w-full h-full relative overflow-hidden flex flex-col">
          <div
            ref={radarContainerRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            className={`w-full h-full relative overflow-hidden flex flex-col items-center justify-center transition-all duration-300 ${
              isDragging ? 'cursor-grabbing' : 'cursor-grab'
            }`}
            style={getRadarBackdropStyle()}
          >
            {/* Concentric Range Rings scaled with current Zoom Level */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-30">
              <div className="w-[180px] h-[180px] rounded-full border border-green-500/40 flex items-start justify-center pt-1 text-[8px] text-green-400">
                <span>{Math.round(250 / (mapZoom / 4))} KM</span>
              </div>
              <div className="w-[340px] h-[340px] rounded-full border border-green-500/30 flex items-start justify-center pt-1 text-[8px] text-green-400/80">
                <span>{Math.round(500 / (mapZoom / 4))} KM</span>
              </div>
              <div className="w-[500px] h-[500px] rounded-full border border-green-500/25 flex items-start justify-center pt-1 text-[8px] text-green-400/60">
                <span>{Math.round(1000 / (mapZoom / 4))} KM</span>
              </div>
              <div className="w-[660px] h-[660px] rounded-full border border-green-500/20 flex items-start justify-center pt-1 text-[8px] text-green-400/40">
                <span>{Math.round(1800 / (mapZoom / 4))} KM</span>
              </div>
              <div className="absolute w-full h-[1px] bg-green-500/20"></div>
              <div className="absolute h-full w-[1px] bg-green-500/20"></div>
            </div>

            {/* Tactical Coordinate Grid Overlay */}
            <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(#22c55e_1px,transparent_1px)] [background-size:24px_24px]"></div>

            {/* Azimuth Degree Marks Outer Perimeter */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-40">
              <div className="w-[720px] h-[720px] rounded-full border border-dashed border-green-600/40 relative">
                <span className="absolute top-1 left-1/2 -translate-x-1/2 text-[8px] text-green-400 font-bold">000° N</span>
                <span className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[8px] text-green-400 font-bold">180° S</span>
                <span className="absolute left-1 top-1/2 -translate-y-1/2 text-[8px] text-green-400 font-bold">270° W</span>
                <span className="absolute right-1 top-1/2 -translate-y-1/2 text-[8px] text-green-400 font-bold">090° E</span>
              </div>
            </div>

            {/* Rotating Radar Sweep Beam */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-35">
              <div className="w-[700px] h-[700px] rounded-full relative animate-spin [animation-duration:8s]">
                <div className="absolute top-0 right-1/2 w-1/2 h-1/2 bg-gradient-to-br from-green-500/35 to-transparent [clip-path:polygon(100%_100%,100%_0%,0%_0%)]"></div>
              </div>
            </div>

            {/* Latitude / Longitude Center Crosshairs Reticle */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none text-[8px] text-green-500/70 font-mono">
              <div className="border border-green-500/40 w-10 h-10 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-green-400 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.8)]"></div>
              </div>
              <div className="absolute top-12 left-1/2 -translate-x-1/2 whitespace-nowrap bg-black/80 px-1.5 py-0.5 rounded border border-green-900/60 text-green-400 text-[8px]">
                {mapCenter.lat.toFixed(2)}°N, {Math.abs(mapCenter.lng).toFixed(2)}°W
              </div>
            </div>

            {/* GPS User Pin */}
            {userLocation && (
              <div
                style={{
                  left: getProjectedPosition(userLocation).left,
                  top: getProjectedPosition(userLocation).top,
                }}
                className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none z-30"
              >
                <div className="p-1.5 bg-blue-600 text-white rounded-full border-2 border-white shadow-xl animate-pulse flex items-center justify-center">
                  <Crosshair size={14} />
                </div>
                <div className="absolute left-6 -top-1 bg-black/90 text-blue-300 border border-blue-500 px-1.5 py-0.5 rounded text-[8px] whitespace-nowrap font-bold">
                  YOUR GPS SENSOR
                </div>
              </div>
            )}

            {/* Plotted Incident Blips on Radar Surface */}
            <div className="absolute inset-0 pointer-events-none">
              {articles.map((art, idx) => {
                const proj = getProjectedPosition(art.coordinates);
                if (!proj.visible) return null;

                const isSelected = selectedArticle?.id === art.id;
                const isClosest = closestReport?.id === art.id;

                return (
                  <div
                    key={art.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMarkerClick(art);
                    }}
                    style={{ left: proj.left, top: proj.top }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-auto cursor-pointer group z-20"
                    title={art.title}
                  >
                    {/* Pulsing ring */}
                    <div
                      className={`w-4 h-4 rounded-full animate-ping absolute -inset-0.5 opacity-75 ${
                        isSelected ? 'bg-red-400' : isClosest ? 'bg-yellow-400' : 'bg-green-400'
                      }`}
                    ></div>

                    {/* Core blip marker */}
                    <div
                      className={`w-5 h-5 rounded-full border-2 relative flex items-center justify-center shadow-lg transition-transform group-hover:scale-125 ${
                        isSelected
                          ? 'bg-red-500 border-red-200 shadow-[0_0_12px_rgba(239,68,68,0.8)]'
                          : isClosest
                          ? 'bg-yellow-400 border-yellow-100 shadow-[0_0_10px_rgba(234,179,8,0.8)]'
                          : 'bg-green-500 border-green-200 shadow-[0_0_8px_rgba(34,197,94,0.6)]'
                      }`}
                    >
                      <Radio size={9} className="text-black" />
                    </div>

                    {/* Hover Info Tooltip */}
                    <div className="hidden group-hover:block absolute left-6 -top-4 bg-black/95 text-green-300 border border-green-600 p-2.5 rounded-lg text-[9px] whitespace-nowrap shadow-2xl z-30 min-w-[220px]">
                      <div className="font-bold uppercase text-white truncate max-w-[210px] mb-0.5">
                        {art.title}
                      </div>
                      <div className="text-green-400 font-mono mb-1.5">{art.location || 'Classified Coordinates'}</div>
                      <div className="flex items-center gap-1 text-[8px] text-green-600 mb-2">
                        <span>PROXIMITY: {art.distanceKm ? `${art.distanceKm} km` : 'Active Range'}</span>
                      </div>
                      <div className="pt-1 border-t border-green-900/60">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenDossier(art);
                          }}
                          className="w-full py-1 bg-green-600 text-black hover:bg-green-500 rounded text-[8px] font-bold uppercase transition-colors"
                        >
                          Open Dossier
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Active Marker Floating Tactical Dossier Card on Radar */}
            {activeMarkerArticle && (
              <div className="absolute bottom-4 left-4 z-30 max-w-sm w-full bg-black/90 border border-green-700/80 p-3.5 rounded-xl shadow-2xl backdrop-blur-md pointer-events-auto">
                <div className="flex justify-between items-start mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <ShieldAlert size={14} className="text-red-500 animate-pulse" />
                    <span className="text-[9px] font-bold text-red-400 uppercase tracking-widest">
                      LOCKED RADAR TARGET
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
                  className="w-full py-2 bg-green-600 hover:bg-green-500 text-black font-black text-[10px] uppercase tracking-wider rounded transition-all flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(34,197,94,0.3)]"
                >
                  <Radio size={12} />
                  <span>Analyze Intel Dossier</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Radar Status Bar */}
        <div className="bg-black/90 p-2.5 border-t border-green-900/50 flex flex-wrap items-center justify-between text-[9px] text-green-600 font-mono gap-2 z-20">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Compass size={11} className="text-green-400" />
              CENTER: {mapCenter.lat.toFixed(3)}°N, {mapCenter.lng.toFixed(3)}°W
            </span>
            <span>ZOOM: {mapZoom}X</span>
            <span>
              GRID: <span className="text-green-400 font-bold uppercase">{gridType}</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-green-400 font-bold">UAP INTEL NEXUS // TACTICAL RADAR</span>
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
                PROXIMATE RADAR BLIPS
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
