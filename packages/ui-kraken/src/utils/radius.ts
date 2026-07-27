/**
 * Shared `radius` prop shape accepted by every component that renders
 * through a Tamagui styled primitive (Button, Alert, Input,
 * CurrencyInput, RadioGroup, MultiSelect, StatCard, SocialButton,
 * Collapsible).
 *
 * `Skeleton` intentionally does NOT use this — it renders a plain RN
 * `<View>`, not a Tamagui styled component, so it needs concrete
 * numeric radius values pulled from `useUIKit().tokens.radius` instead
 * of the `$uiRadius*` Tamagui theme tokens returned here.
 */
export type RadiusValue = number | "none" | "sm" | "md" | "lg" | "pill";

/**
 * Map the `radius` shorthand onto a value the `borderRadius` prop on
 * a Tamagui styled component accepts:
 *
 * - `number` pass-through
 * - `"none"` → `0`
 * - `"pill"` → `9999` (RN clamps to `min(width, height) / 2`)
 * - Named preset (`"sm"` / `"md"` / `"lg"`) → the `$uiRadius{PascalCase}`
 *   Tamagui theme token so the resolved value follows the consumer's
 *   coarse `radius` knob on `<UIKitProvider>`.
 *
 * Overloaded so callers that pass a definite `RadiusValue` get a
 * definite return type, while callers that pass `RadiusValue |
 * undefined` (e.g. `Button` where an unset `radius` lets the size
 * variant's default win) get `number | string | undefined`.
 */
export function resolveRadius(radius: RadiusValue): number | string;
export function resolveRadius(radius: RadiusValue | undefined): number | string | undefined;
export function resolveRadius(radius: RadiusValue | undefined): number | string | undefined {
  if (radius === undefined) return undefined;
  if (typeof radius === "number") return radius;
  if (radius === "none") return 0;
  if (radius === "pill") return 9999;
  const map: Record<Exclude<RadiusValue, "none" | "pill" | number>, string> = {
    sm: "$uiRadiusSm",
    md: "$uiRadiusMd",
    lg: "$uiRadiusLg",
  };
  return map[radius];
}

/**
 * Numeric-only variant of `resolveRadius` for components that
 * pass `borderRadius` to a plain RN `<View>` / `Animated.View` —
 * those don't understand Tamagui theme tokens (`$uiRadiusMd`
 * etc.), so the named presets have to resolve to actual numbers
 * pulled from `useUIKit().tokens.radius`.
 *
 * Used by `SegmentedControl`'s Android body (the sliding pill
 * overlay is a plain `Animated.View`) and `Skeleton` (renders a
 * bare RN `<View>` for animation cost). Every other radius-
 * aware component uses `resolveRadius` because Tamagui styled
 * primitives consume the token strings directly.
 *
 * @example
 * const { tokens } = useUIKit();
 * const radius = resolveRadiusNumeric(props.radius ?? "pill", tokens.radius);
 * <Animated.View style={{ borderRadius: radius }} />
 */
export function resolveRadiusNumeric(
  radius: RadiusValue,
  radiusTokens: { sm: number; md: number; lg: number }
): number {
  if (typeof radius === "number") return radius;
  if (radius === "none") return 0;
  if (radius === "pill") return 9999;
  return radiusTokens[radius];
}
