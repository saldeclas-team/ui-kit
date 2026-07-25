import { useState } from "react";
import { Text, View } from "react-native";
import { MultiSelect, useUIKit } from "ui-kraken";

import { Screen } from "../../../src/screen";
import { Section } from "../../../src/section";

const TOPICS = [
  { value: "design", label: "Design" },
  { value: "engineering", label: "Engineering" },
  { value: "product", label: "Product" },
  { value: "growth", label: "Growth" },
  { value: "ops", label: "Ops" },
] as const;

type Topic = (typeof TOPICS)[number]["value"];

export default function MultiSelectScreen() {
  const { activeTheme } = useUIKit();
  const isDark = activeTheme === "dark";
  const captionColor = isDark ? "#9CA3AF" : "#6B7280";

  const [basic, setBasic] = useState<Topic[]>([]);
  const [labeled, setLabeled] = useState<Topic[]>(["engineering", "product"]);
  const [errored, setErrored] = useState<Topic[]>([]);
  const [subsetDisabled, setSubsetDisabled] = useState<Topic[]>(["design"]);
  const [brand, setBrand] = useState<Topic[]>(["design", "product"]);

  return (
    <Screen
      title="MultiSelect"
      subtitle="Chip-based multi-choice picker. Controlled, generic in the value type, wraps to multiple rows when chips overflow."
    >
      <Section title="Basic">
        <MultiSelect<Topic> options={[...TOPICS]} value={basic} onChange={setBasic} />
        <Text style={{ color: captionColor, fontSize: 12 }}>Selected: [{basic.join(", ")}]</Text>
      </Section>

      <Section title="With label + helper text">
        <MultiSelect<Topic>
          options={[...TOPICS]}
          value={labeled}
          onChange={setLabeled}
          label="Topics you follow"
          helperText="Tap chips to toggle. Pick as many as you want."
        />
      </Section>

      <Section title="Error state">
        <MultiSelect<Topic>
          options={[...TOPICS]}
          value={errored}
          onChange={setErrored}
          label="Categories"
          errorText="Please pick at least one category."
        />
      </Section>

      <Section title="Disabled subset (Ops disabled)">
        <MultiSelect<Topic>
          options={[...TOPICS]}
          value={subsetDisabled}
          onChange={setSubsetDisabled}
          disabledOptions={["ops"]}
          label="Categories (Ops on hold)"
        />
        <Text style={{ color: captionColor, fontSize: 12 }}>
          Ops stays disabled regardless of taps.
        </Text>
      </Section>

      <Section title="Per-instance brand palette">
        <MultiSelect<Topic>
          options={[...TOPICS]}
          value={brand}
          onChange={setBrand}
          label="Brand accent"
          multiSelectColors={{
            selectedBackground: "#7C3AED",
            selectedLabel: "#FFFFFF",
            selectedBorder: "#7C3AED",
            unselectedBorder: "#C4B5FD",
          }}
        />
      </Section>

      <Section title="Fully disabled">
        <MultiSelect<Topic>
          options={[...TOPICS]}
          value={["engineering"]}
          onChange={() => undefined}
          disabled
          label="Read-only view"
        />
      </Section>

      <Section title="Long list — wraps to multiple rows">
        <MultiSelect<string> options={LONG_OPTIONS} value={[]} onChange={() => undefined} />
        <Text style={{ color: captionColor, fontSize: 12 }}>
          Chips wrap when there are too many for a single row.
        </Text>
      </Section>

      <View style={{ height: 40 }} />
    </Screen>
  );
}

const LONG_OPTIONS = [
  "typescript",
  "react",
  "react-native",
  "expo",
  "tamagui",
  "storybook",
  "vite",
  "jest",
  "playwright",
  "chromatic",
].map((v) => ({ value: v, label: v }));
