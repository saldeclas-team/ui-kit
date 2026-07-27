import { useRef, useState } from "react";
import { Text, View } from "react-native";
import { BottomSheet, Button, Input, useUIKit } from "ui-kraken";
import type { BottomSheetRef } from "ui-kraken";

import { Screen } from "../../../src/screen";
import { Section } from "../../../src/section";

export default function BottomSheetScreen() {
  const { activeTheme } = useUIKit();
  const isDark = activeTheme === "dark";
  const captionColor = isDark ? "#9CA3AF" : "#6B7280";
  // Sheet body texts render on top of the sheet's own background
  // (which flips with the palette). Raw RN <Text> defaults to
  // black — invisible on the dark sheet background. Compute a
  // theme-aware text color for everything inside the sheets.
  const sheetTextColor = isDark ? "#F5F5F7" : "#0B0B0F";

  const basicRef = useRef<BottomSheetRef>(null);
  const multiRef = useRef<BottomSheetRef>(null);
  const formRef = useRef<BottomSheetRef>(null);
  const nonDismissRef = useRef<BottomSheetRef>(null);
  const dynamicRef = useRef<BottomSheetRef>(null);
  const themedRef = useRef<BottomSheetRef>(null);
  const [dismissedTimes, setDismissedTimes] = useState(0);
  const [formName, setFormName] = useState("");

  return (
    <Screen
      title="BottomSheet"
      subtitle="Modal bottom sheet via @expo/ui — SwiftUI on iOS, Material 3 on Android, vaul on web. Ref-controlled."
    >
      <Section title="Basic — single snap point (50%)">
        <Button onPress={() => basicRef.current?.present()}>Open sheet</Button>
        <Text style={{ color: captionColor, fontSize: 12 }}>Dismissed {dismissedTimes} times</Text>
        <BottomSheet ref={basicRef} onDismiss={() => setDismissedTimes((n) => n + 1)}>
          <View style={{ padding: 24 }}>
            <Text
              style={{
                color: sheetTextColor,
                fontSize: 18,
                fontWeight: "600",
                marginBottom: 12,
              }}
            >
              Sheet body
            </Text>
            <Text style={{ color: sheetTextColor }}>
              Default sheet — 50% snap point. Swipe down or tap backdrop to close.
            </Text>
            <Button
              tone="secondary"
              onPress={() => basicRef.current?.dismiss()}
              style={{ marginTop: 16 }}
            >
              Close
            </Button>
          </View>
        </BottomSheet>
      </Section>

      <Section title="Multiple snap points — 25% / 50% / 90%">
        <Button onPress={() => multiRef.current?.present()}>Open multi-snap</Button>
        <Text style={{ color: captionColor, fontSize: 12 }}>
          Android reduces to 2 states (partial + expanded).
        </Text>
        <BottomSheet ref={multiRef} snapPoints={["25%", "50%", "90%"]}>
          <View style={{ padding: 24 }}>
            <Text
              style={{
                color: sheetTextColor,
                fontSize: 18,
                fontWeight: "600",
                marginBottom: 12,
              }}
            >
              Multi-snap
            </Text>
            <Text style={{ color: sheetTextColor }}>
              Drag the handle to any snap point (iOS) or partial/expanded (Android).
            </Text>
            <Button style={{ marginTop: 16 }} onPress={() => multiRef.current?.expand()}>
              Expand
            </Button>
            <Button
              tone="secondary"
              style={{ marginTop: 8 }}
              onPress={() => multiRef.current?.collapse()}
            >
              Collapse
            </Button>
            <Button
              tone="secondary"
              style={{ marginTop: 8 }}
              onPress={() => multiRef.current?.dismiss()}
            >
              Close
            </Button>
          </View>
        </BottomSheet>
      </Section>

      <Section title="Form inside sheet — 70%">
        <Button onPress={() => formRef.current?.present()}>Edit profile</Button>
        <BottomSheet ref={formRef} snapPoints={["70%"]}>
          <View style={{ padding: 24 }}>
            <Text
              style={{
                color: sheetTextColor,
                fontSize: 18,
                fontWeight: "600",
                marginBottom: 12,
              }}
            >
              Edit profile
            </Text>
            <Input
              label="Name"
              value={formName}
              onChangeText={setFormName}
              placeholder="Your name"
            />
            <Button style={{ marginTop: 16 }} onPress={() => formRef.current?.dismiss()}>
              Save
            </Button>
          </View>
        </BottomSheet>
      </Section>

      <Section title="Non-dismissible — require explicit close">
        <Button onPress={() => nonDismissRef.current?.present()}>Open locked sheet</Button>
        <Text style={{ color: captionColor, fontSize: 12 }}>
          enablePanDownToClose=false — swipe + backdrop tap both disabled.
        </Text>
        <BottomSheet ref={nonDismissRef} enablePanDownToClose={false}>
          <View style={{ padding: 24 }}>
            <Text
              style={{
                color: sheetTextColor,
                fontSize: 18,
                fontWeight: "600",
                marginBottom: 12,
              }}
            >
              Locked
            </Text>
            <Text style={{ color: sheetTextColor }}>Must press the Close button to dismiss.</Text>
            <Button style={{ marginTop: 16 }} onPress={() => nonDismissRef.current?.dismiss()}>
              Close
            </Button>
          </View>
        </BottomSheet>
      </Section>

      <Section title="Fit-to-content — enableDynamicSizing">
        <Button onPress={() => dynamicRef.current?.present()}>Open fit-to-content</Button>
        <BottomSheet ref={dynamicRef} enableDynamicSizing>
          <View style={{ padding: 24 }}>
            <Text style={{ color: sheetTextColor }}>
              Short content. Sheet height fits automatically — no snap points needed.
            </Text>
            <Button
              tone="secondary"
              style={{ marginTop: 16 }}
              onPress={() => dynamicRef.current?.dismiss()}
            >
              Close
            </Button>
          </View>
        </BottomSheet>
      </Section>

      <Section title="Per-instance palette override — brand purple">
        <Button onPress={() => themedRef.current?.present()}>Open themed sheet</Button>
        <BottomSheet
          ref={themedRef}
          bottomSheetColors={{ background: "#F5F3FF", divider: "#7C3AED" }}
        >
          <View style={{ padding: 24 }}>
            <Text style={{ color: "#4C1D95", fontSize: 18, fontWeight: "600" }}>Themed sheet</Text>
            <Text style={{ color: "#4C1D95" }}>
              bottomSheetColors overrides background. Android shows the tint via containerColor; iOS
              ignores (SwiftUI owns background); web full support.
            </Text>
            <Button style={{ marginTop: 16 }} onPress={() => themedRef.current?.dismiss()}>
              Close
            </Button>
          </View>
        </BottomSheet>
      </Section>

      <View style={{ height: 40 }} />
    </Screen>
  );
}
