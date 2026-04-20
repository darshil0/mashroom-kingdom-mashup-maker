/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const TILE_SIZE = 32;
export const GRAVITY = 0.5;
export const FRICTION = 0.85;

export const CHARACTERS = {
  MARIO: {
    name: 'Mario',
    speed: 4,
    jumpForce: 12,
    abilityName: 'Fire Cyclone',
    abilityCooldown: 300, // frames
    color: '#E22222',
  },
  LUIGI: {
    name: 'Luigi',
    speed: 3.5,
    jumpForce: 14.5,
    abilityName: 'Ghost Dash',
    abilityCooldown: 400,
    color: '#22B222',
  },
  TOAD: {
    name: 'Toad',
    speed: 5.5,
    jumpForce: 10,
    abilityName: 'Super Sprout',
    abilityCooldown: 250,
    color: '#F2F2F2',
  },
  PEACH: {
    name: 'Peach',
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
