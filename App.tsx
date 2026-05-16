import "react-native-gesture-handler";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import {
  Inter_500Medium,
  Inter_700Bold,
  Inter_800ExtraBold,
  Inter_900Black,
  useFonts
} from "@expo-google-fonts/inter";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ErrorBoundary } from "./src/components/ErrorBoundary";
import { GameOverScreen } from "./src/screens/GameOverScreen";
import { GameScreen } from "./src/screens/GameScreen";
import { StartScreen } from "./src/screens/StartScreen";
import type { RootStackParamList } from "./src/types/navigation";
import { PALETTE } from "./src/utils/colors";
import { getStoredHighScore, storeHighScore } from "./src/utils/storage";

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const [highScore, setHighScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [fontsLoaded] = useFonts({
    Inter_500Medium,
    Inter_700Bold,
    Inter_800ExtraBold,
    Inter_900Black
  });

  useEffect(() => {
    const load = async () => {
      const stored = await getStoredHighScore();
      setHighScore(stored);
      setLoading(false);
    };
    void load();
  }, []);

  if (loading || !fontsLoaded) {
    return (
      <View style={styles.loadingWrap}>
        <StatusBar style="light" />
        <ActivityIndicator size="large" color={PALETTE.neonCyan} />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={styles.flex}>
      <SafeAreaProvider>
        <StatusBar style="light" />
        <ErrorBoundary>
          <NavigationContainer>
            <Stack.Navigator
              initialRouteName="Start"
              screenOptions={{
                headerShown: false,
                animation: "fade"
              }}
            >
              <Stack.Screen name="Start">{(props) => <StartScreen {...props} highScore={highScore} />}</Stack.Screen>
              <Stack.Screen name="Game">
                {(props) => (
                  <GameScreen
                    {...props}
                    highScore={highScore}
                    onGameEnd={async (finalScore) => {
                      const isNewHighScore = finalScore > highScore;
                      const resolvedHighScore = isNewHighScore ? finalScore : highScore;

                      if (isNewHighScore) {
                        setHighScore(finalScore);
                        await storeHighScore(finalScore);
                      }

                      props.navigation.replace("GameOver", {
                        score: finalScore,
                        highScore: resolvedHighScore,
                        isNewHighScore
                      });
                    }}
                  />
                )}
              </Stack.Screen>
              <Stack.Screen name="GameOver" component={GameOverScreen} />
            </Stack.Navigator>
          </NavigationContainer>
        </ErrorBoundary>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1
  },
  loadingWrap: {
    flex: 1,
    backgroundColor: PALETTE.backgroundStart,
    alignItems: "center",
    justifyContent: "center"
  }
});
