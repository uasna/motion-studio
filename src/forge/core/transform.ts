import type { TransformProps } from "./types";

/**
 * Convierte un TransformProps en el atributo SVG `transform`.
 * Orden de aplicación (de padre a hijo): desplazar → rotar → inclinar → escalar,
 * todo alrededor de `pivot`. Devuelve `undefined` si es la identidad.
 */
export const toSvgTransform = (t: TransformProps): string | undefined => {
  const { x = 0, y = 0, rotation = 0, scale = 1, skewX = 0, skewY = 0, pivot } = t;
  const [sx, sy] = typeof scale === "number" ? [scale, scale] : scale;
  const [px, py] = pivot ?? [0, 0];

  const parts: string[] = [];
  if (x !== 0 || y !== 0) parts.push(`translate(${x} ${y})`);

  const hasLinear = rotation !== 0 || skewX !== 0 || skewY !== 0 || sx !== 1 || sy !== 1;
  if (hasLinear) {
    const hasPivot = px !== 0 || py !== 0;
    if (hasPivot) parts.push(`translate(${px} ${py})`);
    if (rotation !== 0) parts.push(`rotate(${rotation})`);
    if (skewX !== 0) parts.push(`skewX(${skewX})`);
    if (skewY !== 0) parts.push(`skewY(${skewY})`);
    if (sx !== 1 || sy !== 1) parts.push(`scale(${sx} ${sy})`);
    if (hasPivot) parts.push(`translate(${-px} ${-py})`);
  }

  return parts.length > 0 ? parts.join(" ") : undefined;
};
