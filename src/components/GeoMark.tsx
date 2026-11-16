import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
} from "remotion";

type GeoMarkProps = {
  readonly startFrame?: number;
  readonly size?: number;
  readonly color?: string;
  readonly exitStartFrame?: number;
  readonly exitDuration?: number;
};

export const GeoMark: React.FC<GeoMarkProps> = ({
  startFrame = 0,
  size = 420,
  color = "#1F5BFF",
  exitStartFrame = 60,
  exitDuration = 15,
}) => {
  const frame = useCurrentFrame();
  const localFrame = frame - startFrame;

  const progress = interpolate(localFrame, [0, 60], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const rotation = interpolate(progress, [0, 1], [-90, 0]);
  const entranceScale = interpolate(progress, [0, 1], [0.45, 1]);
  const entranceOpacity = interpolate(progress, [0, 0.5, 1], [0, 0.7, 1]);

  const exitProgress = interpolate(
    localFrame,
    [exitStartFrame, exitStartFrame + exitDuration],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );

  const exitScale = interpolate(exitProgress, [0, 1], [1, 0.65]);
  const exitRotation = interpolate(exitProgress, [0, 1], [0, 12]);
  const exitOpacity = 1 - exitProgress;

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        pointerEvents: "none",
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 400 400"
        style={{
          overflow: "visible",
          opacity: entranceOpacity * exitOpacity,
          transform: `rotate(${rotation + exitRotation}deg) scale(${entranceScale * exitScale})`,
        }}
      >
        <circle
          cx="200"
          cy="200"
          r="150"
          fill="none"
          stroke={color}
          strokeWidth="1.5"
          opacity="0.45"
        />

        <circle
          cx="200"
          cy="200"
          r="112"
          fill="none"
          stroke="#5C93FF"
          strokeWidth="1"
          strokeDasharray="5 9"
        />

        <rect
          x="112"
          y="112"
          width="176"
          height="176"
          fill="none"
          stroke="#F4F6FA"
          strokeWidth="1.5"
          transform="rotate(45 200 200)"
        />

        <path
          d="M 200 80 L 200 320 M 80 200 L 320 200"
          stroke={color}
          strokeWidth="1"
          opacity="0.6"
        />

        <path
          d="M 150 150 L 250 250 M 250 150 L 150 250"
          stroke="#5C93FF"
          strokeWidth="2"
        />

        <circle
          cx="200"
          cy="200"
          r="9"
          fill="#F4F6FA"
        />
      </svg>
    </AbsoluteFill>
  );
};
