import { useState } from "react";
import { Text, View } from "react-native";
import { SelectNative, useUIKit } from "ui-kraken";

import { Screen } from "../../../src/screen";
import { Section } from "../../../src/section";

const COUNTRIES = [
  { value: "us", label: "United States" },
  { value: "mx", label: "Mexico" },
  { value: "ca", label: "Canada" },
  { value: "br", label: "Brazil" },
  { value: "ar", label: "Argentina" },
  { value: "es", label: "Spain" },
  { value: "de", label: "Germany" },
  { value: "fr", label: "France" },
] as const;

type Country = (typeof COUNTRIES)[number]["value"];

export default function SelectNativeScreen() {
  const { activeTheme } = useUIKit();
  const isDark = activeTheme === "dark";
  const captionColor = isDark ? "#9CA3AF" : "#6B7280";

  const [basic, setBasic] = useState<Country | null>(null);
  const [preselected, setPreselected] = useState<Country | null>("mx");
  const [helper, setHelper] = useState<Country | null>(null);
  const [errored, setErrored] = useState<Country | null>(null);
  const [customPlaceholder, setCustomPlaceholder] = useState<Country | null>(null);
  const [brand, setBrand] = useState<Country | null>("es");
  const [pill, setPill] = useState<Country | null>(null);
  const [year, setYear] = useState<number | null>(null);

  return (
    <Screen
      title="SelectNative"
      subtitle="Single-choice picker rendered with @expo/ui's native Picker. SwiftUI Menu on iOS + Compose DropdownMenu on Android. Renders borderless by default for a fully-native feel — opt into the frame with `showBorderIOS` / `showBorderAndroid` per platform."
    >
      <Section title="Basic — 100% native, no wrapper chrome">
        <SelectNative<Country> options={[...COUNTRIES]} value={basic} onChange={setBasic} />
        <Text style={{ color: captionColor, fontSize: 12 }}>
          Just the native picker — no background, border, padding, or forced height. Selected:{" "}
          {basic ?? "(none)"}
        </Text>
      </Section>

      <Section title="Preselected value">
        <SelectNative<Country>
          options={[...COUNTRIES]}
          value={preselected}
          onChange={setPreselected}
        />
      </Section>

      <Section title="With label + helper text">
        <SelectNative<Country>
          options={[...COUNTRIES]}
          value={helper}
          onChange={setHelper}
          label="Country"
          helperText="Uses the platform-native picker for a fully native feel."
        />
      </Section>

      <Section title="Error state">
        <SelectNative<Country>
          options={[...COUNTRIES]}
          value={errored}
          onChange={setErrored}
          label="Country"
          errorText="Please pick a country."
        />
      </Section>

      <Section title="Custom placeholderLabel">
        <SelectNative<Country>
          options={[...COUNTRIES]}
          value={customPlaceholder}
          onChange={setCustomPlaceholder}
          label="Country"
          placeholderLabel="— Pick one —"
        />
      </Section>

      <Section title="Chrome opt-in (both platforms)">
        <SelectNative<Country>
          options={[...COUNTRIES]}
          value={brand}
          onChange={setBrand}
          label="With framed chrome"
          helperText="showBorderIOS + showBorderAndroid = frame wraps the picker (background + border + padding)."
          showBorderIOS
          showBorderAndroid
        />
      </Section>

      <Section title="Chrome only on iOS">
        <SelectNative<Country>
          options={[...COUNTRIES]}
          value={pill}
          onChange={setPill}
          label="Framed on iOS, pure native on Android"
          showBorderIOS
        />
      </Section>

      <Section title="Per-instance brand frame">
        <SelectNative<Country>
          options={[...COUNTRIES]}
          value={brand}
          onChange={setBrand}
          label="Brand-tinted (chrome opted in)"
          showBorderIOS
          showBorderAndroid
          selectNativeColors={{
            border: "#7C3AED",
            background: "#F5F3FF",
          }}
        />
      </Section>

      <Section title="Pill radius (requires chrome)">
        <SelectNative<Country>
          options={[...COUNTRIES]}
          value={pill}
          onChange={setPill}
          label="Country"
          radius="pill"
          showBorderIOS
          showBorderAndroid
        />
      </Section>

      <Section title="Numeric values">
        <SelectNative<number>
          options={[
            { value: 2023, label: "2023" },
            { value: 2024, label: "2024" },
            { value: 2025, label: "2025" },
            { value: 2026, label: "2026" },
          ]}
          value={year}
          onChange={setYear}
          label="Year"
          helperText="Values may be strings OR numbers — matches @expo/ui's PickerItemValue."
        />
      </Section>

      <Section title="Fully disabled">
        <SelectNative<Country>
          options={[...COUNTRIES]}
          value="us"
          onChange={() => undefined}
          disabled
          label="Read-only"
        />
      </Section>

      <View style={{ height: 40 }} />
    </Screen>
  );
}
