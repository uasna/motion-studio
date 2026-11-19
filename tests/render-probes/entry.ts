// Entrada INDEPENDIENTE de las pruebas de render. No es la entrada del proyecto (src/index.ts):
// estas composiciones no aparecen en Remotion Studio del proyecto ni en `npm run build`.
import { registerRoot } from "remotion";
import { ProbeRoot } from "./ProbeRoot";

registerRoot(ProbeRoot);
