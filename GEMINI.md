# Gemini Integration Notes

Gemini level generation is implemented server-side in `server.ts`. The client calls `/api/generate-level` through `src/services/geminiService.ts`.

The server requires `GEMINI_API_KEY` and validates the generated width, height, tile matrix, and entity list before returning a level. Keep model changes and schema changes synchronized with the client `LevelData` contract.
