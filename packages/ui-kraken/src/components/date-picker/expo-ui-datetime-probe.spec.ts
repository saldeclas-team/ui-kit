import type * as DateTimeProbe from "./expo-ui-datetime-probe";

/**
 * The probe attempts a `require("@expo/ui/community/datetime-picker")`
 * at module import time. Test env resolves it (installed as a
 * devDep of the workspace); we cover the "resolved" branch by
 * mocking the module with a stub, and the "missing" branch by
 * making the require throw. Same pattern as
 * `select-native/expo-ui-probe.spec.ts` and
 * `segmented-control/expo-ui-segmented-probe.spec.ts`.
 */
describe("expo-ui-datetime-probe", () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it("returns available=true + non-null DateTimePicker when the peer resolves", () => {
    jest.isolateModules(() => {
      jest.doMock("@expo/ui/community/datetime-picker", () => ({
        DateTimePicker: () => null,
      }));
      const probe: typeof DateTimeProbe = require("./expo-ui-datetime-probe");
      expect(probe.isDateTimePickerAvailable()).toBe(true);
      expect(probe.getExpoUIDateTimePicker()).not.toBeNull();
    });
  });

  it("returns available=false + null when the require throws", () => {
    jest.isolateModules(() => {
      jest.doMock("@expo/ui/community/datetime-picker", () => {
        throw new Error("Module not found");
      });
      const probe: typeof DateTimeProbe = require("./expo-ui-datetime-probe");
      expect(probe.isDateTimePickerAvailable()).toBe(false);
      expect(probe.getExpoUIDateTimePicker()).toBeNull();
    });
  });
});
