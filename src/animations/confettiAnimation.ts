import { randomBetween } from "../utils/constants";

export interface ConfettiPiece {
  id: string;
  x: number;
  delay: number;
  tilt: number;
  color: string;
}

export const createConfettiPieces = (
  count: number,
  width: number,
  colors: readonly string[]
): ConfettiPiece[] =>
  // Fallback color prevents undefined values when strict indexed access is enabled.
  Array.from({ length: count }, (_, index) => ({
    id: `confetti-${index}`,
    x: randomBetween(0, Math.max(0, width - 6)),
    delay: randomBetween(0, 420),
    tilt: randomBetween(-24, 24),
    color: colors[index % colors.length] ?? "#00FFCC"
  }));
