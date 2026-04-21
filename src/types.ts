/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type TileType = 
  | 'EMPTY' 
  | 'GROUND' 
  | 'BRICK' 
  | 'QUESTION' 
  | 'SPENT'
  | 'PIPE_TOP_LEFT' 
  | 'PIPE_TOP_RIGHT' 
  | 'PIPE_BODY_LEFT' 
  | 'PIPE_BODY_RIGHT'
  | 'GOAL_TOP'
  | 'GOAL_BODY'
  | 'SPIKE'
  | 'SKY';

export type EntityType = 
  | 'PLAYER' 
  | 'GOOMBA' 
  | 'MUSHROOM' 
  | 'COIN';

export type CharacterType = 'MARIO' | 'LUIGI' | 'TOAD' | 'PEACH';

export interface Vector2D {
  x: number;
  y: number;
}

export interface Entity {
  id: string;
  type: EntityType;
  pos: Vector2D;
  vel: Vector2D;
  width: number;
  height: number;
  isGrounded: boolean;
  isDead: boolean;
  direction: number; // -1 for left, 1 for right
}

export interface Player extends Entity {
  character: CharacterType;
  isBig: boolean;
  score: number;
  coins: number;
  abilityCooldown: number;
  invincibilityTime: number;
}

export interface LevelData {
  width: number;
  height: number;
  tiles: TileType[][];
  entities: {
    type: EntityType;
    x: number;
    y: number;
  }[];
}

/** Shared type for game state passed between components. */
export interface GameState {
  score: number;
  coins: number;
  player: Player | null;
}

/** Campaign progress tracking. */
export interface CampaignProgress {
  currentLevel: number;
  totalScore: number;
  unlocked: number;
}

export type GameMode = 'MENU' | 'EDITOR' | 'PLAY' | 'GAME_OVER' | 'WIN' | 'CAMPAIGN' | 'LEVEL_SELECT';
