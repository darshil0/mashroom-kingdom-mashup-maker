/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { LevelData } from './types';

export const TILE_SIZE = 32;
export const GRAVITY = 0.5;
export const FRICTION = 0.85;

export const CHARACTERS = {
  MARIO: {
    name: 'Mario',
    description: 'The balanced hero. Agile and powerful.',
    speed: 4,
    jumpForce: 12,
    abilityName: 'Fire Cyclone',
    abilityCooldown: 300, // frames
    color: '#E22222',
  },
  LUIGI: {
    name: 'Luigi',
    description: 'The master of height. Slippery but reaches high places.',
    speed: 3.5,
    jumpForce: 14.5,
    abilityName: 'Ghost Dash',
    abilityCooldown: 400,
    color: '#22B222',
  },
  TOAD: {
    name: 'Toad',
    description: 'The speedster. Low jump but unparalleled swiftness.',
    speed: 5.5,
    jumpForce: 10,
    abilityName: 'Super Sprout',
    abilityCooldown: 250,
    color: '#F2F2F2',
  },
  PEACH: {
    name: 'Peach',
    description: 'The tactician. Floats gracefully and deploys shields.',
    speed: 3.8,
    jumpForce: 11,
    abilityName: 'Crystal Barrier',
    abilityCooldown: 500,
    color: '#FFB2E2',
  },
};

export const COLORS = {
  SKY: '#5C94FC',
  GROUND: '#944400',
  BRICK: '#B83220',
  QUESTION: '#E4A010',
  PIPE: '#40A020',
  PIPE_TOP_LEFT: '#40A020',
  PIPE_TOP_RIGHT: '#40A020',
  PIPE_BODY_LEFT: '#40A020',
  PIPE_BODY_RIGHT: '#40A020',
  GOAL: '#F8D800',
  GOAL_TOP: '#F8D800',
  GOAL_BODY: '#F8D800',
  SPIKE: '#707070',
  COIN: '#F8D800',
  GOOMBA: '#A04000',
  MUSHROOM: '#F83800',
};

/** Default level used when no AI-generated level is available. */
export const DEFAULT_LEVEL: LevelData = {
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

/** Campaign level themes, indexed by level number. */
export const CAMPAIGN_THEMES = [
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
