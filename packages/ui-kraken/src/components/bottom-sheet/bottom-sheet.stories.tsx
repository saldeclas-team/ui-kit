import type { Meta, StoryObj } from "@storybook/react-native";
import { useRef, useState } from "react";
import { Text as RNText, View } from "react-native";
import { Theme } from "tamagui";

import { Button } from "../button";
import { Input } from "../input";
import { BottomSheet } from "./bottom-sheet";
import type { BottomSheetRef } from "./bottom-sheet-types";

const meta = {
  title: "UI Kit/BottomSheet",
  component: BottomSheet,
  args: { children: null },
  decorators: [
    (Story) => (
      <View style={{ flex: 1, padding: 24 }}>
        <Story />
      </View>
    ),
  ],
} satisfies Meta<typeof BottomSheet>;

export { meta as default };

type Story = StoryObj<typeof meta>;

function DefaultDemo() {
  const ref = useRef<BottomSheetRef>(null);
  return (
    <>
      <Button onPress={() => ref.current?.present()}>Open sheet</Button>
      <BottomSheet ref={ref}>
        <View style={{ padding: 24 }}>
          <RNText style={{ fontSize: 18, fontWeight: "600", marginBottom: 12 }}>Sheet body</RNText>
          <RNText>Default sheet — 50% snap point, backdrop, swipe-to-dismiss.</RNText>
          <Button tone="secondary" onPress={() => ref.current?.dismiss()} style={{ marginTop: 16 }}>
            Close
          </Button>
        </View>
      </BottomSheet>
    </>
  );
}

export const Default: Story = {
  render: () => <DefaultDemo />,
};

function MultipleSnapPointsDemo() {
  const ref = useRef<BottomSheetRef>(null);
  return (
    <>
      <Button onPress={() => ref.current?.present()}>Open sheet</Button>
      <BottomSheet ref={ref} snapPoints={["25%", "50%", "90%"]}>
        <View style={{ padding: 24 }}>
          <RNText style={{ fontSize: 18, fontWeight: "600", marginBottom: 12 }}>Multi-snap</RNText>
          <RNText>Snap points: 25% / 50% / 90%. Android reduces to partial + expanded.</RNText>
          <Button style={{ marginTop: 16 }} onPress={() => ref.current?.expand()}>
            Expand
          </Button>
          <Button tone="secondary" style={{ marginTop: 8 }} onPress={() => ref.current?.collapse()}>
            Collapse
          </Button>
        </View>
      </BottomSheet>
    </>
  );
}

export const MultipleSnapPoints: Story = {
  render: () => <MultipleSnapPointsDemo />,
};

function FormDemo() {
  const ref = useRef<BottomSheetRef>(null);
  const [name, setName] = useState("");
  return (
    <>
      <Button onPress={() => ref.current?.present()}>Edit profile</Button>
      <BottomSheet ref={ref} snapPoints={["70%"]}>
        <View style={{ padding: 24 }}>
          <RNText style={{ fontSize: 18, fontWeight: "600", marginBottom: 12 }}>
            Edit profile
          </RNText>
          <Input label="Name" value={name} onChangeText={setName} placeholder="Your name" />
          <Button style={{ marginTop: 16 }} onPress={() => ref.current?.dismiss()}>
            Save
          </Button>
        </View>
      </BottomSheet>
    </>
  );
}

export const FormInsideSheet: Story = {
  render: () => <FormDemo />,
};

function NonDismissibleDemo() {
  const ref = useRef<BottomSheetRef>(null);
  return (
    <>
      <Button onPress={() => ref.current?.present()}>Open (no swipe close)</Button>
      <BottomSheet ref={ref} enablePanDownToClose={false}>
        <View style={{ padding: 24 }}>
          <RNText style={{ fontSize: 18, fontWeight: "600", marginBottom: 12 }}>Locked open</RNText>
          <RNText>enablePanDownToClose=false — must tap Close to dismiss.</RNText>
          <Button style={{ marginTop: 16 }} onPress={() => ref.current?.dismiss()}>
            Close
          </Button>
        </View>
      </BottomSheet>
    </>
  );
}

export const NonDismissible: Story = {
  render: () => <NonDismissibleDemo />,
};

function DynamicSizingDemo() {
  const ref = useRef<BottomSheetRef>(null);
  return (
    <>
      <Button onPress={() => ref.current?.present()}>Open (fit-to-content)</Button>
      <BottomSheet ref={ref} enableDynamicSizing>
        <View style={{ padding: 24 }}>
          <RNText>enableDynamicSizing — height fits content.</RNText>
        </View>
      </BottomSheet>
    </>
  );
}

export const DynamicSizing: Story = {
  render: () => <DynamicSizingDemo />,
};

function CustomPaletteDemo() {
  const ref = useRef<BottomSheetRef>(null);
  return (
    <>
      <Button onPress={() => ref.current?.present()}>Open themed sheet</Button>
      <BottomSheet
        ref={ref}
        bottomSheetColors={{
          background: "#F5F3FF",
          divider: "#7C3AED",
        }}
      >
        <View style={{ padding: 24 }}>
          <RNText style={{ color: "#4C1D95", fontSize: 18, fontWeight: "600" }}>Themed</RNText>
          <RNText style={{ color: "#4C1D95" }}>Custom background from bottomSheetColors.</RNText>
        </View>
      </BottomSheet>
    </>
  );
}

export const CustomPalette: Story = {
  render: () => <CustomPaletteDemo />,
};

function DarkThemeDemo() {
  const ref = useRef<BottomSheetRef>(null);
  return (
    <Theme name="dark">
      <View style={{ backgroundColor: "#0B0B0F", padding: 24, borderRadius: 12 }}>
        <Button onPress={() => ref.current?.present()}>Open dark sheet</Button>
        <BottomSheet ref={ref}>
          <View style={{ padding: 24 }}>
            <RNText style={{ color: "#F9FAFB" }}>Dark palette sheet.</RNText>
          </View>
        </BottomSheet>
      </View>
    </Theme>
  );
}

export const DarkTheme: Story = {
  render: () => <DarkThemeDemo />,
};
