import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  APIProvider, 
  Map, 
  AdvancedMarker, 
  Pin, 
  InfoWindow, 
  useMap 
} from '@vis.gl/react-google-maps';
import { Article, HotspotZone, UAPCoordinates } from '../types';
import { GMP_ATTRIBUTION_ID, UAP_HOTSPOTS, calculateHaversineDistance } from '../services/mapsService';
import { 
  Compass, 
  Crosshair, 
  Eye, 
  Film, 
  Globe, 
  Layers, 
  Locate, 
  MapPin, 
  Navigation, 
  Radio, 
  Radar, 
  Satellite, 
  ShieldAlert, 
  Sparkles, 
  Target,
  ZoomIn,
  ZoomOut
} from 'lucide-react';

interface UAPTacticalMapProps {
  apiKey: string;
  articles: Article[];
  selectedArticle: Article | null;
  onSelectArticle: (article: Article) => void;
  onLaunchFlyover: (article: Article) => void;
  onOpenDossier: (article: Article) => void;
  onOpenMapsConfig?: () => void;
}

// Map Controller for smooth fly-to animations
const MapController: React.FC<{
  targetCoords: UAPCoordinates | null;
  zoomLevel: number;
}> = ({ targetCoords, zoomLevel }) => {
  const map = useMap();

  useEffect(() => {
    if (!map || !targetCoords) return;
    map.panTo(targetCoords);
    map.setZoom(zoomLevel);
  }, [map, targetCoords, zoomLevel]);

  return null;
};

