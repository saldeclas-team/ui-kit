/**
 * Color slots for one Button variant. Each variant fills only the slots that
 * apply to it: `primary` / `secondary` / `destructive` use `background + label`;
 * `outline` uses `border + label`; `ghost` uses `label` only.
 *
 * There is no separate `inactive` / `disabled` slot — the Button component
 * applies `opacity: 0.45` when disabled or loading, which works uniformly
 * across every variant. If a consumer needs a truly custom disabled color
 * they can pass it per-instance via `buttonColors.background`.
 */
export interface ButtonVariantColors {
  /** Surface color. Ignored by `outline` and `ghost`. */
  background?: string;
  /** Label / text color. Every variant uses this. */
  label: string;
  /** Border color. Only `outline` renders a border. */
  border?: string;
}

/**
 * All Button variant palettes. Every field is required at the provider level
 * so the theme is always fully populated. Consumers who only want to change
 * some values do `<UIKitProvider buttonColors={{ primary: {...} }}>` and the
 * missing variants merge with the defaults (see `mergeButtonColors`).
 */
export interface ButtonColors {
  primary: ButtonVariantColors;
  secondary: ButtonVariantColors;
  outline: ButtonVariantColors;
  ghost: ButtonVariantColors;
  destructive: ButtonVariantColors;
}

/**
 * Text-color palette exposed to standalone `<Text>` components. Fourteen
 * slots grouped in three semantic buckets:
 *
 * - **Hierarchy (5)** — `primary`, `secondary`, `tertiary`, `disabled`, `inverse`.
 *   For content on standard app surfaces. `inverse` is the text color meant
 *   for a surface whose background contrasts against the active theme
 *   (e.g. dark text on a light card in dark mode).
 * - **Semantic (5)** — `interactive`, `success`, `warning`, `danger`, `info`.
 *   Meaning-carrying slots for links, feedback messages, etc.
 * - **On-* (4)** — `onPrimary`, `onSecondary`, `onSuccess`, `onDanger`. Text
 *   colors used specifically when the text sits on top of a solid brand
 *   surface (e.g. label inside a filled Button, colored Alert container).
 *   Auto-contrast is intentionally NOT applied — consumers pick the right
 *   `on-*` explicitly.
 */
export interface TextColors {
  primary: string;
  secondary: string;
  tertiary: string;
  disabled: string;
  inverse: string;
  interactive: string;
  success: string;
  warning: string;
  danger: string;
  info: string;
  onPrimary: string;
  onSecondary: string;
  onSuccess: string;
  onDanger: string;
}

/**
 * Color slots for one Alert variant. All four semantic variants (info /
 * success / warning / danger) fill the same slot set. `background`, `text`,
 * and `icon` are required; `border` is optional (undefined = no border
 * renders on the row).
 *
 * There is no separate `disabled` slot — Alert is display-only in v1;
 * disabled state is not a concept. If a consumer needs a muted alert they
 * pass a per-instance `alertColors` override with lower-contrast values.
 */
export interface AlertVariantColors {
  /** Row background color. */
  background: string;
  /** Title + body text color. */
  text: string;
  /** Icon glyph color (applied via wrapper `color` prop). */
  icon: string;
  /** Optional border color. When set, a 1 px border renders. */
  border?: string;
}

/**
 * All Alert variant palettes. Every field is required at the provider level
 * so the theme is always fully populated. Consumers who only want to change
 * some variants do `<UIKitProvider alertColors={{ danger: {...} }}>` and the
 * missing variants merge with the defaults (see `mergeAlertColors`).
 */
export interface AlertColors {
  info: AlertVariantColors;
  success: AlertVariantColors;
  warning: AlertVariantColors;
  danger: AlertVariantColors;
}

/**
 * Input color palette. Slot-based (no variants — Input has a single
 * visual pattern with state-driven surface changes handled by the
 * component logic itself). 11 slots cover every surface + state
 * combination the wrapper and inner elements paint.
 */
