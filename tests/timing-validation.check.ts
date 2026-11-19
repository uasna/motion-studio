/**
 * T1.4 — Validaciones de <Stagger persist={false}> / <At> (sin render, sin navegador).
 *
 * Llama a las funciones de componente directamente: las rutas de validación y la construcción
 * del árbol no usan hooks. Comprueba la estructura que Stagger entrega a At y la que At entrega
 * a Remotion <Sequence>.
 *
 * Ejecución (PowerShell, desde C:\Projects\Motion-Studio):
 *   npx esbuild tests/timing-validation.check.ts --bundle --platform=node --outfile=out/timing-validation.check.cjs
 *   node out/timing-validation.check.cjs
 */
import { createElement, type ReactElement, type ReactNode } from "react";
import { Sequence } from "remotion";
import { At, Stagger } from "../src/forge";

type El = ReactElement<Record<string, unknown>>;

let passed = 0;
let failed = 0;
const check = (name: string, ok: boolean, detail = ""): void => {
  if (ok) passed++;
  else {
    failed++;
    console.log(`  ✗ ${name}${detail ? ` — ${detail}` : ""}`);
  }
};

const child = (key: string): El => createElement("g", { key }) as unknown as El;
const callComponent = (el: El): ReactNode => (el.type as unknown as (props: unknown) => ReactNode)(el.props);
/** Hijos (elementos <At>) que Stagger entrega. */
const atChildren = (node: unknown): El[] => {
  const root = node as El;
  return root.props.children as El[];
};
const thrown = (fn: () => unknown): Error | null => {
  try {
    fn();
    return null;
  } catch (error) {
    return error as Error;
  }
};
const isType = (e: Error | null, ctor: ErrorConstructor | TypeErrorConstructor | RangeErrorConstructor, text?: string): boolean =>
  e instanceof ctor && (text === undefined || e.message.includes(text));

/* --- 1. Estructura con persist={false}: Stagger -> At -> Sequence --- */
{
  const ats = atChildren(Stagger({ from: 10, each: 5, duration: 12, persist: false, name: "x", children: [child("a"), child("b"), child("c")] }));
  check("Stagger entrega 3 <At>", ats.length === 3 && ats.every((a) => a.type === At));
  check("from de cada At = from + i*each", [10, 15, 20].every((f, i) => ats[i].props.from === f), JSON.stringify(ats.map((a) => a.props.from)));
  check("duration=12 y persist=false llegan a cada At", ats.every((a) => a.props.duration === 12 && a.props.persist === false));
  check("name numerado desde 1", ats.every((a, i) => a.props.name === `x ${i + 1}`), JSON.stringify(ats.map((a) => a.props.name)));
  const seqs = ats.map((a) => callComponent(a) as El);
  check("At devuelve <Sequence> de Remotion", seqs.every((s) => s.type === Sequence));
  check("Sequence: from correcto", [10, 15, 20].every((f, i) => seqs[i].props.from === f));
  check("Sequence: durationInFrames=12", seqs.every((s) => s.props.durationInFrames === 12));
  check('Sequence: layout="none" (sin <div> envolvente)', seqs.every((s) => s.props.layout === "none"));
}

/* --- 2. persist por defecto (true): la duración no limita --- */
{
  const ats = atChildren(Stagger({ from: 0, each: 3, duration: 5, children: [child("a"), child("b")] }));
  const seqs = ats.map((a) => callComponent(a) as El);
  check("persist por defecto: Sequence sin durationInFrames", seqs.every((s) => s.props.durationInFrames === undefined));
  check("persist por defecto: from escalonado", seqs[0].props.from === 0 && seqs[1].props.from === 3);
}

/* --- 3. Validaciones de duration con persist={false} --- */
{
  const mk = (duration?: number): El[] => atChildren(Stagger({ from: 0, each: 5, persist: false, duration, children: [child("a")] }));
  check("sin duration: el At lanza TypeError que menciona persist={false}", isType(thrown(() => callComponent(mk(undefined)[0])), TypeError, "persist={false}"));
  for (const [label, value] of [["fraccionaria 1.5", 1.5], ["negativa -1", -1], ["NaN", NaN], ["Infinity", Infinity]] as const) {
    check(`duration ${label}: RangeError`, isType(thrown(() => callComponent(mk(value)[0])), RangeError));
  }
  check("duration=0: At devuelve null (nada se renderiza)", callComponent(mk(0)[0]) === null);
  check("duration=0 en todos los hijos", atChildren(Stagger({ from: 0, each: 5, persist: false, duration: 0, children: [child("a"), child("b")] })).every((a) => callComponent(a) === null));
}

/* --- 4. Validaciones de from / each --- */
{
  check("each fraccionario: Stagger lanza RangeError al construirse", isType(thrown(() => Stagger({ each: 2.5, persist: false, duration: 4, children: [child("a")] })), RangeError));
  check("each negativo: Stagger lanza RangeError", isType(thrown(() => Stagger({ each: -1, persist: false, duration: 4, children: [child("a")] })), RangeError));
  const bad = (from: number): El => atChildren(Stagger({ from, each: 1, persist: false, duration: 4, children: [child("a")] }))[0];
  check("from negativo: el At lanza RangeError", isType(thrown(() => callComponent(bad(-3))), RangeError));
  check("from fraccionario: el At lanza RangeError", isType(thrown(() => callComponent(bad(1.5))), RangeError));
}

/* --- 5. OBSERVACIONES del comportamiento actual (no son contrato; se fijan para detectar cambios) --- */
{
  const ats = atChildren(Stagger({ from: 0, each: 4, persist: false, duration: 2, children: [null, child("a"), false, child("b"), undefined] }));
  check("OBS: null/false/undefined se descartan; los índices no avanzan por ellos", ats.length === 2 && ats[0].props.from === 0 && ats[1].props.from === 4, JSON.stringify(ats.map((a) => a.props.from)));
  const frag = atChildren(Stagger({ from: 0, each: 4, persist: false, duration: 2, children: createElement("g", null, child("a"), child("b")) }));
  check("OBS: un elemento con varios descendientes cuenta como UN solo hijo", frag.length === 1);
  const empty = thrown(() => Stagger({ each: 4, persist: false, children: [] }));
  check("OBS: sin hijos y sin duration NO lanza error (nadie valida duration)", empty === null);
}

console.log(`T1.4 — validaciones de Stagger/At: ${passed} correctas, ${failed} con fallo.`);
process.exit(failed === 0 ? 0 : 1);
