---
"ui-kraken": minor
---

feat(alert): ship the `Alert` primitive — the third public component

Contextual feedback surface for informational, success, warning, and destructive states. Common uses: form errors, empty-state hints, success confirmations, deprecation notices, inline callouts.

**4 semantic variants:** `info` / `success` / `warning` / `danger` — vocabulary matches `KrakenTextColors` so one semantic slot has one name across the kit.

**Compound API:** `Alert.Info`, `Alert.Success`, `Alert.Warning`, `Alert.Danger` — PascalCase shortcuts, same pattern as `Button.Primary` and `Text.H1`. The plain `<Alert>` still works with the `variant` prop and defaults to `"info"`.

**Content model:** optional `title` + `children` (any ReactNode — plain string or nested `<Text>` for rich content like inline links) + optional `icon` slot (consumer brings their own icon system; no dep on an icon library).

**Colors:** reuses the existing `textColors` block on `KrakenProvider` — no new token schema. Each variant maps to a `textColors` slot (info → `textColors.info`, danger → `textColors.danger`, etc.). Background is computed at runtime as the variant color at ~15% opacity.

**Per-instance override:** `alertColors?: Partial<{ background?, border?, text, icon }>` — scoped to the resolved variant. Missing slots fall through to the palette. Enables brand-color alerts without extending the provider palette.

**Radius:** `radius?: number | "none" | "sm" | "md" | "lg" | "pill"` — same shape as `Button.radius`. Default `"md"`.

**Accessibility:** every variant sets `accessibilityRole="alert"`. `accessibilityLiveRegion` is `"assertive"` for `danger` (interrupts) and `"polite"` for the other three.

**Every Tamagui style prop flows through** the `...rest` spread — none are re-declared on `AlertProps`. `padding`, `margin`, `pressStyle`, shorthand aliases (`px`, `py`, `bg`, etc.) all just work with types inferred from `GetProps<typeof StyledAlert>`.

Test coverage: **22 spec tests + 19 structural snapshots**. Total repo: 163 tests / 85 snapshots (up from 122 / 66).

See [`docs/ALERT-PLAN.md`](../docs/ALERT-PLAN.md) for the full design record.
