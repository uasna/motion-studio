import { useMemo, type FC, type ReactNode } from "react";
import { useCurrentFrame } from "remotion";
import {
  Animate,
  At,
  Camera,
  Circle,
  Group,
  Layer,
  Line,
  Mask,
  Rect,
  Stage,
  Stagger,
  cameraMoves,
  frameRect,
  gap,
  parallel,
  plan,
  sequence,
  stagger,
  step,
  steps,
  tween,
  useStage,
  useUniqueId,
  type CameraState,
  type CameraTarget,
  type StageBounds,
} from "..";
import { COLOR } from "./palette";

/* ---------- Mundo (unidades: px a zoom 1). El pipeline se diseña en horizontal ---------- */

const CELL_COUNT = 6;
const CELL_SIZE = 120;
const CELL_PITCH = 190;
const SOURCE_X = -900;
const TARGET_X = 900;

const cellX = (i: number): number => (i - (CELL_COUNT - 1) / 2) * CELL_PITCH;

/* Planos, en coordenadas del pipeline (eje del recorrido = x). Cada uno se encuadra con frameRect. */
const SOURCE_VIEW: CameraTarget = { x: -760, y: 0, width: 1000, height: 320 }; // la fuente y las primeras celdas
const LINE_VIEW: CameraTarget = { x: -205, y: 0, width: 1650, height: 320 }; // fuente + todas las celdas
const FOLLOW_VIEW: CameraTarget = { ...LINE_VIEW, x: TARGET_X }; // mismo tamaño → el zoom no cambia al panear
const TARGET_VIEW: CameraTarget = { x: TARGET_X, y: 0, width: 340, height: 340 };
const OVERVIEW: CameraTarget = { x: 20, y: 0, width: 2060, height: 320 }; // fuente → destino

/* ---------- Línea de tiempo ÚNICA: objetos y cámara salen de este plan ---------- */

/**
 * Los ids que empiezan por "cam-" son movimientos de cámara; el resto, apariciones de objetos.
 * Muestra gap negativo (solapamiento), stagger, steps y parallel.
 */
export const TIMELINE = plan(
  sequence(
    step("source-in", 24),
    gap(-6), // las celdas empiezan 6 frames ANTES de que termine la fuente
    parallel(stagger(4, steps("cell", CELL_COUNT, 18)), step("cam-to-line", 38)),
    gap(6),
    parallel(step("pulse", 72), step("cam-follow", 72)),
    parallel(step("target-charge", 36), step("cam-zoom-target", 36)),
    gap(12),
    step("cam-overview", 36),
    gap(22), // el plano final se sostiene ~0,7 s para que se lea
  ),
);

/** Duración de la composición: la dicta el plan, no un número escrito a mano. */
export const ORCHESTRATION_DEMO_FRAMES = TIMELINE.duration;

/* ---------- Maquetación adaptable (16:9, 9:16, 1:1) ---------- */

const FONT_HEADING = 'Space Grotesk, "Segoe UI", system-ui, sans-serif';
const FONT_TECHNICAL = 'JetBrains Mono, Consolas, "DejaVu Sans Mono", monospace';

const HUD_ROW_PITCH = 15;
const HUD_ROW_HEIGHT = 6;
const HUD_LANE_GAP = 12;
const HUD_LABEL_WIDTH = 128;

const CELL_IDS = Array.from({ length: CELL_COUNT }, (_, i) => `cell-${i}`);

/** Una fila por grupo de spans que no se solapan entre sí; las celdas, una por fila (escalera de stagger). */
const HUD_LANES = [
  { label: "Objetos", color: COLOR.blue, labelColor: COLOR.blueSoft, rows: [["source-in", "pulse", "target-charge"]] },
  { label: "Celdas", color: COLOR.blue, labelColor: COLOR.blueSoft, rows: CELL_IDS.map((id) => [id]) },
  {
    label: "Cámara",
    color: COLOR.amber,
    labelColor: COLOR.amber,
    rows: [["cam-to-line", "cam-follow", "cam-zoom-target", "cam-overview"]],
  },
] as const;

