import { useId } from "react";

/** Id válido para `url(#...)` en SVG, estable entre renders y único por instancia. */
export const useUniqueId = (prefix: string): string =>
  `forge-${prefix}-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
