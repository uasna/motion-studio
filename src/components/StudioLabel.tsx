import {
  interpolate,
  useCurrentFrame,
} from "remotion";

type StudioLabelProps = {
  readonly text: string;
  readonly startFrame?: number;
  readonly color?: string;
  readonly background?: string;
  readonly fontSize?: number;
  readonly padding?: string;
  readonly border?: boolean;
};

export const StudioLabel: React.FC<StudioLabelProps> = ({
  text,
  startFrame = 0,
  color = "#5C93FF",
  background = "rgba(20, 23, 28, 0.85)",
  fontSize = 14,
  padding = "8px 12px",
  border = true,
}) => {
  const frame = useCurrentFrame();

  const progress = interpolate(
    frame - startFrame,
    [0, 12],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );

  const translateY = interpolate(progress, [0, 1], [12, 0]);

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding,
        color,
        background,
        border: border ? `1px solid ${color}55` : "none",
        fontFamily: "JetBrains Mono, monospace",
        fontSize,
        letterSpacing: 1,
        textTransform: "uppercase",
        whiteSpace: "nowrap",
        opacity: progress,
        transform: `translateY(${translateY}px)`,
      }}
    >
      {text}
    </div>
  );
};
