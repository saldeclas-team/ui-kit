/**
 * Direct test of the web body. Web has no camera support — the
 * shell hides the camera row entirely; the body's pickFromCamera
 * is a safety no-op that returns null.
 */

import type * as ImagePickerBodyModule from "./image-picker-sheet-body";

const mockLaunchLibrary = jest.fn();
const mockRequestLibrary = jest.fn();
type PeerModule = {
  launchCameraAsync: jest.Mock;
  launchImageLibraryAsync: jest.Mock;
  requestCameraPermissionsAsync: jest.Mock;
  requestMediaLibraryPermissionsAsync: jest.Mock;
};
const mockGetPeer = jest.fn<PeerModule | null, []>(() => ({
  launchCameraAsync: jest.fn(),
  launchImageLibraryAsync: mockLaunchLibrary,
  requestCameraPermissionsAsync: jest.fn(),
  requestMediaLibraryPermissionsAsync: mockRequestLibrary,
}));

jest.mock("./expo-image-picker-probe", () => ({
  getExpoImagePicker: () => mockGetPeer(),
}));

// Import the web body directly (jest-expo resolves .ios by default).
const { imagePickerBody } =
  require("./image-picker-sheet-body.web.tsx") as typeof ImagePickerBodyModule;

import { PermissionDeniedError } from "./image-picker-sheet-body-types";

const ASSET = {
  uri: "blob:https://example.com/photo",
  width: 100,
  height: 100,
  type: "image" as const,
};

describe("imagePickerBody.web", () => {
  beforeEach(() => {
    mockLaunchLibrary.mockReset();
    mockRequestLibrary.mockReset();
    mockGetPeer.mockReturnValue({
      launchCameraAsync: jest.fn(),
      launchImageLibraryAsync: mockLaunchLibrary,
      requestCameraPermissionsAsync: jest.fn(),
      requestMediaLibraryPermissionsAsync: mockRequestLibrary,
    });
  });

  it("supportsCamera=false on web (browsers can't launch a native camera)", () => {
    expect(imagePickerBody.supportsCamera).toBe(false);
  });

  it("pickFromCamera is a no-op that returns null on web", async () => {
    expect(await imagePickerBody.pickFromCamera({})).toBeNull();
  });

  it("pickFromLibrary: full happy path via browser file picker", async () => {
    mockRequestLibrary.mockResolvedValue({ granted: true, status: "granted" });
    mockLaunchLibrary.mockResolvedValue({ canceled: false, assets: [ASSET] });
    const result = await imagePickerBody.pickFromLibrary({});
    expect(result).toEqual(ASSET);
  });

  it("pickFromLibrary: throws PermissionDeniedError on denial (unusual on web but honored for API symmetry)", async () => {
    mockRequestLibrary.mockResolvedValue({ granted: false, status: "denied" });
    await expect(imagePickerBody.pickFromLibrary({})).rejects.toBeInstanceOf(PermissionDeniedError);
  });

  it("pickFromLibrary: returns null when peer isn't installed", async () => {
    mockGetPeer.mockReturnValueOnce(null);
    expect(await imagePickerBody.pickFromLibrary({})).toBeNull();
  });

  it("pickFromLibrary: returns null when user cancels the file picker", async () => {
    mockRequestLibrary.mockResolvedValue({ granted: true, status: "granted" });
    mockLaunchLibrary.mockResolvedValue({ canceled: true });
    expect(await imagePickerBody.pickFromLibrary({})).toBeNull();
  });
});
