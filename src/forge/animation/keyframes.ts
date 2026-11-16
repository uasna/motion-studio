import type { Vec2 } from "../core/types";
import { resolveEasing, type EasingSpec } from "./easing";

/** Valores interpolables: un número o un par [x, y] (p. ej. escala no uniforme). */
export type AnimatableValue = number | Vec2;

/**
 * Punto de control de una animación.
 * `easing` suaviza el tramo que PARTE de este keyframe hacia el siguiente (por defecto, lineal).
 */
export type Keyframe<V extends AnimatableValue = number> = {
  readonly frame: number;
  readonly value: V;
  readonly easing?: EasingSpec;
};

/** Keyframes en orden ascendente de `frame`. Antes del primero y después del último, el valor se mantiene. */
export type Track<V extends AnimatableValue = number> = readonly Keyframe<V>[];

const lerpValue = <V extends AnimatableValue>(a: V, b: V, t: number): V => {
  if (typeof a === "number" && typeof b === "number") {
    return (a + (b - a) * t) as unknown as V;
  }
  if (typeof a !== "number" && typeof b !== "number") {
    return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t] as unknown as V;
  }
  throw new TypeError("Un Track no puede mezclar valores numéricos y Vec2.");
};

/** Valor del track en `frame`. Dos keyframes con el mismo `frame` producen un salto instantáneo. */
export const evaluateTrack = <V extends AnimatableValue>(track: Track<V>, frame: number): V => {
  if (track.length === 0) {
    throw new Error("Un Track necesita al menos un keyframe.");
  }

  let index = -1;
  for (let i = 0; i < track.length; i++) {
    if (i > 0 && track[i].frame < track[i - 1].frame) {
      throw new Error(
        `Keyframes fuera de orden: el frame ${track[i].frame} aparece después del ${track[i - 1].frame}.`,
      );
    }
    if (track[i].frame <= frame) index = i;
  }

  if (index === -1) return track[0].value;
  if (index === track.length - 1) return track[index].value;

  const current = track[index];
  const next = track[index + 1];
  const progress = (frame - current.frame) / (next.frame - current.frame);
  return lerpValue(current.value, next.value, resolveEasing(current.easing)(progress));
};

/** Atajo para el caso más común: un solo tramo de `fromFrame` a `toFrame`. */
export const tween = <V extends AnimatableValue = number>(
  fromFrame: number,
  toFrame: number,
  fromValue: V,
  toValue: V,
  easing?: EasingSpec,
): Track<V> => [
  { frame: fromFrame, value: fromValue, easing },
  { frame: toFrame, value: toValue },
];
