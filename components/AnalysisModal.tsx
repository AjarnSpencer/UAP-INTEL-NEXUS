
import React, { useState, useEffect, useRef } from 'react';
import { Article, ReporterStyle, VoiceID } from '../types';
import { generateIntelBriefing, generateAudioBriefing, generateVisualReconstruction } from '../services/geminiService';
import { createWavBlob } from '../utils/audioUtils';
import LoadingSpinner from './LoadingSpinner';
import { X, Play, Square, FileText, Radio, ShieldAlert, Copy, Download, Check, Camera, Image as ImageIcon } from 'lucide-react';

interface AnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  article: Article;
  voiceId: VoiceID;
  apiKey: string;
}

const STYLES: ReporterStyle[] = ['Academic', 'Gonzo', 'Skeptic', 'Viral'];

const AnalysisModal: React.FC<AnalysisModalProps> = ({
  isOpen,
  onClose,
  article,
  voiceId,
  apiKey,
}) => {
  const [activeStyle, setActiveStyle] = useState<ReporterStyle>('Academic');
  const [content, setContent] = useState<string | null>(null);
  const [visualUrl, setVisualUrl] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isVisualGenerating, setIsVisualGenerating] = useState<boolean>(false);
  const [isAudioGenerating, setIsAudioGenerating] = useState<boolean>(false);
  
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (isOpen) {
        handleGenerate(activeStyle);
    }
    return () => {
        stopAudio();
    };
  }, [isOpen]);

  const handleGenerate = async (style: ReporterStyle) => {
    setActiveStyle(style);
    setIsGenerating(true);
    setIsVisualGenerating(true);
    stopAudio();
    setContent(null);
    setAudioUrl(null);
    setVisualUrl(null);
    setCopied(false);

    try {
        // Parallel load for text and imagery
        const [text, visual] = await Promise.all([
          generateIntelBriefing(apiKey, article.title, article.description, article.source, style),
          generateVisualReconstruction(apiKey, article.title, article.description).catch(err => {
            console.error("Visual generation failed", err);
            return null;
          })
        ]);

        setContent(text);
        setVisualUrl(visual);
        setIsVisualGenerating(false);
        
        // Auto-generate audio after text is ready
        setIsAudioGenerating(true);
        try {
            const base64Audio = await generateAudioBriefing(apiKey, text, voiceId);
            const blob = createWavBlob(base64Audio);
            const url = URL.createObjectURL(blob);
            setAudioUrl(url);
        } catch (audioErr) {
            console.error("Audio failed", audioErr);
        } finally {
            setIsAudioGenerating(false);
        }

    } catch (err) {
        setContent("Failed to decrypt intel.");
    } finally {
        setIsGenerating(false);
        setIsVisualGenerating(false);
    }
  };

  const togglePlayback = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
        audioRef.current.pause();
    } else {
        audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const stopAudio = () => {
    if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
  };

  const handleCopy = () => {
    if (content) {
      navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownloadAudio = () => {
    if (audioUrl) {
      const a = document.createElement('a');
      a.href = audioUrl;
      a.download = `nexus_briefing_${article.id}_${voiceId}.wav`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/95 flex justify-center items-center z-50 p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-gray-900 border border-green-700/50 rounded-lg shadow-[0_0_50px_rgba(34,197,94,0.15)] w-full max-w-5xl max-h-[95vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gray-800/80 p-6 border-b border-green-800/30 flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
                <ShieldAlert className="text-red-500 animate-pulse" size={16} />
                <span className="text-[10px] font-bold text-red-500 uppercase tracking-[0.3em] border border-red-500/50 px-3 py-0.5 rounded-full">Top Secret // Classified // Level 5</span>
            </div>
            <h2 className="text-2xl font-black text-gray-100 font-mono tracking-tight leading-tight uppercase">{article.title}</h2>
          </div>
          <button onClick={onClose} className="text-green-800 hover:text-red-500 transition-colors ml-4 p-2">
            <X size={32} />
          </button>
        </div>

        {/* Toolbar */}
        <div className="bg-gray-900/50 p-4 border-b border-green-900/30 flex flex-wrap gap-4 items-center justify-between">
            <div className="flex gap-1">
                {STYLES.map(style => (
                    <button
                        key={style}
                        onClick={() => handleGenerate(style)}
                        disabled={isGenerating}
                        className={`px-4 py-2 rounded text-[10px] font-bold uppercase tracking-widest transition-all
                            ${activeStyle === style 
                                ? 'bg-green-600 text-black shadow-[0_0_15px_rgba(34,197,94,0.4)]' 
                                : 'bg-gray-800/50 text-green-800 hover:text-green-400 hover:bg-gray-800'}
                        `}
                    >
                        {style} Mode
                    </button>
                ))}
            </div>
            
            <div className="flex items-center gap-3">
              {content && !isGenerating && (
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-800/80 text-green-500 border border-green-800/50 rounded hover:bg-green-500 hover:text-black transition-all text-[10px] font-bold uppercase tracking-widest"
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  {copied ? 'Captured' : 'Copy Intel'}
                </button>
              )}

              <div className="flex items-center gap-3 bg-black/60 px-4 py-2 rounded border border-green-900/50">
                  <Radio size={14} className="text-green-500 animate-pulse" />
                  <span className="text-[10px] text-green-600 font-mono uppercase tracking-widest">Speaker: {voiceId}</span>
                  {audioUrl && !isAudioGenerating && (
                    <div className="flex gap-1 ml-2">
                      <button 
                          onClick={togglePlayback}
                          className="w-8 h-8 flex items-center justify-center bg-green-500 text-black rounded-full hover:bg-green-400 transition-colors shadow-[0_0_10px_rgba(34,197,94,0.3)]"
                      >
                          {isPlaying ? <Square size={12} fill="currentColor" /> : <Play size={12} fill="currentColor" className="ml-0.5" />}
                      </button>
                      <button
                        onClick={handleDownloadAudio}
                        className="w-8 h-8 flex items-center justify-center bg-gray-800 text-green-500 rounded-full border border-green-700 hover:bg-green-900 transition-colors"
                        title="Download Narrative"
                      >
                        <Download size={12} />
                      </button>
                    </div>
                  )}
                  {isAudioGenerating && <span className="text-[10px] text-green-500/50 animate-pulse ml-2 font-mono">ENCODING AUDIO...</span>}
              </div>
            </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-black/20 flex flex-col lg:flex-row">
          
          {/* Visual Reconstruction Side */}
          <div className="lg:w-2/5 border-b lg:border-b-0 lg:border-r border-green-900/30 bg-black/40 p-6 flex flex-col">
            <div className="flex items-center gap-2 mb-4">
              <Camera size={16} className="text-green-500" />
              <h3 className="text-xs font-bold text-green-600 uppercase tracking-[0.3em] font-mono">Visual Reconstruction</h3>
            </div>
            
            <div className="relative aspect-video bg-gray-900 rounded border border-green-900/50 overflow-hidden flex items-center justify-center group shadow-inner">
              {isVisualGenerating ? (
                <div className="flex flex-col items-center">
                  <LoadingSpinner />
                  <span className="text-[10px] text-green-800 mt-3 font-mono animate-pulse uppercase">Enhancing Resolution...</span>
                </div>
              ) : visualUrl ? (
                <>
                  <img src={visualUrl} alt="Visual Reconstruction" className="w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700" />
                  <div className="absolute inset-0 pointer-events-none border border-green-500/20 m-2"></div>
                  <div className="absolute top-4 left-4 text-[8px] font-mono text-green-500/50 uppercase bg-black/60 p-1 rounded">SAT_RECON_ALPHA_09</div>
                </>
              ) : (
                <div className="text-center p-4">
                   <ImageIcon size={32} className="mx-auto text-green-900 mb-2 opacity-20" />
                   <p className="text-[10px] text-green-900 font-mono uppercase">Imagery Unavailable / Data Corrupted</p>
                </div>
              )}
            </div>
            
            <div className="mt-4 p-4 bg-green-900/5 border border-green-900/20 rounded flex-grow">
              <div className="text-[10px] text-green-700 font-mono uppercase mb-2 border-b border-green-900/20 pb-1">Telemetry Data</div>
              <div className="space-y-1">
                <div className="flex justify-between text-[9px] font-mono">
                  <span className="text-green-800">SOURCE_ID:</span>
                  <span className="text-green-500">NEXUS-7</span>
                </div>
                <div className="flex justify-between text-[9px] font-mono">
                  <span className="text-green-800">ENCRYPTION:</span>
                  <span className="text-green-500">AES-256-QUANTUM</span>
                </div>
                <div className="flex justify-between text-[9px] font-mono">
                  <span className="text-green-800">SCAN_FREQ:</span>
                  <span className="text-green-500">1420.4 MHz</span>
                </div>
                <div className="flex justify-between text-[9px] font-mono">
                  <span className="text-green-800">CONFIDENCE:</span>
                  <span className="text-green-500">98.4%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Text Content Side */}
          <div className="lg:w-3/5 p-8 relative">
            {isGenerating ? (
              <div className="flex flex-col items-center justify-center h-full py-20">
                <LoadingSpinner />
                <p className="mt-4 text-green-500 font-mono animate-pulse text-xs tracking-widest">DECRYPTING INTELLIGENCE PACKET...</p>
              </div>
            ) : content ? (
              <div className="prose prose-invert prose-green max-w-none">
                  <div className="font-mono text-[10px] text-green-700 mb-6 pb-2 border-b border-green-900/30 flex justify-between uppercase tracking-widest">
                      <span>FILE_REF: {article.id}</span>
                      <span>SIG_TYPE: {activeStyle}</span>
                  </div>
                  <div className="whitespace-pre-wrap leading-relaxed text-gray-300 font-sans text-base">
                      {content}
                  </div>
                  <div className="mt-12 pt-6 border-t border-dashed border-green-900/30">
                      <a href={article.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-green-500 hover:text-green-300 text-[10px] font-bold font-mono uppercase tracking-widest transition-colors bg-green-900/10 px-4 py-2 rounded border border-green-900/50">
                          <FileText size={14} />
                          Extract Original Source Document
                      </a>
                  </div>
              </div>
            ) : null}
          </div>
        </div>
        
        {/* Hidden Audio Element */}
        {audioUrl && (
            <audio 
                ref={audioRef} 
                src={audioUrl} 
                onEnded={() => setIsPlaying(false)}
            />
        )}
      </div>
    </div>
  );
};

export default AnalysisModal;
