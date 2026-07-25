import type * as GorhomProbe from "./gorhom-probe";

/**
 * The probe attempts a `require("@gorhom/bottom-sheet")` and a
 * `require("react-native-gesture-handler")` at module import
 * time. Both fail in the jest-expo env because they pull in
 * native-only modules on load — we exercise the failure /
 * partial-failure branches directly.
 *
 * The "both peers present" branch is exercised implicitly by
 * running the app on a real device (or by anyone integrating
 * ui-kraken with both peers installed). We keep a `jest.doMock`
 * variant of the happy path that returns fake namespaces so the
 * probe's cached success state is verifiable in isolation.
 */
describe("gorhom-probe", () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it("returns available=true + no missing peers when both requires resolve to fake modules", () => {
    jest.isolateModules(() => {
      jest.doMock("@gorhom/bottom-sheet", () => ({
        BottomSheetModal: () => null,
        BottomSheetView: () => null,
        BottomSheetBackdrop: () => null,
        BottomSheetModalProvider: () => null,
      }));
      jest.doMock("react-native-gesture-handler", () => ({}));
      const probe: typeof GorhomProbe = require("./gorhom-probe");
      expect(probe.areBottomSheetPeersAvailable()).toBe(true);
      expect(probe.missingBottomSheetPeers()).toEqual([]);
      expect(probe.getGorhomModule()).not.toBeNull();
    });
  });

  it("reports @gorhom/bottom-sheet as missing when its require throws", () => {
    jest.isolateModules(() => {
      jest.doMock("@gorhom/bottom-sheet", () => {
        throw new Error("Module not found");
      });
      jest.doMock("react-native-gesture-handler", () => ({}));
      const probe: typeof GorhomProbe = require("./gorhom-probe");
      expect(probe.areBottomSheetPeersAvailable()).toBe(false);
      expect(probe.missingBottomSheetPeers()).toContain("@gorhom/bottom-sheet");
      expect(probe.getGorhomModule()).toBeNull();
    });
  });

  it("reports react-native-gesture-handler as missing when its require throws", () => {
    jest.isolateModules(() => {
      jest.doMock("@gorhom/bottom-sheet", () => ({
        BottomSheetModal: () => null,
        BottomSheetView: () => null,
        BottomSheetBackdrop: () => null,
        BottomSheetModalProvider: () => null,
      }));
      jest.doMock("react-native-gesture-handler", () => {
        throw new Error("Module not found");
      });
      const probe: typeof GorhomProbe = require("./gorhom-probe");
      expect(probe.areBottomSheetPeersAvailable()).toBe(false);
      expect(probe.missingBottomSheetPeers()).toContain("react-native-gesture-handler");
    });
  });

  it("reports both peers as missing when both requires throw", () => {
    jest.isolateModules(() => {
      jest.doMock("@gorhom/bottom-sheet", () => {
        throw new Error("Module not found");
      });
      jest.doMock("react-native-gesture-handler", () => {
        throw new Error("Module not found");
      });
      const probe: typeof GorhomProbe = require("./gorhom-probe");
      expect(probe.areBottomSheetPeersAvailable()).toBe(false);
      expect(probe.missingBottomSheetPeers()).toEqual([
        "@gorhom/bottom-sheet",
        "react-native-gesture-handler",
      ]);
      expect(probe.getGorhomModule()).toBeNull();
    });
  });
});
