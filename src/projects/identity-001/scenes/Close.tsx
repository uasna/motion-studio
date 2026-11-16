import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { motionTheme } from "../../../studio/theme";

export const Close: React.FC = () => {
  const frame = useCurrentFrame();
  const { colors, fonts } = motionTheme;

  const progress = interpolate(frame, [0, 35], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const scale = interpolate(progress, [0, 1], [1, 0.72]);
  const lineWidth = interpolate(progress, [0, 1], [0, 420]);
  const opacity = interpolate(progress, [0, 30, 44], [1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: colors.background,
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
        opacity,
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          transform: `scale(${scale})`,
        }}
      >
        <div
          style={{
            color: colors.text,
            fontFamily: fonts.heading,
            fontSize: 112,
            fontWeight: 700,
            letterSpacing: -5,
          }}
        >
          MOTION FORGE
        </div>

        <div
          style={{
            width: lineWidth,
            height: 2,
            marginTop: 28,
            backgroundColor: colors.blue,
            boxShadow: `0 0 18px ${colors.blue}`,
          }}
        />

        <div
          style={{
            marginTop: 20,
            color: colors.blueLight,
            fontFamily: fonts.technical,
            fontSize: 15,
            letterSpacing: 5,
          }}
        >
          MF—001
        </div>
      </div>
    </AbsoluteFill>
  );
};
