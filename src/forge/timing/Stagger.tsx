import { Children, isValidElement, type FC, type ReactNode } from "react";
import { At } from "./At";
import { assertFrames } from "./time";

export type StaggerProps = {
  /** Frames entre la aparición de un hijo y la del siguiente (mismo cálculo que `stagger()` del planner). */
  readonly each: number;
  /** Frame en que aparece el primer hijo. Por defecto, 0. */
  readonly from?: number;
  /** Duración de cada hijo; obligatoria solo con `persist={false}`. */
  readonly duration?: number;
  /** Igual que en <At>: `true` por defecto. */
  readonly persist?: boolean;
  /** Si se indica, cada hijo se llama "<name> 1", "<name> 2"… en la línea de tiempo de Studio. */
  readonly name?: string;
  readonly children?: ReactNode;
};

/**
 * Escalona la APARICIÓN de sus hijos directos: el hijo `i` se monta en `from + i * each`
 * y dentro de él el tiempo local empieza en 0. Cada hijo es un <At>.
 * Para escalonar solo la animación de objetos ya visibles, usa `delay={i * each}` en <Animate>.
 */
export const Stagger: FC<StaggerProps> = ({ each, from = 0, duration, persist = true, name, children }) => {
  assertFrames("<Stagger>: `each`", each);
  return (
    <>
      {Children.toArray(children).map((child, index) => (
        <At
          key={isValidElement(child) && child.key !== null ? child.key : index}
          from={from + index * each}
          duration={duration}
          persist={persist}
          name={name === undefined ? undefined : `${name} ${index + 1}`}
        >
          {child}
        </At>
      ))}
    </>
  );
};
