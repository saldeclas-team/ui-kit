import type * as BottomSheetProbe from "./expo-ui-bottom-sheet-probe";

/**
 * The probe attempts a `require("@expo/ui/community/bottom-sheet")`
 * at module import time. Test env resolves it (installed as a
 * devDep of the workspace); we cover the "resolved" branch by
 * mocking with a stub, and the "missing" branch by making the
 * require throw. Same pattern as the DatePicker + SegmentedControl
 * probes.
 */
describe("expo-ui-bottom-sheet-probe", () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it("returns available=true + non-null BottomSheet + View when the peer resolves", () => {
    jest.isolateModules(() => {
      jest.doMock("@expo/ui/community/bottom-sheet", () => ({
        __esModule: true,
        default: () => null,
        BottomSheetView: () => null,
      }));
      const probe: typeof BottomSheetProbe = require("./expo-ui-bottom-sheet-probe");
      expect(probe.isBottomSheetAvailable()).toBe(true);
      expect(probe.getExpoUIBottomSheet()).not.toBeNull();
      expect(probe.getExpoUIBottomSheetView()).not.toBeNull();
    });
  });

  it("returns available=false + null when the require throws", () => {
    jest.isolateModules(() => {
      jest.doMock("@expo/ui/community/bottom-sheet", () => {
        throw new Error("Module not found");
      });
      const probe: typeof BottomSheetProbe = require("./expo-ui-bottom-sheet-probe");
      expect(probe.isBottomSheetAvailable()).toBe(false);
      expect(probe.getExpoUIBottomSheet()).toBeNull();
      expect(probe.getExpoUIBottomSheetView()).toBeNull();
    });
  });
});
