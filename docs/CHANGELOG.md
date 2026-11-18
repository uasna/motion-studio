# MOTION FORGE — Changelog

All notable project changes are documented here.

## 2026-11-15 — Initial shared repository

- Created the public GitHub repository.
- Published the validated project baseline.
- Added shared project documentation.

## Phase 1 — Engine foundation

- Added primitive vector shapes.
- Added Stage, Group and Layer.
- Added transformations and pivots.
- Added clipping and luminance masks.
- Added landscape, portrait and square demonstrations.

## Phase 2A — Animation system

- Added keyframe-based animation.
- Added easing functions.
- Added animation evaluation.
- Added animated transform and visual properties.
- Added animation demonstrations.

## Phase 2B — 2D camera

- Added the 2D Camera component.
- Added camera positioning and zoom.
- Integrated camera behavior with the animation system.
- Added camera-aware masking.
- Added camera demonstrations.

## Phase 2C — Temporal orchestration

Date: 2026-11-17. Approved by Technical Direction at commit `ac8996d` (branch `phase-2c-review`). Integrated into `main`; the current integrated state is `f295539` (see "Phase 2C — Visual polish" below).

Features added:
- Pure temporal planner: `sec`, `step`, `gap`, `sequence`, `parallel`, `stagger`, `steps` and `plan`.
- Additive animation `delay` in `useAnimation`, `evaluateAnimation` and `<Animate delay>`.
- `<At>` and `<Stagger>` timeline components.
- `cameraMoves`, camera moves anchored to plan spans.
- `OrchestrationDemo` in landscape, portrait and square.
- `src/forge/orchestration.check.ts`, 39 checks.

Architectural changes:
- New module `src/forge/timing/`. The planner is independent of React and Remotion and reuses `getDurationInFrames()` through `sec`.
- `evaluateAnimation` and `useAnimation` accept an optional `{ delay }`. Calls without options behave exactly as in Phase 2A.
- `cameraMoves` produces the same keyframe tracks as Phase 2B. `cameraShots` is unchanged.
- The new demonstrations are registered in `EngineDemoCompositions`. `Root.tsx` and Identity001 were not modified. No dependencies were added.

Commits:
- `99b3439`: implementation submitted for review.
- `ac8996d`: review fix. `delay` accepts only non-negative integer frames and throws a `RangeError` otherwise. Approved.

Validation:
- `npm run lint`, TypeScript and `npm run build`: passed.
- 39 of 39 pure checks passed.
- Rendered-pixel probes and 26 of 26 regression frames identical to the original `main` (Engine, Animation, Camera, Identity001, HelloWorld).
- Remotion Studio in the three proportions, MP4 render and the Engine, Animation, Camera and Identity001 regression were recorded at Technical Direction approval and were not re-executed by the Engine Department.
- Full detail in `CURRENT_STATE.md`.

Known pending tests:
- `<Stagger persist={false}>`.
- `<Camera>` inside an `<At>` with a time reference different from the plan's origin.

Phase 3 is not authorized.

## Phase 2C — Visual polish

Date: 2026-11-17. Integrated into `main` through PR #1 (`phase-2c-visual-polish`), merge commit `f295539`.

Changes:
- `d989653`, "polish Phase 2C orchestration demo", prepared by Claude 2 (Animation & Polish Department).
- Only `src/forge/demo/OrchestrationDemo.tsx` was modified (346 insertions, 64 deletions). No engine code, tests, package files, dependencies or configuration were changed.
- Adaptive layout for 16:9, 9:16 and 1:1 (in 9:16 the pipeline runs top to bottom), reserved text and HUD bands, screen-space captions and HUD labels outside `<Camera>`, camera shots framed in the free band with `frameRect` and `cameraMoves`, and adjusted plan gaps.

Validation (reported by the project owner):
- `npm run lint`: passed.
- `npm run build`: passed.
- Remotion Studio: verified by the user.
- MP4 renders completed successfully: 16:9 (1.7 MB), 9:16 (1.6 MB), 1:1 (1.3 MB).

Phase 3 is not authorized.

## Changelog policy

For each completed phase, record:
- Date.
- Main features added.
- Important architectural changes.
- Relevant validation results.
