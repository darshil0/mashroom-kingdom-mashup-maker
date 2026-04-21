/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { LevelData, TileType, EntityType } from '../../core/types';
import { TILE_SIZE, COLORS } from '../../core/constants';
import { EditorToolbar } from './EditorToolbar';
import { serializeLevel } from '../../utils/levelSerialization';
import { motion } from 'motion/react';
import { Wand2, Hammer, Check, AlertCircle } from 'lucide-react';

interface EditorProps {
  initialLevel: LevelData;
  onSave: (data: LevelData) => void;
  onShare: (code: string) => void;
}

export const Editor: React.FC<EditorProps> = ({ initialLevel, onSave, onShare }) => {
  const [level, setLevel] = useState<LevelData>(JSON.parse(JSON.stringify(initialLevel)));

  // Sync with parent when initialLevel changes (e.g. from share code)
  useEffect(() => {
    setLevel(JSON.parse(JSON.stringify(initialLevel)));
  }, [initialLevel]);

  const [selectedTile, setSelectedTile] = useState<TileType>('GROUND');
  const [selectedEntity, setSelectedEntity] = useState<EntityType | null>(null);
  const [tool, setTool] = useState<'TILE' | 'ENTITY'>('TILE');
  const [copied, setCopied] = useState(false);
  const [currentCode, setCurrentCode] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const TILE_LIST: TileType[] = ['GROUND', 'BRICK', 'QUESTION', 'SPENT', 'SPIKE', 'PIPE_TOP_LEFT', 'GOAL_TOP'];
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
    if (x < 0 || x >= level.width || y < 0 || y >= level.height) return;

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
        <EditorToolbar 
          tool={tool}
          selectedTile={selectedTile}
          selectedEntity={selectedEntity}
          onToolChange={setTool}
          onTileSelect={setSelectedTile}
          onEntitySelect={setSelectedEntity}
        />

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
