import { useState } from "react";
import { Text as RNText, View } from "react-native";
import { Input, useUIKit } from "ui-kraken";

import { Screen } from "../../../src/screen";
import { Section } from "../../../src/section";

// Inline glyph — consumers bring their own icon library.
function Glyph({ children }: { children: string }) {
  return <RNText style={{ fontSize: 16 }}>{children}</RNText>;
}

export default function InputScreen() {
  const { activeTheme } = useUIKit();
  const isDark = activeTheme === "dark";
  const readoutColor = isDark ? "#9CA3AF" : "#6B7280";

  const [basic, setBasic] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("hunter2");
  const [search, setSearch] = useState("");
  const [radiusValue, setRadiusValue] = useState("");

  const emailInvalid = email.length > 0 && !email.includes("@");

  return (
    <Screen
      title="Input"
      subtitle="Single-line text input with label, helper text, error state, optional icon slots, and every RN TextInput prop flowing through."
    >
      <Section title="Basic">
        <Input testID="basic" value={basic} onChangeText={setBasic} placeholder="Type here" />
        <RNText style={{ color: readoutColor, fontSize: 13, marginTop: 8 }}>
          Value: {basic || "(empty)"}
        </RNText>
      </Section>

      <Section title="With label + helper text">
        <Input
          label="Email"
          placeholder="you@example.com"
          value={email}
          onChangeText={setEmail}
          helperText="We'll never share it."
          keyboardType="email-address"
          autoCapitalize="none"
          testID="email"
        />
      </Section>

      <Section title="With error state">
        <Input
          label="Email (validated)"
          value={email}
          onChangeText={setEmail}
          error={emailInvalid ? "Enter a valid email" : undefined}
          helperText="Type an @ to clear the error."
          testID="email-validated"
        />
      </Section>

      <Section title="With icons">
        <Input
          placeholder="Search…"
          value={search}
          onChangeText={setSearch}
          leftIcon={<Glyph>🔍</Glyph>}
          rightIcon={search.length > 0 ? <Glyph>✕</Glyph> : null}
          testID="search"
        />
      </Section>

      <Section title="Disabled">
        <Input
          label="Read-only"
          value="You cannot edit this"
          onChangeText={() => undefined}
          disabled
          testID="disabled"
        />
      </Section>

      <Section title="Password (secureTextEntry)">
        <Input
          label="Password"
          placeholder="Choose one"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          testID="password"
        />
      </Section>

      <Section title="Radius presets">
        <View style={{ gap: 12 }}>
          <Input
            placeholder='radius="none"'
            value={radiusValue}
            onChangeText={setRadiusValue}
            radius="none"
            testID="radius-none"
          />
          <Input
            placeholder='radius="lg"'
            value={radiusValue}
            onChangeText={setRadiusValue}
            radius="lg"
            testID="radius-lg"
          />
          <Input
            placeholder='radius="pill"'
            value={radiusValue}
            onChangeText={setRadiusValue}
            radius="pill"
            testID="radius-pill"
          />
          <Input
            placeholder="radius={24} (raw px)"
            value={radiusValue}
            onChangeText={setRadiusValue}
            radius={24}
            testID="radius-24"
          />
        </View>
      </Section>
    </Screen>
  );
}
