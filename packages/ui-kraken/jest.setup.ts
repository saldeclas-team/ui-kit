// @testing-library/react-native v12+ ships its matchers directly (the
// standalone @testing-library/jest-native package is deprecated).
import * as matchers from "@testing-library/react-native/matchers";

expect.extend(matchers);

// Reanimated v4 shipped mock (`react-native-reanimated/mock`) still
// pulls in `react-native-worklets` at import time and crashes under
// jest-expo with `Cannot read properties of undefined (reading
// 'loadUnpackers')`. We ship a hand-rolled minimal mock that stubs
// the reanimated API used by ui-kraken components (repo policy bans
// plain RN `Animated` in favor of reanimated — see AGENTS.md
// § Animation).
//
// Every stub runs synchronously on the JS thread — animations resolve
// to their end state immediately, which is exactly what tests want.
jest.mock("react-native-reanimated", () => {
  const React = require("react");

  const rn = require("react-native");

  const identityWorklet = <T>(value: T): T => value;

  const useSharedValue = <T>(initial: T) => {
    const ref = React.useRef({ value: initial });
    return ref.current;
  };

  const useAnimatedStyle = (updater: () => object) => updater();

  const withTiming = <T>(
    toValue: T,
    _config?: unknown,
    callback?: (finished?: boolean) => void
  ) => {
    callback?.(true);
    return toValue;
  };
  const withRepeat = <T>(anim: T, _iterations?: number, _reverse?: boolean) => anim;
  const withSequence = <T>(...anims: T[]) => anims[anims.length - 1];
  const withDelay = <T>(_delayMs: number, anim: T) => anim;
  const withSpring = <T>(toValue: T) => toValue;
  const withDecay = (_config: unknown, callback?: (finished?: boolean) => void) => {
    callback?.(true);
    return 0;
  };
  const cancelAnimation = () => undefined;
  const runOnJS = <TArgs extends unknown[], TReturn>(fn: (...args: TArgs) => TReturn) => fn;
  const runOnUI = <TArgs extends unknown[], TReturn>(fn: (...args: TArgs) => TReturn) => fn;

  const AnimatedView = React.forwardRef((props: object, ref: unknown) =>
    React.createElement(rn.View, { ...props, ref })
  );
  AnimatedView.displayName = "Animated.View";
  const AnimatedText = React.forwardRef((props: object, ref: unknown) =>
    React.createElement(rn.Text, { ...props, ref })
  );
  AnimatedText.displayName = "Animated.Text";

  const Animated = {
    View: AnimatedView,
    Text: AnimatedText,
    createAnimatedComponent: (Component: React.ComponentType) =>
      React.forwardRef((props: object, ref: unknown) =>
        React.createElement(Component, { ...props, ref })
      ),
  };

  return {
    __esModule: true,
    default: Animated,
    ...Animated,
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withRepeat,
    withSequence,
    withDelay,
    withSpring,
    withDecay,
    cancelAnimation,
    runOnJS,
    runOnUI,
    Easing: {
      linear: identityWorklet,
      ease: identityWorklet,
      inOut: (fn: unknown) => fn,
      in: (fn: unknown) => fn,
      out: (fn: unknown) => fn,
      bezier: () => identityWorklet,
    },
    Extrapolation: { CLAMP: "clamp", EXTEND: "extend", IDENTITY: "identity" },
    interpolate: (value: number) => value,
  };
});
