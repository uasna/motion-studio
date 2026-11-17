import type { EasingSpec } from "../animation/easing";
import type { Keyframe, Track } from "../animation/keyframes";
import type { Plan, Span } from "../timing/planner";
import type { CameraState } from "./camera-context";
import { assertValidScale, type CameraAnimation } from "./camera-math";

/** Un movimiento de cámara anclado a un `step` del plan. */
export type CameraMove = {
  /** Id del step del plan: el movimiento empieza en `span.start` y termina en `span.end`. */
  readonly span: string;
  /** Destino. Los ejes que se omitan no cambian durante este movimiento. */
  readonly to: Partial<CameraState>;
  /** Suaviza el movimiento (por defecto, lineal). */
  readonly easing?: EasingSpec;
};

type ResolvedMove = { readonly span: Span; readonly to: Partial<CameraState>; readonly easing?: EasingSpec };

type Channel = keyof CameraState;

const buildChannel = (channel: Channel, initial: number, moves: readonly ResolvedMove[]): Track => {
  const touching = moves
    .map((move, order) => ({ move, order }))
    .filter(({ move }) => move.to[channel] !== undefined)
    .sort((a, b) => a.move.span.start - b.move.span.start || a.order - b.order);

  if (touching.length === 0) return [{ frame: 0, value: initial }];

  const track: Keyframe[] = [];
  let previous = initial;
  let previousMove: ResolvedMove | null = null;
  for (const { move } of touching) {
    if (previousMove !== null && move.span.start < previousMove.span.end) {
      throw new RangeError(
        `cameraMoves: "${previousMove.span.id}" y "${move.span.id}" se solapan en el eje ${channel}. ` +
          `Un mismo eje no puede tener dos movimientos a la vez.`,
      );
    }
    const target = move.to[channel] as number;
    track.push({ frame: move.span.start, value: previous, easing: move.easing });
    track.push({ frame: move.span.end, value: target });
    previous = target;
    previousMove = move;
  }
  return track;
};

/**
 * Convierte movimientos anclados a un `plan` en los tracks de <Camera animation>.
 * La cámara parte de `initial`, se mantiene quieta entre movimientos y usa los mismos
 * keyframes y easing de la Fase 2A.
 *
 * Referencia temporal común: los spans están en frames del PLAN. Para que cámara y objetos
 * coincidan, <Camera> y los <At> del plan deben colgar del mismo <Sequence> (o de la
 * composición): no coloques la <Camera> dentro de un <At> distinto del que origina el plan.
 *
 * Los ejes son independientes: x, y y zoom pueden solaparse entre sí en el tiempo, pero un
 * mismo eje no puede tener dos movimientos simultáneos (lanza un error).
 */
export const cameraMoves = (
  timeline: Plan,
  initial: CameraState,
  moves: readonly CameraMove[],
): Required<CameraAnimation> => {
  assertValidScale(initial.scale);
  const resolved: ResolvedMove[] = moves.map((move) => {
    if (move.to.scale !== undefined) assertValidScale(move.to.scale);
    return { span: timeline.span(move.span), to: move.to, easing: move.easing };
  });
  return {
    x: buildChannel("x", initial.x, resolved),
    y: buildChannel("y", initial.y, resolved),
    scale: buildChannel("scale", initial.scale, resolved),
  };
};
