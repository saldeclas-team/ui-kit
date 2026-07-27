import { useState } from "react";
import { Text, View } from "react-native";
import { DatePicker, useUIKit } from "ui-kraken";

import { Screen } from "../../../src/screen";
import { Section } from "../../../src/section";

const IN_30_DAYS = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
const TEN_YEARS_AGO = new Date(new Date().getFullYear() - 10, 0, 1);

export default function DatePickerScreen() {
  const { activeTheme } = useUIKit();
  const isDark = activeTheme === "dark";
  const captionColor = isDark ? "#9CA3AF" : "#6B7280";

  const [dob, setDob] = useState<Date | null>(null);
  const [preselected, setPreselected] = useState<Date | null>(new Date(1990, 5, 12));
  const [time, setTime] = useState<Date | null>(null);
  const [datetime, setDatetime] = useState<Date | null>(null);
  const [departure, setDeparture] = useState<Date | null>(null);
  const [labeled, setLabeled] = useState<Date | null>(null);
  const [errored, setErrored] = useState<Date | null>(null);
  const [themed, setThemed] = useState<Date | null>(null);
  const [customFmt, setCustomFmt] = useState<Date | null>(new Date(2027, 5, 12));

  return (
    <Screen
      title="DatePicker"
      subtitle="Native date / time / datetime picker via @expo/ui — inline modal on iOS, Material 3 dialog on Android, browser input on web."
    >
      <Section title="Basic — date of birth">
        <DatePicker
          label="Date of birth"
          value={dob}
          onChange={setDob}
          maximumDate={new Date()}
          helperText="Tap to open the native picker."
        />
        <Text style={{ color: captionColor, fontSize: 12 }}>
          Selected: {dob == null ? "(none)" : dob.toISOString().slice(0, 10)}
        </Text>
      </Section>

      <Section title="Preselected value + custom locale">
        <DatePicker
          label="Date of birth"
          value={preselected}
          onChange={setPreselected}
          locale="en-US"
          dateStyle="long"
          helperText="dateStyle='long' + locale='en-US' → June 12, 1990."
        />
      </Section>

      <Section title="Time mode">
        <DatePicker
          label="Meeting time"
          mode="time"
          value={time}
          onChange={setTime}
          timeStyle="short"
          is24Hour
          helperText="mode='time' → clock picker. is24Hour applies on Android."
        />
      </Section>

      <Section title="Datetime mode">
        <DatePicker
          label="Reservation"
          mode="datetime"
          value={datetime}
          onChange={setDatetime}
          locale="en-US"
          dateStyle="medium"
          timeStyle="short"
          helperText="mode='datetime' → combined date + time in one flow."
        />
      </Section>

      <Section title="Range constraint — next 30 days">
        <DatePicker
          label="Departure"
          value={departure}
          onChange={setDeparture}
          minimumDate={new Date()}
          maximumDate={IN_30_DAYS}
          helperText="minimumDate + maximumDate constrain the native picker's range."
        />
      </Section>

      <Section title="Custom formatValue — ISO date only">
        <DatePicker
          label="ISO output"
          value={customFmt}
          onChange={setCustomFmt}
          formatValue={(d) => d.toISOString().slice(0, 10)}
          helperText="formatValue is a full escape hatch — bypasses dateStyle / locale."
        />
      </Section>

      <Section title="With label + helper text">
        <DatePicker
          label="Preferred date"
          value={labeled}
          onChange={setLabeled}
          helperText="label + helperText render above / below the trigger."
        />
      </Section>

      <Section title="Error state">
        <DatePicker
          label="Deadline"
          value={errored}
          onChange={setErrored}
          errorText="Please pick a date to continue."
        />
      </Section>

      <Section title="Fully disabled">
        <DatePicker
          label="Enrollment closed"
          value={TEN_YEARS_AGO}
          onChange={() => undefined}
          disabled
          locale="en-US"
          dateStyle="long"
          helperText="Read-only preview — the picker won't open."
        />
      </Section>

      <Section title="Per-instance palette override — brand purple">
        <DatePicker
          label="Themed date"
          value={themed}
          onChange={setThemed}
          helperText="datePickerColors lets you retint every slot per instance."
          datePickerColors={{
            border: "#7C3AED",
            borderFocused: "#7C3AED",
            text: "#4C1D95",
            chevron: "#7C3AED",
            accent: "#7C3AED",
          }}
        />
      </Section>

      <View style={{ height: 40 }} />
    </Screen>
  );
}
