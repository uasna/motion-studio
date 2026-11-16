import { Fragment, type FC } from "react";
import { Composition, Folder } from "remotion";
import { AnimationDemo } from "./AnimationDemo";
import { CameraDemo } from "./CameraDemo";
import { EngineDemo } from "./EngineDemo";

const FORMATS = [
  { id: "16x9", width: 1920, height: 1080 },
  { id: "9x16", width: 1080, height: 1920 },
  { id: "1x1", width: 1080, height: 1080 },
] as const;

/** Demos de cada fase, una composición por proporción para verificar la adaptación del diseño. */
export const EngineDemoCompositions: FC = () => (
  <Folder name="MotionForge">
    {FORMATS.map(({ id, width, height }) => (
      <Fragment key={id}>
        <Composition
          id={`ForgeEngineDemo-${id}`}
          component={EngineDemo}
          durationInFrames={150}
          fps={30}
          width={width}
          height={height}
        />
        <Composition
          id={`ForgeAnimationDemo-${id}`}
          component={AnimationDemo}
          durationInFrames={180}
          fps={30}
          width={width}
          height={height}
        />
        <Composition
          id={`ForgeCameraDemo-${id}`}
          component={CameraDemo}
          durationInFrames={240}
          fps={30}
          width={width}
          height={height}
        />
      </Fragment>
    ))}
  </Folder>
);
