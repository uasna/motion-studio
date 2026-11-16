export type FormatId = "landscape" | "portrait" | "square";

export type FormatSpec = {
  readonly id: FormatId;
  readonly width: number;
  readonly height: number;
  readonly fps: number;
  readonly durationInFrames: number;
  readonly gridColumns: number;
  readonly safeMargin: number;
};

export type MotionTheme = {
  readonly colors: {
    readonly background: string;
    readonly panel: string;
    readonly text: string;
    readonly blue: string;
    readonly blueLight: string;
  };
  readonly fonts: {
    readonly heading: string;
    readonly technical: string;
  };
};
