import type { FC } from "react";
import { Animate, Group, Rect, Stage, Stagger, tween } from "../../src/forge";

/** Posiciones X (centro) de los tres hijos del Stagger, en coordenadas del Stage (origen centrado). */
export const CHILD_X = [-100, 0, 100] as const;
/** Rojo, verde y azul puros: se distinguen sin ambigüedad sobre fondo negro. */
export const CHILD_COLORS = ["#ff0000", "#00ff00", "#0000ff"] as const;
/** Frame (local) en que termina el fundido de cada hijo en el modo "local". */
export const LOCAL_END = [11, 12, 11] as const;
/** Opacidad inicial del fundido en el modo "local": 0.2 (nunca 0, para distinguir "visible" de "ausente"). */
export const LOCAL_START_OPACITY = 0.2;

export type StaggerProbeProps = {
  readonly from: number;
  readonly each: number;
  readonly duration: number;
  /** `solid`: cuadrados de color fijo. `local`: fundido blanco que depende del frame LOCAL de cada hijo. */
  readonly mode: "solid" | "local";
};

const SIZE = 40;

/** Tres hijos dentro de `<Stagger persist={false}>`; es lo único que cambia entre T1.1, T1.2 y T1.3. */
export const StaggerProbe: FC<StaggerProbeProps> = ({ from, each, duration, mode }) => (
  <Stage background="#000000">
    <Stagger from={from} each={each} duration={duration} persist={false} name="probe">
      {CHILD_X.map((x, i) =>
        mode === "solid" ? (
          <Group key={i} x={x}>
            <Rect width={SIZE} height={SIZE} fill={CHILD_COLORS[i]} />
          </Group>
        ) : (
          <Animate key={i} x={x} animation={{ opacity: tween(0, LOCAL_END[i], LOCAL_START_OPACITY, 1) }}>
            <Rect width={SIZE} height={SIZE} fill="#ffffff" />
          </Animate>
        ),
      )}
    </Stagger>
  </Stage>
);
