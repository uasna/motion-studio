import type { FC } from "react";
import {
  Animate,
  Camera,
  Circle,
  Clip,
  Group,
  Layer,
  Line,
  Mask,
  Polyline,
  Rect,
  Stage,
  cameraShots,
  frameRect,
  tween,
  useAnimation,
  useStage,
  type CameraTarget,
  type StageBounds,
} from "..";
import { COLOR } from "./palette";

/** El mundo es más grande que el encuadre; la cámara lo recorre. Unidades: px a zoom 1. */
const WORLD: CameraTarget = { x: 0, y: 20, width: 2700, height: 1100 };
const ORBIT: CameraTarget = { x: -900, y: -250, width: 640, height: 640 };
const TANK: CameraTarget = { x: 0, y: 330, width: 720, height: 480 };
const IRIS: CameraTarget = { x: 900, y: -250, width: 720, height: 480 };

/** Guion de cámara. Cada plano se calcula con frameRect, así cada proporción encuadra bien su zoom. */
const buildShots = (stage: StageBounds) => {
  const overview = frameRect(WORLD, stage, 0.04);
  const orbit = frameRect(ORBIT, stage, 0.12);
  const tank = frameRect(TANK, stage, 0.12);
  const iris = frameRect(IRIS, stage, 0.12);
  return cameraShots([
    { frame: 0, ...overview },
    { frame: 25, ...overview, easing: "ease-in-out" },
    { frame: 65, ...orbit },
    { frame: 90, ...orbit, easing: "ease-in-out" },
    { frame: 130, ...tank },
    { frame: 155, ...tank, easing: "ease-in-out" },
    { frame: 195, ...iris },
    { frame: 208, ...iris, easing: "ease-in-out" },
    { frame: 239, ...overview },
  ]);
};

const WorldGrid: FC = () => (
  <>
    <Layer name="world-grid" stroke={COLOR.white} strokeWidth={3} opacity={0.07}>
      {Array.from({ length: 25 }, (_, i) => (
        <Line key={`v${i}`} from={[(i - 12) * 200, -1800]} to={[(i - 12) * 200, 1800]} />
      ))}
      {Array.from({ length: 19 }, (_, i) => (
        <Line key={`h${i}`} from={[-2600, (i - 9) * 200]} to={[2600, (i - 9) * 200]} />
      ))}
    </Layer>
    <Layer name="world-bounds" opacity={0.4}>
      <Rect
        y={WORLD.y}
        width={WORLD.width}
        height={WORLD.height}
        radius={40}
        fill="none"
        stroke={COLOR.blue}
        strokeWidth={6}
        strokeDasharray="30 24"
      />
    </Layer>
  </>
);

const OrbitLandmark: FC<{ size: number }> = ({ size }) => {
  const orbit = size * 0.34;
  const sat = size * 0.1;
  return (
    <>
      <Circle radius={size / 2} fill={COLOR.panel} stroke={COLOR.blue} strokeWidth={6} />
      <Animate animation={{ rotation: tween(0, 240, 0, 360) }}>
        <Circle
          radius={orbit}
          fill="none"
          stroke={COLOR.blueSoft}
          strokeWidth={4}
          strokeDasharray="22 18"
        />
        {[0, 1, 2].map((i) => (
          <Group key={i} rotation={i * 120}>
            <Animate x={orbit} animation={{ rotation: tween(0, 240, 0, -720) }}>
              <Rect width={sat} height={sat} radius={sat * 0.2} fill={COLOR.blue} />
              <Circle radius={sat * 0.15} fill={COLOR.white} />
            </Animate>
          </Group>
        ))}
      </Animate>
      <Circle radius={size * 0.1} fill={COLOR.glow} opacity={0.3} blendMode="plus-lighter" />
      <Circle radius={size * 0.05} fill={COLOR.white} />
    </>
  );
};

