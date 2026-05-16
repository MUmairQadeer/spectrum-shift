import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { LayoutChangeEvent, Pressable, StyleSheet, Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { Block } from "../components/Block";
import { ParticleEffect } from "../components/ParticleEffect";
import { Platform } from "../components/Platform";
import { ScoreHeader } from "../components/ScoreHeader";
import { triggerShake } from "../animations/shakeAnimation";
import { useCollisionDetection } from "../hooks/useCollisionDetection";
import { useGameLoop } from "../hooks/useGameLoop";
import { useResponsiveLayout } from "../hooks/useResponsiveLayout";
import type { Block as BlockModel, ParticleBurst, ScoreFly } from "../types/game";
import type { RootStackParamList } from "../types/navigation";
import { PALETTE, withOpacity } from "../utils/colors";
import {
  COLOR_SEQUENCE,
  FALL_SPEED_PX_PER_SEC,
  MAX_LIVES,
  getColorByIndex,
  getColorNameByIndex,
  getSpawnIntervalForScore,
  randomBetween
} from "../utils/constants";

type Props = NativeStackScreenProps<RootStackParamList, "Game"> & {
  highScore: number;
  onGameEnd: (score: number) => void;
};

interface FlyingScoreProps {
  item: ScoreFly;
  onDone: (id: string) => void;
}

const FlyingScore = memo(({ item, onDone }: FlyingScoreProps) => {
  const x = useSharedValue(item.startX);
  const y = useSharedValue(item.startY);
  const opacity = useSharedValue(1);
  const scale = useSharedValue(0.85);

  useEffect(() => {
    x.value = withTiming(22, { duration: 520, easing: Easing.out(Easing.cubic) });
    y.value = withTiming(0, { duration: 520, easing: Easing.out(Easing.cubic) });
    scale.value = withTiming(1, { duration: 220, easing: Easing.out(Easing.back(1.6)) });
    opacity.value = withTiming(0, { duration: 540, easing: Easing.out(Easing.quad) }, (finished) => {
      if (finished) {
        runOnJS(onDone)(item.id);
      }
    });
  }, [item.id, onDone, opacity, scale, x, y]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateX: x.value }, { translateY: y.value }, { scale: scale.value }]
  }));

  return <Animated.Text style={[styles.flyingScore, animatedStyle]}>+{item.value}</Animated.Text>;
});

