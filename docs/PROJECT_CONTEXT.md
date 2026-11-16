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
- `src/forge/animation/`: keyframes, easing and animation evaluation.
- `src/forge/camera/`: 2D camera system.
- `src/forge/demo/`: engine demonstrations.
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
Proposed, not yet implemented.

Expected scope:
- Sequential and parallel animation blocks.
- Delays and overlapping sequences.
- Staggered animations.
- Shared timing between camera and objects.
- Reuse of the existing keyframe and easing system.

Do not assume Phase 2C is complete until its code is implemented and validated.

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

This document describes the project baseline. Always verify the current repository before implementation.
