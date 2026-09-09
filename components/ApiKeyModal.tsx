
import React, { useState } from 'react';
import { Key, ShieldCheck, ExternalLink, ShieldAlert } from 'lucide-react';

interface ApiKeyModalProps {
  onSave: (key: string) => void;
}

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ onSave }) => {
  const [inputKey, setInputKey] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedKey = inputKey.trim();
    if (trimmedKey.length < 20 || !trimmedKey.startsWith('AIza')) {
      setError('Invalid Access Code. Ensure it is a valid Google Gemini API Key.');
      return;
    }
    onSave(trimmedKey);
  };

  return (
    <div className="fixed inset-0 bg-black/95 flex justify-center items-center z-50 p-4">
      <div className="bg-gray-900 border-2 border-green-500/50 rounded-lg p-8 max-w-md w-full shadow-[0_0_50px_rgba(34,197,94,0.2)] relative overflow-hidden">
        {/* Decorative scanlines */}
        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-0 bg-[length:100%_2px,3px_100%]"></div>
        
        <div className="relative z-10">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <ShieldCheck size={64} className="text-green-500" />
              <div className="absolute inset-0 bg-green-500 blur-xl opacity-30 animate-pulse"></div>
            </div>
          </div>
          
          <h2 className="text-2xl font-black text-center text-green-500 mb-2 font-mono tracking-tighter">
            SECURITY CLEARANCE REQUIRED
          </h2>
          <p className="text-green-400/60 text-center text-xs font-mono mb-8 uppercase tracking-widest">
            UAP INTEL NEXUS ACCESS PORTAL
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="apiKey" className="block text-green-500 text-xs font-bold mb-2 uppercase">
                Your Personal Gemini API Key
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Key size={16} className="text-green-600" />
                </div>
                <input
                  type="password"
                  id="apiKey"
                  value={inputKey}
                  onChange={(e) => {
                    setInputKey(e.target.value);
                    setError('');
                  }}
                  className="bg-black/50 border border-green-800 text-green-400 text-sm rounded focus:ring-green-500 focus:border-green-500 block w-full pl-10 p-2.5 font-mono placeholder-green-900/30 focus:outline-none focus:shadow-[0_0_15px_rgba(34,197,94,0.3)] transition-all"
                  placeholder="AIzaSy..."
                  autoComplete="off"
                />
              </div>
              {error && <p className="mt-2 text-red-500 text-[10px] font-mono leading-tight">{error}</p>}
            </div>

            <button
              type="submit"
              className="w-full text-black bg-green-500 hover:bg-green-400 focus:ring-4 focus:outline-none focus:ring-green-800 font-bold rounded text-sm px-5 py-3 text-center transition-colors uppercase tracking-widest shadow-[0_0_20px_rgba(34,197,94,0.4)] hover:shadow-[0_0_30px_rgba(34,197,94,0.6)]"
            >
              Authenticate & Decrypt
            </button>
          </form>

          <div className="mt-8 p-4 bg-green-900/10 border border-green-900/30 rounded-md">
            <div className="flex items-start gap-2 mb-2">
              <ShieldAlert size={14} className="text-green-500 mt-0.5 shrink-0" />
              <p className="text-[10px] text-green-500 font-mono uppercase font-bold tracking-wider">Privacy Protocol</p>
            </div>
            <p className="text-[9px] text-green-700 font-mono leading-relaxed">
              BYOK MODEL: This application does not store keys on any server. Your key remains in your local browser storage and is only used to establish a direct secure link with the Google Gemini API.
            </p>
          </div>

          <div className="mt-6 text-center">
            <a 
              href="https://aistudio.google.com/app/apikey" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-green-600 hover:text-green-400 text-xs font-mono transition-colors"
            >
              <ExternalLink size={12} />
              Request New Key (Free Tier)
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiKeyModal;
