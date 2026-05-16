import React, { useCallback, useEffect, useMemo } from "react";
import { StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  Easing,
  cancelAnimation,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming
} from "react-native-reanimated";
import { withOpacity } from "../utils/colors";
import { BLOCK_RADIUS } from "../utils/constants";
import type { Block as BlockModel } from "../types/game";

interface BlockProps {
  block: BlockModel;
  size: number;
  containerWidth: number;
  travelDistance: number;
  fallDurationMs: number;
  paused: boolean;
  onLanded: (blockId: string, colorIndex: number, x: number, y: number) => void;
}

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

const BlockComponent = ({
  block,
  size,
  containerWidth,
  travelDistance,
  fallDurationMs,
  paused,
  onLanded
}: BlockProps) => {
  const translateY = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }]
  }));

  const startAnimation = useCallback(() => {
    const remainingDistance = Math.max(0, travelDistance - translateY.value);
    const remainingProgress = travelDistance === 0 ? 0 : remainingDistance / travelDistance;
    const duration = Math.max(45, Math.round(fallDurationMs * remainingProgress));

    translateY.value = withTiming(
      travelDistance,
      { duration, easing: Easing.linear },
      (finished) => {
        if (!finished) return;
        runOnJS(onLanded)(block.id, block.colorIndex, block.positionX, travelDistance);
      }
    );
  }, [
    block.colorIndex,
    block.id,
    block.positionX,
    fallDurationMs,
    onLanded,
    translateY,
    travelDistance
  ]);

  useEffect(() => {
    if (paused) {
      cancelAnimation(translateY);
      return;
    }
    startAnimation();
  }, [paused, startAnimation, translateY]);

  const gradientColors = useMemo(
    () => [block.color, withOpacity(block.color, 0.6)] as const,
    [block.color]
  );

  const left = useMemo(
    () => block.positionX * Math.max(0, containerWidth - size),
    [block.positionX, containerWidth, size]
  );

  return (
    <Animated.View
      style={[
        styles.blockWrap,
        {
          width: size,
          height: size,
          left,
          shadowColor: block.color
        },
        animatedStyle
      ]}
    >
      <AnimatedLinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <View style={[styles.innerGlow, { borderColor: withOpacity(block.color, 0.8) }]} />
      </AnimatedLinearGradient>
    </Animated.View>
  );
};

export const Block = React.memo(BlockComponent);

const styles = StyleSheet.create({
  blockWrap: {
    position: "absolute",
    top: 0,
    borderRadius: BLOCK_RADIUS,
    shadowOpacity: 0.45,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8
  },
  gradient: {
    flex: 1,
    borderRadius: BLOCK_RADIUS,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center"
  },
  innerGlow: {
    width: "72%",
    height: "72%",
    borderRadius: BLOCK_RADIUS,
    borderWidth: 1,
    opacity: 0.28
  }
});
