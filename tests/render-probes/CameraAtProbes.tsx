import type { FC, ReactNode } from "react";
import { useCurrentFrame } from "remotion";
import { At, Camera, Rect, Stage, cameraMoves, gap, plan, sequence, step } from "../../src/forge";

/**
 * Plan compartido por todas las pruebas de cámara (frames del PLAN):
 *   appear = [10, 20)   pan = [20, 50)
 * La cámara va de x=0 a x=300 durante `pan` (lineal). Un marcador blanco en el mundo (300, 0)
 * se ve, en pantalla, en x = 300 - cámara.x: leyendo su posición se lee la cámara.
 */
export const PLAN = plan(sequence(gap(10), step("appear", 10), step("pan", 30)));
const CAMERA = cameraMoves(PLAN, { x: 0, y: 0, scale: 1 }, [{ span: "pan", to: { x: 300 } }]);

/** Posición en el mundo del marcador blanco y del objeto verde (este último, con <At span="appear">). */
export const MARKER = { x: 300, y: 0 } as const;
export const OBJECT = { x: 300, y: 60 } as const;
/** Reloj de pantalla (fuera de <At> y de <Camera>): su x = CLOCK.x0 + CLOCK.perFrame * frameGlobal. */
export const CLOCK = { x0: -380, perFrame: 2, y: -80 } as const;

export type CameraWrap = "control" | "at40" | "nested" | "persistFalse";

export type CameraAtProbeProps = {
  /**
   * control: <Camera> directamente en el Stage (contrato vigente).
   * at40: <At from={40}><Camera>.   nested: <At from={40}><At from={10}><Camera>.
   * persistFalse: <At from={40} duration={30} persist={false}><Camera>.
   */
  readonly wrap: CameraWrap;
  /** Añade un objeto verde dentro de la cámara, con <At span={plan.span("appear")}>. */
  readonly withObject: boolean;
};

const World: FC<{ readonly withObject: boolean }> = ({ withObject }) => (
  <>
    <Rect x={MARKER.x} y={MARKER.y} width={20} height={20} fill="#ffffff" />
    {withObject ? (
      <At span={PLAN.span("appear")}>
        <Rect x={OBJECT.x} y={OBJECT.y} width={20} height={20} fill="#00ff00" />
      </At>
    ) : null}
  </>
);

/** Lee el frame GLOBAL (está fuera de cualquier <At>): sirve de verdad de referencia para el reloj. */
const Clock: FC = () => {
  const frame = useCurrentFrame();
  return <Rect x={CLOCK.x0 + CLOCK.perFrame * frame} y={CLOCK.y} width={8} height={8} fill="#0000ff" />;
};

const wrapCamera = (wrap: CameraWrap, camera: ReactNode): ReactNode => {
  switch (wrap) {
    case "control":
      return camera;
    case "at40":
      return <At from={40}>{camera}</At>;
    case "nested":
      return (
        <At from={40}>
          <At from={10}>{camera}</At>
        </At>
      );
    case "persistFalse":
      return (
        <At from={40} duration={30} persist={false}>
          {camera}
        </At>
      );
  }
};

export const CameraAtProbe: FC<CameraAtProbeProps> = ({ wrap, withObject }) => (
  <Stage background="#000000">
    {wrapCamera(
      wrap,
      <Camera animation={CAMERA}>
        <World withObject={withObject} />
      </Camera>,
    )}
    <Clock />
  </Stage>
);
