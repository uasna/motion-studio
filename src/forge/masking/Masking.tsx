import { useContext, type FC, type ReactNode } from "react";
import { nodeAttributes } from "../core/attributes";
import type { NodeProps } from "../core/types";
import { CameraContext } from "../camera/camera-context";
import { useUniqueId } from "../core/useUniqueId";
import { StageContext } from "../scene/stage-context";

export type ClipProps = NodeProps & {
  /**
   * Forma que define la región visible (bordes duros).
   * Solo primitivas (Rect, Circle, Path…); Group/Layer no son válidos dentro de un clipPath SVG.
   */
  readonly shape: ReactNode;
  readonly children?: ReactNode;
};

/**
 * Recorta `children` con `shape`. El recorte vive en el espacio local de <Clip>:
 * para mover el contenido sin mover el recorte, anida un <Group> dentro.
 */
export const Clip: FC<ClipProps> = ({ shape, children, ...node }) => {
  const id = useUniqueId("clip");
  return (
    <g {...nodeAttributes(node)} clipPath={`url(#${id})`}>
      <defs>
        <clipPath id={id}>{shape}</clipPath>
      </defs>
      {children}
    </g>
  );
};

export type MaskRegion = {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
};

export type MaskProps = NodeProps & {
  /**
   * Contenido de la máscara. Por defecto se pinta de blanco: blanco = visible,
   * negro = oculto, grises/opacidad = semitransparente. Acepta Group y cualquier forma.
   */
  readonly mask: ReactNode;
  /**
   * Región (espacio local) donde la máscara se evalúa. Por defecto, la zona visible
   * (la del <Camera> si hay una; si no, el encuadre del <Stage>) más un margen de una
   * zona por lado. Pásala solo si el contenido enmascarado vive muy lejos del origen
   * local, p. ej. dentro de un Group desplazado más de una pantalla.
   */
  readonly region?: MaskRegion;
  readonly children?: ReactNode;
};

const FALLBACK_REGION: MaskRegion = { x: -5000, y: -5000, width: 10000, height: 10000 };

/** Enmascara `children` por luminancia, sin depender del bbox del contenido. */
export const Mask: FC<MaskProps> = ({ mask, region, children, ...node }) => {
  const id = useUniqueId("mask");
  const stage = useContext(StageContext);
  const camera = useContext(CameraContext);
  const visible = camera ? camera.view : stage;
  const r: MaskRegion =
    region ??
    (visible
      ? {
          x: visible.left - visible.width,
          y: visible.top - visible.height,
          width: visible.width * 3,
          height: visible.height * 3,
        }
      : FALLBACK_REGION);

  return (
    <g {...nodeAttributes(node)} mask={`url(#${id})`}>
      <defs>
        <mask id={id} maskUnits="userSpaceOnUse" x={r.x} y={r.y} width={r.width} height={r.height}>
          <g fill="white">{mask}</g>
        </mask>
      </defs>
      {children}
    </g>
  );
};
