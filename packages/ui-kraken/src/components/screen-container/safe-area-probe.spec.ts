import type * as SafeAreaProbe from "./safe-area-probe";

/**
 * Same probe test shape as our other native-peer probes. Cover
 * both "resolved" and "throws" branches via `jest.isolateModules`
 * + `jest.doMock`.
 */
describe("safe-area-probe", () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it("returns available=true + non-null hook when the peer resolves", () => {
    jest.isolateModules(() => {
      jest.doMock("react-native-safe-area-context", () => ({
        useSafeAreaInsets: () => ({ top: 44, bottom: 34, left: 0, right: 0 }),
      }));
      const probe: typeof SafeAreaProbe = require("./safe-area-probe");
      expect(probe.isSafeAreaContextAvailable()).toBe(true);
      expect(probe.getUseSafeAreaInsets()).not.toBeNull();
      // Sanity: the hook returned actually calls through.
      const hook = probe.getUseSafeAreaInsets();
      expect(hook?.()).toEqual({ top: 44, bottom: 34, left: 0, right: 0 });
    });
  });

  it("returns available=false + null when the require throws", () => {
    jest.isolateModules(() => {
      jest.doMock("react-native-safe-area-context", () => {
        throw new Error("Module not found");
      });
      const probe: typeof SafeAreaProbe = require("./safe-area-probe");
      expect(probe.isSafeAreaContextAvailable()).toBe(false);
      expect(probe.getUseSafeAreaInsets()).toBeNull();
    });
  });
});