export interface InputColors {
  /** Wrapper background color in the default and focused states. */
  background: string;
  /** Wrapper background color in the disabled state. */
  backgroundDisabled: string;
  /** Border color in the default state (unfocused, no error). */
  border: string;
  /** Border color when the input has focus. */
  borderFocused: string;
  /** Border color when `error` is set. Overrides `borderFocused`. */
  borderError: string;
  /** Text color for the value typed in the input. */
  text: string;
  /** Text color when `disabled`. */
  textDisabled: string;
  /** Placeholder text color. */
  placeholder: string;
  /** Bold label text color (rendered above the input). */
  label: string;
  /** Muted helper text color (rendered below the input when no error). */
  helperText: string;
  /** Error text color (rendered below the input when `error` is set). */
  errorText: string;
}

/**
 * RefreshControl color palette. Slot-based, 3 slots that wire to the
 * platform-specific `RefreshControl` props:
 *
 * - `spinner`    → iOS `tintColor` + Android `colors={[spinner]}`
 * - `background` → Android `progressBackgroundColor` (no iOS equivalent)
 * - `title`      → iOS `titleColor` (only rendered when `title` prop set)
 */
export interface RefreshControlColors {
  /** The spinning ring / arrows color (iOS tintColor + Android colors[0]). */
  spinner: string;
  /** Android-only: circular background behind the spinner. */
  background: string;
  /** iOS-only: title text color (rendered when the `title` prop is set). */
  title: string;
}

/**
 * Surface color palette. Slot-based, 4 semantic elevation levels each
 * with a single background color. Inspired by Material 3's
 * SurfaceContainer scale but simpler (4 levels, no auto-tint math, no
 * shadow bindings).
 */
export interface SurfaceColors {
  /** Standard app background. */
  base: string;
  /** Cards, list items, elevated content on top of the base surface. */
  raised: string;
  /** Modals, sheets, dropdowns — highest visual layer. */
  overlay: string;
  /** Inset areas — form sections, code blocks, muted regions. */
  sunken: string;
}

/**
 * Skeleton color palette. 2 slots — the fill at rest (`base`) and the
 * peak of the pulse animation (`highlight`). Both typically alpha-tinted
 * grays that read as "loading" against any surface.
 */
export interface SkeletonColors {
  /** Fill at rest. Also the resting color in `variant="static"`. */
  base: string;
  /** Peak of the pulse animation (the top of the opacity crossfade). */
  highlight: string;
}

/**
 * Color slots for one Hint tone. All five tones (neutral / info /
 * success / warning / danger) fill the same 3-slot set. `text` +
 * `icon` are used in both `emphasis="ghost"` and `"soft"` modes;
 * `background` is only painted in `soft` mode.
 */
export interface HintToneColors {
  /** Title + body text color. */
  text: string;
  /** Icon glyph color (applied via wrapper `color` prop). */
  icon: string;
  /** Row background — only rendered when `emphasis="soft"`. */
  background: string;
}

/**
 * All Hint tone palettes. Every field is required at the provider level
 * so the theme is always fully populated. Consumers who only want to
 * change some tones do `<UIKitProvider hintColors={{ danger: {...} }}>`
 * and the missing tones merge with the defaults (see `mergeHintColors`).
 */
export interface HintColors {
  neutral: HintToneColors;
  info: HintToneColors;
  success: HintToneColors;
  warning: HintToneColors;
  danger: HintToneColors;
}

/**
 * Select color palette. Slot-based, 16 slots. Groupings:
 *
 * - Trigger chrome (9): background + backgroundDisabled + border +
 *   borderFocused (painted while the modal is open) + borderError +
 *   text + textDisabled + placeholder + chevron.
 * - Surrounding labels (3): label / helperText / errorText.
 * - Modal chrome (3): overlayBackground (backdrop) + menuBackground
 *   (card panel) + menuTitle.
 * - Options shared (1): optionSelectedBackground (row highlight for
 *   the currently-selected option).
 */
