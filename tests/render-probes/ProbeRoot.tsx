import type { FC } from "react";
import { Composition } from "remotion";
import { CameraAtProbe, type CameraAtProbeProps } from "./CameraAtProbes";
import { StaggerProbe, type StaggerProbeProps } from "./StaggerProbes";

const FPS = 30;

const stagger = (id: string, durationInFrames: number, defaultProps: StaggerProbeProps) => (
  <Composition
    id={id}
    component={StaggerProbe}
    durationInFrames={durationInFrames}
    fps={FPS}
    width={400}
    height={200}
    defaultProps={defaultProps}
  />
);

const camera = (id: string, defaultProps: CameraAtProbeProps) => (
  <Composition
    id={id}
    component={CameraAtProbe}
    durationInFrames={140}
    fps={FPS}
    width={800}
    height={200}
    defaultProps={defaultProps}
  />
);

/** Composiciones de prueba. Los ids son el contrato con `run.mjs`. */
export const ProbeRoot: FC = () => (
  <>
    {stagger("T1-1-windows", 60, { from: 10, each: 5, duration: 12, mode: "solid" })}
    {stagger("T1-2-relay", 30, { from: 0, each: 6, duration: 6, mode: "solid" })}
    {stagger("T1-3-local", 60, { from: 10, each: 5, duration: 12, mode: "local" })}
    {camera("T2-1-control", { wrap: "control", withObject: false })}
    {camera("T2-2-at40", { wrap: "at40", withObject: false })}
    {camera("T2-3-nested", { wrap: "nested", withObject: false })}
    {camera("T2-4-control", { wrap: "control", withObject: true })}
    {camera("T2-4-at40", { wrap: "at40", withObject: true })}
    {camera("T2-5-persist-false", { wrap: "persistFalse", withObject: false })}
  </>
);
