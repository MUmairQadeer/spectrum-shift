import React, { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue } from "react-native-reanimated";
import { triggerShake } from "../animations/shakeAnimation";
import { PALETTE } from "../utils/colors";

interface LivesIndicatorProps {
  lives: number;
  maxLives?: number;
  pulseToken: number;
}

export const LivesIndicator = ({ lives, maxLives = 3, pulseToken }: LivesIndicatorProps) => {
  const shake = useSharedValue(0);

  useEffect(() => {
    if (pulseToken <= 0) return;
    triggerShake(shake, 8);
  }, [pulseToken, shake]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shake.value }]
  }));

  return (
    <Animated.View style={[styles.row, animatedStyle]}>
      {Array.from({ length: maxLives }, (_, index) => {
        const active = index < lives;
        return (
          <Text key={`life-${index}`} style={[styles.heart, !active && styles.heartInactive]}>
            {active ? "●" : "○"}
          </Text>
        );
      })}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7
  },
  heart: {
    fontSize: 18,
    fontFamily: "Inter_800ExtraBold",
    color: PALETTE.neonCyan,
    textShadowColor: "rgba(0,255,204,0.8)",
    textShadowRadius: 8,
    textShadowOffset: { width: 0, height: 0 }
  },
  heartInactive: {
    color: "#404052",
    textShadowRadius: 0
  }
});
