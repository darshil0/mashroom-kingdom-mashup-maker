# Changelog

All notable changes to the **Mushroom Kingdom Mashup Maker** will be documented in this file.

## [1.6.0] - 2026-04-20

### Fixed & Improved
- **Win Condition Reliability**: Updated physics engine to correctly trigger a "Win" state when touching Goal tiles from any angle (sides or top).
- **Event Synchronization**: Added a `isFinished` state guard to block duplicate "Win" or "Game Over" events within the same frame.
- **Character Selection Polish**: Enhanced the hero selection menu with active badges and character-specific selection text.
- **Physics Stability**: Refined horizontal collision resolution to prevent tile jittering during high-speed movement.
- **Linter Cleanup**: Resolved all remaining static analysis warnings and missing icon imports.

## [1.5.0] - 2026-04-20

### Added
- **Smarter Goomba AI**: Implemented ledge detection for Goombas. They now intelligently reverse direction instead of walking off platforms into pits.
- **Improved Patrolling**: Refined enemy physics to support indefinite pacing between boundaries (walls or ledges).

## [1.4.0] - 2026-04-20

### Added
- **Procedural Character Animations**: Added dynamic animations for idle (bobbing), running (limb swinging), and jumping (pose change) states.
- **Enhanced Ability Visuals**: Implemented rotating spin for Mario, ghostly trails for Luigi, and a shimmering shield for Peach.
- **Full-Stack Security Migration**: Moved Gemini AI level generation to a secure Express backend to protect API keys and improve robustness.
- **Improved AI Thematics**: Campaign levels now feature 10 distinct themes (Lava, Snow, Sky, etc.) with progressive difficulty prompts.

## [1.3.0] - 2026-04-20

### Added
- **Dynamic Camera System**: Implemented threat-aware camera logic that weights focus between the player and nearby enemies.
- **Editor Productivity Shortcuts**:
    - `Tab` to switch between Tile and Entity tools.
    - `[` / `]` to cycle through selected assets.
    - `1-9` for direct tool selection.
- **Safety Physics**: Fixed a bug where dash abilities could phase players through solid blocks.

## [1.2.0] - 2026-04-20

### Added
- **Level Sharing System**: Implemented level serialization and deserialization using Base64.
- **Improved Sharing UI**: Added a visible code display in the editor with "Copy" feedback.
- **Loading Interface**: Added an input field in the main menu to load and play levels via shared codes.
- **Campaign Mode Progression**: Added a visual progression bar and enhanced World-Level naming (e.g., World 1-1).
- **Campaign Stats**: Implemented cumulative scoring and a "Grand Total" display on Game Over/Win screens.
- **Refined AI Logic**: Handled level generation with difficulty scaling based on campaign progress.

## [1.1.0] - 2026-04-20

### Added
- **Multi-Level Campaign**: Implemented a sequence of AI-driven levels that progress as you win.
- **Campaign Difficulty Scaling**: Gemini now generates harder levels with more hazards as the campaign progresses.
- **Generation Overlay**: Added a "Gemini is Constructing..." visual transition during AI level building.
- **HUD Enhancements**: Real-time tracking of scores, coins, and character-specific cooldowns.

## [1.0.0] - 2026-04-20

### Added
- **Initial Release**: Core game engine with HTML5 Canvas.
- **AI Level Generation**: Integration with Gemini 1.5 Flash for prompt-based level design.
- **Character Selection**: Playable Mario, Luigi, Toad, and Peach with custom abilities.
- **Level Editor**: Basic grid-based editor for tiles and entities.
- **Core Entities**: Implemented Goombas, Coins, and Mushrooms.
- **Physics Engine**: Solid tile collisions and momentum-based player movement.
- **UI & Themes**: Retro-inspired dashboard using Tailwind CSS and motion.
