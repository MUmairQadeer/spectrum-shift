import React, { memo, useEffect, useMemo } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  type SharedValue,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming
} from "react-native-reanimated";
import { withOpacity } from "../utils/colors";

interface ParticleEffectProps {
  id: string;
  x: number;
  y: number;
  color: string;
  type: "match" | "mismatch";
  onDone: (id: string) => void;
}

interface ParticleDotProps {
  index: number;
  count: number;
  progress: SharedValue<number>;
  color: string;
  type: "match" | "mismatch";
}

const ParticleDot = memo(({ index, count, progress, color, type }: ParticleDotProps) => {
  const angle = (index / count) * Math.PI * 2;
  const baseDistance = type === "match" ? 70 : 95;

  const animatedStyle = useAnimatedStyle(() => {
    const distance = baseDistance * progress.value;
    return {
      opacity: 1 - progress.value,
      transform: [
        { translateX: Math.cos(angle) * distance },
        { translateY: Math.sin(angle) * distance },
        { scale: 1.1 - progress.value * 0.65 }
      ]
    };
  });

  return (
    <Animated.View
      style={[
        styles.dot,
        {
          backgroundColor: color,
          shadowColor: color
        },
        animatedStyle
      ]}
    />
  );
});

export const ParticleEffect = ({ id, x, y, color, type, onDone }: ParticleEffectProps) => {
  const progress = useSharedValue(0);
  const count = type === "match" ? 9 : 12;

  useEffect(() => {
    progress.value = withTiming(
      1,
      {
        duration: type === "match" ? 480 : 620,
        easing: Easing.out(Easing.cubic)
      },
      (finished) => {
        if (finished) {
          runOnJS(onDone)(id);
        }
      }
    );
  }, [id, onDone, progress, type]);

  const burstColor = useMemo(
    () => (type === "mismatch" ? "#FF3B30" : withOpacity(color, 0.92)),
    [color, type]
  );

  return (
    <View
      pointerEvents="none"
      style={[
        styles.container,
        {
          left: x,
          top: y
        }
      ]}
    >
      {Array.from({ length: count }, (_, index) => (
        <ParticleDot key={`dot-${id}-${index}`} index={index} count={count} progress={progress} color={burstColor} type={type} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    width: 4,
    height: 4
  },
  dot: {
    position: "absolute",
    width: 6,
    height: 6,
    borderRadius: 3,
    shadowOpacity: 0.55,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 0 },
    elevation: 4
  }
});
