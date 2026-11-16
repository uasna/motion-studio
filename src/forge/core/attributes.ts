import { toSvgTransform } from "./transform";
import type { NodeAttributes, NodeProps } from "./types";

/**
 * Único punto donde NodeProps se traduce a atributos SVG.
 * Formas, grupos y capas lo reutilizan: no hay lógica de estilo duplicada.
 */
export const nodeAttributes = (p: NodeProps): NodeAttributes => ({
  transform: toSvgTransform(p),
  fill: p.fill,
  stroke: p.stroke,
  strokeWidth: p.strokeWidth,
  opacity: p.opacity,
  fillOpacity: p.fillOpacity,
  strokeOpacity: p.strokeOpacity,
  strokeLinecap: p.strokeLinecap,
  strokeLinejoin: p.strokeLinejoin,
  strokeDasharray: p.strokeDasharray,
  strokeDashoffset: p.strokeDashoffset,
  display: p.visible === false ? "none" : undefined,
  style: p.blendMode && p.blendMode !== "normal" ? { mixBlendMode: p.blendMode } : undefined,
  "data-name": p.name,
});
