import { render, screen } from "@testing-library/react-native";
import { Pressable, Text } from "react-native";

// Import the platform-agnostic fallback file directly with its
// full filename — jest-expo defaults to `.ios.tsx` when you import
// `./date-picker-body`, but we specifically want the `.tsx`
// (no-suffix) fallback here.
const { DatePickerBody } = require("./date-picker-body.tsx");
import type { DatePickerBodyPalette } from "./date-picker-body-types";

/**
 * Direct test of the platform-agnostic fallback (`date-picker-body.tsx`).
 * Metro / jest-expo normally resolve `.ios` / `.android` / `.web`
 * variants first; this file only fires on runtimes with none of
 * those (Node harnesses without Platform.OS set, unusual RN
 * forks). Kept minimal — just verifies it doesn't crash.
 */
const CHROME: DatePickerBodyPalette = {
  accent: "#7C3AED",
  background: "#FFFFFF",
  border: "#D1D5DB",
  borderFocused: "#2563EB",
};

function TriggerStub({ onPress, testID }: { onPress: () => void; testID: string }) {
  return (
    <Pressable onPress={onPress} testID={testID}>
      <Text>Trigger</Text>
    </Pressable>
  );
}

describe("DatePickerBody (platform-agnostic fallback)", () => {
  it("renders the trigger via renderTrigger with a no-op open handler", async () => {
    await render(
      <DatePickerBody
        value={null}
        onChange={jest.fn()}
        disabled={false}
        mode="date"
        appearance="light"
        chromeColors={CHROME}
        testID="dp"
        renderTrigger={(open) => <TriggerStub testID="dp-trigger" onPress={open} />}
      />
    );
    expect(screen.getByTestId("dp-trigger")).toBeTruthy();
  });

  it("renders the fallback when passed", async () => {
    const fallback = <Text testID="dp-missing">Missing</Text>;
    await render(
      <DatePickerBody
        value={null}
        onChange={jest.fn()}
        disabled={false}
        mode="date"
        appearance="light"
        chromeColors={CHROME}
        testID="dp"
        renderTrigger={(open) => <TriggerStub testID="dp-trigger" onPress={open} />}
        fallback={fallback}
      />
    );
    expect(screen.getByTestId("dp-missing")).toBeTruthy();
    expect(screen.queryByTestId("dp-trigger")).toBeNull();
  });
});
