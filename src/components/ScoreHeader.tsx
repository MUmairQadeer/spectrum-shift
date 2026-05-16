import React, { useEffect } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { useAnimatedStyle, useSharedValue } from "react-native-reanimated";
import { triggerPop } from "../animations/popAnimation";
import { HEADER_CARD_RADIUS } from "../utils/constants";
import { PALETTE } from "../utils/colors";
import { LivesIndicator } from "./LivesIndicator";

interface ScoreHeaderProps {
  score: number;
  highScore: number;
  lives: number;
  pulseToken: number;
  onPausePress: () => void;
}

export const ScoreHeader = ({
  score,
  highScore,
  lives,
  pulseToken,
  onPausePress
}: ScoreHeaderProps) => {
  const scoreScale = useSharedValue(1);

  useEffect(() => {
    if (score === 0) return;
    triggerPop(scoreScale);
  }, [score, scoreScale]);

  const scoreAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scoreScale.value }]
  }));

  return (
    <View style={styles.container}>
      <View style={styles.leftGroup}>
        <LinearGradient
          colors={["rgba(255,255,255,0.15)", "rgba(255,255,255,0.06)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.card}
        >
          <Text style={styles.cardLabel}>Score</Text>
          <Animated.Text style={[styles.cardValue, scoreAnimatedStyle]}>{score}</Animated.Text>
        </LinearGradient>

        <LinearGradient
          colors={["rgba(255,255,255,0.12)", "rgba(255,255,255,0.05)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.card}
        >
          <Text style={styles.cardLabel}>High</Text>
          <Text style={styles.highValue}>{highScore}</Text>
        </LinearGradient>
      </View>

      <View style={styles.rightGroup}>
        <LivesIndicator lives={lives} pulseToken={pulseToken} />
        <Pressable onPress={onPausePress} style={styles.pauseButton} hitSlop={6}>
          <Text style={styles.pauseText}>II</Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 10
  },
  leftGroup: {
    flexDirection: "row",
    gap: 10
  },
  rightGroup: {
    alignItems: "flex-end",
    gap: 12
  },
  card: {
    minWidth: 112,
    borderRadius: HEADER_CARD_RADIUS,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 14,
    paddingVertical: 10
  },
  cardLabel: {
    fontSize: 12,
    color: PALETTE.secondaryText,
    fontFamily: "Inter_500Medium",
    fontWeight: "600",
    marginBottom: 4
  },
  cardValue: {
    fontSize: 36,
    lineHeight: 40,
    color: PALETTE.neonCyan,
    fontFamily: "Inter_900Black",
    fontWeight: "800",
    textShadowColor: "rgba(0,255,204,0.72)",
    textShadowRadius: 10,
    textShadowOffset: { width: 0, height: 0 }
  },
  highValue: {
    fontSize: 21,
    color: "#CCCCCC",
    fontFamily: "Inter_700Bold",
    fontWeight: "600"
  },
  pauseButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderColor: "rgba(255,255,255,0.45)",
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.08)"
  },
  pauseText: {
    color: PALETTE.primaryText,
    fontFamily: "Inter_800ExtraBold",
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 1
  }
});
