import { useState } from "react";
import { Text, View } from "react-native";
import { DateRangePicker, useUIKit } from "ui-kraken";

import { Screen } from "../../../src/screen";
import { Section } from "../../../src/section";

const IN_90_DAYS = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);
const CONTRACT_START = new Date(2027, 5, 12);
const CONTRACT_END = new Date(2027, 5, 26);

export default function DateRangePickerScreen() {
  const { activeTheme } = useUIKit();
  const isDark = activeTheme === "dark";
  const captionColor = isDark ? "#9CA3AF" : "#6B7280";

  const [vacationStart, setVacationStart] = useState<Date | null>(null);
  const [vacationEnd, setVacationEnd] = useState<Date | null>(null);

  const [contractStart, setContractStart] = useState<Date | null>(CONTRACT_START);
  const [contractEnd, setContractEnd] = useState<Date | null>(CONTRACT_END);

  const [horizontalStart, setHorizontalStart] = useState<Date | null>(null);
  const [horizontalEnd, setHorizontalEnd] = useState<Date | null>(null);

  const [reservationStart, setReservationStart] = useState<Date | null>(null);
  const [reservationEnd, setReservationEnd] = useState<Date | null>(null);

  const [hotelIn, setHotelIn] = useState<Date | null>(null);
  const [hotelOut, setHotelOut] = useState<Date | null>(null);

  const [departStart, setDepartStart] = useState<Date | null>(null);
  const [departEnd, setDepartEnd] = useState<Date | null>(null);

  const [labeledStart, setLabeledStart] = useState<Date | null>(null);
  const [labeledEnd, setLabeledEnd] = useState<Date | null>(null);

  const [erroredStart, setErroredStart] = useState<Date | null>(null);
  const [erroredEnd, setErroredEnd] = useState<Date | null>(null);

  const [themedStart, setThemedStart] = useState<Date | null>(null);
  const [themedEnd, setThemedEnd] = useState<Date | null>(null);

  return (
    <Screen
      title="DateRangePicker"
      subtitle="Start / end date range with auto-clamping. Composes two DatePickers; vertical or horizontal; date + datetime modes."
    >
      <Section title="Basic — vacation dates">
        <DateRangePicker
          label="Vacation"
          startDate={vacationStart}
          endDate={vacationEnd}
          onChange={(s, e) => {
            setVacationStart(s);
            setVacationEnd(e);
          }}
          helperText="Pick both dates. Native picker per bound."
        />
        <Text style={{ color: captionColor, fontSize: 12 }}>
          {vacationStart == null || vacationEnd == null
            ? "(range incomplete)"
            : `${vacationStart.toISOString().slice(0, 10)} → ${vacationEnd.toISOString().slice(0, 10)}`}
        </Text>
      </Section>

      <Section title="Preselected + custom locale">
        <DateRangePicker
          label="Contract term"
          startDate={contractStart}
          endDate={contractEnd}
          onChange={(s, e) => {
            setContractStart(s);
            setContractEnd(e);
          }}
          locale="en-US"
          dateStyle="long"
          helperText="dateStyle='long' + en-US applied to both triggers."
        />
      </Section>

      <Section title="Horizontal orientation">
        <DateRangePicker
          label="Report window"
          orientation="horizontal"
          startDate={horizontalStart}
          endDate={horizontalEnd}
          onChange={(s, e) => {
            setHorizontalStart(s);
            setHorizontalEnd(e);
          }}
          locale="en-US"
          helperText="orientation='horizontal' places triggers side-by-side with a '→' separator."
        />
      </Section>

      <Section title="Datetime mode — reservation">
        <DateRangePicker
          label="Reservation"
          mode="datetime"
          startDate={reservationStart}
          endDate={reservationEnd}
          onChange={(s, e) => {
            setReservationStart(s);
            setReservationEnd(e);
          }}
          locale="en-US"
          dateStyle="medium"
          timeStyle="short"
          helperText="mode='datetime' picks date + time in one flow."
        />
      </Section>

      <Section title="Custom labels — hotel check-in / check-out">
        <DateRangePicker
          label="Hotel stay"
          startLabel="Check-in"
          endLabel="Check-out"
          startPlaceholder="Pick check-in"
          endPlaceholder="Pick check-out"
          startDate={hotelIn}
          endDate={hotelOut}
          onChange={(s, e) => {
            setHotelIn(s);
            setHotelOut(e);
          }}
        />
      </Section>

      <Section title="Range constraint — next 90 days">
        <DateRangePicker
          label="Departure window"
          startDate={departStart}
          endDate={departEnd}
          onChange={(s, e) => {
            setDepartStart(s);
            setDepartEnd(e);
          }}
          minimumDate={new Date()}
          maximumDate={IN_90_DAYS}
          helperText="minimumDate + maximumDate constrain both native pickers."
        />
      </Section>

      <Section title="With label + helper text">
        <DateRangePicker
          label="Preferred range"
          startDate={labeledStart}
          endDate={labeledEnd}
          onChange={(s, e) => {
            setLabeledStart(s);
            setLabeledEnd(e);
          }}
          helperText="Both start and end labels default to 'Start' / 'End'."
        />
      </Section>

      <Section title="Error state">
        <DateRangePicker
          label="Deadline range"
          startDate={erroredStart}
          endDate={erroredEnd}
          onChange={(s, e) => {
            setErroredStart(s);
            setErroredEnd(e);
          }}
          errorText="Both dates required to continue."
        />
      </Section>

      <Section title="Fully disabled">
        <DateRangePicker
          label="Locked range"
          startDate={new Date(2020, 0, 1)}
          endDate={new Date(2020, 11, 31)}
          onChange={() => undefined}
          disabled
          locale="en-US"
          dateStyle="long"
          helperText="Read-only preview — neither picker opens."
        />
      </Section>

      <Section title="Per-instance palette override — brand purple">
        <DateRangePicker
          label="Themed range"
          orientation="horizontal"
          startDate={themedStart}
          endDate={themedEnd}
          onChange={(s, e) => {
            setThemedStart(s);
            setThemedEnd(e);
          }}
          helperText="Separator + trigger chrome retint together via dateRangePickerColors."
          dateRangePickerColors={{
            border: "#7C3AED",
            borderFocused: "#7C3AED",
            text: "#4C1D95",
            chevron: "#7C3AED",
            accent: "#7C3AED",
            separator: "#7C3AED",
          }}
        />
      </Section>

      <View style={{ height: 40 }} />
    </Screen>
  );
}
