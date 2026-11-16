import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
} from "remotion";

type GlowPointProps = {
  readonly startFrame?: number;
  readonly color?: string;
  readonly maxSize?: number;
};

export const GlowPoint: React.FC<GlowPointProps> = ({
  startFrame = 0,
  color = "#1F5BFF",
  maxSize = 420,
}) => {
  const frame = useCurrentFrame();
  const localFrame = frame - startFrame;

  const progress = interpolate(localFrame, [0, 45], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const ringScale = interpolate(progress, [0, 1], [0.1, 1]);
  const ringOpacity = interpolate(progress, [0, 0.2, 1], [0, 0.8, 0]);

  const pulse = 0.8 + Math.sin(localFrame * 0.18) * 0.2;

  const visible = localFrame >= 0;

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        pointerEvents: "none",
        opacity: visible ? 1 : 0,
      }}
    >
      <div
        style={{
          position: "absolute",
          width: maxSize,
          height: maxSize,
          borderRadius: "50%",
          border: `1px solid ${color}`,
          transform: `scale(${ringScale})`,
          opacity: ringOpacity,
        }}
      />

      <div
        style={{
          width: 12,
          height: 12,
          borderRadius: "50%",
          backgroundColor: "#F4F6FA",
          boxShadow: `
            0 0 12px ${color},
            0 0 32px ${color},
            0 0 70px rgba(31, 91, 255, 0.45)
          `,
          opacity: pulse,
        }}
      />
    </AbsoluteFill>
  );
};
