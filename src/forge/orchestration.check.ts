/**
 * Comprobaciones de la Fase 2C. Sin dependencias de test: lanza un Error si algo falla.
 *
 * Ejecución (PowerShell, desde C:\Projects\Motion-Studio):
 *   npx esbuild src/forge/orchestration.check.ts --bundle --platform=node --outfile=out/orchestration.check.cjs
 *   node out/orchestration.check.cjs
 */
import {
  cameraMoves,
  cameraShots,
  evaluateAnimation,
  evaluateTrack,
  gap,
  parallel,
  plan,
  sec,
  sequence,
  stagger,
  step,
  steps,
  tween,
  type AnimationSpec,
  type CameraAnimation,
  type PlanNode,
} from ".";

const failures: string[] = [];
let passed = 0;

const check = (name: string, body: () => void): void => {
  try {
    body();
    passed++;
  } catch (error) {
    failures.push(`${name}: ${error instanceof Error ? error.message : String(error)}`);
  }
};

const near = (actual: number, expected: number, label = "valor"): void => {
  if (Math.abs(actual - expected) > 1e-9) {
    throw new Error(`${label}: esperado ${expected}, recibido ${actual}`);
  }
};

const throws = (body: () => unknown, fragment: string): void => {
  try {
    body();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (!message.includes(fragment)) {
      throw new Error(`el error "${message}" no contiene "${fragment}"`);
    }
    return;
  }
  throw new Error(`debía lanzar un error con "${fragment}" y no lanzó nada`);
};

const startEnd = (p: ReturnType<typeof plan>, id: string): [number, number] => [
  p.span(id).start,
  p.span(id).end,
];

const same = (actual: [number, number], expected: [number, number], label: string): void => {
  if (actual[0] !== expected[0] || actual[1] !== expected[1]) {
    throw new Error(`${label}: esperado ${expected.join("-")}, recibido ${actual.join("-")}`);
  }
};

/* ============================ sec() ============================ */

check("sec: segundos a frames con el redondeo del estudio", () => {
  near(sec(1.5, 30), 45);
  near(sec(0.5, 24), 12);
  near(sec(2, 60), 120);
  near(sec(0, 30), 0);
});
check("sec: rechaza negativos y FPS inválidos", () => {
  throws(() => sec(-1, 30), "positive");
  throws(() => sec(1, 0), "FPS");
  throws(() => sec(1, 29.97), "FPS");
  throws(() => sec(0, 29.97), "FPS");
});

/* ============================ planner ============================ */

