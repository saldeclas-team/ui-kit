/**
 * Direct test of the iOS body — covers the MenuView-missing text-
 * only fallback (line 52) that select-native.spec.tsx's tests
 * don't hit because they always resolve the peer.
 *
 * The main happy-path is exercised at the shell level by
 * `select-native.spec.tsx`; this file focuses on the branches
 * unique to the iOS body's own implementation.
 */
import * as React from "react";
import TestRenderer, { act } from "react-test-renderer";

import type * as IosBodyModule from "./native-picker-body.ios";
import type { SelectNativeOption } from "./select-native-types";

const mockGetMenuView = jest.fn();

jest.mock("./expo-ui-probe", () => ({
  getExpoUIMenuView: () => mockGetMenuView(),
}));

jest.mock("tamagui", () => {
  const rn = jest.requireActual("react-native");
  const React = jest.requireActual("react");
  return {
    Text: (props: Record<string, unknown>) => React.createElement(rn.Text, props),
    XStack: (props: Record<string, unknown>) => React.createElement(rn.View, props),
    YStack: (props: Record<string, unknown>) => React.createElement(rn.View, props),
  };
});

const { NativePickerBody } = require("./native-picker-body.ios.tsx") as typeof IosBodyModule;

const OPTIONS: SelectNativeOption<"a" | "b">[] = [
  { value: "a", label: "Alpha" },
  { value: "b", label: "Beta" },
];

function tryRender(element: React.ReactElement): TestRenderer.ReactTestRenderer | null {
  let root: TestRenderer.ReactTestRenderer | null = null;
  try {
    act(() => {
      root = TestRenderer.create(element);
    });
  } catch {
    /* swallow */
  }
  return root;
}

describe("NativePickerBody.ios — peer-missing text-only fallback", () => {
  beforeEach(() => {
    mockGetMenuView.mockReset();
    mockGetMenuView.mockReturnValue(null);
  });

  it("renders text-only trigger with the selected label when MenuView is null", () => {
    const root = tryRender(
      <NativePickerBody
        testID="sn"
        options={OPTIONS}
        value="b"
        onChange={jest.fn()}
        disabled={false}
        placeholderLabel="Pick one"
        triggerTextColor="#000"
        chevronColor="#333"
      />
    );
    const triggerText = root!.root.findByProps({ testID: "sn-trigger-text" });
    expect(triggerText.props.children).toBe("Beta");
    // No MenuView wrapper — the fallback branch doesn't create one.
    expect(() => root!.root.findByProps({ testID: "sn-menu" })).toThrow();
  });

  it("renders text-only trigger with the placeholder when value is null and MenuView is null", () => {
    const root = tryRender(
      <NativePickerBody
        testID="sn"
        options={OPTIONS}
        value={null}
        onChange={jest.fn()}
        disabled={false}
        placeholderLabel="Pick one"
        triggerTextColor="#000"
        chevronColor="#333"
      />
    );
    const triggerText = root!.root.findByProps({ testID: "sn-trigger-text" });
    expect(triggerText.props.children).toBe("Pick one");
  });
});
