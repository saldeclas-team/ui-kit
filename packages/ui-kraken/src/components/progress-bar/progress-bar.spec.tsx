import { render, screen } from "@testing-library/react-native";
import { createRef } from "react";
import type { View } from "react-native";

import type { ProgressBarColors } from "../../tokens/tokens-types";

// Mock tamagui YStack + XStack + Text so we can inspect resolved
// props without booting Tamagui.
jest.mock("tamagui", () => {
  const rn = jest.requireActual("react-native");
  const forwardRef = jest.requireActual("react").forwardRef;
  const box = forwardRef((props: Record<string, unknown>, ref: unknown) => (
    <rn.View ref={ref} {...props} />
  ));
  const text = (props: Record<string, unknown>) => <rn.Text {...props} />;
  return { YStack: box, XStack: box, Text: text };
});

const LIGHT_PB_COLORS: ProgressBarColors = {
  track: "#E5E7EB",
  fill: "#2563EB",
  label: "#111827",
};
const DARK_PB_COLORS: ProgressBarColors = {
  track: "#374151",
  fill: "#60A5FA",
  label: "#F9FAFB",
};

type MockUIKit = {
  activeTheme: "light" | "dark";
  tokens: { progressBarColors: ProgressBarColors };
};
const mockUseUIKit = jest.fn<MockUIKit, []>(() => ({
  activeTheme: "light",
  tokens: { progressBarColors: LIGHT_PB_COLORS },
}));
jest.mock("../../provider/use-ui-kit", () => ({
  useUIKit: () => mockUseUIKit(),
}));

import { clampValue, computePercent, ProgressBar, resolveTrackHeight } from "./progress-bar";

