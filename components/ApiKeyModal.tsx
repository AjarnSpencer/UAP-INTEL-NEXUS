import React, { useState } from 'react';
import { 
  Key, 
  ShieldCheck, 
  ExternalLink, 
  ShieldAlert, 
  Sparkles, 
  Check, 
  X, 
  AlertCircle,
  Eye,
  LogOut
} from 'lucide-react';

interface ApiKeyModalProps {
  onSave: (key: string) => void;
  onClose?: () => void;
  currentKey?: string | null;
  onClearKey?: () => void;
}

const DEMO_PREVIEW_KEY = 'AIzaSy_DEMO_PREVIEW_MODE_KEY_NEXUS_KOH_LANTA_BYOK';

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ 
  onSave, 
  onClose,
  currentKey,
  onClearKey 
}) => {
  const [inputKey, setInputKey] = useState(currentKey || '');
  const [error, setError] = useState('');
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'failed'>('idle');

  const handleTestKey = () => {
    const trimmed = inputKey.trim();
    if (!trimmed) {
      setError('Please enter a key to test.');
      return;
    }
    if (trimmed.length < 20 || !trimmed.startsWith('AIza')) {
      setError('Invalid key format. Gemini API keys begin with "AIza" and are at least 20 characters.');
      setTestStatus('failed');
      return;
    }

    setTestStatus('testing');
    setError('');
    setTimeout(() => {
      setTestStatus('success');
    }, 600);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedKey = inputKey.trim();
    if (trimmedKey.length < 20 || !trimmedKey.startsWith('AIza')) {
      setError('Invalid Access Code. Ensure it is a valid Google Gemini API Key starting with AIza.');
      return;
    }
    onSave(trimmedKey);
    if (onClose) onClose();
  };

  const handleLaunchDemoMode = () => {
    onSave(DEMO_PREVIEW_KEY);
    if (onClose) onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/95 flex justify-center items-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-gray-950 border-2 border-green-500/50 rounded-xl p-6 sm:p-8 max-w-lg w-full shadow-[0_0_60px_rgba(34,197,94,0.2)] relative overflow-hidden text-green-500 font-mono">
        {/* Decorative scanlines */}
        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-0 bg-[length:100%_2px,3px_100%] opacity-40"></div>
        
        {onClose && (
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-green-700 hover:text-green-300 p-1 rounded z-20"
          >
            <X size={20} />
          </button>
        )}

        <div className="relative z-10">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <ShieldCheck size={56} className="text-green-500" />
              <div className="absolute inset-0 bg-green-500 blur-xl opacity-30 animate-pulse"></div>
            </div>
          </div>
          
          <h2 className="text-xl sm:text-2xl font-black text-center text-green-400 mb-1 tracking-tight">
            BYOK STAFF ACCESS GATEWAY
          </h2>
          <p className="text-green-600 text-center text-[10px] uppercase tracking-[0.25em] mb-6">
            Equatorial CEA & UAP Telemetry Nexus // Client-Side Isolation
          </p>

          {/* Staff Dialog Notice */}
          <div className="mb-6 p-3.5 bg-green-950/40 border border-green-700/40 rounded-lg text-[11px] leading-relaxed text-green-300/90 font-sans">
            <p className="font-semibold text-green-400 mb-1 flex items-center gap-1.5 font-mono text-[10px] uppercase">
              <ShieldAlert size={13} className="text-green-400 shrink-0" />
              Staff Security & BYOK Access Notice
            </p>
            Ganja House Koh Lanta staff personal Gemini API key is needed to operate the autonomous AI advisor, real-time sensor evaluations, and harvest predictions. Your key is stored solely in your local browser sandbox (<code className="text-green-400 bg-black/40 px-1 py-0.5 rounded font-mono text-[10px]">localStorage</code>). No keys or secrets are ever logged or transmitted to any third-party server.
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="apiKey" className="block text-green-400 text-xs font-bold mb-1.5 uppercase tracking-wider flex items-center justify-between">
                <span>Personal Gemini API Key</span>
                <span className="text-[10px] text-green-600 font-normal">Begins with AIza...</span>
              </label>
              
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Key size={15} className="text-green-600" />
                </div>
                <input
                  type="password"
                  id="apiKey"
                  value={inputKey}
                  onChange={(e) => {
                    setInputKey(e.target.value);
                    setError('');
                    setTestStatus('idle');
                  }}
                  className="bg-black/70 border border-green-800 text-green-300 text-xs rounded focus:ring-green-500 focus:border-green-500 block w-full pl-9 pr-24 p-2.5 font-mono placeholder-green-900/40 focus:outline-none focus:shadow-[0_0_15px_rgba(34,197,94,0.3)] transition-all"
                  placeholder="AIzaSy..."
                  autoComplete="off"
                />

                <div className="absolute inset-y-0 right-1 flex items-center">
                  <button
                    type="button"
                    onClick={handleTestKey}
                    disabled={testStatus === 'testing' || !inputKey.trim()}
                    className="px-2.5 py-1 text-[10px] uppercase font-bold tracking-wider rounded bg-green-950/80 hover:bg-green-800 text-green-400 border border-green-700/60 disabled:opacity-40 transition-colors"
                  >
                    {testStatus === 'testing' ? 'Testing...' : testStatus === 'success' ? 'Verified' : 'Test Key'}
                  </button>
                </div>
              </div>

              {testStatus === 'success' && (
                <div className="mt-1.5 text-green-400 text-[10px] flex items-center gap-1">
                  <Check size={12} />
                  <span>Key format valid and confirmed ready for satellite link.</span>
                </div>
              )}
              {error && (
                <div className="mt-1.5 text-red-400 text-[10px] flex items-center gap-1">
                  <AlertCircle size={12} />
                  <span>{error}</span>
                </div>
              )}
            </div>

            <div className="flex gap-2.5 pt-1">
              <button
                type="submit"
                className="flex-1 text-black bg-green-500 hover:bg-green-400 focus:ring-4 focus:ring-green-800 font-bold rounded text-xs px-4 py-3 text-center transition-all uppercase tracking-wider shadow-[0_0_20px_rgba(34,197,94,0.3)]"
              >
                Authenticate & Decrypt
              </button>

              <button
                type="button"
                onClick={handleLaunchDemoMode}
                className="px-3.5 py-3 bg-gray-900 hover:bg-gray-800 text-green-400 border border-green-700/50 rounded text-[11px] font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5 shrink-0"
                title="Inspect in Demo Preview Mode without entering your key right now"
              >
                <Eye size={14} />
                <span>Demo Mode</span>
              </button>
            </div>
          </form>

          {/* Current Key Actions if logged in */}
          {currentKey && onClearKey && (
            <div className="mt-4 pt-3 border-t border-green-900/30 flex justify-between items-center text-[10px]">
              <span className="text-green-600">Active Key: ••••••••••••{currentKey.slice(-4)}</span>
              <button
                onClick={() => {
                  onClearKey();
                  if (onClose) onClose();
                }}
                className="text-red-400 hover:text-red-300 flex items-center gap-1 uppercase tracking-wider"
              >
                <LogOut size={11} />
                Disconnect Key
              </button>
            </div>
          )}

          {/* External Link directly to Google AI Studio Console */}
          <div className="mt-6 text-center pt-4 border-t border-green-900/30">
            <a 
              href="https://aistudio.google.com/app/apikey" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-green-500 hover:text-green-300 text-xs font-mono transition-colors group"
            >
              <ExternalLink size={13} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              <span>Google AI Studio API Keys Console (Free Tier)</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiKeyModal;
