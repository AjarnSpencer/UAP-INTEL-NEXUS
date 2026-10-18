import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { fetchGlobalUAPReports, DECLASSIFIED_HISTORICAL_ARCHIVES, UAPDiscoveryResult } from './services/newsService';
import { Article, VoiceID, SourceRegion, ReportType } from './types';
import ArticleCard from './components/ArticleCard';
import AnalysisModal from './components/AnalysisModal';
import ApiKeyModal from './components/ApiKeyModal';
import LoadingSpinner from './components/LoadingSpinner';
import AjarnSpencerCredit from './components/AjarnSpencerCredit';
import GoogleDocsModal from './components/GoogleDocsModal';
import { 
  RefreshCw, 
  Radio, 
  Globe, 
  ChevronLeft, 
  ChevronRight, 
  LogOut, 
  LayoutGrid,
  FileText,
  Key,
  Clock,
  ShieldCheck,
  Search,
  Archive,
  Radar
} from 'lucide-react';

const VOICES: VoiceID[] = ['Fenrir', 'Kore', 'Charon', 'Aoede', 'Zephyr', 'Puck', 'Leda', 'Orus'];
const PAGE_SIZE_OPTIONS = [9, 18, 27, 45, 99];
const STORAGE_KEY = 'UAP_NEXUS_KEY';

const REGIONS: Array<'ALL' | SourceRegion> = [
  'ALL',
  'North America',
  'Europe',
  'Latin America',
  'Asia',
  'Oceania',
  'Africa & Middle East'
];

const REPORT_TYPES: Array<'ALL' | ReportType> = [
  'ALL',
  'Official / Military',
  'Aviation / Pilot Network',
  'Scientific / Observatory',
  'Investigative Media',
  'Eyewitness Database'
];

