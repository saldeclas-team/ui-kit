/**
 * Direct test of the iOS body. Same shape as our other native-
 * body specs — jest.doMock the peer, import the body variant
 * explicitly, assert on the API contract.
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

import { imagePickerBody } from "./image-picker-sheet-body.ios";
import { PermissionDeniedError } from "./image-picker-sheet-body-types";

const ASSET = {
  uri: "file:///photo.jpg",
  width: 100,
  height: 100,
  type: "image" as const,
};

describe("imagePickerBody.ios", () => {
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

  it("supportsCamera=true on iOS", () => {
    expect(imagePickerBody.supportsCamera).toBe(true);
  });

  it("pickFromCamera: requests permission → launches → returns first asset", async () => {
    mockRequestCamera.mockResolvedValue({ granted: true, status: "granted" });
    mockLaunchCamera.mockResolvedValue({ canceled: false, assets: [ASSET] });
    const result = await imagePickerBody.pickFromCamera({ quality: 0.8 });
    expect(mockRequestCamera).toHaveBeenCalledTimes(1);
    expect(mockLaunchCamera).toHaveBeenCalledWith({ quality: 0.8 });
    expect(result).toEqual(ASSET);
  });

  it("pickFromCamera: throws PermissionDeniedError('camera') on denial", async () => {
    mockRequestCamera.mockResolvedValue({ granted: false, status: "denied" });
    await expect(imagePickerBody.pickFromCamera({})).rejects.toBeInstanceOf(PermissionDeniedError);
    expect(mockLaunchCamera).not.toHaveBeenCalled();
  });

  it("pickFromCamera: returns null when user cancels inside camera UI", async () => {
    mockRequestCamera.mockResolvedValue({ granted: true, status: "granted" });
    mockLaunchCamera.mockResolvedValue({ canceled: true });
    const result = await imagePickerBody.pickFromCamera({});
    expect(result).toBeNull();
  });

  it("pickFromCamera: returns null when peer isn't installed", async () => {
    mockGetPeer.mockReturnValueOnce(null);
    const result = await imagePickerBody.pickFromCamera({});
    expect(result).toBeNull();
  });

  it("pickFromLibrary: requests permission → launches → returns first asset", async () => {
    mockRequestLibrary.mockResolvedValue({ granted: true, status: "granted" });
    mockLaunchLibrary.mockResolvedValue({ canceled: false, assets: [ASSET] });
    const result = await imagePickerBody.pickFromLibrary({ mediaTypes: "images" });
    expect(mockRequestLibrary).toHaveBeenCalledTimes(1);
    expect(mockLaunchLibrary).toHaveBeenCalledWith({ mediaTypes: "images" });
    expect(result).toEqual(ASSET);
  });

  it("pickFromLibrary: throws PermissionDeniedError('library') on denial", async () => {
    mockRequestLibrary.mockResolvedValue({ granted: false, status: "denied" });
    await expect(imagePickerBody.pickFromLibrary({})).rejects.toBeInstanceOf(PermissionDeniedError);
  });

  it("pickFromLibrary: returns null when user cancels", async () => {
    mockRequestLibrary.mockResolvedValue({ granted: true, status: "granted" });
    mockLaunchLibrary.mockResolvedValue({ canceled: true });
    const result = await imagePickerBody.pickFromLibrary({});
    expect(result).toBeNull();
  });

  it("pickFromLibrary: returns null when peer isn't installed", async () => {
    mockGetPeer.mockReturnValueOnce(null);
    const result = await imagePickerBody.pickFromLibrary({});
    expect(result).toBeNull();
  });
});
