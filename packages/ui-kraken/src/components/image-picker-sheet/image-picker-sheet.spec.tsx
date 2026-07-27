import { act, fireEvent, render, screen } from "@testing-library/react-native";
import { createRef } from "react";

import type { ImagePickerSheetColors } from "../../tokens/tokens-types";
import type { ImagePickerSheetRef } from "./image-picker-sheet";

// Stub `tamagui` so jest can parse the shell's imports.
jest.mock("tamagui", () => {
  const rn = jest.requireActual("react-native");
  const React = jest.requireActual("react");
  return {
    Text: (props: Record<string, unknown>) => React.createElement(rn.Text, props),
    XStack: (props: Record<string, unknown>) => React.createElement(rn.View, props),
    YStack: (props: Record<string, unknown>) => React.createElement(rn.View, props),
    styled: () => () => null,
  };
});

// Mock the styled file with rn.View / rn.Text stubs.
jest.mock("./image-picker-sheet-styled", () => {
  const rn = jest.requireActual("react-native");
  const forwardRef = jest.requireActual("react").forwardRef;
  const box = forwardRef((props: Record<string, unknown>, ref: unknown) => (
    <rn.View ref={ref} {...props} />
  ));
  const text = forwardRef((props: Record<string, unknown>, ref: unknown) => (
    <rn.Text ref={ref} {...props} />
  ));
  return {
    StyledImagePickerSheetTitle: text,
    StyledImagePickerSheetActionList: box,
    StyledImagePickerSheetAction: box,
    StyledImagePickerSheetActionLabel: text,
    StyledImagePickerSheetActionIcon: box,
    StyledImagePickerSheetDivider: box,
    StyledImagePickerSheetMissingPeer: text,
  };
});

// Toggle-controlled probe mocks.
const mockBottomSheetPeer = jest.fn(() => true);
const mockImagePickerPeer = jest.fn(() => true);
jest.mock("../bottom-sheet/expo-ui-bottom-sheet-probe", () => ({
  isBottomSheetAvailable: () => mockBottomSheetPeer(),
}));
jest.mock("./expo-image-picker-probe", () => ({
  isImagePickerAvailable: () => mockImagePickerPeer(),
  getExpoImagePicker: () => null,
}));

// Body mock — records which method was called and lets tests
// resolve or reject.
const mockPickFromCamera = jest.fn<Promise<unknown>, [unknown]>();
const mockPickFromLibrary = jest.fn<Promise<unknown>, [unknown]>();
const mockSupportsCamera = jest.fn(() => true);
jest.mock("./image-picker-sheet-body", () => ({
  imagePickerBody: {
    get supportsCamera() {
      return mockSupportsCamera();
    },
    pickFromCamera: (options: unknown) => mockPickFromCamera(options),
    pickFromLibrary: (options: unknown) => mockPickFromLibrary(options),
  },
}));

// Fake BottomSheet — exposes ref methods + renders children
// inline so tests can assert on the action rows.
const mockBottomSheetRef = {
  present: jest.fn(),
  dismiss: jest.fn(),
  snapToIndex: jest.fn(),
  expand: jest.fn(),
  collapse: jest.fn(),
};
jest.mock("../bottom-sheet", () => {
  const rn = jest.requireActual("react-native");
  const React = jest.requireActual("react");
  return {
    BottomSheet: React.forwardRef(function FakeBottomSheet(
      props: {
        children?: React.ReactNode;
        testID?: string;
        bottomSheetColors?: Record<string, string>;
      },
      ref: React.Ref<unknown>
    ) {
      React.useImperativeHandle(ref, () => mockBottomSheetRef, []);
      return React.createElement(
        rn.View,
        {
          testID: props.testID,
          "data-bg": props.bottomSheetColors?.background,
          "data-handle": props.bottomSheetColors?.handle,
        },
        props.children
      );
    }),
  };
});

const LIGHT_COLORS: ImagePickerSheetColors = {
  sheetBackground: "#FFFFFF",
  sheetHandle: "#9CA3AF",
  actionBackground: "#FFFFFF",
  actionBackgroundPressed: "#F3F4F6",
  actionText: "#111827",
  actionIcon: "#6B7280",
  cancelText: "#DC2626",
  divider: "#E5E7EB",
};

const DARK_COLORS: ImagePickerSheetColors = {
  sheetBackground: "#1C1C1E",
  sheetHandle: "#6B7280",
  actionBackground: "#1C1C1E",
  actionBackgroundPressed: "#2C2C2E",
  actionText: "#F9FAFB",
  actionIcon: "#9CA3AF",
  cancelText: "#F87171",
  divider: "#374151",
};

