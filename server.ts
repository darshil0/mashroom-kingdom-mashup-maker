import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from "@google/genai";
import path from 'path';

const app = express();
app.use(express.json());

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

const LEVEL_SCHEMA = {
  type: 'object' as any,
  properties: {
    width: { type: 'number' as any, description: "Width of the level in tiles" },
    height: { type: 'number' as any, description: "Height of the level in tiles" },
    tiles: {
      type: 'array' as any,
      items: {
        type: 'array' as any,
        items: { type: 'string' as any, description: "Tile type: EMPTY, GROUND, BRICK, QUESTION, PIPE_TOP_LEFT, etc." }
      }
    },
    entities: {
      type: 'array' as any,
      items: {
        type: 'object' as any,
        properties: {
          type: { type: 'string' as any, description: "Entity type: GOOMBA, COIN, MUSHROOM" },
          x: { type: 'number' as any, description: "X coordinate in tiles" },
          y: { type: 'number' as any, description: "Y coordinate in tiles" }
        }
      }
    }
  },
  required: ["width", "height", "tiles", "entities"]
};

// API: Generate Level
app.post('/api/generate-level', async (req, res) => {
  const { prompt, levelIndex } = req.body;
  const idx = levelIndex || 0;
  
  const difficultyLabel = idx === 0 ? "balanced" : 
                         idx < 3 ? "challenging but fair" :
                         idx < 6 ? "difficult with many traps and hazards" :
                         "brutally difficult, requiring precise platforming mastery";

  const width = idx < 3 ? 40 : idx < 6 ? 60 : 80;

  // Fallback level if API key is missing
  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "your_api_key_here" || process.env.GEMINI_API_KEY === "MY_GEMINI_API_KEY") {
    console.log("Using fallback level due to missing API key");
    return res.json(generateFallbackLevel(width));
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{
        role: "user",
        parts: [{
          text: `Generate a Mushroom Kingdom platformer level.
          Goal/Theme: ${prompt || "standard world"}
          Context: This is Level ${idx + 1} of a campaign.
          Required Difficulty: ${difficultyLabel}
          Grid Constraints: Exactly 15 tiles high, ${width} tiles wide.
          
          Tiles: 
          - 'EMPTY': air
          - 'GROUND': solid ground
          - 'BRICK': breakable brick
          - 'QUESTION': question mark block
          - 'PIPE_TOP_LEFT', 'PIPE_TOP_RIGHT', 'PIPE_BODY_LEFT', 'PIPE_BODY_RIGHT'
          - 'SPIKE': hazard
          - 'GOAL_TOP', 'GOAL_BODY': the finish line (at the end of level)
          Entities:
          - 'GOOMBA': walking enemy
          - 'COIN': collectible
          - 'MUSHROOM': powerup
          
          RULES:
          1. Always have a continuous ground or platforms so it's playable.
          2. The character starts at (2, 10).
          3. The GOAL must be reachable at the far right edge of the level.
          4. Place coins and enemies.
          5. For higher levels, increase enemy density and use more spikes/pits.
          `
        }]
      }],
      config: {
        responseMimeType: "application/json",
        responseSchema: LEVEL_SCHEMA,
      },
    });

    const text = response.text;
    if (!text) throw new Error("Empty response");
    res.json(JSON.parse(text));
  } catch (error) {
    console.error("Failed to generate level, using fallback:", error);
    res.json(generateFallbackLevel(width));
  }
});

function generateFallbackLevel(width: number) {
  const tiles: string[][] = Array(15).fill(null).map((_, y) =>
    Array(width).fill(null).map((_, x) => {
      if (y === 14) return 'GROUND';
      if (x === width - 5 && y > 10) return 'GOAL_BODY';
      if (x === width - 5 && y === 10) return 'GOAL_TOP';
      return 'EMPTY';
    })
  );

  // Add some random platforms and coins
  for (let x = 5; x < width - 10; x += 5) {
    tiles[11][x] = 'BRICK';
    tiles[11][x+1] = 'QUESTION';
    tiles[11][x+2] = 'BRICK';
  }

  return {
    width,
    height: 15,
    tiles,
    entities: [
      { type: 'COIN', x: 10, y: 13 },
      { type: 'COIN', x: 12, y: 13 },
      { type: 'GOOMBA', x: 20, y: 13 },
      { type: 'MUSHROOM', x: 6, y: 10 },
    ]
  };
}

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(3000, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:3000`);
  });
}

startServer();
