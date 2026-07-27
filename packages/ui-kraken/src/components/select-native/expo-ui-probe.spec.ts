import type * as ExpoUIProbe from "./expo-ui-probe";

/**
 * The probe attempts a `require("@expo/ui")` at module import
 * time. Because the test env resolves `@expo/ui` (installed as a
 * devDep), the "available" branch runs by default. The "missing"
 * branch is exercised by scoping a `jest.isolateModules` block
 * with a targeted `jest.doMock("@expo/ui", ...)` that throws.
 */
describe("expo-ui-probe", () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it("returns available=true + non-null Host/Picker when @expo/ui resolves", () => {
    jest.isolateModules(() => {
      const probe: typeof ExpoUIProbe = require("./expo-ui-probe");
      expect(probe.isExpoUIAvailable()).toBe(true);
      expect(probe.getExpoUIHost()).not.toBeNull();
      expect(probe.getExpoUIPicker()).not.toBeNull();
    });
  });

  it("returns available=false + null Host/Picker when @expo/ui require throws", () => {
    jest.isolateModules(() => {
      jest.doMock("@expo/ui", () => {
        throw new Error("Module not found");
      });
      const probe: typeof ExpoUIProbe = require("./expo-ui-probe");
      expect(probe.isExpoUIAvailable()).toBe(false);
      expect(probe.getExpoUIHost()).toBeNull();
      expect(probe.getExpoUIPicker()).toBeNull();
    });
  });

  it("returns a non-null MenuView when @expo/ui/community/menu resolves", () => {
    jest.isolateModules(() => {
      const probe: typeof ExpoUIProbe = require("./expo-ui-probe");
      expect(probe.getExpoUIMenuView()).not.toBeNull();
    });
  });

  it("returns null MenuView when @expo/ui/community/menu require throws", () => {
    jest.isolateModules(() => {
      jest.doMock("@expo/ui/community/menu", () => {
        throw new Error("Submodule not installed");
      });
      const probe: typeof ExpoUIProbe = require("./expo-ui-probe");
      expect(probe.getExpoUIMenuView()).toBeNull();
    });
  });
});
