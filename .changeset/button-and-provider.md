---
"ui-kraken": minor
---

Add `KrakenProvider`, `useKraken`, the `KrakenTokens` schema, and the first
component: `Button`.

**Provider layer**

- `KrakenProvider` mounts `TamaguiProvider` + `PortalProvider` and exposes a
  coarse token schema (`primaryColor`, `secondaryColor`, `textPrimaryColor`,
  `textSecondaryColor`, `radius`, `spacing`) via context.
- `useKraken()` returns both the resolved tokens and the raw Tamagui config,
  so power users can drop down to Tamagui APIs without ejecting.
- Sensible defaults (blue-600 `#2563EB`) let you mount `<KrakenProvider>` with
  zero props.

**Tokens layer**

- Ships `buildKrakenConfig`, `coarseToFineTokens`, `tint`, and
  `DEFAULT_KRAKEN_TOKENS` as public utilities so consumers can build custom
  tamagui configs off the same primitives ui-kraken uses internally.
- All library-owned Tamagui tokens are namespaced under the `$kraken*` prefix
  to avoid clobbering `@tamagui/config/v4` defaults.

**Button**

- Compound API: `Button.Primary`, `Button.Secondary`, `Button.Ghost`,
  `Button.Destructive`. Top-level `Button` aliases `Button.Primary` for the
  80% case (`<Button>Save</Button>`).
- Sizes: `sm` / `md` / `lg`. States: `disabled` / `loading`. Slots:
  `leftIcon` / `rightIcon`.
- Per-instance color overrides via grouped role props: `buttonColors`,
  `textColors`, `iconColors` — each keyed by variant/state (`primary`,
  `secondary`, `disabled`, `loading`).
- Full accessibility: `accessibilityRole="button"`, `accessibilityState`,
  minimum 48 × 48 px touch target, `pressStyle` feedback.
