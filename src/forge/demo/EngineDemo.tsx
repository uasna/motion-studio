import type { FC } from "react";
import { Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Circle, Clip, Group, Layer, Line, Mask, Path, Rect, Stage, useStage } from "..";

const COLOR = {
  bg: "#0e0f13",
  panel: "#171a21",
  blue: "#2f6bff",
  blueSoft: "#7fa3ff",
  white: "#f5f7ff",
  glow: "#8cf0ff",
} as const;

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

type Box = { readonly x: number; readonly y: number; readonly w: number; readonly h: number };
type Layout = {
  readonly system: { readonly x: number; readonly y: number; readonly size: number };
  readonly mask: Box;
  readonly clip: Box;
};

/** Recompone la escena según la proporción real del encuadre (no recorta). */
const computeLayout = (width: number, height: number): Layout => {
  if (width / height >= 1.2) {
    const w = width * 0.28;
    const h = height * 0.34;
    return {
      system: { x: -width * 0.24, y: 0, size: height * 0.62 },
      mask: { x: width * 0.17, y: -height * 0.22, w, h },
      clip: { x: width * 0.17, y: height * 0.22, w, h },
    };
  }
  const w = width * 0.42;
  const h = Math.min(height * 0.2, w);
  return {
    system: { x: 0, y: -height * 0.2, size: Math.min(width * 0.6, height * 0.38) },
    mask: { x: -width * 0.24, y: height * 0.22, w, h },
    clip: { x: width * 0.24, y: height * 0.22, w, h },
  };
};

const OrbitSystem: FC<{ size: number; t: number }> = ({ size, t }) => {
  const orbit = size * 0.38;
  const sat = size * 0.09;
  const pulse = 1 + 0.08 * Math.sin(t * 3);

  return (
    <>
      <Group name="rings" rotation={t * 30}>
        <Circle
          radius={orbit}
          fill="none"
          stroke={COLOR.blue}
          strokeWidth={size * 0.008}
          strokeDasharray={`${size * 0.02} ${size * 0.03}`}
        />
        {[0, 1, 2].map((i) => (
          <Group key={i} name={`arm-${i}`} rotation={i * 120}>
            <Group name="satellite" x={orbit} rotation={-t * 90}>
              <Rect width={sat} height={sat} radius={sat * 0.2} fill={COLOR.blue} />
              <Circle radius={sat * 0.14} fill={COLOR.white} />
            </Group>
          </Group>
        ))}
      </Group>
      <Group name="core" scale={pulse}>
        <Circle radius={size * 0.13} fill={COLOR.glow} opacity={0.25} blendMode="plus-lighter" />
        <Circle radius={size * 0.06} fill={COLOR.white} />
      </Group>
    </>
  );
};

const PanelFrame: FC<{ w: number; h: number }> = ({ w, h }) => (
  <Rect
    width={w}
    height={h}
    radius={h * 0.08}
    fill={COLOR.panel}
    stroke={COLOR.blue}
    strokeWidth={h * 0.012}
  />
);

/** Máscara: un círculo en movimiento revela rayas; todo recortado al panel. */
const MaskPanel: FC<{ w: number; h: number; t: number }> = ({ w, h, t }) => {
  const sweep = Math.sin(t * 2.2) * w * 0.3;
  return (
    <>
      <PanelFrame w={w} h={h} />
      <Clip shape={<Rect width={w} height={h} radius={h * 0.08} />}>
        <Mask mask={<Circle x={sweep} radius={h * 0.36} />}>
          <Rect width={w} height={h} fill={COLOR.blue} />
          <Group name="stripes" rotation={25} stroke={COLOR.white} strokeWidth={h * 0.02}>
            {Array.from({ length: 21 }, (_, i) => {
              const px = -w + (2 * w * i) / 20;
              return <Line key={i} from={[px, -h]} to={[px, h]} />;
            })}
          </Group>
        </Mask>
      </Clip>
    </>
  );
};

const wavePath = (w: number, h: number, level: number, amp: number, phase: number): string => {
  const steps = 24;
  let d = `M ${-w / 2} ${level}`;
  for (let i = 1; i <= steps; i++) {
    const px = -w / 2 + (w * i) / steps;
    d += ` L ${px} ${level + Math.sin(phase + (i / steps) * Math.PI * 4) * amp}`;
  }
  return `${d} L ${w / 2} ${h / 2} L ${-w / 2} ${h / 2} Z`;
};

/** Recorte: corte transversal de un recipiente que se llena y se vacía. */
const ClipPanel: FC<{ w: number; h: number; t: number }> = ({ w, h, t }) => {
  const tankW = w * 0.9;
  const tankH = h * 0.86;
  const fill01 = 0.5 + 0.5 * Math.sin(t * 1.6 - Math.PI / 2);
  const level = tankH / 2 - tankH * (0.1 + 0.8 * fill01);
  const amp = tankH * 0.03;
  const tank = <Rect width={tankW} height={tankH} radius={h * 0.1} />;

  return (
    <>
      <PanelFrame w={w} h={h} />
      <Clip shape={tank}>
        <Path d={wavePath(tankW, tankH, level, amp, t * 4)} fill={COLOR.blue} />
        <Path
          d={wavePath(tankW, tankH, level + amp, amp, t * 3 + 1)}
          fill={COLOR.glow}
          opacity={0.3}
        />
      </Clip>
      <Rect
        width={tankW}
        height={tankH}
        radius={h * 0.1}
        fill="none"
        stroke={COLOR.white}
        strokeWidth={h * 0.015}
      />
    </>
  );
};

const GridLayer: FC = () => {
  const { left, right, top, bottom, width, height } = useStage();
  const step = Math.min(width, height) / 10;
  const cols = Math.ceil(width / step / 2);
  const rows = Math.ceil(height / step / 2);

  return (
    <Layer name="grid" stroke={COLOR.white} strokeWidth={2} opacity={0.06}>
      {Array.from({ length: cols * 2 + 1 }, (_, i) => (
        <Line key={`v${i}`} from={[(i - cols) * step, top]} to={[(i - cols) * step, bottom]} />
      ))}
      {Array.from({ length: rows * 2 + 1 }, (_, i) => (
        <Line key={`h${i}`} from={[left, (i - rows) * step]} to={[right, (i - rows) * step]} />
      ))}
    </Layer>
  );
};

const DemoContent: FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { width, height } = useStage();
  const t = frame / fps;
  const layout = computeLayout(width, height);

  const enter = (delay: number) =>
    interpolate(frame, [delay, delay + 24], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });

  return (
    <>
      <GridLayer />
      <Layer
        name="system"
        x={layout.system.x}
        y={layout.system.y}
        scale={enter(0)}
        opacity={enter(0)}
      >
        <OrbitSystem size={layout.system.size} t={t} />
      </Layer>
      <Layer name="mask-demo" x={layout.mask.x} y={layout.mask.y} scale={enter(8)} opacity={enter(8)}>
        <MaskPanel w={layout.mask.w} h={layout.mask.h} t={t} />
      </Layer>
      <Layer name="clip-demo" x={layout.clip.x} y={layout.clip.y} scale={enter(16)} opacity={enter(16)}>
        <ClipPanel w={layout.clip.w} h={layout.clip.h} t={t} />
      </Layer>
    </>
  );
};

/** Escena de validación de la Fase 1: ejercita formas, jerarquía, transformaciones, máscara y recorte. */
export const EngineDemo: FC = () => (
  <Stage background={COLOR.bg}>
    <DemoContent />
  </Stage>
);
