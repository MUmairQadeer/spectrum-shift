import AsyncStorage from "@react-native-async-storage/async-storage";

const HIGH_SCORE_KEY = "spectrum_shift_high_score";

export const getStoredHighScore = async (): Promise<number> => {
  try {
    const value = await AsyncStorage.getItem(HIGH_SCORE_KEY);
    if (!value) return 0;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  } catch {
    return 0;
  }
};

export const storeHighScore = async (score: number): Promise<void> => {
  try {
    await AsyncStorage.setItem(HIGH_SCORE_KEY, String(score));
  } catch {
    // Intentionally ignore storage write failures for gameplay continuity.
  }
};
