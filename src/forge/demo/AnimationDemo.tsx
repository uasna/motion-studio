import type { FC } from "react";
import {
  Animate,
  Circle,
  Clip,
  Group,
  Line,
  Mask,
  Rect,
  Stage,
  tween,
  useAnimation,
  useStage,
  type AnimationSpec,
  type EasingSpec,
  type Track,
} from "..";
import { COLOR } from "./palette";

type Box = { readonly x: number; readonly y: number; readonly w: number; readonly h: number };
type Layout = { readonly easing: Box; readonly props: Box; readonly reveal: Box };

/** Recompone los tres paneles según la proporción real del encuadre. */
const computeLayout = (width: number, height: number): Layout => {
  if (width / height >= 1.2) {
    const rw = width * 0.45;
    const rh = height * 0.37;
    return {
      easing: { x: -width * 0.245, y: 0, w: rw, h: height * 0.8 },
      props: { x: width * 0.245, y: -height * 0.215, w: rw, h: rh },
      reveal: { x: width * 0.245, y: height * 0.215, w: rw, h: rh },
    };
  }
  const w = width * 0.88;
  const h = height * 0.28;
  return {
    easing: { x: 0, y: -height * 0.31, w, h },
    props: { x: 0, y: 0, w, h },
    reveal: { x: 0, y: height * 0.31, w, h },
  };
};

/** Entrada de cada panel, hecha con el propio sistema de animación. */
const enter = (delay: number): AnimationSpec => ({
  opacity: tween(delay, delay + 24, 0, 1, "ease-out"),
  scale: tween(delay, delay + 24, 0.92, 1, "ease-out"),
});

const PanelFrame: FC<{ w: number; h: number }> = ({ w, h }) => (
  <Rect
    width={w}
    height={h}
    radius={Math.min(w, h) * 0.04}
    fill={COLOR.panel}
    stroke={COLOR.blue}
    strokeWidth={Math.min(w, h) * 0.005}
  />
);

/* ---------- Panel 1: curvas de easing ---------- */

const RAILS: readonly { readonly easing: EasingSpec; readonly color: string }[] = [
  { easing: "linear", color: COLOR.white },
  { easing: "ease-in", color: COLOR.blueSoft },
  { easing: "ease-out", color: COLOR.glow },
  { easing: "ease-in-out", color: COLOR.blue },
  { easing: { bezier: [0.34, 1.56, 0.64, 1] }, color: COLOR.amber },
];

const railTrack = (easing: EasingSpec, a: number): Track => [
  { frame: 15, value: -a, easing },
  { frame: 75, value: a },
  { frame: 105, value: a, easing },
  { frame: 165, value: -a },
];

const EasingPanel: FC<{ w: number; h: number }> = ({ w, h }) => {
  const rowH = (h * 0.8) / RAILS.length;
  const half = w * 0.4;
  const radius = Math.min(rowH * 0.28, w * 0.03);

  return (
    <>
      <PanelFrame w={w} h={h} />
      {RAILS.map(({ easing, color }, i) => {
        const y = -h * 0.4 + rowH * (i + 0.5);
        return (
          <Group key={i} name={`rail-${i}`} y={y}>
            <Line
              from={[-half, 0]}
              to={[half, 0]}
              stroke={color}
              strokeWidth={radius * 0.25}
              strokeLinecap="round"
              opacity={0.35}
            />
            <Animate animation={{ x: railTrack(easing, half * 0.88) }}>
              <Circle radius={radius} fill={color} />
            </Animate>
          </Group>
        );
      })}
    </>
  );
};

/* ---------- Panel 2: una propiedad animable por celda ---------- */

const PositionCell: FC<{ c: number }> = ({ c }) => {
  const d = c * 0.35;
  return (
    <>
      <Rect
        width={d * 2}
        height={d * 2}
        fill="none"
        stroke={COLOR.blue}
        strokeWidth={c * 0.012}
        strokeDasharray={`${c * 0.04} ${c * 0.04}`}
        opacity={0.5}
      />
      <Animate
        animation={{
          x: [
            { frame: 20, value: -d, easing: "ease-in-out" },
            { frame: 70, value: d },
            { frame: 100, value: d, easing: "ease-in-out" },
            { frame: 150, value: -d },
          ],
          y: [
            { frame: 20, value: d, easing: "ease-out" },
            { frame: 45, value: -d, easing: "ease-in" },
            { frame: 70, value: d },
            { frame: 100, value: d, easing: "ease-out" },
            { frame: 125, value: -d, easing: "ease-in" },
            { frame: 150, value: d },
          ],
        }}
      >
        <Circle radius={c * 0.09} fill={COLOR.glow} />
      </Animate>
    </>
  );
};

const RotationCell: FC<{ c: number }> = ({ c }) => {
  const s = c * 0.4;
  const corner: readonly [number, number] = [-s / 2, -s / 2];
  return (
    <>
      <Animate
        pivot={corner}
        animation={{
          rotation: [
            { frame: 20, value: 0, easing: "ease-in-out" },
            { frame: 80, value: 180 },
            { frame: 100, value: 180, easing: "ease-in-out" },
            { frame: 160, value: 0 },
          ],
        }}
      >
        <Rect width={s} height={s} radius={s * 0.1} fill={COLOR.blue} />
      </Animate>
      <Circle x={corner[0]} y={corner[1]} radius={c * 0.035} fill={COLOR.white} />
    </>
  );
};

