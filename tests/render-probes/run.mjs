/**
 * Pruebas de render T1.1-T1.3 (Stagger persist={false}) y T2.1-T2.5 (Camera dentro de At).
 *
 * Qué hace: empaqueta tests/render-probes/entry.ts en un directorio TEMPORAL (fuera del repo),
 * renderiza stills PNG con un único navegador, decodifica los píxeles (sin dependencias) y
 * compara con oráculos calculados AQUÍ, de forma independiente del motor.
 *
 * Ejecución (PowerShell, desde C:\Projects\Motion-Studio):
 *   node tests/render-probes/run.mjs
 *   node tests/render-probes/run.mjs --only T1.1,T2.5     (subconjunto)
 *
 * Variables opcionales:
 *   PROBE_BROWSER=<ruta>   ejecutable de Chrome/Chromium (por defecto Remotion usa su Chrome Headless Shell).
 *   PROBE_KEEP=1           conserva el directorio temporal (bundle y PNG) y muestra su ruta.
 *
 * No escribe nada dentro del repositorio. Código de salida: 0 si todo pasa, 1 si algo falla.
 */
import { bundle } from "@remotion/bundler";
import { openBrowser, renderStill, selectComposition } from "@remotion/renderer";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import zlib from "node:zlib";

const here = path.dirname(fileURLToPath(import.meta.url));
const entryPoint = path.join(here, "entry.ts");

/* ============================ PNG (RGB/RGBA de 8 bits, sin entrelazado) ============================ */

const decodePng = (buffer) => {
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  if (!buffer.subarray(0, 8).equals(signature)) throw new Error("No es un PNG.");
  let width = 0;
  let height = 0;
  let channels = 0;
  const idat = [];
  for (let offset = 8; offset < buffer.length; ) {
    const length = buffer.readUInt32BE(offset);
    const type = buffer.toString("ascii", offset + 4, offset + 8);
    const body = buffer.subarray(offset + 8, offset + 8 + length);
    if (type === "IHDR") {
      width = body.readUInt32BE(0);
      height = body.readUInt32BE(4);
      const bitDepth = body[8];
      const colorType = body[9];
      const interlace = body[12];
      if (bitDepth !== 8 || interlace !== 0 || (colorType !== 2 && colorType !== 6)) {
        throw new Error(`PNG no soportado (profundidad ${bitDepth}, tipo ${colorType}, entrelazado ${interlace}).`);
      }
      channels = colorType === 2 ? 3 : 4;
    } else if (type === "IDAT") {
      idat.push(body);
    }
    offset += 12 + length;
  }
  const raw = zlib.inflateSync(Buffer.concat(idat));
  const stride = width * channels;
  const data = Buffer.alloc(stride * height);
  for (let y = 0; y < height; y++) {
    const filter = raw[y * (stride + 1)];
    const line = raw.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1));
    for (let i = 0; i < stride; i++) {
      const left = i >= channels ? data[y * stride + i - channels] : 0;
      const up = y > 0 ? data[(y - 1) * stride + i] : 0;
      const upLeft = y > 0 && i >= channels ? data[(y - 1) * stride + i - channels] : 0;
      let predictor = 0;
      if (filter === 1) predictor = left;
      else if (filter === 2) predictor = up;
      else if (filter === 3) predictor = (left + up) >> 1;
      else if (filter === 4) {
        const p = left + up - upLeft;
        const pa = Math.abs(p - left);
        const pb = Math.abs(p - up);
        const pc = Math.abs(p - upLeft);
        predictor = pa <= pb && pa <= pc ? left : pb <= pc ? up : upLeft;
      } else if (filter !== 0) throw new Error(`Filtro PNG desconocido: ${filter}`);
      data[y * stride + i] = (line[i] + predictor) & 0xff;
    }
  }
  return { width, height, channels, data };
};

const pixel = (png, x, y) => {
  const i = (y * png.width + x) * png.channels;
  return [png.data[i], png.data[i + 1], png.data[i + 2]];
};

/* ============================ Lectura de marcadores ============================ */

