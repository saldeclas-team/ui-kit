---
"ui-kraken": minor
---

Add the `Select` family — three sibling single-choice picker components with the same controlled prop shape but different UX backends. First delivery of Batch 2 Phase A.

- **`Select`** — pure JS + `react-native` `Modal`. Centered card popup, cross-platform consistent, zero peer dependencies. Own `selectColors` block on the token schema (16 slots). Full theming control over trigger + modal chrome + selected-option highlight.
- **`SelectNative`** — SwiftUI `Menu` on iOS / Compose `DropdownMenu` on Android via `@expo/ui` (optional peer). Fully-native affordance with platform haptics and chrome. Own `selectNativeColors` block (7 slots — trimmed because the native picker owns its interior chrome). Placeholder-item injection so `value=null` opens reliably on Android.
- **`SelectBottomSheet`** — draggable bottom-sheet picker via `@gorhom/bottom-sheet` + `react-native-gesture-handler` (both optional peers). Configurable snap points, optional sheet title, drag-to-dismiss. Own `selectBottomSheetColors` block (15 slots). Requires the consumer to mount `<BottomSheetModalProvider>` at the app root.

All three components:

- Are generic in the value type (`SelectNative` accepts `string | number`, the other two accept `string`).
- Share the same prop shape (`options`, `value`, `onChange`, `label`, `helperText`, `errorText`, `disabled`, per-option `disabledOptions` where the backend supports it) so consumers can swap between them by changing the import name.
- Follow the "each component owns its color space" rule — three separate palette blocks, no shared slots.
- Fall back gracefully when their optional peer dep is missing: the frame renders a helpful "install X" hint colored with the `errorText` slot instead of crashing the app. Same pattern as `ExternalLink` from Batch 1.

New provider-input types alongside the components: `SelectColorsInput`, `SelectNativeColorsInput`, `SelectBottomSheetColorsInput`. Default light + dark palettes shipped for all three blocks. Additive to the existing token schema — no breaking changes.
