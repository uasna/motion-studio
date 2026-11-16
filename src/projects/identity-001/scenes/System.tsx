import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { StudioLabel } from "../../../components/StudioLabel";
import { motionTheme } from "../../../studio/theme";

const formats = [
  { name: "16:9", width: 180, height: 102 },
  { name: "9:16", width: 72, height: 128 },
  { name: "1:1", width: 110, height: 110 },
];

export const System: React.FC = () => {
  const frame = useCurrentFrame();
  const { colors, fonts } = motionTheme;

  const progress = interpolate(frame, [0, 15], [0, 1], {
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
        opacity: progress,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 75,
          left: 85,
        }}
      >
        <StudioLabel
          text="VISUAL IDENTITY 001"
          startFrame={0}
          color={colors.blueLight}
        />
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 85,
        }}
      >
        {formats.map((format, index) => {
          const delay = index * 5;
          const itemProgress = interpolate(
            frame - delay,
            [0, 12],
            [0, 1],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            },
          );

          return (
            <div
              key={format.name}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 22,
                opacity: itemProgress,
                transform: `translateY(${(1 - itemProgress) * 30}px)`,
              }}
            >
              <div
                style={{
                  width: format.width,
                  height: format.height,
                  border: `1px solid ${colors.blue}`,
                  background: `linear-gradient(135deg, ${colors.panel}, ${colors.background})`,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  boxShadow: `0 0 25px ${colors.blue}22`,
                }}
              >
                <div
                  style={{
                    width: "35%",
                    aspectRatio: "1",
                    border: `2px solid ${colors.blueLight}`,
                    transform: "rotate(45deg)",
                  }}
                />
              </div>

              <div
                style={{
                  color: colors.text,
                  fontFamily: fonts.technical,
                  fontSize: 22,
                  letterSpacing: 2,
                }}
              >
                {format.name}
              </div>
            </div>
          );
        })}
      </div>

      <div
        style={{
          position: "absolute",
          bottom: 80,
          color: colors.blueLight,
          fontFamily: fonts.technical,
          fontSize: 16,
          letterSpacing: 4,
        }}
      >
        ONE SYSTEM / THREE FORMATS
      </div>
    </AbsoluteFill>
  );
};
