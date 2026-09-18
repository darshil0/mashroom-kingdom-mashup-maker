/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  AlertCircle,
  Coins,
  Play,
  RefreshCw,
  Settings,
  Star,
  Trophy,
  User,
} from "lucide-react";

import {
  CampaignProgress,
  CharacterType,
  GameMode,
  GameState,
  LevelData,
} from "./core/types";
import {
  CAMPAIGN_THEMES,
  CHARACTERS,
  DEFAULT_LEVEL,
} from "./core/constants";
import { useControls } from "./hooks/useControls";
import { GameCanvas } from "./components/game/GameCanvas";
import { Header } from "./components/layout/Header";
import { Footer } from "./components/layout/Footer";
import { LoadingOverlay } from "./components/common/LoadingOverlay";
import { AbilityOverlay } from "./components/game/AbilityOverlay";
import { Editor } from "./components/editor/Editor";
import { MainMenu } from "./components/menu/MainMenu";
import { generateLevel } from "./services/geminiService";
import {
  deserializeLevel,
  serializeLevel,
} from "./utils/levelSerialization";

const TOTAL_CAMPAIGN_LEVELS = 10;

const INITIAL_GAME_STATE: GameState = {
  score: 0,
  coins: 0,
  player: null,
};

const INITIAL_CAMPAIGN_PROGRESS: CampaignProgress = {
  currentLevel: 0,
  totalScore: 0,
};

type StatusMessage = {
  text: string;
  type: "ALERT" | "SUCCESS" | "INFO";
};

function getAbilityProgress(
  cooldown: number | undefined,
  maximumCooldown: number | undefined,
) {
  if (!cooldown || !maximumCooldown || maximumCooldown <= 0) {
    return 100;
  }

  const progress = (1 - cooldown / maximumCooldown) * 100;
  return Math.min(100, Math.max(0, progress));
}

