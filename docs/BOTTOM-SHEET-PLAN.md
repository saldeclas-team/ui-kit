# BottomSheet — plan (Batch 2 Phase B)

Draggable modal sheet with snap points, backdrop, and swipe-to-dismiss. Ref-controlled (imperative `present() / dismiss()`), pure shell — the consumer puts arbitrary content inside.

## Backend

**`@expo/ui/community/bottom-sheet`** — the drop-in replacement for `@gorhom/bottom-sheet` shipped inside `@expo/ui` (same peer we already require for SelectNative / SegmentedControl / DatePicker). Native affordances per platform:

- **iOS**: SwiftUI `sheet` presentation with detents (the real system sheet).
- **Android**: Material 3 `ModalBottomSheet` (Compose).
- **Web**: `vaul` drawer with spring-physics gestures (bundled, no extra peer).

### Why not raw `@gorhom/bottom-sheet`

Investigated. Choosing `@expo/ui` over gorhom because:

1. **Native affordances** — real SwiftUI sheet / Material 3 sheet, not JS simulation.
2. **No `react-native-gesture-handler` peer** — @expo/ui doesn't need it (removes one peer + one native install for consumers).
3. **Same peer as our other native components** — `@expo/ui` is our single umbrella peer for native primitives (Menu, SegmentedControl, DateTimePicker, and now BottomSheet).
4. **Backdrop always present** — better default than gorhom (which had none).
5. **Zero extra deps on web** — vaul is bundled.
6. **Tamagui-in-portal likely NOT an issue** — @expo/ui uses `Host + RNHostView` (same pattern as our SegmentedControl Android body) which hosts React content inline rather than re-portaling. To be verified in device, but the primitive is structurally different from gorhom's native portal. If verified, our shell won't need the `<TamaguiProvider>` re-mount ceremony that SelectBottomSheet needs.

Concessions we're accepting:

- **Android: only 2 snap states** (partial ~50% + expanded). @expo/ui maps `snapToIndex(0)` to partial, `snapToIndex(lastIndex)` to expanded. Covers ~95% of real-world sheet UX.
- **Modal-only presentation** — no inline "persistent peek" sheet (Google Maps style). Aligned with our decision to ship modal-only in v1.
- **iOS `enablePanDownToClose` ties swipe + backdrop-tap dismissal** — SwiftUI doesn't allow separating them. Native behavior.
- **Custom `handleComponent` / `backdropComponent` / `backgroundComponent` not honored on native** — the OS manages them.

### SelectBottomSheet migration (deferred)

