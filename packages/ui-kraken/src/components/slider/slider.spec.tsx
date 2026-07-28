import { act, render, screen } from "@testing-library/react-native";
import { createRef } from "react";
import type { View } from "react-native";

import type { SliderColors } from "../../tokens/tokens-types";

// Mock tamagui YStack so we can inspect resolved props without
// booting Tamagui. Slider's track/fill/thumb are plain RN Views
// so they don't need mocking.
jest.mock("tamagui", () => {
  const rn = jest.requireActual("react-native");
  const forwardRef = jest.requireActual("react").forwardRef;
  const box = forwardRef((props: Record<string, unknown>, ref: unknown) => (
    <rn.View ref={ref} {...props} />
  ));
  return { YStack: box };
});

const LIGHT_SLIDER_COLORS: SliderColors = {
  track: "#E5E7EB",
  fill: "#2563EB",
  thumb: "#FFFFFF",
};
const DARK_SLIDER_COLORS: SliderColors = {
  track: "#374151",
  fill: "#60A5FA",
  thumb: "#F9FAFB",
};

type MockUIKit = {
  activeTheme: "light" | "dark";
  tokens: { sliderColors: SliderColors };
};
const mockUseUIKit = jest.fn<MockUIKit, []>(() => ({
  activeTheme: "light",
  tokens: { sliderColors: LIGHT_SLIDER_COLORS },
}));
jest.mock("../../provider/use-ui-kit", () => ({
  useUIKit: () => mockUseUIKit(),
}));

import { clampValue, computePercent, locationToValue, Slider, snapToStep } from "./slider";

// Helper: fire an onLayout event to set the track width so
// gesture math has a real width to work with. Without it, drag
// events short-circuit at `trackWidth <= 0`.
//
// RTL's `fireEvent` for RN Views calls the prop handler directly.
// Wrap in `act` so the resulting setState + re-render flush before
// the following assertions run.
async function simulateTrackLayout(testID: string, width: number) {
  await act(async () => {
    screen.getByTestId(`${testID}-track`).props.onLayout({
      nativeEvent: { layout: { width, height: 6, x: 0, y: 0 } },
    });
  });
}

