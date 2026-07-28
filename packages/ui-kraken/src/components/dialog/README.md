# Dialog

Centered overlay panel for confirmations, forms, and detail views. Wraps RN's built-in `<Modal>` with palette + backdrop + compound API. Complements [`BottomSheet`](../bottom-sheet/README.md) (bottom-anchored) for cases where content isn't a sheet metaphor.

Named `Dialog` (not `Modal`) to disambiguate from RN's own `Modal` — every consumer imports both, and consistent naming avoids the "which Modal is this?" cognitive tax.

## Import

```tsx
import { Dialog } from "ui-kraken";
```

## Props

### `<Dialog>`

| Prop            | Type                             | Default    | Description                                                               |
| --------------- | -------------------------------- | ---------- | ------------------------------------------------------------------------- |
| `visible`       | `boolean`                        | —          | Whether the dialog is visible (controlled by consumer).                   |
| `onClose`       | `() => void`                     | —          | Called on backdrop tap / Android back / close-X. Omit to prevent dismiss. |
| `size`          | `"sm" \| "md" \| "lg" \| "full"` | `"md"`     | Panel `minWidth` preset. `maxWidth` stays at 95% always.                  |
| `animationType` | `"none" \| "slide" \| "fade"`    | `"fade"`   | RN Modal animation. Fade suits centered dialogs; slide is sheet-like.     |
| `dialogColors`  | `Partial<DialogColors>`          | —          | Per-instance color override.                                              |
| `testID`        | `string`                         | `"dialog"` | Root testID.                                                              |

### `<Dialog.Header>` / `<Dialog.Body>` / `<Dialog.Footer>`

Each slot extends its stack primitive props (`XStackProps` for Header + Footer, `YStackProps` for Body), plus a `testID` override.

`Dialog.Header` additionally accepts:

- `title?: string` — renders as the header label.
- `showCloseButton?: boolean` — renders an "×" button on the right that invokes the parent Dialog's `onClose`.

## Size resolution

| Preset | `minWidth`                    |
| ------ | ----------------------------- |
| `sm`   | 240                           |
| `md`   | 320 (default)                 |
| `lg`   | 480                           |
| `full` | 0 (relies on `maxWidth: 95%`) |

All sizes cap `maxWidth` at 95% so the panel shrinks on narrow screens.

## Color model

`dialogColors` — 4 slots:

| Slot         | Paints                                    |
| ------------ | ----------------------------------------- |
| `backdrop`   | Semi-transparent overlay behind the panel |
| `background` | Panel fill color                          |
| `title`      | Header title text                         |
| `body`       | Default body text color                   |

### Default palettes

- **Light**: `backdrop: "rgba(0, 0, 0, 0.5)"`, `background: "#FFFFFF"`, `title: "#111827"`, `body: "#374151"`.
- **Dark**: `backdrop: "rgba(0, 0, 0, 0.7)"`, `background: "#1F2937"`, `title: "#F9FAFB"`, `body: "#D1D5DB"`.

## Usage

### Compound — confirmation dialog

```tsx
import { Dialog, Button, Text } from "ui-kraken";
import { useState } from "react";

function DeleteConfirm() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button tone="destructive" onPress={() => setOpen(true)}>
        Delete
      </Button>
      <Dialog visible={open} onClose={() => setOpen(false)}>
        <Dialog.Header title="Delete file?" showCloseButton />
        <Dialog.Body>
          <Text>This action can't be undone.</Text>
        </Dialog.Body>
        <Dialog.Footer>
          <Button tone="ghost" onPress={() => setOpen(false)}>
            Cancel
          </Button>
          <Button tone="destructive" onPress={handleDelete}>
            Delete
          </Button>
        </Dialog.Footer>
      </Dialog>
    </>
  );
}
```

### Simple — no compound slots

```tsx
<Dialog visible={open} onClose={close}>
  <Text>Simple content, no header/footer.</Text>
</Dialog>
```

### Must-answer (no dismiss)

Omit `onClose` — backdrop tap becomes a no-op:

```tsx
<Dialog visible={open}>
  <Dialog.Header title="Terms updated" />
  <Dialog.Body>
    <Text>Please review to continue.</Text>
  </Dialog.Body>
  <Dialog.Footer>
    <Button onPress={handleAccept}>Got it</Button>
  </Dialog.Footer>
</Dialog>
```

### Custom color per-instance

```tsx
<Dialog
  visible={open}
  onClose={close}
  dialogColors={{ backdrop: "rgba(76, 29, 149, 0.6)", background: "#F5F3FF" }}
>
  ...
</Dialog>
```

### Custom color provider-wide

```tsx
<UIKitProvider overrides={{ light: { dialogColors: { backdrop: "..." } } }}>...</UIKitProvider>
```

## Sub-element testIDs

- Root: `"dialog"` (overridable via `testID`).
- Modal wrapper: `"{root}-modal"`.
- Backdrop: `"{root}-backdrop"`.
- Panel: `"{root}-panel"`.
- Header: `"dialog-header"` (or `"dialog-header-close"` for the close-X sub-slot).
- Body: `"dialog-body"`.
- Footer: `"dialog-footer"`.

## Accessibility

- Backdrop: `accessibilityLabel="Close dialog"` + tap dispatches `onClose`.
- Close-X button (in header): `accessibilityLabel="Close"` + `accessibilityRole="button"` + `hitSlop={8}`.
- Panel receives no explicit role (RN doesn't yet expose a dialog role); RN-Web maps to ARIA when running on web.

## Notes

- **Controlled visibility only** — no ref-based imperative API. Consumers manage `useState<boolean>` and toggle `visible` themselves.
- **Backdrop tap → `onClose`** — standard iOS + Material behavior.
- **Provider re-mount inside Modal** — RN's `<Modal>` renders in a separate view hierarchy that doesn't inherit Tamagui / provider context. `<UIKitContext.Provider>` remounts inside the modal so styled children resolve tokens. Same pattern as `SelectBottomSheet` + `SelectNative.ios`.
- **Bubble-blocker on panel** — the panel is a `Pressable` with an empty `onPress` that absorbs the tap so it doesn't reach the backdrop. Standard "tap outside to close, tap inside stays open" pattern.

## Non-goals

- **No ref-based imperative API** — controlled visibility is more predictable.
- **No bottom-anchored variant** — `<BottomSheet>` covers that.
- **No `variant` prop** for alert/confirm/prompt — compound slots + tone-appropriate buttons compose these.
- **No stacked / nested dialogs** — RN's `<Modal>` doesn't guarantee correct z-index across platforms.
- **No auto-focus first input** — RN's focus management is inconsistent across platforms.

## Platform support

| Platform | Status |
| -------- | ------ |
| iOS      | ✅     |
| Android  | ✅     |
| Web      | ✅     |
