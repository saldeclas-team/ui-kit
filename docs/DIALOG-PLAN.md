# Dialog — design record

**Status:** planned for ui-kraken v0.10.0 (Batch 3 alongside Card + Divider + Spinner + Avatar + Badge + ProgressBar). Centered overlay panel for confirmations, forms, and detail views. Complements [`BottomSheet`](./BOTTOM-SHEET-PLAN.md) (bottom-anchored) for cases where the content isn't a bottom-sheet metaphor.

Living design doc for the `Dialog` primitive. Kept post-shipping so future contributors can understand the decisions behind the shape of the API, not just what it does today.

---

## Overview

Centered modal panel. Wraps RN's built-in `<Modal>` and layers palette + backdrop + compound API on top. Named `Dialog` (not `Modal`) to disambiguate from RN's own `Modal` — every consumer imports both and consistent naming avoids the "which Modal is this?" cognitive tax.

**Locked decisions:**

- **Wrap RN's `<Modal>`, don't re-implement.** RN's `<Modal>` handles the native presentation, hardware back button on Android, StatusBar coordination, and RN-Web's DOM portal — all things we'd have to re-invent. Our job is palette + backdrop + centered panel + compound slots.
- **Named `Dialog`, not `Modal`.** RN already exports `Modal`. Shipping our own `Modal` forces consumers into aliased imports (`import { Modal as UIModal }`) and reads confusingly. `Dialog` is the ARIA name for this widget and reads unambiguously.
- **Controlled visibility only.** `visible` + `onClose` — no ref-based imperative API. Consumers already manage the visibility state (`useState<boolean>`), so an imperative `dialogRef.current?.open()` layer would just proxy that state. Controlled is more predictable, avoids the "state in two places" bug, and matches every other controlled component (Select, MultiSelect, Collapsible).
- **Backdrop tap → `onClose`.** Standard iOS + Material dialog behavior. Consumers who want a "must-answer" dialog (no dismiss) simply omit `onClose` or wrap the backdrop tap in domain logic.
- **Fade animation.** RN's `Modal` supports `"none" | "slide" | "fade"`; we default to `fade` for centered dialogs (slide is more sheet-appropriate). Consumers who want a different animation pass it via the spread.
- **Four size presets — `sm` (min 240) / `md` (min 320, default) / `lg` (min 480) / `full` (95% width).** Sizes are `minWidth` (not `width`) + `maxWidth: '95%'` so consumers can constrain small screens without cutting off content. The panel `flex-shrinks` on narrow screens.
- **Compound API — Dialog + Dialog.Header + Dialog.Body + Dialog.Footer.** Same shape as Card. Header takes an optional title + optional close-X button. Body is a scrollable content area. Footer is a horizontal row of action buttons aligned to `flex-end`. Slots are optional — a simple `<Dialog>{children}</Dialog>` works.
- **Own color block — 4 slots: `backdrop`, `background`, `title`, `body`.** Backdrop is the semi-transparent overlay; background is the panel fill; title is the header text color; body is the default body text color (consumers can override per-Text).

## API

### Props

```ts
export type DialogSize = "sm" | "md" | "lg" | "full";

export type DialogColorsInput = Partial<DialogColors>;

export interface DialogProps {
  /** Whether the dialog is visible. Controlled by the consumer. */
  visible: boolean;
  /**
   * Called when the user dismisses the dialog (backdrop tap,
   * Android back button, or the close-X in the header). Omit to
   * prevent dismissal — consumers who need a "must-answer" dialog
   * pass no handler and drive visibility from an explicit action.
   */
  onClose?: () => void;
  /**
   * Size preset. Sets `minWidth`; the panel still shrinks below
   * this on narrow screens (`maxWidth: 95%`). Default: `"md"`.
   */
  size?: DialogSize;
  /**
   * RN Modal animation type. Default: `"fade"`. Passes through to
   * the underlying `<Modal>`; `"slide"` and `"none"` are also
   * valid.
   */
  animationType?: "none" | "slide" | "fade";
  /** Per-instance color override. */
  dialogColors?: DialogColorsInput;
  /** Root testID. Default: `"dialog"`. */
  testID?: string;
  /** Panel content. */
  children?: ReactNode;
}

export interface DialogHeaderProps extends XStackProps {
  /** Title text rendered inside the header. */
  title?: string;
  /**
   * Whether to render a close-X button on the right. When true,
   * pressing it invokes the parent Dialog's `onClose`. Requires
   * the parent Dialog to have `onClose` set.
   */
  showCloseButton?: boolean;
  testID?: string; // default `"dialog-header"`
}

export interface DialogBodyProps extends YStackProps {
  testID?: string; // default `"dialog-body"`
}

export interface DialogFooterProps extends XStackProps {
  testID?: string; // default `"dialog-footer"`
}
```

### Size resolution

| Preset | `minWidth`                 |
| ------ | -------------------------- |
| `sm`   | 240                        |
| `md`   | 320 (default)              |
| `lg`   | 480                        |
| `full` | 0 (relies on maxWidth 95%) |

Every preset sets `maxWidth: "95%"` — panel shrinks on narrow screens.

### Compound access

```tsx
<Dialog visible={open} onClose={() => setOpen(false)}>
  <Dialog.Header title="Delete file?" showCloseButton />
  <Dialog.Body>
    <Text>This action can't be undone.</Text>
  </Dialog.Body>
  <Dialog.Footer>
    <Button tone="ghost" onPress={() => setOpen(false)}>
      Cancel
    </Button>
    <Button tone="danger" onPress={handleDelete}>
      Delete
    </Button>
  </Dialog.Footer>
</Dialog>
```

