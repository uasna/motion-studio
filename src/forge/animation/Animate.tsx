import type { FC } from "react";
import { Group, type GroupProps } from "../scene/Group";
import { useAnimation, type AnimationSpec } from "./evaluate";

export type AnimateProps = GroupProps & {
  readonly animation: AnimationSpec;
  /** Retraso aditivo en frames (ver `AnimationOptions.delay`). Por defecto, 0. */
  readonly delay?: number;
};

/**
 * Group animado: los valores animados tienen prioridad sobre los estáticos del mismo nombre.
 * Los hijos pueden ser formas, Group, Clip o Mask.
 */
export const Animate: FC<AnimateProps> = ({ animation, delay, children, ...base }) => {
  const animated = useAnimation(animation, { delay });
  return (
    <Group {...base} {...animated}>
      {children}
    </Group>
  );
};
