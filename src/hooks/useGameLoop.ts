import { useEffect } from "react";

interface UseGameLoopOptions {
  isRunning: boolean;
  isPaused: boolean;
  spawnInterval: number;
  onSpawn: () => void;
}

export const useGameLoop = ({
  isRunning,
  isPaused,
  spawnInterval,
  onSpawn
}: UseGameLoopOptions) => {
  useEffect(() => {
    if (!isRunning || isPaused) return;

    const timer = setInterval(() => {
      onSpawn();
    }, spawnInterval);

    return () => clearInterval(timer);
  }, [isRunning, isPaused, onSpawn, spawnInterval]);
};
