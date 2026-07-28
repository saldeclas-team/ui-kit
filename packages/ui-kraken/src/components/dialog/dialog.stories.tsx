import type { Meta, StoryObj } from "@storybook/react-native";
import { useState } from "react";
import { Pressable, Text as RNText, View } from "react-native";
import { Theme } from "tamagui";

import { Button } from "../button";
import { Dialog } from "./dialog";

const meta = {
  title: "UI Kit/Dialog",
  component: Dialog,
  args: { visible: false },
  decorators: [
    (Story) => (
      <View style={{ flex: 1, padding: 24, gap: 16 }}>
        <Story />
      </View>
    ),
  ],
} satisfies Meta<typeof Dialog>;

export { meta as default };

type Story = StoryObj<typeof meta>;

function OpenButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        backgroundColor: "#2563EB",
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 8,
      }}
    >
      <RNText style={{ color: "#FFFFFF", fontWeight: "600" }}>{label}</RNText>
    </Pressable>
  );
}

// Each scene is a named PascalCase component so the React Hooks
// linter recognizes `useState` as a component-level hook. Stories
// mount these components — same shape as other stories files.

function SimpleScene() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <OpenButton label="Open simple dialog" onPress={() => setOpen(true)} />
      <Dialog visible={open} onClose={() => setOpen(false)}>
        <RNText style={{ fontSize: 16, color: "#111827" }}>
          Simple content, no header / footer.
        </RNText>
      </Dialog>
    </>
  );
}

function CompoundScene() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <OpenButton label="Open compound dialog" onPress={() => setOpen(true)} />
      <Dialog visible={open} onClose={() => setOpen(false)}>
        <Dialog.Header title="Delete this file?" showCloseButton />
        <Dialog.Body>
          <RNText style={{ color: "#374151" }}>
            This action can&apos;t be undone. The file will be permanently removed.
          </RNText>
        </Dialog.Body>
        <Dialog.Footer>
          <Button tone="ghost" onPress={() => setOpen(false)}>
            Cancel
          </Button>
          <Button tone="destructive" onPress={() => setOpen(false)}>
            Delete
          </Button>
        </Dialog.Footer>
      </Dialog>
    </>
  );
}

function SizesScene() {
  const [open, setOpen] = useState<"sm" | "md" | "lg" | "full" | null>(null);
  return (
    <>
      <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
        <OpenButton label="Small" onPress={() => setOpen("sm")} />
        <OpenButton label="Medium" onPress={() => setOpen("md")} />
        <OpenButton label="Large" onPress={() => setOpen("lg")} />
        <OpenButton label="Full" onPress={() => setOpen("full")} />
      </View>
      {open != null ? (
        <Dialog visible size={open} onClose={() => setOpen(null)}>
          <Dialog.Header title={`Size = ${open}`} showCloseButton />
          <Dialog.Body>
            <RNText style={{ color: "#374151" }}>
              This dialog is using size=&quot;{open}&quot;. minWidth adjusts per preset; maxWidth
              stays at 95%.
            </RNText>
          </Dialog.Body>
        </Dialog>
      ) : null}
    </>
  );
}

function NoDismissScene() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <OpenButton label="Open must-answer dialog" onPress={() => setOpen(true)} />
      <Dialog visible={open}>
        <Dialog.Header title="Terms updated" />
        <Dialog.Body>
          <RNText style={{ color: "#374151" }}>
            Please review the updated terms to continue. Backdrop tap does nothing.
          </RNText>
        </Dialog.Body>
        <Dialog.Footer>
          <Button onPress={() => setOpen(false)}>Got it</Button>
        </Dialog.Footer>
      </Dialog>
    </>
  );
}

function CustomColorsScene() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <OpenButton label="Open branded dialog" onPress={() => setOpen(true)} />
      <Dialog
        visible={open}
        onClose={() => setOpen(false)}
        dialogColors={{
          backdrop: "rgba(76, 29, 149, 0.6)",
          background: "#F5F3FF",
          title: "#4C1D95",
          body: "#5B21B6",
        }}
      >
        <Dialog.Header title="Brand-tinted dialog" showCloseButton />
        <Dialog.Body>
          <RNText style={{ color: "#5B21B6" }}>
            Per-instance palette override — every slot custom.
          </RNText>
        </Dialog.Body>
      </Dialog>
    </>
  );
}

function DarkThemeScene() {
  const [open, setOpen] = useState(false);
  return (
    <Theme name="dark">
      <View style={{ backgroundColor: "#0B0B0F", padding: 16 }}>
        <OpenButton label="Open dark dialog" onPress={() => setOpen(true)} />
        <Dialog visible={open} onClose={() => setOpen(false)}>
          <Dialog.Header title="Dark theme dialog" showCloseButton />
          <Dialog.Body>
            <RNText style={{ color: "#D1D5DB" }}>
              Palette flips automatically via activeTheme.
            </RNText>
          </Dialog.Body>
        </Dialog>
      </View>
    </Theme>
  );
}

export const Simple: Story = { render: () => <SimpleScene /> };
export const Compound: Story = { render: () => <CompoundScene /> };
export const Sizes: Story = { render: () => <SizesScene /> };
export const NoDismiss: Story = { render: () => <NoDismissScene /> };
export const CustomColors: Story = { render: () => <CustomColorsScene /> };
export const DarkTheme: Story = { render: () => <DarkThemeScene /> };
