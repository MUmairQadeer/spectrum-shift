import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { PALETTE } from "../utils/colors";

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends React.Component<Props, State> {
  public constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  public static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  public componentDidCatch(): void {
    // Keep fallback UI stable while avoiding hard crashes in production sessions.
  }

  public render(): React.ReactNode {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Text style={styles.title}>Something went wrong</Text>
          <Text style={styles.subtitle}>Please restart the game.</Text>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PALETTE.backgroundStart,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24
  },
  title: {
    color: PALETTE.primaryText,
    fontSize: 24,
    fontWeight: "800"
  },
  subtitle: {
    marginTop: 8,
    color: "#B9B9C7",
    fontSize: 16
  }
});
