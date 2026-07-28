import { act, fireEvent, render, screen } from "@testing-library/react-native";
import { Text } from "react-native";

import type { DialogColors } from "../../tokens/tokens-types";

// Mock tamagui YStack + XStack + Text so we can inspect resolved
// props without booting Tamagui.
jest.mock("tamagui", () => {
  const rn = jest.requireActual("react-native");
  const forwardRef = jest.requireActual("react").forwardRef;
  const box = forwardRef((props: Record<string, unknown>, ref: unknown) => (
    <rn.View ref={ref} {...props} />
  ));
  const text = (props: Record<string, unknown>) => <rn.Text {...props} />;
  return { YStack: box, XStack: box, Text: text };
});

const LIGHT_DIALOG_COLORS: DialogColors = {
  backdrop: "rgba(0, 0, 0, 0.5)",
  background: "#FFFFFF",
  title: "#111827",
  body: "#374151",
};
const DARK_DIALOG_COLORS: DialogColors = {
  backdrop: "rgba(0, 0, 0, 0.7)",
  background: "#1F2937",
  title: "#F9FAFB",
  body: "#D1D5DB",
};

type MockUIKit = {
  activeTheme: "light" | "dark";
  tokens: { dialogColors: DialogColors };
};
const mockUseUIKit = jest.fn<MockUIKit, []>(() => ({
  activeTheme: "light",
  tokens: { dialogColors: LIGHT_DIALOG_COLORS },
}));
jest.mock("../../provider/use-ui-kit", () => ({
  useUIKit: () => mockUseUIKit(),
}));

// The DialogContext is created by dialog.tsx and read by
// DialogHeader — we mock provider-context so the wrapper doesn't
// crash on the modal-inner re-mount.
jest.mock("../../provider/provider-context", () => {
  const React = jest.requireActual("react");
  const ctx = React.createContext(null);
  return { UIKitContext: ctx };
});

import { Dialog, resolveDialogMinWidth } from "./dialog";

