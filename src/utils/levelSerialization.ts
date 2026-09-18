/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { LevelData, TileType, EntityType } from '../core/types';

// Simple mapping for compression
const TILE_MAP: Record<string, string> = {
  'EMPTY': '0',
  'GROUND': '1',
  'BRICK': '2',
  'QUESTION': '3',
  'PIPE_TOP_LEFT': '4',
  'PIPE_TOP_RIGHT': '5',
  'PIPE_BODY_LEFT': '6',
  'PIPE_BODY_RIGHT': '7',
  'GOAL_TOP': '8',
  'GOAL_BODY': '9',
  'SPIKE': 'A',
  'SPENT': 'B',
  'SKY': 'C',
};

const REV_TILE_MAP: Record<string, TileType> = Object.fromEntries(
  Object.entries(TILE_MAP).map(([k, v]) => [v, k as TileType])
);

const ENTITY_MAP: Record<string, string> = {
  'GOOMBA': 'e',
  'COIN': 'c',
  'MUSHROOM': 'm',
};

const REV_ENTITY_MAP: Record<string, EntityType> = Object.fromEntries(
  Object.entries(ENTITY_MAP).map(([k, v]) => [v, k as EntityType])
);

/**
 * Validates and sanitizes a LevelData payload to ensure it is safe and properly formatted for gameplay.
 */
export function validateAndSanitizeLevel(data: any): LevelData | null {
  if (!data || typeof data !== 'object') return null;

  const width = Number(data.width);
  const height = Number(data.height);

  if (!Number.isInteger(width) || width <= 0 || !Number.isInteger(height) || height <= 0) {
    return null;
  }

  if (!Array.isArray(data.tiles)) return null;

  const sanitizedTiles: TileType[][] = [];

  for (let y = 0; y < height; y++) {
    const row = data.tiles[y];
    const sanitizedRow: TileType[] = [];
    for (let x = 0; x < width; x++) {
      const tile = row && row[x];
      if (typeof tile === 'string' && (tile in TILE_MAP || tile === 'EMPTY')) {
        sanitizedRow.push(tile as TileType);
      } else {
        sanitizedRow.push('EMPTY');
      }
    }
    sanitizedTiles.push(sanitizedRow);
  }

  const sanitizedEntities: { type: EntityType; x: number; y: number }[] = [];
  if (Array.isArray(data.entities)) {
    for (const e of data.entities) {
      if (
        e &&
        typeof e === 'object' &&
        typeof e.type === 'string' &&
        (e.type === 'GOOMBA' || e.type === 'COIN' || e.type === 'MUSHROOM') &&
        typeof e.x === 'number' &&
        !isNaN(e.x) &&
        typeof e.y === 'number' &&
        !isNaN(e.y)
      ) {
        sanitizedEntities.push({
          type: e.type as EntityType,
          x: Math.max(0, Math.min(width - 1, e.x)),
          y: Math.max(0, Math.min(height - 1, e.y)),
        });
      }
    }
  }

  return {
    width,
    height,
    tiles: sanitizedTiles,
    entities: sanitizedEntities,
  };
}

/**
 * Serializes LevelData to a compact Base64 string for sharing.
 */
export function serializeLevel(level: LevelData): string {
  try {
    const validated = validateAndSanitizeLevel(level);
    if (!validated) return '';

    const tilesStr = validated.tiles.map(row => row.map(t => TILE_MAP[t] || '0').join('')).join('|');
    const entitiesStr = validated.entities.map(e => `${ENTITY_MAP[e.type]}${e.x},${e.y}`).join(';');
    const raw = `${validated.width}x${validated.height}:${tilesStr}:${entitiesStr}`;
    return btoa(raw);
  } catch (e) {
    console.error('Serialization failed:', e);
    return '';
  }
}

/**
 * Deserializes a LevelData string.
 */
export function deserializeLevel(code: string): LevelData | null {
  try {
    const raw = atob(code);
    const parts = raw.split(':');
    if (parts.length < 2) return null;
    const [dims, tilesPart, entitiesPart] = parts;
    const [width, height] = dims.split('x').map(Number);
    
    if (!width || !height || !tilesPart) return null;
    
    // Parse tiles
    const rows = tilesPart.split('|');
    if (rows.length === 0) return null;
    const tiles: TileType[][] = rows.map(row => 
      row.split('').map(char => REV_TILE_MAP[char] || 'EMPTY')
    );

    // Parse entities
    const entities = entitiesPart ? entitiesPart.split(';').filter(Boolean).map(eStr => {
      const typeChar = eStr[0];
      const parts = eStr.slice(1).split(',');
      if (parts.length < 2) return null;
      const [x, y] = parts.map(Number);
      const entityType = REV_ENTITY_MAP[typeChar];
      if (!entityType) return null;
      return { type: entityType, x: x || 0, y: y || 0 };
    }).filter((e): e is { type: EntityType; x: number; y: number } => e !== null) : [];

    return validateAndSanitizeLevel({ width, height, tiles, entities });
  } catch (e) {
    console.error('Deserialization failed:', e);
    return null;
  }
}