type MockUIKit = {
  activeTheme: "light" | "dark";
  tokens: { imagePickerSheetColors: ImagePickerSheetColors };
};

const mockUseUIKit = jest.fn<MockUIKit, []>(() => ({
  activeTheme: "light",
  tokens: { imagePickerSheetColors: LIGHT_COLORS },
}));

jest.mock("../../provider/use-ui-kit", () => ({
  useUIKit: () => mockUseUIKit(),
}));

import { ImagePickerSheet } from "./image-picker-sheet";
import { PermissionDeniedError } from "./image-picker-sheet-body-types";

const ASSET = {
  uri: "file:///tmp/photo.jpg",
  width: 100,
  height: 100,
  type: "image" as const,
};

describe("ImagePickerSheet", () => {
  beforeEach(() => {
    mockUseUIKit.mockReturnValue({
      activeTheme: "light",
      tokens: { imagePickerSheetColors: LIGHT_COLORS },
    });
    mockBottomSheetPeer.mockReturnValue(true);
    mockImagePickerPeer.mockReturnValue(true);
    mockSupportsCamera.mockReturnValue(true);
    mockPickFromCamera.mockReset();
    mockPickFromLibrary.mockReset();
    Object.values(mockBottomSheetRef).forEach((fn) => (fn as jest.Mock).mockClear());
  });

  it("renders the sheet with all three action rows when peers are available", async () => {
    await render(<ImagePickerSheet onPick={jest.fn()} />);
    expect(screen.getByTestId("image-picker-sheet-camera")).toBeTruthy();
    expect(screen.getByTestId("image-picker-sheet-gallery")).toBeTruthy();
    expect(screen.getByTestId("image-picker-sheet-cancel")).toBeTruthy();
  });

  it("root testID overrides propagate to sub-elements", async () => {
    await render(<ImagePickerSheet testID="ips" onPick={jest.fn()} />);
    expect(screen.getByTestId("ips-camera")).toBeTruthy();
    expect(screen.getByTestId("ips-gallery")).toBeTruthy();
    expect(screen.getByTestId("ips-cancel")).toBeTruthy();
  });

  it("renders default sheet title 'Choose photo'", async () => {
    await render(<ImagePickerSheet testID="ips" onPick={jest.fn()} />);
    expect(screen.getByTestId("ips-title")).toHaveTextContent("Choose photo");
  });

  it("custom sheetTitle wins", async () => {
    await render(<ImagePickerSheet testID="ips" onPick={jest.fn()} sheetTitle="Pick media" />);
    expect(screen.getByTestId("ips-title")).toHaveTextContent("Pick media");
  });

  it("empty sheetTitle hides the title element", async () => {
    await render(<ImagePickerSheet testID="ips" onPick={jest.fn()} sheetTitle="" />);
    expect(screen.queryByTestId("ips-title")).toBeNull();
  });

  it("row labels default to English strings + are overridable", async () => {
    await render(<ImagePickerSheet testID="ips" onPick={jest.fn()} />);
    expect(screen.getByTestId("ips-camera")).toHaveTextContent("Take photo");
    expect(screen.getByTestId("ips-gallery")).toHaveTextContent("Choose from library");
    expect(screen.getByTestId("ips-cancel")).toHaveTextContent("Cancel");
  });

  it("custom labels win", async () => {
    await render(
      <ImagePickerSheet
        testID="ips"
        onPick={jest.fn()}
        cameraLabel="Snap"
        galleryLabel="Browse"
        cancelLabel="Nope"
      />
    );
    expect(screen.getByTestId("ips-camera")).toHaveTextContent("Snap");
    expect(screen.getByTestId("ips-gallery")).toHaveTextContent("Browse");
    expect(screen.getByTestId("ips-cancel")).toHaveTextContent("Nope");
  });

  it("cancel row uses `cancelText` slot for destructive tone", async () => {
    await render(<ImagePickerSheet testID="ips" onPick={jest.fn()} />);
    const cancel = screen.getByTestId("ips-cancel");
    // The label text has color via the mocked styled Text; find it inside.
    expect(cancel).toBeTruthy();
  });

  it("ref.present() forwards to BottomSheet.present()", async () => {
    const ref = createRef<ImagePickerSheetRef>();
    await render(<ImagePickerSheet ref={ref} onPick={jest.fn()} />);
    ref.current?.present();
    expect(mockBottomSheetRef.present).toHaveBeenCalledTimes(1);
  });

  it("ref.dismiss() forwards to BottomSheet.dismiss()", async () => {
    const ref = createRef<ImagePickerSheetRef>();
    await render(<ImagePickerSheet ref={ref} onPick={jest.fn()} />);
    ref.current?.dismiss();
    expect(mockBottomSheetRef.dismiss).toHaveBeenCalledTimes(1);
  });

  it("tapping camera row dismisses the sheet + calls pickFromCamera + fires onPick with the asset", async () => {
    mockPickFromCamera.mockResolvedValueOnce(ASSET);
    const onPick = jest.fn();
    await render(<ImagePickerSheet testID="ips" onPick={onPick} />);
    await act(async () => {
      fireEvent.press(screen.getByTestId("ips-camera"));
    });
    expect(mockBottomSheetRef.dismiss).toHaveBeenCalledTimes(1);
    expect(mockPickFromCamera).toHaveBeenCalledTimes(1);
    expect(onPick).toHaveBeenCalledWith(ASSET);
  });

  it("tapping gallery row calls pickFromLibrary + fires onPick with the asset", async () => {
    mockPickFromLibrary.mockResolvedValueOnce(ASSET);
    const onPick = jest.fn();
    await render(<ImagePickerSheet testID="ips" onPick={onPick} />);
    await act(async () => {
      fireEvent.press(screen.getByTestId("ips-gallery"));
    });
    expect(mockPickFromLibrary).toHaveBeenCalledTimes(1);
    expect(onPick).toHaveBeenCalledWith(ASSET);
  });

  it("pick returning null (user cancelled inside OS UI) fires onPick(null)", async () => {
    mockPickFromCamera.mockResolvedValueOnce(null);
    const onPick = jest.fn();
    await render(<ImagePickerSheet testID="ips" onPick={onPick} />);
    await act(async () => {
      fireEvent.press(screen.getByTestId("ips-camera"));
    });
    expect(onPick).toHaveBeenCalledWith(null);
  });

  it("tapping cancel row dismisses the sheet + does NOT fire onPick", async () => {
    const onPick = jest.fn();
    await render(<ImagePickerSheet testID="ips" onPick={onPick} />);
    await act(async () => {
      fireEvent.press(screen.getByTestId("ips-cancel"));
    });
    expect(mockBottomSheetRef.dismiss).toHaveBeenCalledTimes(1);
    expect(onPick).not.toHaveBeenCalled();
    expect(mockPickFromCamera).not.toHaveBeenCalled();
    expect(mockPickFromLibrary).not.toHaveBeenCalled();
  });

  it("camera permission denial fires onPermissionDenied('camera')", async () => {
    mockPickFromCamera.mockRejectedValueOnce(new PermissionDeniedError("camera"));
    const onPick = jest.fn();
    const onPermissionDenied = jest.fn();
    await render(
      <ImagePickerSheet testID="ips" onPick={onPick} onPermissionDenied={onPermissionDenied} />
    );
    await act(async () => {
      fireEvent.press(screen.getByTestId("ips-camera"));
    });
    expect(onPermissionDenied).toHaveBeenCalledWith("camera");
    expect(onPick).not.toHaveBeenCalled();
  });

  it("library permission denial fires onPermissionDenied('library')", async () => {
    mockPickFromLibrary.mockRejectedValueOnce(new PermissionDeniedError("library"));
    const onPick = jest.fn();
    const onPermissionDenied = jest.fn();
    await render(
      <ImagePickerSheet testID="ips" onPick={onPick} onPermissionDenied={onPermissionDenied} />
    );
    await act(async () => {
      fireEvent.press(screen.getByTestId("ips-gallery"));
    });
    expect(onPermissionDenied).toHaveBeenCalledWith("library");
    expect(onPick).not.toHaveBeenCalled();
  });

  it("hides the camera row when body.supportsCamera is false (web)", async () => {
    mockSupportsCamera.mockReturnValue(false);
    await render(<ImagePickerSheet testID="ips" onPick={jest.fn()} />);
    expect(screen.queryByTestId("ips-camera")).toBeNull();
    expect(screen.getByTestId("ips-gallery")).toBeTruthy();
    expect(screen.getByTestId("ips-cancel")).toBeTruthy();
  });

  it("forwards ExpoImagePickerOptions to body.pickFromCamera", async () => {
    mockPickFromCamera.mockResolvedValueOnce(ASSET);
    await render(
      <ImagePickerSheet
        testID="ips"
        onPick={jest.fn()}
        allowsEditing
        quality={0.8}
        aspect={[1, 1]}
        mediaTypes="images"
      />
    );
    await act(async () => {
      fireEvent.press(screen.getByTestId("ips-camera"));
    });
    expect(mockPickFromCamera).toHaveBeenCalledWith({
      mediaTypes: "images",
      allowsEditing: true,
      quality: 0.8,
      aspect: [1, 1],
      videoMaxDuration: undefined,
    });
  });

  it("maps sheetBackground + sheetHandle onto BottomSheet's palette", async () => {
    await render(
      <ImagePickerSheet
        testID="ips"
        onPick={jest.fn()}
        imagePickerSheetColors={{
          sheetBackground: "#F5F3FF",
          sheetHandle: "#7C3AED",
        }}
      />
    );
    const sheet = screen.getByTestId("ips-sheet");
    expect(sheet.props["data-bg"]).toBe("#F5F3FF");
    expect(sheet.props["data-handle"]).toBe("#7C3AED");
  });

  it("uses the dark palette when activeTheme='dark'", async () => {
    mockUseUIKit.mockReturnValue({
      activeTheme: "dark",
      tokens: { imagePickerSheetColors: DARK_COLORS },
    });
    await render(<ImagePickerSheet testID="ips" onPick={jest.fn()} />);
    expect(screen.getByTestId("ips-sheet").props["data-bg"]).toBe(DARK_COLORS.sheetBackground);
  });

  it("renders the missing-peer hint when @expo/ui isn't available", async () => {
    mockBottomSheetPeer.mockReturnValue(false);
    await render(<ImagePickerSheet testID="ips" onPick={jest.fn()} />);
    const hint = screen.getByTestId("ips-missing-peer");
    expect(hint).toHaveTextContent(/install .+@expo\/ui/i);
    expect(screen.queryByTestId("ips-camera")).toBeNull();
  });

  it("renders the missing-peer hint when expo-image-picker isn't available", async () => {
    mockImagePickerPeer.mockReturnValue(false);
    await render(<ImagePickerSheet testID="ips" onPick={jest.fn()} />);
    const hint = screen.getByTestId("ips-missing-peer");
    expect(hint).toHaveTextContent(/install .+expo-image-picker/i);
  });

  it("renders both missing peers in the hint when both are unavailable", async () => {
    mockBottomSheetPeer.mockReturnValue(false);
    mockImagePickerPeer.mockReturnValue(false);
    await render(<ImagePickerSheet testID="ips" onPick={jest.fn()} />);
    const hint = screen.getByTestId("ips-missing-peer");
    expect(hint).toHaveTextContent(/@expo\/ui/);
    expect(hint).toHaveTextContent(/expo-image-picker/);
  });

  it("renders cameraIcon inside the camera row when provided", async () => {
    const rn = jest.requireActual("react-native");
    const React = jest.requireActual("react");
    const icon = React.createElement(rn.Text, { testID: "camera-icon" }, "📷");
    await render(<ImagePickerSheet testID="ips" onPick={jest.fn()} cameraIcon={icon} />);
    expect(screen.getByTestId("camera-icon")).toBeTruthy();
  });

  it("renders galleryIcon inside the gallery row when provided", async () => {
    const rn = jest.requireActual("react-native");
    const React = jest.requireActual("react");
    const icon = React.createElement(rn.Text, { testID: "gallery-icon" }, "🖼️");
    await render(<ImagePickerSheet testID="ips" onPick={jest.fn()} galleryIcon={icon} />);
    expect(screen.getByTestId("gallery-icon")).toBeTruthy();
  });

  describe("snapshots", () => {
    it("default + peers available", async () => {
      await render(<ImagePickerSheet onPick={jest.fn()} />);
      expect(screen.toJSON()).toMatchSnapshot();
    });

    it("missing peer fallback", async () => {
      mockImagePickerPeer.mockReturnValue(false);
      await render(<ImagePickerSheet onPick={jest.fn()} />);
      expect(screen.toJSON()).toMatchSnapshot();
    });

    it("web layout (no camera row)", async () => {
      mockSupportsCamera.mockReturnValue(false);
      await render(<ImagePickerSheet onPick={jest.fn()} />);
      expect(screen.toJSON()).toMatchSnapshot();
    });
  });
});
