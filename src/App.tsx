/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { GameMode, CharacterType, LevelData, TileType, EntityType, GameState, CampaignProgress } from './types';
import { CHARACTERS, TILE_SIZE, COLORS, DEFAULT_LEVEL, CAMPAIGN_THEMES } from './constants';
import { useControls } from './hooks/useControls';
import { GameCanvas } from './components/GameCanvas';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { LoadingOverlay } from './components/LoadingOverlay';
import { AbilityOverlay } from './components/AbilityOverlay';
import { EditorToolbar } from './components/EditorToolbar';
import { Editor } from './components/Editor';
import { MainMenu } from './components/MainMenu';
import { generateLevel } from './services/geminiService';
import { serializeLevel, deserializeLevel } from './utils/levelSerialization';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, Edit2, RefreshCw, Trophy, 
  AlertCircle, Star, Coins, User, Settings
} from 'lucide-react';

export default function App() {
  const [mode, setMode] = useState<GameMode>('MENU');
  const [character, setCharacter] = useState<CharacterType>('MARIO');
  const [levelData, setLevelData] = useState<LevelData>(DEFAULT_LEVEL);
  const [gameState, setGameState] = useState<GameState>({ score: 0, coins: 0, player: null });
  const [isGenerating, setIsGenerating] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [shareCode, setShareCode] = useState("");
  const [campaignProgress, setCampaignProgress] = useState<CampaignProgress>({ currentLevel: 0, totalScore: 0 });
  const [statusMessage, setStatusMessage] = useState<{ text: string, type: 'ALERT' | 'SUCCESS' | 'INFO' } | null>(null);
  const { controls } = useControls();

  // Clear status after timeout
  useEffect(() => {
    if (statusMessage) {
      const timer = setTimeout(() => setStatusMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [statusMessage]);

  // Persistence: Load on mount
  useEffect(() => {
    const saved = localStorage.getItem('campaign-progress');
    if (saved) {
      try {
        setCampaignProgress(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load campaign progress:', e);
      }
    }
  }, []);

  // Persistence: Save on change
  useEffect(() => {
    localStorage.setItem('campaign-progress', JSON.stringify(campaignProgress));
  }, [campaignProgress]);

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
      
      const theme = CAMPAIGN_THEMES[nextLevelIdx] || "progressive difficulty world";
      const nextLevel = await generateLevel(`A ${theme} level, difficulty: ${nextLevelIdx}/10`, nextLevelIdx);
      
      if (nextLevel) {
        setCampaignProgress(prev => ({
          ...prev,
          currentLevel: nextLevelIdx,
          totalScore: prev.totalScore + gameState.score
        }));
        setLevelData(nextLevel);
        setGameState(prev => ({ ...prev, score: 0, coins: 0 }));
      } else {
        setGenerationError("FORGE_FAILURE: Level reconstruction failed. Retrying...");
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
      setStatusMessage({ text: 'MISSION_DATA_SYNCED', type: 'SUCCESS' });
    } else {
      setStatusMessage({ text: 'ERR_INVALID_CODE_LINK', type: 'ALERT' });
    }
  };

  const generateShareCode = () => {
    const code = serializeLevel(levelData);
    setShareCode(code);
    navigator.clipboard.writeText(code);
    setStatusMessage({ text: 'SECTOR_DATA_COPIED', type: 'SUCCESS' });
  };

  const handleGenerateLevel = async () => {
    setIsGenerating(true);
    setGenerationError(null);
    try {
      const newLevel = await generateLevel(prompt || "a fun mario level with pipes and coins");
      if (newLevel) {
        setLevelData(newLevel);
      } else {
        setGenerationError("FORGE_FAILURE: Level reconstruction failed.");
      }
    } catch (error) {
      console.error(error);
      setGenerationError("FORGE_CRITICAL: Neural link severed.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen text-white font-mono selection:bg-red-500 selection:text-white relative overflow-hidden">
      {/* Header handled by React components for dynamic state */}
      {/* Status Overlay */}
      <AnimatePresence>
        {statusMessage && (
          <motion.div
            id="status-notification"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed bottom-12 right-12 z-[300] flex flex-col gap-2 pointer-events-none"
          >
             <div className={`px-6 py-3 rounded-2xl border backdrop-blur-xl flex items-center gap-4 ${
               statusMessage.type === 'ALERT' ? 'bg-red-950/80 border-red-500/50 text-red-500' : 
               statusMessage.type === 'SUCCESS' ? 'bg-green-950/80 border-green-500/50 text-green-500' : 
               'bg-blue-950/80 border-blue-500/50 text-blue-500'
             }`}>
                <div className={`w-2 h-2 rounded-full animate-pulse ${
                  statusMessage.type === 'ALERT' ? 'bg-red-500' : 
                  statusMessage.type === 'SUCCESS' ? 'bg-green-500' : 'bg-blue-500'
                }`} />
                <span className="text-xs font-black uppercase tracking-widest">{statusMessage.text}</span>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Header 
        mode={mode} 
        coins={gameState.coins} 
        score={gameState.score} 
        onExit={() => setMode('MENU')} 
      />

      <main id="app-main-content" className="max-w-7xl mx-auto p-6 space-y-8 relative">
        <LoadingOverlay 
          isVisible={isGenerating} 
          currentLevel={campaignProgress.currentLevel} 
        />

        <AnimatePresence mode="wait">
          {mode === 'MENU' && (
            <MainMenu 
              character={character}
              setCharacter={setCharacter}
              handleStartGame={handleStartGame}
              startCampaign={startCampaign}
              setMode={setMode}
              shareCode={shareCode}
              setShareCode={setShareCode}
              handleLoadCode={handleLoadCode}
              handleGenerateLevel={handleGenerateLevel}
              isGenerating={isGenerating}
              prompt={prompt}
              setPrompt={setPrompt}
              generationError={generationError}
            />
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

              <AbilityOverlay 
                active={gameState.player?.invincibilityTime > 0} 
                abilityName={CHARACTERS[character].abilityName} 
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
                        animate={{ width: `${gameState.player ? (1 - gameState.player.abilityCooldown / CHARACTERS[character].abilityCooldown) * 100 : 100}%` }}
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
      <Footer />
    </div>
  );
}