SelectBottomSheet (Batch 2 #1b, already shipped) currently uses raw `@gorhom/bottom-sheet`. Migration to `@expo/ui/community/bottom-sheet` is a **separate follow-up PR** — we validate the new BottomSheet in real device use first. When migrated, we'll remove `@gorhom/bottom-sheet` and `react-native-gesture-handler` from `ui-kraken`'s peer list entirely, consolidating around `@expo/ui`.

Tracked in [[pending-bottom-sheet-consolidation]] memory (to be added after this component ships).

## API

```ts
export type BottomSheetRadius = RadiusValue;
export type BottomSheetColorsInput = Partial<BottomSheetColors>;

/**
 * Snap point — either a numeric pixel height or a percentage
 * string. Same shape as `@expo/ui/community/bottom-sheet`.
 * Android reduces >2 snap points to partial + expanded.
 */
export type BottomSheetSnapPoint = string | number;

export interface BottomSheetRef {
  /** Open the sheet at index 0 (or the given index). */
  present: (index?: number) => void;
  /** Close the sheet. */
  dismiss: () => void;
  /** Snap to a specific index (0-based). */
  snapToIndex: (index: number) => void;
  /** Expand to the last snap point (fully open). */
  expand: () => void;
  /** Collapse to the first snap point. */
  collapse: () => void;
}

export interface BottomSheetProps extends Omit<
  GetProps<typeof StyledBottomSheet>,
  "children" | "onChange" | "onDismiss"
> {
  /**
   * Sheet content. Rendered inside the native sheet body wrapped
   * in a `<BottomSheetView>`. Consumer puts anything (forms,
   * lists, custom UI).
   */
  children: ReactNode;
  /**
   * Snap point heights, in order from smallest to largest.
   * Default `['50%']`. Android supports 2 states max (see plan doc).
   */
  snapPoints?: readonly BottomSheetSnapPoint[];
  /**
   * Fires whenever the sheet snap position changes.
   * `-1` = closed, `0+` = open at snap index.
   */
  onChange?: (index: number) => void;
  /** Fires after the sheet fully dismisses. */
  onDismiss?: () => void;
  /**
   * Whether the sheet can be dismissed via swipe-down or
   * backdrop tap. Default `true`.
   */
  enablePanDownToClose?: boolean;
  /**
   * Fit sheet height to content (no snap points). Cannot combine
   * with explicit `snapPoints`.
   */
  enableDynamicSizing?: boolean;
  /** Corner radius of the sheet's top corners. Default `"lg"`. */
  radius?: BottomSheetRadius;
  /**
   * Per-instance color overrides. Merged on top of provider-
   * resolved palette; unspecified slots fall through.
   */
  bottomSheetColors?: BottomSheetColorsInput;
  /**
   * Root testID. Sub-elements derive:
   * `-sheet`, `-view`, `-missing-peer`.
   */
  testID?: string;
}
```

### Ref via `forwardRef`

Standard React ref forwarding — consumers hold their own `useRef<BottomSheetRef>()` and call methods.

```tsx
const sheetRef = useRef<BottomSheetRef>(null);

<Button onPress={() => sheetRef.current?.present()}>Open</Button>
<BottomSheet ref={sheetRef} snapPoints={['50%', '90%']} onDismiss={handleDismiss}>
  <MyContent />
</BottomSheet>
```

## Color palette — 5 slots (each component owns its color space)

Per the "each component owns its color space" rule, BottomSheet declares its own `BottomSheetColors` block. Small palette because @expo/ui's native sheet owns most chrome (backdrop opacity, handle color are OS-managed on iOS/Android; only web accepts them via vaul).

```ts
export interface BottomSheetColors {
  /** Sheet body background (Android + web; iOS uses system background). */
  background: string;
  /**
   * Backdrop / scrim behind the sheet. Web only — iOS + Android
   * use their OS-native scrim.
   */
  backdrop: string;
  /**
   * Handle indicator color (the drag bar at the top).
   * Web only for now; iOS + Android render the OS-standard handle.
   */
  handle: string;
  /** Missing-peer fallback text color. */
  missingPeer: string;
  /**
   * Optional divider color between sheet body and any consumer-
   * supplied header. Consumers can ignore if their layout doesn't
   * use a divider.
   */
  divider: string;
}
```

## Platform-split file layout (mandatory per skill § 3.5)

```
components/bottom-sheet/
├── bottom-sheet-types.ts               (public props + BottomSheetRef)
├── bottom-sheet-body-types.ts          (per-platform body contract)
├── bottom-sheet-styled.ts              (Tamagui styled root — minimal, native paints most chrome)
├── bottom-sheet.tsx                    (SHELL — palette resolution, ref forwarding, peer probe)
├── bottom-sheet-body.tsx               (fallback body — no @expo/ui)
├── bottom-sheet-body.ios.tsx           (iOS body — @expo/ui community sheet)
├── bottom-sheet-body.android.tsx       (Android body — same, may need Compose Host wrapping)
├── bottom-sheet-body.web.tsx           (web body — same, vaul bundled)
├── expo-ui-bottom-sheet-probe.ts       (try/catch require for @expo/ui/community/bottom-sheet)
├── expo-ui-bottom-sheet-probe.spec.ts  (probe test — both branches)
├── bottom-sheet.spec.tsx               (shell test)
├── bottom-sheet-body.ios.spec.tsx      (iOS body test — modal + ref methods)
├── bottom-sheet-body.android.spec.tsx  (Android body test — modal + ref methods)
├── bottom-sheet.stories.tsx
├── README.md
└── index.ts
```

Even though `@expo/ui`'s bottom-sheet already has per-platform variants, we still split OUR body because native platforms may need per-platform palette wiring (Android accepts `containerColor` via `backgroundStyle`, iOS ignores it, web wants full styles).

## Wiring plan (13 steps — matches DatePicker / DateRangePicker)

1. `docs/BOTTOM-SHEET-PLAN.md` — this doc.
2. `tokens/tokens-types.ts` — add `BottomSheetColors` interface + slot in `Tokens`.
3. `tokens/defaults/bottom-sheet.ts` — `DEFAULT_LIGHT_BOTTOM_SHEET_COLORS` + dark + `mergeBottomSheetColors`.
4. `tokens/defaults/index.ts` — wire defaults into `DEFAULT_TOKENS` / `DEFAULT_DARK_TOKENS`, re-export.
5. `tokens/tokens-derive.ts` — pass through `bottomSheetColors`.
6. `tokens/tokens.ts` — flatten into Tamagui theme + config.
7. `utils/flatten.ts` — `flattenBottomSheetColors`.
8. `provider/provider-types.ts` — `BottomSheetColorsInput` + TokensInput slot.
9. `provider/provider.tsx` — merge in both light + dark reducers.
10. `components/bottom-sheet/` — new folder with all files listed above.
11. `components/index.ts` — re-export.
12. `src/index.ts` — top-level re-export.
13. Example app: `_layout.tsx` route + row on components home + `bottom-sheet.tsx` screen.

Plus a changeset (`.changeset/bottom-sheet-shipped.md`, minor bump).

## Testing plan

Aim for the same coverage as DatePicker (~25 shell tests):

- Renders trigger + sheet skeleton with default testID.
- Ref exposes `present() / dismiss() / snapToIndex() / expand() / collapse()`.
- `present()` opens the sheet at index 0.
- `dismiss()` fires `onDismiss`.
- `snapPoints` prop forwards correctly (default `['50%']`, custom accepted).
- `enablePanDownToClose` prop forwards.
- `enableDynamicSizing` prop forwards.
- `onChange` fires when sheet snap index changes.
- Per-instance `bottomSheetColors` override wins.
- Dark palette on `activeTheme="dark"`.
- Radius forwards + default `"lg"`.
- Missing-peer hint renders when `@expo/ui` isn't available (shell layer).
- Extra Tamagui props flow through (`padding`, `margin`, etc.).
- Children render inside the sheet body.
- Snapshots: closed state, missing-peer fallback.

Plus per-platform body tests (~5 each):

- iOS body: renders `<BottomSheet>` from `@expo/ui` with correct prop forwarding.
- Android body: same for `<BottomSheet>` on Android side.

## Non-goals for v1

- **No inline (non-modal) sheet variant** — `@expo/ui` is modal-only. Add if a real use case surfaces.
- **No `<BottomSheet.Header>` / `<BottomSheet.Actions>` helpers** — pure shell scope. Consumers compose their own headers with `<Text>` / `<Button>`.
- **No 3+ snap points guaranteed on Android** — @expo/ui reduces to partial + expanded. Documented in the README.
- **No custom backdrop / handle components** — @expo/ui doesn't honor these on native. Consumers who need custom chrome fall back to gorhom raw or a follow-up.
- **No SelectBottomSheet migration in this PR** — deferred to follow-up once we validate the new BottomSheet in device.