/** Peso 0..1 con que un píxel "pertenece" a un color primario o blanco sobre fondo negro. */
const WEIGHT = {
  white: ([r, g, b]) => Math.min(r, g, b) / 255,
  green: ([r, g, b]) => Math.max(0, g - Math.max(r, b)) / 255,
  blue: ([r, g, b]) => Math.max(0, b - Math.max(r, g)) / 255,
};

/**
 * Centroide horizontal (en coordenadas del Stage, origen centrado) del color `kind` en la fila
 * de píxeles `row`. `present` es falso si apenas hay masa (el marcador no está).
 */
const readMarker = (png, row, kind) => {
  let mass = 0;
  let moment = 0;
  for (let x = 0; x < png.width; x++) {
    const w = WEIGHT[kind](pixel(png, x, row));
    mass += w;
    moment += w * (x + 0.5);
  }
  return mass > 3 ? { present: true, x: moment / mass - png.width / 2, mass } : { present: false, x: NaN, mass };
};

/* ============================ Infraestructura de pruebas ============================ */

const results = new Map(); // id -> { name, checks, failures[] }
const begin = (id, name) => results.set(id, { name, checks: 0, failures: [] });
let current = null;
const select = (id) => {
  current = results.get(id);
};
const expectThat = (condition, message) => {
  current.checks++;
  if (!condition) current.failures.push(message);
};
const near = (actual, expected, tolerance, label) =>
  expectThat(
    Number.isFinite(actual) && Math.abs(actual - expected) <= tolerance,
    `${label}: esperado ${expected} ±${tolerance}, medido ${Number.isFinite(actual) ? actual.toFixed(2) : actual}`,
  );

const only = (() => {
  const flag = process.argv.indexOf("--only");
  return flag === -1 ? null : new Set(process.argv[flag + 1].split(",").map((s) => s.trim()));
})();
const selected = (id) => only === null || only.has(id);

/* ============================ Oráculos (independientes del motor) ============================ */

const clamp01 = (v) => Math.min(1, Math.max(0, v));
/** Cámara del plan: x=0 hasta el frame 20; lineal hasta x=300 en el frame 50. Argumento: frame del PLAN. */
const planCameraX = (local) => 300 * clamp01((local - 20) / 30);
/** x de pantalla (origen centrado) de un objeto del mundo en x=300, con la cámara en `cameraX`. */
const markerStageX = (cameraX) => 300 - cameraX;
/** Reloj global: x = -380 + 2 * frame. */
const clockFrame = (stageX) => (stageX + 380) / 2;

/* ============================ Renderizado ============================ */

const work = fs.mkdtempSync(path.join(os.tmpdir(), "motion-forge-probes-"));
const cleanup = () => {
  if (process.env.PROBE_KEEP === "1") console.log(`\n(PROBE_KEEP=1) Archivos temporales en: ${work}`);
  else fs.rmSync(work, { recursive: true, force: true });
};