export interface SelectColors {
  /** Trigger background in default + focused states. */
  background: string;
  /** Trigger background when `disabled`. */
  backgroundDisabled: string;
  /** Trigger border in default state. */
  border: string;
  /** Trigger border while the modal is open. */
  borderFocused: string;
  /** Trigger border when `errorText` is set. Overrides borderFocused. */
  borderError: string;
  /** Selected-value text color. */
  text: string;
  /** Text color when the trigger is `disabled`. */
  textDisabled: string;
  /** Placeholder text color (shown when value is null). */
  placeholder: string;
  /** Trailing chevron color. */
  chevron: string;
  /** Bold label text color (rendered above the trigger). */
  label: string;
  /** Muted helper text color (rendered below the trigger when no error). */
  helperText: string;
  /** Error text color (rendered below the trigger when `errorText` is set). */
  errorText: string;
  /** Backdrop color behind the modal panel. */
  overlayBackground: string;
  /** Modal card panel background. */
  menuBackground: string;
  /** Optional modal title text color. */
  menuTitle: string;
  /** Row highlight for the currently-selected option in the modal list. */
  optionSelectedBackground: string;
}

/**
 * DatePicker color palette. Slot-based, 13 slots. Groupings:
 *
 * - **Trigger chrome (9)**: `background`, `backgroundDisabled`,
 *   `border`, `borderFocused` (painted while the picker is
 *   open), `borderError`, `text` (selected date/time), `textDisabled`,
 *   `placeholder` (empty state), `chevron`.
 * - **Surrounding labels (3)**: `label`, `helperText`, `errorText`.
 * - **Native picker tint (1)**: `accent` — passed to `@expo/ui`
 *   as `accentColor` to tint the highlighted date on both platforms.
 *
 * iOS modal chrome (backdrop, sheet background, Done button)
 * uses hardcoded reasonable defaults for v1 — add slots in a
 * follow-up if theming demand emerges.
 */
export interface DatePickerColors {
  background: string;
  backgroundDisabled: string;
  border: string;
  borderFocused: string;
  borderError: string;
  text: string;
  textDisabled: string;
  placeholder: string;
  chevron: string;
  label: string;
  helperText: string;
  errorText: string;
  /** Tint applied to the native picker's highlighted date / time. */
  accent: string;
}

/**
 * DateRangePicker color palette. Slot-based, 14 slots. Same shape
 * as `DatePickerColors` (both bounds render identical triggers)
 * plus one range-specific slot:
 *
 * - **Trigger chrome (9)** + **Surrounding labels (3)** + **Native
 *   picker tint (1)** — identical to `DatePickerColors`. Applied
 *   uniformly to BOTH the start and end triggers.
 * - **Range-specific (1)**: `separator` — glyph rendered between
 *   the two triggers when `orientation="horizontal"` (an arrow,
 *   dash, etc.). Ignored in the vertical layout.
 *
 * Per the "each component owns its color space" rule, this block
 * is intentionally duplicated from `DatePickerColors` rather than
 * reused — DateRangePicker's palette can evolve independently
 * (e.g. adding a separator slot is transparent to DatePicker).
 */
export interface DateRangePickerColors {
  background: string;
  backgroundDisabled: string;
  border: string;
  borderFocused: string;
  borderError: string;
  text: string;
  textDisabled: string;
  placeholder: string;
  chevron: string;
  label: string;
  helperText: string;
  errorText: string;
  /** Tint applied to the native picker's highlighted date / time. */
  accent: string;
  /**
   * Glyph color for the between-triggers separator in horizontal
   * orientation. No effect when `orientation="vertical"`.
   */
  separator: string;
}

/**
 * BottomSheet color palette. Slot-based, 5 slots. Small palette
 * because `@expo/ui/community/bottom-sheet` renders the native
 * sheet (SwiftUI sheet on iOS, Material 3 ModalBottomSheet on
 * Android) which OWNS most of its chrome — handle indicator,
 * backdrop opacity, corner radius are OS-managed on native. Web
 * (via vaul) accepts our styles fully.
 *
 * Per-slot platform notes:
 *
 * - **`background`**: sheet body background. Android accepts
 *   this via `containerColor` on `ModalBottomSheet`. iOS ignores
 *   (SwiftUI sheet uses system background — always follows dark
 *   mode). Web full support.
 * - **`backdrop`**: scrim behind the sheet. Web only — iOS and
 *   Android use their OS-native scrim color which is not themable.
 * - **`handle`**: drag indicator color at the top of the sheet.
 *   Web only for now; iOS + Android render the OS-standard
 *   handle (light gray, non-themable).
 * - **`divider`**: optional divider color between sheet body and
 *   a consumer-supplied header. Consumers ignore if their layout
 *   doesn't use a divider.
 * - **`missingPeer`**: text color for the "install `@expo/ui`"
 *   fallback hint (rendered when the peer isn't installed).
 */
