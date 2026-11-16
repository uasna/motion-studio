import type { CSSProperties } from "react";

/** Par [x, y] en unidades del espacio local. */
export type Vec2 = readonly [number, number];

/**
 * Transformación 2D de un nodo. Todo se expresa en espacio local del padre:
 * - `x`, `y`: desplazamiento.
 * - `rotation`: grados, sentido horario.
 * - `scale`: uniforme (número) o por eje ([sx, sy]).
 * - `pivot`: centro de rotación/escala/inclinación, en coordenadas locales del nodo.
 *   No mueve el objeto: solo define alrededor de qué punto se transforma.
 */
export type TransformProps = {
  readonly x?: number;
  readonly y?: number;
  readonly rotation?: number;
  readonly scale?: number | Vec2;
  readonly skewX?: number;
  readonly skewY?: number;
  readonly pivot?: Vec2;
};

export type StyleProps = {
  readonly fill?: string;
  readonly stroke?: string;
  readonly strokeWidth?: number;
  readonly opacity?: number;
  readonly fillOpacity?: number;
  readonly strokeOpacity?: number;
  readonly strokeLinecap?: "butt" | "round" | "square";
  readonly strokeLinejoin?: "miter" | "round" | "bevel";
  readonly strokeDasharray?: string | number;
  readonly strokeDashoffset?: number;
};

export type BlendMode =
  | "normal"
  | "multiply"
  | "screen"
  | "overlay"
  | "darken"
  | "lighten"
  | "color-dodge"
  | "color-burn"
  | "hard-light"
  | "soft-light"
  | "difference"
  | "exclusion"
  | "plus-lighter";

/** Propiedades comunes a TODO nodo del grafo de escena (formas, grupos, capas). */
export type NodeProps = TransformProps &
  StyleProps & {
    /** Nombre legible; se emite como `data-name` para depuración y futuras herramientas. */
    readonly name?: string;
    /** `false` oculta el nodo y sus hijos sin desmontarlos. */
    readonly visible?: boolean;
    readonly blendMode?: BlendMode;
  };

/** Atributos SVG resultantes de un NodeProps. */
export type NodeAttributes = {
  transform?: string;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  opacity?: number;
  fillOpacity?: number;
  strokeOpacity?: number;
  strokeLinecap?: "butt" | "round" | "square";
  strokeLinejoin?: "miter" | "round" | "bevel";
  strokeDasharray?: string | number;
  strokeDashoffset?: number;
  display?: "none";
  style?: CSSProperties;
  "data-name"?: string;
};
