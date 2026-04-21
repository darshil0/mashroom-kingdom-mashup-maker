import React from 'react';
import { TileType, EntityType } from '../types';
import { COLORS } from '../constants';

interface EditorToolbarProps {
  tool: 'TILE' | 'ENTITY';
  selectedTile: TileType;
  selectedEntity: EntityType | null;
  onToolChange: (tool: 'TILE' | 'ENTITY') => void;
  onTileSelect: (tile: TileType) => void;
  onEntitySelect: (entity: EntityType) => void;
}

export const EditorToolbar: React.FC<EditorToolbarProps> = ({ 
  tool, selectedTile, selectedEntity, onToolChange, onTileSelect, onEntitySelect 
}) => {
  const TILE_LIST: TileType[] = ['GROUND', 'BRICK', 'QUESTION', 'SPIKE', 'PIPE_TOP_LEFT', 'GOAL_TOP'];
  const ENTITY_LIST: EntityType[] = ['GOOMBA', 'COIN', 'MUSHROOM'];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex bg-white/5 rounded-2xl p-1 border border-white/10 overflow-hidden shadow-inner">
        <button
          onClick={() => onToolChange('TILE')}
          className={`flex-1 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
            tool === 'TILE' ? 'bg-white/10 text-white shadow-lg' : 'text-white/30 hover:text-white/60'
          }`}
        >
          Tiles
        </button>
        <button
          onClick={() => onToolChange('ENTITY')}
          className={`flex-1 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
            tool === 'ENTITY' ? 'bg-white/10 text-white shadow-lg' : 'text-white/30 hover:text-white/60'
          }`}
        >
          Entities
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {tool === 'TILE' ? (
          TILE_LIST.map(t => (
            <button
              key={t}
              onClick={() => onTileSelect(t)}
              className={`w-full aspect-square rounded-2xl border-2 transition-all flex items-center justify-center group relative overflow-hidden ${
                selectedTile === t ? 'border-white bg-white/10 shadow-lg scale-105 z-10' : 'border-white/5 bg-white/5 hover:border-white/20'
              }`}
            >
              <div 
                className="w-10 h-10 rounded-lg shadow-inner group-hover:scale-110 transition-transform" 
                style={{ backgroundColor: (COLORS as any)[t] }} 
              />
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          ))
        ) : (
          ENTITY_LIST.map(e => (
            <button
              key={e}
              onClick={() => onEntitySelect(e)}
              className={`w-full aspect-square rounded-2xl border-2 transition-all flex items-center justify-center group relative overflow-hidden ${
                selectedEntity === e ? 'border-white bg-white/10 shadow-lg scale-105 z-10' : 'border-white/5 bg-white/5 hover:border-white/20'
              }`}
            >
              <div className="w-10 h-10 rounded-full border-4 border-yellow-500/30 flex items-center justify-center bg-yellow-500/10 group-hover:scale-110 transition-transform">
                <span className="text-yellow-500 font-black text-xl">{e[0]}</span>
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          ))
        )}
      </div>
    </div>
  );
};
