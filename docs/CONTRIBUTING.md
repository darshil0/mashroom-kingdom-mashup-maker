# Contributing to Mushroom Kingdom Mashup Maker

Thank you for your interest in contributing to the Mashup Engine! We welcome developers, designers, and lore-masters.

## Technical Standards
- **TypeScript**: All code must be 100% typed. Avoid `any` except where strictly necessary (e.g., Gemini schema mocks).
- **Styling**: Use Tailwind CSS utility classes. Adhere to the "Mission Control" aesthetic (Black background, red/blue accents).
- **50% HTML Initiative**: Keep the "Technical Library" in `public/` updated. New lore or specs should be semantic HTML.
- **Physics**: Maintain the 32px tile grid system. Support both Arrow Keys and WASD for all movement logic.

## Bug Squashing Protocol
- **Historical Context**: The engine was recently purged of 14 major legacy bugs (v1.7.2). Ensure new code does not re-introduce phasing or dash-clipping anomalies.
- **Validation**: Every sector-fix must be verified against the `GameCanvas` collision resolution loop.

## Workflow
1. Fork the terminal.
2. Create a new sector-branch (e.g., `feature/dash-stability`).
3. Commit your code-fragments with descriptive logs (e.g., `fix: resolve entity jitter`).
4. Open a merge-link (Pull Request).

## Design Philosophy
Everything should feel like a high-tech instrument focused on retro-reality manipulation. If a UI element doesn't have a purpose or a tech-border, question its existence.

---
*SYS_MSG: INITIATING_COLLABORATION_PROTOCOL // v1.8.0*
