/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export async function generateLevel(prompt: string, levelIndex: number = 0): Promise<unknown> {
  try {
    const response = await fetch('/api/generate-level', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, levelIndex })
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `API request failed with status ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Failed to generate level:", error);
    alert(error instanceof Error ? error.message : "Failed to generate level");
    return null;
  }
}
