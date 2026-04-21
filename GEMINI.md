# Gemini AI Configuration

## Model Selection
- Primary model: `gemini-3-flash-preview`
- All level generation prompts must include:
  - Grid constraints (15 tiles high)
  - Starting position (2, 10)
  - Accessibility requirements (goal reachable at far right)

## Response Format
- Levels must be returned as JSON following the `LEVEL_SCHEMA` defined in `server.ts`.
- The schema includes `width`, `height`, `tiles` (2D string array), and `entities`.

## Thematic Guidelines
- Use the `levelIndex` to scale difficulty.
- Lower indices: Green hills, basic platforms.
- Higher indices: Castles, lava, spikes, complex enemy patrols.
