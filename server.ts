import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from "@google/genai";
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());

// Initialize Gemini with proper error handling
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error('FATAL_ERR: GEMINI_API_KEY environment variable not set. Exiting.');
  process.exit(1);
}

const ai = new GoogleGenAI({ apiKey });

const LEVEL_SCHEMA: any = {
  type: 'object',
  properties: {
    width: { type: 'number', description: "Width of the level in tiles" },
    height: { type: 'number', description: "Height of the level in tiles" },
    tiles: {
      type: 'array',
      items: {
        type: 'array',
        items: { type: 'string', description: "Tile type: EMPTY, GROUND, BRICK, QUESTION, PIPE_TOP_LEFT, etc." }
      }
    },
    entities: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          type: { type: 'string', description: "Entity type: GOOMBA, COIN, MUSHROOM" },
          x: { type: 'number', description: "X coordinate in tiles" },
          y: { type: 'number', description: "Y coordinate in tiles" }
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
    const model = ai.getGenerativeModel({ 
      model: "gemini-3-flash-preview",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: LEVEL_SCHEMA,
      }
    });

    const result = await model.generateContent(`Generate a Mushroom Kingdom platformer level.
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
    `);

    const response = await result.response;
    const text = response.text();
    
    if (!text) throw new Error("Empty response from Gemini");
    
    const levelData = JSON.parse(text);
    
    // Validate response structure
    if (!levelData.width || !levelData.height || !Array.isArray(levelData.tiles) || !Array.isArray(levelData.entities)) {
      throw new Error("Invalid level schema returned from Gemini");
    }
    
    res.json(levelData);
  } catch (error) {
    console.error("Failed to generate level:", error);
    res.status(500).json({ 
      error: "FORGE_CRITICAL: Level generation failed",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OPERATIONAL', version: 'v1.8.0' });
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

  const port = 3000;
  const host = "0.0.0.0";
  
  app.listen(port, host, () => {
    console.log(`SYSTEM_READY: Mashup Engine running on http://localhost:${port}`);
  });
}

startServer().catch(err => {
  console.error("FATAL_ERR: Failed to start server:", err);
  process.exit(1);
});
