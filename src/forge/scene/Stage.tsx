import { useMemo, type FC, type ReactNode } from "react";
import { AbsoluteFill, useVideoConfig } from "remotion";
import { StageContext, type StageBounds } from "./stage-context";

export type StageProps = {
  /** Por defecto, el tamaño de la composición de Remotion. */
  readonly width?: number;
  readonly height?: number;
  /**
   * `center` (por defecto): (0, 0) es el centro del encuadre, así una escena
   * centrada se ve igual en cualquier proporción. `top-left`: origen SVG clásico.
   */
  readonly origin?: "center" | "top-left";
  readonly background?: string;
  readonly children?: ReactNode;
};

/** Raíz de toda escena 2D: un único <svg> que escala con la composición. */
export const Stage: FC<StageProps> = ({
  width,
  height,
  origin = "center",
  background,
  children,
}) => {
  const config = useVideoConfig();
  const w = width ?? config.width;
  const h = height ?? config.height;

  const bounds = useMemo<StageBounds>(
    () =>
      origin === "center"
        ? { width: w, height: h, left: -w / 2, right: w / 2, top: -h / 2, bottom: h / 2 }
        : { width: w, height: h, left: 0, right: w, top: 0, bottom: h },
    [origin, w, h],
  );

  return (
    <AbsoluteFill style={{ backgroundColor: background }}>
      <svg
        viewBox={`${bounds.left} ${bounds.top} ${w} ${h}`}
        width="100%"
        height="100%"
        preserveAspectRatio="xMidYMid meet"
        style={{ display: "block" }}
      >
        <StageContext.Provider value={bounds}>{children}</StageContext.Provider>
      </svg>
    </AbsoluteFill>
  );
};
