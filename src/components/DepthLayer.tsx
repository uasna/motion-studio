import {
  interpolate,
  useCurrentFrame,
} from "remotion";

type DepthLayerProps = {
  readonly children: React.ReactNode;
  readonly startFrame?: number;
  readonly duration?: number;
  readonly depth?: number;
  readonly direction?: "horizontal" | "vertical";
  readonly distance?: number;
  readonly initialScale?: number;
  readonly rotation?: number;
  readonly opacity?: number;
};

export const DepthLayer: React.FC<DepthLayerProps> = ({
  children,
  startFrame = 0,
  duration = 60,
  depth = 1,
  direction = "horizontal",
  distance = 100,
  initialScale = 0.8,
  rotation = 0,
  opacity = 1,
}) => {
  const frame = useCurrentFrame();

  const progress = interpolate(
    frame - startFrame,
    [0, duration],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );

  const offset = interpolate(
    progress,
    [0, 1],
    [distance * depth, 0],
  );

  const scale = interpolate(
    progress,
    [0, 1],
    [initialScale, 1],
  );

  const currentRotation = interpolate(
    progress,
    [0, 1],
    [rotation, 0],
  );

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        opacity: opacity * progress,
        transform: `
          translate${direction === "horizontal" ? "X" : "Y"}(${offset}px)
          scale(${scale})
          rotate(${currentRotation}deg)
        `,
        pointerEvents: "none",
      }}
    >
      {children}
    </div>
  );
};
