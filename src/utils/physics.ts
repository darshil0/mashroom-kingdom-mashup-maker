/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { TILE_SIZE } from '../constants';
import { TileType, Vector2D } from '../types';

export interface CollisionResult {
  collision: boolean;
  type?: TileType;
  x?: number;
  y?: number;
}

export function checkTileCollision(
  pos: Vector2D,
  width: number,
  height: number,
  tiles: TileType[][]
): CollisionResult {
  const left = Math.floor(pos.x / TILE_SIZE);
  const right = Math.floor((pos.x + width - 1) / TILE_SIZE);
  const top = Math.floor(pos.y / TILE_SIZE);
  const bottom = Math.floor((pos.y + height - 1) / TILE_SIZE);

  for (let y = top; y <= bottom; y++) {
    for (let x = left; x <= right; x++) {
      if (y >= 0 && y < tiles.length && x >= 0 && x < tiles[0].length) {
        const tile = tiles[y][x];
        if (tile !== 'EMPTY') {
          return { collision: true, type: tile, x, y };
        }
      }
    }
  }

  return { collision: false };
}

export function isRectOverlap(
  r1: { x: number; y: number; w: number; h: number },
  r2: { x: number; y: number; w: number; h: number }
): boolean {
  return (
    r1.x < r2.x + r2.w &&
    r1.x + r1.w > r2.x &&
    r1.y < r2.y + r2.h &&
    r1.y + r1.h > r2.y
  );
}
