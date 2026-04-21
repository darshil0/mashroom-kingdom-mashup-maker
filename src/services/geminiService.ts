/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { LevelData } from "../types";

export async function generateLevel(prompt: string, levelIndex: number = 0): Promise<LevelData | null> {
  try {
    const response = await fetch('/api/generate-level', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, levelIndex })
    });
    
    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      throw new Error(`API request failed (${response.status}): ${errorText}`);
    }
    return await response.json() as LevelData;
  } catch (error) {
    console.error("Failed to generate level:", error);
    return null;
  }
}