describe("Slider component", () => {
  beforeEach(() => {
    mockUseUIKit.mockReturnValue({
      activeTheme: "light",
      tokens: { sliderColors: LIGHT_SLIDER_COLORS },
    });
  });

  describe("root testID + sub-slots", () => {
    it('defaults testID to "slider"', async () => {
      await render(<Slider value={0} onValueChange={jest.fn()} />);
      expect(screen.getByTestId("slider")).toBeTruthy();
      expect(screen.getByTestId("slider-track")).toBeTruthy();
      expect(screen.getByTestId("slider-fill")).toBeTruthy();
      expect(screen.getByTestId("slider-thumb")).toBeTruthy();
    });

    it("custom testID propagates to track / fill / thumb sub-slots", async () => {
      await render(<Slider testID="s" value={0} onValueChange={jest.fn()} />);
      expect(screen.getByTestId("s-track")).toBeTruthy();
      expect(screen.getByTestId("s-fill")).toBeTruthy();
      expect(screen.getByTestId("s-thumb")).toBeTruthy();
    });
  });

  describe("size resolution", () => {
    it.each([
      ["sm", 4, 16],
      ["md", 6, 20],
      ["lg", 8, 24],
    ] as const)("size='%s' → track %d + thumb %d", async (size, trackH, thumbSz) => {
      await render(<Slider testID={size} value={0} onValueChange={jest.fn()} size={size} />);
      expect(screen.getByTestId(`${size}-track`).props.style.height).toBe(trackH);
      expect(screen.getByTestId(`${size}-thumb`).props.style.width).toBe(thumbSz);
    });
  });

  describe("value → fill width / thumb position", () => {
    it("value=0 renders 0 width fill", async () => {
      await render(<Slider testID="s" value={0} onValueChange={jest.fn()} />);
      await simulateTrackLayout("s", 200);
      expect(screen.getByTestId("s-fill").props.style.width).toBe(0);
    });

    it("value=50 on 0-100 range renders 50% fill (100 px on 200 track)", async () => {
      await render(<Slider testID="s" value={50} onValueChange={jest.fn()} />);
      await simulateTrackLayout("s", 200);
      expect(screen.getByTestId("s-fill").props.style.width).toBe(100);
    });

    it("value=100 renders full width fill", async () => {
      await render(<Slider testID="s" value={100} onValueChange={jest.fn()} />);
      await simulateTrackLayout("s", 200);
      expect(screen.getByTestId("s-fill").props.style.width).toBe(200);
    });

    it("value < min clamps to 0% fill", async () => {
      await render(<Slider testID="s" value={-10} onValueChange={jest.fn()} />);
      await simulateTrackLayout("s", 200);
      expect(screen.getByTestId("s-fill").props.style.width).toBe(0);
    });

    it("value > max clamps to full width fill", async () => {
      await render(<Slider testID="s" value={200} onValueChange={jest.fn()} />);
      await simulateTrackLayout("s", 200);
      expect(screen.getByTestId("s-fill").props.style.width).toBe(200);
    });
  });

  describe("disabled state", () => {
    it("disabled=true dims via opacity + sets accessibilityState.disabled", async () => {
      await render(<Slider testID="s" value={50} onValueChange={jest.fn()} disabled />);
      const root = screen.getByTestId("s");
      expect(root.props.opacity).toBe(0.5);
      expect(root.props.accessibilityState).toEqual({ disabled: true });
    });

    it("disabled=false has full opacity + accessibilityState.disabled=false", async () => {
      await render(<Slider testID="s" value={50} onValueChange={jest.fn()} />);
      expect(screen.getByTestId("s").props.opacity).toBe(1);
      expect(screen.getByTestId("s").props.accessibilityState).toEqual({ disabled: false });
    });
  });

  describe("PanResponder wiring (smoke)", () => {
    // PanResponder's internal gesture state (`touchBank`,
    // `touchHistory`) can't be simulated with jest's fireEvent —
    // touching those handlers directly crashes with
    // "Cannot read properties of undefined (reading 'touchBank')".
    // Coverage of the value transformation is via the exported
    // `locationToValue` helper below; here we just smoke-test that
    // PanResponder attached the handler map to the track.
    it("track view exposes the four PanResponder handlers", async () => {
      await render(<Slider testID="s" value={0} onValueChange={jest.fn()} />);
      const track = screen.getByTestId("s-track");
      expect(typeof track.props.onStartShouldSetResponder).toBe("function");
      expect(typeof track.props.onMoveShouldSetResponder).toBe("function");
      expect(typeof track.props.onResponderGrant).toBe("function");
      expect(typeof track.props.onResponderMove).toBe("function");
      expect(typeof track.props.onResponderRelease).toBe("function");
    });

    it("disabled=true → onStartShouldSetResponder returns false", async () => {
      await render(<Slider testID="s" value={0} onValueChange={jest.fn()} disabled />);
      const track = screen.getByTestId("s-track");
      expect(track.props.onStartShouldSetResponder()).toBe(false);
      expect(track.props.onMoveShouldSetResponder()).toBe(false);
    });

    it("disabled=false → should-set-responder returns true", async () => {
      await render(<Slider testID="s" value={0} onValueChange={jest.fn()} />);
      const track = screen.getByTestId("s-track");
      expect(track.props.onStartShouldSetResponder()).toBe(true);
      expect(track.props.onMoveShouldSetResponder()).toBe(true);
    });
  });

  describe("a11y actions (increment / decrement)", () => {
    it("increment action fires onValueChange with value + step", async () => {
      const onValueChange = jest.fn();
      await render(<Slider testID="s" value={20} onValueChange={onValueChange} step={5} />);
      await act(async () => {
        screen.getByTestId("s").props.onAccessibilityAction({
          nativeEvent: { actionName: "increment" },
        });
      });
      expect(onValueChange).toHaveBeenCalledWith(25);
    });

    it("decrement action fires onValueChange with value − step", async () => {
      const onValueChange = jest.fn();
      await render(<Slider testID="s" value={20} onValueChange={onValueChange} step={5} />);
      await act(async () => {
        screen.getByTestId("s").props.onAccessibilityAction({
          nativeEvent: { actionName: "decrement" },
        });
      });
      expect(onValueChange).toHaveBeenCalledWith(15);
    });

    it("increment on step=0 (continuous) bumps by 1", async () => {
      const onValueChange = jest.fn();
      await render(
        <Slider testID="s" value={0.5} onValueChange={onValueChange} min={0} max={10} step={0} />
      );
      await act(async () => {
        screen.getByTestId("s").props.onAccessibilityAction({
          nativeEvent: { actionName: "increment" },
        });
      });
      expect(onValueChange).toHaveBeenCalledWith(1.5);
    });

    it("increment past max clamps at max", async () => {
      const onValueChange = jest.fn();
      await render(<Slider testID="s" value={99} onValueChange={onValueChange} step={5} />);
      await act(async () => {
        screen.getByTestId("s").props.onAccessibilityAction({
          nativeEvent: { actionName: "increment" },
        });
      });
      // 99 + 5 = 104 → clamp to 100 → snap to nearest 5 → 100.
      expect(onValueChange).toHaveBeenCalledWith(100);
    });

    it("decrement below min clamps at min", async () => {
      const onValueChange = jest.fn();
      await render(<Slider testID="s" value={2} onValueChange={onValueChange} step={5} />);
      await act(async () => {
        screen.getByTestId("s").props.onAccessibilityAction({
          nativeEvent: { actionName: "decrement" },
        });
      });
      expect(onValueChange).toHaveBeenCalledWith(0);
    });

    it("unknown action name is a no-op", async () => {
      const onValueChange = jest.fn();
      await render(<Slider testID="s" value={50} onValueChange={onValueChange} />);
      await act(async () => {
        screen.getByTestId("s").props.onAccessibilityAction({
          nativeEvent: { actionName: "unknown" },
        });
      });
      expect(onValueChange).not.toHaveBeenCalled();
    });

    it("a11y action on disabled slider is a no-op", async () => {
      const onValueChange = jest.fn();
      await render(<Slider testID="s" value={50} onValueChange={onValueChange} disabled />);
      await act(async () => {
        screen.getByTestId("s").props.onAccessibilityAction({
          nativeEvent: { actionName: "increment" },
        });
      });
      expect(onValueChange).not.toHaveBeenCalled();
    });
  });

  describe("palette resolution", () => {
    it("default track / fill / thumb come from provider", async () => {
      await render(<Slider testID="s" value={50} onValueChange={jest.fn()} />);
      expect(screen.getByTestId("s-track").props.style.backgroundColor).toBe("#E5E7EB");
      expect(screen.getByTestId("s-fill").props.style.backgroundColor).toBe("#2563EB");
      expect(screen.getByTestId("s-thumb").props.style.backgroundColor).toBe("#FFFFFF");
    });

    it("per-instance sliderColors override wins", async () => {
      await render(
        <Slider
          testID="s"
          value={50}
          onValueChange={jest.fn()}
          sliderColors={{ track: "#FEE2E2", fill: "#DC2626", thumb: "#7F1D1D" }}
        />
      );
      expect(screen.getByTestId("s-track").props.style.backgroundColor).toBe("#FEE2E2");
      expect(screen.getByTestId("s-fill").props.style.backgroundColor).toBe("#DC2626");
      expect(screen.getByTestId("s-thumb").props.style.backgroundColor).toBe("#7F1D1D");
    });

    it("dark palette wins when provider swaps activeTheme", async () => {
      mockUseUIKit.mockReturnValue({
        activeTheme: "dark",
        tokens: { sliderColors: DARK_SLIDER_COLORS },
      });
      await render(<Slider testID="dk" value={50} onValueChange={jest.fn()} />);
      expect(screen.getByTestId("dk-fill").props.style.backgroundColor).toBe("#60A5FA");
    });
  });

  describe("a11y root + ref", () => {
    it('defaults accessibilityRole to "adjustable" + accessibilityValue', async () => {
      await render(<Slider testID="s" value={50} onValueChange={jest.fn()} min={0} max={100} />);
      const root = screen.getByTestId("s");
      expect(root.props.accessibilityRole).toBe("adjustable");
      expect(root.props.accessibilityValue).toEqual({ min: 0, max: 100, now: 50 });
    });

    it("accessibilityValue reflects clamped over-max value", async () => {
      await render(<Slider testID="s" value={200} onValueChange={jest.fn()} min={0} max={100} />);
      expect(screen.getByTestId("s").props.accessibilityValue.now).toBe(100);
    });

    it("accessibilityLabel defaults to 'Slider'", async () => {
      await render(<Slider testID="s" value={0} onValueChange={jest.fn()} />);
      expect(screen.getByTestId("s").props.accessibilityLabel).toBe("Slider");
    });

    it("consumer accessibilityLabel override wins", async () => {
      await render(
        <Slider testID="s" value={0} onValueChange={jest.fn()} accessibilityLabel="Volume" />
      );
      expect(screen.getByTestId("s").props.accessibilityLabel).toBe("Volume");
    });

    it("forwards ref to the root element", async () => {
      const ref = createRef<View>();
      await render(<Slider ref={ref} testID="s" value={0} onValueChange={jest.fn()} />);
      expect(ref.current).not.toBeNull();
    });
  });

  describe("snapshots", () => {
    it("default (md, value=50)", async () => {
      await render(<Slider value={50} onValueChange={jest.fn()} />);
      expect(screen.toJSON()).toMatchSnapshot();
    });

    it("small size at 25%", async () => {
      await render(<Slider size="sm" value={25} onValueChange={jest.fn()} />);
      expect(screen.toJSON()).toMatchSnapshot();
    });

    it("large size disabled", async () => {
      await render(<Slider size="lg" value={80} onValueChange={jest.fn()} disabled />);
      expect(screen.toJSON()).toMatchSnapshot();
    });

    it("dark theme × md", async () => {
      mockUseUIKit.mockReturnValue({
        activeTheme: "dark",
        tokens: { sliderColors: DARK_SLIDER_COLORS },
      });
      await render(<Slider value={40} onValueChange={jest.fn()} />);
      expect(screen.toJSON()).toMatchSnapshot();
    });
  });
});

