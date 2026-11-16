import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
} from "remotion";

type KineticTextProps = {
  readonly text: string;
  readonly startFrame?: number;
  readonly stagger?: number;
  readonly fontSize?: number;
  readonly color?: string;
  readonly fontFamily?: string;
  readonly letterSpacing?: number;
  readonly align?: "left" | "center" | "right";
};

export const KineticText: React.FC<KineticTextProps> = ({
  text,
  startFrame = 0,
  stagger = 3,
  fontSize = 120,
  color = "#F4F6FA",
  fontFamily = "Space Grotesk, sans-serif",
  letterSpacing = -4,
  align = "left",
}) => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems:
          align === "left"
            ? "flex-start"
            : align === "right"
              ? "flex-end"
              : "center",
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          display: "flex",
          whiteSpace: "pre",
          overflow: "hidden",
          fontFamily,
          fontSize,
          fontWeight: 700,
          letterSpacing,
          color,
        }}
      >
        {text.split("").map((character, index) => {
          const localFrame = frame - startFrame - index * stagger;

          const progress = interpolate(
            localFrame,
            [0, 20],
            [0, 1],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.out(Easing.cubic),
            },
          );

          const translateY = interpolate(progress, [0, 1], [115, 0]);
          const scale = interpolate(progress, [0, 1], [0.96, 1]);

          return (
            <span
              key={`${character}-${index}`}
              style={{
                display: "inline-block",
                opacity: progress,
                transform: `translateY(${translateY}%) scale(${scale})`,
                transformOrigin: "center bottom",
              }}
            >
              {character === " " ? "\u00A0" : character}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
