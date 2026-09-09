
import React from 'react';
import type { Article } from '../types';
import { Eye } from 'lucide-react';
import IntelIcon from './IntelIcon';

interface ArticleCardProps {
  article: Article;
  onAnalyze: (article: Article) => void;
}

const ArticleCard: React.FC<ArticleCardProps> = ({ article, onAnalyze }) => {
  return (
    <div className="bg-gray-800/40 border border-green-800/30 rounded-lg overflow-hidden backdrop-blur-sm hover:border-green-500/50 transition-all duration-300 group flex flex-col h-full shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
      {/* Icon Area instead of Thumbnail */}
      <div className="relative h-48 overflow-hidden border-b border-green-900/30">
        <IntelIcon title={article.title} description={article.description} />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-gray-900 to-transparent p-2 z-20">
             <span className="inline-block bg-black/80 text-green-400 text-[10px] px-2 py-0.5 rounded border border-green-900/50 uppercase font-mono tracking-widest">
                SIG_SOURCE: {article.source}
             </span>
        </div>
      </div>
      
      <div className="p-5 flex flex-col flex-grow relative">
        <h3 className="text-lg font-bold text-gray-200 mb-2 leading-tight group-hover:text-green-400 transition-colors font-mono">
          {article.title}
        </h3>
        <p className="text-green-100/40 text-xs mb-4 line-clamp-3 font-mono leading-relaxed">
          {article.description}
        </p>
        
        <div className="mt-auto pt-4 border-t border-green-900/20">
          <button
            onClick={() => onAnalyze(article)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-900/10 text-green-500 font-bold rounded hover:bg-green-500 hover:text-black transition-all duration-300 uppercase text-xs tracking-[0.2em] border border-green-900/50 hover:border-green-400 shadow-[inset_0_0_10px_rgba(34,197,94,0.05)]"
          >
            <Eye size={14} />
            Analyze Signal
          </button>
        </div>
      </div>
    </div>
  );
};

export default ArticleCard;
