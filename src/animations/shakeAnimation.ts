import {
  Easing,
  SharedValue,
  withRepeat,
  withSequence,
  withTiming
} from "react-native-reanimated";

export const triggerShake = (
  value: SharedValue<number>,
  intensity = 10
): void => {
  value.value = withSequence(
    withTiming(-intensity, { duration: 45, easing: Easing.linear }),
    withRepeat(
      withTiming(intensity, { duration: 75, easing: Easing.linear }),
      4,
      true
    ),
    withTiming(0, { duration: 55, easing: Easing.out(Easing.quad) })
  );
};
