import { Easing } from "remotion";

/** Función de suavizado: recibe progreso 0..1 y devuelve progreso suavizado (puede salirse de 0..1 para rebotes). */
export type EasingFn = (t: number) => number;

export type BezierSpec = {
  /** [x1, y1, x2, y2] de una curva cúbica de Bézier, como `cubic-bezier()` de CSS. */
  readonly bezier: readonly [number, number, number, number];
};

export type EasingName = "linear" | "ease-in" | "ease-out" | "ease-in-out";

/** Nombre de preset, curva Bézier propia o función arbitraria. */
export type EasingSpec = EasingName | BezierSpec | EasingFn;

const PRESET_BEZIERS: Record<Exclude<EasingName, "linear">, readonly [number, number, number, number]> = {
  "ease-in": [0.42, 0, 1, 1],
  "ease-out": [0, 0, 0.58, 1],
  "ease-in-out": [0.42, 0, 0.58, 1],
};

const bezierCache = new Map<string, EasingFn>();

/**
 * Curva cúbica de Bézier (misma semántica que CSS). `x1` y `x2` deben estar en 0..1;
 * `y1` e `y2` pueden salirse del rango para producir rebote o anticipación.
 */
export const cubicBezier = (x1: number, y1: number, x2: number, y2: number): EasingFn => {
  if (x1 < 0 || x1 > 1 || x2 < 0 || x2 > 1) {
    throw new RangeError(`cubicBezier: x1 y x2 deben estar entre 0 y 1 (recibido ${x1}, ${x2}).`);
  }
  const key = `${x1},${y1},${x2},${y2}`;
  const cached = bezierCache.get(key);
  if (cached) return cached;
  const fn = Easing.bezier(x1, y1, x2, y2);
  bezierCache.set(key, fn);
  return fn;
};

export const linear: EasingFn = (t) => t;

export const resolveEasing = (spec: EasingSpec = "linear"): EasingFn => {
  if (typeof spec === "function") return spec;
  if (typeof spec === "string") {
    if (spec === "linear") return linear;
    const [x1, y1, x2, y2] = PRESET_BEZIERS[spec];
    return cubicBezier(x1, y1, x2, y2);
  }
  const [x1, y1, x2, y2] = spec.bezier;
  return cubicBezier(x1, y1, x2, y2);
};
