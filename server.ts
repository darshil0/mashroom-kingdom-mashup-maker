import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from "@google/genai";
import path from 'path';

const app = express();
app.use(express.json());

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

const LEVEL_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    width: { type: Type.NUMBER, description: "Width of the level in tiles" },
    height: { type: Type.NUMBER, description: "Height of the level in tiles" },
    tiles: {
      type: Type.ARRAY,
      items: {
        type: Type.ARRAY,
        items: { type: Type.STRING, description: "Tile type: EMPTY, GROUND, BRICK, QUESTION, PIPE_TOP_LEFT, etc." }
      }
    },
    entities: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          type: { type: Type.STRING, description: "Entity type: GOOMBA, COIN, MUSHROOM" },
          x: { type: Type.NUMBER, description: "X coordinate in tiles" },
          y: { type: Type.NUMBER, description: "Y coordinate in tiles" }
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
    console.error("Failed to generate level:", error);
    res.status(500).json({ error: "Generation failed" });
  }
});

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
