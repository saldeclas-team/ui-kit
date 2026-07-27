import { useState } from "react";
import { Text, View } from "react-native";
import { Select, useUIKit } from "ui-kraken";

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

export default function SelectScreen() {
  const { activeTheme } = useUIKit();
  const isDark = activeTheme === "dark";
  const captionColor = isDark ? "#9CA3AF" : "#6B7280";

  const [basic, setBasic] = useState<Country | null>(null);
  const [preselected, setPreselected] = useState<Country | null>("mx");
  const [helper, setHelper] = useState<Country | null>(null);
  const [errored, setErrored] = useState<Country | null>(null);
  const [titled, setTitled] = useState<Country | null>("br");
  const [subset, setSubset] = useState<Country | null>(null);
  const [brand, setBrand] = useState<Country | null>("es");
  const [pill, setPill] = useState<Country | null>(null);

  return (
    <Screen
      title="Select"
      subtitle="Single-choice picker rendered as a trigger + centered modal card. Controlled, generic in the value type, zero peer deps."
    >
      <Section title="Basic — no value selected">
        <Select<Country> options={[...COUNTRIES]} value={basic} onChange={setBasic} />
        <Text style={{ color: captionColor, fontSize: 12 }}>Selected: {basic ?? "(none)"}</Text>
      </Section>

      <Section title="Preselected value">
        <Select<Country> options={[...COUNTRIES]} value={preselected} onChange={setPreselected} />
      </Section>

      <Section title="With label + helper text">
        <Select<Country>
          options={[...COUNTRIES]}
          value={helper}
          onChange={setHelper}
          label="Country"
          helperText="Used for billing address auto-completion."
        />
      </Section>

      <Section title="Error state">
        <Select<Country>
          options={[...COUNTRIES]}
          value={errored}
          onChange={setErrored}
          label="Country"
          errorText="Please pick a country."
        />
      </Section>

      <Section title="With modal title">
        <Select<Country>
          options={[...COUNTRIES]}
          value={titled}
          onChange={setTitled}
          label="Country"
          modalTitle="Choose your country"
        />
      </Section>

      <Section title="Disabled subset (BR + AR)">
        <Select<Country>
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
        <Select<Country>
          options={[...COUNTRIES]}
          value={brand}
          onChange={setBrand}
          label="Brand accent"
          selectColors={{
            borderFocused: "#7C3AED",
            chevron: "#7C3AED",
            optionSelectedBackground: "#F5F3FF",
          }}
        />
      </Section>

      <Section title="Pill radius">
        <Select<Country>
          options={[...COUNTRIES]}
          value={pill}
          onChange={setPill}
          label="Country"
          radius="pill"
          placeholder="Pick a country"
        />
      </Section>

      <Section title="Fully disabled">
        <Select<Country>
          options={[...COUNTRIES]}
          value="us"
          onChange={() => undefined}
          disabled
          label="Read-only view"
        />
      </Section>

      <View style={{ height: 40 }} />
    </Screen>
  );
}
