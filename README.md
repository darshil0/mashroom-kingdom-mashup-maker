# 🍄 Mushroom Kingdom Mashup Maker (v1.8.0)

A retro-inspired platformer and level editor enriched with AI level generation. Build, play, and share your own Mushroom Kingdom adventures.

## 🌟 Features

- **AI Level Generation**: Powered by the `gemini-3-flash-preview` model. Generate infinite, customized levels using natural language prompts.
- **Modern Technical Dashboard**: A cinematic "Mission Control" UI featuring scanlines, glassmorphism, 32px background grids, and animated tech-borders.
- **Hybrid Architecture (50% HTML)**: Optimized for performance by blending React logic with high-speed semantic HTML structures.
- **Multiple Characters**: Play as Mario, Luigi, Toad, or Peach, each with unique stats and special abilities.
- **Comprehensive Editor**: A grid-based tile and entity editor for handcrafting levels with instant shareable link generation.
- **Campaign Mode**: Progress through 10 AI-generated sectors with increasing difficulty and unique environmental themes.

## 📊 Unit Specifications

| Unit | Speed | Jump | Special Ability | Cooldown |
| :--- | :--- | :--- | :--- | :--- |
| **MARIO** | 4.0 | 12.0 | Fire Cyclone (Spin) | 300f |
| **LUIGI** | 3.5 | 14.5 | Ghost Dash (Phase) | 400f |
| **TOAD** | 5.5 | 10.0 | Super Sprout (Boost) | 250f |
| **PEACH** | 3.8 | 11.0 | Crystal Barrier (Shield) | 500f |

## 🛠️ AI Forge Prompting

To get the most out of the Gemini AI Forge, use descriptive architectural prompts:
- *"A lava-filled castle with floating brick platforms and high Goomba density."*
- *"A peaceful forest with many pipes and hidden coin clusters."*
- *"A treacherous sky bridge with narrow platforms and spikes."*

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- A Google Gemini API Key

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
3. Set up environment variables in a `.env` file:
   ```env
   GEMINI_API_KEY=your_api_key_here
   ```
4. Start the engine:
   ```bash
   npm run dev
   ```

## 🎮 How to Play

- **WASD / Arrow Keys**: Movement (Left/Right/Up/Down)
- **Space Bar**: Jump
- **X / Shift / P**: Special Ability (Unique per character)
- **Sharing**: Use "GEN_SHARE_ID" in the Editor and "SYNC" in the Main Menu.

## 📜 Sector Mapping Protocols

The engine follows strict coordinate mapping for sector generation:
- **Grid Scale**: 32px standard tiles
- **Height Constraints**: Exactly 15 tiles
- **Start Vector**: (2, 10)
- **Extraction Point**: Far right edge (GOAL)
- **Tile Glossary**: GROUND, BRICK, QUESTION, SPENT, SPIKE, PIPE, GOAL

## 📜 License

This project is licensed under the Apache-2.0 License.