describe("Dialog component", () => {
  beforeEach(() => {
    mockUseUIKit.mockReturnValue({
      activeTheme: "light",
      tokens: { dialogColors: LIGHT_DIALOG_COLORS },
    });
  });

  describe("visibility + testIDs", () => {
    it("renders backdrop + panel when visible=true", async () => {
      await render(
        <Dialog visible onClose={jest.fn()} testID="d">
          <Text>Hi</Text>
        </Dialog>
      );
      expect(screen.getByTestId("d-backdrop")).toBeTruthy();
      expect(screen.getByTestId("d-panel")).toBeTruthy();
    });

    it('defaults testID to "dialog"', async () => {
      await render(
        <Dialog visible onClose={jest.fn()}>
          <Text>x</Text>
        </Dialog>
      );
      expect(screen.getByTestId("dialog-backdrop")).toBeTruthy();
    });

    it("visible=false hides the backdrop + panel (RN Modal's own visible handling)", async () => {
      await render(
        <Dialog visible={false} testID="hidden">
          <Text>x</Text>
        </Dialog>
      );
      // RN Modal doesn't render its children when visible=false in
      // the test renderer. Assert the backdrop is absent — that's
      // the observable difference between visible=true / false.
      expect(screen.queryByTestId("hidden-backdrop")).toBeNull();
    });
  });

  describe("backdrop dismiss", () => {
    it("backdrop tap invokes onClose", async () => {
      const onClose = jest.fn();
      await render(
        <Dialog visible onClose={onClose} testID="d">
          <Text>x</Text>
        </Dialog>
      );
      await act(async () => {
        fireEvent.press(screen.getByTestId("d-backdrop"));
      });
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("panel tap does NOT close (bubble blocker)", async () => {
      const onClose = jest.fn();
      await render(
        <Dialog visible onClose={onClose} testID="d">
          <Text>x</Text>
        </Dialog>
      );
      await act(async () => {
        fireEvent.press(screen.getByTestId("d-panel"));
      });
      expect(onClose).not.toHaveBeenCalled();
    });

    it("backdrop tap without onClose is a no-op (doesn't crash)", async () => {
      await render(
        <Dialog visible testID="d">
          <Text>x</Text>
        </Dialog>
      );
      await act(async () => {
        fireEvent.press(screen.getByTestId("d-backdrop"));
      });
      // No crash + backdrop stays put.
      expect(screen.getByTestId("d-backdrop")).toBeTruthy();
    });
  });

  describe("size resolution", () => {
    it.each([
      ["sm", 240],
      ["md", 320],
      ["lg", 480],
      ["full", 0],
    ] as const)("size='%s' → panel minWidth=%d", async (size, expected) => {
      await render(
        <Dialog visible size={size} testID={size} onClose={jest.fn()}>
          <Text>x</Text>
        </Dialog>
      );
      const panel = screen.getByTestId(`${size}-panel`);
      expect(panel.props.style.minWidth).toBe(expected);
    });

    it("default size='md' resolves to 320", async () => {
      await render(
        <Dialog visible testID="d" onClose={jest.fn()}>
          <Text>x</Text>
        </Dialog>
      );
      expect(screen.getByTestId("d-panel").props.style.minWidth).toBe(320);
    });
  });

  describe("compound slots", () => {
    it("Header renders title + close button (when showCloseButton)", async () => {
      const onClose = jest.fn();
      await render(
        <Dialog visible onClose={onClose} testID="d">
          <Dialog.Header title="Are you sure?" showCloseButton />
        </Dialog>
      );
      expect(screen.getByTestId("dialog-header")).toBeTruthy();
      expect(screen.getByTestId("dialog-header-close")).toBeTruthy();
    });

    it("Header without showCloseButton hides the close button", async () => {
      await render(
        <Dialog visible onClose={jest.fn()} testID="d">
          <Dialog.Header title="Info" />
        </Dialog>
      );
      expect(screen.queryByTestId("dialog-header-close")).toBeNull();
    });

    it("Close button press invokes parent Dialog's onClose", async () => {
      const onClose = jest.fn();
      await render(
        <Dialog visible onClose={onClose} testID="d">
          <Dialog.Header title="Delete?" showCloseButton />
        </Dialog>
      );
      await act(async () => {
        fireEvent.press(screen.getByTestId("dialog-header-close"));
      });
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("Body renders children with default testID", async () => {
      await render(
        <Dialog visible onClose={jest.fn()} testID="d">
          <Dialog.Body>
            <Text testID="body-child">Body text</Text>
          </Dialog.Body>
        </Dialog>
      );
      expect(screen.getByTestId("dialog-body")).toBeTruthy();
      expect(screen.getByTestId("body-child")).toBeTruthy();
    });

    it("Footer renders children right-aligned by default", async () => {
      await render(
        <Dialog visible onClose={jest.fn()} testID="d">
          <Dialog.Footer>
            <Text testID="footer-child">Action</Text>
          </Dialog.Footer>
        </Dialog>
      );
      const footer = screen.getByTestId("dialog-footer");
      expect(footer.props.justifyContent).toBe("flex-end");
      expect(screen.getByTestId("footer-child")).toBeTruthy();
    });

    it("Header renders children when no title is passed", async () => {
      await render(
        <Dialog visible onClose={jest.fn()} testID="d">
          <Dialog.Header>
            <Text testID="custom-header">Custom header</Text>
          </Dialog.Header>
        </Dialog>
      );
      expect(screen.getByTestId("custom-header")).toBeTruthy();
    });

    it("Header custom testID overrides default", async () => {
      await render(
        <Dialog visible onClose={jest.fn()} testID="d">
          <Dialog.Header testID="hdr" title="X" />
        </Dialog>
      );
      expect(screen.getByTestId("hdr")).toBeTruthy();
    });

    it("Header with no title AND no children renders empty (defensive branch)", async () => {
      // Covers the `children ?? null` fallback when neither title
      // nor children is passed — the Header slot then just holds
      // the close button (if any) OR nothing at all.
      await render(
        <Dialog visible onClose={jest.fn()} testID="d">
          <Dialog.Header showCloseButton />
        </Dialog>
      );
      expect(screen.getByTestId("dialog-header")).toBeTruthy();
      expect(screen.getByTestId("dialog-header-close")).toBeTruthy();
    });

    it("Body custom testID overrides default", async () => {
      await render(
        <Dialog visible onClose={jest.fn()} testID="d">
          <Dialog.Body testID="body">
            <Text>x</Text>
          </Dialog.Body>
        </Dialog>
      );
      expect(screen.getByTestId("body")).toBeTruthy();
    });

    it("Footer custom testID overrides default", async () => {
      await render(
        <Dialog visible onClose={jest.fn()} testID="d">
          <Dialog.Footer testID="ftr">
            <Text>x</Text>
          </Dialog.Footer>
        </Dialog>
      );
      expect(screen.getByTestId("ftr")).toBeTruthy();
    });
  });

  describe("palette resolution", () => {
    it("default backdrop + background come from provider palette", async () => {
      await render(
        <Dialog visible onClose={jest.fn()} testID="d">
          <Text>x</Text>
        </Dialog>
      );
      expect(screen.getByTestId("d-backdrop").props.style.backgroundColor).toBe(
        "rgba(0, 0, 0, 0.5)"
      );
      expect(screen.getByTestId("d-panel").props.style.backgroundColor).toBe("#FFFFFF");
    });

    it("per-instance dialogColors override wins", async () => {
      await render(
        <Dialog
          visible
          onClose={jest.fn()}
          testID="d"
          dialogColors={{ backdrop: "rgba(124, 58, 237, 0.5)", background: "#FFF7ED" }}
        >
          <Text>x</Text>
        </Dialog>
      );
      expect(screen.getByTestId("d-backdrop").props.style.backgroundColor).toBe(
        "rgba(124, 58, 237, 0.5)"
      );
      expect(screen.getByTestId("d-panel").props.style.backgroundColor).toBe("#FFF7ED");
    });

    it("dark palette wins when provider swaps activeTheme", async () => {
      mockUseUIKit.mockReturnValue({
        activeTheme: "dark",
        tokens: { dialogColors: DARK_DIALOG_COLORS },
      });
      await render(
        <Dialog visible onClose={jest.fn()} testID="dk">
          <Text>x</Text>
        </Dialog>
      );
      expect(screen.getByTestId("dk-panel").props.style.backgroundColor).toBe("#1F2937");
    });
  });

  describe("a11y + animation", () => {
    it('backdrop has accessibilityLabel="Close dialog"', async () => {
      await render(
        <Dialog visible onClose={jest.fn()} testID="d">
          <Text>x</Text>
        </Dialog>
      );
      expect(screen.getByTestId("d-backdrop").props.accessibilityLabel).toBe("Close dialog");
    });

    it("close button has role=button + accessibilityLabel", async () => {
      await render(
        <Dialog visible onClose={jest.fn()} testID="d">
          <Dialog.Header title="X" showCloseButton />
        </Dialog>
      );
      const close = screen.getByTestId("dialog-header-close");
      expect(close.props.accessibilityLabel).toBe("Close");
      expect(close.props.accessibilityRole).toBe("button");
    });

    it("modal defaults animationType to 'fade'", async () => {
      await render(
        <Dialog visible onClose={jest.fn()} testID="d">
          <Text>x</Text>
        </Dialog>
      );
      expect(screen.getByTestId("d-modal").props.animationType).toBe("fade");
    });

    it("consumer animationType override wins", async () => {
      await render(
        <Dialog visible onClose={jest.fn()} testID="d" animationType="slide">
          <Text>x</Text>
        </Dialog>
      );
      expect(screen.getByTestId("d-modal").props.animationType).toBe("slide");
    });
  });

  describe("snapshots", () => {
    it("compound (Header + Body + Footer, md)", async () => {
      await render(
        <Dialog visible onClose={jest.fn()}>
          <Dialog.Header title="Delete?" showCloseButton />
          <Dialog.Body>
            <Text>Body text</Text>
          </Dialog.Body>
          <Dialog.Footer>
            <Text>Action</Text>
          </Dialog.Footer>
        </Dialog>
      );
      expect(screen.toJSON()).toMatchSnapshot();
    });

    it("simple (children only, sm)", async () => {
      await render(
        <Dialog visible onClose={jest.fn()} size="sm">
          <Text>Simple content</Text>
        </Dialog>
      );
      expect(screen.toJSON()).toMatchSnapshot();
    });

    it("large size (lg)", async () => {
      await render(
        <Dialog visible onClose={jest.fn()} size="lg">
          <Text>x</Text>
        </Dialog>
      );
      expect(screen.toJSON()).toMatchSnapshot();
    });

    it("dark theme × md compound", async () => {
      mockUseUIKit.mockReturnValue({
        activeTheme: "dark",
        tokens: { dialogColors: DARK_DIALOG_COLORS },
      });
      await render(
        <Dialog visible onClose={jest.fn()}>
          <Dialog.Header title="Dark theme dialog" showCloseButton />
          <Dialog.Body>
            <Text>Body</Text>
          </Dialog.Body>
        </Dialog>
      );
      expect(screen.toJSON()).toMatchSnapshot();
    });
  });
});

describe("resolveDialogMinWidth — pure helper", () => {
  it.each([
    ["sm", 240],
    ["md", 320],
    ["lg", 480],
    ["full", 0],
  ] as const)("size='%s' → %d", (input, expected) => {
    expect(resolveDialogMinWidth(input)).toBe(expected);
  });
});
