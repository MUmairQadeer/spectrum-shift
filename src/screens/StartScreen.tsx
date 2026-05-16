import React, { useCallback, useEffect, useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { LinearGradient } from "expo-linear-gradient";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { PALETTE } from "../utils/colors";
import type { RootStackParamList } from "../types/navigation";
import { useResponsiveLayout } from "../hooks/useResponsiveLayout";

type Props = NativeStackScreenProps<RootStackParamList, "Start"> & {
  highScore: number;
};

export const StartScreen = ({ navigation, highScore }: Props) => {
  const { scale } = useResponsiveLayout();
  const buttonScale = useSharedValue(1);
  const logoLift = useSharedValue(0);
  const goToGame = useCallback(() => {
    navigation.replace("Game");
  }, [navigation]);

  useEffect(() => {
    buttonScale.value = withRepeat(
      withSequence(
        withTiming(1.04, { duration: 820, easing: Easing.inOut(Easing.quad) }),
        withTiming(1, { duration: 820, easing: Easing.inOut(Easing.quad) })
      ),
      -1,
      false
    );

    logoLift.value = withRepeat(
      withSequence(
        withTiming(-8, { duration: 2200, easing: Easing.inOut(Easing.quad) }),
        withTiming(0, { duration: 2200, easing: Easing.inOut(Easing.quad) })
      ),
      -1,
      false
    );
  }, [buttonScale, logoLift]);

  const buttonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }]
  }));

  const logoStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: logoLift.value }]
  }));

  const tapGesture = useMemo(
    () =>
      Gesture.Tap().onEnd(() => {
        runOnJS(goToGame)();
      }),
    [goToGame]
  );

  return (
    <LinearGradient colors={[PALETTE.backgroundStart, PALETTE.backgroundEnd]} style={styles.flex}>
      <SafeAreaView style={styles.flex}>
        <View style={styles.container}>
          <Animated.View style={[styles.logoWrap, logoStyle]}>
            <Text style={[styles.title, { fontSize: scale(44) }]}>SPECTRUM</Text>
            <Text style={[styles.title, styles.titleAccent, { fontSize: scale(44) }]}>SHIFT</Text>
            <Text style={styles.subtitle}>Color Stacker</Text>
          </Animated.View>

          <View style={styles.metaCard}>
            <Text style={styles.metaLabel}>HIGH SCORE</Text>
            <Text style={[styles.metaValue, { fontSize: scale(28) }]}>{highScore}</Text>
          </View>

          <GestureDetector gesture={tapGesture}>
            <Animated.View style={[styles.startButton, buttonStyle]}>
              <LinearGradient
                colors={["rgba(0,255,204,0.92)", "rgba(0,180,255,0.9)"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.startGradient}
              >
                <Text style={styles.startText}>Tap to Start</Text>
              </LinearGradient>
            </Animated.View>
          </GestureDetector>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  flex: {
    flex: 1
  },
  container: {
    flex: 1,
    justifyContent: "space-evenly",
    alignItems: "center",
    paddingHorizontal: 24
  },
  logoWrap: {
    alignItems: "center"
  },
  title: {
    color: "#FFFFFF",
    fontFamily: "Inter_900Black",
    fontWeight: "900",
    letterSpacing: 2,
    textShadowColor: "rgba(0,255,204,0.45)",
    textShadowRadius: 16,
    textShadowOffset: { width: 0, height: 0 }
  },
  titleAccent: {
    color: "#FFCC00"
  },
  subtitle: {
    marginTop: 8,
    color: "#C8CAD3",
    fontFamily: "Inter_700Bold",
    fontSize: 16,
    letterSpacing: 1.6,
    fontWeight: "600"
  },
  metaCard: {
    width: "78%",
    paddingVertical: 18,
    borderRadius: 22,
    borderColor: "rgba(255,255,255,0.25)",
    borderWidth: 1,
    backgroundColor: "rgba(255,255,255,0.08)",
    alignItems: "center"
  },
  metaLabel: {
    color: PALETTE.secondaryText,
    fontFamily: "Inter_500Medium",
    fontSize: 12,
    letterSpacing: 1.5
  },
  metaValue: {
    marginTop: 8,
    color: PALETTE.primaryText,
    fontFamily: "Inter_800ExtraBold",
    fontWeight: "800"
  },
  startButton: {
    width: 250,
    minHeight: 56,
    borderRadius: 28,
    overflow: "hidden",
    shadowColor: PALETTE.neonCyan,
    shadowOpacity: 0.52,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 0 },
    elevation: 9
  },
  startGradient: {
    width: "100%",
    minHeight: 56,
    alignItems: "center",
    justifyContent: "center"
  },
  startText: {
    color: "#06262A",
    fontFamily: "Inter_800ExtraBold",
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: 0.5
  }
});
