import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
} from "remotion";

type LightSweepProps = {
  readonly startFrame?: number;
  readonly duration?: number;
  readonly color?: string;
  readonly intensity?: number;
  readonly angle?: number;
};

export const LightSweep: React.FC<LightSweepProps> = ({
  startFrame = 0,
  duration = 30,
  color = "#5C93FF",
  intensity = 0.8,
  angle = -12,
}) => {
  const frame = useCurrentFrame();

  const progress = interpolate(
    frame - startFrame,
    [0, duration],
    [-120, 120],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );

  const opacity = interpolate(
    frame - startFrame,
    [0, 5, duration - 5, duration],
    [0, intensity, intensity, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );

  return (
    <AbsoluteFill
      style={{
        overflow: "hidden",
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: "-50%",
          width: "200%",
          height: "200%",
          background: `linear-gradient(
            90deg,
            transparent 48%,
            ${color} 49.5%,
            #FFFFFF 50%,
            ${color} 50.5%,
            transparent 52%
          )`,
          transform: `translateX(${progress}%) rotate(${angle}deg)`,
          opacity,
          mixBlendMode: "screen",
        }}
      />
    </AbsoluteFill>
  );
};
