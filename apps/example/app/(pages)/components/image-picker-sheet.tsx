import { useRef, useState } from "react";
import { Image, Text, View } from "react-native";
import { Button, ImagePickerSheet, useUIKit } from "ui-kraken";
import type { ImagePickerSheetRef, PickedAsset } from "ui-kraken";

import { Screen } from "../../../src/screen";
import { Section } from "../../../src/section";

export default function ImagePickerSheetScreen() {
  const { activeTheme } = useUIKit();
  const isDark = activeTheme === "dark";
  const captionColor = isDark ? "#9CA3AF" : "#6B7280";

  const basicRef = useRef<ImagePickerSheetRef>(null);
  const avatarRef = useRef<ImagePickerSheetRef>(null);
  const receiptRef = useRef<ImagePickerSheetRef>(null);
  const videoRef = useRef<ImagePickerSheetRef>(null);
  const themedRef = useRef<ImagePickerSheetRef>(null);
  const permissionRef = useRef<ImagePickerSheetRef>(null);

  const [basicAsset, setBasicAsset] = useState<PickedAsset | null>(null);
  const [avatarAsset, setAvatarAsset] = useState<PickedAsset | null>(null);
  const [receiptAsset, setReceiptAsset] = useState<PickedAsset | null>(null);
  const [videoAsset, setVideoAsset] = useState<PickedAsset | null>(null);
  const [permissionMsg, setPermissionMsg] = useState<string | null>(null);
  const [permissionAsset, setPermissionAsset] = useState<PickedAsset | null>(null);

  return (
    <Screen
      title="ImagePickerSheet"
      subtitle="Bottom-sheet image picker via expo-image-picker + our own BottomSheet. Camera / gallery / cancel action rows."
    >
      <Section title="Basic — profile photo">
        <Button onPress={() => basicRef.current?.present()}>Change photo</Button>
        {basicAsset != null && (
          <Image
            source={{ uri: basicAsset.uri }}
            style={{ width: 120, height: 120, marginTop: 16, borderRadius: 12 }}
          />
        )}
        <Text style={{ color: captionColor, fontSize: 12 }}>
          {basicAsset == null ? "(no photo picked yet)" : `Picked: ${basicAsset.uri.slice(-40)}`}
        </Text>
        <ImagePickerSheet ref={basicRef} onPick={setBasicAsset} />
      </Section>

      <Section title="Square avatar with crop (allowsEditing + aspect=[1,1])">
        <Button onPress={() => avatarRef.current?.present()}>Pick avatar</Button>
        {avatarAsset != null && (
          <Image
            source={{ uri: avatarAsset.uri }}
            style={{ width: 96, height: 96, marginTop: 16, borderRadius: 48 }}
          />
        )}
        <ImagePickerSheet
          ref={avatarRef}
          onPick={setAvatarAsset}
          allowsEditing
          aspect={[1, 1]}
          quality={0.8}
          sheetTitle="Change avatar"
        />
      </Section>

      <Section title="Custom labels — receipt scanner">
        <Button onPress={() => receiptRef.current?.present()}>Add receipt</Button>
        {receiptAsset != null && (
          <Image
            source={{ uri: receiptAsset.uri }}
            style={{ width: 200, height: 150, marginTop: 16, borderRadius: 8 }}
            resizeMode="contain"
          />
        )}
        <ImagePickerSheet
          ref={receiptRef}
          onPick={setReceiptAsset}
          sheetTitle="Add receipt"
          cameraLabel="Scan receipt"
          galleryLabel="Pick from photos"
          cancelLabel="Nope"
          quality={1}
        />
      </Section>

      <Section title="Video picker (mediaTypes='videos' + 60s max)">
        <Button onPress={() => videoRef.current?.present()}>Record or pick video</Button>
        <Text style={{ color: captionColor, fontSize: 12 }}>
          {videoAsset == null ? "(no video picked)" : `Duration: ${videoAsset.duration ?? "?"}ms`}
        </Text>
        <ImagePickerSheet
          ref={videoRef}
          onPick={setVideoAsset}
          mediaTypes="videos"
          videoMaxDuration={60}
          cameraLabel="Record video"
          galleryLabel="Choose video"
        />
      </Section>

      <Section title="Permission denial handling">
        <Button onPress={() => permissionRef.current?.present()}>Pick with permission hint</Button>
        {permissionMsg != null && (
          <Text style={{ color: "#B91C1C", marginTop: 8 }}>{permissionMsg}</Text>
        )}
        {permissionAsset != null && (
          <Text style={{ color: captionColor, fontSize: 12 }}>Picked: ok</Text>
        )}
        <Text style={{ color: captionColor, fontSize: 12 }}>
          On denial, we fire onPermissionDenied(source). Deny camera or library access in Settings
          to test.
        </Text>
        <ImagePickerSheet
          ref={permissionRef}
          onPick={(asset) => {
            setPermissionAsset(asset);
            setPermissionMsg(null);
          }}
          onPermissionDenied={(source) =>
            setPermissionMsg(
              source === "camera"
                ? "Camera permission denied — enable in Settings"
                : "Photo library permission denied — enable in Settings"
            )
          }
        />
      </Section>

      <Section title="Themed palette — brand purple">
        <Button onPress={() => themedRef.current?.present()}>Pick with themed sheet</Button>
        <ImagePickerSheet
          ref={themedRef}
          onPick={() => undefined}
          imagePickerSheetColors={{
            sheetBackground: "#F5F3FF",
            actionBackground: "#F5F3FF",
            actionBackgroundPressed: "#EDE9FE",
            actionText: "#4C1D95",
            cancelText: "#7C3AED",
            divider: "#DDD6FE",
          }}
        />
      </Section>

      <View style={{ height: 40 }} />
    </Screen>
  );
}
