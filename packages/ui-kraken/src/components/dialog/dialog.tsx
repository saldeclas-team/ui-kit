import { createContext, useContext } from "react";
import { Modal, Pressable } from "react-native";
import { Text as TamaguiText, XStack, YStack } from "tamagui";

import { UIKitContext } from "../../provider/provider-context";
import { useUIKit } from "../../provider/use-ui-kit";
import { resolvePalette } from "../../utils/resolve-palette";
import type {
  DialogBodyProps,
  DialogFooterProps,
  DialogHeaderProps,
  DialogProps,
  DialogSize,
} from "./dialog-types";

/**
 * Context that lets `Dialog.Header`'s close-X button reach the
 * parent Dialog's `onClose` + `testID` without prop-drilling.
 * Null when a compound slot is used outside a `<Dialog>` (defensive
 * — the close button becomes inert, doesn't crash).
 */
const DialogContext = createContext<{ onClose?: () => void; testID: string } | null>(null);

/**
 * Centered overlay panel. Wraps RN's built-in `<Modal>` with
 * palette + backdrop + centered layout + compound slots.
 *
 * ```tsx
 * <Dialog visible={open} onClose={() => setOpen(false)}>
 *   <Dialog.Header title="Delete file?" showCloseButton />
 *   <Dialog.Body>
 *     <Text>This action can't be undone.</Text>
 *   </Dialog.Body>
 *   <Dialog.Footer>
 *     <Button tone="ghost" onPress={() => setOpen(false)}>Cancel</Button>
 *     <Button tone="danger" onPress={handleDelete}>Delete</Button>
 *   </Dialog.Footer>
 * </Dialog>
 * ```
 *
 * ### Provider re-mount
 *
 * RN's `<Modal>` renders in a separate view hierarchy that does
 * NOT inherit Tamagui / provider context. `<UIKitContext.Provider>`
 * re-mounts inside the modal so styled children resolve tokens.
 * Same pattern as select-bottom-sheet + select-native.ios.
 */
function DialogBase({
  visible,
  onClose,
  size = "md",
  animationType = "fade",
  dialogColors,
  testID = "dialog",
  children,
}: DialogProps) {
  const contextValue = useUIKit();
  const palette = resolvePalette(contextValue.tokens.dialogColors, dialogColors);
  const minWidth = resolveDialogMinWidth(size);

  return (
    <Modal
      visible={visible}
      transparent
      animationType={animationType}
      onRequestClose={onClose}
      testID={`${testID}-modal`}
    >
      <UIKitContext.Provider value={contextValue}>
        <DialogContext.Provider value={{ onClose, testID }}>
          <Pressable
            testID={`${testID}-backdrop`}
            onPress={onClose}
            accessibilityLabel="Close dialog"
            style={{
              flex: 1,
              backgroundColor: palette.backdrop,
              justifyContent: "center",
              alignItems: "center",
              padding: 16,
            }}
          >
            <Pressable
              testID={`${testID}-panel`}
              onPress={() => {
                // Empty on purpose — absorbs press so it doesn't
                // bubble to the backdrop Pressable (which would
                // close the modal). Same bubble-blocker pattern as
                // date-picker-body.ios's modal-content Pressable.
              }}
              style={{
                minWidth,
                maxWidth: "95%",
                backgroundColor: palette.background,
                borderRadius: 16,
                padding: 20,
              }}
            >
              {children}
            </Pressable>
          </Pressable>
        </DialogContext.Provider>
      </UIKitContext.Provider>
    </Modal>
  );
}

function DialogHeader({
  title,
  showCloseButton = false,
  testID = "dialog-header",
  children,
  ...rest
}: DialogHeaderProps) {
  const parent = useContext(DialogContext);
  const { tokens } = useUIKit();
  const palette = tokens.dialogColors;

  return (
    <XStack
      testID={testID}
      justifyContent="space-between"
      alignItems="center"
      marginBottom={12}
      {...rest}
    >
      {title != null ? (
        <TamaguiText color={palette.title} fontSize={18} fontWeight="600" flexShrink={1}>
          {title}
        </TamaguiText>
      ) : (
        (children ?? null)
      )}
      {showCloseButton ? (
        <Pressable
          testID={`${testID}-close`}
          onPress={parent?.onClose}
          accessibilityLabel="Close"
          accessibilityRole="button"
          hitSlop={8}
        >
          <TamaguiText color={palette.body} fontSize={20} fontWeight="500">
            ×
          </TamaguiText>
        </Pressable>
      ) : null}
    </XStack>
  );
}

function DialogBody({ testID = "dialog-body", children, ...rest }: DialogBodyProps) {
  return (
    <YStack testID={testID} gap={8} {...rest}>
      {children}
    </YStack>
  );
}

function DialogFooter({ testID = "dialog-footer", children, ...rest }: DialogFooterProps) {
  return (
    <XStack testID={testID} justifyContent="flex-end" gap={8} marginTop={16} {...rest}>
      {children}
    </XStack>
  );
}

/**
 * Map a `size` prop value to the panel's `minWidth`. `full` returns
 * `0` (the `maxWidth: "95%"` on the panel constrains it). Extracted
 * for direct pure-function tests.
 */
export function resolveDialogMinWidth(size: DialogSize): number {
  if (size === "sm") return 240;
  if (size === "md") return 320;
  if (size === "lg") return 480;
  return 0; // "full"
}

/**
 * Compound export. `DialogBase` is the raw component; we attach
 * `.Header` / `.Body` / `.Footer` as static properties.
 */
type DialogComponent = typeof DialogBase & {
  Header: typeof DialogHeader;
  Body: typeof DialogBody;
  Footer: typeof DialogFooter;
};

const DialogWithSlots = DialogBase as DialogComponent;
DialogWithSlots.Header = DialogHeader;
DialogWithSlots.Body = DialogBody;
DialogWithSlots.Footer = DialogFooter;

export const Dialog = DialogWithSlots;

export type {
  DialogAnimationType,
  DialogBodyProps,
  DialogColorsInput,
  DialogFooterProps,
  DialogHeaderProps,
  DialogProps,
  DialogSize,
} from "./dialog-types";