export interface BottomSheetColors {
  background: string;
  backdrop: string;
  handle: string;
  divider: string;
  missingPeer: string;
}

/**
 * ImagePickerSheet color palette. Slot-based, 8 slots.
 *
 * Split into three groupings:
 *
 * - **Sheet chrome (2)**: `sheetBackground`, `sheetHandle` —
 *   forwarded to the internally composed `<BottomSheet>`. Same
 *   pattern as `SelectBottomSheetColors` — this component owns
 *   its own sheet chrome slots and maps them onto BottomSheet's
 *   smaller palette when it composes.
 * - **Action rows (5)**: `actionBackground` +
 *   `actionBackgroundPressed`, `actionText`, `actionIcon`,
 *   `cancelText` (destructive tone for the Cancel row per iOS
 *   action-sheet convention), `divider` (thin line between rows).
 * - **Missing peer (1)**: text color for the "install
 *   expo-image-picker" fallback hint.
 */
export interface ImagePickerSheetColors {
  sheetBackground: string;
  sheetHandle: string;
  actionBackground: string;
  actionBackgroundPressed: string;
  actionText: string;
  actionIcon: string;
  cancelText: string;
  divider: string;
}

/**
 * ScreenContainer color palette. Slot-based, 3 slots. Small
 * palette because ScreenContainer is layout ceremony, not chrome
 * — the only visible surface is the container background.
 *
 * - **`background`** — fills the whole screen (including the
 *   safe-area inset zones, so the color extends behind the
 *   status bar / home indicator instead of leaving them black).
 * - **`statusBarBackground`** — Android status-bar background
 *   applied via `StatusBar.setBackgroundColor()` when the
 *   `statusBarStyle` prop is set. Ignored on iOS (translucent
 *   by default) and web.
 * - **`fallbackPadding`** — reserved token slot for the JS-side
 *   fallback when `react-native-safe-area-context` isn't
 *   installed. Not a color but a documented sentinel that the
 *   fallback exists. See the component doc for the numeric
 *   defaults.
 */
export interface ScreenContainerColors {
  background: string;
  statusBarBackground: string;
  fallbackPadding: string;
}

/**
 * SegmentedControl color palette. Slot-based, 9 slots. Split into
 * shared vs. Android-only chrome:
 *
 * - **Shared (3)**: `label`, `helperText`, `errorText` — the
 *   text rendered by ui-kraken around the native control.
 *   Themable on every platform.
 * - **Android chrome (6)**: `containerBackground`, `containerBorder`,
 *   `selectedBackground`, `selectedLabel`, `unselectedLabel`,
 *   `ripple` — used ONLY by the Android body (which is a pure-JS
 *   Material 3 implementation because @expo/ui's Compose bridge
 *   has a tap-through interop bug — see plan doc).
 *
 * The iOS body uses SwiftUI `UISegmentedControl` and ignores the
 * Android-only slots (SwiftUI owns its own chrome). Slots are
 * kept in one block per the "each component owns its color
 * space" rule — consumers get one predictable override surface.
 */
export interface SegmentedControlColors {
  /** Bold label text color rendered above the control. */
  label: string;
  /** Muted helper text color rendered below the control when no error. */
  helperText: string;
  /** Error text color rendered below the control when `errorText` is set. Also colors the missing-peer hint. */
  errorText: string;
  /** [Android only] Background of the outer pill container. Ignored on iOS. */
  containerBackground: string;
  /** [Android only] Border color of the outer pill container. Ignored on iOS. */
  containerBorder: string;
  /** [Android only] Fill color of the sliding selection pill. Ignored on iOS. */
  selectedBackground: string;
  /** [Android only] Text color for the selected segment. Ignored on iOS. */
  selectedLabel: string;
  /** [Android only] Text color for unselected segments. Ignored on iOS. */
  unselectedLabel: string;
  /** [Android only] Ripple color for the press feedback overlay. Ignored on iOS. */
  ripple: string;
}