check("planner: sequence encadena", () => {
  const p = plan(sequence(step("a", 10), step("b", 20)));
  same(startEnd(p, "a"), [0, 10], "a");
  same(startEnd(p, "b"), [10, 30], "b");
  near(p.duration, 30, "duración");
});
check("planner: parallel empieza a la vez y dura lo del más largo", () => {
  const p = plan(parallel(step("a", 10), step("b", 25)));
  same(startEnd(p, "a"), [0, 10], "a");
  same(startEnd(p, "b"), [0, 25], "b");
  near(p.duration, 25, "duración");
});
check("planner: stagger escalona y se solapa", () => {
  const p = plan(stagger(4, steps("dot", 3, 10)));
  same(startEnd(p, "dot-0"), [0, 10], "dot-0");
  same(startEnd(p, "dot-1"), [4, 14], "dot-1");
  same(startEnd(p, "dot-2"), [8, 18], "dot-2");
  near(p.duration, 18, "duración");
});
check("planner: stagger con each=0 equivale a parallel", () => {
  const p = plan(stagger(0, steps("s", 3, 7)));
  p.spans.forEach((s) => same([s.start, s.end], [0, 7], s.id));
});
check("planner: gap positivo y gap final cuentan", () => {
  const p = plan(sequence(step("a", 10), gap(5), step("b", 10), gap(7)));
  same(startEnd(p, "b"), [15, 25], "b");
  near(p.duration, 32, "duración con gap final");
});
check("planner: gap negativo solapa", () => {
  const p = plan(sequence(step("a", 30), gap(-10), step("b", 30)));
  same(startEnd(p, "b"), [20, 50], "b");
  near(p.duration, 50, "duración");
});
check("planner: el solapamiento no acorta el plan si el bloque anterior era más largo", () => {
  const p = plan(sequence(step("a", 30), step("b", 5), gap(-20), step("c", 4)));
  same(startEnd(p, "c"), [15, 19], "c");
  near(p.duration, 35, "duración");
});
check("planner: anidamiento acumula desplazamientos", () => {
  const p = plan(sequence(step("a", 10), parallel(step("b", 5), sequence(step("c", 3), step("d", 4)))));
  same(startEnd(p, "b"), [10, 15], "b");
  same(startEnd(p, "c"), [10, 13], "c");
  same(startEnd(p, "d"), [13, 17], "d");
  near(p.duration, 17, "duración");
});
check("planner: stagger de bloques compuestos", () => {
  const block = (n: number): PlanNode => sequence(step(`in-${n}`, 6), step(`out-${n}`, 4));
  const p = plan(stagger(5, [block(0), block(1)]));
  same(startEnd(p, "out-0"), [6, 10], "out-0");
  same(startEnd(p, "in-1"), [5, 11], "in-1");
  same(startEnd(p, "out-1"), [11, 15], "out-1");
});
check("planner: casos vacíos y marcas de 0 frames", () => {
  near(plan(sequence()).duration, 0, "sequence vacía");
  near(plan(parallel()).duration, 0, "parallel vacío");
  const p = plan(sequence(step("a", 5), step("marca", 0)));
  same(startEnd(p, "marca"), [5, 5], "marca");
});
check("planner: steps genera ids prefijo-índice", () => {
  const list = steps("cell", 3, 9);
  if (list.map((s) => s.id).join() !== "cell-0,cell-1,cell-2") throw new Error("ids incorrectos");
  near(steps("x", 0, 9).length, 0, "count 0");
});
check("planner: errores de validación", () => {
  throws(() => plan(sequence(step("a", 1), step("a", 2))), "repetido");
  throws(() => plan(sequence(step("a", 10), gap(-11))), "supera el inicio");
  throws(() => plan(parallel(step("a", 1), gap(-1))), "solo tiene sentido dentro de sequence");
  throws(() => plan(stagger(2, [gap(-1)])), "solo tiene sentido dentro de sequence");
  throws(() => plan(gap(-3)), "solo tiene sentido dentro de sequence");
  throws(() => step("", 1), "id");
  throws(() => step("x", 1.5), "entero");
  throws(() => step("x", -1), "no negativo");
  throws(() => gap(0.5), "entero");
  throws(() => stagger(-1, []), "no negativo");
  throws(() => stagger(1.5, []), "entero");
  throws(() => steps("x", -1, 5), "count");
  throws(() => plan(step("a", 1)).span("nope"), 'no existe el span "nope"');
});
check("planner: has() y span() coherentes", () => {
  const p = plan(step("a", 3));
  if (!p.has("a") || p.has("b")) throw new Error("has() incorrecto");
});
check("planner: determinista (mismo árbol, mismo resultado)", () => {
  const build = () => plan(sequence(step("a", 10), stagger(3, steps("s", 4, 8))));
  if (JSON.stringify(build().spans) !== JSON.stringify(build().spans)) throw new Error("resultados distintos");
});

/* ============================ delay ============================ */

const SLIDE: AnimationSpec = {
  x: tween(0, 30, 0, 300),
  opacity: tween(0, 10, 0, 1),
  scale: tween(0, 30, [1, 1], [2, 4]),
};

