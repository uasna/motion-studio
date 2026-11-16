import { createContext, useContext } from "react";
import type { StageBounds } from "../scene/stage-context";

/**
 * Estado de la cámara en coordenadas del mundo:
 * - `x`, `y`: punto del mundo que queda en el centro del encuadre.
 * - `scale`: zoom (1 = sin zoom, 2 = el doble de grande, 0.5 = se ve el doble de mundo).
 */
export type CameraState = {
  readonly x: number;
  readonly y: number;
  readonly scale: number;
};

export type CameraContextValue = {
  readonly state: CameraState;
  /** Zona del mundo visible ahora mismo, en coordenadas del mundo. */
  readonly view: StageBounds;
};

export const CameraContext = createContext<CameraContextValue | null>(null);

/** Estado actual de la cámara y zona visible del mundo. Solo dentro de <Camera>. */
export const useCamera = (): CameraContextValue => {
  const value = useContext(CameraContext);
  if (value === null) {
    throw new Error("useCamera() debe usarse dentro de <Camera>.");
  }
  return value;
};