/**
 * SelectBottomSheet color palette. Slot-based, 15 slots. Groupings
 * mirror [[SelectColors]] except the modal-chrome triplet is
 * replaced by a sheet-chrome triplet: `sheetBackground` for the
 * panel, `sheetHandle` for the drag-affordance, `sheetTitle` for
 * the optional title row.
 *
 * - Trigger chrome (9): background + backgroundDisabled + border +
 *   borderFocused (painted while the sheet is open) + borderError +
 *   text + textDisabled + placeholder + chevron.
 * - Surrounding labels (3): label / helperText / errorText.
 * - Sheet chrome (3): sheetBackground + sheetHandle + sheetTitle.
 */
export interface SelectBottomSheetColors {
  /** Trigger background in default + focused states. */
  background: string;
  /** Trigger background when `disabled`. */
  backgroundDisabled: string;
  /** Trigger border in default state. */
  border: string;
  /** Trigger border while the sheet is open. */
  borderFocused: string;
  /** Trigger border when `errorText` is set. Overrides borderFocused. */
  borderError: string;
  /** Selected-value text color. */
  text: string;
  /** Text color when the trigger is `disabled`. */
  textDisabled: string;
  /** Placeholder text color (shown when value is null). */
  placeholder: string;
  /** Trailing chevron color. */
  chevron: string;
  /** Bold label text color (rendered above the trigger). */
  label: string;
  /** Muted helper text color (rendered below the trigger when no error). */
  helperText: string;
  /** Error text color (rendered below the trigger when `errorText` is set). */
  errorText: string;
  /** Sheet panel background. */
  sheetBackground: string;
  /** Drag-handle indicator bar at the top of the sheet. */
  sheetHandle: string;
  /** Row highlight for the currently-selected option in the sheet list. */
  optionSelectedBackground: string;
}

/**
 * SelectNative color palette. Slot-based, 11 slots. Smaller than
 * [[SelectColors]] because the native menu popup (SwiftUI `Menu`
 * on iOS, Compose `DropdownMenu` on Android) still owns its own
 * interior chrome — checkmark tint, popup background, row hover.
 *
 * We own the wrapper frame + surrounding text + the trigger
 * itself (we render our own `Text` + chevron inside `MenuView`
 * so RN layout stays deterministic and doesn't hit the
 * SwiftUI-Menu measurement race).
 */
export interface SelectNativeColors {
  /** Bold label text color rendered above the trigger frame. */
  label: string;
  /** Wrapper frame background in default state. */
  background: string;
  /** Wrapper frame background when `disabled`. */
  backgroundDisabled: string;
  /** Wrapper frame border in default state. */
  border: string;
  /** Wrapper frame border when `errorText` is set. */
  borderError: string;
  /** Selected-value text color inside the trigger. */
  text: string;
  /** Trigger text color when `disabled`. */
  textDisabled: string;
  /** Placeholder text color inside the trigger (when value is null). */
  placeholder: string;
  /** Trailing chevron color. */
  chevron: string;
  /** Muted helper text color rendered below the frame when no error. */
  helperText: string;
  /** Error text color rendered below the frame when `errorText` is set. */
  errorText: string;
}

/**
 * ExternalLink color palette. Slot-based, 2 slots — text label
 * (underline color is derived from `label` automatically via
 * `textDecorationColor`) and icon.
 */
export interface ExternalLinkColors {
  /** Label text color + underline color. */
  label: string;
  /** Icon color (both leading + trailing). */
  icon: string;
}

/**
 * Collapsible color palette. Slot-based, 6 slots — 4 for the
 * header chrome (`headerBackground`, `title`, `icon`, `chevron`)
 * plus `bodyBackground` for the expandable region and `border`
 * for the outer 1 px card outline.
 */
