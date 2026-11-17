import { assertFrames } from "./time";

/**
 * Planner temporal PURO: no importa React ni Remotion. Describe CUÁNDO ocurre cada bloque
 * (en frames enteros) y devuelve spans con inicio y fin absolutos dentro del plan.
 * No evalúa animaciones: eso sigue siendo trabajo de los keyframes de la Fase 2A.
 */

/** Bloque con nombre y duración. Es lo único que produce un `Span` en el plan. */
export type StepNode = { readonly kind: "step"; readonly id: string; readonly duration: number };
/** Tiempo vacío. Dentro de `sequence`, una duración negativa solapa el bloque siguiente con el anterior. */
export type GapNode = { readonly kind: "gap"; readonly duration: number };
export type SequenceNode = { readonly kind: "sequence"; readonly items: readonly PlanNode[] };
export type ParallelNode = { readonly kind: "parallel"; readonly items: readonly PlanNode[] };
export type StaggerNode = {
  readonly kind: "stagger";
  readonly each: number;
  readonly items: readonly PlanNode[];
};
export type PlanNode = StepNode | GapNode | SequenceNode | ParallelNode | StaggerNode;

/** Intervalo resuelto de un `step`: `[start, end)` en frames del plan. */
export type Span = {
  readonly id: string;
  readonly start: number;
  readonly end: number;
  readonly duration: number;
};

export type Plan = {
  /** Duración total del plan, en frames. */
  readonly duration: number;
  /** Todos los spans, en el orden en que se declararon los steps. */
  readonly spans: readonly Span[];
  /** Span por id. Lanza un error si el id no existe. */
  readonly span: (id: string) => Span;
  readonly has: (id: string) => boolean;
};

/** Bloque con nombre. `duration` en frames enteros (≥ 0; 0 = marca instantánea). */
export const step = (id: string, duration: number): StepNode => {
  if (typeof id !== "string" || id.length === 0) {
    throw new TypeError("step: el id debe ser un texto no vacío.");
  }
  assertFrames(`step("${id}"): la duración`, duration);
  return { kind: "step", id, duration };
};

/** Espera de `duration` frames. Negativa = solapamiento (solo válida dentro de `sequence`). */
export const gap = (duration: number): GapNode => {
  if (!Number.isInteger(duration)) {
    throw new RangeError(`gap: la duración debe ser un número entero de frames (recibido ${duration}).`);
  }
  return { kind: "gap", duration };
};

/** Uno detrás de otro. Termina cuando termina el último (o el último gap). */
export const sequence = (...items: readonly PlanNode[]): SequenceNode => ({ kind: "sequence", items });

/** Todos empiezan a la vez. Dura lo que dure el más largo. */
export const parallel = (...items: readonly PlanNode[]): ParallelNode => ({ kind: "parallel", items });

/** Escalonado: el elemento `i` empieza `i * each` frames después del primero. Se solapan. */
export const stagger = (each: number, items: readonly PlanNode[]): StaggerNode => {
  assertFrames("stagger: `each`", each);
  return { kind: "stagger", each, items };
};

/** `count` steps con la misma duración e ids `prefix-0`, `prefix-1`… Pensado para `stagger`. */
export const steps = (prefix: string, count: number, duration: number): StepNode[] => {
  assertFrames("steps: `count`", count);
  return Array.from({ length: count }, (_, i) => step(`${prefix}-${i}`, duration));
};

const assertNoNegativeGap = (kind: string, item: PlanNode): void => {
  if (item.kind === "gap" && item.duration < 0) {
    throw new RangeError(`${kind}: un gap negativo (solapamiento) solo tiene sentido dentro de sequence.`);
  }
};

/** Coloca `node` empezando en `offset` y devuelve su duración. Acumula los spans en `out`. */
const place = (node: PlanNode, offset: number, out: Span[], seen: Set<string>): number => {
  switch (node.kind) {
    case "step": {
      if (seen.has(node.id)) {
        throw new Error(`plan: el id "${node.id}" está repetido; cada step necesita un id único.`);
      }
      seen.add(node.id);
      out.push({ id: node.id, start: offset, end: offset + node.duration, duration: node.duration });
      return node.duration;
    }
    case "gap":
      return node.duration;
    case "sequence": {
      let cursor = 0;
      let end = 0;
      for (const item of node.items) {
        cursor += place(item, offset + cursor, out, seen);
        if (cursor < 0) {
          throw new RangeError("sequence: el solapamiento (gap negativo) supera el inicio de la secuencia.");
        }
        end = Math.max(end, cursor);
      }
      return end;
    }
    case "parallel": {
      let end = 0;
      for (const item of node.items) {
        assertNoNegativeGap("parallel", item);
        end = Math.max(end, place(item, offset, out, seen));
      }
      return end;
    }
    case "stagger": {
      let end = 0;
      node.items.forEach((item, index) => {
        assertNoNegativeGap("stagger", item);
        const shift = index * node.each;
        end = Math.max(end, shift + place(item, offset + shift, out, seen));
      });
      return end;
    }
  }
};

/** Resuelve el árbol a spans absolutos. Lanza un error si hay ids repetidos o solapamientos imposibles. */
export const plan = (root: PlanNode): Plan => {
  const spans: Span[] = [];
  const duration = place(root, 0, spans, new Set<string>());
  if (duration < 0) {
    throw new RangeError("plan: un gap negativo (solapamiento) solo tiene sentido dentro de sequence.");
  }
  const byId = new Map(spans.map((s) => [s.id, s] as const));
  return {
    duration,
    spans,
    has: (id) => byId.has(id),
    span: (id) => {
      const found = byId.get(id);
      if (!found) {
        throw new Error(`plan: no existe el span "${id}". Ids disponibles: ${spans.map((s) => s.id).join(", ")}.`);
      }
      return found;
    },
  };
};
