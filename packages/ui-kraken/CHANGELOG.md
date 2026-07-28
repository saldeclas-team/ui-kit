# ui-kraken

## 0.10.0

### Minor Changes

- a4096bd: Add `Avatar` — displays a user image with an initials fallback. Two rendering modes coexist: pass `source` for a real image; pass `name` (or explicit `initials`) so ui-kraken computes initials on a colored background. If the image fails to load, the component swaps to initials automatically via `onError`.

  ## API
  - `<Avatar>` extends `YStack`; every Tamagui layout prop flows through the spread. Own props: `source` (image), `name` (auto-compute initials), `initials` (explicit override, wins over `name`), `size` (`"sm" | "md" | "lg" | "xl" | number`, default `"md"`), `shape` (`"circle" | "rounded" | "square"`, default `"circle"`), `avatarColors` (per-instance palette override), `testID` (default `"avatar"`).
  - Sizes: sm=24, md=40, lg=56, xl=80. Raw numeric sizes pass through.
  - Shapes: circle → size/2 radius (perfectly round); rounded → 8; square → 0.
  - Rendering rules: source + no error → `<Image>`; source + error → initials; no source + initials → initials as-passed; no source + name → computed initials; nothing → empty background.
  - Initials computation: first letter of first word + first letter of last word, uppercased. Single-word names → first letter only. Empty / whitespace → empty background (no ghost text).
  - Font size scales with dimension: `fontSize = floor(dimension × 0.4)` so sm has readable text and xl doesn't look empty.
  - `accessibilityRole="image"` by default; `accessibilityLabel` defaults to `name` (or `"Avatar"` otherwise).

  ## Token schema — own color block

  `avatarColors` — 2 slots: `background` (fill when showing initials) + `text` (initials color). Light `#E5E7EB` bg + `#374151` text (gray-200 / gray-700); dark `#374151` bg + `#F9FAFB` text (inverted for dark mode). Neutral placeholder in both themes.

  Follows the each-component-owns-color-space rule. Full 13-step wiring: types + defaults + flatten (`$uiAvatarBackground`, `$uiAvatarText`) + provider merge + barrels.

  ## Non-goals (documented)
  - No `status` dot / badge slot — distinct primitive (future `AvatarWithStatus`).
  - No group / stacked variant — `<AvatarGroup>` is its own component.
  - No initial-color-from-name-hash — auto-hashing hides the deterministic mapping. Consumers who want per-user tinting pass `avatarColors` explicitly.
  - No loading skeleton state — consumers wrap in `<Skeleton>` or show `<Spinner>` while data loads.

  ## Testing

  47 component tests + 4 snapshots on `avatar.tsx` + 4 defaults-spec tests. 100% coverage across statements / branches / functions / lines on `avatar.tsx` + `defaults/avatar.ts`. Three exported pure helpers (`computeInitials`, `resolveAvatarSize`, `resolveAvatarBorderRadius`) tested branch-by-branch.

  ## Example app

  New `/components/avatar` route with 5 sections: size showcase (sm / md / lg / xl), shape showcase (circle / rounded / square), image vs initials (with a bad-URL fallback demo), explicit initials (`"?"` + emoji), custom colors inside a Card (composition example with a user-row).