### Simple usage

Slots are optional. A `<Dialog>{content}</Dialog>` wraps arbitrary children with the standard padding + centered layout:

```tsx
<Dialog visible={open} onClose={close}>
  <Text>Simple content, no header/footer.</Text>
</Dialog>
```

### Sub-element testIDs

- Root: `"dialog"` (overridable via `testID`).
- Backdrop: `"{root}-backdrop"`.
- Panel: `"{root}-panel"`.
- Header: `"dialog-header"` (or `"dialog-header-close"` for the close-X sub-slot).
- Body: `"dialog-body"`.
- Footer: `"dialog-footer"`.

### A11y

- Panel: `accessibilityRole="alert"` when the Dialog reads as an alert; consumers override for `"none"` or `"dialog"`. Default: `"none"` (RN doesn't yet expose an `"dialog"` role; RN-Web maps to ARIA).
- Backdrop: `accessibilityLabel="Close dialog"` + tap dispatches `onClose`.
- Close-X button (in header): `accessibilityLabel="Close"` + `accessibilityRole="button"`.

## Token schema

`dialogColors` — 4 slots:

| Slot         | Paints                                    |
| ------------ | ----------------------------------------- |
| `backdrop`   | Semi-transparent overlay behind the panel |
| `background` | Panel fill color                          |
| `title`      | Header title text                         |
| `body`       | Default body text color                   |

### Default light palette

```ts
{
  backdrop: "rgba(0, 0, 0, 0.5)",
  background: "#FFFFFF",
  title: "#111827",
  body: "#374151",
}
```

### Default dark palette

```ts
{
  backdrop: "rgba(0, 0, 0, 0.7)",
  background: "#1F2937",
  title: "#F9FAFB",
  body: "#D1D5DB",
}
```

### Merge helper

`mergeDialogColors(base, override?)` — same shape as every other merge helper. Early-return when `override` is null.

## File structure

```
packages/ui-kraken/src/components/dialog/
  ├─ dialog-types.ts            # DialogProps + DialogHeaderProps + DialogBodyProps + DialogFooterProps + DialogSize
  ├─ dialog.tsx                 # Component + compound Header/Body/Footer + resolveDialogMinWidth helper
  ├─ dialog.spec.tsx            # 100% coverage
  ├─ dialog.stories.tsx         # Storybook stories
  ├─ README.md                  # Consumer-facing docs
  ├─ __snapshots__/             # Auto-generated
  └─ index.ts                   # Barrel

packages/ui-kraken/src/tokens/defaults/dialog.ts   # Palettes + mergeDialogColors + spec
```

## Testing

### Behavioral coverage (~15 tests)

- Renders nothing when `visible={false}`.
- Renders panel + backdrop when `visible={true}`.
- Custom `testID` overrides + propagates to backdrop / panel.
- Backdrop tap invokes `onClose`.
- Backdrop tap is a no-op when `onClose` is not set.
- Compound: Header renders title + optional close-X.
- Close-X press invokes parent's `onClose`.
- Compound: Body renders children.
- Compound: Footer renders children right-aligned.
- Size resolution: each preset → correct minWidth (sm=240, md=320, lg=480, full=0).
- Palette resolution: backdrop / background / title / body from provider.
- Per-instance override wins.
- Provider-level override propagates.
- Dark theme resolves dark palette.
- A11y: backdrop label + close button label + panel role.

### Structural snapshots (~4)

- Compound (Header + Body + Footer, md).
- Simple (children only, sm).
- Large size (lg).
- Dark theme × md compound.

### Defaults spec (`defaults/dialog.spec.ts`)

Same shape as other defaults specs — 4 tests covering both merge branches + light-vs-dark palette sanity.

## Storybook (~7 stories)

- `Simple` — no compound slots.
- `Compound` — Header + Body + Footer with real actions.
- `WithCloseButton` — Header with `showCloseButton`.
- `Sizes` — sm / md / lg / full toggle.
- `NoDismiss` — omits `onClose` (backdrop tap does nothing).
- `CustomColors` — brand-tinted panel + backdrop.
- `DarkTheme` — dark palette via `<Theme name="dark">`.

## Example app screen

`apps/example/app/(pages)/components/dialog.tsx` — 4 sections:

1. Simple confirmation — "Are you sure?" with Cancel + Confirm buttons.
2. With close-X button — settings-style modal with a header close.
3. Size showcase — buttons that open sm / md / lg / full dialogs.
4. Must-answer — no `onClose`, only dismissable via a "Got it" button.

## Non-goals

- **No ref-based imperative API.** Controlled visibility is more predictable and matches every other controlled component in ui-kraken.
- **No bottom-anchored variant.** `<BottomSheet>` covers that use case.
- **No `variant` prop for alert/confirm/prompt styles.** Compound slots + tone-appropriate buttons in the footer let consumers compose these without an API branch. A future `<AlertDialog>` primitive could ship if we see the pattern repeat.
- **No stacked / nested dialogs.** RN's `<Modal>` doesn't guarantee correct z-index for nested modals on all platforms. Consumers who need stacking use custom logic outside of Dialog.
- **No auto-focus first input.** RN's focus management is inconsistent across platforms and would need per-platform code we don't have appetite for right now.
- **No `overlayClickThrough` / `pointerEvents="box-none"` mode.** Consumers who need this reach for a custom overlay component.
