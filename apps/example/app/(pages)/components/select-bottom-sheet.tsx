import { useState } from "react";
import { Text, View } from "react-native";
import { SelectBottomSheet, useUIKit } from "ui-kraken";

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

export default function SelectBottomSheetScreen() {
  const { activeTheme } = useUIKit();
  const isDark = activeTheme === "dark";
  const captionColor = isDark ? "#9CA3AF" : "#6B7280";

  const [basic, setBasic] = useState<Country | null>(null);
  const [preselected, setPreselected] = useState<Country | null>("mx");
  const [helper, setHelper] = useState<Country | null>(null);
  const [errored, setErrored] = useState<Country | null>(null);
  const [titled, setTitled] = useState<Country | null>("br");
  const [snap, setSnap] = useState<Country | null>(null);
  const [subset, setSubset] = useState<Country | null>(null);
  const [brand, setBrand] = useState<Country | null>("es");
  const [pill, setPill] = useState<Country | null>(null);

  return (
    <Screen
      title="SelectBottomSheet"
      subtitle="Single-choice picker with drag-to-dismiss bottom sheet. Peer deps: @gorhom/bottom-sheet + react-native-gesture-handler. Graceful fallback when missing."
    >
      <Section title="Basic — no value selected">
        <SelectBottomSheet<Country> options={[...COUNTRIES]} value={basic} onChange={setBasic} />
        <Text style={{ color: captionColor, fontSize: 12 }}>Selected: {basic ?? "(none)"}</Text>
      </Section>

      <Section title="Preselected value">
        <SelectBottomSheet<Country>
          options={[...COUNTRIES]}
          value={preselected}
          onChange={setPreselected}
        />
      </Section>

      <Section title="With label + helper text">
        <SelectBottomSheet<Country>
          options={[...COUNTRIES]}
          value={helper}
          onChange={setHelper}
          label="Country"
          helperText="Drag down or tap the backdrop to dismiss."
        />
      </Section>

      <Section title="Error state">
        <SelectBottomSheet<Country>
          options={[...COUNTRIES]}
          value={errored}
          onChange={setErrored}
          label="Country"
          errorText="Please pick a country."
        />
      </Section>

      <Section title="With sheet title">
        <SelectBottomSheet<Country>
          options={[...COUNTRIES]}
          value={titled}
          onChange={setTitled}
          label="Country"
          sheetTitle="Choose your country"
        />
      </Section>

      <Section title="Compact snap point (30%)">
        <SelectBottomSheet<Country>
          options={[...COUNTRIES]}
          value={snap}
          onChange={setSnap}
          label="Country"
          snapPoints={["30%"]}
        />
      </Section>

      <Section title="Disabled subset (BR + AR)">
        <SelectBottomSheet<Country>
          options={[...COUNTRIES]}
          value={subset}
          onChange={setSubset}
          disabledOptions={["br", "ar"]}
          label="Country"
        />
        <Text style={{ color: captionColor, fontSize: 12 }}>
          Brazil and Argentina stay disabled regardless of taps.
        </Text>
      </Section>

      <Section title="Per-instance brand palette">
        <SelectBottomSheet<Country>
          options={[...COUNTRIES]}
          value={brand}
          onChange={setBrand}
          label="Brand accent"
          selectBottomSheetColors={{
            borderFocused: "#7C3AED",
            chevron: "#7C3AED",
            sheetHandle: "#7C3AED",
            optionSelectedBackground: "#EDE9FE",
          }}
        />
      </Section>

      <Section title="Pill radius">
        <SelectBottomSheet<Country>
          options={[...COUNTRIES]}
          value={pill}
          onChange={setPill}
          label="Country"
          radius="pill"
        />
      </Section>

      <Section title="Fully disabled">
        <SelectBottomSheet<Country>
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
