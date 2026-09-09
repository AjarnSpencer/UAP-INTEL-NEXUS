
import React, { useState, useEffect, useCallback } from 'react';
import { fetchNews } from './services/newsService';
import { Article, VoiceID } from './types';
import ArticleCard from './components/ArticleCard';
import AnalysisModal from './components/AnalysisModal';
import ApiKeyModal from './components/ApiKeyModal';
import LoadingSpinner from './components/LoadingSpinner';
import { RefreshCw, Radio, Globe, ChevronLeft, ChevronRight, List, LogOut, ShieldCheck, Lock } from 'lucide-react';
import AjarnSpencerCredit from './components/AjarnSpencerCredit';

const VOICES: VoiceID[] = ['Fenrir', 'Kore', 'Charon', 'Aoede', 'Zephyr', 'Puck', 'Leda', 'Orus'];
const PAGE_SIZE_OPTIONS = [9, 18, 27, 45, 99];
const STORAGE_KEY = 'UAP_NEXUS_KEY';

const App: React.FC = () => {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedVoice, setSelectedVoice] = useState<VoiceID>('Fenrir');
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(9);

  // Initialize Key
  useEffect(() => {
    const storedKey = localStorage.getItem(STORAGE_KEY);
    if (storedKey) {
      setApiKey(storedKey);
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
    try {
      const newsArticles = await fetchNews(apiKey);
      setArticles(newsArticles);
      setCurrentPage(1); // Reset to first page on new fetch
    } catch (err: any) {
      const errorMessage = err.message || 'Unknown error occurred';
      if (errorMessage.includes('401') || errorMessage.includes('key')) {
         setError('Authentication failed. The provided API key is rejected by the satellite link.');
      } else {
         setError('Connection to UAP Grid lost. Retrying secure handshake...');
      }
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [apiKey]);

  // Load intel automatically when key is provided and articles are empty
  useEffect(() => {
    if (apiKey && articles.length === 0) {
      loadIntel();
    }
  }, [apiKey, loadIntel, articles.length]);

  const handleOpenDossier = (article: Article) => {
    setSelectedArticle(article);
  };

  const closeModal = () => {
    setSelectedArticle(null);
  };

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentArticles = articles.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(articles.length / itemsPerPage);

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
        <header className="relative text-center mb-10 border-b border-green-800/50 pb-8">
          
          <div className="absolute top-0 right-0 flex flex-col items-end gap-2">
            <div className="flex items-center gap-2 bg-black/40 px-3 py-1 rounded border border-green-900/30">
              <ShieldCheck size={12} className="text-green-500" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-green-600">Secure Link Active</span>
              <Lock size={10} className="text-green-800" />
            </div>
            <button 
               onClick={handleClearKey}
               className="text-green-900 hover:text-red-500 transition-colors flex items-center gap-1 text-[9px] uppercase tracking-[0.2em] font-bold border border-green-900/30 hover:border-red-900/50 px-3 py-1 rounded group"
               title="Revoke Credentials & Logout"
            >
               <LogOut size={10} className="group-hover:animate-pulse" />
               Revoke Clearance
            </button>
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

        {/* Control Panel */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6 mb-8 bg-gray-800/50 p-6 rounded-lg border border-green-800/30 backdrop-blur-sm shadow-lg">
            
            <div className="flex flex-col sm:flex-row items-center gap-6 w-full lg:w-auto">
                {/* Voice Selector */}
                <div className="flex items-center gap-3">
                    <label className="text-green-400 text-sm font-bold uppercase tracking-wider flex items-center gap-2 whitespace-nowrap">
                        <Radio size={18} />
                        Voice ID:
                    </label>
                    <div className="relative">
                        <select 
                            value={selectedVoice}
                            onChange={(e) => setSelectedVoice(e.target.value as VoiceID)}
                            className="appearance-none bg-black/50 border border-green-700 text-green-400 px-4 py-2 pr-8 rounded focus:outline-none focus:ring-2 focus:ring-green-500 font-mono w-40 hover:bg-black/70 transition-colors cursor-pointer"
                        >
                            {VOICES.map(voice => (
                                <option key={voice} value={voice}>{voice}</option>
                            ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-green-500">
                            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                        </div>
                    </div>
                </div>

                {/* Items Per Page Selector */}
                <div className="flex items-center gap-3">
                    <label className="text-green-400 text-sm font-bold uppercase tracking-wider flex items-center gap-2 whitespace-nowrap">
                        <List size={18} />
                        Density:
                    </label>
                    <div className="relative">
                        <select 
                            value={itemsPerPage}
                            onChange={(e) => setItemsPerPage(Number(e.target.value))}
                            className="appearance-none bg-black/50 border border-green-700 text-green-400 px-4 py-2 pr-8 rounded focus:outline-none focus:ring-2 focus:ring-green-500 font-mono w-24 hover:bg-black/70 transition-colors cursor-pointer"
                        >
                            {PAGE_SIZE_OPTIONS.map(size => (
                                <option key={size} value={size}>{size}</option>
                            ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-green-500">
                            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                        </div>
                    </div>
                </div>
            </div>

            <button
                onClick={loadIntel}
                disabled={isLoading}
                className="flex items-center gap-2 px-6 py-2 bg-green-900/30 text-green-400 border border-green-600 font-bold rounded hover:bg-green-500 hover:text-black focus:outline-none focus:ring-2 focus:ring-green-500 transition-all uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(34,197,94,0.2)] hover:shadow-[0_0_25px_rgba(34,197,94,0.4)]"
            >
                <RefreshCw className={isLoading ? 'animate-spin' : ''} size={18} />
                {isLoading ? 'Decrypting...' : 'Initiate Scan'}
            </button>
        </div>

        {isLoading ? (
          <div className="flex flex-col justify-center items-center h-64 gap-4">
            <LoadingSpinner />
            <p className="text-green-500/80 animate-pulse font-mono text-xs uppercase tracking-[0.4em]">SCANNING GLOBAL FREQUENCIES...</p>
          </div>
        ) : error ? (
          <div className="text-center text-red-400 bg-red-900/10 border border-red-900/50 p-8 rounded-lg max-w-2xl mx-auto">
            <p className="font-mono text-sm leading-relaxed">{error}</p>
            <button onClick={handleClearKey} className="mt-4 text-[10px] text-red-500 underline uppercase tracking-widest">Update Access Credentials</button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {currentArticles.map((article) => (
                <ArticleCard key={article.id} article={article} onAnalyze={handleOpenDossier} />
              ))}
            </div>

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
          </>
        )}
      </main>

      {selectedArticle && (
        <AnalysisModal
          isOpen={!!selectedArticle}
          onClose={closeModal}
          article={selectedArticle}
          voiceId={selectedVoice}
          apiKey={apiKey}
        />
      )}
      <AjarnSpencerCredit />
    </div>
  );
};

export default App;