const ScaleCell: FC<{ c: number }> = ({ c }) => (
  <Animate
    animation={{
      scale: [
        { frame: 20, value: [1, 1], easing: "ease-in-out" },
        { frame: 60, value: [1.6, 0.5], easing: "ease-in-out" },
        { frame: 100, value: [0.6, 1.5], easing: "ease-in-out" },
        { frame: 140, value: [1, 1] },
      ],
    }}
  >
    <Rect width={c * 0.4} height={c * 0.4} radius={c * 0.06} fill={COLOR.blueSoft} />
  </Animate>
);

const StrokeCell: FC<{ c: number }> = ({ c }) => {
  const r = c * 0.3;
  const circumference = 2 * Math.PI * r;
  return (
    <>
      <Animate
        rotation={-90}
        fill="none"
        stroke={COLOR.glow}
        strokeWidth={c * 0.04}
        strokeLinecap="round"
        strokeDasharray={circumference}
        animation={{
          strokeDashoffset: [
            { frame: 20, value: circumference, easing: "ease-out" },
            { frame: 80, value: 0 },
            { frame: 110, value: 0, easing: "ease-in" },
            { frame: 160, value: circumference },
          ],
        }}
      >
        <Circle radius={r} />
      </Animate>
      <Animate
        animation={{
          opacity: [
            { frame: 20, value: 0, easing: "ease-out" },
            { frame: 60, value: 1 },
            { frame: 110, value: 1, easing: "ease-in" },
            { frame: 150, value: 0.15 },
          ],
          skewX: [
            { frame: 20, value: -25, easing: "ease-in-out" },
            { frame: 70, value: 25, easing: "ease-in-out" },
            { frame: 120, value: -25 },
          ],
        }}
      >
        <Rect width={c * 0.22} height={c * 0.22} radius={c * 0.03} fill={COLOR.amber} />
      </Animate>
    </>
  );
};

const PropertiesPanel: FC<{ w: number; h: number }> = ({ w, h }) => {
  const c = Math.min(w / 4, h) * 0.75;
  const cells = [PositionCell, RotationCell, ScaleCell, StrokeCell];
  return (
    <>
      <PanelFrame w={w} h={h} />
      {cells.map((Cell, i) => (
        <Group key={i} name={`cell-${i}`} x={(i - 1.5) * (w / 4)}>
          <Cell c={c} />
        </Group>
      ))}
    </>
  );
};

/* ---------- Panel 3: animación dentro de Clip + Mask ---------- */

const RevealPanel: FC<{ w: number; h: number }> = ({ w, h }) => {
  const period = h * 0.12;
  const irisRadius = Math.sqrt(w * w + h * h) / 2;
  const iris = useAnimation({
    scale: [
      { frame: 20, value: 0, easing: "ease-in-out" },
      { frame: 75, value: 1 },
      { frame: 110, value: 1, easing: "ease-in" },
      { frame: 160, value: 0 },
    ],
  });
  const lines = Math.ceil(w / period) + 8;

  return (
    <>
      <PanelFrame w={w} h={h} />
      <Clip shape={<Rect width={w} height={h} radius={Math.min(w, h) * 0.04} />}>
        <Mask mask={<Circle radius={irisRadius} {...iris} />}>
          <Rect width={w} height={h} fill={COLOR.blue} />
          <Group rotation={25} stroke={COLOR.white} strokeWidth={h * 0.02}>
            <Animate animation={{ x: tween(0, 180, 0, period * 4) }}>
              {Array.from({ length: lines * 2 }, (_, i) => {
                const px = (i - lines) * period;
                return <Line key={i} from={[px, -irisRadius]} to={[px, irisRadius]} />;
              })}
            </Animate>
          </Group>
        </Mask>
      </Clip>
    </>
  );
};

const DemoContent: FC = () => {
  const { width, height } = useStage();
  const layout = computeLayout(width, height);

  return (
    <>
      <Animate name="easing-panel" x={layout.easing.x} y={layout.easing.y} animation={enter(0)}>
        <EasingPanel w={layout.easing.w} h={layout.easing.h} />
      </Animate>
      <Animate name="properties-panel" x={layout.props.x} y={layout.props.y} animation={enter(8)}>
        <PropertiesPanel w={layout.props.w} h={layout.props.h} />
      </Animate>
      <Animate name="reveal-panel" x={layout.reveal.x} y={layout.reveal.y} animation={enter(16)}>
        <RevealPanel w={layout.reveal.w} h={layout.reveal.h} />
      </Animate>
    </>
  );
};

/**
 * Demo de la Fase 2A. Panel de easing (de arriba abajo): linear, ease-in, ease-out,
 * ease-in-out y Bézier con rebote. Panel de propiedades: posición, rotación con pivot,
 * escala no uniforme, y trazo + opacidad + inclinación. Panel inferior: Clip + Mask animados.
 */
export const AnimationDemo: FC = () => (
  <Stage background={COLOR.bg}>
    <DemoContent />
  </Stage>
);
