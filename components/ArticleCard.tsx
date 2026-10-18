import React from 'react';
import type { Article } from '../types';
import { Eye, MapPin, Globe, Shield, Calendar, Clock, AlertTriangle } from 'lucide-react';
import IntelIcon from './IntelIcon';

interface ArticleCardProps {
  article: Article;
  onAnalyze: (article: Article) => void;
}

const getReportTypeBadge = (type?: string) => {
  switch (type) {
    case 'Official / Military':
      return 'bg-emerald-950/90 text-emerald-300 border-emerald-700/60';
    case 'Aviation / Pilot Network':
      return 'bg-cyan-950/90 text-cyan-300 border-cyan-700/60';
    case 'Scientific / Observatory':
      return 'bg-purple-950/90 text-purple-300 border-purple-700/60';
    case 'Eyewitness Database':
      return 'bg-amber-950/90 text-amber-300 border-amber-700/60';
    default:
      return 'bg-gray-900/90 text-gray-300 border-gray-700/60';
  }
};

const getRegionColor = (region?: string) => {
  switch (region) {
    case 'North America':
      return 'text-sky-400 border-sky-800/50 bg-sky-950/40';
    case 'Europe':
      return 'text-indigo-400 border-indigo-800/50 bg-indigo-950/40';
    case 'Latin America':
      return 'text-emerald-400 border-emerald-800/50 bg-emerald-950/40';
    case 'Asia':
      return 'text-rose-400 border-rose-800/50 bg-rose-950/40';
    case 'Oceania':
      return 'text-teal-400 border-teal-800/50 bg-teal-950/40';
    case 'Africa & Middle East':
      return 'text-amber-400 border-amber-800/50 bg-amber-950/40';
    default:
      return 'text-green-400 border-green-800/50 bg-green-950/40';
  }
};

const formatDateOnly = (dateStr?: string) => {
  if (!dateStr) return null;
  try {
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      return d.toISOString().split('T')[0];
    }
    return dateStr.slice(0, 10);
  } catch {
    return dateStr;
  }
};

const ArticleCard: React.FC<ArticleCardProps> = ({ article, onAnalyze }) => {
  const publishedDate = formatDateOnly(article.publishedAt);
  const observedDate = formatDateOnly(article.observedAt);
  const isHistoricalObservation = publishedDate && observedDate && publishedDate !== observedDate;

  return (
    <div className="bg-gray-800/40 border border-green-800/30 rounded-lg overflow-hidden backdrop-blur-sm hover:border-green-500/50 transition-all duration-300 group flex flex-col h-full shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
      {/* Icon Area */}
      <div className="relative h-44 overflow-hidden border-b border-green-900/30">
        <IntelIcon title={article.title} description={article.description} />
        
        {/* Source Region & Evidence Tier Floating Top Badges */}
        <div className="absolute top-2 left-2 right-2 flex items-center justify-between gap-1 z-20">
          {article.sourceRegion && (
            <span className={`inline-flex items-center gap-1 text-[9px] px-2 py-0.5 rounded border uppercase font-mono tracking-wider backdrop-blur-md ${getRegionColor(article.sourceRegion)}`}>
              <Globe size={9} />
              {article.sourceRegion}
            </span>
          )}
          {article.evidenceTier && (
            <span className="inline-flex items-center gap-1 bg-black/85 text-emerald-400 text-[8px] px-1.5 py-0.5 rounded border border-emerald-800/60 uppercase font-mono tracking-wider backdrop-blur-md">
              <Shield size={9} className="text-emerald-500" />
              {article.evidenceTier}
            </span>
          )}
        </div>

        {/* Source & Location Bottom Ribbon */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-gray-950 via-gray-900/90 to-transparent p-2 z-20 flex items-center justify-between">
          <span className="inline-block bg-black/90 text-green-400 text-[9px] px-2 py-0.5 rounded border border-green-900/60 uppercase font-mono tracking-widest truncate max-w-[160px]">
            {article.source}
          </span>
          {article.location && (
            <span className="inline-flex items-center gap-1 bg-green-950/80 text-green-300 text-[8px] px-1.5 py-0.5 rounded border border-green-800/60 uppercase font-mono truncate max-w-[130px]">
              <MapPin size={9} className="text-green-500 flex-shrink-0" />
              {article.location.split(',')[0]}
            </span>
          )}
        </div>
      </div>
      
      <div className="p-4 flex flex-col flex-grow relative">
        {/* Report Type & Original Language */}
        <div className="flex flex-wrap items-center gap-1.5 mb-2">
          {article.reportType && (
            <span className={`text-[8px] uppercase tracking-wider font-mono px-1.5 py-0.5 rounded border ${getReportTypeBadge(article.reportType)}`}>
              {article.reportType}
            </span>
          )}
          {article.originalLanguage && article.originalLanguage !== 'English' && (
            <span className="text-[8px] uppercase tracking-wider font-mono px-1.5 py-0.5 rounded border border-cyan-800/60 bg-cyan-950/40 text-cyan-300">
              Orig: {article.originalLanguage}
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="text-base font-bold text-gray-200 mb-1.5 leading-snug group-hover:text-green-400 transition-colors font-mono">
          {article.title}
        </h3>

        {/* Original Native Headline if foreign */}
        {article.originalTitle && article.originalTitle !== article.title && (
          <p className="text-xs text-green-400/60 italic mb-2 line-clamp-1 font-mono">
            «{article.originalTitle}»
          </p>
        )}

        {/* Date Matrix: Observed vs Published */}
        <div className="mb-3 bg-black/40 rounded p-1.5 border border-green-950 flex flex-wrap items-center justify-between gap-1 text-[9px] font-mono">
          {publishedDate && (
            <div className="flex items-center gap-1 text-green-400/80" title="Date report was published / recorded">
              <Clock size={10} className="text-green-500" />
              <span className="text-green-700">PUB:</span>
              <span>{publishedDate}</span>
            </div>
          )}
          {observedDate && (
            <div className="flex items-center gap-1 text-amber-400/90" title="Original date of physical sighting">
              <Calendar size={10} className="text-amber-500" />
              <span className="text-amber-700">OBS:</span>
              <span>{observedDate}</span>
              {isHistoricalObservation && (
                <span className="text-[8px] bg-amber-950/80 text-amber-300 px-1 rounded border border-amber-800/40" title="Historical incident newly indexed">
                  ARCHIVE
                </span>
              )}
            </div>
          )}
        </div>

        <p className="text-green-100/40 text-xs mb-3 line-clamp-2 font-mono leading-relaxed">
          {article.description}
        </p>

        {article.location && (
          <div className="mb-3 text-[9px] text-green-600 font-mono flex items-center gap-1 truncate">
            <span className="text-green-800 uppercase font-bold">GRID:</span>
            <span className="text-green-400/90 truncate">{article.location}</span>
          </div>
        )}
        
        <div className="mt-auto pt-3 border-t border-green-900/20 flex items-center gap-2">
          <button
            onClick={() => onAnalyze(article)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-green-900/20 text-green-400 font-bold rounded hover:bg-green-500 hover:text-black transition-all duration-300 uppercase text-xs tracking-[0.2em] border border-green-900/50 hover:border-green-400 shadow-[inset_0_0_10px_rgba(34,197,94,0.05)] font-mono cursor-pointer"
          >
            <Eye size={13} />
            Access Dossier
          </button>
        </div>
      </div>
    </div>
  );
};

export default ArticleCard;

