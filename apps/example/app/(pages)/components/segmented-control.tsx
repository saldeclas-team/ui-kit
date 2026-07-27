import { useState } from "react";
import { Text, View } from "react-native";
import { SegmentedControl, useUIKit } from "ui-kraken";

import { Screen } from "../../../src/screen";
import { Section } from "../../../src/section";

const VIEW_MODES = [
  { value: "list", label: "List" },
  { value: "grid", label: "Grid" },
  { value: "map", label: "Map" },
] as const;

type ViewMode = (typeof VIEW_MODES)[number]["value"];

const SORT_OPTIONS = [
  { value: "az", label: "A→Z" },
  { value: "za", label: "Z→A" },
  { value: "new", label: "New" },
  { value: "old", label: "Old" },
  { value: "pop", label: "Top" },
] as const;

type SortMode = (typeof SORT_OPTIONS)[number]["value"];

export default function SegmentedControlScreen() {
  const { activeTheme } = useUIKit();
  const isDark = activeTheme === "dark";
  const captionColor = isDark ? "#9CA3AF" : "#6B7280";

  const [basic, setBasic] = useState<ViewMode>("list");
  const [tab, setTab] = useState<"active" | "archived">("active");
  const [sort, setSort] = useState<SortMode>("new");
  const [labeled, setLabeled] = useState<ViewMode>("grid");
  const [errored, setErrored] = useState<ViewMode>("list");

  return (
    <Screen
      title="SegmentedControl"
      subtitle="Horizontal segmented picker — native UISegmentedControl on iOS, Material 3 SegmentedButton on Android. Best for 2-5 short options."
    >
      <Section title="Basic — 3 view modes">
        <SegmentedControl<ViewMode> options={[...VIEW_MODES]} value={basic} onChange={setBasic} />
        <Text style={{ color: captionColor, fontSize: 12 }}>Selected: {basic}</Text>
      </Section>

      <Section title="Two options — filter tabs">
        <SegmentedControl<"active" | "archived">
          options={[
            { value: "active", label: "Active" },
            { value: "archived", label: "Archived" },
          ]}
          value={tab}
          onChange={setTab}
          label="Filter"
        />
      </Section>

      <Section title="Five options — sort direction">
        <SegmentedControl<SortMode>
          options={[...SORT_OPTIONS]}
          value={sort}
          onChange={setSort}
          label="Sort by"
          helperText="Compact labels keep the segments legible on narrow screens."
        />
        <Text style={{ color: captionColor, fontSize: 12 }}>Sort: {sort}</Text>
      </Section>

      <Section title="With label + helper text">
        <SegmentedControl<ViewMode>
          options={[...VIEW_MODES]}
          value={labeled}
          onChange={setLabeled}
          label="View mode"
          helperText="Native segmented affordance — pill on iOS, Material 3 on Android."
        />
      </Section>

      <Section title="Error state">
        <SegmentedControl<ViewMode>
          options={[...VIEW_MODES]}
          value={errored}
          onChange={setErrored}
          label="View mode"
          errorText="Selection failed to save. Try again."
        />
      </Section>

      <Section title="Fully disabled">
        <SegmentedControl<ViewMode>
          options={[...VIEW_MODES]}
          value="grid"
          onChange={() => undefined}
          disabled
          label="Read-only"
        />
      </Section>

      <Section title="Per-instance palette override (surrounding text)">
        <SegmentedControl<ViewMode>
          options={[...VIEW_MODES]}
          value={basic}
          onChange={setBasic}
          label="Brand-tinted labels"
          helperText="label + helperText slots are themable on every platform."
          segmentedControlColors={{
            label: "#7C3AED",
            helperText: "#A78BFA",
          }}
        />
      </Section>

      <Section title="Android chrome — square variant (androidRadius='none')">
        <SegmentedControl<ViewMode>
          options={[...VIEW_MODES]}
          value={basic}
          onChange={setBasic}
          label="Square pill"
          helperText="androidRadius='none' → boxy container. iOS ignores (native pill fixed)."
          androidRadius="none"
        />
      </Section>

      <Section title="Android chrome — medium radius (androidRadius='md')">
        <SegmentedControl<ViewMode>
          options={[...VIEW_MODES]}
          value={basic}
          onChange={setBasic}
          label="Rounded rectangle"
          helperText="androidRadius='md' → follows the coarse `radius` knob on the provider."
          androidRadius="md"
        />
      </Section>

      <Section title="Android chrome — brand-tinted selection">
        <SegmentedControl<ViewMode>
          options={[...VIEW_MODES]}
          value={basic}
          onChange={setBasic}
          label="Brand accent"
          helperText="6 Android-only palette slots let you retint the pill / border / text without touching iOS."
          segmentedControlColors={{
            containerBorder: "#7C3AED",
            selectedBackground: "#EDE9FE",
            selectedLabel: "#5B21B6",
            unselectedLabel: "#4C1D95",
            ripple: "#8B5CF633",
          }}
        />
      </Section>

      <View style={{ height: 40 }} />
    </Screen>
  );
}
