# MOTION FORGE — Project Context

## 1. Project identity

MOTION FORGE is a modular 2D animation engine for creating educational explainer videos about everyday phenomena, science, technology and curiosities.

The goal is to build reusable animation systems rather than create every video from scratch.

Visual direction:
- Clean, modern 2D vector graphics.
- Minimalist compositions.
- Smooth and intentional motion.
- Clear visual explanations.
- Objects and phenomena are the protagonists.
- No humanoid characters unless the subject genuinely requires human anatomy or body parts.

## 2. Technology stack

- React 19
- TypeScript 5.9.3
- Remotion 4.0.543
- Node.js
- ESLint
- PowerShell on Windows

Local project:
`C:\Projects\Motion-Studio`

Official repository:
https://github.com/uasna/motion-studio

Main branch: `main`

## 3. Architecture principles

- Build reusable, independent modules.
- Keep animation logic separate from scene composition.
- Prefer small, focused components.
- Preserve backward compatibility.
- Avoid unnecessary dependencies.
- Keep the engine independent from individual video projects.
- Use Remotion's actual APIs and installed version.
- Do not invent APIs or assume unsupported capabilities.

## 4. Existing project structure

- `src/forge/core/`: shared types, attributes and transforms.
- `src/forge/shapes/`: primitive vector shapes.
- `src/forge/scene/`: Stage, Group and Layer systems.
- `src/forge/masking/`: clipping and masking.
- `src/forge/animation/`: keyframes, easing, animation evaluation and animation delay.
- `src/forge/timing/`: pure temporal planner, `sec`, and the `At` and `Stagger` timeline components.
- `src/forge/camera/`: 2D camera system, including `cameraMoves`.
- `src/forge/demo/`: engine demonstrations (Engine, Animation, Camera and Orchestration).
- `src/projects/`: independent animation projects.
- `src/components/`: reusable visual components.
- `src/studio/`: shared studio configuration and types.

## 5. Completed development phases

### Phase 1 — Engine foundation
- Primitive vector shapes.
- Centered coordinate system.
- Transformations and pivots.
- Nested Groups and Layers.
- Opacity and visual styles.
- Clipping and luminance masks.
- Stage with landscape, portrait and square formats.
- Three working engine demonstrations.

### Phase 2A — Animation system
- Keyframes.
- Easing functions.
- Linear and cubic Bezier interpolation.
- Animated position, rotation, scale, opacity and stroke properties.
- Animation demonstrations.

### Phase 2B — 2D camera
- Camera component.
- World position and zoom.
- Camera movement using the animation system.
- Camera-aware masking.
- Landscape, portrait and square demonstrations.

All three phases above were validated locally with ESLint, TypeScript, Remotion Studio and successful renders.

### Phase 2C — Temporal orchestration
Complete. Approved by Technical Direction at commit `ac8996d` on branch `phase-2c-review` and integrated into `main`. The visual polish of its demonstration (`d989653`, by Claude 2) was merged through PR #1; the current integrated state is `f295539`.

- Pure temporal planner, independent of React and Remotion: `sec`, `step`, `gap`, `sequence`, `parallel`, `stagger`, `steps` and `plan`. Time is expressed in whole frames. A negative `gap` inside a `sequence` creates an overlap.
- Additive animation `delay` in `useAnimation`, `evaluateAnimation` and `<Animate delay>`. It must be a non-negative integer number of frames; any other value throws a `RangeError`. The default is 0.
- `<At>`: makes content exist from a plan span or a frame. It uses `Sequence layout="none"` and `persist` is enabled by default.
- `<Stagger>`: staggers the appearance of its direct children.
- `cameraMoves`: turns camera moves anchored to plan spans into `<Camera animation>` tracks, so camera and objects share one temporal reference.
- `OrchestrationDemo` in landscape, portrait and square, with the visual polish merged in PR #1.
- Reuses the Phase 2A keyframe and easing system and `getDurationInFrames()` from `src/studio/formats.ts`. No dependencies were added.

Usage rules:
- `<At>` controls when content exists. To keep an object visible from the start and only delay its motion, use `delay`.
- `<Camera>` and the `<At>` elements of a plan must hang from the same `<Sequence>` or composition so they share frame 0.
- `premountFor` and `postmountFor` are not used.

Known pending tests (no specific test exists yet):
1. `<Stagger persist={false}>`.
2. `<Camera>` placed inside an `<At>` whose time reference differs from the plan's origin.

Phase 3 is not authorized and has not been started.

## 5b. Project organization

Work is split across three departments:
- Claude 1 — Engine Department: architecture, internal systems, animation, camera and timeline.
- Claude 2 — Animation & Polish Department: demonstrations, visual composition, visual tests and polish.
- ChatGPT — Technical Direction: planning, technical contracts, coordination and review.

## 6. Development workflow

For every phase:

1. Inspect the current repository before changing anything.
2. Confirm the actual installed versions and existing architecture.
3. Implement only the requested phase.
4. Avoid rewriting working systems without a clear technical reason.
5. Preserve existing projects and demonstrations.
6. Run `npm run lint`.
7. Run `npm run build`.
8. Validate relevant compositions in Remotion Studio.
9. Render a test composition when appropriate.
10. Report exactly what changed and what was tested.

## 7. Important existing project

`Identity001` is an existing composition and must be preserved.

Do not remove or overwrite its registration in `src/Root.tsx`.

Existing engine demonstrations must also remain functional.

## 8. Collaboration rules

GitHub is the shared source of truth for both Claude accounts.

Repository:
https://github.com/uasna/motion-studio

- Always inspect the latest `main` before proposing implementation.
- Conversation history may be outdated.
- Never assume uncommitted local changes are already on GitHub.
- Do not overwrite newer work.
- Keep documentation synchronized with meaningful project changes.
- Never publish credentials, secrets or private information.

## 9. Current technical baseline

- Remotion: 4.0.543
- React: 19.3.1
- TypeScript: 5.9.3
- `npm run lint`: passed at the latest local validation.
- `npm run build`: passed at the latest local validation.
- Phase 2C approved commit: `ac8996d`. Current integrated state of `main`: `f295539`. The evidence and its sources are listed in `CURRENT_STATE.md`.
- Phase 3: not authorized.

This document describes the project baseline. Always verify the current repository before implementation.
