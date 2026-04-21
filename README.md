# 🍄 Mushroom Kingdom Mashup Maker

A retro-inspired platformer and level editor enriched with AI level generation. Build, play, and share your own Mushroom Kingdom adventures.

## 🌟 Features

- **AI Level Generation**: Powered by the latest Gemini generative models. Generate infinite, customized levels using natural language prompts.
- **Modern Technical Dashboard**: A cinematic "Mission Control" UI featuring scanlines, glassmorphism, and animated tech-borders.
- **Hybrid Architecture (50% HTML)**: Optimized for performance and accessibility by blending React logic with high-speed semantic HTML structures.
- **Modular Component Design**: Clean separation of concerns with dedicated components for Header, Footer, MainMenu, Editor, and HUD.
- **AI Forge Error Mitigation**: Real-time error status tracking and technical alerts for generative failures.
- **Extensive Technical Library**: Integrated on-board documentation covering lore, technical specifications, API references, and sector mapping logs (42 files total).
- **Multiple Characters**: Play as Mario, Luigi, Toad, or Peach, each with unique stats and special abilities.
  - **Mario**: Fire Cyclone (Spin attack)
  - **Luigi**: Ghost Dash (Phase through walls/enemies)
  - **Toad**: Super Sprout (Climbable vines)
  - **Peach**: Crystal Barrier (Defensive shield)
- **Comprehensive Editor**: A grid-based tile and entity editor for handcrafting levels.
- **Level Sharing**: Serialize your levels into compact codes to share with friends. Load and play shared levels instantly.
- **Campaign Mode**: Progress through a sequence of 10 AI-generated levels with increasing difficulty and thematic progression.
- **Enhanced Physics & Collision**: Tile-based collisions, momentum-driven movement, and reactive entity AI (Goombas, Coins, Mushrooms).
- **Retro Aesthetic**: Visuals and UI inspired by classic 8-bit and 16-bit platformers, built with Tailwind CSS and motion.

## 🛠️ Tech Stack

- **Framework**: React.js with TypeScript
- **Bundler**: Vite
- **Architecture**: Hybrid React / Semantic HTML5 (50% Distribution)
- **Styling**: Tailwind CSS
- **Animations**: Motion (framer-motion)
- **Icons**: Lucide React
- **AI Engine**: Google Gemini API (@google/genai)
- **Rendering**: HTML5 Canvas API

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- A Google Gemini API Key

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/mushroom-kingdom-mashup-maker.git
   cd mushroom-kingdom-mashup-maker
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory and add your Gemini API key:
   ```env
   GEMINI_API_KEY=your_api_key_here
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## 🎮 How to Play

- **Arrow Keys**: Move and Jump (Jump height is variable based on hold duration)
- **Space Bar**: Character Special Ability
- **Menu**: Select your character and mode (Quick Play, Campaign, or Editor).
- **Sharing**: In the editor, use the "Share Level" button to get a code. Paste codes in the main menu to load external levels.

## 📜 License

This project is licensed under the Apache-2.0 License.
