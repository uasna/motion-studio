import type { FormatId, FormatSpec } from "./types";

export const DEFAULT_FPS = 24;
export const DEFAULT_DURATION_SECONDS = 60;

export const FPS_PRESETS = [24, 30, 60] as const;

export const DURATION_PRESETS = [10, 30, 60, 90] as const;

export const FORMAT_SPECS: Record<FormatId, FormatSpec> = {
  landscape: {
    id: "landscape",
    width: 1920,
    height: 1080,
    fps: DEFAULT_FPS,
    durationInFrames: DEFAULT_FPS * DEFAULT_DURATION_SECONDS,
    gridColumns: 12,
    safeMargin: 96,
  },
  portrait: {
    id: "portrait",
    width: 1080,
    height: 1920,
    fps: DEFAULT_FPS,
    durationInFrames: DEFAULT_FPS * DEFAULT_DURATION_SECONDS,
    gridColumns: 6,
    safeMargin: 72,
  },
  square: {
    id: "square",
    width: 1080,
    height: 1080,
    fps: DEFAULT_FPS,
    durationInFrames: DEFAULT_FPS * DEFAULT_DURATION_SECONDS,
    gridColumns: 8,
    safeMargin: 72,
  },
};

export const getDurationInFrames = (
  seconds: number,
  fps: number = DEFAULT_FPS,
): number => {
  if (!Number.isFinite(seconds) || seconds <= 0) {
    throw new Error("Duration must be a positive number.");
  }

  if (!Number.isInteger(fps) || fps <= 0) {
    throw new Error("FPS must be a positive integer.");
  }

  return Math.round(seconds * fps);
};
