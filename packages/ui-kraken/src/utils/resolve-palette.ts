/**
 * Generic flat-slot palette merger used at render time by every
 * component whose color block on the token schema is a flat
 * slot-based interface (no per-variant nesting).
 *
 * Usage:
 *
 * ```ts
 * const palette = resolvePalette(tokens.surfaceColors, surfaceColors);
 * ```
 *
 * Semantics:
 *
 * - When `override` is `undefined`, returns the `base` reference
 *   unchanged (no allocation, no property copy — cheap on the render
 *   path).
 * - Otherwise returns a new object with `override`'s defined slots
 *   layered on top of `base`. Missing slots on the override fall
 *   through.
 *
 * Not to be confused with `merge<X>Colors` in `tokens/defaults/*.ts`:
 * those run once inside the provider `useMemo` to fold consumer's
 * partial provider-level overrides into the shipped defaults. This
 * util runs on every component render to fold a per-instance
 * `<X>Colors?` prop on top of the already-provider-resolved palette.
 * Both operations look identical for flat palettes; the semantic
 * separation matters when a future component grows nested variant
 * handling and needs a different resolver at either layer.
 *
 * Components with nested per-variant palettes (Alert / Hint /
 * StatCard / SocialButton) keep their local `resolvePalette` because
 * the signature there picks the variant first and only then merges
 * the flat sub-object.
 */
export function resolvePalette<T extends object>(base: T, override: Partial<T> | undefined): T {
  if (override == null) return base;
  return { ...base, ...override };
}
