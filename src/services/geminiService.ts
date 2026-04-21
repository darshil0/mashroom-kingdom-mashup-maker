/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { TileType, EntityType } from "../types";

export async function generateLevel(prompt: string, levelIndex: number = 0): Promise<any> {
  try {
    const response = await fetch('/api/generate-level', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, levelIndex })
    });
    
    if (!response.ok) throw new Error('API request failed');
    return await response.json();
  } catch (error) {
    console.error("Failed to generate level:", error);
    return null;
  }
}
