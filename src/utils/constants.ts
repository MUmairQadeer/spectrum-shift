import { BLOCK_COLORS, BLOCK_COLOR_NAMES } from "./colors";

export const MAX_LIVES = 3;
export const START_SPAWN_INTERVAL = 2500;
export const MIN_SPAWN_INTERVAL = 900;
export const FALL_SPEED_PX_PER_SEC = 250;
export const PLATFORM_HEIGHT = 80;
export const BLOCK_BASE_SIZE = 60;
export const HEADER_CARD_RADIUS = 20;
export const PLATFORM_RADIUS = 40;
export const BLOCK_RADIUS = 12;

export const COLOR_SEQUENCE = BLOCK_COLORS;
export const COLOR_NAME_SEQUENCE = BLOCK_COLOR_NAMES;

export const getWrappedColorIndex = (index: number): number => {
  const length = COLOR_SEQUENCE.length;
  return ((index % length) + length) % length;
};

export const getColorByIndex = (index: number): string =>
  COLOR_SEQUENCE[getWrappedColorIndex(index)] ?? COLOR_SEQUENCE[0];

export const getColorNameByIndex = (index: number): string =>
  COLOR_NAME_SEQUENCE[getWrappedColorIndex(index)] ?? COLOR_NAME_SEQUENCE[0];

export const getSpawnIntervalForScore = (score: number): number => {
  if (score >= 50) return 900;
  if (score >= 40) return 1100;
  if (score >= 30) return 1400;
  if (score >= 20) return 1700;
  if (score >= 10) return 2100;
  return START_SPAWN_INTERVAL;
};

export const randomBetween = (min: number, max: number): number =>
  Math.random() * (max - min) + min;
