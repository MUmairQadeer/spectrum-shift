import { Easing, SharedValue, withSequence, withTiming } from "react-native-reanimated";

export const triggerPop = (value: SharedValue<number>): void => {
  value.value = withSequence(
    withTiming(1.2, { duration: 90, easing: Easing.out(Easing.cubic) }),
    withTiming(1, { duration: 120, easing: Easing.out(Easing.quad) })
  );
};
