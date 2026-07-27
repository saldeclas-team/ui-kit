import type { Meta, StoryObj } from "@storybook/react-native";
import { useRef, useState } from "react";
import { Image, Text as RNText, View } from "react-native";
import { Theme } from "tamagui";

import { Button } from "../button";
import { ImagePickerSheet } from "./image-picker-sheet";
import type { ImagePickerSheetRef, PickedAsset } from "./image-picker-sheet-types";

const meta = {
  title: "UI Kit/ImagePickerSheet",
  component: ImagePickerSheet,
  args: { onPick: () => undefined },
  decorators: [
    (Story) => (
      <View style={{ flex: 1, padding: 24 }}>
        <Story />
      </View>
    ),
  ],
} satisfies Meta<typeof ImagePickerSheet>;

export { meta as default };

type Story = StoryObj<typeof meta>;

function DefaultDemo() {
  const ref = useRef<ImagePickerSheetRef>(null);
  const [photo, setPhoto] = useState<PickedAsset | null>(null);
  return (
    <>
      <Button onPress={() => ref.current?.present()}>Change photo</Button>
      {photo != null && (
        <Image
          source={{ uri: photo.uri }}
          style={{ width: 120, height: 120, marginTop: 16, borderRadius: 12 }}
        />
      )}
      <ImagePickerSheet ref={ref} onPick={setPhoto} />
    </>
  );
}

export const Default: Story = {
  render: () => <DefaultDemo />,
};

function SquareCropDemo() {
  const ref = useRef<ImagePickerSheetRef>(null);
  const [photo, setPhoto] = useState<PickedAsset | null>(null);
  return (
    <>
      <Button onPress={() => ref.current?.present()}>Pick avatar</Button>
      {photo != null && (
        <Image
          source={{ uri: photo.uri }}
          style={{ width: 96, height: 96, marginTop: 16, borderRadius: 48 }}
        />
      )}
      <ImagePickerSheet
        ref={ref}
        onPick={setPhoto}
        allowsEditing
        aspect={[1, 1]}
        quality={0.8}
        sheetTitle="Change avatar"
      />
    </>
  );
}

export const SquareCrop: Story = {
  render: () => <SquareCropDemo />,
};

function CustomLabelsDemo() {
  const ref = useRef<ImagePickerSheetRef>(null);
  return (
    <>
      <Button onPress={() => ref.current?.present()}>Add receipt</Button>
      <ImagePickerSheet
        ref={ref}
        onPick={() => undefined}
        sheetTitle="Add receipt"
        cameraLabel="Scan receipt"
        galleryLabel="Pick from photos"
        cancelLabel="Nope"
      />
    </>
  );
}

export const CustomLabels: Story = {
  render: () => <CustomLabelsDemo />,
};

function WithPermissionHintDemo() {
  const ref = useRef<ImagePickerSheetRef>(null);
  const [msg, setMsg] = useState<string | null>(null);
  return (
    <>
      <Button onPress={() => ref.current?.present()}>Pick photo</Button>
      {msg != null && <RNText style={{ marginTop: 8, color: "#B91C1C" }}>{msg}</RNText>}
      <ImagePickerSheet
        ref={ref}
        onPick={() => undefined}
        onPermissionDenied={(source) => setMsg(`${source} permission denied — enable in Settings`)}
      />
    </>
  );
}

export const WithPermissionHint: Story = {
  render: () => <WithPermissionHintDemo />,
};

function DarkThemeDemo() {
  const ref = useRef<ImagePickerSheetRef>(null);
  return (
    <Theme name="dark">
      <View style={{ backgroundColor: "#0B0B0F", padding: 24, borderRadius: 12 }}>
        <Button onPress={() => ref.current?.present()}>Change photo</Button>
        <ImagePickerSheet ref={ref} onPick={() => undefined} />
      </View>
    </Theme>
  );
}

export const DarkTheme: Story = {
  render: () => <DarkThemeDemo />,
};
