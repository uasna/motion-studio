# MOTION FORGE — Current State

## Current status

The project has a working Remotion-based 2D animation engine.

The current validated baseline includes:
- Phase 1: Engine foundation — complete.
- Phase 2A: Keyframes and easing — complete.
- Phase 2B: 2D camera — complete.
- Phase 2C: Temporal orchestration — complete, approved by Technical Direction at commit `ac8996d`.

Phase 3 is not authorized and has not been started.

## Current repository

- Repository: https://github.com/uasna/motion-studio
- Branch `main`: Phase 2B baseline plus shared documentation (`48d19a8`). Phase 2C has not been merged into it.
- Branch `phase-2c-review`: approved Phase 2C implementation (`ac8996d`) plus this documentation update.
- Local path: C:\Projects\Motion-Studio

## Phase 2C validation (commit `ac8996d`)

Run by the Engine Department in its Linux sandbox (Node 22.23.4):
- `npm run lint` (ESLint and `tsc`): passed.
- TypeScript (`tsc`, run by `npm run lint`): passed.
- `npm run build`: passed.
- `src/forge/orchestration.check.ts`: 39 of 39 checks passed (planner, delay, `cameraMoves`, equivalence with `cameraShots`).
- Rendered-pixel probes, in throwaway projects outside the repository (not committed): 75 of 75 on `99b3439` (`At`, `persist`, `Stagger`, `delay`, camera and object synchronization) and 50 of 50 on `ac8996d` (`<Animate delay>` and `useAnimation`: 10 invalid values rejected, 40 valid cases correct).
- Pixel regression against the original `main`: 26 of 26 frames identical across the Engine, Animation and Camera demos in the three proportions, Identity001 and HelloWorld.
- `OrchestrationDemo` stills reviewed in the three proportions.

Recorded at Technical Direction approval and not re-executed by the Engine Department:
- Remotion Studio, `OrchestrationDemo` in the three proportions.
- MP4 render.
- Regression of the Engine, Animation and Camera demos and of Identity001.

## Known pending tests

1. `<Stagger persist={false}>` has no specific test.
2. `<Camera>` inside an `<At>` with a time reference different from the plan's origin has no specific test.

## Previous phases: last known validation

- `npm run lint`: passed.
- `npm run build`: passed.
- Engine demos: validated in Remotion Studio.
- Animation demos: validated in Remotion Studio.
- Camera demos: validated in Remotion Studio.
- Camera test render: successful.

These results describe the last known local validation. Re-run checks after new changes.

## Current architecture

### Core
- Shared attributes and types.
- Transform calculations.
- Unique ID utilities.

### Shapes and scenes
- Primitive vector shapes.
- Stage.
- Group and Layer.
- Clipping and masking.

### Animation
- Keyframe definitions.
- Easing functions.
- Animation evaluation.
- Animate component.
- Additive animation delay (non-negative integer frames, default 0).

### Timing
- Pure temporal planner (`step`, `gap`, `sequence`, `parallel`, `stagger`, `steps`, `plan`), independent of React and Remotion.
- `sec(seconds, fps)`, built on `getDurationInFrames()`.
- `At` component (`Sequence layout="none"`, `persist` by default).
- `Stagger` component.

### Camera
- Camera component.
- Camera context.
- Camera math.
- Camera-aware masking.
- `cameraMoves`: camera moves anchored to plan spans.

### Demos
- Engine demonstrations in landscape, portrait and square.
- Animation demonstrations in landscape, portrait and square.
- Camera demonstrations in landscape, portrait and square.
- Orchestration demonstrations in landscape, portrait and square (`ForgeOrchestrationDemo-16x9`, `-9x16`, `-1x1`, 240 frames at 30 fps, Studio folder `MotionForge`).

### Checks
- `src/forge/orchestration.check.ts`: 39 checks, no test dependencies. Run with `npx esbuild src/forge/orchestration.check.ts --bundle --platform=node --outfile=out/orchestration.check.cjs` and then `node out/orchestration.check.cjs`.

## Next development task

No development phase is currently authorized.

Open items:
- Phase 3 requires explicit authorization before any work starts.
- The two known pending tests listed above.
- Integration of `phase-2c-review` into `main` has not been performed.

## Important constraints

- Do not start Phase 3 without explicit authorization.
- Do not redesign the engine architecture unnecessarily.
- Do not remove Identity001.
- Phase 2C is implemented and approved on `phase-2c-review`.
- Inspect the current code before making changes.
