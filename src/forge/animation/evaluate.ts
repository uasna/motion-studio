import { useCurrentFrame } from "remotion";
import type { NodeProps, Vec2 } from "../core/types";
import { evaluateTrack, type Track } from "./keyframes";

/** Propiedades numéricas de NodeProps que se pueden animar con un Track. */
const NUMERIC_KEYS = [
  "x",
  "y",
  "rotation",
  "skewX",
  "skewY",
  "opacity",
  "fillOpacity",
  "strokeOpacity",
  "strokeWidth",
  "strokeDashoffset",
] as const;

type NumericKey = (typeof NUMERIC_KEYS)[number];

/** Un Track por propiedad. `scale` admite número (uniforme) o [sx, sy]. */
export type AnimationSpec = {
  readonly [K in NumericKey]?: Track;
} & {
  readonly scale?: Track<number | Vec2>;
};

/** Valores resultantes, listos para esparcir sobre cualquier nodo del motor. */
export type AnimatedProps = {
  -readonly [K in NumericKey | "scale"]?: NodeProps[K];
};

/** Opciones de evaluación (Fase 2C). Sin opciones, el comportamiento es el de la Fase 2A. */
export type AnimationOptions = {
  /**
   * Retraso en frames, ADITIVO: cada keyframe actúa `delay` frames más tarde de lo que dice
   * su `frame`. Antes de empezar, la animación mantiene el valor de su primer keyframe.
   * Se suma al desplazamiento de cualquier <At>/<Sequence> contenedor. Por defecto, 0.
   */
  readonly delay?: number;
};

/** Evalúa todos los tracks en `frame`. Función pura: no depende de React ni de Remotion. */
export const evaluateAnimation = (
  spec: AnimationSpec,
  frame: number,
  { delay = 0 }: AnimationOptions = {},
): AnimatedProps => {
  if (!Number.isFinite(delay)) {
    throw new RangeError(`El delay de una animación debe ser un número finito de frames (recibido ${delay}).`);
  }
  const local = frame - delay;
  const out: AnimatedProps = {};
  for (const key of NUMERIC_KEYS) {
    const track = spec[key];
    if (track) out[key] = evaluateTrack(track, local);
  }
  if (spec.scale) out.scale = evaluateTrack(spec.scale, local);
  return out;
};

/**
 * Evalúa la animación con el frame actual de Remotion (relativo a la <Sequence> más cercana).
 * Uso: `<Circle radius={40} {...useAnimation({ x: tween(0, 30, 0, 200, "ease-out") })} />`
 * Con retraso: `useAnimation(spec, { delay: 12 })`.
 */
export const useAnimation = (spec: AnimationSpec, options?: AnimationOptions): AnimatedProps =>
  evaluateAnimation(spec, useCurrentFrame(), options);
