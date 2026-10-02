import React, { useState } from 'react';
import { Key, Map, ExternalLink, ShieldAlert, X, Check, Globe } from 'lucide-react';

interface MapsConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentMapsKey: string;
  onSaveMapsKey: (key: string) => void;
}

const MapsConfigModal: React.FC<MapsConfigModalProps> = ({
  isOpen,
  onClose,
  currentMapsKey,
  onSaveMapsKey,
}) => {
  const [inputKey, setInputKey] = useState(currentMapsKey || '');
  const [saved, setSaved] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveMapsKey(inputKey.trim());
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 bg-black/90 flex justify-center items-center z-50 p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-gray-900 border border-green-700/60 rounded-xl p-6 sm:p-8 max-w-lg w-full shadow-[0_0_50px_rgba(34,197,94,0.2)] relative font-mono text-green-400"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start mb-6 border-b border-green-800/40 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-950/80 border border-green-700 rounded-lg text-green-400">
              <Map size={24} className="animate-pulse" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-100 uppercase tracking-tight">
                Google Maps & Aerial View Key
              </h3>
              <p className="text-[10px] text-green-600 uppercase tracking-widest">
                Tactical Radar & 3D Aerial Recon Engine
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-green-700 hover:text-red-400 p-1">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-green-400 uppercase tracking-wider mb-2">
              Google Maps Platform API Key
            </label>
            <div className="relative">
              <Key size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-green-600" />
              <input
                type="password"
                value={inputKey}
                onChange={(e) => setInputKey(e.target.value)}
                placeholder="AIzaSy... (leave blank to inherit Gemini key)"
                className="w-full bg-black/70 border border-green-800 rounded px-10 py-2.5 text-xs text-green-300 placeholder-green-800 focus:outline-none focus:border-green-400 font-mono"
              />
            </div>
            <p className="text-[10px] text-green-700 mt-1.5 leading-relaxed">
              If your Google Cloud project has both Gemini and Google Maps Platform enabled, you can use the same key.
            </p>
          </div>

          <div className="p-3.5 bg-green-950/30 border border-green-800/40 rounded-lg space-y-2 text-[11px] text-green-300/80 font-sans leading-relaxed">
            <div className="flex items-center gap-1.5 font-mono text-[10px] font-bold text-green-400 uppercase tracking-wider">
              <Globe size={13} className="text-green-500" />
              Prototyping with Maps Demo Key
            </div>
            <p>
              Don't have a Google Cloud billing account? You can generate a free, instantaneous Maps Demo Key with no credit card required:
            </p>
            <a
              href="https://mapsplatform.google.com/maps-demo-key?utm_campaign=gmp_mcp_codeassist_v1_aistudio"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-green-400 hover:text-green-200 underline font-mono text-[10px] font-bold"
            >
              <ExternalLink size={11} />
              mapsplatform.google.com/maps-demo-key
            </a>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              className="flex-1 py-2.5 bg-green-500 hover:bg-green-400 text-black font-black uppercase text-xs tracking-widest rounded shadow-[0_0_20px_rgba(34,197,94,0.3)] transition-all flex items-center justify-center gap-2"
            >
              {saved ? <Check size={16} /> : null}
              {saved ? 'Key Calibrated' : 'Save Key Configuration'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded text-xs uppercase font-bold transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MapsConfigModal;
