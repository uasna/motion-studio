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

/** Evalúa todos los tracks en `frame`. Función pura: no depende de React ni de Remotion. */
export const evaluateAnimation = (spec: AnimationSpec, frame: number): AnimatedProps => {
  const out: AnimatedProps = {};
  for (const key of NUMERIC_KEYS) {
    const track = spec[key];
    if (track) out[key] = evaluateTrack(track, frame);
  }
  if (spec.scale) out.scale = evaluateTrack(spec.scale, frame);
  return out;
};

/**
 * Evalúa la animación con el frame actual de Remotion (relativo a la <Sequence> más cercana).
 * Uso: `<Circle radius={40} {...useAnimation({ x: tween(0, 30, 0, 200, "ease-out") })} />`
 */
export const useAnimation = (spec: AnimationSpec): AnimatedProps =>
  evaluateAnimation(spec, useCurrentFrame());
