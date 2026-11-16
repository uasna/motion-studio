import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

type GridBackgroundProps = {
  readonly columns?: number;
  readonly color?: string;
  readonly opacity?: number;
  readonly revealStart?: number;
  readonly revealDuration?: number;
};

export const GridBackground: React.FC<GridBackgroundProps> = ({
  columns = 12,
  color = "rgba(92, 147, 255, 0.18)",
  opacity = 1,
  revealStart = 0,
  revealDuration = 60,
}) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  const cellSize = width / columns;
  const maxRadius = Math.sqrt(width ** 2 + height ** 2) / 2;

  const radius = interpolate(
    frame,
    [revealStart, revealStart + revealDuration],
    [0, maxRadius],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );

  const revealOpacity = interpolate(
    frame,
    [revealStart, revealStart + 12],
    [0, opacity],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );

  return (
    <AbsoluteFill
      style={{
        pointerEvents: "none",
        opacity: revealOpacity,
        backgroundImage: `
          linear-gradient(to right, ${color} 1px, transparent 1px),
          linear-gradient(to bottom, ${color} 1px, transparent 1px)
        `,
        backgroundSize: `${cellSize}px ${cellSize}px`,
        maskImage: `radial-gradient(circle ${radius}px at center, black 0%, transparent 100%)`,
        WebkitMaskImage: `radial-gradient(circle ${radius}px at center, black 0%, transparent 100%)`,
      }}
    />
  );
};
