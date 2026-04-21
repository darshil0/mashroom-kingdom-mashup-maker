import React from 'react';
import { motion } from 'motion/react';
import { 
  Play, Edit2, Wand2, RefreshCw, Trophy, 
  AlertCircle, User, Settings, Check 
} from 'lucide-react';
import { CharacterType, GameMode } from '../types';
import { CHARACTERS } from '../constants';

interface MainMenuProps {
  character: CharacterType;
  setCharacter: (char: CharacterType) => void;
  handleStartGame: () => void;
  startCampaign: () => void;
  setMode: (mode: GameMode) => void;
  shareCode: string;
  setShareCode: (code: string) => void;
  handleLoadCode: () => void;
  handleGenerateLevel: () => void;
  isGenerating: boolean;
  prompt: string;
  setPrompt: (prompt: string) => void;
  generationError: string | null;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  character,
  setCharacter,
  handleStartGame,
  startCampaign,
  setMode,
  shareCode,
  setShareCode,
  handleLoadCode,
  handleGenerateLevel,
  isGenerating,
  prompt,
  setPrompt,
  generationError
}) => {
  return (
    <motion.div 
      key="menu"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="grid grid-cols-1 lg:grid-cols-12 gap-12 pt-6"
    >
      <div className="lg:col-span-7 space-y-12">
        <div id="main-hero-text" className="space-y-6">
           <div className="inline-flex px-3 py-1 bg-red-600/10 border border-red-500/20 rounded-full">
              <span className="text-[9px] font-black text-red-500 uppercase tracking-widest">v1.7.4 Stable // Auth: Level 4</span>
           </div>
          <h2 className="text-8xl font-black italic tracking-tighter leading-[0.85] uppercase">
            Build. <br />
            <span className="text-red-600">Play.</span> <br />
            Remix.
          </h2>
          <p className="text-white/40 text-base leading-relaxed max-w-lg font-medium border-l-2 border-white/10 pl-6">
            A high-performance retro platforming engine powered by Gemini AI. Design infinite worlds, share them with the sector, and master the mashup.
          </p>
        </div>

        <div id="character-selector" className="space-y-6">
           <div className="flex justify-between items-end border-b border-white/5 pb-2">
             <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em]">Unit Identification</label>
             <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">Active: {CHARACTERS[character].name}</span>
           </div>
           <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
             {(Object.keys(CHARACTERS) as CharacterType[]).map((char, i) => (
               <button
                 id={`btn-hero-${char}`}
                 key={char}
                 onClick={() => setCharacter(char)}
                 className={`relative overflow-hidden p-6 rounded-3xl border transition-all duration-300 flex flex-col items-start gap-4 group ${
                   character === char 
                   ? 'bg-white/10 border-white shadow-[0_0_40px_rgba(255,255,255,0.1)] -translate-y-1' 
                   : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/20'
                 }`}
               >
                 <div 
                   className="w-12 h-12 rounded-2xl shadow-inner transition-transform group-hover:scale-110 flex items-center justify-center" 
                   style={{ backgroundColor: CHARACTERS[char].color }} 
                 >
                    <User size={24} className="text-white/30" />
                 </div>
                 <div className="space-y-1 text-left">
                    <span className="block text-xs font-black uppercase tracking-tight">{CHARACTERS[char].name}</span>
                    <span className="block text-[8px] font-bold text-white/30 uppercase tracking-widest">MK_UNIT_0{(i + 1)}</span>
                 </div>
                 
                 {character === char && (
                   <motion.div layoutId="selection-badge" className="absolute top-4 right-4 w-6 h-6 bg-red-600 rounded-full flex items-center justify-center shadow-lg border-2 border-black">
                     <Check size={12} className="text-white font-black" />
                   </motion.div>
                 )}
                 <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
               </button>
             ))}
           </div>
        </div>

        <div id="main-actions" className="flex flex-wrap gap-4 pt-4">
          <button 
            id="btn-play-quick"
            onClick={handleStartGame}
            className="group relative px-10 py-5 bg-red-600 hover:bg-red-500 rounded-[28px] flex items-center gap-4 transition-all transform active:scale-95 shadow-[0_20px_40px_rgba(220,38,38,0.2)]"
          >
            <Play className="fill-white" size={24} />
            <span className="text-2xl font-black uppercase italic tracking-tighter">Initiate_QuickPlay</span>
            <div className="absolute inset-0 bg-red-400/20 blur-xl rounded-[28px] group-hover:blur-2xl transition-all -z-10" />
          </button>
          <button 
            id="btn-play-campaign"
            onClick={startCampaign}
            className="px-10 py-5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-[28px] flex items-center gap-4 transition-all"
          >
            <Trophy className="text-yellow-500" size={24} />
            <span className="text-2xl font-black uppercase italic tracking-tighter">Campaign_Mode</span>
          </button>
          <button 
            id="btn-open-editor"
            onClick={() => setMode('EDITOR')}
            className="px-10 py-5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-[28px] flex items-center gap-4 transition-all"
          >
            <Edit2 className="text-white/60" size={24} />
            <span className="text-2xl font-black uppercase italic tracking-tighter text-white/80">Editor</span>
          </button>
        </div>

        <div className="pt-8 border-t border-white/5 space-y-6">
           <div className="flex items-center gap-4">
              <div className="h-px flex-1 bg-white/5" />
              <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.5em]">Network Loading</span>
              <div className="h-px flex-1 bg-white/5" />
           </div>
           <div className="flex gap-3">
             <div className="relative flex-1 group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20">
                   <Settings size={14} />
                </div>
                <input 
                  type="text"
                  value={shareCode}
                  onChange={(e) => setShareCode(e.target.value)}
                  placeholder="INPUT_LINK_CODE..."
                  className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-xs font-black placeholder:text-white/10 focus:outline-none focus:border-white/30 transition-all group-hover:bg-white/10"
                />
             </div>
             <button 
               onClick={handleLoadCode}
               className="px-10 py-4 bg-white text-black rounded-2xl font-black uppercase text-xs hover:bg-white/90 transition-all flex items-center gap-2"
             >
               <RefreshCw size={14} />
               SYNC
             </button>
           </div>
        </div>
      </div>

      <div className="lg:col-span-5">
        <div className="glass-panel tech-border rounded-[48px] p-8 space-y-8 h-full flex flex-col">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-600/20 rounded-2xl">
                <Wand2 className="text-blue-500" size={24} />
              </div>
              <div>
                <h3 className="text-xl font-black uppercase italic leading-none">AI Forge</h3>
                <p className="text-[9px] font-black text-blue-500 uppercase tracking-widest mt-1">Prompted Construction</p>
              </div>
            </div>
            <div className="text-[9px] font-black text-white/20 uppercase tracking-widest bg-white/5 px-3 py-1 rounded-full">
               GMNI_MODEL_R3
            </div>
          </div>

          <div className="flex-1 space-y-4">
             <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] block">Design Specification</label>
             <textarea 
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="DEFINE ARCHITECTURE... e.g. 'A deep sea cavern with golden pipes and spikes'"
                className="w-full h-64 bg-black/40 border border-white/10 rounded-[32px] p-6 text-sm font-medium focus:outline-none focus:border-blue-500/50 transition-all resize-none placeholder:text-white/10 leading-relaxed"
              />
          </div>

          <button 
            onClick={handleGenerateLevel}
            disabled={isGenerating}
            className="w-full py-5 bg-blue-600 hover:bg-blue-500 disabled:bg-white/5 disabled:text-white/20 disabled:cursor-not-allowed rounded-3xl flex items-center justify-center gap-4 font-black uppercase italic transition-all shadow-[0_20px_40px_rgba(37,99,235,0.2)]"
          >
            {isGenerating ? (
              <RefreshCw className="animate-spin" size={24} />
            ) : (
              <>
                <Wand2 size={24} />
                Generate_Reality
              </>
            )}
          </button>

          {generationError && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-red-600/10 border border-red-500/20 rounded-2xl flex items-center gap-3"
            >
              <AlertCircle size={16} className="text-red-400 shrink-0" />
              <p className="text-xs text-red-400 font-bold uppercase tracking-wider">{generationError}</p>
            </motion.div>
          )}

          <div className="pt-6 border-t border-white/5 space-y-3">
             <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-white/20">
                <span>System Latency</span>
                <span>&lt; 400ms</span>
             </div>
             <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                  animate={{ width: isGenerating ? ['0%', '70%', '95%'] : '100%' }}
                  transition={{ duration: isGenerating ? 10 : 0.5 }}
                  className={`h-full ${isGenerating ? 'bg-blue-500' : 'bg-green-500/30'}`} 
                />
             </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
