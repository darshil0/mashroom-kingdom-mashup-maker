# 🍄 Mushroom Kingdom Mashup Maker

A retro-inspired platformer and level editor enriched with AI level generation. Build, play, and share your own Mushroom Kingdom adventures.

## 🌟 Features

- **AI Level Generation**: Powered by the Gemini AI (`gemini-3-flash-preview`). Generate infinite, customized levels using natural language prompts — with graceful fallback when the API is unavailable.
- **Modern Technical Dashboard**: A cinematic "Mission Control" UI featuring scanlines, glassmorphism, and animated tech-borders.
- **Hybrid Architecture (50% HTML)**: Optimized for performance and accessibility by blending React logic with high-speed semantic HTML structures.
- **Extensive Technical Library**: Integrated on-board documentation covering lore, technical specifications, API references, and sector mapping logs.
- **Multiple Characters**: Play as Mario, Luigi, Toad, or Peach, each with unique stats and special abilities.
  - **Mario**: Fire Cyclone (Spin attack — kills nearby enemies)
  - **Luigi**: Ghost Dash (Invincible dash forward through space)
  - **Toad**: Super Sprout (High-powered super jump)
  - **Peach**: Crystal Barrier (3-second invincibility shield)
- **Comprehensive Editor**: A grid-based tile and entity editor for handcrafting levels with keyboard shortcuts.
  - `Tab` — Switch between Tile and Entity tools
  - `[` / `]` — Cycle through selections
  - `1-9` — Quick select tools
  - Right-click — Remove entities
- **Level Sharing**: Serialize your levels into compact Base64 codes to share with friends. Load and play shared levels instantly.
- **Campaign Mode**: Progress through a sequence of 10 AI-generated levels with increasing difficulty and thematic progression (Green Hills → Lava Castle → Final Fortress).
- **Enhanced Physics & Collision**: Tile-based collisions, momentum-driven movement, and reactive entity AI (Goombas with ledge detection, Coins, Mushrooms).
- **Retro Aesthetic**: Visuals and UI inspired by classic 8-bit and 16-bit platformers, built with Tailwind CSS and Motion.

## 🛠️ Tech Stack

- **Framework**: React 19 with TypeScript
- **Bundler**: Vite 6
- **Backend**: Express.js (serves API + Vite dev middleware)
- **Architecture**: Hybrid React / Semantic HTML5
- **Styling**: Tailwind CSS 4
- **Animations**: Motion (framer-motion)
- **Icons**: Lucide React
- **AI Engine**: Google Gemini API (`@google/genai`)
- **Rendering**: HTML5 Canvas API

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- A Google Gemini API Key (optional — fallback levels are generated without one)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/darshil0/mashroom-kingdom-mashup-maker.git
   cd mashroom-kingdom-mashup-maker
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Copy the example file and add your Gemini API key:
   ```bash
   cp .env.example .env
   ```
   Then edit `.env`:
   ```env
   GEMINI_API_KEY=your_api_key_here
   ```
   > **Note:** The app works without a valid API key — it will use procedurally generated fallback levels instead.

4. Start the development server:
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:3000`.

### Build for Production

```bash
npm run build
npm run preview
```

## 🎮 How to Play

| Action | Keys |
|--------|------|
| Move Left / Right | `A` / `D` or `←` / `→` |
| Jump | `Space` |
| Special Ability | `X` or `P` |

- **Menu**: Select your character and mode (Quick Play, Campaign, or Editor).
- **Sharing**: In the editor, click "GEN_SHARE_ID" to get a level code. Paste codes in the main menu's "INPUT_LINK_CODE" field and click "SYNC" to load external levels.

## 📂 Project Structure

```
├── server.ts              # Express backend (API + Vite middleware)
├── index.html             # Root HTML with static grid/scanlines
├── src/
│   ├── App.tsx            # Main app component + Editor
│   ├── main.tsx           # React entry point
│   ├── types.ts           # TypeScript type definitions
│   ├── constants.ts       # Game constants (tile size, characters, colors)
│   ├── index.css          # Global styles + Tailwind config
│   ├── components/
│   │   ├── GameCanvas.tsx     # Game engine (physics, rendering, game loop)
│   │   ├── Header.tsx         # Top navigation bar
│   │   ├── Footer.tsx         # Bottom status bar with doc links
│   │   ├── LoadingOverlay.tsx  # AI generation loading screen
│   │   ├── EditorToolbar.tsx   # Tile/Entity selection toolbar
│   │   └── AbilityOverlay.tsx  # Ability activation popup
│   ├── hooks/
│   │   └── useControls.ts     # Keyboard input handler (WASD + arrows)
│   ├── services/
│   │   └── geminiService.ts   # Client-side API calls to /api/generate-level
│   └── utils/
│       ├── physics.ts         # Collision detection
│       ├── math.ts            # Vector math helpers
│       └── levelSerialization.ts  # Level encode/decode for sharing
└── public/                # Static HTML documentation pages
```

## 📜 License

This project is licensed under the Apache-2.0 License.
