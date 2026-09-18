# 🍄 Mushroom Kingdom Mashup Maker

A React/TypeScript platformer and level editor powered by Vite, Express, and Google Gemini. Build, play, and share custom levels through the Mission Control interface.

## Features

- AI-generated levels with validated structured responses
- Playable platformer with Mario, Luigi, Toad, and Peach abilities
- Grid-based editor with shareable level codes
- Ten-sector campaign progression
- Responsive technical dashboard UI

## Requirements

- Node.js 18+
- npm 9+
- Gemini API key for AI generation

## Setup

```bash
git clone https://github.com/darshil0/mashroom-kingdom-mashup-maker.git
cd mashroom-kingdom-mashup-maker
cp .env.example .env
npm install
npm run dev
```

The Express development server serves the Vite app at `http://localhost:3000`.

## Environment

```env
GEMINI_API_KEY="your_gemini_key_here"
PORT=3000
DISABLE_HMR=false
```

AI generation returns a validated `LevelData` payload. If the key is missing, the app remains available but level generation returns a clear configuration error.

## Commands

- `npm run dev` — start the Express/Vite development server
- `npm run lint` — run TypeScript checks
- `npm run build` — create a production client build
- `npm run start` — start the server

## Controls

- WASD or arrow keys: move
- Space: jump
- X, Shift, or P: use the character ability
- In the editor, Tab switches tools, brackets cycle selections, and right-click removes entities

## License

Apache-2.0
