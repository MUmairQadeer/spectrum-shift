import { useEffect, useMemo, useState } from "react";
import { Dimensions } from "react-native";

const BASE_WIDTH = 390;

export const useResponsiveLayout = () => {
  const [windowSize, setWindowSize] = useState(Dimensions.get("window"));

  useEffect(() => {
    const subscription = Dimensions.addEventListener("change", ({ window }) => {
      setWindowSize(window);
    });

    return () => subscription.remove();
  }, []);

  return useMemo(() => {
    const { width, height } = windowSize;
    const isLandscape = width > height;
    const shortSide = Math.min(width, height);
    const isTablet = shortSide >= 768;

    const scale = (size: number): number => {
      const scaled = (size * shortSide) / BASE_WIDTH;
      return Math.max(size * 0.82, Math.min(size * 1.28, scaled));
    };

    const blockSize = Math.min(70, width * (isLandscape ? 0.07 : 0.08));
    const platformWidth = width * (isTablet ? 0.85 : 0.9);
    const platformSectionHeight = isLandscape ? height * 0.27 : height * 0.24;

    return {
      width,
      height,
      isLandscape,
      isTablet,
      shortSide,
      scale,
      blockSize,
      platformWidth,
      platformSectionHeight,
      horizontalPadding: isTablet ? 28 : 20
    };
  }, [windowSize]);
};
