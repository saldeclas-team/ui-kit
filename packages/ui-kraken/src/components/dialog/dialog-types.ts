import type { ReactNode } from "react";
import type { XStackProps, YStackProps } from "tamagui";

import type { DialogColors } from "../../tokens/tokens-types";

/**
 * Size preset. Sets `minWidth` on the panel; `maxWidth` stays at
 * `"95%"` across all sizes so the panel shrinks on narrow screens.
 */
export type DialogSize = "sm" | "md" | "lg" | "full";

/**
 * Animation type forwarded to RN's `<Modal animationType>` prop.
 * `"fade"` is the default (dialog-appropriate); `"slide"` and
 * `"none"` are also valid.
 */
export type DialogAnimationType = "none" | "slide" | "fade";

/**
 * Per-instance color override. Partial of the full `DialogColors`
 * palette — missing slots fall through to the provider palette.
 */
export type DialogColorsInput = Partial<DialogColors>;

/**
 * `DialogProps` re-declares only props that are OURS. No
 * `YStackProps` spread — the panel size + centering are fixed and
 * consumers who need to override those styles should compose
 * around the Dialog, not through it.
 */
export interface DialogProps {
  /** Whether the dialog is visible. Controlled by the consumer. */
  visible: boolean;
  /**
   * Called when the user dismisses the dialog (backdrop tap,
   * Android back button, or the close-X in the header). Omit to
   * prevent dismissal.
   */
  onClose?: () => void;
  /**
   * Size preset. Sets `minWidth`; the panel still shrinks below
   * this on narrow screens (`maxWidth: 95%`). Default: `"md"`.
   */
  size?: DialogSize;
  /**
   * RN Modal animation type. Default: `"fade"`.
   */
  animationType?: DialogAnimationType;
  /** Per-instance color override. */
  dialogColors?: DialogColorsInput;
  /** Root testID. Default: `"dialog"`. */
  testID?: string;
  /** Panel content. */
  children?: ReactNode;
}

/**
 * `Dialog.Header` slot. Optional title text (renders as a header
 * label) + optional close-X button on the right that invokes the
 * parent Dialog's `onClose`. Extends `XStackProps` so consumers
 * can override layout (`justifyContent`, `gap`, etc.).
 */
export interface DialogHeaderProps extends XStackProps {
  /** Title text rendered inside the header. */
  title?: string;
  /**
   * When true, renders a close-X button on the right. Pressing it
   * invokes the parent Dialog's `onClose`. Requires the parent to
   * have `onClose` set — otherwise the button is inert.
   */
  showCloseButton?: boolean;
  /** Slot testID. Default: `"dialog-header"`. */
  testID?: string;
}

/**
 * `Dialog.Body` slot. Vertical stack for the main content of the
 * dialog. Extends `YStackProps` so consumers can override `gap`,
 * `padding`, etc.
 */
export interface DialogBodyProps extends YStackProps {
  /** Slot testID. Default: `"dialog-body"`. */
  testID?: string;
}

/**
 * `Dialog.Footer` slot. Horizontal row of action buttons, right-
 * aligned by default. Extends `XStackProps`.
 */
export interface DialogFooterProps extends XStackProps {
  /** Slot testID. Default: `"dialog-footer"`. */
  testID?: string;
}
