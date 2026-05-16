export type RootStackParamList = {
  Start: undefined;
  Game: undefined;
  GameOver: {
    score: number;
    highScore: number;
    isNewHighScore: boolean;
  };
};
