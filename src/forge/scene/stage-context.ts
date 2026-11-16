import { createContext, useContext } from "react";

/** Límites visibles del escenario en coordenadas del motor. Permite adaptar el diseño a 16:9, 9:16 y 1:1. */
export type StageBounds = {
  readonly width: number;
  readonly height: number;
  readonly left: number;
  readonly right: number;
  readonly top: number;
  readonly bottom: number;
};

export const StageContext = createContext<StageBounds | null>(null);

export const useStage = (): StageBounds => {
  const bounds = useContext(StageContext);
  if (bounds === null) {
    throw new Error("useStage() debe usarse dentro de <Stage>.");
  }
  return bounds;
};
