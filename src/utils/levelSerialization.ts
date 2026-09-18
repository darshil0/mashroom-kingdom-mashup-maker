import { LevelData, TileType, EntityType } from '../core/types';

const TILE_MAP: Record<TileType, string> = {
  EMPTY: '0', GROUND: '1', BRICK: '2', QUESTION: '3', SPENT: '4',
  PIPE_TOP_LEFT: '5', PIPE_TOP_RIGHT: '6', PIPE_BODY_LEFT: '7', PIPE_BODY_RIGHT: '8',
  GOAL_TOP: '9', GOAL_BODY: 'A', SPIKE: 'B', SKY: 'C',
};
const REV_TILE_MAP: Record<string, TileType> = Object.fromEntries(Object.entries(TILE_MAP).map(([key, value]) => [value, key as TileType]));
const ENTITY_MAP: Record<EntityType, string> = { PLAYER: 'p', GOOMBA: 'e', MUSHROOM: 'm', COIN: 'c' };
const REV_ENTITY_MAP: Record<string, EntityType> = Object.fromEntries(Object.entries(ENTITY_MAP).map(([key, value]) => [value, key as EntityType]));

export function serializeLevel(level: LevelData): string {
  try {
    if (!Number.isInteger(level.width) || !Number.isInteger(level.height) || level.tiles.length !== level.height) return '';
    const tiles = level.tiles.map((row) => row.map((tile) => TILE_MAP[tile] ?? TILE_MAP.EMPTY).join('')).join('|');
    const entities = level.entities.map((entity) => `${ENTITY_MAP[entity.type] ?? 'e'}${Math.floor(entity.x)},${Math.floor(entity.y)}`).join(';');
    return btoa(`${level.width}x${level.height}:${tiles}:${entities}`);
  } catch (error) {
    console.error('Serialization failed:', error);
    return '';
  }
}

export function deserializeLevel(code: string): LevelData | null {
  try {
    const [dims, tilesPart, entitiesPart = ''] = atob(code).split(':');
    const [width, height] = dims.split('x').map(Number);
    if (!Number.isInteger(width) || !Number.isInteger(height) || width <= 0 || height <= 0) return null;
    const rows = tilesPart.split('|');
    if (rows.length !== height || rows.some((row) => row.length !== width)) return null;
    const tiles = rows.map((row) => Array.from(row, (char) => REV_TILE_MAP[char] ?? 'EMPTY'));
    const entities = entitiesPart ? entitiesPart.split(';').filter(Boolean).map((value) => {
      const type = REV_ENTITY_MAP[value[0]];
      const [x, y] = value.slice(1).split(',').map(Number);
      return type && Number.isFinite(x) && Number.isFinite(y) ? { type, x, y } : null;
    }).filter((entity): entity is { type: EntityType; x: number; y: number } => entity !== null) : [];
    return { width, height, tiles, entities };
  } catch (error) {
    console.error('Deserialization failed:', error);
    return null;
  }
}