const HUD_ROW_COUNT = HUD_LANES.reduce((n, lane) => n + lane.rows.length, 0);
const HUD_HEIGHT = HUD_ROW_COUNT * HUD_ROW_PITCH + (HUD_LANES.length - 1) * HUD_LANE_GAP;

type Layout = {
  /** 9:16: el pipeline corre de arriba abajo en lugar de izquierda a derecha. */
  readonly vertical: boolean;
  /** Margen de seguridad (mismos valores que `safeMargin` de src/studio/formats.ts). */
  readonly margin: number;
  /** Franjas reservadas al texto (arriba) y al HUD (abajo); la cámara encuadra el resto. */
  readonly top: number;
  readonly bottom: number;
  readonly bodySize: number;
};

const makeLayout = (stage: StageBounds): Layout => {
  const landscape = stage.width > stage.height;
  const margin = landscape ? 96 : 72;
  return {
    vertical: stage.height > stage.width,
    margin,
    top: margin + 158,
    bottom: margin + HUD_HEIGHT + 28,
    bodySize: landscape ? 44 : 42,
  };
};

/** Un grupo rotado 90° (horario) manda (x, y) del pipeline a (-y, x) del mundo. */
const toWorld = (r: CameraTarget, vertical: boolean): CameraTarget =>
  vertical ? { x: -r.y, y: r.x, width: r.height, height: r.width } : r;

/**
 * Plano de cámara que encuadra `view` DENTRO de la banda libre de texto/HUD (frameRect + traslación).
 * `maxScale` evita un primer plano excesivo en encuadres estrechos.
 */
const shot = (view: CameraTarget, stage: StageBounds, layout: Layout, padding: number, maxScale = Infinity): CameraState => {
  const band = { width: stage.width, height: stage.height - layout.top - layout.bottom };
  const framed = frameRect(toWorld(view, layout.vertical), band, padding);
  const scale = Math.min(framed.scale, maxScale);
  // El centro de la banda libre queda (top - bottom) / 2 px por debajo del centro del encuadre.
  return { x: framed.x, y: framed.y - (layout.top - layout.bottom) / 2 / scale, scale };
};

/**
 * Margen de los planos amplios (fracción por lado). Con 0,08 la fuente y el destino quedan a más de
 * 96 px del borde en 16:9 y a más de 72 px en 1:1 y 9:16, los márgenes de seguridad de cada proporción.
 */
const WIDE_PADDING = 0.08;

/** Guion de cámara anclado a los spans del plan. */
const buildCamera = (stage: StageBounds, layout: Layout) => {
  const source = shot(SOURCE_VIEW, stage, layout, 0.06);
  const line = shot(LINE_VIEW, stage, layout, WIDE_PADDING);
  const follow = shot(FOLLOW_VIEW, stage, layout, WIDE_PADDING); // mismo padding que `line`: el zoom no cambia
  const target = shot(TARGET_VIEW, stage, layout, 0.08, 1.75);
  const overview = shot(OVERVIEW, stage, layout, WIDE_PADDING);
  return cameraMoves(TIMELINE, source, [
    { span: "cam-to-line", to: line, easing: "ease-in-out" },
    // Solo panorámica por el eje del recorrido; el zoom y el otro eje no cambian.
    { span: "cam-follow", to: layout.vertical ? { y: follow.y } : { x: follow.x }, easing: "ease-in-out" },
    { span: "cam-zoom-target", to: target, easing: "ease-in-out" },
    { span: "cam-overview", to: overview, easing: "ease-in-out" },
  ]);
};

/* ---------- Texto (espacio de pantalla: fuera de <Camera>, no escala con el zoom) ---------- */

type LabelProps = {
  readonly x: number;
  readonly y: number;
  readonly size: number;
  readonly fill: string;
  readonly font: string;
  readonly weight?: number;
  readonly spacing?: number;
  readonly opacity?: number;
  readonly children: string;
};

