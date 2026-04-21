# Bug Report - Mushroom Kingdom Mashup Maker

## Summary of Findings
The application was found to be in a generally stable state regarding frontend logic, but several critical issues were identified in the backend server and static analysis. A major crash was discovered in the Gemini API integration on the server, which would have prevented any AI level generation. Additionally, many ESLint violations were found, ranging from undefined variables to improper React Hook usage.

## File-by-File Issue Descriptions

### `server.ts`
- **Issue**: Incorrect import of `SchemaType` from `@google/genai`.
- **Severity**: Critical
- **Reproduction**: Run `npm run dev` and attempt to start the server.
- **Fix**: Changed `SchemaType` to `Type` which is the correct export in the installed version of the library.
- **Issue**: Missing health check endpoint.
- **Severity**: Low
- **Fix**: Added `/api/health` endpoint to monitor server and AI module status.

### `src/components/GameCanvas.tsx`
- **Issue**: `handleEntityInteraction` and `handleAbility` used before definition.
- **Severity**: High
- **Fix**: Reorganized function declarations and wrapped them in `useCallback` for better React performance and to satisfy linting rules.
- **Issue**: ESLint `no-case-declarations` violations in `handleAbility`.
- **Severity**: Medium
- **Fix**: Wrapped case blocks in curly braces to create block scopes.
- **Issue**: `react-hooks/immutability` violations in the game loop.
- **Severity**: Medium (intentional for performance)
- **Fix**: Disabled the specific linting rule as mutation in `stateRef.current` is a performance optimization for the game engine's frame updates.

### `src/services/geminiService.ts`
- **Issue**: Swallowing API errors without informing the user.
- **Severity**: Medium
- **Fix**: Added user-facing `alert()` calls and improved error message extraction from the API response.

### `src/components/Header.tsx`
- **Issue**: No visual indicator of AI service status.
- **Severity**: Low
- **Fix**: Integrated with the new `/api/health` endpoint to show `AI_OFFLINE` when the API key is missing.

## Static Analysis Violations
Initial run showed 68 problems (48 errors). Major categories:
- `no-undef`: Missing browser/node globals.
- `no-use-before-define`: Functions used before they were declared.
- `no-case-declarations`: Variables declared in switch cases without block scope.
- `react-hooks/exhaustive-deps`: Missing dependencies in `useEffect` and `useCallback`.

All errors have been resolved. 12 minor warnings remain (unused variables, explicit `any` usage).

## Prioritized Recommendations
1. **AI Stability**: Ensure a valid `GEMINI_API_KEY` is provided in the environment to enable core AI generation features.
2. **Audio Implementation**: The documentation mentions an `AudioMixer`, but no audio logic or assets were found. This is a major missing feature based on the tech specs.
3. **Testing**: Implement unit tests for physics and collision logic in `src/utils/physics.ts`.
4. **Performance**: Continue monitoring the game loop performance; consider moving physics to a Web Worker if level complexity increases.
