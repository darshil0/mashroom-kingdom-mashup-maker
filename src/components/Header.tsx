import React from 'react';
import { Star, Settings, Coins } from 'lucide-react';
import { GameMode } from '../types';

interface HeaderProps {
  mode: GameMode;
  coins: number;
  score: number;
  onExit: () => void;
}

export const Header: React.FC<HeaderProps> = ({ mode, coins, score, onExit }) => {
  const [health, setHealth] = React.useState<{ status: string; ai_module: boolean } | null>(null);

  React.useEffect(() => {
    fetch('/api/health')
      .then(res => res.json())
      .then(data => setHealth(data))
      .catch(() => setHealth({ status: "error", ai_module: false }));
  }, []);

  return (
    <header id="main-header" className="p-4 border-b border-white/10 flex justify-between items-center bg-black/40 backdrop-blur-xl sticky top-0 z-50">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center shadow-[0_0_20px_rgba(220,38,38,0.3)]">
          <Star className="text-white fill-white" size={24} />
        </div>
        <div>
          <h1 className="text-xl font-black tracking-tighter uppercase italic leading-none">Kingdom Maker</h1>
          <p className="text-[9px] text-white/40 font-black uppercase tracking-[0.3em] mt-1">
            Mashup Engine v1.7.0 // {health?.status === 'healthy' ? (health.ai_module ? 'SYS_READY' : 'AI_OFFLINE') : 'SYS_ERROR'}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {mode !== 'MENU' && (
           <button 
            id="btn-terminal-exit"
            onClick={onExit}
            className="px-5 py-2 bg-white/5 hover:bg-white/10 rounded-full text-[10px] font-black tracking-widest transition-all border border-white/10 flex items-center gap-2 group"
           >
             <Settings size={12} className="group-hover:rotate-180 transition-transform duration-500" />
             TERMINAL_EXIT
           </button>
        )}
        <div id="stats-display" className="flex bg-white/5 rounded-full p-1 border border-white/10 divide-x divide-white/10 overflow-hidden shadow-inner">
          <div className="px-5 py-2 flex items-center gap-2 hover:bg-white/5 transition-colors cursor-default group">
            <Coins size={14} className="text-yellow-400 group-hover:scale-125 transition-transform" />
            <div className="flex flex-col">
              <span className="text-[7px] font-black text-white/20 uppercase tracking-widest leading-none">Resources</span>
              <span className="text-xs font-black text-yellow-400 font-mono tracking-tighter">{coins.toString().padStart(3, '0')}</span>
            </div>
          </div>
          <div className="px-5 py-2 flex items-center gap-2 hover:bg-white/5 transition-colors cursor-default group">
            <Star size={14} className="text-blue-400 group-hover:rotate-45 transition-transform" />
            <div className="flex flex-col">
              <span className="text-[7px] font-black text-white/20 uppercase tracking-widest leading-none">Score_Link</span>
              <span className="text-xs font-black text-blue-400 font-mono tracking-tighter">{score.toString().padStart(6, '0')}</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
