import type { EasingSpec } from "../animation/easing";
import type { Track } from "../animation/keyframes";
import type { TransformProps } from "../core/types";
import type { StageBounds } from "../scene/stage-context";
import type { CameraState } from "./camera-context";

export const assertValidScale = (scale: number): void => {
  if (!(scale > 0) || !Number.isFinite(scale)) {
    throw new RangeError(`La escala (zoom) de la cámara debe ser un número finito mayor que 0 (recibido ${scale}).`);
  }
};

/**
 * Transformación que lleva el punto (state.x, state.y) del mundo al centro del encuadre
 * y escala el mundo alrededor de ese punto. Se aplica a un <Group> contenedor del mundo.
 */
export const cameraTransform = (state: CameraState, stage: StageBounds): TransformProps => {
  assertValidScale(state.scale);
  const centerX = (stage.left + stage.right) / 2;
  const centerY = (stage.top + stage.bottom) / 2;
  return {
    x: centerX - state.x * state.scale,
    y: centerY - state.y * state.scale,
    scale: state.scale,
  };
};

/** Zona del mundo que la cámara muestra dentro del encuadre. */
export const visibleWorld = (state: CameraState, stage: StageBounds): StageBounds => {
  assertValidScale(state.scale);
  const width = stage.width / state.scale;
  const height = stage.height / state.scale;
  return {
    width,
    height,
    left: state.x - width / 2,
    right: state.x + width / 2,
    top: state.y - height / 2,
    bottom: state.y + height / 2,
  };
};

/** Rectángulo del mundo, por su centro y tamaño (como las formas del motor). */
export type CameraTarget = {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
};

/**
 * Cámara que encuadra `target` por completo, sea cual sea la proporción del encuadre.
 * `padding` es margen extra por lado como fracción del tamaño del objetivo (0.1 = 10 %).
 */
export const frameRect = (
  target: CameraTarget,
  stage: Pick<StageBounds, "width" | "height">,
  padding = 0,
): CameraState => {
  if (!(target.width > 0) || !(target.height > 0)) {
    throw new RangeError(
      `frameRect: el objetivo necesita ancho y alto mayores que 0 (recibido ${target.width}×${target.height}).`,
    );
  }
  const factor = 1 + padding * 2;
  const scale = Math.min(stage.width / (target.width * factor), stage.height / (target.height * factor));
  assertValidScale(scale);
  return { x: target.x, y: target.y, scale };
};

/** Un plano: estado de cámara en un frame. `easing` suaviza el tramo hacia el siguiente plano. */
export type CameraShot = CameraState & {
  readonly frame: number;
  readonly easing?: EasingSpec;
};

/** Tracks de x, y y scale para <Camera animation>. Mismos keyframes del sistema de la Fase 2A. */
export type CameraAnimation = {
  readonly x?: Track;
  readonly y?: Track;
  readonly scale?: Track;
};

/** Convierte una lista de planos en tracks de cámara. Los planos deben ir en orden de frame. */
export const cameraShots = (shots: readonly CameraShot[]): Required<CameraAnimation> => ({
  x: shots.map((s) => ({ frame: s.frame, value: s.x, easing: s.easing })),
  y: shots.map((s) => ({ frame: s.frame, value: s.y, easing: s.easing })),
  scale: shots.map((s) => ({ frame: s.frame, value: s.scale, easing: s.easing })),
});