check("delay: sin opciones y delay=0 reproducen la Fase 2A exacta", () => {
  for (let frame = -5; frame <= 60; frame++) {
    const base = evaluateAnimation(SLIDE, frame);
    const zero = evaluateAnimation(SLIDE, frame, { delay: 0 });
    const empty = evaluateAnimation(SLIDE, frame, {});
    const reference = {
      x: evaluateTrack(SLIDE.x!, frame),
      opacity: evaluateTrack(SLIDE.opacity!, frame),
    };
    near(base.x as number, reference.x, `x@${frame}`);
    near(base.opacity as number, reference.opacity, `opacity@${frame}`);
    if (JSON.stringify(base) !== JSON.stringify(zero) || JSON.stringify(base) !== JSON.stringify(empty)) {
      throw new Error(`resultados distintos en el frame ${frame}`);
    }
  }
});
check("delay: desplaza todos los keyframes", () => {
  near(evaluateAnimation(SLIDE, 15, { delay: 15 }).x as number, 0, "inicio");
  near(evaluateAnimation(SLIDE, 30, { delay: 15 }).x as number, 150, "mitad");
  near(evaluateAnimation(SLIDE, 45, { delay: 15 }).x as number, 300, "final");
  near(evaluateAnimation(SLIDE, 200, { delay: 15 }).x as number, 300, "mantiene el último valor");
});
check("delay: antes de empezar mantiene el primer keyframe", () => {
  const early = evaluateAnimation(SLIDE, 3, { delay: 20 });
  near(early.x as number, 0, "x");
  near(early.opacity as number, 0, "opacity");
  const scale = early.scale as readonly [number, number];
  near(scale[0], 1, "scale[0]");
  near(scale[1], 1, "scale[1]");
});
check("delay: es aditivo con el desplazamiento de un contenedor (At)", () => {
  const atStart = 40;
  const delay = 12;
  for (const absolute of [0, 40, 52, 60, 70, 82, 120]) {
    const local = absolute - atStart; // lo que vería useCurrentFrame() dentro de <At from={40}>
    const viaDelay = evaluateAnimation(SLIDE, local, { delay }).x as number;
    const direct = evaluateAnimation(SLIDE, absolute - (atStart + delay)).x as number;
    near(viaDelay, direct, `x@${absolute}`);
  }
});
check("delay: acepta valores negativos y fraccionarios; rechaza no finitos", () => {
  near(evaluateAnimation(SLIDE, 0, { delay: -15 }).x as number, 150, "negativo adelanta");
  near(evaluateAnimation(SLIDE, 15, { delay: 7.5 }).x as number, 75, "fraccionario");
  throws(() => evaluateAnimation(SLIDE, 0, { delay: Number.NaN }), "finito");
  throws(() => evaluateAnimation(SLIDE, 0, { delay: Infinity }), "finito");
});

/* ============================ cameraMoves ============================ */

const INITIAL = { x: 0, y: 0, scale: 1 } as const;

const at = (track: NonNullable<CameraAnimation["x"]>, frame: number): number => evaluateTrack(track, frame);

