import React, { useState, useEffect, useRef } from 'react';
import { jsPDF } from 'jspdf';
import { Article, ReporterStyle, VoiceID } from '../types';
import { 
  generateIntelBriefing, 
  generateAudioBriefing, 
  generateCinematicReportImage, 
  CinematicImageResult 
} from '../services/geminiService';
import { createWavBlob } from '../utils/audioUtils';
import { createUAPDossierDoc } from '../services/googleDocsService';
import { getAccessToken, googleSignIn } from '../services/authService';
import LoadingSpinner from './LoadingSpinner';
import { 
  X, 
  Play, 
  Square, 
  FileText, 
  Radio, 
  ShieldAlert, 
  Copy, 
  Download, 
  Check, 
  Camera, 
  Image as ImageIcon, 
  Film, 
  MapPin, 
  ExternalLink,
  CheckCircle2,
  FileCheck,
  FileDown,
  Sparkles,
  RefreshCw,
  Satellite
} from 'lucide-react';

interface AnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  article: Article;
  voiceId: VoiceID;
  apiKey: string;
  onOpenDocsArchive?: () => void;
}

const STYLES: ReporterStyle[] = ['Academic', 'Gonzo', 'Skeptic', 'Viral'];

const AnalysisModal: React.FC<AnalysisModalProps> = ({
  isOpen,
  onClose,
  article,
  voiceId,
  apiKey,
  onOpenDocsArchive,
}) => {
  const [activeStyle, setActiveStyle] = useState<ReporterStyle>('Academic');
  const [content, setContent] = useState<string | null>(null);
  
  // Nano Banana Pro Photographic Cinematic Image state
  const [cinematicResult, setCinematicResult] = useState<CinematicImageResult | null>(null);
  const [visualUrl, setVisualUrl] = useState<string | null>(null);
  const [isVisualGenerating, setIsVisualGenerating] = useState<boolean>(false);
  
  // Audio state
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isAudioGenerating, setIsAudioGenerating] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  
  // Operational states
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState<boolean>(false);
  const [isDownloadingMd, setIsDownloadingMd] = useState<boolean>(false);

  // Google Docs export states
  const [isExportingDoc, setIsExportingDoc] = useState<boolean>(false);
  const [exportedDocUrl, setExportedDocUrl] = useState<string | null>(null);
  const [docsExportError, setDocsExportError] = useState<string | null>(null);
  
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
    setCinematicResult(null);
    setCopied(false);

    try {
      // 1. Generate text intelligence report
      const text = await generateIntelBriefing(
        apiKey, 
        article.title, 
        article.description, 
        article.source, 
        style
      );
      setContent(text);

      // 2. Concurrently or immediately generate the Nano Banana Pro photographic cinematic image
      generateCinematicImage(text);

      // 3. Auto-generate audio after text is ready
      setIsAudioGenerating(true);
      try {
        const base64Audio = await generateAudioBriefing(apiKey, text, voiceId);
        const blob = createWavBlob(base64Audio);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
      } catch (audioErr) {
        console.error("Audio synthesis failed:", audioErr);
      } finally {
        setIsAudioGenerating(false);
      }
    } catch (err) {
      console.error("Intel generation failed:", err);
      setContent("Failed to decrypt intel packet.");
    } finally {
      setIsGenerating(false);
    }
  };

  const generateCinematicImage = async (reportText?: string) => {
    setIsVisualGenerating(true);
    try {
      const result = await generateCinematicReportImage(
        apiKey,
        article.title,
        article.description,
        reportText || content || undefined
      );
      setCinematicResult(result);
      setVisualUrl(result.imageUrl);
    } catch (err) {
      console.error("Cinematic image generation failed:", err);
    } finally {
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

  /**
   * Generates and downloads a clean, verified Markdown (.md) document.
   */
  const handleDownloadMarkdown = () => {
    if (!content) return;
    setIsDownloadingMd(true);

    const mdContent = `# TOP SECRET // UAP INTEL NEXUS DOSSIER
**CLASSIFICATION**: TOP SECRET // SI-TK // NOFORN
**SECURITY CLEARANCE**: LEVEL 5 // COMPARTMENTALIZED
**DATE**: ${new Date().toUTCString()}
**FILE REFERENCE**: ${article.id}
**REPORTING STYLE**: ${activeStyle} Mode
**VOICE SYNTHESIS**: ${voiceId}

---

## 1. SUBJECT IDENTIFICATION
- **Incident Headline**: ${article.title}
- **Declassified Source**: ${article.source}
- **Primary Reference URL**: ${article.url}
- **Geographic Sector**: ${article.location || 'Classified Coordinates'}
- **Latitude / Longitude**: ${article.coordinates ? `${article.coordinates.lat.toFixed(4)}°, ${article.coordinates.lng.toFixed(4)}°` : 'Pending Declassification'}
- **Proximity**: ${article.distanceKm ? `${article.distanceKm} km (${article.distanceMiles} miles)` : 'Calculating'}

---

## 2. EXECUTIVE RECONNAISSANCE SUMMARY
${article.description}

---

## 3. DECLASSIFIED FORENSIC BRIEFING
${content}

---

## 4. PHOTOGRAPHIC & OPTICAL SENSORY TELEMETRY
- **Reconnaissance Engine**: ${cinematicResult?.modelUsed || 'Nano Banana Pro (gemini-3-pro-image)'}
- **Sensor Parameters**: 35mm Optical Photographic Surveillance // Multi-Band Thermal
- **Telemetry Confidence**: 98.4%
- **Archival Custody**: UAP Intel Nexus Reconnaissance Grid
`;

    const blob = new Blob([mdContent], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `uap_dossier_${article.id}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setIsDownloadingMd(false);
  };

  /**
   * Generates and downloads an authentic, high-resolution PDF document using jsPDF.
   */
  const handleDownloadPdf = async () => {
    if (!content) return;
    setIsDownloadingPdf(true);

    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 15;
      const maxTextWidth = pageWidth - margin * 2;
      let y = 14;

      // 1. Top Classification Header Banner
      doc.setFillColor(15, 23, 42); // dark navy slate
      doc.rect(0, 0, pageWidth, 24, 'F');
      
      doc.setTextColor(239, 68, 68); // red warning
      doc.setFont('courier', 'bold');
      doc.setFontSize(10);
      doc.text('TOP SECRET // SI-TK // NOFORN', margin, 9);

      doc.setTextColor(74, 222, 128); // green phosphor
      doc.setFontSize(14);
      doc.text('UAP INTEL NEXUS — CLASSIFIED DOSSIER', margin, 18);

      y = 32;

      // 2. Metadata Box
      doc.setFillColor(241, 245, 249);
      doc.setDrawColor(203, 213, 225);
      doc.roundedRect(margin, y, maxTextWidth, 24, 2, 2, 'FD');

      doc.setTextColor(51, 65, 85);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.text(`FILE REF: ${article.id}`, margin + 4, y + 6);
      doc.text(`DATE: ${new Date().toISOString().slice(0, 10)}`, margin + 65, y + 6);
      doc.text(`SECTOR: ${article.location || 'Classified'}`, margin + 120, y + 6);

      doc.setFont('helvetica', 'normal');
      doc.text(`SOURCE: ${article.source}`, margin + 4, y + 13);
      if (article.coordinates) {
        doc.text(`COORDS: ${article.coordinates.lat.toFixed(4)}° N, ${article.coordinates.lng.toFixed(4)}° W`, margin + 65, y + 13);
      }
      doc.text(`STYLE: ${activeStyle} Mode`, margin + 120, y + 13);
      doc.text(`MODEL: ${cinematicResult?.modelUsed || 'Nano Banana Pro'}`, margin + 4, y + 20);

      y += 32;

      // 3. Document Headline
      doc.setTextColor(15, 23, 42);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      const splitTitle = doc.splitTextToSize(article.title.toUpperCase(), maxTextWidth);
      doc.text(splitTitle, margin, y);
      y += splitTitle.length * 6 + 2;

      // 4. Photographic Cinematic Image (if present, embed into PDF)
      if (visualUrl && visualUrl.startsWith('data:image')) {
        try {
          const imgHeight = 55;
          const imgWidth = maxTextWidth;
          const imgFormat = visualUrl.includes('image/png') ? 'PNG' : 'JPEG';
          doc.addImage(visualUrl, imgFormat, margin, y, imgWidth, imgHeight, undefined, 'FAST');
          y += imgHeight + 4;

          // Image caption
          doc.setFont('courier', 'italic');
          doc.setFontSize(7.5);
          doc.setTextColor(100, 116, 139);
          doc.text(`[OPTICAL SURVEILLANCE] ${cinematicResult?.modelUsed || 'Nano Banana Pro'} photographic reconstruction.`, margin, y);
          y += 6;
        } catch (imgErr) {
          console.warn('Could not embed image into PDF:', imgErr);
        }
      }

      // 5. Briefing Content (Formatted with auto-page breaks)
      doc.setTextColor(30, 41, 59);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9.5);

      const cleanContent = content.replace(/[*#]/g, '');
      const paragraphs = cleanContent.split('\n\n');

      for (const para of paragraphs) {
        if (!para.trim()) continue;
        const lines = doc.splitTextToSize(para.trim(), maxTextWidth);
        
        if (y + lines.length * 4.8 > 275) {
          doc.addPage();
          // Top classification marker on new page
          doc.setFont('courier', 'bold');
          doc.setFontSize(8);
          doc.setTextColor(239, 68, 68);
          doc.text('TOP SECRET // NOFORN (PAGE 2)', margin, 12);
          y = 20;
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(9.5);
          doc.setTextColor(30, 41, 59);
        }

        doc.text(lines, margin, y);
        y += lines.length * 4.8 + 4;
      }

      // 6. Security Footer
      const pageHeight = doc.internal.pageSize.getHeight();
      doc.setFont('courier', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(148, 163, 184);
      doc.text('UAP INTEL NEXUS // OFFICIAL DECLASSIFIED ARCHIVE // AJARN SPENCER', margin, pageHeight - 8);

      doc.save(`uap_dossier_${article.id}.pdf`);
    } catch (err) {
      console.error('PDF Generation failed:', err);
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  /**
   * Downloads the generated Nano Banana Pro photographic cinematic image.
   */
  const handleDownloadCinematicImage = () => {
    if (!visualUrl) return;
    const a = document.createElement('a');
    a.href = visualUrl;
    a.download = `uap_cinematic_photo_${article.id}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  /**
   * Downloads the existing satellite reconnaissance / target thumbnail image.
   */
  const handleDownloadSatReconImage = async () => {
    if (!article.thumbnail) return;
    try {
      const response = await fetch(article.thumbnail, { mode: 'cors' });
      if (response.ok) {
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = `uap_sat_recon_${article.id}.jpg`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(blobUrl);
        return;
      }
    } catch {
      // Continue to canvas fallback
    }

    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = img.naturalWidth || 800;
          canvas.height = img.naturalHeight || 600;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0);
            const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
            const a = document.createElement('a');
            a.href = dataUrl;
            a.download = `uap_sat_recon_${article.id}.jpg`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            return;
          }
        } catch {
          // Direct anchor fallback
        }
      };
      img.src = article.thumbnail;
    } catch {
      // Direct link
      const a = document.createElement('a');
      a.href = article.thumbnail;
      a.download = `uap_sat_recon_${article.id}.jpg`;
      a.target = '_blank';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const handleExportToGoogleDocs = async () => {
    if (!content) return;
    setIsExportingDoc(true);
    setDocsExportError(null);
    setExportedDocUrl(null);

    try {
      let token = await getAccessToken();
      if (!token) {
        const authResult = await googleSignIn();
        token = authResult?.accessToken || null;
      }

      if (!token) {
        throw new Error('Google authorization was cancelled or failed.');
      }

      const result = await createUAPDossierDoc(token, {
        article,
        briefingContent: content,
        reporterStyle: activeStyle,
        voiceId,
        coordinates: article.coordinates,
        visualReconstructionUrl: visualUrl,
      });

      setExportedDocUrl(result.documentUrl);
    } catch (err: any) {
      console.error('Google Docs export failed:', err);
      setDocsExportError(err.message || 'Export to Google Docs failed');
    } finally {
      setIsExportingDoc(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/95 flex justify-center items-center z-50 p-2 sm:p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-gray-900 border border-green-700/50 rounded-lg shadow-[0_0_50px_rgba(34,197,94,0.15)] w-full max-w-6xl max-h-[96vh] overflow-hidden flex flex-col font-mono"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gray-800/90 p-4 sm:p-5 border-b border-green-800/30 flex justify-between items-start">
          <div className="flex-1 pr-4">
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <ShieldAlert className="text-red-500 animate-pulse shrink-0" size={15} />
              <span className="text-[10px] font-bold text-red-500 uppercase tracking-[0.3em] border border-red-500/50 px-2.5 py-0.5 rounded-full">
                Top Secret // Classified // Level 5
              </span>
              <span className="text-[10px] text-green-500/80 uppercase">
                REF: {article.id}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-gray-100 tracking-tight leading-tight uppercase line-clamp-2">
              {article.title}
            </h2>
          </div>
          <button onClick={onClose} className="text-green-800 hover:text-red-500 transition-colors p-1 shrink-0" title="Close Dossier">
            <X size={28} />
          </button>
        </div>

        {/* Action Toolbar */}
        <div className="bg-gray-900/80 p-3 sm:p-4 border-b border-green-900/30 flex flex-wrap gap-3 items-center justify-between">
          {/* Persona Selectors */}
          <div className="flex flex-wrap gap-1">
            {STYLES.map(style => (
              <button
                key={style}
                onClick={() => handleGenerate(style)}
                disabled={isGenerating}
                className={`px-3 py-1.5 rounded text-[10px] font-bold uppercase tracking-widest transition-all
                  ${activeStyle === style 
                    ? 'bg-green-600 text-black shadow-[0_0_15px_rgba(34,197,94,0.4)]' 
                    : 'bg-gray-800/50 text-green-800 hover:text-green-400 hover:bg-gray-800'}
                `}
              >
                {style}
              </button>
            ))}
          </div>
          
          {/* Export & Download Hub */}
          <div className="flex flex-wrap items-center gap-2">
            {content && !isGenerating && (
              <>
                {/* Download Markdown */}
                <button
                  onClick={handleDownloadMarkdown}
                  disabled={isDownloadingMd}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800/90 text-green-400 border border-green-700/60 rounded hover:bg-green-500 hover:text-black transition-all text-[10px] font-bold uppercase tracking-wider shadow-sm"
                  title="Download Raw Markdown (.md) Dossier"
                >
                  <FileDown size={13} />
                  <span>Download .MD</span>
                </button>

                {/* Download PDF */}
                <button
                  onClick={handleDownloadPdf}
                  disabled={isDownloadingPdf}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-green-950/80 text-green-300 border border-green-500/60 rounded hover:bg-green-500 hover:text-black transition-all text-[10px] font-bold uppercase tracking-wider shadow-[0_0_10px_rgba(34,197,94,0.2)]"
                  title="Generate & Download Formatted Classified PDF"
                >
                  <Download size={13} className={isDownloadingPdf ? 'animate-bounce' : ''} />
                  <span>{isDownloadingPdf ? 'Compiling PDF...' : 'Download .PDF'}</span>
                </button>

                {/* Copy Text */}
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800/80 text-green-500 border border-green-800/50 rounded hover:bg-green-500 hover:text-black transition-all text-[10px] font-bold uppercase tracking-wider"
                  title="Copy Report Content to Clipboard"
                >
                  {copied ? <Check size={13} /> : <Copy size={13} />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>

                {/* Google Docs Export */}
                {!exportedDocUrl ? (
                  <button
                    onClick={handleExportToGoogleDocs}
                    disabled={isExportingDoc}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-950/80 text-blue-400 border border-blue-600/60 rounded hover:bg-blue-600 hover:text-black transition-all text-[10px] font-bold uppercase tracking-wider shadow-[0_0_10px_rgba(59,130,246,0.2)] disabled:opacity-50"
                    title="Export this declassified dossier to a formatted Google Doc"
                  >
                    <FileText size={13} />
                    <span>{isExportingDoc ? 'Exporting...' : 'Google Docs'}</span>
                  </button>
                ) : (
                  <a
                    href={exportedDocUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500 text-black rounded text-[10px] font-bold uppercase tracking-wider shadow-[0_0_15px_rgba(34,197,94,0.4)] animate-pulse hover:bg-green-400 transition-all"
                  >
                    <FileCheck size={13} />
                    <span>Open Doc</span>
                    <ExternalLink size={11} />
                  </a>
                )}
              </>
            )}
          </div>
        </div>

        {/* Audio Player Strip */}
        <div className="bg-black/60 px-4 py-2 border-b border-green-900/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Radio size={14} className="text-green-500 animate-pulse" />
            <span className="text-[10px] text-green-600 uppercase font-bold tracking-widest">
              Audio Telemetry // Voice ID: <span className="text-green-400">{voiceId}</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            {audioUrl && (
              <div className="flex items-center gap-2">
                <button 
                  onClick={togglePlayback}
                  className="flex items-center gap-1.5 text-xs bg-green-500 text-black px-3 py-1 rounded font-bold uppercase tracking-wider hover:bg-green-400 transition-colors"
                >
                  {isPlaying ? <Square size={12} fill="black" /> : <Play size={12} fill="black" />}
                  <span>{isPlaying ? 'Pause' : 'Play Audio'}</span>
                </button>
                <button
                  onClick={handleDownloadAudio}
                  className="p-1 text-green-500 hover:text-green-300 border border-green-800 rounded"
                  title="Download Audio Briefing (.wav)"
                >
                  <Download size={13} />
                </button>
              </div>
            )}
            {isAudioGenerating && (
              <span className="text-[10px] text-green-500/70 animate-pulse font-mono">
                SYNTHESIZING JOURNEY VOICE...
              </span>
            )}
          </div>
        </div>

        {/* Google Docs Export Error Banner */}
        {docsExportError && (
          <div className="bg-red-950/80 px-4 py-2 border-b border-red-800 text-[11px] text-red-300 font-mono flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert size={14} className="text-red-400" />
              <span>Google Docs Export: {docsExportError}</span>
            </div>
            <button 
              onClick={() => setDocsExportError(null)}
              className="text-red-400 hover:text-white text-xs px-1"
            >
              ×
            </button>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-black/20 flex flex-col lg:flex-row">
          
          {/* Imagery & Sensor Deck (Left Side) */}
          <div className="lg:w-5/12 border-b lg:border-b-0 lg:border-r border-green-900/30 bg-black/40 p-4 sm:p-5 flex flex-col space-y-5">
            
            {/* 1. Nano Banana Pro Photographic Cinematic Image Box */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles size={14} className="text-emerald-400 animate-pulse" />
                  <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-widest">
                    Nano Banana Pro Cinematic Photo
                  </h3>
                </div>
                {cinematicResult?.modelUsed && (
                  <span className="text-[8px] bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 px-2 py-0.5 rounded truncate max-w-[170px]">
                    {cinematicResult.modelUsed}
                  </span>
                )}
              </div>

              <div className="relative aspect-video bg-gray-950 rounded-lg border border-emerald-700/60 overflow-hidden flex items-center justify-center group shadow-xl">
                {isVisualGenerating ? (
                  <div className="flex flex-col items-center p-6 text-center">
                    <LoadingSpinner />
                    <span className="text-[10px] text-emerald-400 mt-3 font-mono animate-pulse uppercase tracking-wider">
                      Rendering Cinematic Photo (Nano Banana Pro)...
                    </span>
                    <p className="text-[9px] text-emerald-700/80 mt-1 max-w-xs font-sans">
                      Synthesizing 35mm optical surveillance photograph matching report telemetry...
                    </p>
                  </div>
                ) : visualUrl ? (
                  <>
                    <img 
                      src={visualUrl} 
                      alt="Nano Banana Pro Cinematic Reconstruction" 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                    />
                    <div className="absolute inset-0 pointer-events-none border border-emerald-500/20 m-2"></div>
                    <div className="absolute top-2 left-2 text-[8px] font-mono text-emerald-300 uppercase bg-black/80 px-2 py-0.5 rounded border border-emerald-800/60">
                      CINEMATIC_RECON // 35MM OPTICAL
                    </div>

                    {/* Download Photographic Image Button Overlay */}
                    <div className="absolute bottom-2 right-2 flex items-center gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={handleDownloadCinematicImage}
                        className="px-2.5 py-1 bg-black/85 hover:bg-emerald-500 hover:text-black text-emerald-400 border border-emerald-600 rounded text-[9px] font-bold uppercase tracking-wider transition-all flex items-center gap-1 shadow-lg"
                        title="Download Nano Banana Pro Photographic Image"
                      >
                        <Download size={11} />
                        <span>Download Photo</span>
                      </button>
                      <button
                        onClick={() => generateCinematicImage(content || undefined)}
                        className="p-1 bg-black/85 hover:bg-emerald-500 hover:text-black text-emerald-400 border border-emerald-600 rounded text-[9px] transition-all"
                        title="Regenerate Image with Nano Banana Pro"
                      >
                        <RefreshCw size={11} />
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="text-center p-6">
                    <ImageIcon size={32} className="mx-auto text-emerald-900 mb-2 opacity-30" />
                    <p className="text-[10px] text-emerald-700 font-mono uppercase">Photographic Imagery Calibrating...</p>
                  </div>
                )}
              </div>
            </div>

            {/* 2. Existing Satellite Reconnaissance Sighting Asset */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Satellite size={14} className="text-blue-400" />
                  <h3 className="text-xs font-bold text-blue-400 uppercase tracking-widest">
                    Satellite Reconnaissance Imagery
                  </h3>
                </div>
                <span className="text-[8px] text-blue-500 uppercase bg-blue-950/60 px-2 py-0.5 rounded border border-blue-900/60">
                  DECLASS SATELLITE
                </span>
              </div>

              <div className="relative aspect-[16/8] bg-gray-950 rounded-lg border border-blue-900/60 overflow-hidden flex items-center justify-center group shadow-md">
                {article.thumbnail ? (
                  <>
                    <img 
                      src={article.thumbnail} 
                      alt="Satellite Reconnaissance" 
                      className="w-full h-full object-cover filter contrast-125 brightness-90 group-hover:filter-none transition-all duration-500" 
                    />
                    <div className="absolute inset-0 pointer-events-none border border-blue-500/20 m-2"></div>
                    <div className="absolute top-2 left-2 text-[8px] font-mono text-blue-300 uppercase bg-black/80 px-2 py-0.5 rounded border border-blue-800/60">
                      SAT_CAPTURE_GRID
                    </div>

                    {/* Download Sat Recon Image Button */}
                    <div className="absolute bottom-2 right-2 opacity-90 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={handleDownloadSatReconImage}
                        className="px-2.5 py-1 bg-black/85 hover:bg-blue-500 hover:text-black text-blue-400 border border-blue-600 rounded text-[9px] font-bold uppercase tracking-wider transition-all flex items-center gap-1 shadow-lg"
                        title="Download Existing Satellite Recon Image"
                      >
                        <Download size={11} />
                        <span>Download Sat Recon</span>
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="text-center p-4">
                    <p className="text-[10px] text-blue-800 font-mono uppercase">Satellite Feed Offline</p>
                  </div>
                )}
              </div>
            </div>

            {/* 3. Telemetry Flight & Target Details */}
            <div className="p-3.5 bg-green-950/20 border border-green-900/40 rounded-lg space-y-2">
              <div className="text-[10px] text-green-500 uppercase font-bold tracking-wider flex items-center justify-between border-b border-green-900/30 pb-1.5">
                <span className="flex items-center gap-1">
                  <MapPin size={11} className="text-green-400" />
                  Target Telemetry
                </span>
                <span className="text-[9px] text-green-700">{article.source}</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[9px]">
                <div>
                  <span className="text-green-700 block">SECTOR:</span>
                  <span className="text-green-300 font-bold truncate block">{article.location || 'Classified'}</span>
                </div>
                <div>
                  <span className="text-green-700 block">COORDINATES:</span>
                  <span className="text-green-300 font-bold block">
                    {article.coordinates ? `${article.coordinates.lat.toFixed(3)}°, ${article.coordinates.lng.toFixed(3)}°` : 'Pending'}
                  </span>
                </div>
                <div>
                  <span className="text-green-700 block">PROXIMITY:</span>
                  <span className="text-green-300 font-bold block">
                    {article.distanceKm ? `${article.distanceKm} km (${article.distanceMiles} mi)` : 'Live Radar'}
                  </span>
                </div>
                <div>
                  <span className="text-green-700 block">CONFIDENCE:</span>
                  <span className="text-emerald-400 font-bold block">98.4% (Multi-Sensor)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Report Briefing Text Deck (Right Side) */}
          <div className="lg:w-7/12 p-6 sm:p-8 relative">
            {isGenerating ? (
              <div className="flex flex-col items-center justify-center h-full py-24 text-center">
                <LoadingSpinner />
                <p className="mt-4 text-green-500 font-mono animate-pulse text-xs tracking-widest">
                  DECRYPTING INTELLIGENCE PACKET...
                </p>
                <p className="text-[10px] text-green-700 mt-1 max-w-sm font-sans">
                  Processing declassified sensor telemetry through {activeStyle} analytical persona...
                </p>
              </div>
            ) : content ? (
              <div className="prose prose-invert prose-green max-w-none">
                <div className="font-mono text-[10px] text-green-700 mb-6 pb-2 border-b border-green-900/30 flex justify-between uppercase tracking-widest">
                  <span>FILE_REF: {article.id}</span>
                  <span>SIG_TYPE: {activeStyle} MODE</span>
                </div>

                <div className="whitespace-pre-wrap leading-relaxed text-gray-200 font-sans text-sm sm:text-base">
                  {content}
                </div>

                <div className="mt-10 pt-6 border-t border-dashed border-green-900/40 flex flex-wrap items-center justify-between gap-3">
                  <a 
                    href={article.url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="inline-flex items-center gap-2 text-green-400 hover:text-green-200 text-[10px] font-bold font-mono uppercase tracking-widest transition-colors bg-green-950/40 px-3.5 py-2 rounded border border-green-800/60"
                  >
                    <FileText size={13} />
                    <span>Extract Original Source Sighting</span>
                    <ExternalLink size={11} />
                  </a>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleDownloadMarkdown}
                      className="px-3 py-1.5 bg-gray-800 hover:bg-green-700 text-green-300 hover:text-white rounded text-[10px] uppercase font-bold tracking-wider transition-colors flex items-center gap-1.5"
                    >
                      <FileDown size={12} />
                      <span>.MD</span>
                    </button>
                    <button
                      onClick={handleDownloadPdf}
                      className="px-3 py-1.5 bg-green-600 hover:bg-green-500 text-black rounded text-[10px] uppercase font-bold tracking-wider transition-colors flex items-center gap-1.5 shadow"
                    >
                      <Download size={12} />
                      <span>.PDF</span>
                    </button>
                  </div>
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
