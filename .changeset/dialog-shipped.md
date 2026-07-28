---
"ui-kraken": minor
---

Add `Dialog` — centered overlay panel for confirmations, forms, and detail views. Wraps RN's built-in `<Modal>` with palette + backdrop + compound API. Complements `BottomSheet` (bottom-anchored) for cases where content isn't a sheet metaphor. Named `Dialog` (not `Modal`) to disambiguate from RN's own `Modal` export.

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
