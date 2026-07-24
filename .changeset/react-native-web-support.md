---
"ui-kraken": minor
---

feat(platforms): add `react-native-web` as an optional peer to enable Web target

`ui-kraken` now supports Web in addition to iOS + Android. `react-native-web` is declared as an **optional** peer dependency — install it if you want to consume the library in an Expo Web (or any RN-Web) app; skip it if you only ship native. Consumers who already have `react-native-web` in their tree (e.g. Expo Router's default web setup) get web support with no additional installs.

**What works on Web out of the box:**

- **`Button`** — renders as `<button>` / `<div>` DOM elements. `pressStyle` animates via CSS transitions. `disabled` maps to `aria-disabled`. `testID` becomes `data-testid`. `elevation` uses CSS `box-shadow`. The dark-mode elevation border swap (translucent white to replace invisible black shadow) works identically to native.
- **`Text`** — renders as `<span>` DOM element. `numberOfLines` maps to CSS `-webkit-line-clamp`. `onPress` becomes a click handler. `textAlign` and every variant's `fontSize` / `lineHeight` / `fontWeight` land as inline styles.

Both components verified via `expo export --platform web` on the example app — every screen (catalog home, Button demo, Text demo) bundles and renders correctly.

**Non-goals for this release:**

- No `.web.tsx` platform shims — components are authored with cross-platform primitives that Tamagui + `react-native-web` translate automatically.
- No new CI job for web builds yet — that lands with Phase 3 (Chromatic). Manual verification via `pnpm --filter @ui-kraken/example web` covers this phase.
- No commitment to feature parity forever. Future components that must opt out of web will gate the incompatible feature with `Platform.OS !== "web"` and document the limitation in the component's `README.md` under `## Platform support`.

**Consumer migration:**

No changes required for existing native-only consumers. Web consumers install:

```bash
pnpm add react-native-web react-dom    # (or the equivalent npm/yarn)
```

then use `ui-kraken` as before — the library's runtime is unchanged.

Reverses the `docs/PLAN.md` §1 locked decision "No web / react-native-web support in v1". Immediate motivation: unlocks Phase 3 (Chromatic visual regression testing), which requires a headless-Chromium-renderable target. Secondary motivation: real consumer capability for Expo Router web apps.

See [`docs/REACT-NATIVE-WEB-PLAN.md`](../docs/REACT-NATIVE-WEB-PLAN.md) for the full design record.
