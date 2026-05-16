export const BLOCK_COLORS = [
  "#FF3366",
  "#33FF66",
  "#3366FF",
  "#FFCC00",
  "#FF6600",
  "#CC33FF"
] as const;

export const BLOCK_COLOR_NAMES = [
  "Red",
  "Green",
  "Blue",
  "Yellow",
  "Orange",
  "Purple"
] as const;

export const PALETTE = {
  backgroundStart: "#0F0F1A",
  backgroundEnd: "#1A1A2E",
  primaryText: "rgba(255,255,255,0.92)",
  secondaryText: "#888888",
  neonCyan: "#00FFCC",
  cardGlass: "rgba(255,255,255,0.08)",
  dangerRed: "#FF3B30"
} as const;

export const withOpacity = (hexColor: string, opacity: number): string => {
  const raw = hexColor.replace("#", "");
  if (raw.length !== 6) {
    return hexColor;
  }

  const alpha = Math.round(Math.max(0, Math.min(1, opacity)) * 255)
    .toString(16)
    .padStart(2, "0");

  return `#${raw}${alpha}`;
};
