import { useCallback } from "react";
import { getColorByIndex } from "../utils/constants";

export const useCollisionDetection = () => {
  const isColorMatch = useCallback(
    (blockColorIndex: number, platformColorIndex: number): boolean => {
      const blockColor = getColorByIndex(blockColorIndex);
      const platformColor = getColorByIndex(platformColorIndex);
      return blockColor === platformColor;
    },
    []
  );

  return { isColorMatch };
};
