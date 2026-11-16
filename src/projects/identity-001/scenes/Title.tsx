import { AbsoluteFill } from "remotion";
import { KineticText } from "../../../components/KineticText";
import { LightSweep } from "../../../components/LightSweep";
import { motionTheme } from "../../../studio/theme";

export const Title: React.FC = () => {
  const { colors, fonts } = motionTheme;

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
      }}
    >
      <KineticText
        text="MOTION FORGE"
        startFrame={0}
        stagger={2}
        fontSize={142}
        color={colors.text}
        fontFamily={fonts.heading}
        letterSpacing={-6}
        align="center"
      />

      <LightSweep
        startFrame={28}
        duration={42}
        color={colors.blueLight}
        intensity={0.7}
        angle={-10}
      />

      <AbsoluteFill
        style={{
          justifyContent: "flex-end",
          alignItems: "center",
          paddingBottom: 115,
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            color: colors.blueLight,
            fontFamily: fonts.technical,
            fontSize: 17,
            letterSpacing: 5,
          }}
        >
          DESIGN IN MOTION
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
