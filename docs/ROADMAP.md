# MOTION FORGE — Development Roadmap

## Phase 1 — Engine foundation
Status: COMPLETE

- Primitive vector shapes.
- Stage and coordinate system.
- Groups and layers.
- Transformations.
- Clipping and masking.
- Multiple aspect ratios.

## Phase 2A — Animation system
Status: COMPLETE

- Keyframes.
- Easing.
- Interpolation.
- Animated transforms and visual properties.

## Phase 2B — 2D camera
Status: COMPLETE

- Camera positioning.
- Zoom.
- Camera transformations.
- Camera-aware masking.

## Phase 2C — Temporal orchestration
Status: COMPLETE (approved by Technical Direction at commit `ac8996d`; branch `phase-2c-review`, not yet merged into `main`)

- Pure timing planner.
- Sequential and parallel blocks.
- Gaps and overlaps.
- Staggered animations (`stagger` and `<Stagger>`).
- Animation delays (non-negative integer frames).
- Timeline span wrappers (`<At>`).
- Camera and object synchronization (`cameraMoves`).
- Orchestration demonstration in landscape, portrait and square.

Known pending tests:
- `<Stagger persist={false}>`.
- `<Camera>` inside an `<At>` with a time reference different from the plan's origin.

## Phase 3 — Advanced visual systems
Status: NOT STARTED — NOT AUTHORIZED

Potential scope:
- More advanced vector operations.
- Improved masks and cutouts.
- Deformations.
- Reusable visual effects.
- More sophisticated object composition.

Phase 2C is complete and approved, but Phase 3 has not been explicitly authorized. Do not start it until it is.

## Phase 4 — Production systems
Status: NOT STARTED

Potential scope:
- Reusable object library.
- Scene production workflow.
- Audio and sound effects.
- Subtitles and text systems.
- Reusable educational visual templates.

## Phase 5 — Studio and export workflow
Status: NOT STARTED

Potential scope:
- Production-oriented controls.
- Project configuration.
- Duration and frame-rate presets.
- Landscape, portrait and square export.
- Render and export workflow improvements.

## Development policy

- Work phase by phase.
- Implement only the currently authorized phase.
- Validate each phase before moving forward.
- Update this roadmap when a phase changes status.
- Do not mark a phase complete based only on code generation; require local validation.
- Preserve previous working systems.
