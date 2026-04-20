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
  AlertCircle, Star, Coins, User, Hammer, Settings
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
    <div className="min-h-screen bg-[#111] text-white font-mono selection:bg-red-500 selection:text-white">
      {/* Header */}
      <header className="p-4 border-b border-white/10 flex justify-between items-center bg-black/50 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center shadow-lg shadow-red-600/20">
            <Star className="text-white fill-white" size={24} />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tighter uppercase italic">Kingdom Maker</h1>
            <p className="text-[10px] text-white/50 font-bold uppercase tracking-widest">Mashup Edition v1.0.4</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {mode !== 'MENU' && (
             <button 
              onClick={() => setMode('MENU')}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-full text-xs font-bold transition-all border border-white/10"
             >
               MENU
             </button>
          )}
          <div className="px-4 py-2 bg-yellow-500/20 rounded-full flex items-center gap-2 border border-yellow-500/30">
            <Coins size={14} className="text-yellow-400" />
            <span className="text-sm font-bold text-yellow-400">{gameState.coins.toString().padStart(3, '0')}</span>
          </div>
          <div className="px-4 py-2 bg-blue-500/20 rounded-full flex items-center gap-2 border border-blue-500/30">
            <Star size={14} className="text-blue-400" />
            <span className="text-sm font-bold text-blue-400">{gameState.score.toString().padStart(6, '0')}</span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6 space-y-8">
        <AnimatePresence>
          {isGenerating && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-center justify-center"
            >
              <div className="bg-black/80 border border-white/20 p-8 rounded-[40px] flex flex-col items-center gap-4 shadow-2xl">
                 <RefreshCw className="animate-spin text-blue-500" size={48} />
                 <div className="text-center">
                   <h3 className="text-xl font-black italic uppercase">Gemini is Constructing...</h3>
                   <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Generating Level {campaignProgress.currentLevel + 1}</p>
                 </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {mode === 'MENU' && (
            <motion.div 
              key="menu"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-12 pt-10"
            >
              <div className="space-y-8">
                <div className="space-y-4">
                  <h2 className="text-6xl font-black italic tracking-tighter leading-none uppercase">
                    Build. <br />
                    <span className="text-red-500">Play.</span> <br />
                    Remix.
                  </h2>
                  <p className="text-white/60 text-lg leading-relaxed max-w-md">
                    Create infinite Mushroom Kingdom levels with AI, or handcraft them with the retro editor. Choose your hero and dominate the world.
                  </p>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]">Select Character</label>
                  <div className="grid grid-cols-4 gap-3">
                    {(Object.keys(CHARACTERS) as CharacterType[]).map((char) => (
                      <button
                        key={char}
                        onClick={() => setCharacter(char)}
                        className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                          character === char 
                          ? 'bg-white/10 border-white shadow-[0_0_20px_rgba(255,255,255,0.1)]' 
                          : 'bg-white/5 border-transparent hover:bg-white/10'
                        }`}
                      >
                        <div className="w-12 h-12 rounded-lg" style={{ backgroundColor: CHARACTERS[char].color }} />
                        <span className="text-[10px] font-bold uppercase">{CHARACTERS[char].name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-wrap gap-4 pt-4">
                  <button 
                    onClick={handleStartGame}
                    className="group relative px-8 py-4 bg-red-600 hover:bg-red-500 rounded-2xl flex items-center gap-3 transition-all transform active:scale-95"
                  >
                    <Play className="fill-white" size={24} />
                    <span className="text-xl font-black uppercase italic">Quick Play</span>
                    <div className="absolute inset-0 bg-red-400/20 blur-xl rounded-2xl group-hover:blur-2xl transition-all -z-10" />
                  </button>
                  <button 
                    onClick={startCampaign}
                    className="px-8 py-4 bg-yellow-600 hover:bg-yellow-500 rounded-2xl flex items-center gap-3 transition-all"
                  >
                    <Trophy size={24} />
                    <span className="text-xl font-black uppercase italic">Campaign</span>
                  </button>
                  <button 
                    onClick={() => setMode('EDITOR')}
                    className="px-8 py-4 bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl flex items-center gap-3 transition-all"
                  >
                    <Edit2 size={24} />
                    <span className="text-xl font-black uppercase italic text-white/80">Editor</span>
                  </button>
                </div>

                <div className="pt-6 border-t border-white/10 space-y-4">
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]">Play Shared Level</label>
                  <div className="flex gap-2">
                    <input 
                      type="text"
                      value={shareCode}
                      onChange={(e) => setShareCode(e.target.value)}
                      placeholder="Paste Level Code..."
                      className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-white/30"
                    />
                    <button 
                      onClick={handleLoadCode}
                      className="px-6 py-3 bg-white text-black rounded-xl font-black uppercase text-xs hover:bg-white/90 transition-all"
                    >
                      Load
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 rounded-[40px] p-8 border border-white/10 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12 group-hover:rotate-0 transition-transform duration-1000">
                  <Wand2 size={200} />
                </div>
                <div className="relative space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/20 rounded-lg">
                      <Wand2 className="text-blue-400" size={20} />
                    </div>
                    <h3 className="text-xl font-bold uppercase italic">AI Level Generator</h3>
                  </div>
                  <textarea 
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Describe your dream level... (e.g. 'a difficult lava land with spikes and coins')"
                    className="w-full h-40 bg-black/40 border border-white/10 rounded-2xl p-4 text-sm focus:outline-none focus:border-blue-500/50 transition-all resize-none placeholder:text-white/20"
                  />
                  <button 
                    onClick={handleGenerateLevel}
                    disabled={isGenerating}
                    className="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:bg-white/10 disabled:cursor-not-allowed rounded-2xl flex items-center justify-center gap-3 font-black uppercase italic transition-all"
                  >
                    {isGenerating ? (
                      <RefreshCw className="animate-spin" size={20} />
                    ) : (
                      <Wand2 size={20} />
                    )}
                    {isGenerating ? 'Generating...' : 'Construct with Gemini'}
                  </button>
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
                        className="h-full bg-gradient-to-r from-yellow-600 to-yellow-400 shadow-[0_0_10px_rgba(234,179,8,0.3)] transition-all duration-500"
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

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 <div className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-3">
                    <div className="flex justify-between text-[8px] font-bold text-white/40 uppercase tracking-widest">
                       <span>Ability</span>
                       <span>Ready</span>
                    </div>
                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                       <div 
                        className="h-full bg-green-500 transition-all duration-300" 
                        style={{ width: `${gameState.player ? (1 - (gameState.player as any).abilityCooldown / CHARACTERS[character].abilityCooldown) * 100 : 100}%` }} 
                       />
                    </div>
                    <p className="text-xs font-black italic uppercase">{CHARACTERS[character].abilityName}</p>
                 </div>
                 <div className="p-4 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                       <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-white/5 border border-white/10">
                          <User size={20} className="text-white/60" />
                       </div>
                       <div>
                          <p className="text-[8px] font-black uppercase text-white/30 tracking-widest">Hero</p>
                          <p className="text-sm font-black italic uppercase">{CHARACTERS[character].name}</p>
                       </div>
                    </div>
                    <div className="text-right">
                       <p className="text-[8px] font-black uppercase text-white/30 tracking-widest">Speed</p>
                       <p className="text-sm font-black italic uppercase text-blue-400">{CHARACTERS[character].speed}x</p>
                    </div>
                 </div>
                 <div className="p-4 bg-white/5 rounded-2xl border border-white/10 flex justify-center gap-6">
                    <button onClick={() => setMode('MENU')} className="text-white/40 hover:text-white transition-colors">
                      <AlertCircle size={24} />
                    </button>
                    <button onClick={() => setMode('EDITOR')} className="text-white/40 hover:text-white transition-colors">
                      <Hammer size={24} />
                    </button>
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
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            >
              <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" />
              <div className="relative text-center space-y-8 max-w-md w-full">
                {mode === 'WIN' ? (
                  <div className="space-y-4">
                    <div className="w-24 h-24 bg-yellow-500 rounded-[32px] mx-auto flex items-center justify-center shadow-[0_0_50px_rgba(234,179,8,0.3)] rotate-12">
                      <Trophy size={48} className="text-black" />
                    </div>
                    <h2 className="text-6xl font-black italic uppercase tracking-tighter">Level Clear!</h2>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="w-24 h-24 bg-red-600 rounded-[32px] mx-auto flex items-center justify-center shadow-[0_0_50px_rgba(220,38,38,0.3)] -rotate-12">
                      <AlertCircle size={48} className="text-white" />
                    </div>
                    <h2 className="text-6xl font-black italic uppercase tracking-tighter">Game Over</h2>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-white/10 rounded-2xl border border-white/10">
                    <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Total Coins</p>
                    <p className="text-2xl font-black">{gameState.coins}</p>
                  </div>
                  <div className="p-4 bg-white/10 rounded-2xl border border-white/10">
                    <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Final Score</p>
                    <p className="text-2xl font-black">{gameState.score}</p>
                  </div>
                  {campaignProgress.currentLevel > 0 && (
                    <div className="col-span-2 p-4 bg-yellow-500/10 rounded-2xl border border-yellow-500/20">
                       <p className="text-[10px] font-bold text-yellow-500/50 uppercase tracking-widest">Campaign Progress</p>
                       <p className="text-xl font-black uppercase italic text-yellow-500">
                         Reached World {Math.floor(campaignProgress.currentLevel / 4) + 1}-{(campaignProgress.currentLevel % 4) + 1}
                       </p>
                       <p className="text-[10px] font-bold text-white/20 mt-1 uppercase">Cumulative Score: {campaignProgress.totalScore.toLocaleString()}</p>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <button 
                    onClick={handleStartGame}
                    className="w-full py-4 bg-white text-black rounded-2xl font-black uppercase italic transition-all hover:scale-[1.02] active:scale-95"
                  >
                    Try Again
                  </button>
                  <button 
                    onClick={() => setMode('MENU')}
                    className="w-full py-4 bg-white/10 hover:bg-white/20 rounded-2xl font-black uppercase italic transition-all"
                  >
                    Menu
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer Decoration */}
      <div className="fixed bottom-0 left-0 w-full h-1 bg-red-600 shadow-[0_0_20px_rgba(220,38,38,0.5)] z-40" />
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
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
           <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
              <button 
                onClick={() => setTool('TILE')}
                className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${tool === 'TILE' ? 'bg-white text-black' : 'text-white/40 hover:text-white'}`}
              >
                Tiles
              </button>
              <button 
                onClick={() => setTool('ENTITY')}
                className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${tool === 'ENTITY' ? 'bg-white text-black' : 'text-white/40 hover:text-white'}`}
              >
                Entities
              </button>
           </div>

           <div className="flex gap-2 overflow-x-auto pb-1 max-w-md">
             {tool === 'TILE' ? (
               TILE_LIST.map(t => (
                 <button
                    key={t}
                    onClick={() => setSelectedTile(t)}
                    className={`shrink-0 w-10 h-10 rounded-lg border-2 transition-all ${selectedTile === t ? 'border-blue-500 bg-blue-500/20' : 'border-transparent bg-white/5'}`}
                 >
                    <div className="w-full h-full rounded sm" style={{ backgroundColor: (COLORS as any)[t] || '#444' }} />
                 </button>
               ))
             ) : (
               ENTITY_LIST.map(e => (
                <button
                   key={e}
                   onClick={() => setSelectedEntity(e)}
                   className={`shrink-0 w-10 h-10 rounded-lg border-2 transition-all ${selectedEntity === e ? 'border-yellow-500 bg-yellow-500/20' : 'border-transparent bg-white/5'} flex items-center justify-center font-black text-[8px]`}
                >
                   {e[0]}
                </button>
              ))
             )}
           </div>
        </div>

        <div className="flex gap-2">
           <button 
            onClick={() => {
              const code = serializeLevel(level);
              setCurrentCode(code);
              onShare(code);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl font-black uppercase italic transition-all flex items-center gap-2"
          >
            {copied ? 'Copied!' : 'Share Level'}
          </button>
          <button 
            onClick={() => onSave(level)}
            className="px-6 py-3 bg-green-600 hover:bg-green-500 rounded-xl font-black uppercase italic transition-all flex items-center gap-2"
          >
            <Hammer size={18} />
            Save Level
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

