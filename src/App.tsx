/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { GameMode, CharacterType, LevelData, TileType, EntityType } from './types';
import { CHARACTERS, TILE_SIZE, COLORS } from './constants';
import { useControls } from './hooks/useControls';
import { GameCanvas } from './components/GameCanvas';
import { generateLevel } from './services/geminiService';
import { serializeLevel, deserializeLevel } from './utils/levelSerialization';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, Edit2, Wand2, RefreshCw, Trophy, 
  AlertCircle, Star, Coins, User, Hammer, Settings, Check
} from 'lucide-react';

const DEFAULT_LEVEL: LevelData = {
  width: 50,
  height: 15,
  tiles: Array(15).fill(null).map((_, y) => 
    Array(50).fill(null).map((_, x) => {
      if (y === 14) return 'GROUND';
      if (x === 45 && y > 10) return 'GOAL_BODY';
      if (x === 45 && y === 10) return 'GOAL_TOP';
      return 'EMPTY';
    })
  ),
  entities: [
    { type: 'COIN', x: 10, y: 13 },
    { type: 'COIN', x: 12, y: 13 },
    { type: 'GOOMBA', x: 20, y: 13 },
  ]
};

export default function App() {
  const [mode, setMode] = useState<GameMode>('MENU');
  const [character, setCharacter] = useState<CharacterType>('MARIO');
  const [levelData, setLevelData] = useState<LevelData>(DEFAULT_LEVEL);
  const [gameState, setGameState] = useState({ score: 0, coins: 0, player: null });
  const [isGenerating, setIsGenerating] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [shareCode, setShareCode] = useState("");
  const [lastGeneratedCode, setLastGeneratedCode] = useState(""); // For editor display
  const [campaignProgress, setCampaignProgress] = useState({ currentLevel: 0, totalScore: 0, unlocked: 1 });
  const { controls } = useControls();

  const handleStartGame = () => {
    setMode('PLAY');
    setGameState({ score: 0, coins: 0, player: null });
  };

  const startCampaign = async () => {
    setMode('CAMPAIGN');
    const firstLevel = await generateLevel("A welcoming first level with green hills and few enemies", 0);
    if (firstLevel) {
      setLevelData(firstLevel);
      setGameState({ score: 0, coins: 0, player: null });
    }
  };

  const handleFinishLevel = async () => {
    if (mode === 'CAMPAIGN') {
      const nextLevelIdx = campaignProgress.currentLevel + 1;
      
      if (nextLevelIdx >= 10) {
        setCampaignProgress(prev => ({
          ...prev,
          totalScore: prev.totalScore + gameState.score
        }));
        setMode('WIN');
        return;
      }

      setIsGenerating(true);
      const themes = [
        "green hills with sunny clouds",
        "underground cavern with bricks and coins",
        "snowy landscape with slippery spikes",
        "lava castle with difficult jumps",
        "sky world with floating platforms",
        "forest world with dense tiles",
        "desert oasis with quicksand-like pits",
        "ghost house with pipes",
        "industrial gear world",
        "final boss fortress"
      ];
      
      const theme = themes[nextLevelIdx] || "progressive difficulty world";
      const nextLevel = await generateLevel(`A ${theme} level, difficulty: ${nextLevelIdx}/10`, nextLevelIdx);
      
      if (nextLevel) {
        setCampaignProgress(prev => ({
          ...prev,
          currentLevel: nextLevelIdx,
          totalScore: prev.totalScore + gameState.score,
          unlocked: Math.max(prev.unlocked, nextLevelIdx + 1)
        }));
        setLevelData(nextLevel);
        setGameState(prev => ({ ...prev, score: 0, coins: 0 }));
      }
      setIsGenerating(false);
    } else {
      setMode('WIN');
    }
  };

  const handleLoadCode = () => {
    const loaded = deserializeLevel(shareCode);
    if (loaded) {
      setLevelData(loaded);
      handleStartGame();
    } else {
      alert("Invalid Level Code!");
    }
  };

  const generateShareCode = () => {
    const code = serializeLevel(levelData);
    setShareCode(code);
    navigator.clipboard.writeText(code);
  };

  const handleGenerateLevel = async () => {
    setIsGenerating(true);
    const newLevel = await generateLevel(prompt || "a fun mario level with pipes and coins");
    if (newLevel) {
      setLevelData(newLevel);
    }
    setIsGenerating(false);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-mono selection:bg-red-500 selection:text-white relative overflow-hidden">
      <div className="scanline" />
      
      {/* Background Grid */}
      <div id="app-bg-grid" className="fixed inset-0 pointer-events-none opacity-[0.03]" 
           style={{ 
             backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', 
             backgroundSize: '32px 32px' 
           }} />

      {/* Header */}
      <header id="main-header" className="p-4 border-b border-white/10 flex justify-between items-center bg-black/40 backdrop-blur-xl sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center shadow-[0_0_20px_rgba(220,38,38,0.3)]">
            <Star className="text-white fill-white" size={24} />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tighter uppercase italic leading-none">Kingdom Maker</h1>
            <p className="text-[9px] text-white/40 font-black uppercase tracking-[0.3em] mt-1">Mashup Engine v1.7.0 // SYS_READY</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {mode !== 'MENU' && (
             <button 
              id="btn-terminal-exit"
              onClick={() => setMode('MENU')}
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
                <span className="text-xs font-black text-yellow-400 font-mono tracking-tighter">{gameState.coins.toString().padStart(3, '0')}</span>
              </div>
            </div>
            <div className="px-5 py-2 flex items-center gap-2 hover:bg-white/5 transition-colors cursor-default group">
              <Star size={14} className="text-blue-400 group-hover:rotate-45 transition-transform" />
              <div className="flex flex-col">
                <span className="text-[7px] font-black text-white/20 uppercase tracking-widest leading-none">Score_Link</span>
                <span className="text-xs font-black text-blue-400 font-mono tracking-tighter">{gameState.score.toString().padStart(6, '0')}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main id="app-main-content" className="max-w-7xl mx-auto p-6 space-y-8 relative">
        <AnimatePresence>
          {isGenerating && (
            <motion.div 
              id="ai-loading-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-xl flex items-center justify-center p-8 overflow-hidden"
            >
              <div className="scanline" />
              <div className="relative glass-panel tech-border rounded-[64px] p-16 flex flex-col items-center gap-10 max-w-lg w-full text-center">
                 <div className="relative">
                    <motion.div 
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                      className="w-32 h-32 border-4 border-blue-500/20 border-t-blue-500 rounded-full"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                       <Wand2 className="text-blue-500 animate-pulse" size={48} />
                    </div>
                 </div>
                 
                 <div className="space-y-4">
                    <h3 className="text-4xl font-black italic uppercase tracking-tighter">Forging_Reality</h3>
                    <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.5em] leading-relaxed">
                      AI Module GMNI_R3 Active<br />
                      Mapping World {campaignProgress.currentLevel + 1} Physics...
                    </p>
                 </div>

                 <div className="w-full space-y-2">
                    <div className="flex justify-between items-end px-2">
                       <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">Construction Progress</span>
                       <span className="text-[8px] font-black text-blue-500 uppercase tracking-widest">v1.7.0 Stable</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden p-0.5 border border-white/5">
                       <motion.div 
                        initial={{ width: '0%' }}
                        animate={{ width: ['20%', '45%', '85%', '98%'] }}
                        transition={{ duration: 15 }}
                        className="h-full bg-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.6)]" 
                       />
                    </div>
                 </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {mode === 'MENU' && (
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
                      <span className="text-[9px] font-black text-red-500 uppercase tracking-widest">v1.7.0 Stable // Auth: Level 4</span>
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
          )}

          {(mode === 'PLAY' || mode === 'CAMPAIGN') && (
            <motion.div 
              key={mode}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-6"
            >
              <div className="flex flex-col gap-4">
                {mode === 'CAMPAIGN' && (
                  <div className="px-2 space-y-2">
                    <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-white/40">
                      <span>World Progression</span>
                      <span className="text-yellow-500">Level {campaignProgress.currentLevel + 1} / 10</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${((campaignProgress.currentLevel + 1) / 10) * 100}%` }}
                        className="h-full bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)] transition-all duration-500"
                      />
                    </div>
                  </div>
                )}

                <div className="flex justify-between items-end px-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      {mode === 'CAMPAIGN' && <Trophy size={14} className="text-yellow-500" />}
                      <span className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] block">
                        {mode === 'CAMPAIGN' ? `Campaign Mode` : 'Active Mission'}
                      </span>
                    </div>
                    <h2 className="text-3xl font-black italic uppercase leading-none">
                      {mode === 'CAMPAIGN' ? `World ${Math.floor(campaignProgress.currentLevel / 4) + 1}-${(campaignProgress.currentLevel % 4) + 1}` : 'Mushroom Kingdom'}
                    </h2>
                  </div>
                  {mode === 'CAMPAIGN' && (
                    <div className="text-right space-y-1">
                      <div className="flex flex-col items-end">
                        <p className="text-[8px] font-black uppercase text-white/30 tracking-widest">Grand Total</p>
                        <motion.p 
                          key={campaignProgress.totalScore}
                          initial={{ scale: 1.2, color: '#fff' }}
                          animate={{ scale: 1, color: '#eab308' }}
                          className="text-2xl font-black italic"
                        >
                          {(campaignProgress.totalScore + gameState.score).toLocaleString()}
                        </motion.p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
               <GameCanvas 
                levelData={levelData}
                character={character}
                controls={controls}
                onStateChange={setGameState}
                onWin={handleFinishLevel}
                onGameOver={() => setMode('GAME_OVER')}
              />

              {/* Control Hints Overlay */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                 <div className="p-5 bg-white/5 rounded-3xl border border-white/5 tech-border space-y-4">
                    <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-[0.2em] text-white/30">
                       <span>SYS_LOG: Ability_Link</span>
                       <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    </div>
                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                       <motion.div 
                        initial={false}
                        animate={{ width: `${gameState.player ? (1 - (gameState.player as any).abilityCooldown / CHARACTERS[character].abilityCooldown) * 100 : 100}%` }}
                        className="h-full bg-gradient-to-r from-blue-600 to-blue-400 transition-all duration-300" 
                       />
                    </div>
                    <div>
                       <p className="text-xs font-black italic uppercase tracking-tight text-white/90">{CHARACTERS[character].abilityName}</p>
                       <p className="text-[9px] font-bold text-blue-500 uppercase tracking-widest mt-1">Press [X] to trigger</p>
                    </div>
                 </div>
                 
                 <div className="md:col-span-2 glass-panel rounded-3xl p-5 border border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-5">
                       <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-white/5 border border-white/10 group overflow-hidden relative">
                          <User size={28} className="text-white/40 group-hover:scale-110 transition-transform" />
                          <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent" />
                       </div>
                       <div className="space-y-1">
                          <p className="text-[10px] font-black uppercase text-white/20 tracking-[0.3em]">Operational_Hero</p>
                          <h4 className="text-xl font-black italic uppercase tracking-tighter">{CHARACTERS[character].name}</h4>
                          <div className="flex gap-2">
                             {(CHARACTERS[character].description || "Base Unit").split(' ').map((word, i) => (
                               <span key={i} className="text-[8px] px-2 py-0.5 bg-white/5 rounded text-white/40 font-bold uppercase">{word}</span>
                             ))}
                          </div>
                       </div>
                    </div>
                    <div className="flex items-end flex-col gap-1">
                       <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">Movement_Pwr</span>
                       <div className="flex gap-1">
                          {[1,2,3,4,5].map(i => (
                             <div key={i} className={`w-1.5 h-4 rounded-sm ${i <= CHARACTERS[character].speed ? 'bg-blue-500' : 'bg-white/5'}`} />
                          ))}
                       </div>
                    </div>
                 </div>

                 <div className="p-5 tech-border rounded-3xl flex items-center justify-center gap-8">
                    <div className="flex flex-col items-center gap-2">
                       <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                          <Play size={20} className="text-white/40" />
                       </div>
                       <span className="text-[8px] font-black uppercase text-white/20 tracking-widest">Run: WASD</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                       <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                          <Star size={20} className="text-white/40" />
                       </div>
                       <span className="text-[8px] font-black uppercase text-white/20 tracking-widest">Jump: Space</span>
                    </div>
                 </div>
              </div>
            </motion.div>
          )}

          {mode === 'EDITOR' && (
            <motion.div 
               key="editor"
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               className="space-y-6"
            >
               <Editor 
                initialLevel={levelData} 
                onSave={(data) => {
                  setLevelData(data);
                  setMode('MENU');
                }} 
                onShare={(code) => {
                  setLastGeneratedCode(code);
                  navigator.clipboard.writeText(code);
                }}
               />
            </motion.div>
          )}

          {(mode === 'GAME_OVER' || mode === 'WIN') && (
            <motion.div 
              key="end"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-12 overflow-hidden"
            >
              <div className="absolute inset-0 bg-[#050505]/95 backdrop-blur-3xl" />
              <div className="scanline" />
              
              <motion.div 
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="relative glass-panel tech-border rounded-[64px] p-12 max-w-2xl w-full space-y-12 text-center"
              >
                <div className="space-y-6">
                  {mode === 'WIN' ? (
                    <div className="space-y-8">
                       <motion.div 
                        animate={{ rotate: [12, -12, 12], scale: [1, 1.1, 1] }}
                        transition={{ repeat: Infinity, duration: 4 }}
                        className="w-32 h-32 bg-yellow-500 rounded-[40px] mx-auto flex items-center justify-center shadow-[0_30px_60px_rgba(234,179,8,0.4)] border-4 border-black"
                      >
                        <Trophy size={64} className="text-black" />
                      </motion.div>
                      <div className="space-y-2">
                        <h2 className="text-8xl font-black italic uppercase tracking-tighter leading-none">MISSION_COMPLETE</h2>
                        <p className="text-[10px] font-black text-yellow-500 uppercase tracking-[0.5em]">Sector Cleared // Authorization Verified</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-8">
                      <motion.div 
                        animate={{ y: [-10, 10, -10] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        className="w-32 h-32 bg-red-600 rounded-[40px] mx-auto flex items-center justify-center shadow-[0_30px_60px_rgba(220,38,38,0.4)] border-4 border-black"
                      >
                        <AlertCircle size={64} className="text-white" />
                      </motion.div>
                      <div className="space-y-2">
                        <h2 className="text-8xl font-black italic uppercase tracking-tighter leading-none">UNIT_TERMINATED</h2>
                        <p className="text-[10px] font-black text-red-500 uppercase tracking-[0.5em]">Critical Failure // Connection Lost</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-8 bg-white/5 rounded-[32px] border border-white/5 space-y-2 group hover:bg-white/10 transition-all">
                    <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em]">Resource_Secured</p>
                    <div className="flex items-center justify-center gap-3">
                       <Coins size={20} className="text-yellow-400" />
                       <p className="text-4xl font-black italic tracking-tighter">{gameState.coins.toString().padStart(3, '0')}</p>
                    </div>
                  </div>
                  <div className="p-8 bg-white/5 rounded-[32px] border border-white/5 space-y-2 group hover:bg-white/10 transition-all">
                    <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em]">Performance_Rating</p>
                    <div className="flex items-center justify-center gap-3">
                       <Star size={20} className="text-blue-400" />
                       <p className="text-4xl font-black italic tracking-tighter">{gameState.score.toLocaleString()}</p>
                    </div>
                  </div>
                  
                  {campaignProgress.currentLevel > 0 && (
                    <div className="md:col-span-2 p-8 bg-white/5 border border-white/10 rounded-[40px] flex flex-col items-center gap-4 group">
                       <div className="w-full flex justify-between items-center px-4">
                          <p className="text-[10px] font-black text-white/30 uppercase tracking-widest leading-none">Campaign_Log_0{(campaignProgress.currentLevel + 1)}</p>
                          <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest bg-blue-500/10 px-4 py-1 rounded-full border border-blue-500/20">TOTAL: {campaignProgress.totalScore.toLocaleString()}</span>
                       </div>
                       <h4 className="text-4xl font-black italic uppercase tracking-tighter text-white/90">
                         Reached_Sector {Math.floor(campaignProgress.currentLevel / 4) + 1}-{(campaignProgress.currentLevel % 4) + 1}
                       </h4>
                       <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${((campaignProgress.currentLevel + 1) / 10) * 100}%` }}
                            className="h-full bg-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.5)]"
                          />
                       </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <button 
                    onClick={handleStartGame}
                    className="flex-1 py-6 bg-white text-black rounded-3xl font-black uppercase italic tracking-widest text-sm hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-white/10 flex items-center justify-center gap-3"
                  >
                    <RefreshCw size={18} />
                    REBOOT_MISSION
                  </button>
                  <button 
                    onClick={() => setMode('MENU')}
                    className="flex-1 py-6 bg-white/5 hover:bg-white/10 border border-white/5 rounded-3xl font-black uppercase italic tracking-widest text-sm transition-all flex items-center justify-center gap-3"
                  >
                    <Settings size={18} />
                    RETURN_TO_BASE
                  </button>
                </div>
                
                <div className="absolute top-12 left-12 opacity-5 pointer-events-none">
                   <Star size={200} />
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer Decoration */}
      <footer id="app-footer-decoration" className="fixed bottom-0 left-0 w-full z-40 bg-black/80 backdrop-blur-md border-t border-white/5 p-2 hidden sm:block">
         <div className="max-w-7xl mx-auto flex justify-between items-center opacity-40">
            <div className="flex gap-4 items-center">
               <div className="flex gap-1">
                  {['W','A','S','D'].map(k => (
                    <span key={k} className="px-1.5 py-0.5 border border-white/20 rounded text-[7px] font-black">{k}</span>
                  ))}
               </div>
               <span className="text-[7px] font-black uppercase tracking-widest leading-none mt-0.5">Control_Input_Ready</span>
            </div>
            <div className="flex items-center gap-2">
               <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
               <span className="text-[7px] font-black uppercase tracking-widest leading-none mt-0.5 whitespace-nowrap">Engine_Stable // v1.7.0.42_R3</span>
            </div>
         </div>
         <div className="h-0.5 w-full bg-red-600 mt-2 shadow-[0_0_15px_rgba(220,38,38,0.5)]" />
      </footer>
    </div>
  );
}

interface EditorProps {
  initialLevel: LevelData;
  onSave: (data: LevelData) => void;
  onShare: (code: string) => void;
}

const Editor: React.FC<EditorProps> = ({ initialLevel, onSave, onShare }) => {
  const [level, setLevel] = useState<LevelData>(JSON.parse(JSON.stringify(initialLevel)));
  const [selectedTile, setSelectedTile] = useState<TileType>('GROUND');
  const [selectedEntity, setSelectedEntity] = useState<EntityType | null>(null);
  const [tool, setTool] = useState<'TILE' | 'ENTITY'>('TILE');
  const [copied, setCopied] = useState(false);
  const [currentCode, setCurrentCode] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const TILE_LIST: TileType[] = ['GROUND', 'BRICK', 'QUESTION', 'SPIKE', 'PIPE_TOP_LEFT', 'GOAL_TOP'];
  const ENTITY_LIST: EntityType[] = ['GOOMBA', 'COIN', 'MUSHROOM'];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Toggle tool
      if (e.key === 'Tab') {
        e.preventDefault();
        setTool(prev => prev === 'TILE' ? 'ENTITY' : 'TILE');
        if (tool === 'TILE' && !selectedEntity) setSelectedEntity(ENTITY_LIST[0]);
      }

      // Next / Previous selection
      if (e.key === '[' || e.key === ']') {
        if (tool === 'TILE') {
          const idx = TILE_LIST.indexOf(selectedTile);
          const nextIdx = e.key === ']' 
            ? (idx + 1) % TILE_LIST.length 
            : (idx - 1 + TILE_LIST.length) % TILE_LIST.length;
          setSelectedTile(TILE_LIST[nextIdx]);
        } else if (selectedEntity) {
          const idx = ENTITY_LIST.indexOf(selectedEntity);
          const nextIdx = e.key === ']' 
            ? (idx + 1) % ENTITY_LIST.length 
            : (idx - 1 + ENTITY_LIST.length) % ENTITY_LIST.length;
          setSelectedEntity(ENTITY_LIST[nextIdx]);
        }
      }

      // Quick numbers
      const num = parseInt(e.key);
      if (!isNaN(num) && num > 0) {
        if (tool === 'TILE' && num <= TILE_LIST.length) {
          setSelectedTile(TILE_LIST[num - 1]);
        } else if (tool === 'ENTITY' && num <= ENTITY_LIST.length) {
          setSelectedEntity(ENTITY_LIST[num - 1]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [tool, selectedTile, selectedEntity]);

  const handleTileClick = (x: number, y: number) => {
    const newLevel = { ...level };
    if (tool === 'TILE') {
      newLevel.tiles[y][x] = newLevel.tiles[y][x] === selectedTile ? 'EMPTY' : selectedTile;
    } else if (selectedEntity) {
      // Remove any entity at this spot first
      newLevel.entities = newLevel.entities.filter(e => Math.floor(e.x) !== x || Math.floor(e.y) !== y);
      newLevel.entities.push({ type: selectedEntity, x, y });
    }
    setLevel(newLevel);
  };

  const clearEntities = (x: number, y: number) => {
    const newLevel = { ...level };
    newLevel.entities = newLevel.entities.filter(e => Math.floor(e.x) !== x || Math.floor(e.y) !== y);
    setLevel(newLevel);
  };

  return (
    <div className="space-y-6">
      <div id="editor-toolbar" className="flex flex-wrap items-center justify-between gap-4 glass-panel p-4 rounded-3xl tech-border shadow-2xl">
        <div className="flex items-center gap-6">
           <div id="editor-tool-toggle" className="flex bg-white/5 p-1 rounded-2xl border border-white/10 divide-x divide-white/5">
              <button 
                id="btn-editor-tool-tile"
                onClick={() => setTool('TILE')}
                className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${tool === 'TILE' ? 'bg-white text-black shadow-lg shadow-white/50' : 'text-white/40 hover:text-white'}`}
              >
                <Hammer size={12} />
                TILES [TAB]
              </button>
              <button 
                id="btn-editor-tool-entity"
                onClick={() => setTool('ENTITY')}
                className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${tool === 'ENTITY' ? 'bg-white text-black shadow-lg shadow-white/50' : 'text-white/40 hover:text-white'}`}
              >
                <User size={12} />
                ENTITIES [TAB]
              </button>
           </div>

           <div id="editor-palette" className="flex gap-2 overflow-x-auto pb-1 max-w-[300px] no-scrollbar">
             {tool === 'TILE' ? (
               TILE_LIST.map((t, i) => (
                 <button
                    id={`btn-palette-tile-${t}`}
                    key={t}
                    onClick={() => setSelectedTile(t)}
                    title={`${t} [${i + 1}]`}
                    className={`shrink-0 w-12 h-12 rounded-2xl border-2 transition-all relative ${selectedTile === t ? 'border-white bg-white/10' : 'border-transparent bg-white/5 hover:border-white/20'}`}
                 >
                    <div className="w-full h-full rounded-xl scale-[0.6]" style={{ backgroundColor: (COLORS as any)[t] || '#444' }} />
                    <span className="absolute bottom-1 right-1 text-[8px] font-black opacity-30">{i+1}</span>
                 </button>
               ))
             ) : (
               ENTITY_LIST.map((e, i) => (
                <button
                   id={`btn-palette-entity-${e}`}
                   key={e}
                   onClick={() => setSelectedEntity(e)}
                   title={`${e} [${i + 1}]`}
                   className={`shrink-0 w-12 h-12 rounded-2xl border-2 transition-all relative flex items-center justify-center font-black ${selectedEntity === e ? 'border-white bg-white/10' : 'border-transparent bg-white/5 hover:border-white/20'}`}
                >
                   <span className="text-xl opacity-80">{e[0]}</span>
                   <span className="absolute bottom-1 right-1 text-[8px] font-black opacity-30">{i+1}</span>
                </button>
              ))
             )}
           </div>
        </div>

        <div id="editor-actions" className="flex gap-3">
           <button 
            id="btn-editor-share"
            onClick={() => {
              const code = serializeLevel(level);
              setCurrentCode(code);
              onShare(code);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
            className="px-8 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl font-black uppercase italic text-xs tracking-tighter transition-all flex items-center gap-2"
          >
            {copied ? <Check size={16} /> : <Wand2 size={16} />}
            {copied ? 'SYS_LINK_CREATED' : 'GEN_SHARE_ID'}
          </button>
          <button 
            id="btn-editor-save"
            onClick={() => onSave(level)}
            className="px-8 py-3 bg-red-600 hover:bg-red-500 rounded-2xl font-black uppercase italic text-xs tracking-tighter transition-all flex items-center gap-2 shadow-[0_10px_20px_rgba(220,38,38,0.2)]"
          >
            <Hammer size={16} />
            DEPLOY_DATA
          </button>
        </div>
      </div>

      {currentCode && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-2"
        >
          <label className="text-[8px] font-black uppercase text-white/30 tracking-widest">Shareable Level Code</label>
          <div className="flex gap-2">
            <input 
              readOnly 
              value={currentCode}
              className="flex-1 bg-black/40 border border-white/5 rounded-lg px-3 py-2 text-[10px] font-mono text-blue-400 focus:outline-none"
            />
            <button 
              onClick={() => {
                navigator.clipboard.writeText(currentCode);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
              className="px-3 bg-white/10 hover:bg-white/20 rounded-lg text-[8px] font-black uppercase"
            >
              Copy
            </button>
          </div>
        </motion.div>
      )}

      <div 
        ref={scrollRef}
        className="w-full overflow-x-auto bg-black/40 border border-white/10 rounded-3xl p-4 cursor-crosshair custom-scrollbar"
      >
        <div 
          className="grid gap-px bg-white/5" 
          style={{ 
            gridTemplateColumns: `repeat(${level.width}, ${TILE_SIZE}px)`,
            width: level.width * TILE_SIZE 
          }}
        >
          {level.tiles.map((row, y) => (
            row.map((tile, x) => {
              const entityAt = level.entities.find(e => Math.floor(e.x) === x && Math.floor(e.y) === y);
              return (
                <div 
                  key={`${x}-${y}`}
                  onClick={() => handleTileClick(x, y)}
                  onContextMenu={(e) => { e.preventDefault(); clearEntities(x, y); }}
                  className="w-8 h-8 relative group"
                  style={{ backgroundColor: (COLORS as any)[tile] || 'transparent' }}
                >
                  <div className="absolute inset-0 border border-white/5 group-hover:border-white/20 transition-all" />
                  {entityAt && (
                    <div className="absolute inset-1 bg-yellow-500/50 rounded-full flex items-center justify-center text-[10px] font-black">
                      {entityAt.type[0]}
                    </div>
                  )}
                </div>
              );
            })
          ))}
        </div>
      </div>

      <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-center gap-3">
        <AlertCircle size={18} className="text-blue-400" />
        <div className="text-xs text-blue-400 font-bold uppercase tracking-wider space-y-1">
          <p>Pro Tip: Right-click to remove entities. Levels are saved to your session.</p>
          <p className="opacity-70">Shortcuts: [Tab] Switch Tool | [[ , ]] Cycle Selection | [1-9] Quick Select</p>
        </div>
      </div>
    </div>
  );
};

