import { LevelData } from '../core/types';

function isValidLevelData(value: unknown): value is LevelData {
  if (!value || typeof value !== 'object') return false;
  const level = value as Record<string, unknown>;
  if (!Number.isInteger(level.width) || !Number.isInteger(level.height) || level.width <= 0 || level.height <= 0) return false;
  if (!Array.isArray(level.tiles) || !Array.isArray(level.entities) || level.tiles.length !== level.height) return false;
  return level.tiles.every((row) => Array.isArray(row) && row.length === level.width) && level.entities.every((entity) => {
    if (!entity || typeof entity !== 'object') return false;
    const item = entity as Record<string, unknown>;
    return typeof item.type === 'string' && Number.isFinite(item.x) && Number.isFinite(item.y);
  });
}

export async function generateLevel(prompt: string, levelIndex = 0, maxRetries = 1): Promise<LevelData | null> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch('/api/generate-level', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, levelIndex }),
        signal: AbortSignal.timeout(15000),
      });
      if (!response.ok) throw new Error(`API error: ${response.status}`);
      const payload: unknown = await response.json();
      if (!isValidLevelData(payload)) throw new Error('Invalid level data returned from server');
      return payload;
    } catch (error) {
      if (attempt === maxRetries) {
        console.error('Level generation failed after retries:', error);
        return null;
      }
      await new Promise((resolve) => setTimeout(resolve, 1000 * (attempt + 1)));
    }
  }
  return null;
}
