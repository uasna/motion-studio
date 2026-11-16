import type { FC } from "react";
import { nodeAttributes } from "../core/attributes";
import type { NodeProps, Vec2 } from "../core/types";

/**
 * Convención: toda forma se dibuja alrededor de su ORIGEN LOCAL (0, 0).
 * Se posiciona con `x`/`y` y rota/escala sobre su propio centro sin configuración extra.
 */

export type Anchor = "center" | "top-left";

export type RectProps = NodeProps & {
  readonly width: number;
  readonly height: number;
  readonly radius?: number;
  readonly anchor?: Anchor;
};

export const Rect: FC<RectProps> = ({ width, height, radius, anchor = "center", ...node }) => (
  <rect
    x={anchor === "center" ? -width / 2 : 0}
    y={anchor === "center" ? -height / 2 : 0}
    width={width}
    height={height}
    rx={radius}
    ry={radius}
    {...nodeAttributes(node)}
  />
);

export type CircleProps = NodeProps & { readonly radius: number };

export const Circle: FC<CircleProps> = ({ radius, ...node }) => (
  <circle r={radius} {...nodeAttributes(node)} />
);

export type EllipseProps = NodeProps & {
  readonly radiusX: number;
  readonly radiusY: number;
};

export const Ellipse: FC<EllipseProps> = ({ radiusX, radiusY, ...node }) => (
  <ellipse rx={radiusX} ry={radiusY} {...nodeAttributes(node)} />
);

export type LineProps = NodeProps & {
  readonly from: Vec2;
  readonly to: Vec2;
};

/** Sin `stroke` propio ni heredado de un Group, una línea no se ve. */
export const Line: FC<LineProps> = ({ from, to, ...node }) => (
  <line
    x1={from[0]}
    y1={from[1]}
    x2={to[0]}
    y2={to[1]}
    {...nodeAttributes({ fill: "none", ...node })}
  />
);

const toPointsAttr = (points: readonly Vec2[]): string =>
  points.map(([px, py]) => `${px},${py}`).join(" ");

export type PolyProps = NodeProps & { readonly points: readonly Vec2[] };

export const Polygon: FC<PolyProps> = ({ points, ...node }) => (
  <polygon points={toPointsAttr(points)} {...nodeAttributes(node)} />
);

export const Polyline: FC<PolyProps> = ({ points, ...node }) => (
  <polyline points={toPointsAttr(points)} {...nodeAttributes({ fill: "none", ...node })} />
);

export type PathProps = NodeProps & { readonly d: string };

export const Path: FC<PathProps> = ({ d, ...node }) => (
  <path d={d} {...nodeAttributes(node)} />
);
