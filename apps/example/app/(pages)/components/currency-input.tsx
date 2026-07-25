import { useState } from "react";
import { Text as RNText, View } from "react-native";
import { CurrencyInput, useUIKit } from "ui-kraken";

import { Screen } from "../../../src/screen";
import { Section } from "../../../src/section";

export default function CurrencyInputScreen() {
  const { activeTheme } = useUIKit();
  const isDark = activeTheme === "dark";
  const readoutColor = isDark ? "#9CA3AF" : "#6B7280";

  const [basic, setBasic] = useState<number | null>(null);
  const [usd, setUsd] = useState<number | null>(1234.56);
  const [cop, setCop] = useState<number | null>(1234000);
  const [eur, setEur] = useState<number | null>(999.99);
  const [brand, setBrand] = useState<number | null>(499);

  return (
    <Screen
      title="CurrencyInput"
      subtitle="Numeric input formatted as currency. Locale-aware separators, configurable decimals + prefix. Consumer stores a number; the component owns all formatting."
    >
      <Section title="Basic (integer, $ prefix)">
        <CurrencyInput testID="basic" value={basic} onChangeValue={setBasic} />
        <RNText style={{ color: readoutColor, fontSize: 13, marginTop: 8 }}>
          Numeric value: {basic === null ? "null" : String(basic)}
        </RNText>
      </Section>

      <Section title="USD (en-US, decimals=2)">
        <CurrencyInput
          label="Amount"
          value={usd}
          onChangeValue={setUsd}
          decimals={2}
          locale="en-US"
          testID="usd"
        />
      </Section>

      <Section title="COP (es-CO, decimals=0, prefix='COP $')">
        <CurrencyInput
          label="Monto"
          value={cop}
          onChangeValue={setCop}
          prefix="COP $"
          decimals={0}
          locale="es-CO"
          testID="cop"
        />
      </Section>

      <Section title="EUR (es-ES, decimals=2, prefix='€')">
        <CurrencyInput
          label="Importe"
          value={eur}
          onChangeValue={setEur}
          prefix="€"
          decimals={2}
          locale="es-ES"
          testID="eur"
        />
      </Section>

      <Section title="Disabled">
        <CurrencyInput
          label="Locked"
          value={5000}
          onChangeValue={() => undefined}
          disabled
          testID="disabled"
        />
      </Section>

      <Section title="Per-instance color override">
        <View style={{ gap: 12 }}>
          <CurrencyInput
            label="Brand-purple"
            value={brand}
            onChangeValue={setBrand}
            prefix="€"
            decimals={2}
            locale="es-ES"
            currencyInputColors={{
              border: "#7C3AED",
              borderFocused: "#7C3AED",
              background: "#F5F3FF",
              label: "#4C1D95",
              prefix: "#7C3AED",
            }}
            testID="brand"
          />
        </View>
      </Section>
    </Screen>
  );
}
