---
"ui-kraken": patch
---

Internal test-surface improvements to `DatePicker`'s iOS + web bodies. No public API changes, no runtime behavior changes — release exists solely because PR #66 shipped source-file edits without a changeset (the release workflow no-op'd silently and nothing published to npm). This changeset ships the same commits under a proper patch bump so npm consumers pick them up.

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