describe("ProgressBar component", () => {
  beforeEach(() => {
    mockUseUIKit.mockReturnValue({
      activeTheme: "light",
      tokens: { progressBarColors: LIGHT_PB_COLORS },
    });
  });

  describe("root testID + sub-slots", () => {
    it('defaults testID to "progress-bar"', async () => {
      await render(<ProgressBar />);
      expect(screen.getByTestId("progress-bar")).toBeTruthy();
      expect(screen.getByTestId("progress-bar-track")).toBeTruthy();
      expect(screen.getByTestId("progress-bar-fill")).toBeTruthy();
    });

    it("custom testID overrides + propagates to track / fill sub-slots", async () => {
      await render(<ProgressBar testID="pb" />);
      expect(screen.getByTestId("pb")).toBeTruthy();
      expect(screen.getByTestId("pb-track")).toBeTruthy();
      expect(screen.getByTestId("pb-fill")).toBeTruthy();
    });

    it("label sub-slot is absent by default", async () => {
      await render(<ProgressBar testID="pb-no-label" />);
      expect(screen.queryByTestId("pb-no-label-label")).toBeNull();
    });

    it("label sub-slot renders when showValueLabel is set", async () => {
      await render(<ProgressBar testID="pb-with-label" value={50} showValueLabel />);
      expect(screen.getByTestId("pb-with-label-label")).toBeTruthy();
    });
  });

  describe("value → percent → fill width", () => {
    it("default value=0 renders 0% fill", async () => {
      await render(<ProgressBar testID="pb" />);
      expect(screen.getByTestId("pb-fill").props.width).toBe("0%");
    });

    it("50 of 100 → 50%", async () => {
      await render(<ProgressBar testID="pb" value={50} />);
      expect(screen.getByTestId("pb-fill").props.width).toBe("50%");
    });

    it("100 of 100 → 100%", async () => {
      await render(<ProgressBar testID="pb" value={100} />);
      expect(screen.getByTestId("pb-fill").props.width).toBe("100%");
    });

    it("value < min clamps to 0%", async () => {
      await render(<ProgressBar testID="pb" value={-10} />);
      expect(screen.getByTestId("pb-fill").props.width).toBe("0%");
    });

    it("value > max clamps to 100%", async () => {
      await render(<ProgressBar testID="pb" value={200} />);
      expect(screen.getByTestId("pb-fill").props.width).toBe("100%");
    });

    it("NaN renders as 0%", async () => {
      await render(<ProgressBar testID="pb" value={NaN} />);
      expect(screen.getByTestId("pb-fill").props.width).toBe("0%");
    });

    it("custom range: min=0 max=200 value=100 → 50%", async () => {
      await render(<ProgressBar testID="pb" min={0} max={200} value={100} />);
      expect(screen.getByTestId("pb-fill").props.width).toBe("50%");
    });

    it("custom range: min=50 max=100 value=75 → 50%", async () => {
      await render(<ProgressBar testID="pb" min={50} max={100} value={75} />);
      expect(screen.getByTestId("pb-fill").props.width).toBe("50%");
    });
  });

  describe("size resolution", () => {
    it.each([
      ["sm", 4],
      ["md", 8],
      ["lg", 12],
    ] as const)("preset '%s' resolves to track height %d", async (size, expected) => {
      await render(<ProgressBar testID={size} size={size} />);
      expect(screen.getByTestId(`${size}-track`).props.height).toBe(expected);
      expect(screen.getByTestId(`${size}-fill`).props.height).toBe(expected);
    });

    it("raw numeric size passes through", async () => {
      await render(<ProgressBar testID="pb" size={20} />);
      expect(screen.getByTestId("pb-track").props.height).toBe(20);
    });
  });

  describe("radius resolution", () => {
    it('default radius="full" → borderRadius = height/2', async () => {
      await render(<ProgressBar testID="pb" size="md" />);
      expect(screen.getByTestId("pb-track").props.borderRadius).toBe(4);
    });

    it('radius="none" → borderRadius = 0', async () => {
      await render(<ProgressBar testID="pb" size="md" radius="none" />);
      expect(screen.getByTestId("pb-track").props.borderRadius).toBe(0);
      expect(screen.getByTestId("pb-fill").props.borderRadius).toBe(0);
    });
  });

  describe("label rendering", () => {
    it("no label props → no label sub-slot", async () => {
      await render(<ProgressBar testID="pb" value={50} />);
      expect(screen.queryByTestId("pb-label")).toBeNull();
    });

    it('showValueLabel → "{percent}%" text', async () => {
      await render(<ProgressBar testID="pb" value={73} showValueLabel />);
      expect(screen.getByTestId("pb-label").props.children).toBe("73%");
    });

    it("showValueLabel rounds to integer percent", async () => {
      await render(<ProgressBar testID="pb" value={1} min={0} max={3} showValueLabel />);
      // 1/3 * 100 = 33.333..., rounds to 33%
      expect(screen.getByTestId("pb-label").props.children).toBe("33%");
    });

    it("custom label wins over showValueLabel", async () => {
      await render(<ProgressBar testID="pb" value={50} showValueLabel label="Uploading photo" />);
      expect(screen.getByTestId("pb-label").props.children).toBe("Uploading photo");
    });

    it("custom label without showValueLabel also renders", async () => {
      await render(<ProgressBar testID="pb" value={30} label="Step 2 of 5" />);
      expect(screen.getByTestId("pb-label").props.children).toBe("Step 2 of 5");
    });
  });

  describe("palette resolution", () => {
    it("default track/fill/label come from provider palette", async () => {
      await render(<ProgressBar testID="pb" value={50} showValueLabel />);
      expect(screen.getByTestId("pb-track").props.backgroundColor).toBe("#E5E7EB");
      expect(screen.getByTestId("pb-fill").props.backgroundColor).toBe("#2563EB");
      expect(screen.getByTestId("pb-label").props.color).toBe("#111827");
    });

    it("per-instance progressBarColors override wins", async () => {
      await render(
        <ProgressBar
          testID="pb"
          value={50}
          showValueLabel
          progressBarColors={{ track: "#FFF7ED", fill: "#F97316", label: "#7C2D12" }}
        />
      );
      expect(screen.getByTestId("pb-track").props.backgroundColor).toBe("#FFF7ED");
      expect(screen.getByTestId("pb-fill").props.backgroundColor).toBe("#F97316");
      expect(screen.getByTestId("pb-label").props.color).toBe("#7C2D12");
    });

    it("dark palette wins when provider swaps activeTheme", async () => {
      mockUseUIKit.mockReturnValue({
        activeTheme: "dark",
        tokens: { progressBarColors: DARK_PB_COLORS },
      });
      await render(<ProgressBar testID="dark" value={50} />);
      expect(screen.getByTestId("dark-fill").props.backgroundColor).toBe("#60A5FA");
    });
  });

  describe("a11y + ref", () => {
    it('defaults accessibilityRole to "progressbar"', async () => {
      await render(<ProgressBar testID="pb" />);
      expect(screen.getByTestId("pb").props.accessibilityRole).toBe("progressbar");
    });

    it("accessibilityValue reflects clamped value + min/max", async () => {
      await render(<ProgressBar testID="pb" value={73} />);
      expect(screen.getByTestId("pb").props.accessibilityValue).toEqual({
        min: 0,
        max: 100,
        now: 73,
      });
    });

    it("accessibilityValue reflects clamped OVER-MAX value", async () => {
      await render(<ProgressBar testID="pb" value={200} max={100} />);
      expect(screen.getByTestId("pb").props.accessibilityValue.now).toBe(100);
    });

    it('accessibilityLabel defaults to "Progress" when no label set', async () => {
      await render(<ProgressBar testID="pb" />);
      expect(screen.getByTestId("pb").props.accessibilityLabel).toBe("Progress");
    });

    it("accessibilityLabel defaults to `label` when set", async () => {
      await render(<ProgressBar testID="pb" label="Uploading photo" />);
      expect(screen.getByTestId("pb").props.accessibilityLabel).toBe("Uploading photo");
    });

    it("consumer accessibilityLabel override wins", async () => {
      await render(<ProgressBar testID="pb" label="Uploading" accessibilityLabel="a11y wins" />);
      expect(screen.getByTestId("pb").props.accessibilityLabel).toBe("a11y wins");
    });

    it("forwards ref to the root element", async () => {
      const ref = createRef<View>();
      await render(<ProgressBar ref={ref} testID="pb" />);
      expect(ref.current).not.toBeNull();
    });
  });

  describe("snapshots", () => {
    it("default (value=0, md, no label)", async () => {
      await render(<ProgressBar />);
      expect(screen.toJSON()).toMatchSnapshot();
    });

    it("50% with value label (md, full radius)", async () => {
      await render(<ProgressBar value={50} showValueLabel />);
      expect(screen.toJSON()).toMatchSnapshot();
    });

    it("75% with custom label (lg, none radius)", async () => {
      await render(<ProgressBar value={75} label="Almost there" size="lg" radius="none" />);
      expect(screen.toJSON()).toMatchSnapshot();
    });

    it("dark theme × sm × 30%", async () => {
      mockUseUIKit.mockReturnValue({
        activeTheme: "dark",
        tokens: { progressBarColors: DARK_PB_COLORS },
      });
      await render(<ProgressBar size="sm" value={30} />);
      expect(screen.toJSON()).toMatchSnapshot();
    });
  });
});

