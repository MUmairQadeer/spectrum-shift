import React, { useEffect, useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  Easing,
  interpolateColor,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { COLOR_SEQUENCE, PLATFORM_HEIGHT, PLATFORM_RADIUS } from "../utils/constants";
import { PALETTE, withOpacity } from "../utils/colors";

interface PlatformProps {
  colorIndex: number;
  width: number;
  disabled: boolean;
  onTap: () => void;
}

const colorInputRange = COLOR_SEQUENCE.map((_, index) => index);
const platformTintColors = COLOR_SEQUENCE.map((color) => withOpacity(color, 0.24));

export const Platform = ({ colorIndex, width, disabled, onTap }: PlatformProps) => {
  const progress = useSharedValue(colorIndex);
  const labelPulse = useSharedValue(1);

  useEffect(() => {
    progress.value = withTiming(colorIndex, {
      duration: 150,
      easing: Easing.out(Easing.quad)
    });
  }, [colorIndex, progress]);

  useEffect(() => {
    labelPulse.value = withRepeat(
      withTiming(1.08, { duration: 880, easing: Easing.inOut(Easing.quad) }),
      -1,
      true
    );
  }, [labelPulse]);

  const platformAnimatedStyle = useAnimatedStyle(() => {
    const color = interpolateColor(progress.value, colorInputRange, COLOR_SEQUENCE as unknown as string[]);
    const tint = interpolateColor(progress.value, colorInputRange, platformTintColors as unknown as string[]);
    return {
      borderColor: color,
      shadowColor: color,
      backgroundColor: tint
    };
  });

  const dotAnimatedStyle = useAnimatedStyle(() => {
    const color = interpolateColor(progress.value, colorInputRange, COLOR_SEQUENCE as unknown as string[]);
    return {
      backgroundColor: color,
      shadowColor: color
    };
  });

  const labelAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: labelPulse.value }],
    opacity: 0.7 + ((labelPulse.value - 1) * 5) / 10
  }));

  const tapGesture = useMemo(
    () =>
      Gesture.Tap().onEnd(() => {
        if (disabled) return;
        runOnJS(onTap)();
      }),
    [disabled, onTap]
  );

  return (
    <View style={styles.wrapper}>
      <GestureDetector gesture={tapGesture}>
        <Animated.View style={[styles.container, { width, height: PLATFORM_HEIGHT }, platformAnimatedStyle]}>
          <LinearGradient
            colors={["rgba(255,255,255,0.22)", "rgba(255,255,255,0.08)"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFillObject}
          />
          <Animated.View style={[styles.dot, dotAnimatedStyle]} />
        </Animated.View>
      </GestureDetector>
      <Animated.Text style={[styles.label, labelAnimatedStyle]}>TAP TO SHIFT COLOR</Animated.Text>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    alignItems: "center",
    justifyContent: "center"
  },
  container: {
    borderRadius: PLATFORM_RADIUS,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    shadowOpacity: 0.48,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 0 },
    elevation: 10
  },
  dot: {
    width: 44,
    height: 44,
    borderRadius: 22,
    shadowOpacity: 0.5,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 12,
    elevation: 8
  },
  label: {
    marginTop: 14,
    color: PALETTE.secondaryText,
    fontFamily: "Inter_700Bold",
    fontSize: 13,
    letterSpacing: 2.1,
    fontWeight: "700"
  }
});
