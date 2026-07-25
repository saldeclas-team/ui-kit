---
"ui-kraken": minor
---

`SelectNative` now renders **100% native by default** — no wrapper chrome (no background, border, or padding). SwiftUI `Menu` on iOS is just tinted text with a chevron; Compose `DropdownMenu` on Android renders as a bare button. That's the correct native look, and it's now the default.

Two new opt-in props let consumers turn the frame chrome back on, independently per platform:

- **`showBorderIOS?: boolean`** — default `false`. Set to `true` to show the wrapper frame (background + border + padding + `minHeight: 48`) on iOS.
- **`showBorderAndroid?: boolean`** — default `false`. Same effect on Android. Independent from the iOS flag, so you can enable it only on one platform (Cupertino-clean on iOS + Material-framed on Android, or the reverse).

The frame keeps a `minHeight: 44` (iOS/Android touch-target minimum) even when chrome is off — otherwise the frame collapses to the native picker's intrinsic ~25 px height and the surrounding label + helper text read as glued to the trigger. The picker centers vertically inside that 44 px box so the visual is "just the native picker" but with proper breathing room.

Chrome is still forced ON when either of these hold, regardless of the flags:

- `errorText` is set — the invalid state needs visual framing to read as an error.
- The `@expo/ui` peer dep is missing — the "install @expo/ui" fallback hint needs a box to live in.

**Behavior change**: consumers who were relying on the previous framed-by-default look should add `showBorderIOS showBorderAndroid` to keep the old visual. Bumped as minor because `SelectNative` shipped for the first time in the previous release — no consumer has locked in the old default yet.