const main = async () => {
  console.log("Empaquetando fixtures de tests/render-probes en un directorio temporal…");
  const serveUrl = await bundle({ entryPoint, outDir: path.join(work, "bundle"), onProgress: () => undefined });

  const browserExecutable = process.env.PROBE_BROWSER || null;
  const browser = await openBrowser("chrome", { browserExecutable, logLevel: "error" });

  const compositions = new Map();
  const images = new Map();
  const still = async (id, frame) => {
    const key = `${id}@${frame}`;
    if (images.has(key)) return images.get(key);
    if (!compositions.has(id)) {
      compositions.set(id, await selectComposition({ serveUrl, id, puppeteerInstance: browser, logLevel: "error" }));
    }
    const output = path.join(work, "stills", `${id}-${String(frame).padStart(3, "0")}.png`);
    await renderStill({
      composition: compositions.get(id),
      serveUrl,
      frame,
      output,
      imageFormat: "png",
      overwrite: true,
      puppeteerInstance: browser,
      logLevel: "error",
    });
    const png = decodePng(fs.readFileSync(output));
    images.set(key, png);
    return png;
  };

  const range = (from, to) => Array.from({ length: to - from + 1 }, (_, i) => from + i);

  /* ---------- T1: Stagger persist={false} ---------- */
  const CHILD_X = [-100, 0, 100];
  const COLORS = [
    [255, 0, 0],
    [0, 255, 0],
    [0, 0, 255],
  ];
  const isColor = (p, c) => p.every((v, k) => Math.abs(v - c[k]) <= 24);
  const isBlack = (p) => p.every((v) => v <= 8);
  const centre = (png, i) => pixel(png, png.width / 2 + CHILD_X[i], png.height / 2);
  /** Oráculo del Sequence: el hijo i es visible en g <=> from + i*each <= g < from + i*each + duration. */
  const visibleAt = ({ from, each, duration }, i, g) => g >= from + i * each && g < from + i * each + duration;

  if (selected("T1.1")) {
    begin("T1.1", "Ventanas de visibilidad (from=10, each=5, duration=12, 3 hijos)");
    select("T1.1");
    const spec = { from: 10, each: 5, duration: 12 };
    for (const g of range(8, 34)) {
      const png = await still("T1-1-windows", g);
      for (let i = 0; i < 3; i++) {
        const p = centre(png, i);
        const should = visibleAt(spec, i, g);
        expectThat(should ? isColor(p, COLORS[i]) : isBlack(p), `g=${g} hijo ${i}: esperado ${should ? "visible" : "ausente"}, píxel ${p}`);
      }
    }
    // Fronteras explícitas del contrato: el primer frame visible es `from`; el último, `from+duration-1`.
    for (const [i, first, last] of [[0, 10, 21], [1, 15, 26], [2, 20, 31]]) {
      expectThat(isBlack(centre(await still("T1-1-windows", first - 1), i)), `hijo ${i}: debe estar ausente en ${first - 1}`);
      expectThat(isColor(centre(await still("T1-1-windows", first), i), COLORS[i]), `hijo ${i}: debe aparecer en ${first}`);
      expectThat(isColor(centre(await still("T1-1-windows", last), i), COLORS[i]), `hijo ${i}: debe seguir visible en ${last}`);
      expectThat(isBlack(centre(await still("T1-1-windows", last + 1), i)), `hijo ${i}: debe desmontarse en ${last + 1}`);
    }
  }

  if (selected("T1.2")) {
    begin("T1.2", "Relevo exacto (from=0, each=6, duration=6): siempre un único hijo");
    select("T1.2");
    for (const g of range(0, 19)) {
      const png = await still("T1-2-relay", g);
      const visible = [0, 1, 2].filter((i) => !isBlack(centre(png, i)));
      const expected = g < 18 ? [Math.floor(g / 6)] : [];
      expectThat(
        visible.join() === expected.join(),
        `g=${g}: visibles [${visible}] (esperado [${expected}])`,
      );
      for (const i of visible) expectThat(isColor(centre(png, i), COLORS[i]), `g=${g}: color incorrecto en el hijo ${i}`);
    }
  }

  if (selected("T1.3")) {
    begin("T1.3", "Tiempo local: opacidad = 0.2 + 0.8 * min(local/fin, 1); fin=11 o 12 con duration=12");
    select("T1.3");
    const spec = { from: 10, each: 5, duration: 12 };
    const END = [11, 12, 11]; // hijo 1 usa un tween "tardío" que termina en `duration`, no en `duration-1`
    const brightness = (png, i) => pixel(png, png.width / 2 + CHILD_X[i], png.height / 2)[0];
    const seen = [0, 0, 0]; // brillo máximo observado por hijo
    for (const g of range(8, 34)) {
      const png = await still("T1-3-local", g);
      for (let i = 0; i < 3; i++) {
        const b = brightness(png, i);
        if (visibleAt(spec, i, g)) {
          const local = g - (spec.from + i * spec.each);
          const expected = 255 * (0.2 + 0.8 * Math.min(local / END[i], 1));
          near(b, expected, 4, `g=${g} hijo ${i} (local ${local})`);
          seen[i] = Math.max(seen[i], b);
        } else {
          expectThat(b <= 8, `g=${g} hijo ${i}: debía estar ausente, brillo ${b}`);
        }
      }
    }
    // El fin exclusivo implica que el último frame visible es local = duration-1 = 11:
    expectThat(seen[0] >= 251, `hijo 0 (tween hasta 11) debe llegar a 255 en su último frame visible; máximo ${seen[0]}`);
    expectThat(seen[2] >= 251, `hijo 2 (tween hasta 11) debe llegar a 255 en su último frame visible; máximo ${seen[2]}`);
    expectThat(seen[1] < 245, `hijo 1 (tween hasta 12) NO debe llegar a completarse; máximo ${seen[1]}`);
    near(seen[1], 255 * (0.2 + 0.8 * (11 / 12)), 4, "hijo 1 en su último frame visible (local 11 de 12)");
  }

  /* ---------- T2: Camera dentro de At ---------- */
  const H = 200; // alto de las composiciones T2 (800x200)
  const ROW = { marker: H / 2, object: H / 2 + 60, clock: H / 2 - 80 };
  const read = async (id, g) => {
    const png = await still(id, g);
    return {
      marker: readMarker(png, ROW.marker, "white"),
      object: readMarker(png, ROW.object, "green"),
      clock: readMarker(png, ROW.clock, "blue"),
    };
  };
  const checkClock = (m, g, label) => near(clockFrame(m.clock.x), g, 0.5, `${label}: el reloj global debe leer ${g}`);
  /** Marcador presente y en la posición que implica la cámara en el frame de plan `local`. */
  const expectCamera = (m, local, label) => {
    expectThat(m.marker.present, `${label}: el marcador debe estar presente`);
    if (m.marker.present) near(m.marker.x, markerStageX(planCameraX(local)), 1, `${label} (frame de plan ${local})`);
  };
  const expectAbsent = (m, label) => expectThat(!m.marker.present, `${label}: el mundo no debe renderizarse (masa ${m.marker.mass.toFixed(1)})`);

  // El control (T2-1) es también la referencia de T2.2 y T2.3: sus frames se renderizan bajo demanda.
  const CONTROL_FRAMES = [0, 19, 20, 25, 35, 40, 49, 50, 60, 100];
  if (selected("T2.1")) {
    begin("T2.1", "Control: <Camera> a nivel de Stage (contrato vigente), cámara = plan");
    select("T2.1");
    for (const g of CONTROL_FRAMES) {
      const m = await read("T2-1-control", g);
      checkClock(m, g, `g=${g}`);
      expectCamera(m, g, `g=${g}`);
    }
  }

  if (selected("T2.2")) {
    begin("T2.2", "<At from={40}><Camera>: desfase de 40 frames respecto al plan");
    select("T2.2");
    const F = 40;
    for (const g of [39, 40, 59, 60, 75, 89, 90, 100]) {
      const m = await read("T2-2-at40", g);
      checkClock(m, g, `g=${g}`);
      if (g < F) expectAbsent(m, `g=${g} (antes de from=${F})`);
      else expectCamera(m, g - F, `g=${g}`);
    }
    // Desfase explícito: lo que el control muestra en g-40, el caso At lo muestra en g.
    for (const g of [60, 75, 90]) {
      const at = await read("T2-2-at40", g);
      const control = await read("T2-1-control", g - F);
      near(at.marker.x, control.marker.x, 1, `g=${g}: At(40) debe igualar al control en g-40=${g - F}`);
    }
    // Y NO coincide con el control en el mismo frame global (la cámara va tarde):
    const late = await read("T2-2-at40", 35);
    const early = await read("T2-1-control", 35);
    expectThat(!late.marker.present && early.marker.present && Math.abs(early.marker.x - 150) <= 1, "g=35: el control ya está en x=150 y el caso At aún no existe");
  }

  if (selected("T2.3")) {
    begin("T2.3", "<At from={40}><At from={10}><Camera>: los offsets se suman (50 frames)");
    select("T2.3");
    const F = 50;
    for (const g of [49, 50, 70, 75, 85, 90, 100, 110]) {
      const m = await read("T2-3-nested", g);
      checkClock(m, g, `g=${g}`);
      if (g < F) expectAbsent(m, `g=${g} (antes de 40+10)`);
      else expectCamera(m, g - F, `g=${g}`);
    }
    for (const g of [75, 85, 90, 100]) {
      const nested = await read("T2-3-nested", g);
      const control = await read("T2-1-control", g - F);
      near(nested.marker.x, control.marker.x, 1, `g=${g}: anidado debe igualar al control en g-50=${g - F}`);
    }
  }

  if (selected("T2.4")) {
    begin("T2.4", "Objetos con <At span> dentro de <Camera> dentro de <At from={40}>: offset acumulado y sincronía relativa");
    select("T2.4");
    const F = 40;
    const APPEAR = 10; // span "appear" empieza en el frame 10 del plan
    for (const g of [APPEAR - 1, APPEAR, 20, 50]) {
      const m = await read("T2-4-control", g);
      checkClock(m, g, `control g=${g}`);
      expectThat(m.object.present === g >= APPEAR, `control g=${g}: objeto ${g >= APPEAR ? "presente" : "ausente"} (medido ${m.object.present})`);
      expectCamera(m, g, `control g=${g}`);
    }
    for (const g of [40, F + APPEAR - 1, F + APPEAR, 60, 75, 90]) {
      const m = await read("T2-4-at40", g);
      checkClock(m, g, `At(40) g=${g}`);
      expectCamera(m, g - F, `At(40) g=${g}`);
      const shouldSee = g >= F + APPEAR;
      expectThat(m.object.present === shouldSee, `At(40) g=${g}: objeto ${shouldSee ? "presente" : "ausente"} (medido ${m.object.present}); aparece en F+span.start=${F + APPEAR}`);
      // Sincronía relativa: el objeto (mundo x=300) y el marcador (mundo x=300) se mueven juntos.
      if (m.object.present && m.marker.present) near(m.object.x, m.marker.x, 1, `At(40) g=${g}: objeto y cámara en sincronía`);
    }
    // La brecha respecto al reloj global: el plan dice "appear" en 10 y el reloj marca 50.
    const atAppear = await read("T2-4-at40", F + APPEAR);
    expectThat(atAppear.object.present && Math.abs(clockFrame(atAppear.clock.x) - (F + APPEAR)) <= 0.5, "el objeto aparece cuando el reloj global marca 50, no 10");
  }

  if (selected("T2.5")) {
    begin("T2.5", "<At from={40} duration={30} persist={false}><Camera>: la cámara y su mundo existen solo en [40, 70)");
    select("T2.5");
    const F = 40;
    const D = 30;
    for (const g of [39, 40, 55, 69, 70, 100, 139]) {
      const m = await read("T2-5-persist-false", g);
      checkClock(m, g, `g=${g}`);
      if (g >= F && g < F + D) expectCamera(m, g - F, `g=${g}`);
      else expectAbsent(m, `g=${g} (fuera de [${F}, ${F + D}))`);
    }
    // Último frame visible: tiempo local 29 -> el plan marca x=90 (no llega a 300, el movimiento se corta).
    const last = await read("T2-5-persist-false", 69);
    near(last.marker.x, markerStageX(90), 1, "g=69: cámara en x=90 (la ventana corta el movimiento)");
  }

  await browser.close({ silent: true });

  /* ---------- Informe ---------- */
  let failed = 0;
  console.log("\nResultados de las pruebas de render:");
  for (const [id, r] of results) {
    const ok = r.failures.length === 0;
    if (!ok) failed++;
    console.log(`  ${ok ? "PASS" : "FAIL"}  ${id}  ${r.name}  [${r.checks} comprobaciones]`);
    r.failures.slice(0, 12).forEach((f) => console.log(`        ✗ ${f}`));
    if (r.failures.length > 12) console.log(`        … y ${r.failures.length - 12} fallos más`);
  }
  console.log(`\n${results.size - failed} de ${results.size} pruebas superadas.`);
  return failed === 0 ? 0 : 1;
};

main()
  .then((code) => {
    cleanup();
    process.exit(code);
  })
  .catch((error) => {
    console.error(error);
    cleanup();
    process.exit(2);
  });