/** El motor aún no tiene primitiva de texto: etiqueta mínima sobre <text> nativo, solo para esta demo. */
const Label: FC<LabelProps> = ({ x, y, size, fill, font, weight = 400, spacing = 0, opacity, children }) => (
  <text
    x={x}
    y={y}
    fontSize={size}
    fontFamily={font}
    fontWeight={weight}
    letterSpacing={spacing}
    fill={fill}
    stroke="none"
    opacity={opacity}
  >
    {children}
  </text>
);

type CaptionProps = {
  readonly from: number;
  readonly to: number;
  readonly tag: string;
  readonly text: string;
  /** `false` en el último rótulo: se queda hasta el final de la pieza. */
  readonly fadeOut?: boolean;
};

const FADE = 6;

/** Rótulo de una capacidad: aparece con <At> en su ventana del plan y existe solo durante ella. */
const Caption: FC<CaptionProps> = ({ from, to, tag, text, fadeOut = true }) => {
  const stage = useStage();
  const layout = makeLayout(stage);
  const duration = to - from;
  const x = stage.left + layout.margin;
  const tagY = stage.top + layout.margin + 76;
  const opacity = fadeOut
    ? [
        { frame: 0, value: 0, easing: "ease-out" as const },
        { frame: FADE, value: 1 },
        { frame: duration - FADE, value: 1, easing: "ease-in" as const },
        { frame: duration, value: 0 },
      ]
    : [
        { frame: 0, value: 0, easing: "ease-out" as const },
        { frame: FADE, value: 1 },
      ];
  return (
    <At from={from} duration={duration} persist={false} name={`caption ${tag}`}>
      <Animate animation={{ opacity, y: tween(0, 10, 10, 0, "ease-out") }}>
        <Label x={x} y={tagY} size={24} fill={COLOR.amber} font={FONT_TECHNICAL} weight={600} spacing={3}>
          {tag}
        </Label>
        <Label x={x} y={tagY + 54} size={layout.bodySize} fill={COLOR.white} font={FONT_HEADING} weight={600}>
          {text}
        </Label>
      </Animate>
    </At>
  );
};

/** Cada rótulo nombra la capacidad que se ve en ese tramo; las ventanas salen del plan, no de números sueltos. */
const Captions: FC = () => {
  const stage = useStage();
  const layout = makeLayout(stage);
  const s = TIMELINE.span;
  return (
    <Layer name="captions">
      <Label
        x={stage.left + layout.margin}
        y={stage.top + layout.margin + 20}
        size={22}
        fill={COLOR.white}
        font={FONT_TECHNICAL}
        spacing={3}
        opacity={0.5}
      >
        FASE 2C · ORQUESTACIÓN TEMPORAL
      </Label>
      <Caption from={s("source-in").start + 6} to={s("cam-to-line").end + 4} tag="AT · STAGGER" text="Cada objeto entra en su momento" />
      <Caption from={s("pulse").start + 4} to={s("pulse").end - 2} tag="DELAY" text="Cada celda reacciona al pulso" />
      <Caption from={s("target-charge").start + 2} to={s("cam-overview").start - 2} tag="PARALLEL" text="Carga y zoom, a la vez" />
      <Caption
        from={s("cam-overview").start + 2}
        to={TIMELINE.duration}
        tag="CAMERAMOVES"
        text="Todo vuelve al plano general"
        fadeOut={false}
      />
    </Layer>
  );
};

/* ---------- Objetos (mundo) ---------- */

const GRID_STEP = 200;
const GRID_ROWS = Array.from({ length: 13 }, (_, i) => (i - 6) * GRID_STEP);