export const GameScreen = ({ navigation, onGameEnd, highScore }: Props) => {
  const { width, height, blockSize, platformWidth, isLandscape } = useResponsiveLayout();
  const { isColorMatch } = useCollisionDetection();

  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(MAX_LIVES);
  const [colorIndex, setColorIndex] = useState(0);
  const [blocks, setBlocks] = useState<BlockModel[]>([]);
  const [particles, setParticles] = useState<ParticleBurst[]>([]);
  const [flyingScores, setFlyingScores] = useState<ScoreFly[]>([]);
  const [combo, setCombo] = useState(0);
  const [showCombo, setShowCombo] = useState(false);
  const [pauseVisible, setPauseVisible] = useState(false);
  const [lifePulseToken, setLifePulseToken] = useState(0);
  const [gameAreaSize, setGameAreaSize] = useState({ width: Math.max(1, width), height: Math.max(1, height * 0.56) });

  const scoreRef = useRef(score);
  const livesRef = useRef(lives);
  const colorIndexRef = useRef(colorIndex);
  const sessionRef = useRef(1);
  const endGuard = useRef(false);
  const idCounter = useRef(0);
  const comboTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const screenShake = useSharedValue(0);
  const edgeFlash = useSharedValue(0);

  useEffect(() => {
    scoreRef.current = score;
  }, [score]);

  useEffect(() => {
    livesRef.current = lives;
  }, [lives]);

  useEffect(() => {
    colorIndexRef.current = colorIndex;
  }, [colorIndex]);

  useEffect(
    () => () => {
      if (comboTimeoutRef.current) {
        clearTimeout(comboTimeoutRef.current);
      }
    },
    []
  );

  // Extend travel slightly so blocks visually make contact with the platform before resolving.
  const gameAreaTravel = Math.max(1, gameAreaSize.height - blockSize + 2);
  const fallDurationMs = Math.max(250, Math.round((gameAreaTravel / FALL_SPEED_PX_PER_SEC) * 1000));
  const spawnInterval = getSpawnIntervalForScore(score);

  const matchHaptics = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTimeout(() => void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium), 55);
    setTimeout(() => void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light), 115);
  }, []);

  const mismatchHaptics = useCallback(() => {
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    setTimeout(() => void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy), 70);
  }, []);

  const spawnBlock = useCallback(() => {
    if (pauseVisible || endGuard.current || livesRef.current <= 0) return;

    const nextId = ++idCounter.current;
    const colorIdx = Math.floor(randomBetween(0, COLOR_SEQUENCE.length));
    const block: BlockModel = {
      id: `s${sessionRef.current}-block-${nextId}`,
      color: getColorByIndex(colorIdx),
      colorName: getColorNameByIndex(colorIdx),
      colorIndex: colorIdx,
      positionX: randomBetween(0.02, 0.98),
      positionY: 0,
      status: "falling"
    };

    setBlocks((prev) => [...prev, block]);
  }, [pauseVisible]);

  useGameLoop({
    isRunning: true,
    isPaused: pauseVisible,
    spawnInterval,
    onSpawn: spawnBlock
  });

  const removeParticle = useCallback((id: string) => {
    setParticles((prev) => prev.filter((particle) => particle.id !== id));
  }, []);

  const removeFlyingScore = useCallback((id: string) => {
    setFlyingScores((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const finishGameIfNeeded = useCallback(
    (nextLives: number) => {
      if (nextLives > 0 || endGuard.current) return;
      endGuard.current = true;
      setPauseVisible(true);
      setTimeout(() => {
        onGameEnd(scoreRef.current);
      }, 360);
    },
    [onGameEnd]
  );

  const handleBlockLanded = useCallback(
    (blockId: string, blockColorIndex: number, positionX: number, positionY: number) => {
      if (endGuard.current) return;
      if (!blockId.startsWith(`s${sessionRef.current}-`)) return;

      setTimeout(() => {
        setBlocks((prev) => prev.filter((block) => block.id !== blockId));
      }, 60);

      const isMatch = isColorMatch(blockColorIndex, colorIndexRef.current);
      const hitX = positionX * Math.max(0, gameAreaSize.width - blockSize) + blockSize / 2;
      const hitY = Math.min(gameAreaSize.height - 2, positionY + blockSize / 2);
      const color = getColorByIndex(blockColorIndex);

      if (isMatch) {
        matchHaptics();
        setScore((prev) => prev + 1);
        setCombo((prev) => {
          const next = prev + 1;
          if (next >= 3) {
            setShowCombo(true);
            if (comboTimeoutRef.current) clearTimeout(comboTimeoutRef.current);
            comboTimeoutRef.current = setTimeout(() => setShowCombo(false), 750);
          }
          return next;
        });
        setParticles((prev) => [
          ...prev,
          {
            id: `particle-${blockId}`,
            x: hitX,
            y: hitY,
            color,
            type: "match"
          }
        ]);
        setFlyingScores((prev) => [
          ...prev,
          {
            id: `score-${blockId}`,
            startX: hitX,
            startY: hitY,
            value: 1
          }
        ]);
        return;
      }

      mismatchHaptics();
      setCombo(0);
      setLifePulseToken((prev) => prev + 1);
      edgeFlash.value = withSequence(
        withTiming(0.34, { duration: 120, easing: Easing.out(Easing.quad) }),
        withTiming(0, { duration: 230, easing: Easing.inOut(Easing.quad) })
      );
      triggerShake(screenShake, 11);

      setParticles((prev) => [
        ...prev,
        {
          id: `particle-${blockId}`,
          x: hitX,
          y: hitY,
          color: "#FF3B30",
          type: "mismatch"
        }
      ]);

      setLives((prev) => {
        const next = Math.max(0, prev - 1);
        finishGameIfNeeded(next);
        return next;
      });
    },
    [
      blockSize,
      edgeFlash,
      finishGameIfNeeded,
      gameAreaSize.height,
      gameAreaSize.width,
      isColorMatch,
      matchHaptics,
      mismatchHaptics,
      screenShake
    ]
  );

  const handleShiftColor = useCallback(() => {
    if (pauseVisible || endGuard.current) return;
    void Haptics.selectionAsync();
    setColorIndex((prev) => (prev + 1) % COLOR_SEQUENCE.length);
  }, [pauseVisible]);

  const handleGameAreaLayout = useCallback((event: LayoutChangeEvent) => {
    const { width: nextWidth, height: nextHeight } = event.nativeEvent.layout;
    setGameAreaSize({
      width: Math.max(1, nextWidth),
      height: Math.max(1, nextHeight)
    });
  }, []);

  const restartGame = useCallback(() => {
    sessionRef.current += 1;
    if (comboTimeoutRef.current) {
      clearTimeout(comboTimeoutRef.current);
      comboTimeoutRef.current = null;
    }
    setPauseVisible(false);
    setScore(0);
    setLives(MAX_LIVES);
    setColorIndex(0);
    setCombo(0);
    setShowCombo(false);
    setBlocks([]);
    setParticles([]);
    setFlyingScores([]);
    scoreRef.current = 0;
    livesRef.current = MAX_LIVES;
    colorIndexRef.current = 0;
    endGuard.current = false;
  }, []);

  const shakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: screenShake.value }]
  }));

  const edgeFlashStyle = useAnimatedStyle(() => ({
    opacity: edgeFlash.value
  }));

  const backgroundAccent = useMemo(() => withOpacity(getColorByIndex(colorIndex), 0.2), [colorIndex]);

  return (
    <LinearGradient colors={[PALETTE.backgroundStart, PALETTE.backgroundEnd]} style={styles.flex}>
      <LinearGradient colors={["transparent", backgroundAccent]} style={StyleSheet.absoluteFillObject} />
      <SafeAreaView style={styles.flex}>
        <Animated.View style={[styles.flex, shakeStyle]}>
          <ScoreHeader
            score={score}
            highScore={Math.max(highScore, score)}
            lives={lives}
            pulseToken={lifePulseToken}
            onPausePress={() => setPauseVisible(true)}
          />

          <View style={styles.comboArea}>
            {showCombo && combo >= 3 ? (
              <Text style={styles.comboText}>COMBO x{combo}</Text>
            ) : (
              <Text style={styles.comboPlaceholder}> </Text>
            )}
          </View>

          <View style={styles.gameAreaWrap}>
            <View onLayout={handleGameAreaLayout} style={styles.gameArea}>
              {blocks.map((block) => (
                <Block
                  key={block.id}
                  block={block}
                  size={blockSize}
                  containerWidth={gameAreaSize.width}
                  travelDistance={gameAreaTravel}
                  fallDurationMs={fallDurationMs}
                  paused={pauseVisible}
                  onLanded={handleBlockLanded}
                />
              ))}

              {particles.map((particle) => (
                <ParticleEffect
                  key={particle.id}
                  id={particle.id}
                  x={particle.x}
                  y={particle.y}
                  color={particle.color}
                  type={particle.type}
                  onDone={removeParticle}
                />
              ))}

              {flyingScores.map((item) => (
                <FlyingScore key={item.id} item={item} onDone={removeFlyingScore} />
              ))}
            </View>
          </View>

          <View style={[styles.platformSection, isLandscape && styles.platformSectionLandscape]}>
            <Platform colorIndex={colorIndex} width={platformWidth} disabled={pauseVisible} onTap={handleShiftColor} />
          </View>
        </Animated.View>

        <Animated.View pointerEvents="none" style={[styles.edgeFlash, edgeFlashStyle]} />

        {pauseVisible ? (
          <View style={styles.pauseOverlay}>
            <BlurView intensity={35} tint="dark" style={styles.pauseCard}>
              <Text style={styles.pauseTitle}>{lives <= 0 ? "GAME OVER" : "PAUSED"}</Text>
              <Pressable
                style={[styles.pausePrimaryButton, lives <= 0 && styles.pauseDisabledButton]}
                onPress={() => {
                  if (lives <= 0) return;
                  setPauseVisible(false);
                }}
                disabled={lives <= 0}
              >
                <Text style={styles.pausePrimaryText}>{lives <= 0 ? "Saving Score..." : "Resume"}</Text>
              </Pressable>
              {lives > 0 ? (
                <>
                  <Pressable style={styles.pauseSecondaryButton} onPress={restartGame}>
                    <Text style={styles.pauseSecondaryText}>Restart</Text>
                  </Pressable>
                  <Pressable style={styles.pauseSecondaryButton} onPress={() => navigation.replace("Start")}>
                    <Text style={styles.pauseSecondaryText}>Home</Text>
                  </Pressable>
                </>
              ) : null}
            </BlurView>
          </View>
        ) : null}
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  flex: {
    flex: 1
  },
  comboArea: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 30
  },
  comboText: {
    color: "#FFE07A",
    fontFamily: "Inter_800ExtraBold",
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: 1.2,
    textShadowColor: "rgba(255,224,122,0.6)",
    textShadowRadius: 10,
    textShadowOffset: { width: 0, height: 0 }
  },
  comboPlaceholder: {
    color: "transparent"
  },
  gameAreaWrap: {
    flex: 1,
    paddingHorizontal: 14,
    paddingBottom: 0
  },
  gameArea: {
    flex: 1,
    borderRadius: 18,
    overflow: "hidden"
  },
  platformSection: {
    minHeight: 126,
    justifyContent: "flex-start",
    alignItems: "center",
    paddingBottom: 8
  },
  platformSectionLandscape: {
    minHeight: 112,
    paddingBottom: 6
  },
  edgeFlash: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 6,
    borderColor: "rgba(255,59,48,0.85)"
  },
  pauseOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30
  },
  pauseCard: {
    width: "100%",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.24)",
    overflow: "hidden",
    paddingHorizontal: 18,
    paddingVertical: 20
  },
  pauseTitle: {
    textAlign: "center",
    color: PALETTE.primaryText,
    fontFamily: "Inter_900Black",
    fontSize: 28,
    fontWeight: "900",
    letterSpacing: 1
  },
  pausePrimaryButton: {
    marginTop: 16,
    minHeight: 52,
    borderRadius: 26,
    backgroundColor: PALETTE.neonCyan,
    alignItems: "center",
    justifyContent: "center"
  },
  pauseDisabledButton: {
    opacity: 0.7
  },
  pausePrimaryText: {
    color: "#03362E",
    fontFamily: "Inter_800ExtraBold",
    fontWeight: "800",
    fontSize: 16
  },
  pauseSecondaryButton: {
    marginTop: 10,
    minHeight: 52,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.26)",
    backgroundColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    justifyContent: "center"
  },
  pauseSecondaryText: {
    color: PALETTE.primaryText,
    fontFamily: "Inter_700Bold",
    fontSize: 15.5,
    fontWeight: "700"
  },
  flyingScore: {
    position: "absolute",
    top: 0,
    left: 0,
    color: PALETTE.neonCyan,
    fontFamily: "Inter_900Black",
    fontSize: 22,
    fontWeight: "900",
    textShadowColor: "rgba(0,255,204,0.8)",
    textShadowRadius: 10,
    textShadowOffset: { width: 0, height: 0 }
  }
});