- 6f20976: Add `Badge` — compact pill for notification counts, status labels, and inline indicators. Three rendering modes coexist: text label, numeric count (with `99+` overflow), and dot indicator (status marker for use over `<Avatar>` and similar). Counterpart to `Alert` (banner) and `Hint` (inline paragraph) at the smallest visual weight.

  ## API
  - `<Badge>` extends `YStack`; every Tamagui layout prop flows through the spread. Own props: `tone` (`"neutral" | "primary" | "success" | "warning" | "danger"`, default `"neutral"`), `size` (`"sm" | "md"`, default `"md"`), `count` (numeric), `maxCount` (default `99`), `dot` (boolean), `children` (text), `badgeColors` (per-instance tone override), `testID` (default `"badge"`).
  - Mode precedence: `dot` wins over `count` wins over `children`.
  - Count formatting: `count > maxCount` renders `"{maxCount}+"`. `count === 0` renders `"0"` (no auto-hide — consumers hide externally if desired).
  - Dot sizes: 8 px (sm) / 10 px (md).
  - `accessibilityRole="text"` by default. `accessibilityLabel` auto-derives from text/count content; dot mode falls back to `"Indicator"`.

  ## Compound shortcuts

  `Badge.Primary`, `Badge.Success`, `Badge.Warning`, `Badge.Danger` — same shape as `Hint`'s compound API. No `Badge.Neutral` since that's the base default.

  ## Token schema — own color block

  `badgeColors` — 5 tones × 2 slots (`background` + `text`), nested shape matching `HintToneColors`. Each tone uses a pale tinted background + darker semantic-hue text in light mode; deeper tint + lighter tone-hue text in dark mode. Same hue mapping as Hint's soft emphasis so a Badge and a Hint of the same tone read as the same signal at different sizes.

  Follows the each-component-owns-color-space rule. Full 13-step wiring: types + defaults + flatten (`$uiBadge{Tone}{Slot}`) + provider merge + barrels. Two merge helpers exported: `mergeBadgeToneColors` (single-tone, used per-instance) + `mergeBadgeColors` (cross-tone, used provider-side).

  ## Non-goals (documented)
  - No `outline` / `ghost` emphasis variants — one visual style keeps the tone signal readable.
  - No `pill` vs `square` shape — always rounded pill.
  - No `icon` slot — a badge with an icon reads as a chip.
  - No auto-hide when `count === 0` — zero-count is a valid state.
  - No `pulse` / `blink` animation — ships with a future `Motion` primitive.

  ## Testing

  56 component tests + 5 snapshots on `badge.tsx` + 8 defaults-spec tests (both merge helpers + all 5 tones' light-vs-dark sanity). 100% coverage across statements / branches / functions / lines on `badge.tsx` + `defaults/badge.ts`. Two exported pure helpers (`formatCount`, `resolveContent`) tested branch-by-branch.

  ## Example app

  New `/components/badge` route with 5 sections: tones (all 5 side-by-side), sizes (sm/md pair + count comparison), count formatting (0/5/42/120 + custom maxCount), dot indicator (with Avatar composition — 3 avatars with status dots), inline in a Card (settings-row example with `Badge.Danger count=12`, `Badge.Success "Active"`, `Badge.Warning "Beta"`).

- 814d031: Add `Card` — rounded, padded, semantically-elevated container that layers on top of `<Surface>`. Compound API (`Card + Card.Header + Card.Body + Card.Footer`) covers the two common layouts; simple `<Card>{content}</Card>` also works without slots. First component post-Batch 2 close-out; sits between the native-bridge batch and a future higher-level composites batch.

  ## API
  - `<Card>` extends `YStack`; every Tamagui layout prop flows through the spread. Own props: `level` (`"base" | "raised" | "overlay" | "sunken"`, default `"raised"`), `surfaceColors` (per-instance palette override), `testID`.
  - Compound: `Card.Header` (XStack, `justifyContent="space-between"` for "title + action"), `Card.Body` (YStack, `gap=8`), `Card.Footer` (XStack, `justifyContent="flex-end"`, `gap=8` for buttons). Each slot has its own testID default (`"card-header"` / `"card-body"` / `"card-footer"`) and passes every Tamagui layout prop through.
  - Defaults: `padding=16`, `borderRadius=12`, `gap=12` on the root. Slots have `padding=0` so they don't stack with the parent's padding.
  - Simple use: `<Card>{content}</Card>` — Card's gap handles stacking of direct children.
  - Compound use: `<Card><Card.Header/><Card.Body/><Card.Footer/></Card>` — Card's gap separates the three slots.

  ## Composition — no new tokens

  Card has **no color tokens of its own**. It reads the same `surfaceColors` palette Surface reads and applies the resolved `level` slot as its background color. Consumers who override `surfaceColors` globally (via the provider) or per-instance see both `<Surface>` and `<Card>` change together, by design. If we introduce a Card-owned border / divider color in a future revision, we'll add a `cardColors` block at that point per the each-component-owns-color-space rule; today there's nothing to wire.

  Card does NOT wrap `<Surface>` internally — that would add a wrapper element with no behavioral benefit. Palette resolution is a two-line `useUIKit()` + `resolvePalette()` inline in the component.

  ## Non-goals (documented)
  - **No shadow / elevation shadow** — same "tint over shadow" direction as Surface.
  - **No pressable variant** — consumers wrap in `<Pressable>` or use Button chrome.
  - **No `Card.Media` slot for images** — consumers embed `<Image>` directly.
  - **No divider between slots** — slot separation via Card's `gap`; visible dividers land with the `Divider` primitive on the v0.3 roadmap.
  - **No `dense` / `compact` size prop** — padding is a Tamagui pass-through.

  ## Testing

  28 tests, 6 snapshots — 100% coverage on `card.tsx`. Behavioral coverage: simple + compound rendering, sub-slot testID defaults + overrides, level → surfaceColors slot resolution across all 4 levels (light + dark palettes), per-instance + provider-wide palette overrides, Tamagui pass-through props on both the root and each slot, a11y prop pass-through, ref forwarding.

  ## Example app

  New `/components/card` route with 5 sections: simple card, compound (Header + Body + Footer), level showcase (all 4 levels side-by-side), 2-column card grid (`flex: 1`), themed card via per-instance `surfaceColors` override.

- 26a8501: Add `Dialog` — centered overlay panel for confirmations, forms, and detail views. Wraps RN's built-in `<Modal>` with palette + backdrop + compound API. Complements `BottomSheet` (bottom-anchored) for cases where content isn't a sheet metaphor. Named `Dialog` (not `Modal`) to disambiguate from RN's own `Modal` export.

  ## API
  - `<Dialog visible onClose>` — controlled visibility. Own props: `size` (`"sm" | "md" | "lg" | "full"`, default `"md"`), `animationType` (`"none" | "slide" | "fade"`, default `"fade"`), `dialogColors` (per-instance palette override), `testID` (default `"dialog"`).
  - Compound: `Dialog.Header` (optional `title` + optional `showCloseButton`), `Dialog.Body` (YStack for main content), `Dialog.Footer` (XStack right-aligned for action buttons). All slots optional — simple `<Dialog>{content}</Dialog>` works.
  - Sizes: sm=240, md=320, lg=480, full=0 minWidth. All cap `maxWidth: "95%"` so the panel shrinks on narrow screens.
  - Backdrop tap → `onClose`. Panel tap → no-op (bubble blocker, same pattern as `date-picker-body.ios`'s modal-content Pressable).
  - Omit `onClose` → must-answer dialog (backdrop tap does nothing).
  - Close-X button in `Dialog.Header` (when `showCloseButton`) invokes parent's `onClose` via context — no prop-drilling.
  - `accessibilityLabel="Close dialog"` on backdrop; `accessibilityRole="button"` + `accessibilityLabel="Close"` on the close-X.

  ## Provider re-mount inside Modal

  RN's `<Modal>` renders in a separate view hierarchy that does NOT inherit Tamagui / provider context. `<UIKitContext.Provider>` re-mounts inside the modal so styled children resolve tokens. Same pattern as `SelectBottomSheet` + `SelectNative.ios`.

  ## Token schema — own color block

  `dialogColors` — 4 slots: `backdrop` (overlay), `background` (panel fill), `title` (header text), `body` (default body text). Light `rgba(0,0,0,0.5)` / `#FFFFFF` / `#111827` / `#374151`; dark `rgba(0,0,0,0.7)` / `#1F2937` / `#F9FAFB` / `#D1D5DB`.

  Follows the each-component-owns-color-space rule. Full 13-step wiring: types + defaults + flatten (`$uiDialogBackdrop`, `$uiDialogBackground`, `$uiDialogTitle`, `$uiDialogBody`) + provider merge + barrels.

  ## Non-goals (documented)
  - No ref-based imperative API — controlled visibility is more predictable, matches every other controlled component.
  - No bottom-anchored variant — `<BottomSheet>` covers that use case.
  - No `variant` prop (alert/confirm/prompt) — compound slots + tone-appropriate buttons compose these.
  - No stacked / nested dialogs — RN Modal doesn't guarantee correct z-index across platforms.
  - No auto-focus first input — RN's focus management is inconsistent across platforms.

  ## Testing

  39 component tests + 4 snapshots on `dialog.tsx` + 4 defaults-spec tests. 100% coverage across statements / branches / functions / lines on `dialog.tsx` + `defaults/dialog.ts`. One exported pure helper (`resolveDialogMinWidth`) tested branch-by-branch.

  ## Example app

  New `/components/dialog` route with 4 sections: simple confirmation (Delete file? with Cancel + Delete), simple (no compound slots), size showcase (sm/md/lg/full toggle), must-answer (no dismiss — only "Got it" button closes).

- 9595311: Add `Divider` — thin line for visual separation between rows, sections, or slots. Horizontal by default; vertical variant for inline separators (e.g. between two icons in a row). Small layout primitive that unblocks future slot-divider variants in Card, MultiSelect, and any list component that wants visible separators between rows.

  ## API
  - `<Divider>` extends `YStack`; every Tamagui layout prop flows through the spread. Own props: `orientation` (`"horizontal" | "vertical"`, default `"horizontal"`), `thickness` (px, default `1`), `inset` (px on both ends, default `0`), `dividerColors` (per-instance palette override), `testID` (default `"divider"`).
  - `alignSelf: "stretch"` on the cross-axis so the line fills its parent without a manual `width: '100%'`.
  - Horizontal → `height=thickness`, `marginHorizontal=inset`. Vertical → `width=thickness`, `marginVertical=inset`.
  - `accessibilityRole="none"` by default — a divider is decorative and screen readers skip it. Consumers who use a divider to separate landmark sections override to `"separator"` at the callsite.

  ## Token schema — own color block

  `dividerColors` — 1 slot: `line` (the line's background color). Light default `#E5E7EB` (gray-200), dark default `#374151` (gray-700). Matches Input / Card border tones so a Divider between two Cards reads as native chrome.

  Follows the each-component-owns-color-space rule — Divider has its own block on the token schema. Per-instance override via `dividerColors={{ line: "..." }}`; provider-wide override via the standard `<UIKitProvider overrides={{ light: { dividerColors: ... } }}>` pattern.

  ## Non-goals (documented)
  - **No `label` / `text` prop for labeled dividers** — a labeled divider is a distinct primitive.
  - **No `variant` prop (`"solid" | "dashed" | "dotted"`)** — RN doesn't render dashed / dotted borders reliably across platforms.
  - **No gradient dividers** — ships when we introduce a `LinearGradient` primitive.
  - **No auto-orientation-detection based on parent (row vs column)** — explicit prop, always.

  ## Testing

  31 tests + 4 snapshots on `divider.tsx` + 4 tests on `defaults/divider.ts` — 100% coverage across statements, branches, functions, lines. Two exported helpers (`orientationSizeProps` / `orientationInsetProps`) are pure and tested directly for every branch.

  ## Example app

  New `/components/divider` route with 5 sections: horizontal default, vertical inline (row of icons), inset (iOS grouped-list look), thick (`thickness={4}`), custom color via per-instance `dividerColors` override.

- 01a55e4: Add `ProgressBar` — determinate progress indicator. Horizontal bar that fills from left to right as `value` progresses from `min` to `max` (0–100 by default). Complements `Spinner` (indeterminate) for cases where completion percentage is known: uploads, downloads, multi-step forms, sync bars.

  ## API
  - `<ProgressBar>` extends `YStack`; every Tamagui layout prop flows through the spread. Own props: `value` (default `0`), `min` (default `0`), `max` (default `100`), `size` (`"sm" | "md" | "lg" | number`, default `"md"`), `radius` (`"full" | "none"`, default `"full"`), `showValueLabel` (boolean), `label` (string), `progressBarColors` (per-instance palette override), `testID` (default `"progress-bar"`).
  - Sizes: sm=4, md=8, lg=12 (track height in px). Raw numeric pass-through.
  - Radius: `full` → pill (`borderRadius = height / 2`); `none` → straight bar.
  - Value clamping: `value < min` → 0%; `value > max` → 100%; `NaN` → 0%; inverted range (`min > max`) → 0%; zero-width range (`min === max`) → 0%.
  - Label: `label` wins over `showValueLabel`. Value label renders as rounded `"{percent}%"` above the bar in a `space-between` row. Neither set → no label region.
  - A11y: `accessibilityRole="progressbar"` + `accessibilityValue={{ min, max, now: clampedValue }}` so screen readers announce native progress. `accessibilityLabel` defaults to `label` (or `"Progress"` otherwise).

  ## Token schema — own color block

  `progressBarColors` — 3 slots: `track` (empty background), `fill` (completed portion), `label` (text color when label is set). Light `#E5E7EB` / `#2563EB` / `#111827` (gray-200 track + blue-600 fill + gray-900 label); dark `#374151` / `#60A5FA` / `#F9FAFB` (inverted).

  Follows the each-component-owns-color-space rule. Full 13-step wiring: types + defaults + flatten (`$uiProgressBarTrack`, `$uiProgressBarFill`, `$uiProgressBarLabel`) + provider merge + barrels.

  ## Non-goals (documented)
  - No indeterminate mode — use `<Spinner />`.
  - No animated value transitions — consumers wrap in `<Animated.View>` themselves.
  - No striped / gradient fill — solid color only.
  - No vertical orientation — distinct primitive.
  - No `buffered` slot — media-player concerns are their own component.

  ## Testing

  56 component tests + 4 snapshots on `progress-bar.tsx` + 4 defaults-spec tests. 100% coverage across statements / branches / functions / lines on `progress-bar.tsx` + `defaults/progress-bar.ts`. Three exported pure helpers (`clampValue`, `computePercent`, `resolveTrackHeight`) tested branch-by-branch — including edge cases: NaN, inverted range, zero-width range, over/under-max clamping.

  ## Example app

  New `/components/progress-bar` route with 4 sections: sizes showcase (sm/md/lg at 50%), interactive controlled state (buttons to bump ±10, reset), custom range (file upload example — 650 KB of 1 MB → 63%), custom label + brand-tinted color override.

- 19f2689: Add `Slider` — horizontal draggable range input. Thumb slides along a track from `min` to `max`; value snaps to `step` increments (or floats freely with `step={0}`). Pure JS via RN's `PanResponder` — no native peer.

  The input counterpart to `ProgressBar` (readonly). Volume knobs, price ranges, brightness, opacity — anywhere a consumer picks a continuous or stepped value.

  ## API
  - `<Slider>` extends `YStack`; every Tamagui layout prop flows through the spread. Own props: `value` (required), `onValueChange` (required, fires per drag frame), `onSlidingComplete` (optional, fires on release), `min` (default `0`), `max` (default `100`), `step` (default `1`, `0` for continuous), `size` (`"sm" | "md" | "lg"`, default `"md"`), `disabled` (default `false`), `sliderColors` (per-instance palette override), `testID` (default `"slider"`).
  - Sizes: sm = track 4 + thumb 16, md = track 6 + thumb 20 (default), lg = track 8 + thumb 24.
  - Value is clamped: `< min` → `min`, `> max` → `max`, `NaN` → `min` (defensive).
  - Step snap: `step=1` rounds to integers; `step=0.5` rounds to halves; `step=0` passes floating-point through.
  - Disabled: PanResponder rejects the gesture (`onStartShouldSetPanResponder` returns false), thumb dims via opacity, `accessibilityState.disabled=true`.

  ## A11y first-class
  - `accessibilityRole="adjustable"` — VoiceOver + TalkBack recognize the widget.
  - `accessibilityValue={{ min, max, now: clampedValue }}` — announced as "50 of 100".
  - `accessibilityActions={[{ name: "increment" }, { name: "decrement" }]}` — nudges by `step` (or 1 if `step === 0`); clamped at both ends.
  - `accessibilityLabel` — consumers set per-instance (`"Volume"`, `"Brightness"`).

  ## Token schema — own color block

  `sliderColors` — 3 slots: `track` (unfilled portion), `fill` (filled portion), `thumb` (draggable circle). Track + fill mirror ProgressBar's palette so a Slider and a ProgressBar at the same value read as related.

  Light `#E5E7EB` / `#2563EB` / `#FFFFFF`; dark `#374151` / `#60A5FA` / `#F9FAFB`.

  Follows the each-component-owns-color-space rule. Full 13-step wiring: types + defaults + flatten (`$uiSliderTrack`, `$uiSliderFill`, `$uiSliderThumb`) + provider merge + barrels.

  ## Non-goals (documented)
  - No range slider (two thumbs) — distinct primitive.
  - No vertical orientation — rare enough to defer.
  - No value label bubble that follows the thumb — consumers render their own bound to the same state.
  - No custom thumb component — consumers who want a shape / image pass a custom background via `sliderColors`.
  - No haptic feedback — consumers wire `expo-haptics` in `onValueChange` themselves.
  - No native peer dep (`@react-native-community/slider`) — avoids the dev-client rebuild trap.

  ## Testing

  60 tests + 4 snapshots on `slider.tsx` + 4 defaults-spec tests. `slider.tsx` at 83% lines / 85% branches — the uncovered lines are inside the PanResponder handlers themselves, which jest / RTL can't simulate without RN's `touchBank` gesture state (invoking the handlers directly throws `Cannot read properties of undefined (reading 'touchBank')`). Value transformation coverage is via four exported pure helpers (`clampValue`, `computePercent`, `snapToStep`, `locationToValue`) tested branch-by-branch — including all edge cases: NaN, inverted range, zero-width range, over/under-max clamping, step=0 (continuous), negative step, non-zero-min step base.

  `defaults/slider.ts` at 100% across every metric.

  ## Example app

  New `/components/slider` route with 5 sections: Volume (0-100, step 1), Rating (0-5, step 1), Opacity (0-1, continuous with 3-decimal display), onSlidingComplete-only demo (commit counter increments on release, not per drag frame), Sizes + disabled showcase.

- 066de7d: Add `Spinner` — themed activity indicator wrapping RN's built-in `ActivityIndicator` with palette-resolved color + size presets that read naturally at the callsite. Small building-block primitive for loading states inside Cards, Buttons, list rows, and empty-state screens.

  ## API
  - `<Spinner>` wraps `ActivityIndicator`; every RN prop except `color` + `size` flows through the spread. Own props: `size` (`"sm" | "md" | "lg" | number | "small" | "large"`, default `"md"`), `spinnerColors` (per-instance palette override), `testID` (default `"spinner"`).
  - Sizes: `"sm"` → 20px, `"md"` → 32px, `"lg"` → 48px. Raw numeric sizes pass through; RN's `"small"` / `"large"` also supported for consumers who prefer the native defaults.
  - Defaults: `animating=true`, `accessibilityRole="progressbar"`, `accessibilityLabel="Loading"`, `accessibilityState.busy` reflects `animating`.
  - Consumer overrides win on every default (`animating={false}`, custom a11y label, etc.).

  ## Token schema — own color block

  `spinnerColors` — 1 slot: `color` (the spinner's animated ring / dots). Light `#6B7280` (gray-500), dark `#9CA3AF` (gray-400) — muted secondary tones that read as "in-progress" without competing with content.

  Follows the each-component-owns-color-space rule. Full 13-step wiring: types + defaults + flatten (`$uiSpinnerColor`) + provider merge + barrels.

  ## Non-goals (documented)
  - No "dots" / "bars" / other visual variants — the native ActivityIndicator is the standard.
  - No `label` prop for "Loading..." text — consumers compose the row themselves.
  - No determinate progress-bar variant — distinct primitive.
  - No auto-color-from-parent-Button-tone — Buttons that show loading state pass `spinnerColors` explicitly if they need to match their own tint.

  ## Testing

  35 component tests + 3 snapshots on `spinner.tsx` + 4 defaults-spec tests. 100% coverage across statements / branches / functions / lines on `spinner.tsx` + `defaults/spinner.ts`. One exported pure helper (`resolveSpinnerSize`) tested branch-by-branch.

  ## Example app

  New `/components/spinner` route with 4 sections: size showcase (sm / md / lg + `size={64}`), loading-row composition (spinner + text), inside a Card (loading placeholder), custom color + static state (`animating={false}`).

## 0.9.1

### Patch Changes

- 3f99c5c: Internal test-surface improvements to `DatePicker`'s iOS + web bodies. No public API changes, no runtime behavior changes — release exists solely because PR #66 shipped source-file edits without a changeset (the release workflow no-op'd silently and nothing published to npm). This changeset ships the same commits under a proper patch bump so npm consumers pick them up.

  ## What changed

  ### iOS body (`date-picker-body.ios.tsx`)
  - Added `testID={`${testID}-modal-content`}` to the inner Pressable that wraps the sheet chrome. That Pressable's `onPress` is empty on purpose — it's a bubble blocker that absorbs taps so they don't reach the backdrop Pressable (which closes the modal). The new testID documents the element for future readers and lets consumers who exercise the "tap inside stays open" behavior in their own tests target it directly.

  ### Web body (`date-picker-body.web.tsx`)
  - Extracted `createInputChangeHandler(onChange)` as a new exported helper. Same pattern as the existing `openInputPicker` / `commitInputChange` / `toInputValue` extractions — a factory that returns the `<input>` `onChange` callback so tests can invoke it directly (jest-expo doesn't render `<input>` as a DOM element, so we can't dispatch real change events through it).
  - `handleChange` inside the component became `useMemo(() => createInputChangeHandler(onChange), [onChange])` — identical reference stability + runtime behavior to the prior `useCallback` wrapper.

  ## What did NOT change
  - Every existing prop / ref / callback signature is unchanged.
  - Every rendered element is unchanged (only a new testID on an already-existing Pressable).
  - Every semver-relevant behavior is unchanged.
  - The `useCallback` → `useMemo` swap preserves the same memoization semantics.

  ## Also in this changeset

  Test-only additions from the same PR: coverage tests for `mergeBottomSheetColors` + `mergeDatePickerColors` (previously exercised only transitively via the provider merge pipeline) + a Storybook stories fix for the `Input` `WithIcons` story (moved `leftIcon` / `rightIcon` out of `args` to unblock on-device Storybook). None of these ship to npm — they don't affect the released bundle.

## 0.9.0

### Minor Changes

- 99ede69: Add `BottomSheet` — modal bottom sheet with snap points, backdrop, and swipe-to-dismiss. First component of Batch 2 Phase B (overlays).

  Ref-controlled — the consumer holds a `useRef<BottomSheetRef>()` and calls `ref.current?.present() / dismiss() / snapToIndex() / expand() / collapse()`. Pure shell scope: the consumer puts arbitrary content inside (forms, lists, custom UI); no built-in `<BottomSheet.Header>` / `<BottomSheet.Actions>` helpers.

  ## Backend: `@expo/ui/community/bottom-sheet`

  Uses the native sheet primitive on each platform via the same `@expo/ui` peer we already require for SelectNative / SegmentedControl / DatePicker:

  - **iOS**: SwiftUI `sheet` with detents (the real system sheet).
  - **Android**: Material 3 `ModalBottomSheet` (Compose).
  - **Web**: `vaul` drawer with spring-physics gestures (bundled inside `@expo/ui`, no extra peer).

  Chose `@expo/ui/community/bottom-sheet` over raw `@gorhom/bottom-sheet` because:

  1. **Native affordances** — real SwiftUI / Material 3 sheets, not JS simulation.
  2. **No `react-native-gesture-handler` peer** — removes one peer + one native install for consumers.
  3. **Same peer as our other native components** — `@expo/ui` is our single umbrella peer for native primitives.
  4. **Backdrop always present** — better default than gorhom (which had none).
  5. **Zero extra deps on web** — vaul is bundled.

  Concessions accepted per platform:

  - **Android: only 2 snap states max** (partial ~50% + expanded). Passing 3+ snap points still works but the middle one is ignored on Android. Covers 95% of real-world sheet UX.
  - **Modal-only presentation** — no inline "persistent peek" sheet (Google Maps style). Aligned with the modal-only scope decision.
  - **iOS `enablePanDownToClose` ties swipe + backdrop-tap dismissal** — SwiftUI doesn't allow separating them. Native behavior.
  - **`handleComponent` / `backdropComponent` / `backgroundComponent` not honored on native** — the OS manages them. Web accepts styles fully.

  ## API
  - **Ref**: `useRef<BottomSheetRef>(null)` with methods `present(index?)`, `dismiss()`, `snapToIndex(index)`, `expand()`, `collapse()`.
  - **Props**: `snapPoints?: readonly (string | number)[]` (default `["50%"]`), `enablePanDownToClose` (default `true`), `enableDynamicSizing`, `onChange(index)`, `onDismiss()`, `radius` (accepted for API symmetry — currently web-only follow-up), `bottomSheetColors` per-instance palette, `testID`.

  Standard testID surface: `-sheet` (native sheet), `-view` (inner container), `-missing-peer` (fallback).

  ## Palette — 5 slots (each component owns its color space)

  Per the "each component owns its color space" rule, BottomSheet declares its own `BottomSheetColors` block. Small palette because native platforms own most sheet chrome (handle indicator, backdrop opacity, corner radius are OS-managed on iOS + Android; only web accepts them fully):

  - `background` — sheet body. Android via `containerColor`, iOS ignored (SwiftUI system background), web full.
  - `backdrop` — scrim. Web only; iOS + Android use OS-native scrim.
  - `handle` — drag indicator. Web only; iOS + Android render OS-standard handle.
  - `divider` — optional divider color between sheet body and consumer-supplied header.
  - `missingPeer` — text color for the "install `@expo/ui`" fallback hint.

  ## Provider ceremony

  Re-mounts `<UIKitContext.Provider>` inside the sheet body defensively — `@expo/ui` uses `Host + RNHostView` which should preserve React context inline, but the ceremony is cheap and shields us if a future `@expo/ui` version switches to a native portal. Same pattern as SelectBottomSheet.

  ## Testing (+27 tests, 981 total)

  25 shell tests covering: default testID + custom root, sheet + view sub-elements, children render inside, default + custom snapPoints, index=-1 default, enablePanDownToClose default true + override false, enableDynamicSizing forwards, background from palette, per-instance override wins, dark palette, onChange fires, all 6 ref methods forward correctly, missing-peer hint (both branches: probe false + probe true with null getters), radius accepted, 3 snapshots (default light, missing peer, dark).

  2 probe tests: both branches (peer resolves / peer throws).

  ## Example app

  New `/components/bottom-sheet` route with 6 sections: basic 50% sheet with dismiss counter, multi-snap 25/50/90, form inside sheet, non-dismissible, fit-to-content (enableDynamicSizing), brand-tinted palette.

  ## Not in this PR (deferred)

  SelectBottomSheet (Batch 2 #1b, already shipped) currently uses raw `@gorhom/bottom-sheet`. Migration to `@expo/ui/community/bottom-sheet` is a separate follow-up PR — we validate the new BottomSheet in real device use first. When migrated, we'll remove `@gorhom/bottom-sheet` and `react-native-gesture-handler` from `ui-kraken`'s peer list entirely, consolidating around `@expo/ui` as the single peer for native primitives.

- 4a30838: Add `DatePicker` — native date / time / datetime picker with a Tamagui-styled trigger. Third delivery of Batch 2 Phase A.

  - **iOS**: opens an inline picker inside a modal sheet with a Done button (staged selection — the picker's incremental scrolls don't fire `onChange` on every tick; only Done commits).
  - **Android**: opens the OS's Material 3 dialog directly via `presentation="dialog"` (native OK/Cancel handled by the OS).
  - **Web**: renders the browser's built-in `<input type="date" | "time" | "datetime-local">` via `showPicker()` (Chromium/Edge/Firefox) with a `.focus()` fallback on Safari — no JS calendar library.

  ### API
  - Controlled: `value: Date | null` (null → placeholder) + `onChange: (date: Date) => void`.
  - **`mode: "date" | "time" | "datetime"`** shipped from v1. Trigger formatting adjusts per mode; default placeholder shifts (`"Select date…"` / `"Select time…"` / `"Select date & time…"`).
  - Trigger formatting via `Intl.DateTimeFormat` — `dateStyle` (date mode), `timeStyle` (time mode), both (datetime). `locale?: string` + `formatValue?: (date) => string` escape hatch.
  - `is24Hour?: boolean` — Android-only per `@expo/ui`'s API. iOS follows the device locale's 12h/24h convention.
  - `label` / `helperText` / `errorText` / `disabled` / `minimumDate` / `maximumDate` — same shape as Input / Select.
  - `radius?: RadiusValue` — trigger corner shape (default `"md"`).
  - Standard testID surface: `-trigger`, `-trigger-text`, `-picker`, `-modal` (iOS), `-modal-overlay` (iOS), `-done` (iOS), `-helper-text`, `-error-text`, `-missing-peer`.

  ### Peer

  `@expo/ui` (already an optional peer of `SelectNative` and `SegmentedControl`) — no new peer required. Missing peer → renders "Install `@expo/ui`" hint colored with `errorText`; the app does NOT crash.

  ### Platform split from v0

  Follows the [`native-bridges-platform-split` rule](./.agents/skills/creating-component-tamagui/SKILL.md#35-native-bridges-must-be-platform-split-mandatory) — every platform's native call lives in its own file (`date-picker-body.{ios,android,web,tsx}`) so iOS-only tweaks (modal chrome, Done button, staged value pattern) can't regress the Android dialog and vice versa.

  ### Palette — 13 slots

  Per the "each component owns its color space" rule, DatePicker declares its own `DatePickerColors` block:

  - **Trigger chrome (9)**: `background`, `backgroundDisabled`, `border`, `borderFocused` (reserved), `borderError`, `text`, `textDisabled`, `placeholder`, `chevron`.
  - **Surrounding labels (3)**: `label`, `helperText`, `errorText`.
  - **Native picker tint (1)**: `accent` — passed to `@expo/ui` as `accentColor` to tint the highlighted date on both platforms.

  Default light palette mirrors `<Input>` so a DatePicker in the same form column reads flush. Accent defaults to iOS system blue (`#007AFF` / `#0A84FF`).

  ### Testing

  +25 tests (23 shell + 2 probe). Full-shell coverage; snapshots for empty / preselected / error / missing-peer states.

  ### Example app

  New `/components/date-picker` route with 10 sections: basic (date-of-birth with max=today), preselected + custom locale, time mode + `is24Hour`, datetime mode, range constraint (next 30 days), `formatValue` escape hatch, label + helper text, error state, fully disabled, brand-tinted palette.

- 6d7b606: Add `DateRangePicker` — controlled start/end date range picker. Fourth delivery of Batch 2 Phase A, closing the Select + SegmentedControl + DatePicker set.

  Composes two `<DatePicker>` triggers as a pure wrapper — no platform-split at this level because the wrapped DatePickers own the `@expo/ui` bridge, staged iOS modal, Android dialog, and missing-peer fallback. DateRangePicker adds range semantics on top: auto-clamping, shared formatting, single-callback onChange.

  ### API
  - Controlled: `startDate` / `endDate: Date | null` + `onChange: (start, end) => void`. Single callback fires with the full new range so consumers have one state update site — no separate onStart / onEnd branches.
  - `mode: "date" | "datetime"` shipped from v1. `"time"` intentionally excluded — a "time range" is rare and not what "date range" implies to consumers. Add in a follow-up if a real use case surfaces.
  - `orientation: "vertical" | "horizontal"` (default `"vertical"`). Vertical stacks Start above End (best on mobile). Horizontal places triggers side-by-side with `flex: 1` each and a `→` separator glyph (best on tablet).
  - `startLabel` / `endLabel` (`"Start"` / `"End"` defaults, overridable — e.g. `"Check-in"` / `"Check-out"`).
  - `startPlaceholder` / `endPlaceholder` — per-trigger placeholder, or fall back to DatePicker's mode-aware defaults.
  - Standard `label` / `helperText` / `errorText` / `disabled` / `minimumDate` / `maximumDate` / `locale` / `dateStyle` / `timeStyle` / `formatValue` / `is24Hour` / `radius` — all forwarded uniformly to both triggers.

  ### Auto-clamp

  When `startDate` moves past `endDate`, `onChange` fires ONCE with `(newStart, null)` — the end clears rather than jumping to match the new start (which would surprise the user more). The end picker's `minimumDate` is `startDate ?? minimumDate` so the native picker won't offer invalid values in the first place. Belt AND suspenders.

  ### `errorText` UX

  When set, `errorText` overrides `helperText` AND paints BOTH trigger borders red via a per-instance palette override passed down to the wrapped DatePickers. The children never render their own error copy — one shared error line lives on the range container so the invalid state reads as a single field.

  ### Palette — 14 slots (each component owns its color space)

  Per the "each component owns its color space" rule, DateRangePicker declares its own `DateRangePickerColors` block. Duplicates the 13 DatePicker slots (trigger chrome + surrounding labels + accent) applied identically to both bounds, plus one range-specific slot:

  - `separator` — glyph color for the horizontal-layout separator (`→`). No effect in vertical orientation.

  Default light + dark palettes mirror `DatePickerColors` for the trigger chrome so a range picker sitting next to a single-date picker in the same form reads flush.

  ### Peer

  No new peer required — reuses `@expo/ui` (via the shared DatePicker probe). Consumers who already installed for DatePicker / SelectNative / SegmentedControl get DateRangePicker "for free."

  ### Testing (+29 tests, 943 total)

  Shell coverage:
  - Both triggers render + testID prefixing (`{root}-start` / `{root}-end`).
  - Default labels (`"Start"` / `"End"`) + custom overrides + empty-string hides.
  - Custom placeholders forward.
  - Picking a start: fires `(newStart, existingEnd)` when end ≥ newStart.
  - Picking a start LATER than end: fires `(newStart, null)` — clamp.
  - Picking a start with no existing end: no clamp.
  - Picking an end: fires `(startDate, newEnd)`.
  - End picker's `minimumDate` = `startDate` (when set), else the top-level `minimumDate`.
  - Start picker's `maximumDate` mirrors top-level `maximumDate`.
  - `mode` / `locale` / `dateStyle` / `timeStyle` / `is24Hour` / `formatValue` forward to both.
  - `errorText` overrides helper AND paints both trigger borders red.
  - Helper renders when no error. Both empty → nothing renders.
  - `disabled` propagates to both.
  - Vertical (default) has no separator.
  - Horizontal renders separator + `flex: 1` on both pickers.
  - Per-instance `dateRangePickerColors` override wins.
  - Dark palette on `activeTheme="dark"`.
  - Extra `YStackProps` spread through.
  - Snapshots for default empty vertical + preselected horizontal + error vertical.

  ### Example app

  New `/components/date-range-picker` route with 10 sections: basic vacation, preselected + custom locale, horizontal orientation, datetime mode (reservation), custom labels (hotel check-in/out), range constraint (next 90 days), label + helper text, error state, fully disabled, brand-tinted palette (horizontal).

- d78980f: Add `ImagePickerSheet` — bottom-sheet image picker with camera / gallery / cancel action rows. Second (and last) component of Batch 2 Phase B. Composes our own `<BottomSheet>` for the sheet UI and wraps `expo-image-picker` for the actual picking.

  ## API
  - Ref-controlled: `useRef<ImagePickerSheetRef>(null)` + `ref.current?.present() / dismiss()`. No baked-in trigger — consumer wires their own button.
  - Three fixed action rows: **Take photo** (camera), **Choose from library** (gallery), **Cancel**.
  - Cancel row is styled destructive (`cancelText` slot, typically red) per iOS action-sheet convention.
  - `onPick(asset | null)` fires with the picked asset OR `null` when the user cancelled INSIDE the OS picker UI. Cancel row taps are silent dismiss — no `onPick` fires.
  - `onPermissionDenied?(source: "camera" | "library")` fires when a permission grant is denied. Consumer typically toasts a "go to Settings" hint.
  - Standard `expo-image-picker` options forwarded: `mediaTypes`, `allowsEditing`, `aspect`, `quality`, `videoMaxDuration`.
  - Custom labels (`cameraLabel`, `galleryLabel`, `cancelLabel`, `sheetTitle`) + optional icon slots (`cameraIcon`, `galleryIcon` — bring your own).

  Standard testID surface: `-sheet`, `-title`, `-camera`, `-gallery`, `-cancel`, `-missing-peer`.

  ## Peer dependencies

  Two optional peers:

  - **`expo-image-picker`** — new to ui-kraken's peer list. Added to `peerDependencies` with `optional: true`. Consumers who don't use ImagePickerSheet don't have to install it.
  - **`@expo/ui`** — inherited from our BottomSheet dependency (already required by SelectNative / SegmentedControl / DatePicker / BottomSheet).

  Missing either peer → sheet body renders "Install X" hint (dynamic — lists only the packages actually missing). App does NOT crash.

  ## Platform behavior
  - **iOS + Android**: full support. Camera + gallery via `expo-image-picker`. Permissions requested inline (request-then-launch pattern).
  - **Web**: library-only. `body.supportsCamera=false` → the camera row is HIDDEN (browsers can't launch a native camera). Gallery uses `<input type="file">` internally via `expo-image-picker`.

  ## Architecture — platform-split per the `native-bridges-platform-split` rule

  Even though iOS + Android bodies are functionally identical today (both call `expo-image-picker` with the same shape), the split is mandatory per the rule for two reasons:

  1. **Bug containment** — if `expo-image-picker` breaks on one platform, the fix lives in that one body.
  2. **Per-platform backend swap-ability** — we can swap the picker on ONE platform (e.g. to `react-native-image-picker` on Android) without touching the other.

  Web genuinely diverges: no camera + no explicit permission request (browser file picker prompts implicitly).

  File layout: `image-picker-sheet-body.{ios,android,web,tsx}` + shared `image-picker-sheet-body-types.ts` (contract + `PermissionDeniedError` class). Shell owns palette + sheet UI + peer detection + missing-peer fallback + ref forwarding.

  ## Palette — 8 slots (each component owns its color space)
  - **Sheet chrome (2)**: `sheetBackground`, `sheetHandle` — forwarded to the internally composed `<BottomSheet>` via palette mapping (same pattern as SelectBottomSheet).
  - **Action rows (5)**: `actionBackground`, `actionBackgroundPressed`, `actionText`, `actionIcon`, `cancelText` (destructive), `divider`.
  - **Fallback (0)**: reuses `cancelText` for the "install X" hint since it's semantically destructive-toned anyway.

  Default light + dark palettes mirror iOS action-sheet convention (white/gray-900 sheets with red Cancel).

  ## Testing (+57 tests, 1047 total)
  - 27 shell tests: all three action rows, custom labels, ref methods, permission denial routing, custom options forwarding, peer-missing fallback (three variants: BottomSheet missing / expo-image-picker missing / both missing), web-mode camera row hidden, palette mapping to BottomSheet, dark palette, custom icons, snapshots.
  - 9 iOS body tests: permission grant → launch → return asset, denial throws PermissionDeniedError, cancel returns null, missing peer returns null. Same for library.
  - 9 Android body tests: same coverage.
  - 6 web body tests: `supportsCamera=false`, camera is no-op, library full flow, permission handling for API symmetry.
  - 3 fallback body tests.
  - 2 probe tests: both branches.

  ## Example app

  New `/components/image-picker-sheet` route with 6 sections: basic profile photo, square crop avatar (`allowsEditing + aspect=[1,1]`), receipt scanner with custom labels, video picker (`mediaTypes='videos'`), permission denial handling with visible hint, themed palette (brand purple).

  ## Peer dep also added to apps/example

  `expo-image-picker@57.0.6` — required for the device demo to actually open the OS camera / gallery. Consumers of ui-kraken need to add it themselves via `pnpm add expo-image-picker` (or `npx expo install expo-image-picker` for managed workflows).

- fc76de3: Add `SegmentedControl` — horizontal segmented picker for 2-5 short options. Second delivery of Batch 2 Phase A.

  - **iOS**: native `UISegmentedControl` via `@expo/ui/community/segmented-control` (optional peer).
  - **Android**: Material 3 look implemented in pure JS with `react-native-reanimated` — no additional peer required. Sliding selection pill, ripple, Material 3 role colors, all overridable per-instance.
  - **Web**: `@expo/ui` Host+Picker fallback.

  ### Platform-split rationale

  The initial cut used `@expo/ui/community/segmented-control` on Android too, but the Compose bridge exposes a hit-testing interop bug: taps on the first 1-2 SegmentedControls of a scrollable Expo Router page pass THROUGH the Compose `Host` and land on adjacent stack screens' RN elements, causing random navigation to unrelated routes. `<View collapsable={false}>` + touch-responder claims did NOT block it.

  The `native-bridges-platform-split` rule (SKILL § 3.5, added last commit) let us swap the buggy bridge for a pure-JS Material 3 implementation on Android without touching iOS. iOS's SwiftUI `UISegmentedControl` doesn't have the interop bug, so it kept the bridge.

  ### API
  - Generic in the value type (`SegmentedControl<Value extends string = string>`) — same slot as Select / RadioGroup / MultiSelect.
  - Controlled only: `value: Value`, `onChange: (value: Value) => void`.
  - `label` / `helperText` / `errorText` / `disabled` — same surrounding-text pattern as Input / Select.
  - `androidRadius?: RadiusValue` — default `"pill"` matching M3. Prefixed `android` because iOS's native control owns its own shape. Consumers who want a square variant pass `"none"`; medium `"md"`; numeric px value; etc.
  - No `tintColor` prop — iOS ignores it and on Android the `segmentedControlColors` palette gives finer control anyway.

  ### Palette — 9 slots

  Split into shared vs. Android-only chrome per the "each component owns its color space" rule:

  - **Shared (3)** — `label`, `helperText`, `errorText`. Themable on every platform.
  - **Android chrome (6)** — `containerBackground`, `containerBorder`, `selectedBackground`, `selectedLabel`, `unselectedLabel`, `ripple`. Used by the pure-JS Android body; ignored on iOS (SwiftUI paints its own chrome). Each slot documented as `[Android only]` in its JSDoc.

  Default light + dark palettes ship Material 3 role colors so consumers who don't override still get the M3 look on Android.

  ### Testing

  +34 tests (24 shell + 8 Android body + 2 probe). Coverage:
  - `segmented-control.tsx` (shell): 100%
  - `segmented-control-body.ios.tsx`: 100%
  - `segmented-control-body.android.tsx`: 100% lines / 100% functions
  - `expo-ui-segmented-probe.ts`: 100%

  `.web.tsx` and `.tsx` fallback intentionally uncovered (jest-expo resolves `.ios` by default, matching the pattern used by SelectNative).

  ### Shared helper: `resolveRadiusNumeric`

  Added to `utils/radius.ts` — numeric-only variant of `resolveRadius` for components rendering `borderRadius` on plain RN `<Animated.View>` (which doesn't understand Tamagui theme tokens). Extracted from the SegmentedControl shell so it can replace Skeleton's local resolver in a follow-up.

  ### Example app

  New `/components/segmented-control` route with 10 sections: basic (3 options), two options / filter tabs, five options / sort direction, with label + helper text, error state, fully disabled, per-instance palette override, `androidRadius="none"` (square), `androidRadius="md"` (soft rounded), Android brand-tinted chrome.

- db591a9: Add the `Select` family — three sibling single-choice picker components with the same controlled prop shape but different UX backends. First delivery of Batch 2 Phase A.

  - **`Select`** — pure JS + `react-native` `Modal`. Centered card popup, cross-platform consistent, zero peer dependencies. Own `selectColors` block on the token schema (16 slots). Full theming control over trigger + modal chrome + selected-option highlight.
  - **`SelectNative`** — SwiftUI `Menu` on iOS / Compose `DropdownMenu` on Android via `@expo/ui` (optional peer). Fully-native affordance with platform haptics and chrome. Own `selectNativeColors` block (7 slots — trimmed because the native picker owns its interior chrome). Placeholder-item injection so `value=null` opens reliably on Android.
  - **`SelectBottomSheet`** — draggable bottom-sheet picker via `@gorhom/bottom-sheet` + `react-native-gesture-handler` (both optional peers). Configurable snap points, optional sheet title, drag-to-dismiss. Own `selectBottomSheetColors` block (15 slots). Requires the consumer to mount `<BottomSheetModalProvider>` at the app root.

  All three components:

  - Are generic in the value type (`SelectNative` accepts `string | number`, the other two accept `string`).
  - Share the same prop shape (`options`, `value`, `onChange`, `label`, `helperText`, `errorText`, `disabled`, per-option `disabledOptions` where the backend supports it) so consumers can swap between them by changing the import name.
  - Follow the "each component owns its color space" rule — three separate palette blocks, no shared slots.
  - Fall back gracefully when their optional peer dep is missing: the frame renders a helpful "install X" hint colored with the `errorText` slot instead of crashing the app. Same pattern as `ExternalLink` from Batch 1.

  New provider-input types alongside the components: `SelectColorsInput`, `SelectNativeColorsInput`, `SelectBottomSheetColorsInput`. Default light + dark palettes shipped for all three blocks. Additive to the existing token schema — no breaking changes.

- 7c53fc1: `SelectNative` now renders **100% native by default** — no wrapper chrome (no background, border, or padding). SwiftUI `Menu` on iOS is just tinted text with a chevron; Compose `DropdownMenu` on Android renders as a bare button. That's the correct native look, and it's now the default.

  Two new opt-in props let consumers turn the frame chrome back on, independently per platform:

  - **`showBorderIOS?: boolean`** — default `false`. Set to `true` to show the wrapper frame (background + border + padding + `minHeight: 48`) on iOS.
  - **`showBorderAndroid?: boolean`** — default `false`. Same effect on Android. Independent from the iOS flag, so you can enable it only on one platform (Cupertino-clean on iOS + Material-framed on Android, or the reverse).

  The frame keeps a `minHeight: 44` (iOS/Android touch-target minimum) even when chrome is off — otherwise the frame collapses to the native picker's intrinsic ~25 px height and the surrounding label + helper text read as glued to the trigger. The picker centers vertically inside that 44 px box so the visual is "just the native picker" but with proper breathing room.

  Chrome is still forced ON when either of these hold, regardless of the flags:

  - `errorText` is set — the invalid state needs visual framing to read as an error.
  - The `@expo/ui` peer dep is missing — the "install @expo/ui" fallback hint needs a box to live in.

  **Behavior change**: consumers who were relying on the previous framed-by-default look should add `showBorderIOS showBorderAndroid` to keep the old visual. Bumped as minor because `SelectNative` shipped for the first time in the previous release — no consumer has locked in the old default yet.

- e99d2fd: `SelectNative` — switched the mobile backend from `@expo/ui`'s `Host + Picker` to `MenuView` from `@expo/ui/community/menu`, and split the rendering into platform-specific files.

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

### Patch Changes

- 0fbcb75: Fix DatePicker + DateRangePicker off-by-one bug on Android.

  `@expo/ui/community/datetime-picker` on Android emits a Date whose `.getTime()` is UTC-midnight of the picked day (a Compose Material 3 quirk — `DatePickerState.selectedDateMillis` is defined that way, and `@expo/ui`'s Kotlin bridge at `DatePickerView.kt:343` forwards it raw, and its JS side calls `new Date(rawUtcMs)` without normalization). In negative-offset locales (all of the Americas), formatting that Date with `Intl.DateTimeFormat` in the device's ambient TZ renders as the PREVIOUS local day — so picking July 2 in the calendar shows "July 1" in the trigger.

  The community `@react-native-community/datetimepicker` fixes this in Kotlin (`RNMaterialDatePicker.kt:227-238`); `@expo/ui` does not (unfiled upstream at time of writing).

  We now normalize on the JS side in the Android body: reconstruct a Date whose local Y/M/D matches the picked Y/M/D. The transform is a new pure util at `packages/ui-kraken/src/utils/normalize-android-picked-date.ts` — reusable if we add another native date bridge later.

  Per-mode behavior:

  - **`date`**: local-midnight of the same Y/M/D that the user tapped.
  - **`datetime`**: same Y/M/D + preserved UTC hours/minutes as local hours/minutes (Android currently falls back to date-only per `@expo/ui`'s own contract, so hours/minutes are typically 0 — forward-compat preservation).
  - **`time`**: unchanged. Compose's `ExpoTimePicker` uses `Calendar.getInstance()` (system TZ) so its emitted Date is already a proper local instant.

  iOS is unaffected — SwiftUI `DatePicker` returns a Date in the ambient TZ. DateRangePicker composes two DatePickers and inherits the fix for free.

  +7 tests (6 normalizer unit tests covering date / datetime / time modes + leap-day + end-of-month + no-mutation + 1 end-to-end simulating the real UTC-midnight bridge output).

- ade8fc8: Migrate `SelectBottomSheet` from raw `@gorhom/bottom-sheet` to our own `<BottomSheet>` (which wraps `@expo/ui/community/bottom-sheet`).

  ## What changed
  - `SelectBottomSheet` now composes `<BottomSheet>` internally instead of hand-rolling the gorhom modal + backdrop + TamaguiProvider re-mount.
  - Removed `gorhom-probe.ts` + its spec — replaced by our BottomSheet's `isBottomSheetAvailable` probe.
  - Simplified state management: dropped the `isPresentedRef` guard, the `open` → gorhom-ref-sync `useEffect`, and the double-present regression tests (those behaviors no longer exist — we use ref-based imperative calls without state syncing).
  - Missing-peer hint now says "Install `@expo/ui`" instead of the multi-package "Install `@gorhom/bottom-sheet` + `react-native-gesture-handler`" string.
  - No public API change — same props, same ref shape, same palette (SelectBottomSheet still owns its 15-slot palette; `sheetBackground` and `sheetHandle` slots are now mapped onto BottomSheet's smaller palette when it composes).

  ## Consumer impact

  **Zero code changes required.** Consumers upgrading from earlier versions can uninstall `@gorhom/bottom-sheet` and `react-native-gesture-handler` if no other code depends on them — SelectBottomSheet no longer requires either. If you keep them installed, nothing breaks; they're just unused by ui-kraken.

  **Provider setup simplified.** No more `<BottomSheetModalProvider>` at the app root, no more `<GestureHandlerRootView>` wrapping. `@expo/ui`'s bottom-sheet uses OS-native modal presentation.

  ## Behavioral improvements
  - **Native affordances** — SwiftUI sheet on iOS, Material 3 sheet on Android, `vaul` drawer on web (instead of gorhom's JS simulation).
  - **No portal ceremony** — our `<BottomSheet>` handles Tamagui context re-mount internally, so consumers who put Tamagui components inside the sheet body (`<Input>`, `<Button>`, etc.) don't hit the "Can't find Tamagui configuration" error.

  ## Behavioral changes to be aware of
  - **Android: only 2 snap states** — if you pass `snapPoints={["25%", "50%", "90%"]}`, Android reduces to partial + expanded (middle ignored). Was 3-state under gorhom.
  - **Backdrop is always present** — gorhom had none by default; we always show one via the native OS scrim.
  - **iOS `enablePanDownToClose` ties swipe + backdrop-tap** — SwiftUI limitation. Was always separable under gorhom but the default was the same.
  - **Custom `handleComponent` / `backdropComponent` / `backgroundComponent` no longer honored** — @expo/ui's sheet uses OS-managed chrome on native. Wasn't exposed on SelectBottomSheet's public API anyway (SelectBottomSheet's own props stayed the same); noting for consumers who might have monkey-patched.

  ## Testing

  +7 net tests. Removed 5 gorhom-specific regression tests (double-present, zombie state, backdrop component wiring) that no longer apply. Added 2 tests for the new palette-mapping surface (`sheetBackground` / `sheetHandle` → BottomSheet's `bottomSheetColors`). 976 tests total, all passing.

  ## Peer-dep cleanup — deferred

  `@gorhom/bottom-sheet` and `react-native-gesture-handler` are still declared as optional peers in `ui-kraken`'s `package.json` — no code in ui-kraken requires them anymore, but the declarations are left in place for this PR so consumers upgrading don't get peer-warning spam mid-migration. **Follow-up PR** will remove them from the peer list once we've validated the migration in device use.

## 0.8.0

### Minor Changes

- 4a25003: Batch 1 of the duna-app → ui-kraken migration — 11 new primitives.

  **New components:**

  - `Input` — text input with label, helper/error, and optional icon slots.
  - `CurrencyInput` — locale-aware numeric input formatted as currency.
  - `Surface` — theme-bound container with 4 elevation levels (base / raised / overlay / sunken).
  - `RefreshControl` — themed pull-to-refresh with one palette wired to both iOS and Android props.
  - `Skeleton` — animated pulse placeholder for loading states (`pulse` / `static`).
  - `Hint` — inline contextual tip with 5 tones × ghost/soft emphasis + compound shortcuts.
  - `StatCard` — dashboard metric card with title, value, and optional trend arrow + auto glyph.
  - `MultiSelect` — chip-based multi-choice picker (wrap layout, generic value type).
  - `SocialButton` — OAuth-provider button (Google / Apple / Facebook / GitHub / Microsoft / generic).
  - `Collapsible` — animated expand/collapse section with accordion-friendly controlled state.
  - `ExternalLink` — router-agnostic link that opens URLs via `expo-web-browser` (optional) with `Linking.openURL` fallback.

  **New token blocks** (each with light + dark palettes, per-instance override input types, merge helpers, and Tamagui flatten helpers): `inputColors`, `currencyInputColors`, `surfaceColors`, `refreshControlColors`, `skeletonColors`, `hintColors`, `statCardColors`, `multiSelectColors`, `socialButtonColors`, `collapsibleColors`, `externalLinkColors`.

  **Repo-wide rules added:**

  - `Animated` / `Easing` from `react-native` banned in library code — use `react-native-reanimated`. `AGENTS.md § Animation` + creating-component-tamagui SKILL § 3.4.
  - Shared `resolveRadius` helper in `utils/radius.ts` — every component-with-radius primitive uses the same `RadiusValue` union. SKILL § 3.1.
  - Shared `resolvePalette` helper in `utils/resolve-palette.ts` — flat-slot palettes across 8 primitives. SKILL § 3.2.
  - Shared `IconTintOverride` component in `components/icon-tint-override/` (internal only). SKILL § 3.3.

  **Optional peer dep added:** `expo-web-browser` (for `ExternalLink`'s in-app browser backend; falls back to `Linking.openURL` when absent).

## 0.7.0

### Minor Changes

- 05646dd: feat(radio-group, alert, provider): ship RadioGroup, refactor Alert to own its color block, rename provider — v0.7.0 (BREAKING)

  **RadioGroup** (new component, the 4th public one)

  Group of mutually-exclusive selectable options (single-choice picker). Controlled, generic in the value type, vertical or horizontal layout, provider-level + per-instance color overrides.

  - **API**: `<RadioGroup<T>` with `value: T | null`, `onChange: (v: T) => void`, `options: Array<{value, label}>`, optional `label`, `disabled`, `orientation: "vertical" | "horizontal"` (vertical default), `radius` (same shape as `ButtonRadius`), `radioGroupColors?: Partial<RadioGroupColors>`, `testID`.
  - **Own color block**: `radioGroupColors` on `Tokens` — 7 slots (`selectedBorder`, `unselectedBorder`, `dot`, `label`, `groupLabel`, optional `selectedBackground` and `unselectedBackground`). Provider-level override at `<UIKitProvider tokens={{ radioGroupColors: {...} }}>`; per-instance override via the `radioGroupColors?` prop. Ships `DEFAULT_LIGHT_RADIO_GROUP_COLORS` / `DEFAULT_DARK_RADIO_GROUP_COLORS`.
  - **Accessibility**: container `accessibilityRole="radiogroup"` + `accessibilityLabel`; every option row `accessibilityRole="radio"` + `accessibilityState={{selected, disabled}}`; 48 × 48 px minimum touch target; no-op on tapping the already-selected option.
  - **Non-goals**: no standalone `<Radio>`, no uncontrolled mode, no per-option disabling, no rich option content, no error state (all deferred; see `docs/RADIO-GROUP-PLAN.md`).
  - 33 spec tests + 11 structural snapshots + 8 Storybook stories + full example screen.

  **Alert refactor — now owns its color block on the token schema (BREAKING for type imports)**

  Alert v0.6.0 derived its palette from `textColors` at runtime — tech debt against the `each-component-owns-color-space` rule. v0.7.0 adds `alertColors` to the token schema:

  - New provider block `alertColors: AlertColors` on `Tokens` — one 4-slot palette (`background`, `text`, `icon`, optional `border`) per variant (`info`, `success`, `warning`, `danger`).
  - New light + dark defaults tuned for WCAG AA contrast on both surfaces.
  - New provider input type `AlertColorsInput` — partial-of-partials, same shape as `ButtonColorsInput`.
  - `alert.tsx` refactored: reads `useUIKit().tokens.alertColors[variant]` instead of deriving from `textColors`. `withAlpha` helper deleted (backgrounds now come pre-tinted from defaults).

  **Type renames (breaking)**:

  - `AlertColors` — used to be the per-variant slot shape (`{background, text, icon, border?}`); now is the aggregate `{info, success, warning, danger}` (matches `ButtonColors` shape). If you imported the old `AlertColors`, use `AlertVariantColors` instead.
  - `AlertColorsInput` — used to be per-instance override (`Partial<{...slots}>`); now is provider-level input (`Partial<Record<variant, Partial<slots>>>`, matches `ButtonColorsInput`).
  - **New**: `AlertVariantColors` (per-variant slots) + `AlertVariantColorsInput` (per-instance override).

  **Prop `alertColors={{...}}` on `<Alert>` unchanged** — runtime shape `{background?, text?, icon?, border?}` is identical, only the type name changed.

  **Provider rename: `KrakenProvider` → `UIKitProvider` (BREAKING)**

  `KrakenProvider` was v0.4.0's "kept for brand identity" component. Renamed for full consistency with `useUIKit` + `UIKitContext`. No deprecated alias — clean cutover.

  **Consumer migration**:

  ```diff
  - import { KrakenProvider } from "ui-kraken";
  + import { UIKitProvider } from "ui-kraken";

  - <KrakenProvider defaultTheme="dark">
  + <UIKitProvider defaultTheme="dark">
      <App />
  - </KrakenProvider>
  + </UIKitProvider>
  ```

  Same props (`tokens`, `dark`, `defaultTheme`, `children`), same runtime behavior. `useUIKit`, `useColorScheme` integration, `ThemeMode`, `Tokens`, and every other export unchanged.

  **Internal architecture: tokens/ folder restructure + new utils/ folder**

  Not user-facing but improves how contributors add components. See `docs/BUTTON-PLAN.md`, `docs/TYPOGRAPHY-PLAN.md`, and the updated `.agents/skills/creating-component-tamagui/SKILL.md` for the new patterns.

  - **`packages/ui-kraken/src/tokens/defaults/`** — one file per component (`button.ts`, `text.ts`, `alert.ts`, `radio-group.ts`) holding that component's `DEFAULT_LIGHT_*` + `DEFAULT_DARK_*` palettes + `merge*` helpers. `defaults/index.ts` aggregates into `DEFAULT_TOKENS` + `DEFAULT_DARK_TOKENS`. Adding a component = 1 new file + 1 line in the aggregator.
  - **`packages/ui-kraken/src/utils/`** — cross-cutting helpers:
    - `utils/color.ts` — pure color math (`tint`, `hexToHsl`, `hslToHex`, `parseHex`, `rgbToHex`, `clamp`).
    - `utils/flatten.ts` — `flatten*Colors` helpers that turn nested palettes into flat `$ui*` Tamagui tokens.
  - `tokens/tokens-derive.ts` slimmed to just `coarseToFineTokens` (was 110 lines, now 29). `tokens/tokens.ts` slimmed to `buildConfig` + `Config` + re-exports (was 155 lines, now 103).

  **Kraken → UIKit full sweep (also breaking, no more surface than the provider rename)**

  Every non-package-name reference to `Kraken` swept: `KrakenProvider`, stale `KrakenTextColors` / `<KrakenProvider>` in comments, `$kraken*` mentions in SKILL.md examples (actual tokens have been `$ui*` since v0.4.0), obsolete file-name examples in AGENTS.md + PR template + `naming-git-branches` skill. Only `ui-kraken` the npm package name remains.

  **Verification**

  - `pnpm typecheck`, `pnpm -r lint`, `pnpm test`, `pnpm --filter ui-kraken build` — all green.
  - **201 tests** (was 163 pre-refactor, +38), **96 snapshots** (was 66, +30).
  - `dist/index.d.ts` grew from 36.87 KB → 47.15 KB (+28%, from the new component + token blocks + type renames).

  **Docs updated**

  - `docs/ALERT-PLAN.md` — status flipped to "shipped in v0.7.0 with the alertColors refactor".
  - `docs/RADIO-GROUP-PLAN.md` — status flipped to shipped.
  - `docs/BUTTON-PLAN.md`, `docs/TYPOGRAPHY-PLAN.md`, `docs/PLAN.md`, `docs/CHROMATIC-PLAN.md` — Kraken sweep.
  - `AGENTS.md`, `.agents/skills/creating-component-tamagui/SKILL.md`, `.agents/skills/creating-provider-tamagui/SKILL.md`, `.agents/skills/naming-git-branches/SKILL.md`, `.github/PULL_REQUEST_TEMPLATE.md` — updated for `UIKitProvider` + new token-wiring recipe + `$ui*` prefix.
  - Every component `README.md` — swapped `KrakenProvider` → `UIKitProvider`. Alert README rewritten to document `alertColors` provider block.

## 0.6.0

### Minor Changes

- 3feb341: feat(alert): ship the `Alert` primitive — the third public component

  Contextual feedback surface for informational, success, warning, and destructive states. Common uses: form errors, empty-state hints, success confirmations, deprecation notices, inline callouts.

  **4 semantic variants:** `info` / `success` / `warning` / `danger` — vocabulary matches `TextColors` so one semantic slot has one name across the kit.

  **Compound API:** `Alert.Info`, `Alert.Success`, `Alert.Warning`, `Alert.Danger` — PascalCase shortcuts, same pattern as `Button.Primary` and `Text.H1`. The plain `<Alert>` still works with the `variant` prop and defaults to `"info"`.

  **Content model:** optional `title` + `children` (any ReactNode — plain string or nested `<Text>` for rich content like inline links) + optional `icon` slot (consumer brings their own icon system; no dep on an icon library).

  **Colors:** reuses the existing `textColors` block on `UIKitProvider` — no new token schema. Each variant maps to a `textColors` slot (info → `textColors.info`, danger → `textColors.danger`, etc.). Background is computed at runtime as the variant color at ~15% opacity.

  **Per-instance override:** `alertColors?: Partial<{ background?, border?, text, icon }>` — scoped to the resolved variant. Missing slots fall through to the palette. Enables brand-color alerts without extending the provider palette.

  **Radius:** `radius?: number | "none" | "sm" | "md" | "lg" | "pill"` — same shape as `Button.radius`. Default `"md"`.

  **Accessibility:** every variant sets `accessibilityRole="alert"`. `accessibilityLiveRegion` is `"assertive"` for `danger` (interrupts) and `"polite"` for the other three.

  **Every Tamagui style prop flows through** the `...rest` spread — none are re-declared on `AlertProps`. `padding`, `margin`, `pressStyle`, shorthand aliases (`px`, `py`, `bg`, etc.) all just work with types inferred from `GetProps<typeof StyledAlert>`.

  Test coverage: **22 spec tests + 19 structural snapshots**. Total repo: 163 tests / 85 snapshots (up from 122 / 66).

  See [`docs/ALERT-PLAN.md`](../docs/ALERT-PLAN.md) for the full design record.

## 0.5.0

### Minor Changes

- beb4d8f: feat(platforms): add `react-native-web` as an optional peer to enable Web target

  `ui-kraken` now supports Web in addition to iOS + Android. `react-native-web` is declared as an **optional** peer dependency — install it if you want to consume the library in an Expo Web (or any RN-Web) app; skip it if you only ship native. Consumers who already have `react-native-web` in their tree (e.g. Expo Router's default web setup) get web support with no additional installs.

  **What works on Web out of the box:**

  - **`Button`** — renders as `<button>` / `<div>` DOM elements. `pressStyle` animates via CSS transitions. `disabled` maps to `aria-disabled`. `testID` becomes `data-testid`. `elevation` uses CSS `box-shadow`. The dark-mode elevation border swap (translucent white to replace invisible black shadow) works identically to native.
  - **`Text`** — renders as `<span>` DOM element. `numberOfLines` maps to CSS `-webkit-line-clamp`. `onPress` becomes a click handler. `textAlign` and every variant's `fontSize` / `lineHeight` / `fontWeight` land as inline styles.

  Both components verified via `expo export --platform web` on the example app — every screen (components home, Button demo, Text demo) bundles and renders correctly.

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

## 0.4.0

### Minor Changes

- f7c7842: refactor(api): drop the legacy prefix from the public API (BREAKING)

  The library-prefix on every type / hook / constant was noise. The package name (`ui-kraken`) already namespaces the imports, so repeating it inside the identifiers was redundant. Types now read like they came from any modern React library.

  **Kept (brand identity):**

  - Package name `ui-kraken`.
  - Component: `UIKitProvider` — follows the standard pattern (`<ChakraProvider>`, `<TamaguiProvider>`, `<QueryClientProvider>`). (Post-v0.7.0 name — see the v0.7.0 entry for the second-stage provider rename.)

  **Renamed identifiers:**

  - Hook: `useUIKit`.
  - Types: `Tokens`, `ButtonColors`, `ButtonVariantColors`, `TextColors`, `TokensInput`, `ButtonColorsInput`, `TextColorsInput`, `ThemeMode`, `ProviderProps`, `ContextValue`, `ResolvedTokens`, `Config`.
  - Constants: `DEFAULT_TOKENS`, `DEFAULT_DARK_TOKENS`.
  - Function: `buildConfig`.
  - Disambiguation: the component-level per-instance override input (was previously colliding with the provider-level input) is now `ButtonVariantColorsInput` — matches what it actually is (input for one variant's slots, not the whole palette). Provider-level `ButtonColorsInput` (= `Partial<ButtonColors>`) is the outer one.

  **Renamed Tamagui theme tokens:**

  The short `$ui` prefix now covers every library token — a prefix is still needed to avoid clobbering Tamagui built-ins (`$radius`, `$space`, `$size`).

  - `$uiButtonPrimaryBackground` and every other button slot.
  - `$uiTextPrimary` and every other text slot.
  - `$uiRadiusMd` (and Sm / Lg / Pill).
  - `$uiSpacingMd` (and Xs / Sm / Lg / Xl).
  - `$uiSizeMd` (and Xs / Sm / Lg / Xl).

  **Renamed files:**

  - `packages/ui-kraken/src/tokens/tokens.ts` (plus `-types.ts`, `-derive.ts`, `.spec.ts`).
  - `packages/ui-kraken/src/provider/provider.tsx` (plus `-types.ts`, `-context.tsx`, `.spec.tsx`).
  - `packages/ui-kraken/src/provider/use-ui-kit.ts` (and `.spec.tsx`).

  **Renamed Tamagui `styled()` `name:` fields** (internal, but visible via component displayName):

  - `"UIKitButton"`, `"UIKitButtonLabel"`, `"UIKitText"`.

  **Migration path:** find-and-replace on consumer code. Every rename is 1:1, no behavioural change. The maintainer confirmed nobody had installed v0.3.0 externally, so no live consumers to migrate.

  Tests: 56 passing (unchanged from v0.3.0), lint clean, build clean.

## 0.3.0

### Minor Changes

- 927e21a: feat(text): ship the `Text` primitive — the second component after `Button`

  Adds a full-featured typographic primitive on top of Tamagui:

  - **13 HTML-familiar variants** — `h1`–`h6`, `subtitle1`/`subtitle2`, `body1`/`body2`, `caption`, `overline`, `label`. Sized on a Material-3-inspired scale (H1 40/48/700 → Label 14/20/500) with `overline` also getting `textTransform: uppercase` + `letterSpacing: 0.5`.
  - **Compound API** — `Text.H1`, `Text.Body1`, `Text.Caption`, … same pattern as `Button.Primary`. The plain `<Text>` still works and defaults to `variant="body2"`.
  - **14 color slots** grouped in three buckets: 5 hierarchy (`primary`, `secondary`, `tertiary`, `disabled`, `inverse`), 5 semantic (`interactive`, `success`, `warning`, `danger`, `info`), 4 on-\* (`onPrimary`, `onSecondary`, `onSuccess`, `onDanger`).
  - **`color` prop accepts either** a slot name (resolves to a theme token via `useUIKit()`) **or a raw string** (`#RRGGBB`, `rgb(...)`, named color) — the `(string & {})` trick preserves slot autocomplete without rejecting arbitrary strings.
  - **Intensity modulator** — `subtle` (opacity 0.65), `normal` (default), `strong` (fontWeight bumped one step; already-700 variants stay unchanged).
  - **Every RN Text prop and every Tamagui style prop flows through** the `...rest` spread — `onPress`, `numberOfLines`, `textAlign`, `selectable`, `adjustsFontSizeToFit`, `accessibilityLabel`, `style`, `padding`, `pressStyle`, shorthand aliases, etc.

  Provider gains `textColors?: Partial<TextColors>` alongside `buttonColors` — same per-component-block token schema. Ships `DEFAULT_LIGHT_TEXT_COLORS` and `DEFAULT_DARK_TEXT_COLORS` so consumers get a working palette out of the box.

  Test coverage: 10 new specs on the component (variant fan-out, slot resolution, raw-hex/rgb passthrough, intensity subtle/strong, RN prop flow-through, compound-shortcut round-trip) plus 4 new specs on the token/provider layer (56 total, up from 44).

## 0.2.0

### Minor Changes

- d2fd1b8: Add `UIKitProvider`, per-component `Tokens` schema, and the `Button` component with five tones, `radius`, and theme-aware `elevation` — plus dark-mode support and a live components-home demo.

  **Provider layer**

  - `UIKitProvider` wraps Tamagui's `TamaguiProvider` (which already includes a `PortalProvider` root host — we do not double-mount one).
  - Accepts a per-component token schema via context.
  - `useUIKit()` returns both the resolved tokens for the active theme AND the raw Tamagui config as an escape hatch.
  - `defaultTheme` accepts `"light" | "dark" | "system"`; the `"system"` mode follows RN's `useColorScheme()`.
  - Optional `dark` prop lets consumers customize dark-mode tokens independently. When omitted, ships `DEFAULT_DARK_TOKENS` (Blue-500 palette tuned for dark surfaces).

  **Tokens layer (per-component design)**

  - `Tokens.buttonColors` block, one variant per key (`primary | secondary | outline | ghost | destructive`), each with slots `{ background?, label, border? }`. No flat `primaryColor` / `textPrimaryColor` — tokens are grouped by component role, not by an abstract "primary" concept.
  - Ships `DEFAULT_TOKENS` (light) and `DEFAULT_DARK_TOKENS` (dark) with sensible Blue-600 / Blue-500 defaults.
  - Utilities: `buildConfig`, `coarseToFineTokens`, `mergeButtonColors`, `mergeButtonVariantColors`, `tint`.
  - All library-owned Tamagui tokens land under `$uiButton{Variant}{Background|Label|Border}` and `$uiRadius{Sm|Md|Lg|Pill}` / `$uiSpacing{Xs|Sm|Md|Lg|Xl}` — zero collision with `@tamagui/config/v4` defaults.

  **Button**

  - Compound API: `Button.Primary`, `Button.Secondary`, `Button.Outline`, `Button.Ghost`, `Button.Destructive`. Top-level `Button` aliases `Button.Primary`.
  - Sizes: `sm` / `md` / `lg`. States: `disabled` / `loading` (both apply `opacity: 0.45`).
  - `radius` prop: `number | "none" | "sm" | "md" | "lg" | "pill"` — numeric is raw px, preset maps to the theme scale, `"pill"` is fully rounded.
  - `elevation` prop: `"none" | "sm" | "md" | "lg"` — theme-aware. In light mode it casts iOS `shadow*` + Android `elevation` with tuned opacity/radius. In dark mode it cancels every shadow prop (black shadows are invisible on dark surfaces) and instead renders a translucent-white border whose opacity scales with the level (pattern lifted from Linear / Notion / Vercel). `outline` and `ghost` skip the dark-swap because they already own their border, and any explicit `buttonColors.border` override wins.
  - Slots: `leftIcon` / `rightIcon` (accept any `ReactNode` — plug in your own SVG / vector icon library).
  - Per-instance color override via `buttonColors?: Partial<{ background?, label, border? }>` — variant implicit from the compound subcomponent.
  - Full accessibility: `accessibilityRole="button"`, `accessibilityState`, minimum 48 × 48 px touch target (grows to 56 for `lg`, shrinks to 36 for `sm`), `pressStyle: { scale: 0.98, opacity: 0.9 }`.

  **Example app components home**

  - `apps/example/app/(pages)/index.tsx` is now a components home listing every component (with "Ready" / "Planned" badges).
  - `apps/example/app/(pages)/components/button.tsx` hosts the full Button demo — every variant, every size, states, radius presets, elevation levels, per-instance overrides.
  - New `<Screen>` wrapper forces `#000` background in dark mode / `#FFF` in light so text stays readable.
  - New `<ThemeToggle>` in the header lets you flip between light / dark / system live.
  - Storybook on-device wires up `AsyncStorage` so it remembers the last opened story between reloads.

## 0.1.0

### Minor Changes

- 4d600b7: Initial publish of the ui-kraken scaffold (0.1.0).

  No components ship in this release yet — this cuts the first version of the
  build/publish pipeline so that subsequent versions can focus on adding
  components without setup churn. The next release will add the first real
  component (probably `Button`) together with the `UIKitProvider` and the
  token schema decisions tracked in `docs/PLAN.md`.