/** Referencias fijas del mundo: sin ellas, el paneo y el zoom no se perciben sobre fondo liso. */
const WorldGuides: FC = () => (
  <>
    <Layer
      name="dot-grid"
      stroke={COLOR.white}
      strokeWidth={5}
      strokeLinecap="round"
      strokeDasharray={`0.1 ${GRID_STEP - 0.1}`}
      opacity={0.14}
    >
      {GRID_ROWS.map((y) => (
        <Line key={y} from={[-2000, y]} to={[2000, y]} />
      ))}
    </Layer>
    <At span={TIMELINE.span("source-in")}>
      <Animate animation={{ opacity: tween(0, 24, 0, 1) }}>
        <Layer name="rail" stroke={COLOR.white} strokeWidth={4} opacity={0.22} strokeDasharray="14 18">
          <Line from={[SOURCE_X, 0]} to={[TARGET_X, 0]} />
        </Layer>
      </Animate>
    </At>
  </>
);

/** Chispa que orbita la fuente. Entra con <Stagger>: su tiempo local empieza al montarse. */
const Spark: FC<{ angle: number }> = ({ angle }) => (
  <Group rotation={angle}>
    <Animate x={75} animation={{ scale: tween(0, 12, 0, 1, "ease-out") }}>
      <Circle radius={11} fill={COLOR.amber} />
    </Animate>
  </Group>
);

/** <At span>: la fuente existe desde `source-in.start`; después PERSISTE (comportamiento por defecto). */
const Source: FC = () => (
  <At span={TIMELINE.span("source-in")}>
    <Animate
      x={SOURCE_X}
      animation={{ scale: tween(0, 24, 0, 1, "ease-out"), opacity: tween(0, 12, 0, 1) }}
    >
      <Circle radius={110} fill={COLOR.panel} stroke={COLOR.blue} strokeWidth={6} />
      <Animate animation={{ rotation: tween(0, 240, 0, 360) }}>
        <Circle radius={75} fill="none" stroke={COLOR.blueSoft} strokeWidth={4} strokeDasharray="20 16" />
        <Stagger each={3}>
          {[0, 90, 180, 270].map((angle) => (
            <Spark key={angle} angle={angle} />
          ))}
        </Stagger>
      </Animate>
      <Circle radius={28} fill={COLOR.glow} opacity={0.35} blendMode="plus-lighter" />
      <Circle radius={14} fill={COLOR.white} />
    </Animate>
  </At>
);

/** Escalonado dirigido por el plan: cada celda usa el span `cell-i` que calculó stagger(). */
const Cells: FC = () => (
  <>
    {Array.from({ length: CELL_COUNT }, (_, i) => (
      <At key={i} span={TIMELINE.span(`cell-${i}`)}>
        <Animate
          x={cellX(i)}
          animation={{ scale: tween(0, 18, 0.4, 1, "ease-out"), opacity: tween(0, 18, 0, 1, "ease-out") }}
        >
          <Rect width={CELL_SIZE} height={CELL_SIZE} radius={24} fill={COLOR.panel} stroke={COLOR.blue} strokeWidth={5} />
          <Circle radius={12} fill={COLOR.blueSoft} />
        </Animate>
      </At>
    ))}
  </>
);

/**
 * <At persist={false}>: el pulso solo existe durante su span. Los destellos de las celdas usan
 * `delay` para coincidir con el instante en que el punto pasa por cada una; antes de su
 * retraso mantienen el primer keyframe (opacidad 0), así que no se ven. Al arrancar, un anillo
 * sale de la fuente: causa (la fuente emite) y efecto (el pulso viaja) se leen juntos.
 */
