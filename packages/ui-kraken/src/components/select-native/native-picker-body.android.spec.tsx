/**
 * Direct test of the Android body. jest-expo defaults to iOS
 * platform resolution, so we require the `.android.tsx` file
 * explicitly by full name.
 *
 * The body wraps `@expo/ui/community/menu`'s `MenuView` around a
 * Tamagui trigger. We mock the probe + tamagui + intercept the
 * MenuView with a Pressable stub that captures the action so we
 * can exercise `onPressAction`.
 */
import * as React from "react";
import TestRenderer, { act } from "react-test-renderer";

import type * as AndroidBodyModule from "./native-picker-body.android";
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

const { NativePickerBody } =
  require("./native-picker-body.android.tsx") as typeof AndroidBodyModule;

const OPTIONS: SelectNativeOption<"a" | "b" | "c">[] = [
  { value: "a", label: "Alpha" },
  { value: "b", label: "Beta" },
  { value: "c", label: "Gamma" },
];

/**
 * Fake MenuView captures its `onPressAction` on a Pressable so
 * tests can trigger it via `onPress()` — mirrors the pattern the
 * DatePicker iOS body spec uses to intercept the native picker.
 */
function makeFakeMenuView() {
  const rn = jest.requireActual("react-native");
  return function FakeMenuView(props: {
    testID?: string;
    onPressAction?: (event: { nativeEvent: { event: string } }) => void;
    // arbitrary picked action id to fire; defaults to "b"
    __pickId?: string;
    children?: React.ReactNode;
  }) {
    return React.createElement(rn.Pressable, {
      testID: props.testID,
      onPress: () => props.onPressAction?.({ nativeEvent: { event: props.__pickId ?? "b" } }),
      children: props.children,
    });
  };
}

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

describe("NativePickerBody.android", () => {
  beforeEach(() => {
    mockGetMenuView.mockReset();
    mockGetMenuView.mockReturnValue(makeFakeMenuView());
  });

  it("renders MenuView + trigger with placeholder when value is null", () => {
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

  it("renders the selected option's label as trigger text when value matches", () => {
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
  });

  it("falls back to placeholder when value is set but not in options", () => {
    const root = tryRender(
      <NativePickerBody
        testID="sn"
        options={OPTIONS}
        // Deliberately unknown — cast around the union so we can
        // exercise the "value present but not in options" branch.
        value={"zzz" as never}
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

  it("forwards options to MenuView.actions with correct state + disabled attribute", () => {
    const root = tryRender(
      <NativePickerBody
        testID="sn"
        options={OPTIONS}
        value="b"
        onChange={jest.fn()}
        disabled
        placeholderLabel="Pick one"
        triggerTextColor="#000"
        chevronColor="#333"
        menuTitle="Sort"
      />
    );
    const menu = root!.root
      .findAllByProps({ testID: "sn-menu" })
      .find((n) => Array.isArray(n.props.actions));
    expect(menu).toBeDefined();
    expect(menu!.props.title).toBe("Sort");
    expect(menu!.props.actions).toEqual([
      { id: "a", title: "Alpha", state: "off", attributes: { disabled: true } },
      { id: "b", title: "Beta", state: "on", attributes: { disabled: true } },
      { id: "c", title: "Gamma", state: "off", attributes: { disabled: true } },
    ]);
  });

  it("onPressAction commits the picked option's value via onChange", () => {
    const onChange = jest.fn();
    const root = tryRender(
      <NativePickerBody
        testID="sn"
        options={OPTIONS}
        value={null}
        onChange={onChange}
        disabled={false}
        placeholderLabel="Pick one"
        triggerTextColor="#000"
        chevronColor="#333"
      />
    );
    const pressable = root!.root
      .findAllByProps({ testID: "sn-menu" })
      .find((n) => typeof n.props.onPress === "function");
    act(() => {
      pressable!.props.onPress();
    });
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith("b");
  });

  it("onPressAction bails when disabled=true (no onChange call)", () => {
    const onChange = jest.fn();
    const root = tryRender(
      <NativePickerBody
        testID="sn"
        options={OPTIONS}
        value={null}
        onChange={onChange}
        disabled
        placeholderLabel="Pick one"
        triggerTextColor="#000"
        chevronColor="#333"
      />
    );
    const pressable = root!.root
      .findAllByProps({ testID: "sn-menu" })
      .find((n) => typeof n.props.onPress === "function");
    act(() => {
      pressable!.props.onPress();
    });
    expect(onChange).not.toHaveBeenCalled();
  });

  it("onPressAction bails when the picked id doesn't match any option", () => {
    const onChange = jest.fn();
    // Craft a MenuView that fires with an unknown action id.
    mockGetMenuView.mockReturnValue(function OOB(props: {
      testID?: string;
      onPressAction?: (event: { nativeEvent: { event: string } }) => void;
    }) {
      const rn = jest.requireActual("react-native");
      return React.createElement(rn.Pressable, {
        testID: props.testID,
        onPress: () => props.onPressAction?.({ nativeEvent: { event: "nonexistent" } }),
      });
    });
    const root = tryRender(
      <NativePickerBody
        testID="sn"
        options={OPTIONS}
        value={null}
        onChange={onChange}
        disabled={false}
        placeholderLabel="Pick one"
        triggerTextColor="#000"
        chevronColor="#333"
      />
    );
    const pressable = root!.root
      .findAllByProps({ testID: "sn-menu" })
      .find((n) => typeof n.props.onPress === "function");
    act(() => {
      pressable!.props.onPress();
    });
    expect(onChange).not.toHaveBeenCalled();
  });

  it("renders the fallback and skips the menu when fallback is set", () => {
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
        fallback={<React.Fragment />}
      />
    );
    expect(() => root!.root.findByProps({ testID: "sn-menu" })).toThrow();
  });

  it("renders text-only fallback when the peer is missing (no MenuView, no crash)", () => {
    mockGetMenuView.mockReturnValue(null);
    const root = tryRender(
      <NativePickerBody
        testID="sn"
        options={OPTIONS}
        value="a"
        onChange={jest.fn()}
        disabled={false}
        placeholderLabel="Pick one"
        triggerTextColor="#000"
        chevronColor="#333"
      />
    );
    // Text-only branch renders trigger-text with the option label.
    const triggerText = root!.root.findByProps({ testID: "sn-trigger-text" });
    expect(triggerText.props.children).toBe("Alpha");
    // No MenuView wrapper was rendered.
    expect(() => root!.root.findByProps({ testID: "sn-menu" })).toThrow();
  });

  it("uses triggerAccessibilityLabel when provided", () => {
    const root = tryRender(
      <NativePickerBody
        testID="sn"
        options={OPTIONS}
        value={null}
        onChange={jest.fn()}
        disabled={false}
        placeholderLabel="Pick one"
        triggerAccessibilityLabel="Custom a11y"
        triggerTextColor="#000"
        chevronColor="#333"
      />
    );
    const trigger = root!.root.findByProps({ testID: "sn-trigger" });
    expect(trigger.props.accessibilityLabel).toBe("Custom a11y");
  });
});