check("cameraMoves: encadena movimientos y mantiene entre ellos", () => {
  const p = plan(sequence(step("m1", 30), gap(10), step("m2", 20)));
  const cam = cameraMoves(p, INITIAL, [
    { span: "m1", to: { x: 100, y: 50, scale: 2 } },
    { span: "m2", to: { x: 300 } },
  ]);
  near(at(cam.x, 0), 0, "x@0");
  near(at(cam.x, 15), 50, "x@15");
  near(at(cam.x, 30), 100, "x@30");
  near(at(cam.x, 35), 100, "x@35 (quieta)");
  near(at(cam.x, 40), 100, "x@40");
  near(at(cam.x, 50), 200, "x@50");
  near(at(cam.x, 60), 300, "x@60");
  near(at(cam.x, 500), 300, "x@fin");
  near(at(cam.y, 15), 25, "y@15");
  near(at(cam.y, 55), 50, "y no cambia en m2");
  near(at(cam.scale, 15), 1.5, "scale@15");
  near(at(cam.scale, 55), 2, "scale no cambia en m2");
});
check("cameraMoves: antes del primer movimiento se queda en initial", () => {
  const p = plan(sequence(gap(20), step("m", 10)));
  const cam = cameraMoves(p, { x: 5, y: 6, scale: 1.5 }, [{ span: "m", to: { x: 50 } }]);
  near(at(cam.x, 0), 5, "x@0");
  near(at(cam.x, 19), 5, "x@19");
  near(at(cam.y, 25), 6, "y constante");
  near(at(cam.scale, 25), 1.5, "scale constante");
});
check("cameraMoves: respeta el easing (ease-in-out es simétrica y más lenta al inicio)", () => {
  const p = plan(step("m", 40));
  const cam = cameraMoves(p, INITIAL, [{ span: "m", to: { x: 100 }, easing: "ease-in-out" }]);
  near(at(cam.x, 20), 50, "mitad");
  if (!(at(cam.x, 10) < 25)) throw new Error("debería ir por debajo de lineal al inicio");
});
check("cameraMoves: ejes distintos pueden solaparse en el tiempo", () => {
  const p = plan(parallel(step("pan", 30), step("zoom", 30)));
  const cam = cameraMoves(p, INITIAL, [
    { span: "pan", to: { x: 90 } },
    { span: "zoom", to: { scale: 3 } },
  ]);
  near(at(cam.x, 15), 45, "x");
  near(at(cam.scale, 15), 2, "scale");
});
check("cameraMoves: el mismo eje no puede solaparse", () => {
  const p = plan(parallel(step("a", 30), step("b", 30)));
  throws(
    () =>
      cameraMoves(p, INITIAL, [
        { span: "a", to: { x: 10 } },
        { span: "b", to: { x: 20 } },
      ]),
    "se solapan en el eje x",
  );
});
check("cameraMoves: movimientos consecutivos que se tocan (fin = inicio) son válidos", () => {
  const p = plan(sequence(step("a", 10), step("b", 10)));
  const cam = cameraMoves(p, INITIAL, [
    { span: "a", to: { x: 10 } },
    { span: "b", to: { x: 30 } },
  ]);
  near(at(cam.x, 10), 10, "x@10");
  near(at(cam.x, 20), 30, "x@20");
});
check("cameraMoves: orden de declaración independiente del orden temporal", () => {
  const p = plan(sequence(step("a", 10), step("b", 10)));
  const cam = cameraMoves(p, INITIAL, [
    { span: "b", to: { x: 30 } },
    { span: "a", to: { x: 10 } },
  ]);
  near(at(cam.x, 5), 5, "x@5");
  near(at(cam.x, 20), 30, "x@20");
});
check("cameraMoves: un span de 0 frames produce un salto instantáneo", () => {
  const p = plan(sequence(step("hold", 10), step("cut", 0)));
  const cam = cameraMoves(p, INITIAL, [{ span: "cut", to: { x: 40 } }]);
  near(at(cam.x, 9), 0, "x antes");
  near(at(cam.x, 10), 40, "x en el corte");
});
check("cameraMoves: errores de validación", () => {
  const p = plan(step("m", 10));
  throws(() => cameraMoves(p, INITIAL, [{ span: "nope", to: { x: 1 } }]), 'no existe el span "nope"');
  throws(() => cameraMoves(p, INITIAL, [{ span: "m", to: { scale: 0 } }]), "mayor que 0");
  throws(() => cameraMoves(p, INITIAL, [{ span: "m", to: { scale: -2 } }]), "mayor que 0");
  throws(() => cameraMoves(p, { x: 0, y: 0, scale: 0 }, []), "mayor que 0");
});
check("cameraMoves: equivale a cameraShots de la Fase 2B para el mismo guion", () => {
  const A = { x: 0, y: 0, scale: 0.8 };
  const B = { x: 400, y: -120, scale: 2.2 };
  const C = { x: -200, y: 80, scale: 1.1 };
  const legacy = cameraShots([
    { frame: 0, ...A },
    { frame: 25, ...A, easing: "ease-in-out" },
    { frame: 65, ...B },
    { frame: 90, ...B, easing: "ease-out" },
    { frame: 130, ...C },
  ]);
  const p = plan(sequence(gap(25), step("to-b", 40), gap(25), step("to-c", 40)));
  const moves = cameraMoves(p, A, [
    { span: "to-b", to: B, easing: "ease-in-out" },
    { span: "to-c", to: C, easing: "ease-out" },
  ]);
  for (let frame = 0; frame <= 160; frame++) {
    near(at(moves.x, frame), at(legacy.x, frame), `x@${frame}`);
    near(at(moves.y, frame), at(legacy.y, frame), `y@${frame}`);
    near(at(moves.scale, frame), at(legacy.scale, frame), `scale@${frame}`);
  }
});
check("cameraShots (Fase 2B) conserva su salida", () => {
  const out = cameraShots([
    { frame: 0, x: 1, y: 2, scale: 3 },
    { frame: 10, x: 4, y: 5, scale: 6, easing: "ease-in" },
  ]);
  if (
    JSON.stringify(out) !==
    JSON.stringify({
      x: [
        { frame: 0, value: 1 },
        { frame: 10, value: 4, easing: "ease-in" },
      ],
      y: [
        { frame: 0, value: 2 },
        { frame: 10, value: 5, easing: "ease-in" },
      ],
      scale: [
        { frame: 0, value: 3 },
        { frame: 10, value: 6, easing: "ease-in" },
      ],
    })
  ) {
    throw new Error("cameraShots cambió su salida");
  }
});

/* ============================ resultado ============================ */

console.log(`Fase 2C — comprobaciones: ${passed} correctas, ${failures.length} con fallo.`);
if (failures.length > 0) {
  failures.forEach((f) => console.log(`  ✗ ${f}`));
  throw new Error(`${failures.length} comprobación(es) fallida(s).`);
}