const Pulse: FC = () => {
  const pulse = TIMELINE.span("pulse");
  const travel = TARGET_X - SOURCE_X;
  return (
    <At span={pulse} persist={false}>
      <Animate
        x={SOURCE_X}
        animation={{
          scale: tween(0, 16, 1, 1.7, "ease-out"),
          opacity: [
            { frame: 0, value: 0.9, easing: "ease-out" },
            { frame: 16, value: 0 },
          ],
        }}
      >
        <Circle radius={110} fill="none" stroke={COLOR.glow} strokeWidth={6} />
      </Animate>
      <Animate animation={{ x: tween(0, pulse.duration, SOURCE_X, TARGET_X, "linear") }}>
        <Circle radius={34} fill={COLOR.glow} opacity={0.3} blendMode="plus-lighter" />
        <Circle radius={16} fill={COLOR.white} />
      </Animate>
      {Array.from({ length: CELL_COUNT }, (_, i) => {
        const arrival = Math.round(((cellX(i) - SOURCE_X) / travel) * pulse.duration);
        return (
          <Animate
            key={i}
            x={cellX(i)}
            delay={arrival}
            animation={{
              scale: tween(0, 14, 1, 1.9, "ease-out"),
              opacity: [
                { frame: 0, value: 0 },
                { frame: 2, value: 0.9, easing: "ease-out" },
                { frame: 14, value: 0 },
              ],
            }}
          >
            <Rect width={CELL_SIZE} height={CELL_SIZE} radius={24} fill="none" stroke={COLOR.glow} strokeWidth={6} />
          </Animate>
        );
      })}
    </At>
  );
};

/** Destino: aparece con `from` calculado desde un span y se carga durante `target-charge`. */
const Target: FC = () => (
  <>
    <At from={TIMELINE.span("pulse").end - 24}>
      <Animate
        x={TARGET_X}
        animation={{ scale: tween(0, 24, 0.3, 1, "ease-out"), opacity: tween(0, 24, 0, 1) }}
      >
        <Rect width={300} height={300} radius={44} fill={COLOR.panel} stroke={COLOR.blue} strokeWidth={6} />
        <Circle radius={90} fill="none" stroke={COLOR.blueSoft} strokeWidth={4} opacity={0.5} />
      </Animate>
    </At>
    <At span={TIMELINE.span("target-charge")}>
      <Group x={TARGET_X}>
        {[0, 1, 2].map((i) => (
          <Animate
            key={i}
            delay={i * 8}
            animation={{
              scale: tween(0, 24, 0.4, 1.9, "ease-out"),
              opacity: [
                { frame: 0, value: 0 },
                { frame: 2, value: 0.8, easing: "ease-out" },
                { frame: 24, value: 0 },
              ],
            }}
          >
            <Circle radius={90} fill="none" stroke={COLOR.glow} strokeWidth={5} />
          </Animate>
        ))}
        <Animate animation={{ scale: tween(0, 30, 0, 1, "ease-out") }}>
          <Circle radius={64} fill={COLOR.blue} />
          <Circle radius={64} fill={COLOR.glow} opacity={0.25} blendMode="plus-lighter" />
        </Animate>
      </Group>
    </At>
  </>
);

/* ---------- HUD de la línea de tiempo (espacio de pantalla) ---------- */

/**
 * Visualiza el plan agrupado por carriles (azul = objetos, ámbar = cámara) y un cabezal.
 * Va FUERA de la cámara y fuera de cualquier <At>, así que lee el frame global del plan.
 * Tramos ya cumplidos = tenue, activo = pleno, pendientes = muy tenue.
 */
