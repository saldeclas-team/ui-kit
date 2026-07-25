---
"ui-kraken": minor
---

`SelectNative` — switched the mobile backend from `@expo/ui`'s `Host + Picker` to `MenuView` from `@expo/ui/community/menu`, and split the rendering into platform-specific files.

### Bug fixed

The previous `Host + Picker` combo hit a SwiftUI Menu intrinsic-size measurement race on iOS: a borderless picker rendered OFF-SCREEN inside a scrollable container appeared "raised" (extra invisible whitespace below the trigger) once scrolled into view. Documented as a known bug in the previous release. Root cause was `<Host matchContents>` inheriting SwiftUI Menu's tap-area padding at the wrong measurement pass.

`MenuView` wraps a **consumer-provided trigger** (in our case a Tamagui `Text` + chevron) instead of rendering both the trigger AND the menu from native side. Because the trigger is a plain RN view, its layout is deterministic — no bridge measurement race, no off-screen "raised" bug. Verified on device: pickers now stay pixel-correctly aligned regardless of whether they're on-screen at mount or scrolled into view.

### Platform split

Rendering now lives in per-platform files, resolved by Metro at bundle time:

- `native-picker-body.ios.tsx` — SwiftUI `Menu` via `MenuView`.
- `native-picker-body.android.tsx` — Jetpack Compose `DropdownMenu` via `MenuView` (same API, works cross-platform).
- `native-picker-body.web.tsx` — falls back to `Host + Picker` (MenuView doesn't fire actions on web; the SwiftUI measurement bug doesn't exist on web either).
- `native-picker-body.tsx` — default fallback → re-exports `.web`.

The top-level `select-native.tsx` is the shared shell (palette resolution, chrome opt-in, label / helper / error text, peer-missing fallback). Only the trigger + menu render itself is platform-split. iOS-only tweaks land in `.ios.tsx` and can't regress Android, and vice versa — the pattern the user asked for after we broke Android trying to fix iOS.

### Selection UX

Each `MenuView` action carries a `state: "on" | "off"` — the selected option renders a native checkmark in both SwiftUI Menu and Compose DropdownMenu. Matches iOS system apps' "sort by" / "filter by" menus. No placeholder-item injection needed (`MenuView` doesn't bind to a `selectedValue` prop).

### Palette expansion (11 slots, +4 from previous)

Because we now render our own trigger (Tamagui `Text`), the palette needs trigger-text slots:

- **New**: `text` (selected value), `textDisabled`, `placeholder`, `chevron`.
- **Existing**: `label`, `background`, `backgroundDisabled`, `border`, `borderError`, `helperText`, `errorText`.

Default light: iOS system blue `#007AFF` for `text` / `placeholder` / `chevron` — matches the previous `Host + Picker` rendering (SwiftUI Menu paints tinted text by default).

Default dark: lifted `#0A84FF` (Apple's dark-mode system blue variant).

Consumers who want a design-system-primary tone override `text` / `chevron` on the provider or per-instance.

### New peer-dep probe

`getExpoUIMenuView` added to the probe file. Requires `@expo/ui/community/menu` at runtime — a subpath of the existing `@expo/ui` peer, so no new peer dep. Fails gracefully (returns `null` → shell renders the "install `@expo/ui`" hint) when the community submodule isn't present.

### Removed

The `Known issues` note about the off-screen "raised" picker is removed from the README and plan doc — the bug is gone with the MenuView backend.
