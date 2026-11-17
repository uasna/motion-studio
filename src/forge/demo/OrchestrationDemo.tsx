import { useMemo, type FC } from "react";
import { useCurrentFrame } from "remotion";
import {
  Animate,
  At,
  Camera,
  Circle,
  Group,
  Layer,
  Line,
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
  type CameraTarget,
  type StageBounds,
} from "..";
import { COLOR } from "./palette";

/* ---------- Mundo (unidades: px a zoom 1) ---------- */

const CELL_COUNT = 6;
const CELL_SIZE = 120;
const CELL_PITCH = 190;
const SOURCE_X = -900;
const TARGET_X = 900;

const cellX = (i: number): number => (i - (CELL_COUNT - 1) / 2) * CELL_PITCH;

const WORLD: CameraTarget = { x: 0, y: 0, width: 2400, height: 520 };
const LINE_VIEW: CameraTarget = { x: 0, y: 0, width: 1150, height: 300 };
const TARGET_VIEW: CameraTarget = { x: TARGET_X, y: 0, width: 420, height: 420 };

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
    gap(24),
    step("cam-overview", 36),
    gap(10),
  ),
);

/** Duración de la composición: la dicta el plan, no un número escrito a mano. */
export const ORCHESTRATION_DEMO_FRAMES = TIMELINE.duration;

/** Guion de cámara anclado a los spans del plan. Cada plano se calcula con frameRect por proporción. */
const buildCamera = (stage: StageBounds) => {
  const overview = frameRect(WORLD, stage, 0.04);
  return cameraMoves(TIMELINE, overview, [
    { span: "cam-to-line", to: frameRect(LINE_VIEW, stage, 0.1), easing: "ease-in-out" },
    { span: "cam-follow", to: { x: TARGET_X }, easing: "ease-in-out" }, // solo panorámica: x
    { span: "cam-zoom-target", to: frameRect(TARGET_VIEW, stage, 0.25), easing: "ease-in-out" },
    { span: "cam-overview", to: overview, easing: "ease-in-out" },
  ]);
};

/* ---------- Objetos ---------- */

const WorldGuides: FC = () => (
  <>
    <Layer name="rail" stroke={COLOR.white} strokeWidth={4} opacity={0.12} strokeDasharray="14 18">
      <Line from={[SOURCE_X, 0]} to={[TARGET_X, 0]} />
    </Layer>
    <Layer name="world-bounds" opacity={0.3}>
      <Rect
        width={WORLD.width}
        height={WORLD.height}
        radius={40}
        fill="none"
        stroke={COLOR.blue}
        strokeWidth={5}
        strokeDasharray="30 24"
      />
    </Layer>
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
 * retraso mantienen el primer keyframe (opacidad 0), así que no se ven.
 */
const Pulse: FC = () => {
  const pulse = TIMELINE.span("pulse");
  const travel = TARGET_X - SOURCE_X;
  return (
    <At span={pulse} persist={false}>
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

/**
 * Visualiza el plan: una barra por span (ámbar = cámara, azul = objetos) y un cabezal.
 * Va FUERA de la cámara y fuera de cualquier <At>, así que lee el frame global del plan.
 */
const TimelineHud: FC = () => {
  const frame = useCurrentFrame();
  const { left, bottom, width, height } = useStage();
  const unit = Math.min(width, height);
  const barsWidth = width * 0.8;
  const rowHeight = unit * 0.0065;
  const pitch = unit * 0.0095;
  const x0 = left + (width - barsWidth) / 2;
  const rows = TIMELINE.spans.length;
  const top = bottom - unit * 0.04 - rows * pitch;
  const playhead = x0 + (Math.min(frame, TIMELINE.duration) / TIMELINE.duration) * barsWidth;

  return (
    <Layer name="hud-timeline">
      {TIMELINE.spans.map((span, i) => {
        const active = frame >= span.start && frame < span.end;
        return (
          <Rect
            key={span.id}
            anchor="top-left"
            x={x0 + (span.start / TIMELINE.duration) * barsWidth}
            y={top + i * pitch}
            width={Math.max((span.duration / TIMELINE.duration) * barsWidth, 2)}
            height={rowHeight}
            radius={rowHeight / 2}
            fill={span.id.indexOf("cam-") === 0 ? COLOR.amber : COLOR.blue}
            opacity={active ? 1 : 0.35}
          />
        );
      })}
      <Line
        from={[playhead, top - pitch]}
        to={[playhead, top + rows * pitch]}
        stroke={COLOR.white}
        strokeWidth={unit * 0.003}
        strokeLinecap="round"
      />
    </Layer>
  );
};

const DemoContent: FC = () => {
  const stage = useStage();
  const camera = useMemo(() => buildCamera(stage), [stage]);
  return (
    <>
      <Camera animation={camera}>
        <WorldGuides />
        <Source />
        <Cells />
        <Pulse />
        <Target />
      </Camera>
      <TimelineHud />
    </>
  );
};

/**
 * Demo de la Fase 2C. Un único `plan` ordena la aparición de los objetos (<At>, <Stagger>),
 * el retraso de sus animaciones (`delay`) y los movimientos de cámara (`cameraMoves`), todo
 * sobre la misma referencia temporal. La <Camera> cuelga directamente del Stage, igual que
 * los <At>, así que comparten el frame 0 de la composición.
 */
export const OrchestrationDemo: FC = () => (
  <Stage background={COLOR.bg}>
    <DemoContent />
  </Stage>
);
