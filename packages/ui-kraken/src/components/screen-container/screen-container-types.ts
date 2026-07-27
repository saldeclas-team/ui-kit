import type { ReactNode } from "react";
import type { ScrollViewProps } from "react-native";

import type { ScreenContainerColors } from "../../tokens/tokens-types";

/**
 * Per-instance color override for a ScreenContainer.
 */
export type ScreenContainerColorsInput = Partial<ScreenContainerColors>;

/**
 * Which safe-area edges to apply padding for. Same shape as
 * `SafeAreaView` from `react-native-safe-area-context`. Consumers
 * with a bottom tab bar typically pass
 * `["top", "left", "right"]` to opt out of the bottom inset (the
 * tab bar owns that space).
 */
export type ScreenContainerEdge = "top" | "bottom" | "left" | "right";

/**
 * Behavior for the internal `<KeyboardAvoidingView>` wrap.
 * `"none"` disables the wrap entirely (default — most screens
 * don't need it).
 *
 * Per platform, the recommended values differ:
 * - iOS: `"padding"` — container grows downward with keyboard
 *   height as padding.
 * - Android: `"height"` — container shrinks to fit above the
 *   keyboard.
 *
 * If you want the conventional split, pass
 * `Platform.OS === "ios" ? "padding" : "height"` inline.
 */
export type ScreenContainerKeyboardBehavior = "none" | "padding" | "height" | "position";

/**
 * Status bar content style.
 *
 * - `"auto"` (default) — flips to `"light-content"` on dark
 *   theme and `"dark-content"` on light theme, based on
 *   `useUIKit().activeTheme`.
 * - `"light"` — always light content (for dark backgrounds).
 * - `"dark"` — always dark content (for light backgrounds).
 */
export type ScreenContainerStatusBarStyle = "auto" | "light" | "dark";

/**
 * Escape-hatch props for the internal `<ScrollView>` (only
 * rendered when `scrollable={true}`). Omits `children` and
 * `testID` — the shell owns those. Everything else on
 * `ScrollViewProps` is exposed (`refreshControl`, `onScroll`,
 * `contentContainerStyle`, `keyboardShouldPersistTaps`,
 * `showsVerticalScrollIndicator`, etc.).
 *
 * Common consumer patterns:
 *
 * - Pull-to-refresh: pass `refreshControl={<RefreshControl ... />}`
 *   using ui-kraken's [[RefreshControl]] (Batch 1).
 * - Form inside a scroll: pass
 *   `keyboardShouldPersistTaps="handled"` so tapping a button
 *   while the keyboard is open doesn't dismiss the tap.
 */
export type ScreenContainerScrollProps = Omit<ScrollViewProps, "children" | "testID">;

/**
 * Public props for `<ScreenContainer>` — the safe-area-aware
 * screen wrapper.
 */
export interface ScreenContainerProps {
  /**
   * Screen content. Renders inside the safe-area padded
   * container (and inside the `<KeyboardAvoidingView>` when
   * `keyboardBehavior !== "none"`).
   */
  children: ReactNode;
  /**
   * When `true`, the container renders a `<ScrollView>` as its
   * inner element instead of a plain `<View>`. Long content
   * scrolls vertically. Default `false`.
   *
   * Combines cleanly with `keyboardBehavior` — the
   * `<KeyboardAvoidingView>` wraps the `<ScrollView>`
   * (KAV-around-scroll, the standard RN pattern).
   *
   * For virtualized lists (`<FlashList>` / `<FlatList>` with
   * many rows) leave this `false` and put the list as the
   * child — the list handles its own scrolling.
   */
  scrollable?: boolean;
  /**
   * Escape-hatch props for the internal `<ScrollView>` (only
   * applied when `scrollable={true}`). See
   * [[ScreenContainerScrollProps]] for the shape. Common uses:
   * `refreshControl`, `onScroll`, `contentContainerStyle`.
   */
  scrollProps?: ScreenContainerScrollProps;
  /**
   * Which safe-area edges to inset. Default: all four
   * (`["top", "bottom", "left", "right"]`). Pass a subset to
   * opt out of specific edges — e.g. `["top", "left", "right"]`
   * for a screen with a bottom tab bar (the tab bar owns the
   * bottom inset).
   */
  edges?: readonly ScreenContainerEdge[];
  /**
   * `<KeyboardAvoidingView>` behavior. Default `"none"` (no
   * wrap). Consumers with forms opt in explicitly with
   * `"padding"` (iOS) / `"height"` (Android).
   */
  keyboardBehavior?: ScreenContainerKeyboardBehavior;
  /**
   * Additional vertical offset for the `<KeyboardAvoidingView>`
   * — passed through as `keyboardVerticalOffset`. Only applies
   * when `keyboardBehavior !== "none"`. Useful when the screen
   * sits below a navigation header of known height.
   */
  keyboardVerticalOffset?: number;
  /**
   * Status bar content style. Default `"auto"`.
   */
  statusBarStyle?: ScreenContainerStatusBarStyle;
  /**
   * Per-instance color override. 3 slots — `background`,
   * `statusBarBackground`, `fallbackPadding` (documentation
   * sentinel; not rendered).
   */
  screenContainerColors?: ScreenContainerColorsInput;
  /**
   * Root testID. Sub-elements derive:
   * `-keyboard-avoiding` (present only when
   * `keyboardBehavior !== "none"`).
   */
  testID?: string;
}
