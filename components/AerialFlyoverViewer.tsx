import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AerialVideoData, Article, HotspotZone, UAPCoordinates } from '../types';
import { lookupAerialVideo, lookupAerialVideoById, renderAerialVideo, findClosestHotspot, UAP_HOTSPOTS } from '../services/mapsService';
import LoadingSpinner from './LoadingSpinner';
import { 
  Film, 
  Video, 
  Play, 
  Pause, 
  RefreshCw, 
  Satellite, 
  ShieldAlert, 
  Clock, 
  AlertTriangle, 
  Compass, 
  MapPin, 
  X, 
  ChevronRight, 
  Maximize2,
  CheckCircle2,
  Search,
  Radio,
  ExternalLink
} from 'lucide-react';

interface AerialFlyoverViewerProps {
  isOpen: boolean;
  onClose: () => void;
  targetAddress?: string;
  targetCoordinates?: UAPCoordinates;
  article?: Article | null;
  apiKey: string;
  onOpenDossier?: (article: Article) => void;
}

const AerialFlyoverViewer: React.FC<AerialFlyoverViewerProps> = ({
  isOpen,
  onClose,
  targetAddress,
  targetCoordinates,
  article,
  apiKey,
  onOpenDossier,
}) => {
  const [currentAddress, setCurrentAddress] = useState<string>(
    targetAddress || article?.proximateAddress || '600 Montgomery St, San Francisco, CA 94111, USA'
  );
  const [customAddressInput, setCustomAddressInput] = useState<string>('');
  const [videoData, setVideoData] = useState<AerialVideoData>({ state: 'IDLE' });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isPolling, setIsPolling] = useState<boolean>(false);
  const [pollAttempt, setPollAttempt] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [orientation, setOrientation] = useState<'landscape' | 'portrait'>('landscape');
  const [simulationActive, setSimulationActive] = useState<boolean>(false);
  const [simAngle, setSimAngle] = useState<number>(0);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const pollTimerRef = useRef<any>(null);
  const simIntervalRef = useRef<any>(null);

  // Sync address when props change
  useEffect(() => {
    if (isOpen) {
      const initial = targetAddress || article?.proximateAddress || '600 Montgomery St, San Francisco, CA 94111, USA';
      setCurrentAddress(initial);
      setCustomAddressInput(initial);
      executeVideoLookup(initial);
    } else {
      clearPolling();
      stopSimulation();
    }
  }, [isOpen, targetAddress, article]);

  const clearPolling = () => {
    if (pollTimerRef.current) {
      clearTimeout(pollTimerRef.current);
      pollTimerRef.current = null;
    }
    setIsPolling(false);
  };

  const stopSimulation = () => {
    if (simIntervalRef.current) {
      clearInterval(simIntervalRef.current);
      simIntervalRef.current = null;
    }
    setSimulationActive(false);
  };

  const startSimulation = () => {
    stopSimulation();
    setSimulationActive(true);
    simIntervalRef.current = setInterval(() => {
      setSimAngle((prev) => (prev + 1.5) % 360);
    }, 50);
  };

  // Video lookup execution with Aerial View API
  const executeVideoLookup = async (addressToQuery: string) => {
    clearPolling();
    stopSimulation();
    setIsLoading(true);
    setVideoData({ state: 'IDLE', address: addressToQuery });

    try {
      const res = await lookupAerialVideo({ address: addressToQuery }, apiKey);
      setVideoData(res);

      if (res.state === 'PROCESSING' && res.videoId) {
        startExponentialPolling(res.videoId);
      } else if (res.state === 'NOT_FOUND' || res.state === 'ERROR') {
        // Automatically spin up simulation mode as live fallback while giving option to render
        startSimulation();
      }
    } catch (err: any) {
      setVideoData({
        state: 'ERROR',
        errorMessage: err.message || 'Aerial reconnaissance link failed.',
        address: addressToQuery,
      });
      startSimulation();
    } finally {
      setIsLoading(false);
    }
  };

  // Exponential backoff polling as mandated by Google Maps Aerial View guidelines
  const startExponentialPolling = (videoId: string) => {
    setIsPolling(true);
    setPollAttempt(1);

    const poll = async (attempt: number) => {
      const delay = Math.min(1000 * Math.pow(1.8, attempt), 30000); // Exponential backoff up to 30s
      pollTimerRef.current = setTimeout(async () => {
        try {
          const res = await lookupAerialVideo({ videoId }, apiKey);
          setVideoData(res);
          if (res.state === 'ACTIVE') {
            setIsPolling(false);
            stopSimulation();
          } else if (res.state === 'PROCESSING' && attempt < 12) {
            setPollAttempt(attempt + 1);
            poll(attempt + 1);
          } else {
            setIsPolling(false);
          }
        } catch {
          setIsPolling(false);
        }
      }, delay);
    };

    poll(1);
  };

  const handleTriggerRender = async () => {
    setIsLoading(true);
    try {
      const renderRes = await renderAerialVideo(currentAddress, apiKey);
      if (renderRes.state === 'PROCESSING' && renderRes.videoId) {
        setVideoData({
          state: 'PROCESSING',
          videoId: renderRes.videoId,
          address: currentAddress,
        });
        startExponentialPolling(renderRes.videoId);
      } else if (renderRes.state === 'ACTIVE') {
        executeVideoLookup(currentAddress);
      } else {
        setVideoData((prev) => ({
          ...prev,
          state: 'ERROR',
          errorMessage: renderRes.errorMessage || 'Rendering request could not be queued.',
        }));
      }
    } catch (err: any) {
      setVideoData((prev) => ({
        ...prev,
        state: 'ERROR',
        errorMessage: err.message || 'Error communicating with Aerial View Render endpoint.',
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectHotspot = (hotspot: HotspotZone) => {
    setCurrentAddress(hotspot.address);
    setCustomAddressInput(hotspot.address);
    executeVideoLookup(hotspot.address);
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  if (!isOpen) return null;

  const currentUri =
    orientation === 'landscape'
      ? videoData.landscapeUri || videoData.portraitUri
      : videoData.portraitUri || videoData.landscapeUri;

  const closestHotspot = targetCoordinates ? findClosestHotspot(targetCoordinates) : null;

  return (
    <div
      className="fixed inset-0 bg-black/95 flex justify-center items-center z-50 p-3 sm:p-6 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        className="bg-gray-950 border border-green-700/60 rounded-xl shadow-[0_0_60px_rgba(34,197,94,0.25)] w-full max-w-6xl max-h-[95vh] overflow-hidden flex flex-col font-mono"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Recon Header */}
        <div className="bg-gray-900/90 p-4 sm:p-5 border-b border-green-800/40 flex flex-wrap justify-between items-center gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-950/80 border border-green-700 rounded-lg text-green-400">
              <Satellite className="animate-pulse" size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-green-400 bg-green-950/60 border border-green-800/60 px-2 py-0.5 rounded">
                  AERIAL VIEW ORBITAL RECON
                </span>
                <span className="text-[9px] text-green-600 font-bold uppercase tracking-widest hidden sm:inline">
                  RESOLUTION: 4K HIGH // 3D PHOTOREALISTIC
                </span>
              </div>
              <h2 className="text-base sm:text-xl font-bold text-gray-100 uppercase tracking-tight line-clamp-1">
                {article?.title || 'Proximate UAP Sighting Vector'}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {article && onOpenDossier && (
              <button
                onClick={() => {
                  onClose();
                  onOpenDossier(article);
                }}
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-green-900/30 text-green-400 border border-green-700 rounded text-[10px] font-bold uppercase tracking-wider hover:bg-green-500 hover:text-black transition-all"
              >
                <Radio size={12} />
                Open Intel Dossier
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-green-700 hover:text-red-400 border border-green-900/40 hover:border-red-800 rounded transition-colors"
              title="Close Aerial Recon"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Tactical Address & Sector Bar */}
        <div className="bg-black/50 p-3 sm:p-4 border-b border-green-900/40 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (customAddressInput.trim()) {
                setCurrentAddress(customAddressInput.trim());
                executeVideoLookup(customAddressInput.trim());
              }
            }}
            className="flex-1 flex items-center gap-2"
          >
            <div className="relative flex-1">
              <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-green-500" />
              <input
                type="text"
                value={customAddressInput}
                onChange={(e) => setCustomAddressInput(e.target.value)}
                placeholder="Enter US postal address or landmark (e.g. Bell Rock, Sedona, AZ)..."
                className="w-full bg-gray-900/80 border border-green-800/60 rounded px-9 py-1.5 text-xs text-green-300 placeholder-green-800 focus:outline-none focus:border-green-400 font-mono"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-1.5 bg-green-900/40 border border-green-600 hover:bg-green-500 hover:text-black text-green-400 rounded text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              <Search size={12} />
              Recon
            </button>
          </form>

          {/* Quick Proximate Hotspots */}
          <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-1 md:pb-0">
            <span className="text-[10px] text-green-700 uppercase font-bold tracking-widest whitespace-nowrap">
              Proximate Sectors:
            </span>
            {UAP_HOTSPOTS.slice(0, 4).map((h) => (
              <button
                key={h.id}
                onClick={() => handleSelectHotspot(h)}
                className={`px-2.5 py-1 rounded text-[9px] uppercase font-bold whitespace-nowrap border transition-all ${
                  currentAddress === h.address
                    ? 'bg-green-600 text-black border-green-400'
                    : 'bg-gray-900/60 text-green-400 border-green-900/50 hover:border-green-600'
                }`}
              >
                {h.codeName}
              </button>
            ))}
          </div>
        </div>

        {/* Main Flyover Viewing Deck */}
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-black/40 flex flex-col lg:flex-row">
          {/* Video Player / Simulation Canvas */}
          <div className="lg:w-2/3 p-4 sm:p-6 flex flex-col items-center justify-center border-b lg:border-b-0 lg:border-r border-green-900/30">
            <div className="relative w-full aspect-video bg-black rounded-lg border border-green-800/50 overflow-hidden shadow-2xl flex items-center justify-center group">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center p-8 gap-3 text-center">
                  <LoadingSpinner />
                  <span className="text-xs text-green-400 uppercase tracking-[0.3em] animate-pulse">
                    CALIBRATING SATELLITE ORBITAL FEED...
                  </span>
                  <p className="text-[10px] text-green-700 max-w-sm">
                    Querying Google Maps Aerial View API for pre-rendered 3D flyover video...
                  </p>
                </div>
              ) : videoData.state === 'ACTIVE' && currentUri ? (
                <>
                  <video
                    ref={videoRef}
                    src={currentUri}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                  />

                  {/* HUD Overlay */}
                  <div className="absolute inset-0 pointer-events-none border border-green-500/20 m-3 flex flex-col justify-between p-3">
                    <div className="flex justify-between items-start text-[9px] text-green-400/80 uppercase">
                      <div className="bg-black/70 px-2 py-1 rounded border border-green-800/40 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
                        <span>LIVE FLYOVER TELEMETRY // 3D MESH</span>
                      </div>
                      <div className="bg-black/70 px-2 py-1 rounded border border-green-800/40 text-right">
                        <div>CAM: 3D PHOTOREALISTIC</div>
                        <div>TIME: {videoData.duration || '40s'}</div>
                      </div>
                    </div>

                    <div className="flex justify-between items-end text-[9px] text-green-400/80 uppercase">
                      <div className="bg-black/70 px-2 py-1 rounded border border-green-800/40">
                        LAT/LNG: {targetCoordinates ? `${targetCoordinates.lat.toFixed(4)}, ${targetCoordinates.lng.toFixed(4)}` : 'SIGHTING VECTOR'}
                      </div>
                      <div className="bg-black/70 px-2 py-1 rounded border border-green-800/40">
                        VIDEO_ID: {videoData.videoId || 'VERIFIED_STREAM'}
                      </div>
                    </div>
                  </div>

                  {/* Video Play Controls */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/80 px-4 py-2 rounded-full border border-green-800/60 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={togglePlay}
                      className="p-1.5 bg-green-500 text-black rounded-full hover:bg-green-400 transition-colors"
                      title={isPlaying ? 'Pause' : 'Play'}
                    >
                      {isPlaying ? <Pause size={14} /> : <Play size={14} />}
                    </button>
                    <button
                      onClick={() => setOrientation(orientation === 'landscape' ? 'portrait' : 'landscape')}
                      className="px-2.5 py-1 bg-gray-900 text-green-400 border border-green-700 rounded text-[9px] uppercase font-bold hover:bg-green-900"
                    >
                      {orientation.toUpperCase()}
                    </button>
                  </div>
                </>
              ) : videoData.state === 'PROCESSING' ? (
                <div className="flex flex-col items-center justify-center p-8 text-center gap-4">
                  <div className="relative">
                    <Clock className="text-yellow-400 animate-spin" size={40} />
                    <Satellite className="absolute inset-0 m-auto text-green-400 opacity-60" size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-yellow-400 uppercase tracking-widest mb-1">
                      AERIAL FLYOVER RENDERING IN PROGRESS
                    </h3>
                    <p className="text-xs text-gray-300 max-w-md mb-2">
                      Google Aerial View rendering cluster is generating photorealistic 3D flyover video for this location.
                    </p>
                    <div className="inline-flex items-center gap-2 bg-black/80 px-3 py-1.5 rounded border border-yellow-800 text-[10px] text-yellow-300">
                      <span>VIDEO ID: {videoData.videoId}</span>
                      {isPolling && <span className="text-green-400 animate-pulse">(Polling cycle #{pollAttempt})</span>}
                    </div>
                  </div>
                </div>
              ) : (
                /* Fallback Cinematic Orbital 3D Camera Simulation */
                <div className="relative w-full h-full bg-gradient-to-b from-gray-950 via-slate-900 to-black flex flex-col items-center justify-center p-6 text-center overflow-hidden">
                  {/* Rotating radar grid canvas */}
                  <div
                    className="absolute w-[450px] h-[450px] rounded-full border border-green-500/10 pointer-events-none"
                    style={{
                      transform: `rotate(${simAngle}deg)`,
                      backgroundImage:
                        'radial-gradient(circle at center, transparent 30%, rgba(34,197,94,0.05) 70%), repeating-radial-gradient(circle at center, rgba(34,197,94,0.08) 0, rgba(34,197,94,0.08) 1px, transparent 1px, transparent 30px)',
                    }}
                  />

                  {/* Sweep Line */}
                  <div
                    className="absolute inset-0 flex items-center justify-center pointer-events-none"
                    style={{ transform: `rotate(${simAngle}deg)` }}
                  >
                    <div className="w-1/2 h-[2px] bg-gradient-to-r from-transparent to-green-400/60 origin-right translate-x-[-50%]"></div>
                  </div>

                  <div className="relative z-10 max-w-md space-y-3">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-yellow-950/60 border border-yellow-800/60 text-yellow-400 rounded text-[10px] font-bold uppercase tracking-wider">
                      <AlertTriangle size={12} />
                      {videoData.state === 'NOT_FOUND' ? 'Video Not Pre-Rendered At Exact Address' : 'Aerial Imagery Link Ready'}
                    </div>

                    <h4 className="text-sm font-bold text-gray-100 uppercase tracking-wide">
                      Tactical 3D Orbital Flyover Ready
                    </h4>
                    <p className="text-[11px] text-green-100/60 leading-relaxed font-sans">
                      Target location: <span className="text-green-400 font-mono">{currentAddress}</span>
                    </p>

                    <div className="flex flex-wrap gap-2 justify-center pt-2">
                      <button
                        onClick={handleTriggerRender}
                        disabled={isLoading}
                        className="px-4 py-2 bg-green-600 hover:bg-green-500 text-black font-black rounded text-[10px] uppercase tracking-widest transition-all shadow-[0_0_15px_rgba(34,197,94,0.3)] disabled:opacity-50"
                      >
                        Queue Aerial View 3D Render
                      </button>

                      {closestHotspot && (
                        <button
                          onClick={() => handleSelectHotspot(closestHotspot.hotspot)}
                          className="px-3 py-2 bg-gray-900 border border-green-700 hover:border-green-400 text-green-400 rounded text-[10px] uppercase font-bold tracking-wider transition-all"
                        >
                          Fly to Nearest Hotspot ({closestHotspot.distanceKm} km)
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* MANDATORY LEGAL ATTRIBUTION (Strictly required by Google Maps Aerial View Skill) */}
            <div className="w-full mt-3 text-center">
              <div className="text-[10px] uppercase tracking-[0.4em] font-bold text-green-600/90 font-mono">
                Google Maps
              </div>
            </div>
          </div>

          {/* Telemetry & Proximate Sector Intelligence Sidebar */}
          <div className="lg:w-1/3 p-4 sm:p-6 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="border-b border-green-900/40 pb-3">
                <div className="text-[10px] text-green-600 uppercase font-bold tracking-[0.3em] flex items-center gap-1.5 mb-1">
                  <Compass size={14} className="text-green-500" />
                  Telemetry Flight Log
                </div>
                <div className="text-xs text-gray-200 font-bold line-clamp-1">{currentAddress}</div>
              </div>

              {/* Specs Grid */}
              <div className="grid grid-cols-2 gap-2 text-[10px]">
                <div className="bg-black/60 p-2.5 rounded border border-green-900/50">
                  <div className="text-green-700 uppercase">Status</div>
                  <div className="text-green-400 font-bold">{videoData.state}</div>
                </div>
                <div className="bg-black/60 p-2.5 rounded border border-green-900/50">
                  <div className="text-green-700 uppercase">Sensors</div>
                  <div className="text-green-400 font-bold">3D Photogrammetry</div>
                </div>
                <div className="bg-black/60 p-2.5 rounded border border-green-900/50">
                  <div className="text-green-700 uppercase">Duration</div>
                  <div className="text-green-400 font-bold">{videoData.duration || '30-40s Orbital'}</div>
                </div>
                <div className="bg-black/60 p-2.5 rounded border border-green-900/50">
                  <div className="text-green-700 uppercase">Flyover Angle</div>
                  <div className="text-green-400 font-bold">360° Heli-Orbit</div>
                </div>
              </div>

              {/* Proximate Sighting Details if available */}
              {article && (
                <div className="bg-green-950/20 p-3 rounded-lg border border-green-900/40 space-y-2">
                  <div className="text-[10px] text-green-500 uppercase font-bold tracking-wider flex items-center justify-between">
                    <span>Target Intelligence</span>
                    <span className="text-[9px] text-green-700">{article.source}</span>
                  </div>
                  <p className="text-[11px] text-green-200/70 font-sans line-clamp-3 leading-relaxed">
                    {article.description}
                  </p>
                  {article.location && (
                    <div className="text-[10px] text-green-400">
                      <span className="text-green-700">REGION: </span>
                      {article.location}
                    </div>
                  )}
                </div>
              )}

              {/* Known Curated Flyover Sectors */}
              <div>
                <div className="text-[10px] text-green-700 uppercase font-bold tracking-widest mb-2">
                  Known Pre-Rendered Corridors:
                </div>
                <div className="space-y-1.5 max-h-40 overflow-y-auto custom-scrollbar pr-1">
                  {UAP_HOTSPOTS.map((h) => (
                    <button
                      key={h.id}
                      onClick={() => handleSelectHotspot(h)}
                      className={`w-full text-left p-2 rounded text-[10px] border flex items-center justify-between transition-colors ${
                        currentAddress === h.address
                          ? 'bg-green-900/40 border-green-500 text-green-300'
                          : 'bg-black/40 border-green-900/30 text-green-500/80 hover:bg-gray-900 hover:text-green-300'
                      }`}
                    >
                      <div className="truncate pr-2">
                        <div className="font-bold">{h.name}</div>
                        <div className="text-[8px] text-green-700 truncate">{h.address}</div>
                      </div>
                      <ChevronRight size={12} className="flex-shrink-0 text-green-600" />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-2 border-t border-green-900/40 flex items-center justify-between">
              <button
                onClick={() => executeVideoLookup(currentAddress)}
                disabled={isLoading}
                className="flex items-center gap-1.5 text-[10px] text-green-400 hover:text-green-200 transition-colors uppercase font-bold"
              >
                <RefreshCw size={12} className={isLoading ? 'animate-spin' : ''} />
                Refresh Recon Scan
              </button>

              <button
                onClick={onClose}
                className="px-4 py-1.5 bg-gray-900 hover:bg-red-950 border border-green-800 hover:border-red-700 text-gray-300 hover:text-red-300 rounded text-[10px] uppercase font-bold transition-all"
              >
                Disengage HUD
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AerialFlyoverViewer;
