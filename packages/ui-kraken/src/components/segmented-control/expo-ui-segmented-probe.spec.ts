import type * as SegmentedProbe from "./expo-ui-segmented-probe";

/**
 * The probe attempts a `require("@expo/ui/community/segmented-control")`
 * at module import time. Test env resolves it (installed as a
 * devDep of the workspace); we cover the "resolved" branch by
 * mocking the module with a stub, and the "missing" branch by
 * making the require throw. Same pattern as
 * `select-native/expo-ui-probe.spec.ts`.
 */
describe("expo-ui-segmented-probe", () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it("returns available=true + non-null SegmentedControl when the peer resolves", () => {
    jest.isolateModules(() => {
      jest.doMock("@expo/ui/community/segmented-control", () => ({
        SegmentedControl: () => null,
      }));
      const probe: typeof SegmentedProbe = require("./expo-ui-segmented-probe");
      expect(probe.isSegmentedControlAvailable()).toBe(true);
      expect(probe.getExpoUISegmentedControl()).not.toBeNull();
    });
  });

  it("returns available=false + null when the require throws", () => {
    jest.isolateModules(() => {
      jest.doMock("@expo/ui/community/segmented-control", () => {
        throw new Error("Module not found");
      });
      const probe: typeof SegmentedProbe = require("./expo-ui-segmented-probe");
      expect(probe.isSegmentedControlAvailable()).toBe(false);
      expect(probe.getExpoUISegmentedControl()).toBeNull();
    });
  });
});