describe("clampValue — pure helper", () => {
  it.each([
    [50, 0, 100, 50],
    [-10, 0, 100, 0],
    [200, 0, 100, 100],
    [50, 50, 100, 50], // == min
    [100, 0, 100, 100], // == max
    [0, 0, 100, 0], // both ends 0-anchored
  ])("clampValue(%d, %d, %d) → %d", (value, min, max, expected) => {
    expect(clampValue(value, min, max)).toBe(expected);
  });

  it("NaN returns min (defensive)", () => {
    expect(clampValue(NaN, 0, 100)).toBe(0);
    expect(clampValue(NaN, 50, 100)).toBe(50);
  });

  it("inverted range (min > max) returns min", () => {
    expect(clampValue(50, 100, 0)).toBe(100);
  });
});

describe("computePercent — pure helper", () => {
  it("0 of 0-100 → 0", () => {
    expect(computePercent(0, 0, 100)).toBe(0);
  });

  it("100 of 0-100 → 100", () => {
    expect(computePercent(100, 0, 100)).toBe(100);
  });

  it("50 of 0-100 → 50", () => {
    expect(computePercent(50, 0, 100)).toBe(50);
  });

  it("100 of 0-200 → 50", () => {
    expect(computePercent(100, 0, 200)).toBe(50);
  });

  it("75 of 50-100 → 50", () => {
    expect(computePercent(75, 50, 100)).toBe(50);
  });

  it("zero-width range (min === max) returns 0", () => {
    expect(computePercent(50, 50, 50)).toBe(0);
  });

  it("inverted range (min > max) returns 0", () => {
    expect(computePercent(50, 100, 0)).toBe(0);
  });
});

describe("resolveTrackHeight — pure helper", () => {
  it.each([
    ["sm", 4],
    ["md", 8],
    ["lg", 12],
  ] as const)("preset '%s' → %d", (input, expected) => {
    expect(resolveTrackHeight(input)).toBe(expected);
  });

  it("raw number passes through", () => {
    expect(resolveTrackHeight(20)).toBe(20);
    expect(resolveTrackHeight(1)).toBe(1);
  });
});
