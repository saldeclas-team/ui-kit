/**
 * Direct test of the Android body. Structurally identical to
 * iOS today; kept as its own spec so a future Android-only
 * divergence (Android 14 visual media picker, camera intent
 * fallback) has a home + regression tests.
 */

const mockLaunchCamera = jest.fn();
const mockLaunchLibrary = jest.fn();
const mockRequestCamera = jest.fn();
const mockRequestLibrary = jest.fn();
type PeerModule = {
  launchCameraAsync: jest.Mock;
  launchImageLibraryAsync: jest.Mock;
  requestCameraPermissionsAsync: jest.Mock;
  requestMediaLibraryPermissionsAsync: jest.Mock;
};
const mockGetPeer = jest.fn<PeerModule | null, []>(() => ({
  launchCameraAsync: mockLaunchCamera,
  launchImageLibraryAsync: mockLaunchLibrary,
  requestCameraPermissionsAsync: mockRequestCamera,
  requestMediaLibraryPermissionsAsync: mockRequestLibrary,
}));

jest.mock("./expo-image-picker-probe", () => ({
  getExpoImagePicker: () => mockGetPeer(),
}));

import { imagePickerBody } from "./image-picker-sheet-body.android";
import { PermissionDeniedError } from "./image-picker-sheet-body-types";

const ASSET = {
  uri: "file:///photo.jpg",
  width: 100,
  height: 100,
  type: "image" as const,
};

describe("imagePickerBody.android", () => {
  beforeEach(() => {
    mockLaunchCamera.mockReset();
    mockLaunchLibrary.mockReset();
    mockRequestCamera.mockReset();
    mockRequestLibrary.mockReset();
    mockGetPeer.mockReturnValue({
      launchCameraAsync: mockLaunchCamera,
      launchImageLibraryAsync: mockLaunchLibrary,
      requestCameraPermissionsAsync: mockRequestCamera,
      requestMediaLibraryPermissionsAsync: mockRequestLibrary,
    });
  });

  it("supportsCamera=true on Android", () => {
    expect(imagePickerBody.supportsCamera).toBe(true);
  });

  it("pickFromCamera: requests permission → launches → returns first asset", async () => {
    mockRequestCamera.mockResolvedValue({ granted: true, status: "granted" });
    mockLaunchCamera.mockResolvedValue({ canceled: false, assets: [ASSET] });
    const result = await imagePickerBody.pickFromCamera({});
    expect(result).toEqual(ASSET);
  });

  it("pickFromCamera: throws PermissionDeniedError on denial", async () => {
    mockRequestCamera.mockResolvedValue({ granted: false, status: "denied" });
    await expect(imagePickerBody.pickFromCamera({})).rejects.toBeInstanceOf(PermissionDeniedError);
  });

  it("pickFromCamera: returns null on user cancel", async () => {
    mockRequestCamera.mockResolvedValue({ granted: true, status: "granted" });
    mockLaunchCamera.mockResolvedValue({ canceled: true });
    expect(await imagePickerBody.pickFromCamera({})).toBeNull();
  });

  it("pickFromCamera: null when peer missing", async () => {
    mockGetPeer.mockReturnValueOnce(null);
    expect(await imagePickerBody.pickFromCamera({})).toBeNull();
  });

  it("pickFromLibrary: full happy path", async () => {
    mockRequestLibrary.mockResolvedValue({ granted: true, status: "granted" });
    mockLaunchLibrary.mockResolvedValue({ canceled: false, assets: [ASSET] });
    const result = await imagePickerBody.pickFromLibrary({});
    expect(result).toEqual(ASSET);
  });

  it("pickFromLibrary: throws on denial", async () => {
    mockRequestLibrary.mockResolvedValue({ granted: false, status: "denied" });
    await expect(imagePickerBody.pickFromLibrary({})).rejects.toBeInstanceOf(PermissionDeniedError);
  });

  it("pickFromLibrary: null on cancel", async () => {
    mockRequestLibrary.mockResolvedValue({ granted: true, status: "granted" });
    mockLaunchLibrary.mockResolvedValue({ canceled: true });
    expect(await imagePickerBody.pickFromLibrary({})).toBeNull();
  });

  it("pickFromLibrary: null when peer missing", async () => {
    mockGetPeer.mockReturnValueOnce(null);
    expect(await imagePickerBody.pickFromLibrary({})).toBeNull();
  });
});
