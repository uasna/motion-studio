import type { FC, ReactNode } from "react";
import { useAnimation } from "../animation/evaluate";
import { Group } from "../scene/Group";
import { useStage } from "../scene/stage-context";
import { CameraContext, type CameraContextValue, type CameraState } from "./camera-context";
import { cameraTransform, visibleWorld, type CameraAnimation } from "./camera-math";

export type CameraProps = {
  /** Valores estáticos; los animados tienen prioridad. Por defecto: centrada en el origen, sin zoom. */
  readonly x?: number;
  readonly y?: number;
  readonly scale?: number;
  /** Tracks de `x`, `y` y `scale` (zoom) con el sistema de keyframes y easing de la Fase 2A. */
  readonly animation?: CameraAnimation;
  readonly name?: string;
  readonly children?: ReactNode;
};

const NO_ANIMATION: CameraAnimation = {};

/**
 * Cámara 2D. Envuelve SOLO el contenido del mundo: lo que quede fuera (fondo del Stage,
 * HUD, subtítulos) no se ve afectado. Es un Group con la transformación de cámara como
 * capa más externa, de modo que las transformaciones de grupos y formas interiores se
 * componen con ella sin conflicto. Debe usarse dentro de <Stage>.
 */
export const Camera: FC<CameraProps> = ({
  x = 0,
  y = 0,
  scale = 1,
  animation = NO_ANIMATION,
  name = "camera",
  children,
}) => {
  const stage = useStage();
  const animated = useAnimation(animation);

  if (animated.scale !== undefined && typeof animated.scale !== "number") {
    throw new TypeError("El zoom de la cámara debe ser un número (zoom uniforme), no [sx, sy].");
  }

  const state: CameraState = {
    x: animated.x ?? x,
    y: animated.y ?? y,
    scale: animated.scale ?? scale,
  };
  const value: CameraContextValue = { state, view: visibleWorld(state, stage) };

  return (
    <CameraContext.Provider value={value}>
      <Group name={name} {...cameraTransform(state, stage)}>
        {children}
      </Group>
    </CameraContext.Provider>
  );
};
