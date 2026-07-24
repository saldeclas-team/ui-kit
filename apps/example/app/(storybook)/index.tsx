// Re-exports the Storybook root component as a normal Expo Router screen.
// The root `_layout.tsx` guards this route behind `EXPO_PUBLIC_STORYBOOK_ENABLED`
// via `Stack.Protected`.
export { default } from "../../.rnstorybook";
