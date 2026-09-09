
import React from 'react';

const AjarnSpencerCredit: React.FC = () => {
  return (
    <footer className="py-4 mt-8 text-center text-gray-500 text-xs border-t border-gray-800">
      <p>
        Author: Ajarn Spencer Littlewood
      </p>
      <div className="flex justify-center items-center gap-4 mt-1">
        <a href="https://www.github.com/AjarnSpencer" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-400 transition-colors">
          GitHub
        </a>
        <span>&bull;</span>
        <a href="https://www.ajarnspencer.com" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-400 transition-colors">
          Homepage
        </a>
      </div>
    </footer>
  );
};

export default AjarnSpencerCredit;
