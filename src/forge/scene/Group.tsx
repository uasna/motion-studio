import type { FC, ReactNode } from "react";
import { nodeAttributes } from "../core/attributes";
import type { NodeProps } from "../core/types";

export type GroupProps = NodeProps & { readonly children?: ReactNode };

/**
 * Contenedor jerárquico. Los hijos heredan la transformación, la opacidad
 * y los estilos (fill, stroke…) del grupo, y pueden anidarse sin límite.
 */
export const Group: FC<GroupProps> = ({ children, ...node }) => (
  <g {...nodeAttributes(node)}>{children}</g>
);

export type LayerProps = GroupProps & { readonly name: string };

/** Grupo de primer nivel con nombre obligatorio: la unidad de composición de una escena. */
export const Layer: FC<LayerProps> = (props) => <Group {...props} />;