export default function App() {
  const [mode, setMode] = useState<GameMode>("MENU");
  const [character, setCharacter] = useState<CharacterType>("MARIO");
  const [levelData, setLevelData] = useState<LevelData>(DEFAULT_LEVEL);
  const [gameState, setGameState] =
    useState<GameState>(INITIAL_GAME_STATE);
  const [isGenerating, setIsGenerating] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [generationError, setGenerationError] = useState<string | null>(
    null,
  );
  const [shareCode, setShareCode] = useState("");
  const [campaignProgress, setCampaignProgress] =
    useState<CampaignProgress>(INITIAL_CAMPAIGN_PROGRESS);
  const [statusMessage, setStatusMessage] =
    useState<StatusMessage | null>(null);

  const generationRequestId = useRef(0);
  const hasLoadedCampaignProgress = useRef(false);
  const { controls } = useControls();

  useEffect(() => {
    if (!statusMessage) {
      return;
    }

    const timer = window.setTimeout(() => {
      setStatusMessage(null);
    }, 3000);

    return () => window.clearTimeout(timer);
  }, [statusMessage]);

  useEffect(() => {
    try {
      const savedProgress = window.localStorage.getItem(
        "campaign-progress",
      );

      if (!savedProgress) {
        return;
      }

      const parsedProgress = JSON.parse(savedProgress) as CampaignProgress;

      if (
        typeof parsedProgress.currentLevel === "number" &&
        typeof parsedProgress.totalScore === "number"
      ) {
        setCampaignProgress(parsedProgress);
      }
    } catch (error) {
      console.error("Failed to load campaign progress:", error);
    } finally {
      hasLoadedCampaignProgress.current = true;
    }
  }, []);

  useEffect(() => {
    if (!hasLoadedCampaignProgress.current) {
      return;
    }

    try {
      window.localStorage.setItem(
        "campaign-progress",
        JSON.stringify(campaignProgress),
      );
    } catch (error) {
      console.error("Failed to save campaign progress:", error);
    }
  }, [campaignProgress]);

  const resetGameState = () => {
    setGameState(INITIAL_GAME_STATE);
  };

  const handleStartGame = () => {
    generationRequestId.current += 1;
    setGenerationError(null);
    setMode("PLAY");
    resetGameState();
  };

  const startCampaign = async () => {
    const requestId = generationRequestId.current + 1;
    generationRequestId.current = requestId;

    setIsGenerating(true);
    setGenerationError(null);
    setCampaignProgress(INITIAL_CAMPAIGN_PROGRESS);
    resetGameState();

    try {
      const firstLevel = await generateLevel(
        "A welcoming first level with green hills and few enemies",
        0,
      );

      if (requestId !== generationRequestId.current) {
        return;
      }

      if (!firstLevel) {
        setMode("MENU");
        setGenerationError(
          "FORGE_FAILURE: Initial campaign level could not be generated.",
        );
        setStatusMessage({
          text: "CAMPAIGN_INITIALIZATION_FAILED",
          type: "ALERT",
        });
        return;
      }

      setLevelData(firstLevel);
      setMode("CAMPAIGN");
      setStatusMessage({
        text: "CAMPAIGN_INITIALIZED",
        type: "SUCCESS",
      });
    } catch (error) {
      console.error("Failed to start campaign:", error);

      if (requestId === generationRequestId.current) {
        setMode("MENU");
        setGenerationError(
          "FORGE_CRITICAL: Campaign neural link severed.",
        );
        setStatusMessage({
          text: "CAMPAIGN_INITIALIZATION_FAILED",
          type: "ALERT",
        });
      }
    } finally {
      if (requestId === generationRequestId.current) {
        setIsGenerating(false);
      }
    }
  };

  const handleFinishLevel = async () => {
    if (mode !== "CAMPAIGN") {
      setMode("WIN");
      return;
    }

    const completedScore = gameState.score;
    const nextLevelIndex = campaignProgress.currentLevel + 1;

    if (nextLevelIndex >= TOTAL_CAMPAIGN_LEVELS) {
      setCampaignProgress((previous) => ({
        ...previous,
        totalScore: previous.totalScore + completedScore,
      }));
      setMode("WIN");
      return;
    }

    const requestId = generationRequestId.current + 1;
    generationRequestId.current = requestId;

    setIsGenerating(true);
    setGenerationError(null);

    try {
      const theme =
        CAMPAIGN_THEMES[nextLevelIndex] ??
        "progressive difficulty world";

      const nextLevel = await generateLevel(
        `A ${theme} level, difficulty: ${nextLevelIndex + 1}/${TOTAL_CAMPAIGN_LEVELS}`,
        nextLevelIndex,
      );

      if (requestId !== generationRequestId.current) {
        return;
      }

      if (!nextLevel) {
        setGenerationError(
          "FORGE_FAILURE: Next sector reconstruction failed.",
        );
        setStatusMessage({
          text: "NEXT_SECTOR_GENERATION_FAILED",
          type: "ALERT",
        });
        return;
      }

      setCampaignProgress((previous) => ({
        currentLevel: nextLevelIndex,
        totalScore: previous.totalScore + completedScore,
      }));
      setLevelData(nextLevel);
      resetGameState();
      setStatusMessage({
        text: `SECTOR_${nextLevelIndex + 1}_LOADED`,
        type: "SUCCESS",
      });
    } catch (error) {
      console.error("Failed to generate next campaign level:", error);

      if (requestId === generationRequestId.current) {
        setGenerationError(
          "FORGE_CRITICAL: Next sector neural link severed.",
        );
        setStatusMessage({
          text: "NEXT_SECTOR_GENERATION_FAILED",
          type: "ALERT",
        });
      }
    } finally {
      if (requestId === generationRequestId.current) {
        setIsGenerating(false);
      }
    }
  };

  const handleLoadCode = () => {
    const loadedLevel = deserializeLevel(shareCode.trim());

    if (!loadedLevel) {
      setStatusMessage({
        text: "ERR_INVALID_CODE_LINK",
        type: "ALERT",
      });
      return;
    }

    generationRequestId.current += 1;
    setLevelData(loadedLevel);
    setGenerationError(null);
    setMode("PLAY");
    resetGameState();

    setStatusMessage({
      text: "MISSION_DATA_SYNCED",
      type: "SUCCESS",
    });
  };

  const copyTextToClipboard = async (
    text: string,
    successMessage: string,
  ) => {
    try {
      if (!navigator.clipboard?.writeText) {
        throw new Error("Clipboard API is unavailable.");
      }

      await navigator.clipboard.writeText(text);

      setStatusMessage({
        text: successMessage,
        type: "SUCCESS",
      });

      return true;
    } catch (error) {
      console.error("Clipboard write failed:", error);

      setStatusMessage({
        text: "ERR_CLIPBOARD_ACCESS_DENIED",
        type: "ALERT",
      });

      return false;
    }
  };

  const generateShareCode = async () => {
    const code = serializeLevel(levelData);
    setShareCode(code);

    await copyTextToClipboard(code, "SECTOR_DATA_COPIED");
  };

  const handleEditorShare = async (code: string) => {
    setShareCode(code);
    await copyTextToClipboard(code, "SECTOR_DATA_COPIED");
  };

  const handleGenerateLevel = async () => {
    const requestId = generationRequestId.current + 1;
    generationRequestId.current = requestId;

    setIsGenerating(true);
    setGenerationError(null);

    try {
      const newLevel = await generateLevel(
        prompt.trim() || "A fun platform level with pipes and coins",
      );

      if (requestId !== generationRequestId.current) {
        return;
      }

      if (!newLevel) {
        setGenerationError(
          "FORGE_FAILURE: Level reconstruction failed.",
        );
        return;
      }

      setLevelData(newLevel);
      setStatusMessage({
        text: "LEVEL_FORGED",
        type: "SUCCESS",
      });
    } catch (error) {
      console.error("Level generation failed:", error);

      if (requestId === generationRequestId.current) {
        setGenerationError(
          "FORGE_CRITICAL: Neural link severed.",
        );
      }
    } finally {
      if (requestId === generationRequestId.current) {
        setIsGenerating(false);
      }
    }
  };

  const handleReplay = () => {
    generationRequestId.current += 1;
    setGenerationError(null);
    resetGameState();

    if (mode === "WIN" && campaignProgress.currentLevel > 0) {
      setMode("CAMPAIGN");
      return;
    }

    setMode("PLAY");
  };

  const handleReturnToMenu = () => {
    generationRequestId.current += 1;
    setIsGenerating(false);
    setGenerationError(null);
    setMode("MENU");
  };

  const isCampaignMode = mode === "CAMPAIGN";
  const isEndScreen = mode === "GAME_OVER" || mode === "WIN";

  const campaignLevelNumber = campaignProgress.currentLevel + 1;
  const campaignPercentage =
    (campaignLevelNumber / TOTAL_CAMPAIGN_LEVELS) * 100;

  const selectedCharacter = CHARACTERS[character];
  const abilityProgress = getAbilityProgress(
    gameState.player?.abilityCooldown,
    selectedCharacter.abilityCooldown,
  );

  return (
    <div className="relative min-h-screen overflow-hidden font-mono text-white selection:bg-blue-600 selection:text-white">
      <div className="noise-overlay" aria-hidden="true" />
      <div className="scanline" aria-hidden="true" />

      <AnimatePresence>
        {statusMessage && (
          <motion.div
            id="status-notification"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="pointer-events-none fixed right-4 bottom-4 z-[300] flex flex-col gap-2 sm:right-12 sm:bottom-12"
            role="status"
            aria-live="polite"
          >
            <div
              className={`flex items-center gap-4 rounded-2xl border px-6 py-3 backdrop-blur-xl ${
                statusMessage.type === "ALERT"
                  ? "border-red-500/50 bg-red-950/80 text-red-500"
                  : statusMessage.type === "SUCCESS"
                    ? "border-green-500/50 bg-green-950/80 text-green-500"
                    : "border-blue-500/50 bg-blue-950/80 text-blue-500"
              }`}
            >
              <div
                className={`h-2 w-2 animate-pulse rounded-full ${
                  statusMessage.type === "ALERT"
                    ? "bg-red-500"
                    : statusMessage.type === "SUCCESS"
                      ? "bg-green-500"
                      : "bg-blue-500"
                }`}
                aria-hidden="true"
              />
              <span className="text-xs font-black uppercase tracking-widest">
                {statusMessage.text}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Header
        mode={mode}
        coins={gameState.coins}
        score={gameState.score}
        onExit={handleReturnToMenu}
      />

      <main
        id="app-main-content"
        className="relative mx-auto max-w-7xl space-y-8 p-6"
      >
        <LoadingOverlay
          isVisible={isGenerating}
          currentLevel={campaignProgress.currentLevel}
        />

        <AnimatePresence mode="wait">
          {mode === "MENU" && (
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

          {(mode === "PLAY" || mode === "CAMPAIGN") && (
            <motion.div
              key={mode}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-6"
            >
              <section className="flex flex-col gap-4">
                {isCampaignMode && (
                  <div
                    className="space-y-2 px-2"
                    role="progressbar"
                    aria-label="Campaign progression"
                    aria-valuenow={campaignLevelNumber}
                    aria-valuemin={1}
                    aria-valuemax={TOTAL_CAMPAIGN_LEVELS}
                  >
                    <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-white/40">
                      <span>World Progression</span>
                      <span className="text-yellow-500">
                        Level {campaignLevelNumber} / {TOTAL_CAMPAIGN_LEVELS}
                      </span>
                    </div>

                    <div className="h-1.5 w-full overflow-hidden rounded-full border border-white/5 bg-white/5">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${campaignPercentage}%` }}
                        className="h-full bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]"
                      />
                    </div>
                  </div>
                )}

                <header className="flex items-end justify-between px-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      {isCampaignMode && (
                        <Trophy
                          size={14}
                          className="text-yellow-500"
                          aria-hidden="true"
                        />
                      )}

                      <span className="block text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
                        {isCampaignMode ? "Campaign Mode" : "Active Mission"}
                      </span>
                    </div>

                    <h2 className="text-3xl leading-none font-black italic uppercase">
                      {isCampaignMode
                        ? `World ${Math.floor(campaignProgress.currentLevel / 4) + 1}-${(campaignProgress.currentLevel % 4) + 1}`
                        : "Mushroom Kingdom"}
                    </h2>
                  </div>

                  {isCampaignMode && (
                    <div className="space-y-1 text-right">
                      <div className="flex flex-col items-end">
                        <p className="text-[8px] font-black uppercase tracking-widest text-white/30">
                          Grand Total
                        </p>

                        <motion.p
                          key={campaignProgress.totalScore + gameState.score}
                          initial={{ scale: 1.2, color: "#fff" }}
                          animate={{ scale: 1, color: "#eab308" }}
                          className="text-2xl font-black italic"
                        >
                          {(
                            campaignProgress.totalScore + gameState.score
                          ).toLocaleString()}
                        </motion.p>
                      </div>
                    </div>
                  )}
                </header>
              </section>

              <GameCanvas
                levelData={levelData}
                character={character}
                controls={controls}
                onStateChange={setGameState}
                onWin={handleFinishLevel}
                onGameOver={() => setMode("GAME_OVER")}
              />

              <AbilityOverlay
                active={(gameState.player?.invincibilityTime ?? 0) > 0}
                abilityName={selectedCharacter.abilityName}
              />

              <section
                className="grid grid-cols-1 gap-4 md:grid-cols-4"
                aria-label="Control hints and unit status"
              >
                <article className="tech-border space-y-4 rounded-3xl border border-white/5 bg-white/5 p-5">
                  <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-[0.2em] text-white/30">
                    <span>SYS_LOG: Ability_Link</span>
                    <span
                      className="h-2 w-2 animate-pulse rounded-full bg-green-500"
                      aria-hidden="true"
                    />
                  </div>

                  <div
                    className="h-2 w-full overflow-hidden rounded-full bg-white/5"
                    role="progressbar"
                    aria-label="Ability cooldown"
                    aria-valuenow={Math.round(abilityProgress)}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  >
                    <motion.div
                      initial={false}
                      animate={{ width: `${abilityProgress}%` }}
                      className="h-full bg-gradient-to-r from-blue-600 to-blue-400"
                    />
                  </div>

                  <div>
                    <p className="text-xs font-black italic uppercase tracking-tight text-white/90">
                      {selectedCharacter.abilityName}
                    </p>
                    <p className="mt-1 text-[9px] font-bold uppercase tracking-widest text-blue-500">
                      Press [X] to trigger
                    </p>
                  </div>
                </article>

                <article className="glass-panel flex items-center justify-between rounded-3xl border border-white/5 p-5 md:col-span-2">
                  <div className="flex items-center gap-5">
                    <div className="group relative flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-white/5">
                      <User
                        size={28}
                        className="text-white/40 transition-transform group-hover:scale-110"
                        aria-hidden="true"
                      />
                      <div
                        className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent"
                        aria-hidden="true"
                      />
                    </div>

                    <div className="space-y-1">
                      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20">
                        Operational_Hero
                      </p>

                      <h4 className="text-xl font-black italic uppercase tracking-tighter">
                        {selectedCharacter.name}
                      </h4>

                      <div className="flex flex-wrap gap-2">
                        {(selectedCharacter.description || "Base Unit")
                          .split(" ")
                          .map((word, index) => (
                            <span
                              key={`${word}-${index}`}
                              className="rounded bg-white/5 px-2 py-0.5 text-[8px] font-bold uppercase text-white/40"
                            >
                              {word}
                            </span>
                          ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    <span className="text-[9px] font-black uppercase tracking-widest text-white/20">
                      Movement_Pwr
                    </span>

                    <div
                      className="flex gap-1"
                      role="img"
                      aria-label={`Speed rating: ${selectedCharacter.speed} out of 5`}
                    >
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <div
                          key={rating}
                          className={`h-4 w-1.5 rounded-sm ${
                            rating <= selectedCharacter.speed
                              ? "bg-blue-500"
                              : "bg-white/5"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </article>

                <article className="tech-border flex items-center justify-center gap-8 rounded-3xl p-5">
                  <div className="flex flex-col items-center gap-2">
                    <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                      <Play
                        size={20}
                        className="text-white/40"
                        aria-hidden="true"
                      />
                    </div>
                    <span className="text-[8px] font-black uppercase tracking-widest text-white/20">
                      Run: WASD
                    </span>
                  </div>

                  <div className="flex flex-col items-center gap-2">
                    <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                      <Star
                        size={20}
                        className="text-white/40"
                        aria-hidden="true"
                      />
                    </div>
                    <span className="text-[8px] font-black uppercase tracking-widest text-white/20">
                      Jump: Space
                    </span>
                  </div>
                </article>
              </section>
            </motion.div>
          )}

          {mode === "EDITOR" && (
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
                  setMode("MENU");
                  setStatusMessage({
                    text: "MISSION_DATA_SAVED",
                    type: "SUCCESS",
                  });
                }}
                onShare={handleEditorShare}
              />
            </motion.div>
          )}

          {isEndScreen && (
            <motion.div
              key={`${mode}-${campaignProgress.currentLevel}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden p-6 sm:p-12"
              role="dialog"
              aria-modal="true"
              aria-labelledby="mission-status-title"
            >
              <div
                className="absolute inset-0 bg-[#050505]/95 backdrop-blur-3xl"
                aria-hidden="true"
              />
              <div className="scanline" aria-hidden="true" />

              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="tech-border glass-panel relative w-full max-w-2xl space-y-12 rounded-[64px] p-8 text-center sm:p-12"
              >
                <header className="space-y-6">
                  {mode === "WIN" ? (
                    <div className="space-y-8">
                      <motion.div
                        animate={{
                          rotate: [12, -12, 12],
                          scale: [1, 1.1, 1],
                        }}
                        transition={{ repeat: Infinity, duration: 4 }}
                        className="mx-auto flex h-32 w-32 items-center justify-center rounded-[40px] border-4 border-black bg-yellow-500 shadow-[0_30px_60px_rgba(234,179,8,0.4)]"
                      >
                        <Trophy
                          size={64}
                          className="text-black"
                          aria-hidden="true"
                        />
                      </motion.div>

                      <div className="space-y-2">
                        <h2
                          id="mission-status-title"
                          className="glitch-text break-words text-5xl leading-none font-black italic uppercase tracking-tighter sm:text-7xl lg:text-8xl"
                          data-text="MISSION_COMPLETE"
                        >
                          MISSION_COMPLETE
                        </h2>
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-yellow-500 sm:tracking-[0.5em]">
                          Sector Cleared // Authorization Verified
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-8">
                      <motion.div
                        animate={{ y: [-10, 10, -10] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        className="mx-auto flex h-32 w-32 items-center justify-center rounded-[40px] border-4 border-black bg-red-600 shadow-[0_30px_60px_rgba(220,38,38,0.4)]"
                      >
                        <AlertCircle
                          size={64}
                          className="text-white"
                          aria-hidden="true"
                        />
                      </motion.div>

                      <div className="space-y-2">
                        <h2
                          id="mission-status-title"
                          className="glitch-text break-words text-5xl leading-none font-black italic uppercase tracking-tighter sm:text-7xl lg:text-8xl"
                          data-text="UNIT_TERMINATED"
                        >
                          UNIT_TERMINATED
                        </h2>
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-red-500 sm:tracking-[0.5em]">
                          Critical Failure // Connection Lost
                        </p>
                      </div>
                    </div>
                  )}
                </header>

                <section
                  className="grid grid-cols-1 gap-6 md:grid-cols-2"
                  aria-label="Mission statistics"
                >
                  <article className="group space-y-2 rounded-[32px] border border-white/5 bg-white/5 p-8 transition-colors hover:bg-white/10">
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20">
                      Resource_Secured
                    </p>

                    <div className="flex items-center justify-center gap-3">
                      <Coins
                        size={20}
                        className="text-yellow-400"
                        aria-hidden="true"
                      />
                      <p className="text-4xl font-black italic tracking-tighter">
                        {gameState.coins.toString().padStart(3, "0")}
                      </p>
                    </div>
                  </article>

                  <article className="group space-y-2 rounded-[32px] border border-white/5 bg-white/5 p-8 transition-colors hover:bg-white/10">
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20">
                      Performance_Rating
                    </p>

                    <div className="flex items-center justify-center gap-3">
                      <Star
                        size={20}
                        className="text-blue-400"
                        aria-hidden="true"
                      />
                      <p className="text-4xl font-black italic tracking-tighter">
                        {gameState.score.toLocaleString()}
                      </p>
                    </div>
                  </article>

                  {campaignProgress.currentLevel > 0 && (
                    <article className="group flex flex-col items-center gap-4 rounded-[40px] border border-white/10 bg-white/5 p-8 md:col-span-2">
                      <div className="flex w-full items-center justify-between px-4">
                        <p className="text-[10px] leading-none font-black uppercase tracking-widest text-white/30">
                          Campaign_Log_0{campaignLevelNumber}
                        </p>

                        <span className="rounded-full border border-blue-500/20 bg-blue-500/10 px-4 py-1 text-[10px] font-black uppercase tracking-widest text-blue-500">
                          TOTAL: {campaignProgress.totalScore.toLocaleString()}
                        </span>
                      </div>

                      <h4 className="text-4xl font-black italic uppercase tracking-tighter text-white/90">
                        Reached_Sector{" "}
                        {Math.floor(campaignProgress.currentLevel / 4) + 1}-
                        {(campaignProgress.currentLevel % 4) + 1}
                      </h4>

                      <div
                        className="h-1.5 w-full overflow-hidden rounded-full bg-white/5"
                        role="progressbar"
                        aria-label="Campaign progress"
                        aria-valuenow={campaignLevelNumber}
                        aria-valuemin={1}
                        aria-valuemax={TOTAL_CAMPAIGN_LEVELS}
                      >
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${campaignPercentage}%` }}
                          className="h-full bg-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.5)]"
                        />
                      </div>
                    </article>
                  )}
                </section>

                <nav
                  className="flex flex-col gap-4 sm:flex-row"
                  aria-label="End game actions"
                >
                  <button
                    type="button"
                    onClick={handleReplay}
                    aria-label="Reboot mission"
                    className="flex flex-1 items-center justify-center gap-3 rounded-3xl bg-white py-6 text-sm font-black italic uppercase tracking-widest text-black shadow-xl shadow-white/10 transition-all hover:scale-[1.02] active:scale-95"
                  >
                    <RefreshCw size={18} aria-hidden="true" />
                    REBOOT_MISSION
                  </button>

                  <button
                    type="button"
                    onClick={handleReturnToMenu}
                    aria-label="Return to base"
                    className="flex flex-1 items-center justify-center gap-3 rounded-3xl border border-white/10 bg-white/5 py-6 text-sm font-black italic uppercase tracking-widest transition-colors hover:bg-white/10"
                  >
                    <Settings size={18} aria-hidden="true" />
                    RETURN_TO_BASE
                  </button>
                </nav>

                <div
                  className="pointer-events-none absolute top-12 left-12 opacity-5"
                  aria-hidden="true"
                >
                  <Star size={200} />
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <Footer />
    </div>
  );
}