export interface CollapsibleColors {
  /** Header row background. */
  headerBackground: string;
  /** Header title text color. */
  title: string;
  /** Leading icon color (when `icon` prop passed). */
  icon: string;
  /** Trailing chevron color. */
  chevron: string;
  /** Body region background. */
  bodyBackground: string;
  /** Outer 1 px border around the whole card. */
  border: string;
}

/**
 * Color slots for one SocialButton provider (`google` / `apple` /
 * etc.). All six providers fill the same 3-slot set. `background`
 * paints the button fill, `label` paints the text + loader spinner,
 * `border` paints the 1 px outline.
 */
export interface SocialButtonProviderColors {
  /** Button background color. */
  background: string;
  /** Button label + loader spinner color. */
  label: string;
  /** Border color. `background === border` for solid buttons; different for outlined. */
  border: string;
}

/**
 * All SocialButton provider palettes. Every field is required at
 * the provider level so the theme is always fully populated.
 * Consumers who only want to change some providers do
 * `<UIKitProvider socialButtonColors={{ google: {...} }}>` and the
 * missing providers merge with the defaults (see
 * `mergeSocialButtonColors`).
 */
export interface SocialButtonColors {
  google: SocialButtonProviderColors;
  apple: SocialButtonProviderColors;
  facebook: SocialButtonProviderColors;
  github: SocialButtonProviderColors;
  microsoft: SocialButtonProviderColors;
  generic: SocialButtonProviderColors;
}

/**
 * MultiSelect color palette. Slot-based, 9 slots — 3 for selected
 * chip state (`selectedBackground`, `selectedLabel`, `selectedBorder`),
 * 3 for unselected (`unselectedBackground`, `unselectedLabel`,
 * `unselectedBorder`), plus `groupLabel` above and `helperText` /
 * `errorText` below.
 */
export interface MultiSelectColors {
  /** Chip background when selected. */
  selectedBackground: string;
  /** Chip label text color when selected. */
  selectedLabel: string;
  /** Chip border color when selected. */
  selectedBorder: string;
  /** Chip background when unselected. */
  unselectedBackground: string;
  /** Chip label text color when unselected. */
  unselectedLabel: string;
  /** Chip border color when unselected. */
  unselectedBorder: string;
  /** Bold heading above the chip row. */
  groupLabel: string;
  /** Muted helper copy below the chip row. */
  helperText: string;
  /** Error copy below the chip row (overrides helperText when `errorText` set). */
  errorText: string;
}

/**
 * StatCard color palette. Slot-based, 8 slots that cover the card
 * background, three text tiers (title / value / description), the
 * icon-slot wrapper color, and three trend-arrow colors driven by
 * the `trend` prop.
 */
export interface StatCardColors {
  /** Card background color. */
  background: string;
  /** Small heading rendered above the value. */
  title: string;
  /** Main metric text. */
  value: string;
  /** Secondary caption below the delta row. */
  description: string;
  /** Icon-slot wrapper color (consumer's icon inherits). */
  icon: string;
  /** Arrow + delta text color when `trend="up"`. */
  trendUp: string;
  /** Arrow + delta text color when `trend="down"`. */
  trendDown: string;
  /** Arrow + delta text color when `trend="neutral"`. */
  trendNeutral: string;
}

/**
 * CurrencyInput color palette. Slot-based. Mirrors `InputColors` plus a
 * `prefix` slot for the currency-symbol text color (the `"$"` / `"€"` /
 * etc. that renders inside the wrapper next to the number).
 */
export interface CurrencyInputColors {
  /** Wrapper background color in the default + focused states. */
  background: string;
  /** Wrapper background color in the disabled state. */
  backgroundDisabled: string;
  /** Border color in the default state (unfocused, no error). */
  border: string;
  /** Border color when the input has focus. */
  borderFocused: string;
  /** Border color when `error` is set. Overrides `borderFocused`. */
  borderError: string;
  /** Text color for the value typed in the input. */
  text: string;
  /** Text color when `disabled`. */
  textDisabled: string;
  /** Placeholder text color. */
  placeholder: string;
  /** Currency prefix text color (the "$" glyph inside the wrapper). */
  prefix: string;
  /** Bold label text color (rendered above the input). */
  label: string;
  /** Muted helper text color (rendered below the input when no error). */
  helperText: string;
  /** Error text color (rendered below the input when `error` is set). */
  errorText: string;
}

