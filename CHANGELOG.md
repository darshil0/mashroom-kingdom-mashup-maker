# Changelog

All notable changes to the **Mushroom Kingdom Mashup Maker** will be documented in this file.

### [1.7.5] - 2026-04-21

#### Fixed
- **Campaign Persistence**: Integrated `localStorage` to preserve world progress, total scores, and unlocks.
- **Viewport Culling**: Implemented dynamic tile and entity culling in `GameCanvas.tsx` for enhanced rendering performance.
- **AI Stability Patch**: Added exponential backoff retry logic and request timeouts to `geminiService.ts`.
- **Physics Null Safety**: Eliminated non-null assertions in the physics engine to prevent runtime crashes during tile collisions.
- **Editor Synchronization**: Fixed a state sync bug where the Editor wouldn't reflect changes from shared level codes.
- **Character Logic**: Added auto-reset for ability cooldowns and invincibility status on character change.
- **Tactile Feedback**: Added animated loading states and button disabling for the SYNC interface in `MainMenu.tsx`.
- **Goomba Ledge Detection**: Fixed out-of-bounds array access in enemy patrol logic.

### [1.7.4] - 2026-04-21

#### Added
- **Engine Config Refactor**: Centralized core game constants and tracking interfaces.
- **Unified State Definitions**: Integrated `GameState` and `CampaignProgress` interfaces for strict type coverage.
- **Static Asset Migration**: Moved `DEFAULT_LEVEL` and `CAMPAIGN_THEMES` to `constants.ts` for global accessibility.
- **Enhanced Type Safety**: Refactored `GameCanvas.tsx` to utilize the new `GameState` interface, eliminating `any` usage.

### [1.7.3] - 2026-04-21

#### Added
- **MainMenu Modularization**: Refactored the extensive menu system into `MainMenu.tsx`.
- **Enhanced AI Error Handling**: Implemented `generationError` state with user-facing alerts in the AI Forge.
- **Improved Handle Logic**: Centralized generation handles with improved error catching and logging.

### [1.7.2] - 2026-04-21

#### Added
- **Restoration Complete**: Finished the reconstruction and bug-fix phase of the Mashup Engine.
- **Component Modularization**: Successfully refactored the following components into dedicated source files:
    - `Header.tsx`: Dynamic stats and navigation.
    - `Footer.tsx`: Control hints and system stability telemetry.
    - `LoadingOverlay.tsx`: AI Forge cinematic interface.
    - `EditorToolbar.tsx`: Modular palette and tool selection for the level editor.
    - `AbilityOverlay.tsx`: Real-time ability activation HUD notification.
- **Utility Expansion**: Added `math.ts` for specialized geometric and interpolation algorithms.
- **Documentation Integrity**: Added `CONTRIBUTING.md` and complete technical suite (9 Markdown, 8 HTML files).

#### Fixed
- **API Schema Stability**: Finalized the `LEVEL_SCHEMA` in `server.ts` to ensure compatibility with Gemini 1.5 Flash.
- **Character Definitions**: Injected missing `description` metadata into all hero units.
- **Vite Config Polish**: Fixed encoding typos and HMR configuration comments.

### [1.7.1] - 2026-04-20

#### Added
- **50% HTML Initiative**: Migrated core structural UI elements (Scanlines, Static Grids) from React to semantic `index.html` for instant rendering.
- **Static Documentation Suite**: Deployed a robust library of HTML technical manuals to the `public/` directory:
    - `tech_specs.html`: System kernel and hardware processing specs.
    - `lore.html`: Narrative archives on the origin of the Mashup Engine.
    - `controls.html`: Semantic guide for input protocols.
    - `api_reference.html`: Comprehensive technical documentation for developer integration.
    - `archive_v1/v2.html`: Structural mapping data and coordinate logs.
    - `sector_data.html`: Atmospheric and mapping telemetry.
- **Data Link Integration**: Added a "System Data Link" hub in the footer for direct access to static HTML archives.

### [1.7.0] - 2026-04-20

#### Added
- **Modern UI Overhaul**: Implemented a "Modern Technical Dashboard" aesthetic across all game screens.
- **Enhanced Mission Success/Failure**: Redesigned End screens with high-intensity scanlines, tech-borders, and cinematic statistics display.
- **Orbital AI Generation Terminal**: New loading screen for Gemini level construction with animated orbital scanners and progress logs.
- **Engine Footer**: Added a real-time status footer with control hints and system stability indicators.
- **DOM Modernization**: Injected unique IDs across all UI components for better organization and reliability.
- **Version Calibration**: Synchronized all internal engine version strings to v1.7.0.

#### Fixed
- **Background Grid CSS**: Resolved a rendering issue in the background grid by correcting CSS property names.
- **UI Consistency**: Standardized typography and borders to a military-grade "Mission Control" theme.

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
