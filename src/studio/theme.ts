import type { MotionTheme } from "./types";

export const motionTheme = {
  colors: {
    background: "#0B0D10",
    panel: "#14171C",
    text: "#F4F6FA",
    blue: "#1F5BFF",
    blueLight: "#5C93FF",
  },
  fonts: {
    heading: "Space Grotesk, sans-serif",
    technical: "JetBrains Mono, monospace",
  },
} as const satisfies MotionTheme;