/**
 * RadioGroup color palette. Slot-based (no variants — RadioGroup has a
 * single visual pattern, just different states per option).
 *
 * - Selected + unselected borders paint both the outer row card and the
 *   inner ring around the dot — one color pair covers both surfaces.
 * - `dot` is the filled inner dot on the currently-selected option.
 * - `label` is the option label text; `groupLabel` is the bold heading
 *   above the group (rendered when the `label` prop is passed).
 * - Backgrounds are optional. Undefined means "transparent row".
 */
export interface RadioGroupColors {
  /** Ring border + row border when the option is selected. */
  selectedBorder: string;
  /** Ring border + row border when the option is NOT selected. */
  unselectedBorder: string;
  /** Inner filled dot on the selected option. */
  dot: string;
  /** Option label text color. */
  label: string;
  /** Group heading text color (the `label` prop on `<RadioGroup>`). */
  groupLabel: string;
  /** Subtle row background tint when option is selected. Optional. */
  selectedBackground?: string;
  /** Row background when option is NOT selected. Optional (transparent). */
  unselectedBackground?: string;
}

/**
 * Coarse token schema exposed to consumers of `<UIKitProvider>`.
 * Ships Button (`buttonColors`), Text (`textColors`), Alert
 * (`alertColors`), and RadioGroup (`radioGroupColors`) blocks. Future
 * minor releases will add `cardColors`, `inputColors`, etc. — grouped by
 * component role in the same way, one block per component that owns its
 * color space.
 */
export interface Tokens {
  buttonColors: ButtonColors;
  textColors: TextColors;
  alertColors: AlertColors;
  radioGroupColors: RadioGroupColors;
  inputColors: InputColors;
  currencyInputColors: CurrencyInputColors;
  surfaceColors: SurfaceColors;
  refreshControlColors: RefreshControlColors;
  skeletonColors: SkeletonColors;
  hintColors: HintColors;
  statCardColors: StatCardColors;
  multiSelectColors: MultiSelectColors;
  socialButtonColors: SocialButtonColors;
  collapsibleColors: CollapsibleColors;
  externalLinkColors: ExternalLinkColors;
  selectColors: SelectColors;
  selectNativeColors: SelectNativeColors;
  selectBottomSheetColors: SelectBottomSheetColors;
  segmentedControlColors: SegmentedControlColors;
  datePickerColors: DatePickerColors;
  dateRangePickerColors: DateRangePickerColors;
  bottomSheetColors: BottomSheetColors;
  imagePickerSheetColors: ImagePickerSheetColors;
  screenContainerColors: ScreenContainerColors;
  radius: number;
  spacing: number;
}

/**
 * Result of resolving the coarse schema into what components read at runtime.
 * Colors pass through as-is; kept as a separate type so we can add derived
 * scales later without breaking the provider contract.
 */
export interface ResolvedTokens {
  buttonColors: ButtonColors;
  textColors: TextColors;
  alertColors: AlertColors;
  radioGroupColors: RadioGroupColors;
  inputColors: InputColors;
  currencyInputColors: CurrencyInputColors;
  surfaceColors: SurfaceColors;
  refreshControlColors: RefreshControlColors;
  skeletonColors: SkeletonColors;
  hintColors: HintColors;
  statCardColors: StatCardColors;
  multiSelectColors: MultiSelectColors;
  socialButtonColors: SocialButtonColors;
  collapsibleColors: CollapsibleColors;
  externalLinkColors: ExternalLinkColors;
  selectColors: SelectColors;
  selectNativeColors: SelectNativeColors;
  selectBottomSheetColors: SelectBottomSheetColors;
  segmentedControlColors: SegmentedControlColors;
  datePickerColors: DatePickerColors;
  dateRangePickerColors: DateRangePickerColors;
  bottomSheetColors: BottomSheetColors;
  imagePickerSheetColors: ImagePickerSheetColors;
  screenContainerColors: ScreenContainerColors;
  radius: {
    sm: number;
    md: number;
    lg: number;
    pill: number;
  };
  space: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
}
