export interface Block {
  id: string;
  color: string;
  colorName: string;
  colorIndex: number;
  positionX: number;
  positionY: number;
  status: "falling" | "matched" | "mismatched";
}

export interface ParticleBurst {
  id: string;
  x: number;
  y: number;
  color: string;
  type: "match" | "mismatch";
}

export interface ScoreFly {
  id: string;
  startX: number;
  startY: number;
  value: number;
}

export interface GameState {
  score: number;
  highScore: number;
  lives: number;
  isGameActive: boolean;
  currentPlatformColor: string;
  fallingBlocks: Block[];
  colorIndex: number;
  gameSpeed: number;
}
