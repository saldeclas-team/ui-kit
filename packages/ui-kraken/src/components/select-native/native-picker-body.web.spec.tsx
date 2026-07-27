/**
 * Direct test of the web body. jest-expo defaults to iOS platform
 * resolution, so we require the `.web.tsx` file explicitly by full
 * name.
 *
 * Web uses `<Host><Picker>` from `@expo/ui` instead of `MenuView`
 * because MenuView explicitly does NOT fire actions on web (the
 * component's own docs call this out). This spec exercises the
 * placeholder-synthesis path (value not in options → prepend a
 * synthetic entry) and the onValueChange forwarding.
 */
import * as React from "react";
import TestRenderer, { act } from "react-test-renderer";

import type * as WebBodyModule from "./native-picker-body.web";
import type { SelectNativeOption } from "./select-native-types";

const mockGetHost = jest.fn();
const mockGetPicker = jest.fn();

jest.mock("./expo-ui-probe", () => ({
  getExpoUIHost: () => mockGetHost(),
  getExpoUIPicker: () => mockGetPicker(),
}));

const { NativePickerBody } = require("./native-picker-body.web.tsx") as typeof WebBodyModule;

const OPTIONS: SelectNativeOption<"a" | "b" | "c">[] = [
  { value: "a", label: "Alpha" },
  { value: "b", label: "Beta" },
  { value: "c", label: "Gamma" },
];

/**
 * Fake `<Host>` — a passthrough View with a testID that carries
 * the `matchContents` prop for assertion.
 */
function makeFakeHost() {
  const rn = jest.requireActual("react-native");
  return function FakeHost(props: { matchContents?: boolean; children?: React.ReactNode }) {
    return React.createElement(rn.View, {
      testID: "sn-host",
      "data-match-contents": props.matchContents === true,
      children: props.children,
    });
  };
}

/**
 * Fake `<Picker>` — a Pressable that captures `onValueChange` and
 * exposes it via `onPress` so tests can trigger it. Also carries
 * `selectedValue` / `enabled` on its props so we can assert
 * forwarding. Its static `.Item` renders children as no-op RN
 * elements (needed because the body maps options to `<Picker.Item>`).
 */
function makeFakePicker() {
  const rn = jest.requireActual("react-native");
  const Picker = function FakePicker(props: {
    testID?: string;
    selectedValue: string | number;
    onValueChange?: (next: string | number) => void;
    appearance?: string;
    enabled?: boolean;
    children?: React.ReactNode;
    // arbitrary picked value to fire; defaults to first opt
    __pickValue?: string | number;
  }) {
    return React.createElement(rn.Pressable, {
      testID: props.testID,
      onPress: () => props.onValueChange?.(props.__pickValue ?? "b"),
      "data-selected-value": props.selectedValue,
      "data-enabled": props.enabled,
      "data-appearance": props.appearance,
      children: props.children,
    });
  } as React.FunctionComponent<{
    testID?: string;
    selectedValue: string | number;
    onValueChange?: (next: string | number) => void;
    appearance?: string;
    enabled?: boolean;
    children?: React.ReactNode;
  }> & {
    Item: React.FunctionComponent<{ value: string | number; label: string }>;
  };
  Picker.Item = function FakeItem(props: { value: string | number; label: string }) {
    return React.createElement(rn.Text, {
      "data-item-value": props.value,
      children: props.label,
    });
  };
  return Picker;
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

describe("NativePickerBody.web", () => {
  beforeEach(() => {
    mockGetHost.mockReset();
    mockGetPicker.mockReset();
    mockGetHost.mockReturnValue(makeFakeHost());
    mockGetPicker.mockReturnValue(makeFakePicker());
  });

  it("renders Host + Picker with forwarded props when value matches an option", () => {
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
    const picker = root!.root
      .findAllByProps({ testID: "sn-picker" })
      .find((n) => typeof n.props.onPress === "function")!;
    expect(picker.props["data-selected-value"]).toBe("a");
    expect(picker.props["data-enabled"]).toBe(true);
    expect(picker.props["data-appearance"]).toBe("menu");
  });

  it("prepends a synthetic placeholder when value is null (no match)", () => {
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
    const picker = root!.root
      .findAllByProps({ testID: "sn-picker" })
      .find((n) => typeof n.props.onPress === "function")!;
    // effectiveValue is the synthetic "" (cast from null).
    expect(picker.props["data-selected-value"]).toBe("");
    // First Item child is the placeholder synthetic row.
    const items = root!.root.findAllByProps({ "data-item-value": "" });
    expect(items[0]?.props.children).toBe("Pick one");
  });

  it("prepends a synthetic placeholder when value is set but not in options", () => {
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
    const picker = root!.root
      .findAllByProps({ testID: "sn-picker" })
      .find((n) => typeof n.props.onPress === "function")!;
    expect(picker.props["data-selected-value"]).toBe("zzz");
  });

  it("passes enabled=false when disabled=true", () => {
    const root = tryRender(
      <NativePickerBody
        testID="sn"
        options={OPTIONS}
        value="a"
        onChange={jest.fn()}
        disabled
        placeholderLabel="Pick one"
        triggerTextColor="#000"
        chevronColor="#333"
      />
    );
    const picker = root!.root
      .findAllByProps({ testID: "sn-picker" })
      .find((n) => typeof n.props.onPress === "function")!;
    expect(picker.props["data-enabled"]).toBe(false);
  });

  it("onValueChange unwraps and fires with the picked value", () => {
    const onChange = jest.fn();
    const root = tryRender(
      <NativePickerBody
        testID="sn"
        options={OPTIONS}
        value="a"
        onChange={onChange}
        disabled={false}
        placeholderLabel="Pick one"
        triggerTextColor="#000"
        chevronColor="#333"
      />
    );
    const pressable = root!.root
      .findAllByProps({ testID: "sn-picker" })
      .find((n) => typeof n.props.onPress === "function");
    act(() => {
      pressable!.props.onPress();
    });
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith("b");
  });

  it("Host receives matchContents=true", () => {
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
    const host = root!.root.findByProps({ testID: "sn-host" });
    expect(host.props["data-match-contents"]).toBe(true);
  });

  it("renders the fallback and skips Host/Picker when fallback is set", () => {
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
        fallback={<React.Fragment />}
      />
    );
    expect(() => root!.root.findByProps({ testID: "sn-host" })).toThrow();
    expect(() => root!.root.findByProps({ testID: "sn-picker" })).toThrow();
  });

  it("returns null when Host is missing (peer not installed)", () => {
    mockGetHost.mockReturnValue(null);
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
    expect(() => root!.root.findByProps({ testID: "sn-host" })).toThrow();
  });

  it("returns null when Picker is missing (peer not installed)", () => {
    mockGetPicker.mockReturnValue(null);
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
    expect(() => root!.root.findByProps({ testID: "sn-picker" })).toThrow();
  });
});
