# Claude Code Instructions — Mining Run

## Project boundary
- This is the **Mining Run** Roblox project.
- Work only inside `Mining-Run/`. Do not modify Motion Studio or other repository projects.
- Read `README.md`, `docs/GAME_DESIGN.md`, and `docs/DEVELOPMENT_STATUS.md` before starting work.
- Treat these documents as the shared source of truth. If a decision is marked OPEN, do not silently decide it.

## Roles
- User = Game Director; owns gameplay and visual approvals.
- ChatGPT = Technical Director; coordinates phases and reviews architecture.
- Claude Code = implementation lead; owns code, integration, automated tests, debugging, and regression checks.

## Mandatory execution settings
- Model: Claude Sonnet 4.6
- Effort: High

## Engineering rules
- Work in small, reviewable phases. Do not start broad implementation without an approved scope.
- Prefer server-authoritative gameplay, validated RemoteEvents/RemoteFunctions, secure persistence, and exploit-resistant economy/inventory logic.
- Design for multiplayer and Roblox performance from the beginning.
- Add or update automated tests where practical. Run relevant checks after each phase.
- Do not claim a feature is tested unless the test was actually run; report exact commands and results.
- Do not ask the user to act as the primary tester when automated or code-level verification is possible.
- Do not publish the experience, delete data, rewrite unrelated files, or make destructive changes without explicit approval.

## Documentation discipline
At the end of each phase, update `docs/DEVELOPMENT_STATUS.md` and any affected design/technical documents. Separate:
- APPROVED — explicitly approved by the Game Director.
- PROPOSED — recommendation awaiting approval.
- OPEN — undecided.
- IMPLEMENTED — present in the project.
- VERIFIED — implementation passed named checks.

Never turn a proposal into an approved design decision without user approval.
