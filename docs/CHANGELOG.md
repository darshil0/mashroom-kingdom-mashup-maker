# Changelog

All notable changes to the **Mushroom Kingdom Mashup Maker** will be documented in this file.

### [1.8.2] - 2026-09-18

#### Fixed
- **Level Generation Validation**: Hardened the Gemini level generation flow so malformed or incomplete payloads are rejected before reaching the game loop.
- **Client-side Level Validation**: Added defensive shape checks to `src/services/geminiService.ts` so invalid `LevelData` objects are not accepted from the server.
- **Serialization Robustness**: Fixed the level-sharing serializer/deserializer to cover the full supported tile set and reject invalid level payloads cleanly.
- **State Reset Integrity**: Corrected player and entity reset behavior when changing the active character or loading a different level.
- **Win/Game Over Guarding**: Prevented duplicate end-of-level callbacks from firing repeatedly in the same frame.
- **Dependency Hygiene**: Cleaned up duplicate/conflicting package definitions across the Vite and React dependency tree.

#### Added
- **Graceful API Failures**: The app now reports a clear configuration error when the Gemini key is missing and handles malformed generation results gracefully.
- **Environment-aware server startup**: Improved host/port defaults and Vite/Express boot flow so the app starts more predictably across environments.
- **Documentation sync**: Updated setup instructions and runtime guidance to match the actual project configuration.

#### Changed
- **Gemini model alignment**: Updated the generation configuration to a current stable Gemini setup better suited for structured responses.
- **Project version metadata**: Synced package and documentation version markers to `1.8.2`.

### [1.8.1] - 2026-05-12

#### Fixed
- **Gemini API Initialization**: Corrected GoogleGenAI constructor call to use object parameter syntax `{ apiKey }` instead of direct string argument. Added explicit API key validation and error handling.
- **Type Safety: Removed Loose Any Assertions**: Eliminated unsafe `as any` casts in `LEVEL_SCHEMA` type definitions. Replaced with proper TypeScript inference.
- **GameCanvas Null Safety**: Added comprehensive null/undefined guards in game loop. Introduced `GameStateRef` interface for stricter state management. Fixed potential crashes from accessing stale state.
- **Entity Iteration Safety**: Wrapped entity array iteration in null checks and bounds validation to prevent accessing deleted entities during collision resolution.
- **Goomba Ledge Detection Bounds**: Added array bounds checking before accessing `tiles[tileY][tileX]` in Goomba patrol logic. Prevents out-of-bounds crashes on level edges.
- **Physics Collision Array Access**: Hardened `checkTileCollision` with defensive null checks for `pos`, `tiles`, and individual row access. Added bounds validation on x/y coordinates before tile access.
- **Rectangle Collision Null Guards**: Added null safety checks in `isRectOverlap` to handle undefined collision rectangles gracefully.
- **Player State Reset on Character Switch**: Fixed missing ability cooldown and invincibility reset when changing characters mid-game.
- **Entity Interaction: Null Check on Entity Reference**: Added guard clause in `handleEntityInteraction` to validate entity existence before accessing properties.
- **Camera System Threat Awareness**: Improved Goomba detection loop to include null/undefined checks and distance calculations with fallback logic.
- **Block Hit Handler: Defensive Tile Access**: Added row existence check in `handleBlockHit` before accessing tile data.
- **Ability Handler: Safe Entity Iteration**: Wrapped ability execution with loop guards and null validation.
- **Key Binding Conflicts**: Updated `useControls` hook to prevent accidental space key submission in text fields. Added event target validation.
- **Server API Error Handling**: Implemented proper error response structure with detailed logging. Added response validation to ensure Gemini returns valid level schema.
- **Health Check Endpoint**: Added `/api/health` endpoint for system status monitoring and load balancer compatibility.

#### Added
- **API Key Validation**: Explicit check on server startup. Process exits with a clear error message if `GEMINI_API_KEY` is not configured.
- **Response Schema Validation**: Server now validates Gemini response structure before returning to client.
- **Timeout Protection**: Added 15-second timeout to level generation fetch call via `AbortSignal.timeout()`.
- **Enhanced Logging**: Improved diagnostic messages throughout server and client for troubleshooting.

#### Changed
- **Server Error Responses**: Standardized error response format to include both `error` and `details` fields.
- **GameState Interface**: Refined state management for stricter type safety.
- **Physics Engine Callsites**: Updated collision calls to handle potential undefined collision coordinates safely.

#### Removed
- **Unsafe Type Assertions**: Eliminated `as any` patterns in schema definitions.

### [1.8.0] - 2026-04-21

