
import React from 'react';
import { 
  Shield, 
  Target, 
  Eye, 
  Activity, 
  Gavel, 
  Plane, 
  Zap, 
  Radar, 
  FileText,
  Search,
  AlertTriangle,
  Globe
} from 'lucide-react';

interface IntelIconProps {
  title: string;
  description: string;
}

const IntelIcon: React.FC<IntelIconProps> = ({ title, description }) => {
  const fullText = (title + ' ' + description).toLowerCase();

  const getIcon = () => {
    if (fullText.includes('pentagon') || fullText.includes('aaro') || fullText.includes('government')) return Shield;
    if (fullText.includes('pilot') || fullText.includes('aircraft') || fullText.includes('aviation')) return Plane;
    if (fullText.includes('orb') || fullText.includes('sphere') || fullText.includes('object')) return Target;
    if (fullText.includes('radar') || fullText.includes('sensor') || fullText.includes('signal')) return Radar;
    if (fullText.includes('law') || fullText.includes('legal') || fullText.includes('congress')) return Gavel;
    if (fullText.includes('sighting') || fullText.includes('witness') || fullText.includes('look')) return Eye;
    if (fullText.includes('energy') || fullText.includes('plasma') || fullText.includes('power')) return Zap;
    if (fullText.includes('data') || fullText.includes('analysis') || fullText.includes('research')) return Activity;
    if (fullText.includes('report') || fullText.includes('file') || fullText.includes('dossier')) return FileText;
    if (fullText.includes('investigat')) return Search;
    if (fullText.includes('alert') || fullText.includes('warn') || fullText.includes('threat')) return AlertTriangle;
    return Globe;
  };

  const IconComponent = getIcon();

  return (
    <div className="relative flex items-center justify-center w-full h-full bg-black/40 group-hover:bg-black/20 transition-colors">
      {/* Background Pulse */}
      <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
        <div className="w-32 h-32 border border-green-500/10 rounded-full animate-ping"></div>
      </div>
      
      {/* HUD Lines */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-1/2 left-0 w-full h-[1px] bg-green-500/30"></div>
        <div className="absolute left-1/2 top-0 h-full w-[1px] bg-green-500/30"></div>
        <div className="absolute top-0 left-0 w-full h-full border border-green-500/10 grid grid-cols-4 grid-rows-4">
          {[...Array(16)].map((_, i) => <div key={i} className="border border-green-500/5"></div>)}
        </div>
      </div>

      {/* Main Icon */}
      <div className="relative">
        <IconComponent size={64} className="text-green-500 filter drop-shadow-[0_0_8px_rgba(34,197,94,0.5)] group-hover:scale-110 transition-transform duration-500" />
        <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 animate-pulse rounded-full"></div>
      </div>

      {/* Pseudo-Coordinates */}
      <div className="absolute bottom-2 right-2 font-mono text-[8px] text-green-700 uppercase tracking-tighter opacity-50">
        LAT: { (Math.random() * 90).toFixed(4) }<br/>
        LNG: { (Math.random() * 180).toFixed(4) }
      </div>
    </div>
  );
};

export default IntelIcon;
