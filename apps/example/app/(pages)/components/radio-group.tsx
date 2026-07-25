import { useState } from "react";
import { Text, View } from "react-native";
import { RadioGroup, useUIKit } from "ui-kraken";

import { Screen } from "../../../src/screen";
import { Section } from "../../../src/section";

type YesNo = "yes" | "no";
type Size = "sm" | "md" | "lg";

const YES_NO_OPTIONS = [
  { value: "yes" as const, label: "Sí" },
  { value: "no" as const, label: "No" },
];

const SIZE_OPTIONS = [
  { value: "sm" as const, label: "S" },
  { value: "md" as const, label: "M" },
  { value: "lg" as const, label: "L" },
];

export default function RadioGroupScreen() {
  const { activeTheme } = useUIKit();
  const isDark = activeTheme === "dark";
  const readoutColor = isDark ? "#9CA3AF" : "#6B7280";

  const [basic, setBasic] = useState<YesNo | null>(null);
  const [labeled, setLabeled] = useState<YesNo | null>("no");
  const [size, setSize] = useState<Size | null>("md");
  const [brand, setBrand] = useState<YesNo | null>("yes");
  const [radiusValue, setRadiusValue] = useState<YesNo | null>("yes");

  return (
    <Screen
      title="RadioGroup"
      subtitle="Single-choice picker. Controlled, generic value type, vertical or horizontal, provider-level + per-instance color overrides."
    >
      <Section title="Basic (vertical)">
        <RadioGroup<YesNo>
          value={basic}
          onChange={setBasic}
          options={YES_NO_OPTIONS}
          testID="basic"
        />
        <Text style={{ color: readoutColor, fontSize: 13, marginTop: 8 }}>
          Selected: {basic ?? "(nothing)"}
        </Text>
      </Section>

      <Section title="With label">
        <RadioGroup<YesNo>
          label="Are you the vehicle owner?"
          value={labeled}
          onChange={setLabeled}
          options={[
            { value: "yes", label: "Yes, it's mine" },
            { value: "no", label: "No, I rent it" },
          ]}
          testID="labeled"
        />
      </Section>

      <Section title="Horizontal (segmented picker)">
        <RadioGroup<Size>
          value={size}
          onChange={setSize}
          options={SIZE_OPTIONS}
          orientation="horizontal"
          testID="size"
        />
        <Text style={{ color: readoutColor, fontSize: 13, marginTop: 8 }}>
          Selected size: {size ?? "(none)"}
        </Text>
      </Section>

      <Section title="Disabled">
        <RadioGroup<YesNo>
          value="yes"
          onChange={() => undefined}
          options={YES_NO_OPTIONS}
          disabled
          testID="disabled"
        />
      </Section>

      <Section title="Per-instance color override">
        <RadioGroup<YesNo>
          label="Brand-orange radios"
          value={brand}
          onChange={setBrand}
          options={YES_NO_OPTIONS}
          radioGroupColors={{
            selectedBorder: "#FF6B00",
            unselectedBorder: "#FFC58F",
            dot: "#FF6B00",
            label: "#3B0A00",
            groupLabel: "#3B0A00",
            selectedBackground: "#FFF7ED",
          }}
          testID="brand"
        />
      </Section>

      <Section title="Radius presets">
        <View style={{ gap: 12 }}>
          <RadioGroup<YesNo>
            value={radiusValue}
            onChange={setRadiusValue}
            options={YES_NO_OPTIONS}
            radius="none"
            testID="radius-none"
          />
          <RadioGroup<YesNo>
            value={radiusValue}
            onChange={setRadiusValue}
            options={YES_NO_OPTIONS}
            radius="lg"
            testID="radius-lg"
          />
          <RadioGroup<YesNo>
            value={radiusValue}
            onChange={setRadiusValue}
            options={YES_NO_OPTIONS}
            radius="pill"
            testID="radius-pill"
          />
          <RadioGroup<YesNo>
            value={radiusValue}
            onChange={setRadiusValue}
            options={YES_NO_OPTIONS}
            radius={24}
            testID="radius-24"
          />
        </View>
      </Section>
    </Screen>
  );
}