const App: React.FC = () => {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedVoice, setSelectedVoice] = useState<VoiceID>('Fenrir');
  
  // Filters & Discovery Telemetry
  const [selectedRegion, setSelectedRegion] = useState<'ALL' | SourceRegion>('ALL');
  const [selectedReportType, setSelectedReportType] = useState<'ALL' | ReportType>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [discoveryMeta, setDiscoveryMeta] = useState<Partial<UAPDiscoveryResult>>({
    searchTimeUtc: new Date().toISOString(),
    cutoffTimeUtc: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    sourceCitationsCount: 0,
    totalCandidatesIndexed: 0,
  });
  const [isViewingArchives, setIsViewingArchives] = useState<boolean>(false);

  // Modals State
  const [isDocsModalOpen, setIsDocsModalOpen] = useState<boolean>(false);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState<boolean>(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(9);

  // Initialize BYOK Key (from localStorage or environment)
  useEffect(() => {
    const storedKey = localStorage.getItem(STORAGE_KEY);
    if (storedKey) {
      setApiKey(storedKey);
    } else {
      const envKey = (typeof process !== 'undefined' && (process.env?.GEMINI_API_KEY || process.env?.API_KEY)) || null;
      if (envKey && envKey.trim().length > 10) {
        setApiKey(envKey.trim());
      }
    }
  }, []);

  const handleSaveKey = (key: string) => {
    localStorage.setItem(STORAGE_KEY, key);
    setApiKey(key);
  };

  const handleClearKey = () => {
    localStorage.removeItem(STORAGE_KEY);
    setApiKey(null);
    setArticles([]);
  };

  const loadIntel = useCallback(async () => {
    if (!apiKey) return;
    
    setIsLoading(true);
    setError(null);
    setIsViewingArchives(false);
    try {
      const result = await fetchGlobalUAPReports(apiKey);
      setArticles(result.articles);
      setDiscoveryMeta(result);
      setCurrentPage(1);
    } catch (err: any) {
      const errorMessage = err?.message || 'Unknown error occurred';
      if (errorMessage.includes('401') || errorMessage.includes('key not valid') || errorMessage.includes('API_KEY_INVALID')) {
         setError('Authentication failed: The provided API key was not recognized or is unauthorized. Check your key in Access Credentials.');
      } else {
         setError(`Grid sync notice: ${errorMessage}`);
      }
      console.error("Intel Grid Load Error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [apiKey]);

  const loadHistoricalArchives = () => {
    setArticles(DECLASSIFIED_HISTORICAL_ARCHIVES);
    setIsViewingArchives(true);
    setCurrentPage(1);
    setError(null);
  };

  // Load intel automatically when key is provided and articles are empty
  useEffect(() => {
    if (apiKey && articles.length === 0 && !isViewingArchives) {
      loadIntel();
    }
  }, [apiKey, loadIntel, articles.length, isViewingArchives]);

  const handleOpenDossier = (article: Article) => {
    setSelectedArticle(article);
  };

  const closeModal = () => {
    setSelectedArticle(null);
  };

  // Filtered Articles based on search query, region, and report type
  const filteredArticles = useMemo(() => {
    return articles.filter(article => {
      // Region filter
      if (selectedRegion !== 'ALL' && article.sourceRegion !== selectedRegion) {
        return false;
      }
      // Report type filter
      if (selectedReportType !== 'ALL' && article.reportType !== selectedReportType) {
        return false;
      }
      // Text query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesTitle = article.title?.toLowerCase().includes(q);
        const matchesOriginal = article.originalTitle?.toLowerCase().includes(q);
        const matchesDesc = article.description?.toLowerCase().includes(q);
        const matchesSource = article.source?.toLowerCase().includes(q);
        const matchesLocation = article.location?.toLowerCase().includes(q);
        if (!matchesTitle && !matchesOriginal && !matchesDesc && !matchesSource && !matchesLocation) {
          return false;
        }
      }
      return true;
    });
  }, [articles, selectedRegion, selectedReportType, searchQuery]);

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentArticles = filteredArticles.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.max(1, Math.ceil(filteredArticles.length / itemsPerPage));

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (!apiKey) {
    return (
      <div className="min-h-screen bg-gray-900 font-mono scanline">
        <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gray-800/20 via-gray-900/50 to-black z-0"></div>
        <ApiKeyModal onSave={handleSaveKey} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-green-500 font-mono selection:bg-green-900 selection:text-white flex flex-col">
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gray-800/20 via-gray-900/50 to-black z-0"></div>
      
      <main className="container mx-auto px-4 py-8 relative z-10 flex-grow">
        <header className="relative text-center mb-8 border-b border-green-800/50 pb-8">
          
          <div className="absolute top-0 right-0 flex flex-col items-end gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setIsApiKeyModalOpen(true)}
                className="flex items-center gap-1.5 bg-black/60 hover:bg-black/90 px-3 py-1 rounded border border-green-800/60 hover:border-green-500 text-[10px] font-bold uppercase tracking-wider transition-all"
                title="Manage Personal Gemini API Key / BYOK Gateway"
              >
                <span className={`w-2 h-2 rounded-full ${apiKey && !apiKey.includes('DEMO_PREVIEW_MODE') ? 'bg-green-500 animate-pulse' : 'bg-yellow-400'}`}></span>
                <span className={apiKey && !apiKey.includes('DEMO_PREVIEW_MODE') ? 'text-green-400' : 'text-yellow-400'}>
                  {apiKey && !apiKey.includes('DEMO_PREVIEW_MODE') ? 'BYOK: Active' : 'BYOK Key'}
                </span>
                <Key size={10} className="text-green-600" />
              </button>

              <button
                onClick={() => setIsDocsModalOpen(true)}
                className="text-blue-400 hover:text-blue-200 transition-colors flex items-center gap-1 text-[9px] uppercase tracking-[0.2em] font-bold border border-blue-900/60 hover:border-blue-500 px-2.5 py-1 rounded bg-black/40"
                title="Open Google Docs Intelligence Archive & Synchronized Dossiers"
              >
                <FileText size={11} className="text-blue-400" />
                Google Docs
              </button>

              <button 
                 onClick={handleClearKey}
                 className="text-green-900 hover:text-red-500 transition-colors flex items-center gap-1 text-[9px] uppercase tracking-[0.2em] font-bold border border-green-900/30 hover:border-red-900/50 px-2.5 py-1 rounded group"
                 title="Revoke Credentials & Logout"
              >
                 <LogOut size={10} className="group-hover:animate-pulse" />
                 Revoke
              </button>
            </div>
          </div>

          <div className="flex justify-center items-center gap-4 mb-4 mt-12 lg:mt-0">
             <div className="relative">
                <Globe size={56} className="text-green-500 animate-pulse" />
                <div className="absolute inset-0 bg-green-500 blur-xl opacity-20"></div>
             </div>
             <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-emerald-300 to-teal-500 drop-shadow-[0_0_10px_rgba(34,197,94,0.5)]">
                UAP INTEL NEXUS
             </h1>
          </div>
          <p className="text-emerald-400/70 tracking-[0.4em] text-xs uppercase font-bold">Clearance Level: Top Secret // Ajarn Spencer Littlewood</p>
        </header>

        {/* Dossier Workstation Status Bar & Mode Switcher */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4 bg-black/75 p-3.5 sm:p-4 rounded-xl border border-green-800/40 backdrop-blur-md shadow-lg">
          <div className="flex items-center gap-2">
            <Radar size={18} className="text-green-400 animate-pulse" />
            <div>
              <div className="text-xs text-green-300 font-bold uppercase tracking-widest flex items-center gap-2">
                <span>GLOBAL UAP DISCOVERY DECK</span>
                <span className={`text-[9px] px-1.5 py-0.2 rounded border uppercase font-mono ${
                  isViewingArchives ? 'bg-amber-950/80 text-amber-300 border-amber-800/60' : 'bg-emerald-950/80 text-emerald-300 border-emerald-800/60'
                }`}>
                  {isViewingArchives ? 'Historical Declassified Mode' : '48h Rolling UTC Stream'}
                </span>
              </div>
              <div className="text-[10px] text-green-600/90 font-mono mt-0.5">
                Targeting MUFON · NUFORC · AARO.mil · The Debrief · GEIPAN · FAB Brazil · Japan MoD · CEFAA · UK CAA
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isViewingArchives ? (
              <button
                onClick={loadIntel}
                disabled={isLoading}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500/20 hover:bg-green-500 hover:text-black text-green-300 border border-green-600 rounded text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
                title="Switch to Live 48-Hour Rolling UTC Discovery"
              >
                <RefreshCw size={12} className={isLoading ? 'animate-spin' : ''} />
                <span>Switch to Live 48h Grid</span>
              </button>
            ) : (
              <button
                onClick={loadHistoricalArchives}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-black/60 hover:bg-amber-950/40 text-amber-400 border border-amber-900/60 hover:border-amber-500 rounded text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
                title="View Declassified Historical UAP Dossiers"
              >
                <Archive size={12} />
                <span>Declassified Archives</span>
              </button>
            )}
          </div>
        </div>

        {/* Rolling 48-Hour UTC Telemetry Deck */}
        {!isViewingArchives && (
          <div className="mb-6 bg-emerald-950/20 border border-emerald-900/40 rounded-lg p-3 text-[11px] font-mono flex flex-wrap items-center justify-between gap-3 text-emerald-400/90">
            <div className="flex items-center gap-2">
              <Clock size={13} className="text-emerald-500" />
              <span className="text-emerald-600 uppercase font-bold text-[10px]">Rolling 48h UTC Window:</span>
              <span className="text-emerald-300 font-bold">
                {discoveryMeta.cutoffTimeUtc ? new Date(discoveryMeta.cutoffTimeUtc).toUTCString().slice(5, 22) : 'Active'}
              </span>
              <span className="text-emerald-700">➔</span>
              <span className="text-emerald-300 font-bold">
                {discoveryMeta.searchTimeUtc ? new Date(discoveryMeta.searchTimeUtc).toUTCString().slice(5, 22) : 'Now'}
              </span>
            </div>

            <div className="flex items-center gap-3 text-[10px]">
              <span className="text-green-500/80">
                <span className="text-green-400 font-bold">{articles.length}</span> Records in Window
              </span>
              {discoveryMeta.sourceCitationsCount ? (
                <span className="text-cyan-400/80">
                  <span className="text-cyan-300 font-bold">{discoveryMeta.sourceCitationsCount}</span> Search Citations Grounded
                </span>
              ) : null}
            </div>
          </div>
        )}

        {/* Control & Filter Deck */}
        <div className="space-y-4 mb-8 bg-gray-800/50 p-4 sm:p-6 rounded-lg border border-green-800/30 backdrop-blur-sm shadow-lg">
          {/* Top row: Search input + Voice + Page Size + Scan button */}
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-green-600">
                <Search size={15} />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search incident dossiers by keyword, source, city, or sector..."
                className="w-full bg-black/60 border border-green-800/70 text-green-300 placeholder-green-800/70 pl-9 pr-4 py-2 rounded text-xs font-mono focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-green-700 hover:text-green-400 text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Voice & Display */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <label className="text-green-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 whitespace-nowrap">
                  <Radio size={14} />
                  Voice:
                </label>
                <div className="relative">
                  <select 
                    value={selectedVoice}
                    onChange={(e) => setSelectedVoice(e.target.value as VoiceID)}
                    className="appearance-none bg-black/60 border border-green-700 text-green-400 px-3 py-1.5 pr-7 rounded text-xs focus:outline-none focus:ring-1 focus:ring-green-500 font-mono hover:bg-black/80 transition-colors cursor-pointer"
                  >
                    {VOICES.map(voice => (
                      <option key={voice} value={voice}>{voice}</option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-1.5 text-green-500">
                    <svg className="fill-current h-3 w-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-green-400 text-xs font-bold uppercase tracking-wider whitespace-nowrap">
                  Display:
                </label>
                <div className="relative">
                  <select
                    value={itemsPerPage}
                    onChange={(e) => {
                      setItemsPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="appearance-none bg-black/60 border border-green-700 text-green-400 px-2.5 py-1.5 pr-6 rounded text-xs focus:outline-none focus:ring-1 focus:ring-green-500 font-mono hover:bg-black/80 transition-colors cursor-pointer"
                  >
                    {PAGE_SIZE_OPTIONS.map(size => (
                      <option key={size} value={size}>{size}</option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-1.5 text-green-500">
                    <svg className="fill-current h-3 w-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                  </div>
                </div>
              </div>

              <button
                onClick={loadIntel}
                disabled={isLoading}
                className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-400 text-black font-bold py-1.5 px-4 rounded text-xs transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider shadow-[0_0_15px_rgba(34,197,94,0.3)] hover:shadow-[0_0_25px_rgba(34,197,94,0.5)] cursor-pointer"
              >
                <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
                <span>{isLoading ? 'Scanning...' : 'Scan 48h Grid'}</span>
              </button>
            </div>
          </div>

          {/* Filter row: Regions & Report Types */}
          <div className="pt-3 border-t border-green-900/30 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
            {/* Region Filter Chips */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] text-green-600 uppercase font-bold mr-1 flex items-center gap-1">
                <Globe size={11} />
                Region:
              </span>
              {REGIONS.map(reg => (
                <button
                  key={reg}
                  onClick={() => {
                    setSelectedRegion(reg);
                    setCurrentPage(1);
                  }}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider transition-all cursor-pointer ${
                    selectedRegion === reg
                      ? 'bg-green-600 text-black font-bold shadow-sm'
                      : 'bg-black/50 text-green-400 hover:bg-green-950/60 border border-green-900/60'
                  }`}
                >
                  {reg === 'ALL' ? 'All Regions' : reg}
                </button>
              ))}
            </div>

            {/* Report Type Filter Chips */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] text-green-600 uppercase font-bold mr-1 flex items-center gap-1">
                <ShieldCheck size={11} />
                Source Type:
              </span>
              {REPORT_TYPES.map(type => (
                <button
                  key={type}
                  onClick={() => {
                    setSelectedReportType(type);
                    setCurrentPage(1);
                  }}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider transition-all cursor-pointer ${
                    selectedReportType === type
                      ? 'bg-emerald-500 text-black font-bold shadow-sm'
                      : 'bg-black/50 text-emerald-400 hover:bg-emerald-950/60 border border-emerald-900/60'
                  }`}
                >
                  {type === 'ALL' ? 'All Types' : type.split('/')[0].trim()}
                </button>
              ))}
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col justify-center items-center h-64 gap-4">
            <LoadingSpinner />
            <p className="text-green-500/80 animate-pulse font-mono text-xs uppercase tracking-[0.4em]">
              SEARCHING MULTILINGUAL RADAR & AVIATION REGISTRIES (48H ROLLING UTC)...
            </p>
          </div>
        ) : error && articles.length === 0 ? (
          <div className="text-center text-red-400 bg-red-900/10 border border-red-900/50 p-8 rounded-lg max-w-2xl mx-auto space-y-4">
            <p className="font-mono text-sm leading-relaxed">{error}</p>
            <div className="flex flex-wrap justify-center gap-3 pt-2">
              <button
                onClick={loadIntel}
                className="px-4 py-2 bg-green-500 hover:bg-green-400 text-black font-bold text-xs uppercase tracking-wider rounded transition-all cursor-pointer"
              >
                Retry 48h Grid Scan
              </button>
              <button
                onClick={loadHistoricalArchives}
                className="px-4 py-2 bg-amber-950/40 hover:bg-amber-900/60 border border-amber-800 text-amber-300 text-xs uppercase tracking-wider rounded transition-all cursor-pointer"
              >
                Load Historical Declassified Dossiers
              </button>
              <button
                onClick={() => setIsApiKeyModalOpen(true)}
                className="px-4 py-2 bg-black/60 hover:bg-black/90 border border-green-800 hover:border-green-500 text-green-400 text-xs uppercase tracking-wider rounded transition-all cursor-pointer"
              >
                Check / Edit API Key
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {error && (
              <div className="flex items-center justify-between bg-yellow-950/40 border border-yellow-700/50 text-yellow-400 px-4 py-3 rounded-lg text-xs font-mono">
                <span>{error}</span>
                <button 
                  onClick={() => setError(null)} 
                  className="text-yellow-600 hover:text-yellow-300 ml-4 font-bold uppercase tracking-wider cursor-pointer"
                >
                  Dismiss
                </button>
              </div>
            )}

            {/* Empty State when 0 reports found in 48-hour window */}
            {articles.length === 0 && !isLoading && (
              <div className="text-center bg-black/60 border border-green-900/50 p-10 rounded-xl max-w-2xl mx-auto space-y-4">
                <div className="w-12 h-12 mx-auto rounded-full bg-green-950/80 border border-green-700/60 flex items-center justify-center text-green-400">
                  <Radar size={24} className="animate-pulse" />
                </div>
                <h3 className="text-base font-bold text-green-400 uppercase tracking-widest font-mono">
                  0 Qualifying UAP Incidents in 48-Hour UTC Window
                </h3>
                <p className="text-xs text-green-500/70 leading-relaxed font-mono">
                  The international search grounding pipeline queried candidate defense, civil aviation, and scientific registries (MUFON, NUFORC, AARO.mil, GEIPAN, FAB Brazil, Japan MoD, UK CAA). No verified incidents or new reports met the strict rolling 48-hour publication threshold.
                </p>
                <div className="flex flex-wrap justify-center gap-3 pt-3">
                  <button
                    onClick={loadHistoricalArchives}
                    className="flex items-center gap-2 px-5 py-2.5 bg-green-500 hover:bg-green-400 text-black font-bold text-xs uppercase tracking-widest rounded transition-all shadow-[0_0_20px_rgba(34,197,94,0.3)] cursor-pointer"
                  >
                    <Archive size={14} />
                    <span>View Declassified Historical Dossiers</span>
                  </button>
                  <button
                    onClick={loadIntel}
                    className="flex items-center gap-2 px-4 py-2 bg-black/70 hover:bg-green-950/60 text-green-400 border border-green-800 text-xs uppercase tracking-wider rounded transition-all cursor-pointer"
                  >
                    <RefreshCw size={12} />
                    <span>Rescan Live Grid</span>
                  </button>
                </div>
              </div>
            )}

            {/* Empty filter state when articles exist but current filter yields 0 */}
            {articles.length > 0 && filteredArticles.length === 0 && (
              <div className="text-center bg-black/40 border border-green-900/40 p-8 rounded-xl max-w-xl mx-auto space-y-3">
                <p className="text-xs text-green-400 font-mono uppercase tracking-wider">
                  No dossiers match active filter: Region = {selectedRegion}, Type = {selectedReportType}
                  {searchQuery ? `, Query = "${searchQuery}"` : ''}
                </p>
                <button
                  onClick={() => {
                    setSelectedRegion('ALL');
                    setSelectedReportType('ALL');
                    setSearchQuery('');
                  }}
                  className="px-4 py-1.5 bg-green-900/40 hover:bg-green-700/60 text-green-300 border border-green-700 rounded text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Clear All Filters
                </button>
              </div>
            )}

            {/* Intel Article Cards Grid */}
            {filteredArticles.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {currentArticles.map((article) => (
                  <ArticleCard 
                    key={article.id} 
                    article={article} 
                    onAnalyze={handleOpenDossier}
                  />
                ))}
              </div>
            )}

            {/* Pagination Controls */}
            {articles.length > 0 && (
                <div className="mt-12 flex justify-center items-center gap-4">
                    <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="p-2 rounded-full border border-green-700 text-green-400 hover:bg-green-900/50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                        <ChevronLeft size={24} />
                    </button>
                    
                    <span className="text-green-500 font-mono text-sm uppercase tracking-widest">
                        Page {currentPage} of {totalPages}
                    </span>
                    
                    <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="p-2 rounded-full border border-green-700 text-green-400 hover:bg-green-900/50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                        <ChevronRight size={24} />
                    </button>
                </div>
            )}
            
            {articles.length > 0 && (
                <div className="text-center mt-4 text-[10px] text-green-900 uppercase tracking-[0.5em] font-bold">
                    Transmission Packet Count: {articles.length}
                </div>
            )}
            
            {articles.length === 0 && !isLoading && !error && (
                <div className="text-center mt-20 text-green-900 uppercase tracking-[0.6em] animate-pulse font-bold text-xs">
                    SYSTEM READY... AWAITING TARGET PARAMETERS
                </div>
            )}
          </div>
        )}
      </main>

      {/* Analysis Dossier Modal */}
      {selectedArticle && (
        <AnalysisModal
          isOpen={!!selectedArticle}
          onClose={closeModal}
          article={selectedArticle}
          voiceId={selectedVoice}
          apiKey={apiKey}
          onOpenDocsArchive={() => setIsDocsModalOpen(true)}
        />
      )}

      {/* Google Docs Intelligence Archive & Dossier Manager */}
      <GoogleDocsModal
        isOpen={isDocsModalOpen}
        onClose={() => setIsDocsModalOpen(false)}
      />

      {/* BYOK Gateway Modal (when opened from header) */}
      {isApiKeyModalOpen && (
        <ApiKeyModal
          onSave={handleSaveKey}
          onClose={() => setIsApiKeyModalOpen(false)}
          currentKey={apiKey}
          onClearKey={handleClearKey}
        />
      )}

      <AjarnSpencerCredit />
    </div>
  );
};

export default App;
