import { render, screen } from "@testing-library/react-native";
import { Text } from "react-native";
import { createRef } from "react";

import type { BottomSheetBodyRef } from "./bottom-sheet-body-types";

/**
 * Direct test of the platform-agnostic fallback (`bottom-sheet-body.tsx`).
 * Metro / jest-expo normally resolve `.ios` / `.android` / `.web`
 * variants first; this file only fires on runtimes with none of
 * those. Kept minimal — verifies the ref is still safe to call
 * (all no-ops) and that the fallback renders when passed.
 */

import type * as BottomSheetBodyModule from "./bottom-sheet-body";

// Import the fallback file directly by full filename — jest-expo
// would otherwise resolve to `.ios.tsx`.
const { BottomSheetBody } = require("./bottom-sheet-body.tsx") as typeof BottomSheetBodyModule;

const DEFAULT_PROPS = {
  snapPoints: ["50%", "90%"] as const,
  enablePanDownToClose: true,
  chromeColors: { background: "#FFFFFF" },
  testID: "bs",
};

describe("BottomSheetBody (platform-agnostic fallback)", () => {
  it("renders null when no fallback provided", async () => {
    await render(
      <BottomSheetBody {...DEFAULT_PROPS}>
        <></>
      </BottomSheetBody>
    );
    expect(screen.queryByTestId("bs-sheet")).toBeNull();
  });

  it("renders the fallback when passed", async () => {
    const fallback = <Text testID="bs-missing">Missing</Text>;
    await render(
      <BottomSheetBody {...DEFAULT_PROPS} fallback={fallback}>
        <></>
      </BottomSheetBody>
    );
    expect(screen.getByTestId("bs-missing")).toBeTruthy();
  });

  it("ref methods are safe no-ops", async () => {
    const ref = createRef<BottomSheetBodyRef>();
    await render(
      <BottomSheetBody ref={ref} {...DEFAULT_PROPS}>
        <></>
      </BottomSheetBody>
    );
    // All methods exist and don't throw.
    expect(() => ref.current?.present()).not.toThrow();
    expect(() => ref.current?.dismiss()).not.toThrow();
    expect(() => ref.current?.snapToIndex(0)).not.toThrow();
    expect(() => ref.current?.expand()).not.toThrow();
    expect(() => ref.current?.collapse()).not.toThrow();
  });
});
