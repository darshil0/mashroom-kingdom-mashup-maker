/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { TileType, EntityType } from "../core/types";

export async function generateLevel(
  prompt: string, 
  levelIndex: number = 0,
  maxRetries: number = 1
): Promise<any | null> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch('/api/generate-level', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, levelIndex }),
        signal: AbortSignal.timeout(15000) // 15 second timeout
      });
      
      if (!response.ok) {
        if (response.status === 429) {
          throw new Error('RATE_LIMITED: Gemini API quota exceeded');
        }
        throw new Error(`API error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      if (attempt === maxRetries) {
        console.error('Level generation failed after retries:', error);
        return null;
      }
      await new Promise(r => setTimeout(r, 1000 * (attempt + 1))); // Exponential backoff
    }
  }
  return null;
}