describe("clampValue — pure helper", () => {
  it.each([
    [50, 0, 100, 50],
    [-10, 0, 100, 0],
    [200, 0, 100, 100],
  ])("clampValue(%d, %d, %d) → %d", (v, mn, mx, expected) => {
    expect(clampValue(v, mn, mx)).toBe(expected);
  });

  it("NaN returns min", () => {
    expect(clampValue(NaN, 5, 10)).toBe(5);
  });

  it("inverted range returns min", () => {
    expect(clampValue(50, 100, 0)).toBe(100);
  });
});

describe("computePercent — pure helper", () => {
  it("50 of 0-100 → 50", () => {
    expect(computePercent(50, 0, 100)).toBe(50);
  });

  it("zero-width range returns 0", () => {
    expect(computePercent(5, 5, 5)).toBe(0);
  });

  it("inverted range returns 0", () => {
    expect(computePercent(50, 100, 0)).toBe(0);
  });
});

describe("locationToValue — pure helper (gesture X → snapped value)", () => {
  it("locationX at 50% of trackWidth → 50 (0-100 range, step 1)", () => {
    expect(locationToValue(100, 200, 0, 100, 1, 0)).toBe(50);
  });

  it("locationX at 0 → min", () => {
    expect(locationToValue(0, 200, 0, 100, 1, 50)).toBe(0);
  });

  it("locationX at trackWidth → max", () => {
    expect(locationToValue(200, 200, 0, 100, 1, 0)).toBe(100);
  });

  it("locationX beyond trackWidth clamps to max", () => {
    expect(locationToValue(300, 200, 0, 100, 1, 0)).toBe(100);
  });

  it("negative locationX clamps to min", () => {
    expect(locationToValue(-50, 200, 0, 100, 1, 50)).toBe(0);
  });

  it("trackWidth <= 0 falls back to clamped currentValue", () => {
    expect(locationToValue(50, 0, 0, 100, 1, 30)).toBe(30);
    expect(locationToValue(50, 0, 0, 100, 1, 999)).toBe(100);
    expect(locationToValue(50, -10, 0, 100, 1, 42)).toBe(42);
  });

  it("step=10 snaps to nearest multiple", () => {
    // 100 of 200 → 50% → 50 (raw) → snap to 10s → 50.
    expect(locationToValue(100, 200, 0, 100, 10, 0)).toBe(50);
    // 128 of 200 → 64% → 64 (raw) → snap to 10s → 60.
    expect(locationToValue(128, 200, 0, 100, 10, 0)).toBe(60);
  });

  it("step=0 (continuous) passes floating-point through", () => {
    // 50 of 200 → 25% → 0.25 on 0-1 range.
    expect(locationToValue(50, 200, 0, 1, 0, 0)).toBeCloseTo(0.25);
  });

  it("custom min-max range", () => {
    // 100 of 200 → 50% → 50 on 0-100 range with min=50 → 75.
    expect(locationToValue(100, 200, 50, 100, 1, 0)).toBe(75);
  });
});

describe("snapToStep — pure helper", () => {
  it("step=1 rounds to nearest integer", () => {
    expect(snapToStep(2.4, 0, 1)).toBe(2);
    expect(snapToStep(2.6, 0, 1)).toBe(3);
  });

  it("step=0.5 rounds to nearest half", () => {
    expect(snapToStep(2.3, 0, 0.5)).toBe(2.5);
    expect(snapToStep(2.6, 0, 0.5)).toBe(2.5);
  });

  it("step=0 returns value untouched (continuous)", () => {
    expect(snapToStep(2.4, 0, 0)).toBe(2.4);
  });

  it("negative or NaN step returns value untouched", () => {
    expect(snapToStep(2.4, 0, -1)).toBe(2.4);
    expect(snapToStep(2.4, 0, NaN)).toBe(2.4);
  });

  it("step relative to non-zero min", () => {
    // min=5, step=10 → valid values are 5, 15, 25...
    expect(snapToStep(12, 5, 10)).toBe(15);
    expect(snapToStep(8, 5, 10)).toBe(5);
  });
});
