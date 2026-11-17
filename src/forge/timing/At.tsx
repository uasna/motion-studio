import type { FC, ReactNode } from "react";
import { Sequence } from "remotion";
import type { Span } from "./planner";
import { assertFrames } from "./time";

type AtTiming =
  | {
      /** Span de un `plan`: el contenido empieza en `span.start` y, sin `persist`, dura `span.duration`. */
      readonly span: Span;
      readonly from?: never;
      readonly duration?: never;
    }
  | {
      /** Frame de inicio, relativo al <Sequence> contenedor (o a la composición). */
      readonly from: number;
      /** Duración en frames; obligatoria solo con `persist={false}`. */
      readonly duration?: number;
      readonly span?: never;
    };

export type AtProps = AtTiming & {
  /**
   * `true` (por defecto): tras el span el contenido SIGUE visible, en su estado final.
   * `false`: el contenido se desmonta al terminar el span.
   */
  readonly persist?: boolean;
  /** Nombre en la línea de tiempo de Remotion Studio. Por defecto, el id del span. */
  readonly name?: string;
  readonly children?: ReactNode;
};

/**
 * Hace que su contenido EXISTA desde un instante: antes de `from` no se renderiza.
 * Dentro, `useCurrentFrame()` (y por tanto `useAnimation`/`<Animate>`) cuenta desde 0 en `from`.
 * Para un objeto que debe verse desde el principio y solo ANIMARSE más tarde, usa `delay`.
 *
 * Es una <Sequence layout="none">: no añade <div> y es válida dentro de SVG. No usa premount/postmount.
 */
export const At: FC<AtProps> = (props) => {
  const { persist = true, children } = props;
  const from = props.span !== undefined ? props.span.start : props.from;
  const duration = props.span !== undefined ? props.span.duration : props.duration;
  const name = props.name ?? props.span?.id;

  if (from === undefined) {
    throw new TypeError("<At> necesita `span` o `from`.");
  }
  assertFrames("<At>: `from`", from);
  if (duration !== undefined) assertFrames("<At>: `duration`", duration);
  if (!persist && duration === undefined) {
    throw new TypeError("<At persist={false}> necesita `span` o `duration` para saber cuándo terminar.");
  }

  // Un span de 0 frames sin persistencia no llega a mostrarse nunca (Sequence exige duración > 0).
  if (!persist && duration === 0) return null;

  return (
    <Sequence from={from} durationInFrames={persist ? undefined : duration} layout="none" name={name}>
      {children}
    </Sequence>
  );
};