const UAPTacticalMap: React.FC<UAPTacticalMapProps> = ({
  apiKey,
  articles,
  selectedArticle,
  onSelectArticle,
  onLaunchFlyover,
  onOpenDossier,
  onOpenMapsConfig,
}) => {
  const [mapCenter, setMapCenter] = useState<UAPCoordinates>({ lat: 37.0902, lng: -95.7129 }); // Geographic center of US
  const [mapZoom, setMapZoom] = useState<number>(4);
  const [activeMarkerArticle, setActiveMarkerArticle] = useState<Article | null>(null);
  const [userLocation, setUserLocation] = useState<UAPCoordinates | null>(null);
  const [selectedHotspot, setSelectedHotspot] = useState<HotspotZone | null>(null);
  const [mapType, setMapType] = useState<'hybrid' | 'roadmap' | 'satellite'>('hybrid');
  const [locatingUser, setLocatingUser] = useState<boolean>(false);
  const [filterNearbyCount, setFilterNearbyCount] = useState<number>(5);
  const [authError, setAuthError] = useState<string | null>(null);

  // Catch Maps authentication failure or blocked API target errors
  useEffect(() => {
    const handleAuthFailure = () => {
      setAuthError('ApiTargetBlockedMapError: The Google Maps JavaScript API is blocked or not enabled for this API key in Google Cloud Console.');
    };
    (window as any).gm_authFailure = handleAuthFailure;

    const originalConsoleError = console.error;
    console.error = (...args: any[]) => {
      originalConsoleError.apply(console, args);
      const str = args.map(a => String(a)).join(' ');
      if (str.includes('ApiTargetBlockedMapError') || str.includes('ApiNotActivatedMapError') || str.includes('api-target-blocked-map-error')) {
        setAuthError('ApiTargetBlockedMapError: Maps JavaScript API is not enabled on this Google Cloud project or is restricted.');
      }
    };

    return () => {
      (window as any).gm_authFailure = null;
    };
  }, []);

  // Clear auth error if apiKey changes
  useEffect(() => {
    setAuthError(null);
  }, [apiKey]);

  // Focus on selected article if provided
  useEffect(() => {
    if (selectedArticle && selectedArticle.coordinates) {
      setMapCenter(selectedArticle.coordinates);
      setMapZoom(9);
      setActiveMarkerArticle(selectedArticle);
    }
  }, [selectedArticle]);

  // Request browser geolocation for proximity calculation
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

  // Determine current reference point for proximity calculations
  const referencePoint: UAPCoordinates = useMemo(() => {
    if (userLocation) return userLocation;
    if (selectedHotspot) return selectedHotspot.coordinates;
    if (selectedArticle && selectedArticle.coordinates) return selectedArticle.coordinates;
    return { lat: 37.0902, lng: -95.7129 }; // Default US center
  }, [userLocation, selectedHotspot, selectedArticle]);

  // Calculate distance for all articles relative to current reference point and sort
  const proximateArticles = useMemo(() => {
    const list = articles.map((art) => {
      const coords = art.coordinates || { lat: 37.0902, lng: -95.7129 };
      const dist = calculateHaversineDistance(referencePoint, coords);
      return {
        ...art,
        distanceKm: dist.km,
        distanceMiles: dist.miles,
      };
    });

    return list.sort((a, b) => (a.distanceKm || 0) - (b.distanceKm || 0));
  }, [articles, referencePoint]);

  const closestReport = proximateArticles[0] || null;

  const handleSelectHotspotSector = (hotspot: HotspotZone) => {
    setSelectedHotspot(hotspot);
    setUserLocation(null);
    setMapCenter(hotspot.coordinates);
    setMapZoom(8);
  };

  const handleMarkerClick = (art: Article) => {
    setActiveMarkerArticle(art);
    onSelectArticle(art);
    if (art.coordinates) {
      setMapCenter(art.coordinates);
    }
  };

  return (
    <div className="flex flex-col xl:flex-row gap-6 w-full h-[850px] max-h-[85vh] font-mono">
      {/* Interactive Google Map Canvas */}
      <div className="flex-1 relative rounded-xl overflow-hidden border border-green-800/60 bg-black flex flex-col shadow-[0_0_40px_rgba(0,0,0,0.8)]">
        {/* Top Tactical Map HUD Bar */}
        <div className="absolute top-3 left-3 right-3 z-10 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
          <div className="bg-black/85 backdrop-blur-md px-3.5 py-1.5 rounded-lg border border-green-800/80 pointer-events-auto flex items-center gap-2 shadow-lg">
            <Radar className="text-green-400 animate-spin" size={16} />
            <span className="text-[11px] font-black uppercase tracking-[0.25em] text-green-400">
              GLOBAL TACTICAL RADAR GRID
            </span>
            <span className="text-[9px] text-green-600 border-l border-green-900/60 pl-2">
              TARGETS: {articles.length}
            </span>
          </div>

          <div className="flex items-center gap-2 pointer-events-auto">
            {/* Map Type Switcher */}
            <div className="bg-black/85 backdrop-blur-md p-1 rounded-lg border border-green-800/80 flex items-center gap-1 shadow-lg text-[10px]">
              <button
                onClick={() => setMapType('hybrid')}
                className={`px-2 py-1 rounded uppercase font-bold transition-all ${
                  mapType === 'hybrid'
                    ? 'bg-green-600 text-black shadow-[0_0_10px_rgba(34,197,94,0.4)]'
                    : 'text-green-500 hover:text-green-300'
                }`}
              >
                Hybrid
              </button>
              <button
                onClick={() => setMapType('satellite')}
                className={`px-2 py-1 rounded uppercase font-bold transition-all ${
                  mapType === 'satellite'
                    ? 'bg-green-600 text-black shadow-[0_0_10px_rgba(34,197,94,0.4)]'
                    : 'text-green-500 hover:text-green-300'
                }`}
              >
                Satellite
              </button>
              <button
                onClick={() => setMapType('roadmap')}
                className={`px-2 py-1 rounded uppercase font-bold transition-all ${
                  mapType === 'roadmap'
                    ? 'bg-green-600 text-black shadow-[0_0_10px_rgba(34,197,94,0.4)]'
                    : 'text-green-500 hover:text-green-300'
                }`}
              >
                Vector
              </button>
            </div>

            {/* GPS Locate User */}
            <button
              onClick={handleLocateUser}
              disabled={locatingUser}
              className="bg-black/85 backdrop-blur-md hover:bg-green-900/50 p-2 rounded-lg border border-green-800/80 text-green-400 hover:text-green-200 transition-all flex items-center gap-1.5 text-[10px] uppercase font-bold shadow-lg"
              title="Lock Proximity to My GPS Coordinates"
            >
              <Locate size={14} className={locatingUser ? 'animate-spin' : ''} />
              <span className="hidden sm:inline">Lock GPS Proximity</span>
            </button>
          </div>
        </div>

        {/* Google Map Container with mandated styling and height */}
        <div className="w-full h-full relative" style={{ minHeight: '600px' }}>
          {apiKey && !authError ? (
            <APIProvider apiKey={apiKey} solutionChannel={GMP_ATTRIBUTION_ID}>
              <Map
                mapId="DEMO_MAP_ID"
                center={mapCenter}
                zoom={mapZoom}
                mapTypeId={mapType}
                gestureHandling="greedy"
                disableDefaultUI={false}
                internalUsageAttributionIds={[GMP_ATTRIBUTION_ID]}
                className="w-full h-full"
                style={{ width: '100%', height: '100%' }}
              >
                <MapController targetCoords={mapCenter} zoomLevel={mapZoom} />

                {/* Advanced Markers for each UAP report */}
                {articles.map((art, idx) => {
                  const coords = art.coordinates || { lat: 37.0902, lng: -95.7129 };
                  const isSelected = selectedArticle?.id === art.id;
                  const isClosest = closestReport?.id === art.id;

                  return (
                    <AdvancedMarker
                      key={art.id}
                      position={coords}
                      onClick={() => handleMarkerClick(art)}
                      title={art.title}
                    >
                      <div className="relative group cursor-pointer">
                        {/* Tactical Ping Effect */}
                        <div
                          className={`absolute -inset-2 rounded-full opacity-75 animate-ping ${
                            isSelected
                              ? 'bg-red-500'
                              : isClosest
                              ? 'bg-yellow-400'
                              : 'bg-green-500'
                          }`}
                        />
                        <div
                          className={`relative px-2 py-1 rounded-md border flex items-center gap-1 shadow-lg text-[10px] font-bold uppercase tracking-wider backdrop-blur-md transition-transform group-hover:scale-110 ${
                            isSelected
                              ? 'bg-red-950/90 border-red-500 text-red-300'
                              : isClosest
                              ? 'bg-yellow-950/90 border-yellow-400 text-yellow-300'
                              : 'bg-black/85 border-green-600 text-green-400'
                          }`}
                        >
                          <Radio size={10} className="animate-pulse" />
                          <span className="max-w-[120px] truncate">
                            {isClosest ? 'PROXIMATE #1' : `UAP-${idx + 1}`}
                          </span>
                        </div>
                      </div>
                    </AdvancedMarker>
                  );
                })}

                {/* User / Hotspot Reference Pin */}
                {userLocation && (
                  <AdvancedMarker position={userLocation} title="Your GPS Location">
                    <div className="p-1.5 bg-blue-600 text-white rounded-full border-2 border-white shadow-lg animate-pulse">
                      <Crosshair size={16} />
                    </div>
                  </AdvancedMarker>
                )}

                {/* InfoWindow for active clicked marker */}
                {activeMarkerArticle && activeMarkerArticle.coordinates && (
                  <InfoWindow
                    position={activeMarkerArticle.coordinates}
                    onCloseClick={() => setActiveMarkerArticle(null)}
                  >
                    <div className="p-2 max-w-xs font-mono text-gray-900">
                      <div className="flex items-center gap-1.5 mb-1">
                        <ShieldAlert size={14} className="text-red-600" />
                        <span className="text-[9px] font-bold text-red-600 uppercase tracking-widest">
                          UAP SIGHTING VECTOR
                        </span>
                      </div>
                      <h4 className="text-xs font-bold leading-tight uppercase mb-1">
                        {activeMarkerArticle.title}
                      </h4>
                      <p className="text-[10px] text-gray-700 line-clamp-2 mb-2 font-sans">
                        {activeMarkerArticle.description}
                      </p>

                      <div className="bg-gray-100 p-1.5 rounded border border-gray-300 text-[9px] space-y-0.5 mb-3">
                        <div className="flex justify-between">
                          <span className="text-gray-500">SECTOR:</span>
                          <span className="font-bold">{activeMarkerArticle.location || 'Tactical Sector'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">PROXIMITY:</span>
                          <span className="font-bold text-green-700">
                            {activeMarkerArticle.distanceKm ? `${activeMarkerArticle.distanceKm} km (${activeMarkerArticle.distanceMiles} mi)` : 'Calculating...'}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <button
                          onClick={() => onLaunchFlyover(activeMarkerArticle)}
                          className="w-full py-1.5 bg-green-700 hover:bg-green-800 text-white rounded text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 shadow transition-colors"
                        >
                          <Film size={12} />
                          Cinematic Aerial Flyover
                        </button>
                        <button
                          onClick={() => onOpenDossier(activeMarkerArticle)}
                          className="w-full py-1.5 bg-gray-800 hover:bg-black text-white rounded text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors"
                        >
                          <Radio size={12} />
                          Open Analysis Dossier
                        </button>
                      </div>
                    </div>
                  </InfoWindow>
                )}
              </Map>
            </APIProvider>
          ) : (
            /* Standby Polar Radar Grid HUD */
            <div className="w-full h-full flex flex-col items-center justify-center relative p-6 bg-[radial-gradient(ellipse_at_center,#051e0f_0%,#020b05_100%)] overflow-hidden">
              {/* Concentric Radar Range Rings */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-30">
                <div className="w-[180px] h-[180px] rounded-full border border-green-500/40"></div>
                <div className="w-[340px] h-[340px] rounded-full border border-green-500/30"></div>
                <div className="w-[500px] h-[500px] rounded-full border border-green-500/25"></div>
                <div className="w-[660px] h-[660px] rounded-full border border-green-500/20"></div>
                <div className="absolute w-full h-[1px] bg-green-500/20"></div>
                <div className="absolute h-full w-[1px] bg-green-500/20"></div>
              </div>

              {/* Sweep Line Animation */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40">
                <div className="w-[660px] h-[660px] rounded-full relative animate-spin [animation-duration:8s]">
                  <div className="absolute top-0 right-1/2 w-1/2 h-1/2 bg-gradient-to-br from-green-500/30 to-transparent [clip-path:polygon(100%_100%,100%_0%,0%_0%)]"></div>
                </div>
              </div>

              {/* Plotted Interactive Target Pins */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-[600px] h-[600px] relative pointer-events-auto">
                  {articles.slice(0, 12).map((art, idx) => {
                    const angle = (idx / Math.min(articles.length, 12)) * 2 * Math.PI - Math.PI / 2;
                    const radius = 90 + ((idx * 37) % 180);
                    const x = 300 + radius * Math.cos(angle);
                    const y = 300 + radius * Math.sin(angle);
                    const isSelected = selectedArticle?.id === art.id;
                    const isClosest = idx === 0;

                    return (
                      <div
                        key={art.id}
                        onClick={() => {
                          onSelectArticle(art);
                          setActiveMarkerArticle(art);
                        }}
                        style={{ left: `${x}px`, top: `${y}px` }}
                        className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer group z-20"
                        title={art.title}
                      >
                        <div
                          className={`w-3 h-3 rounded-full animate-ping absolute -inset-0.5 ${
                            isSelected ? 'bg-red-400' : isClosest ? 'bg-yellow-400' : 'bg-green-400'
                          }`}
                        ></div>
                        <div
                          className={`w-3.5 h-3.5 rounded-full border-2 relative flex items-center justify-center shadow-lg ${
                            isSelected
                              ? 'bg-red-500 border-red-200'
                              : isClosest
                              ? 'bg-yellow-400 border-yellow-200'
                              : 'bg-green-500 border-green-200'
                          }`}
                        ></div>
                        <div className="hidden group-hover:block absolute left-4 -top-2 bg-black/90 text-green-300 border border-green-700 p-2 rounded text-[9px] whitespace-nowrap shadow-xl z-30">
                          <div className="font-bold uppercase text-white truncate max-w-[200px]">{art.title}</div>
                          <div className="text-green-500">{art.location || 'Classified'}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Central Radar Diagnostic Notice */}
              <div className="relative z-30 max-w-md w-full bg-black/85 border border-green-700/70 p-5 rounded-xl text-center shadow-[0_0_40px_rgba(0,0,0,0.9)] backdrop-blur-md">
                {authError ? (
                  <>
                    <div className="flex justify-center mb-2">
                      <div className="p-2.5 bg-yellow-950/60 border border-yellow-500/60 text-yellow-400 rounded-full animate-pulse">
                        <ShieldAlert size={28} />
                      </div>
                    </div>
                    <h3 className="text-sm font-black text-yellow-400 uppercase tracking-wider mb-1">
                      Maps JavaScript API Target Blocked
                    </h3>
                    <p className="text-[11px] text-gray-300 mb-3 leading-relaxed font-sans">
                      The configured API key is not enabled for the <strong>Maps JavaScript API</strong> in Google Cloud Console, or an API restriction is blocking it (<code className="text-yellow-400 bg-black/60 px-1 py-0.5 rounded text-[10px]">ApiTargetBlockedMapError</code>).
                    </p>
                    <div className="p-2.5 bg-gray-900/80 border border-gray-800 rounded text-[10px] text-gray-400 text-left mb-4 space-y-1 font-sans">
                      <div>1. Open Google Cloud Console &gt; APIs &amp; Services &gt; Library</div>
                      <div>2. Search for <strong>Maps JavaScript API</strong> and click <strong>Enable</strong></div>
                      <div>3. Or enter a dedicated key with Maps JavaScript API enabled below</div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex justify-center mb-2">
                      <div className="p-2.5 bg-green-950/60 border border-green-500/60 text-green-400 rounded-full">
                        <Radar size={28} className="animate-spin" />
                      </div>
                    </div>
                    <h3 className="text-sm font-black text-green-400 uppercase tracking-wider mb-1">
                      Tactical Radar Ready (Standby Mode)
                    </h3>
                    <p className="text-[11px] text-green-300/80 mb-4 leading-relaxed font-sans">
                      Target coordinate vectors and proximity rings are active. Provide a Google Maps Platform key to unlock interactive satellite orthophotos, vector roads, and 3D street layers.
                    </p>
                  </>
                )}

                <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
                  {onOpenMapsConfig && (
                    <button
                      onClick={onOpenMapsConfig}
                      className="w-full sm:w-auto px-4 py-2 bg-green-500 hover:bg-green-400 text-black font-black text-xs uppercase tracking-wider rounded transition-all shadow-[0_0_15px_rgba(34,197,94,0.4)]"
                    >
                      {authError ? 'Update Maps Key' : 'Configure Google Maps Key'}
                    </button>
                  )}

                  {articles.length > 0 && (
                    <button
                      onClick={() => onOpenDossier(articles[0])}
                      className="w-full sm:w-auto px-4 py-2 bg-gray-900 hover:bg-gray-800 text-green-400 border border-green-800 rounded text-xs uppercase font-bold tracking-wider transition-colors"
                    >
                      Inspect First Dossier
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Map Status Bar */}
        <div className="bg-black/90 p-2.5 px-4 border-t border-green-900/60 flex flex-wrap items-center justify-between text-[9px] text-green-600">
          <div className="flex items-center gap-3">
            <span>COORDINATE DATUM: WGS84</span>
            <span className="hidden md:inline">ELEVATION: 3D PHOTOGRAMMETRY</span>
            <span>REFERENCE: {userLocation ? 'LOCAL GPS' : selectedHotspot ? selectedHotspot.codeName : 'CONUS GRID'}</span>
          </div>
          <div className="text-green-500 font-bold uppercase tracking-widest">
            GOOGLE MAPS PLATFORM // AERIAL VIEW ENGINE
          </div>
        </div>
      </div>

      {/* Proximity Intelligence & Ranking Radar Panel */}
      <div className="xl:w-96 flex flex-col space-y-4">
        {/* Proximity Filter Card */}
        <div className="bg-gray-900/70 border border-green-800/40 rounded-xl p-4 backdrop-blur-sm shadow-xl space-y-3">
          <div className="flex items-center justify-between border-b border-green-900/40 pb-2">
            <div className="flex items-center gap-2">
              <Target size={16} className="text-green-400" />
              <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-green-300">
                PROXIMITY RADAR
              </h3>
            </div>
            <span className="text-[9px] text-green-600 font-bold uppercase">
              {userLocation ? 'GPS LOCKED' : 'CONUS GRID'}
            </span>
          </div>

          <p className="text-[11px] text-green-200/60 leading-relaxed font-sans">
            Automatically calculates vector distance to all reported sightings. Select any vector to launch a cinematic 3D flyover video.
          </p>

          {/* Hotspot Sector Selector */}
          <div>
            <label className="text-[10px] text-green-500 uppercase font-bold tracking-widest block mb-1.5">
              Tactical Baseline Sector:
            </label>
            <div className="grid grid-cols-2 gap-1.5 max-h-32 overflow-y-auto custom-scrollbar pr-1">
              {UAP_HOTSPOTS.map((h) => (
                <button
                  key={h.id}
                  onClick={() => handleSelectHotspotSector(h)}
                  className={`p-1.5 text-left rounded text-[9px] border truncate transition-all ${
                    selectedHotspot?.id === h.id
                      ? 'bg-green-600 text-black border-green-400 font-bold'
                      : 'bg-black/50 text-green-400 border-green-900/50 hover:border-green-600'
                  }`}
                >
                  {h.name.split('(')[0]}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Most Proximate Sighting Reports List */}
        <div className="flex-1 bg-gray-900/70 border border-green-800/40 rounded-xl p-4 backdrop-blur-sm shadow-xl flex flex-col min-h-0">
          <div className="flex items-center justify-between border-b border-green-900/40 pb-2 mb-3">
            <div className="flex items-center gap-1.5">
              <Navigation size={14} className="text-green-400" />
              <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-green-400">
                Ranked by Proximity
              </h4>
            </div>
            <span className="text-[9px] bg-green-950 text-green-400 px-2 py-0.5 rounded border border-green-800 font-bold">
              TOP {proximateArticles.length}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2.5 pr-1">
            {proximateArticles.map((art, rank) => {
              const isSelected = selectedArticle?.id === art.id;
              return (
                <div
                  key={art.id}
                  onClick={() => handleMarkerClick(art)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-green-950/60 border-green-500 shadow-[0_0_15px_rgba(34,197,94,0.2)]'
                      : 'bg-black/40 border-green-900/30 hover:border-green-700 hover:bg-black/60'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-[9px] font-black px-1.5 py-0.2 rounded ${
                          rank === 0
                            ? 'bg-yellow-400 text-black'
                            : 'bg-gray-800 text-green-400'
                        }`}
                      >
                        #{rank + 1}
                      </span>
                      <span className="text-[9px] text-green-600 font-bold uppercase truncate max-w-[120px]">
                        {art.source}
                      </span>
                    </div>

                    <div className="text-[10px] font-black text-green-400 whitespace-nowrap bg-green-950/80 px-2 py-0.5 rounded border border-green-900">
                      {art.distanceKm} km <span className="text-green-700">({art.distanceMiles} mi)</span>
                    </div>
                  </div>

                  <h5 className="text-xs font-bold text-gray-200 line-clamp-1 mb-1 font-mono group-hover:text-green-400">
                    {art.title}
                  </h5>

                  <div className="text-[9px] text-green-700 truncate mb-2">
                    LOC: {art.location || art.proximateAddress}
                  </div>

                  <div className="flex items-center gap-1.5 pt-1 border-t border-green-900/20">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onLaunchFlyover(art);
                      }}
                      className="flex-1 py-1 bg-green-900/20 hover:bg-green-500 hover:text-black text-green-400 rounded text-[9px] font-bold uppercase tracking-wider border border-green-900 hover:border-green-400 transition-all flex items-center justify-center gap-1"
                    >
                      <Film size={10} />
                      Aerial Flyover
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenDossier(art);
                      }}
                      className="px-2.5 py-1 bg-gray-800 hover:bg-gray-700 text-green-500 rounded text-[9px] font-bold uppercase border border-green-900/40 transition-colors"
                      title="Open Analysis Dossier"
                    >
                      <Eye size={10} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UAPTacticalMap;
