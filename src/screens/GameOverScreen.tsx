import React, { memo, useEffect, useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { createConfettiPieces, type ConfettiPiece } from "../animations/confettiAnimation";
import { COLOR_SEQUENCE } from "../utils/constants";
import { PALETTE } from "../utils/colors";
import type { RootStackParamList } from "../types/navigation";
import { useResponsiveLayout } from "../hooks/useResponsiveLayout";

type Props = NativeStackScreenProps<RootStackParamList, "GameOver">;

interface FallingConfettiProps {
  piece: ConfettiPiece;
  height: number;
}

const FallingConfetti = memo(({ piece, height }: FallingConfettiProps) => {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(
      piece.delay,
      withTiming(1, {
        duration: 1700,
        easing: Easing.in(Easing.quad)
      })
    );
  }, [piece.delay, progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: progress.value * height },
      { rotate: `${piece.tilt + progress.value * 360}deg` }
    ],
    opacity: 1 - progress.value * 0.1
  }));

  return (
    <Animated.View
      style={[
        styles.confettiPiece,
        {
          left: piece.x,
          backgroundColor: piece.color
        },
        animatedStyle
      ]}
    />
  );
});

export const GameOverScreen = ({ navigation, route }: Props) => {
  const { score, highScore, isNewHighScore } = route.params;
  const { width, height, scale } = useResponsiveLayout();
  const modalScale = useSharedValue(0.86);
  const modalOpacity = useSharedValue(0);

  useEffect(() => {
    modalScale.value = withTiming(1, { duration: 340, easing: Easing.out(Easing.cubic) });
    modalOpacity.value = withTiming(1, { duration: 300, easing: Easing.out(Easing.quad) });
  }, [modalOpacity, modalScale]);

  const confettiPieces = useMemo(
    () => (isNewHighScore ? createConfettiPieces(34, width, COLOR_SEQUENCE) : []),
    [isNewHighScore, width]
  );

  const modalAnimatedStyle = useAnimatedStyle(() => ({
    opacity: modalOpacity.value,
    transform: [{ scale: modalScale.value }]
  }));

  return (
    <LinearGradient colors={[PALETTE.backgroundStart, PALETTE.backgroundEnd]} style={styles.flex}>
      <SafeAreaView style={styles.flex}>
        <BlurView intensity={35} tint="dark" style={StyleSheet.absoluteFillObject} />
        {confettiPieces.map((piece) => (
          <FallingConfetti key={piece.id} piece={piece} height={height + 80} />
        ))}

        <View style={styles.center}>
          <Animated.View style={[styles.modal, modalAnimatedStyle]}>
            <LinearGradient
              colors={["rgba(255,255,255,0.14)", "rgba(255,255,255,0.06)"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFillObject}
            />
            <Text style={[styles.gameOverText, { fontSize: scale(32) }]}>GAME OVER</Text>
            <Text style={styles.scoreLabel}>Final Score</Text>
            <Text style={[styles.scoreValue, { fontSize: scale(54) }]}>{score}</Text>
            <Text style={styles.highScoreText}>High Score: {highScore}</Text>
            {isNewHighScore ? <Text style={styles.newHighScoreBadge}>NEW HIGH SCORE</Text> : null}

            <Pressable style={styles.primaryButton} onPress={() => navigation.replace("Game")}>
              <Text style={styles.primaryButtonText}>Play Again</Text>
            </Pressable>
            <Pressable style={styles.secondaryButton} onPress={() => navigation.replace("Start")}>
              <Text style={styles.secondaryButtonText}>Home</Text>
            </Pressable>
          </Animated.View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  flex: {
    flex: 1
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24
  },
  modal: {
    width: "100%",
    borderRadius: 28,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.28)",
    paddingHorizontal: 24,
    paddingVertical: 28,
    overflow: "hidden",
    alignItems: "center",
    backgroundColor: "rgba(19,19,35,0.82)"
  },
  gameOverText: {
    color: "#FF6633",
    fontFamily: "Inter_900Black",
    fontWeight: "900",
    letterSpacing: 1.4,
    textShadowColor: "rgba(255,102,51,0.45)",
    textShadowRadius: 14,
    textShadowOffset: { width: 0, height: 0 }
  },
  scoreLabel: {
    marginTop: 18,
    fontFamily: "Inter_500Medium",
    fontSize: 14,
    letterSpacing: 1.4,
    color: PALETTE.secondaryText
  },
  scoreValue: {
    marginTop: 4,
    color: PALETTE.primaryText,
    fontFamily: "Inter_900Black",
    fontWeight: "900"
  },
  highScoreText: {
    marginTop: 4,
    color: "#D0D0DA",
    fontFamily: "Inter_700Bold",
    fontSize: 18
  },
  newHighScoreBadge: {
    marginTop: 14,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
    color: "#082221",
    fontFamily: "Inter_800ExtraBold",
    backgroundColor: PALETTE.neonCyan,
    fontWeight: "800",
    letterSpacing: 0.8,
    overflow: "hidden"
  },
  primaryButton: {
    marginTop: 24,
    width: "100%",
    minHeight: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: PALETTE.neonCyan
  },
  primaryButtonText: {
    color: "#062E27",
    fontFamily: "Inter_800ExtraBold",
    fontSize: 17,
    fontWeight: "800"
  },
  secondaryButton: {
    marginTop: 12,
    width: "100%",
    minHeight: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.28)",
    backgroundColor: "rgba(255,255,255,0.06)"
  },
  secondaryButtonText: {
    color: PALETTE.primaryText,
    fontFamily: "Inter_700Bold",
    fontSize: 16,
    fontWeight: "700"
  },
  confettiPiece: {
    position: "absolute",
    top: -16,
    width: 6,
    height: 14,
    borderRadius: 2
  }
});
