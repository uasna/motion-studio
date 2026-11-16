import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { GeoMark } from "../../../components/GeoMark";
import { LightSweep } from "../../../components/LightSweep";
import { motionTheme } from "../../../studio/theme";

export const Forge: React.FC = () => {
  const frame = useCurrentFrame();
  const { colors } = motionTheme;

  const progress = interpolate(frame, [0, 55], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const rotation = interpolate(progress, [0, 1], [-45, 0]);
  const scale = interpolate(progress, [0, 1], [0.65, 1]);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: colors.background,
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          width: 520,
          height: 520,
          border: `1px solid ${colors.blue}55`,
          transform: `rotate(${rotation}deg) scale(${scale})`,
          opacity: progress,
        }}
      />

      <GeoMark
        startFrame={0}
        size={430}
        color={colors.blue}
      />

      <LightSweep
        startFrame={48}
        duration={24}
        color={colors.blueLight}
        intensity={0.75}
        angle={-12}
      />
    </AbsoluteFill>
  );
};