#### Fixed
- **Server AI SDK Refactor**: Fixed incorrect usage of `@google/genai` SDK in `server.ts`.
- **Enhanced Physics Link**: Improved Luigi's Ghost Dash to prevent wall clipping.
- **Safe Spawn Protocol**: Refined entity spawning logic to prevent internal collision on generation.
- **Environmental Persistence**: Injected `dotenv` configuration to ensure API key availability.
- **Campaign Persistence**: Integrated `localStorage` to preserve progress and scores.
- **Viewport Culling**: Implemented dynamic tile and entity culling in `GameCanvas.tsx`.
- **AI Stability Patch**: Added exponential backoff retry logic and request timeouts.
- **Physics Null Safety**: Eliminated dangerous null assumptions in collision checks.
- **Editor Synchronization**: Fixed state sync bugs when loading shared level codes.
- **Character Logic**: Added ability reset behavior on character change.
- **Goomba Ledge Detection**: Fixed out-of-bounds array access in enemy patrol logic.
- **UI Safety**: Removed blocking alert usage and replaced it with a status overlay.
- **Deserialization Resilience**: Added defensive checks for malformed codes.

#### Added
- **Visual Grid Overlay**: Added the 32px technical grid background.
- **Block Interaction Update**: Added `SPENT` tile handling for question blocks.
- **Control System Expansion**: Added `WASD` support.
- **Advanced Aesthetics**: Added scanline, glass, and neon UI styling.
- **Campaign Themes**: Added themed progression sectors.
- **Semantic Overhaul**: Refactored the app layout into specialized UI modules.

#### Changed
- **Documentation Alignment**: Updated README and UI hints to match actual controls.
- **Metadata Polish**: Refined the app description and game-facing copy.

### [1.7.4] - 2026-04-21

#### Added
- **Engine Config Refactor**: Centralized game constants and shared interfaces.
- **Unified State Definitions**: Integrated `GameState` and `CampaignProgress` interfaces.
- **Static Asset Migration**: Moved `DEFAULT_LEVEL` and `CAMPAIGN_THEMES` into `constants.ts`.

### [1.7.3] - 2026-04-21

#### Added
- **MainMenu Modularization**: Split the menu logic into `MainMenu.tsx`.
- **Enhanced AI Error Handling**: Added user-facing generation error states.

### [1.7.2] - 2026-04-21

#### Added
- **Restoration Complete**: Finished the reconstruction phase of the engine.
- **Component Modularization**: Split UI into dedicated source files for layout, editor, and game features.
- **Documentation Integrity**: Added `CONTRIBUTING.md` and technical docs.

#### Fixed
- **API Schema Stability**: Finalized the `LEVEL_SCHEMA` for Gemini compatibility.
- **Character Definitions**: Injected missing metadata into hero definitions.

### [1.7.1] - 2026-04-20

#### Added
- **50% HTML Initiative**: Migrated structural UI elements into semantic HTML.
- **Static Technical Documentation**: Added HTML reference and archive pages.

### [1.7.0] - 2026-04-20

#### Added
- **Modern UI Overhaul**: Polished the Mission Control dashboard aesthetic.
- **Enhanced Mission Success/Failure**: Added cinematic end states and overlays.
- **Orbital AI Generation Terminal**: Added a loading interface during level construction.

#### Fixed
- **Background Grid CSS**: Corrected the CSS layout issue for the overlay grid.
- **UI Consistency**: Standardized the game and dashboard styling.

## [1.6.0] - 2026-04-20

### Fixed & Improved
- **Win Condition Reliability**: Updated the physics engine to trigger win states properly.
- **Event Synchronization**: Prevented duplicate win/game-over callbacks.
- **Character Selection Polish**: Improved the hero selection flow.
- **Physics Stability**: Reduced jitter during high-speed movement.

## [1.5.0] - 2026-04-20

### Added
- **Smarter Goomba AI**: Added edge detection and directional reversal logic.
- **Improved Patrolling**: Refined enemy boundary behavior.

## [1.4.0] - 2026-04-20

### Added
- **Procedural Character Animations**: Added idle/run/jump visuals.
- **Enhanced Ability Visuals**: Added ability-specific effects for character actions.
- **Full-Stack Security Migration**: Moved Gemini generation behind the Express backend.

## [1.3.0] - 2026-04-20

### Added
- **Dynamic Camera System**: Added threat-aware camera logic.
- **Editor Productivity Shortcuts**: Added tab/selection shortcuts.
- **Safety Physics**: Fixed dash phasing through solid blocks.

## [1.2.0] - 2026-04-20

### Added
- **Level Sharing System**: Implemented share code serialization.
- **Campaign Mode Progression**: Added visual progress tracking and score totals.

## [1.1.0] - 2026-04-20

### Added
- **Multi-Level Campaign**: Added progressive AI-driven level sequence.
- **Campaign Difficulty Scaling**: Increased hazards and complexity over time.
- **Generation Overlay**: Added loading state during AI generation.

## [1.0.0] - 2026-04-20

### Added
- **Initial Release**: Initial engine with AI-driven level generation and editor tools.
- **Character Selection**: Added Mario, Luigi, Toad, and Peach.
- **Physics Engine**: Added movement, collisions, and platforming logic.
- **UI & Themes**: Added the retro tech dashboard visual style.