const TankLandmark: FC<{ w: number; h: number }> = ({ w, h }) => {
  const tankW = w * 0.72;
  const tankH = h * 0.82;
  return (
    <>
      <Rect width={w} height={h} radius={h * 0.06} fill={COLOR.panel} stroke={COLOR.blue} strokeWidth={6} />
      <Clip shape={<Rect width={tankW} height={tankH} radius={h * 0.08} />}>
        <Animate
          animation={{
            y: [
              { frame: 0, value: tankH, easing: "ease-in-out" },
              { frame: 130, value: tankH * 0.15, easing: "ease-in-out" },
              { frame: 235, value: tankH },
            ],
          }}
        >
          <Rect width={tankW * 1.1} height={tankH} fill={COLOR.blue} />
        </Animate>
        {[0, 1, 2].map((i) => (
          <Animate
            key={i}
            x={(i - 1) * tankW * 0.22}
            animation={{
              y: tween(20 + i * 35, 120 + i * 35, tankH * 0.5, -tankH * 0.5),
              opacity: [
                { frame: 20 + i * 35, value: 0, easing: "ease-out" },
                { frame: 50 + i * 35, value: 0.8 },
                { frame: 120 + i * 35, value: 0 },
              ],
            }}
          >
            <Circle radius={tankH * 0.035} fill={COLOR.glow} />
          </Animate>
        ))}
      </Clip>
      <Rect
        width={tankW}
        height={tankH}
        radius={h * 0.08}
        fill="none"
        stroke={COLOR.white}
        strokeWidth={6}
      />
    </>
  );
};

const IrisLandmark: FC<{ w: number; h: number }> = ({ w, h }) => {
  const radius = Math.hypot(w, h) / 2;
  const iris = useAnimation({
    scale: [
      { frame: 0, value: 0 },
      { frame: 150, value: 0, easing: "ease-in-out" },
      { frame: 200, value: 1 },
    ],
  });
  return (
    <>
      <Rect width={w} height={h} radius={h * 0.06} fill={COLOR.panel} stroke={COLOR.blue} strokeWidth={6} />
      <Clip shape={<Rect width={w} height={h} radius={h * 0.06} />}>
        <Mask mask={<Circle radius={radius} {...iris} />}>
          <Rect width={w} height={h} fill={COLOR.blue} />
          <Group fill="none" stroke={COLOR.white} strokeWidth={h * 0.02} opacity={0.9}>
            {[0.12, 0.24, 0.36, 0.48, 0.6].map((k) => (
              <Circle key={k} radius={h * k} />
            ))}
          </Group>
        </Mask>
      </Clip>
    </>
  );
};

/** Marcas de visor FUERA de la cámara: no se mueven ni escalan. */
const Hud: FC = () => {
  const { left, right, top, bottom, width, height } = useStage();
  const unit = Math.min(width, height);
  const margin = unit * 0.04;
  const len = unit * 0.06;
  const corners = [
    { x: left + margin, y: top + margin, sx: 1, sy: 1 },
    { x: right - margin, y: top + margin, sx: -1, sy: 1 },
    { x: left + margin, y: bottom - margin, sx: 1, sy: -1 },
    { x: right - margin, y: bottom - margin, sx: -1, sy: -1 },
  ] as const;
  return (
    <Layer name="hud" stroke={COLOR.white} strokeWidth={unit * 0.004} opacity={0.55} strokeLinecap="round">
      {corners.map(({ x, y, sx, sy }, i) => (
        <Polyline
          key={i}
          points={[
            [x + sx * len, y],
            [x, y],
            [x, y + sy * len],
          ]}
        />
      ))}
    </Layer>
  );
};

const DemoContent: FC = () => {
  const stage = useStage();
  return (
    <>
      <Camera animation={buildShots(stage)}>
        <WorldGrid />
        <Layer name="orbit" x={ORBIT.x} y={ORBIT.y}>
          <OrbitLandmark size={ORBIT.width} />
        </Layer>
        <Layer name="tank" x={TANK.x} y={TANK.y}>
          <TankLandmark w={TANK.width} h={TANK.height} />
        </Layer>
        <Layer name="iris" x={IRIS.x} y={IRIS.y}>
          <IrisLandmark w={IRIS.width} h={IRIS.height} />
        </Layer>
      </Camera>
      <Hud />
    </>
  );
};

/**
 * Demo de la Fase 2B. La cámara parte de una vista general del mundo y recorre tres puntos
 * de interés (órbitas, recipiente con Clip, iris con Mask), animando x, y y zoom con los
 * keyframes y el easing de la Fase 2A. El HUD queda fuera de la cámara.
 */
export const CameraDemo: FC = () => (
  <Stage background={COLOR.bg}>
    <DemoContent />
  </Stage>
);
