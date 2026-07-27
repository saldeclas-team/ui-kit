import type * as ImagePickerProbe from "./expo-image-picker-probe";

/**
 * Same probe test shape as our other native-peer probes
 * (BottomSheet, DatePicker, SegmentedControl). Cover both
 * "resolved" and "throws" branches via `jest.isolateModules`
 * + `jest.doMock`.
 */
describe("expo-image-picker-probe", () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it("returns available=true + non-null module when the peer resolves", () => {
    jest.isolateModules(() => {
      jest.doMock("expo-image-picker", () => ({
        launchCameraAsync: jest.fn(),
        launchImageLibraryAsync: jest.fn(),
        requestCameraPermissionsAsync: jest.fn(),
        requestMediaLibraryPermissionsAsync: jest.fn(),
      }));
      const probe: typeof ImagePickerProbe = require("./expo-image-picker-probe");
      expect(probe.isImagePickerAvailable()).toBe(true);
      expect(probe.getExpoImagePicker()).not.toBeNull();
    });
  });

  it("returns available=false + null when the require throws", () => {
    jest.isolateModules(() => {
      jest.doMock("expo-image-picker", () => {
        throw new Error("Module not found");
      });
      const probe: typeof ImagePickerProbe = require("./expo-image-picker-probe");
      expect(probe.isImagePickerAvailable()).toBe(false);
      expect(probe.getExpoImagePicker()).toBeNull();
    });
  });
});