const TimelineHud: FC = () => {
  const frame = useCurrentFrame();
  const stage = useStage();
  const { margin } = makeLayout(stage);
  const barsX = stage.left + margin + HUD_LABEL_WIDTH;
  const barsWidth = stage.width - 2 * margin - HUD_LABEL_WIDTH;
  const top = stage.bottom - margin - HUD_HEIGHT;
  const playhead = barsX + (Math.min(frame, TIMELINE.duration) / TIMELINE.duration) * barsWidth;

  let rowIndex = 0;
  return (
    <Layer name="hud-timeline">
      {HUD_LANES.map((lane, laneIndex) => {
        const laneTop = top + rowIndex * HUD_ROW_PITCH + laneIndex * HUD_LANE_GAP;
        const rows = lane.rows.map((ids, r) => {
          const y = laneTop + r * HUD_ROW_PITCH;
          return ids.map((id) => {
            const span = TIMELINE.span(id);
            const opacity = frame >= span.end ? 0.55 : frame >= span.start ? 1 : 0.22;
            return (
              <Rect
                key={id}
                anchor="top-left"
                x={barsX + (span.start / TIMELINE.duration) * barsWidth}
                y={y}
                width={Math.max((span.duration / TIMELINE.duration) * barsWidth - 2, 3)} // -2: separa tramos contiguos
                height={HUD_ROW_HEIGHT}
                radius={HUD_ROW_HEIGHT / 2}
                fill={lane.color}
                opacity={opacity}
              />
            );
          });
        });
        rowIndex += lane.rows.length;
        return (
          <Group key={lane.label}>
            <Label
              x={stage.left + margin}
              y={laneTop + HUD_ROW_HEIGHT + 3}
              size={18}
              fill={lane.labelColor}
              font={FONT_TECHNICAL}
              weight={600}
              spacing={1}
              opacity={0.9}
            >
              {lane.label.toUpperCase()}
            </Label>
            {rows}
          </Group>
        );
      })}
      <Line
        from={[playhead, top - 6]}
        to={[playhead, top + HUD_HEIGHT + 6]}
        stroke={COLOR.white}
        strokeWidth={3}
        strokeLinecap="round"
      />
    </Layer>
  );
};

/* ---------- Desvanecido del mundo en los bordes de la banda libre ---------- */

const BAND_FADE_PX = 48;

/**
 * Mantiene el mundo fuera de la zona de rótulos y del HUD sin un corte duro: un degradado en
 * espacio de pantalla (<Mask>, fuera de la cámara) lo hace transparente al llegar al borde de la
 * banda que la cámara encuadra. Los planos en reposo quedan dentro del tramo opaco.
 */
const BandFade: FC<{ readonly layout: Layout; readonly children: ReactNode }> = ({ layout, children }) => {
  const stage = useStage();
  const id = useUniqueId("band-fade");
  const y0 = stage.top + layout.top;
  const y1 = stage.bottom - layout.bottom;
  const edge = Math.min(BAND_FADE_PX / (y1 - y0), 0.5);
  return (
    <Mask
      mask={
        <>
          <defs>
            {/* Coordenadas LOCALES del <Rect> (se posiciona con translate): de 0 a su altura. */}
            <linearGradient id={id} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2={y1 - y0}>
              <stop offset={0} stopColor="black" />
              <stop offset={edge} stopColor="white" />
              <stop offset={1 - edge} stopColor="white" />
              <stop offset={1} stopColor="black" />
            </linearGradient>
          </defs>
          <Rect anchor="top-left" x={stage.left} y={y0} width={stage.width} height={y1 - y0} fill={`url(#${id})`} />
        </>
      }
    >
      {children}
    </Mask>
  );
};

const DemoContent: FC = () => {
  const stage = useStage();
  const layout = useMemo(() => makeLayout(stage), [stage]);
  const camera = useMemo(() => buildCamera(stage, layout), [stage, layout]);
  return (
    <>
      <BandFade layout={layout}>
        <Camera animation={camera}>
          {/* En 9:16 el pipeline se gira 90°: los objetos se escriben una sola vez, en horizontal. */}
          <Group name="pipeline" rotation={layout.vertical ? 90 : 0}>
            <WorldGuides />
            <Source />
            <Cells />
            <Pulse />
            <Target />
          </Group>
        </Camera>
      </BandFade>
      <Captions />
      <TimelineHud />
    </>
  );
};

/**
 * Demo de la Fase 2C. Un único `plan` ordena la aparición de los objetos (<At>, <Stagger>),
 * el retraso de sus animaciones (`delay`) y los movimientos de cámara (`cameraMoves`), todo
 * sobre la misma referencia temporal. La <Camera> cuelga directamente del Stage, igual que
 * los <At>, así que comparten el frame 0 de la composición. Los rótulos y el HUD viven fuera
 * de la cámara, en espacio de pantalla, y respetan el margen de seguridad de cada proporción.
 */
export const OrchestrationDemo: FC = () => (
  <Stage background={COLOR.bg}>
    <DemoContent />
  </Stage>
);
