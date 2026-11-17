import { getDurationInFrames } from "../../studio/formats";

/**
 * Segundos → frames enteros. Reutiliza `getDurationInFrames()` del estudio, así que
 * redondeo y validación de FPS son los mismos en todo el proyecto. `0` es válido (0 frames);
 * negativos no (para un solapamiento usa `gap(-sec(...))`).
 */
export const sec = (seconds: number, fps: number): number => {
  if (seconds === 0) {
    getDurationInFrames(1, fps); // valida `fps` con la misma regla que el resto del estudio
    return 0;
  }
  return getDurationInFrames(seconds, fps);
};

/** Comprueba que `value` es un número entero de frames, no menor que `min`. */
export const assertFrames = (label: string, value: number, min = 0): void => {
  if (!Number.isInteger(value) || value < min) {
    throw new RangeError(
      `${label} debe ser un número entero de frames${min === 0 ? " no negativo" : ` ≥ ${min}`} (recibido ${value}).`,
    );
  }
};
