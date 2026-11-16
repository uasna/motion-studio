import { AbsoluteFill } from "remotion";
import { GridBackground } from "../../../components/GridBackground";
import { GlowPoint } from "../../../components/GlowPoint";
import { StudioLabel } from "../../../components/StudioLabel";
import { motionTheme } from "../../../studio/theme";

export const Ignition: React.FC = () => {
  const { colors } = motionTheme;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: colors.background,
        overflow: "hidden",
      }}
    >
      <GridBackground
        columns={12}
        color="rgba(92, 147, 255, 0.16)"
        opacity={0.8}
        revealStart={0}
        revealDuration={45}
      />

      <GlowPoint
        startFrame={0}
        color={colors.blue}
        maxSize={460}
      />

      <AbsoluteFill
        style={{
          justifyContent: "flex-end",
          alignItems: "flex-start",
          padding: 64,
          pointerEvents: "none",
        }}
      >
        <StudioLabel
          text="MF—001"
          startFrame={12}
          color={colors.blueLight}
          fontSize={16}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
