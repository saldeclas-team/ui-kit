import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { Button, Dialog, useUIKit } from "ui-kraken";

import { Screen } from "../../../src/screen";
import { Section } from "../../../src/section";

export default function DialogScreen() {
  const { activeTheme } = useUIKit();
  const isDark = activeTheme === "dark";
  const bodyColor = isDark ? "#F5F5F7" : "#0B0B0F";
  const captionColor = isDark ? "#9CA3AF" : "#6B7280";
  const btnBg = isDark ? "#2563EB" : "#2563EB";

  const [simpleOpen, setSimpleOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [sizeOpen, setSizeOpen] = useState<"sm" | "md" | "lg" | "full" | null>(null);
  const [mustAnswerOpen, setMustAnswerOpen] = useState(false);

  const OpenBtn = ({ label, onPress }: { label: string; onPress: () => void }) => (
    <Pressable
      onPress={onPress}
      style={{
        backgroundColor: btnBg,
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 8,
      }}
    >
      <Text style={{ color: "#FFFFFF", fontWeight: "600" }}>{label}</Text>
    </Pressable>
  );

  return (
    <Screen
      title="Dialog"
      subtitle="Centered overlay panel. Wraps RN Modal with palette + backdrop + compound slots."
    >
      <Section title="Simple confirmation">
        <OpenBtn label="Are you sure?" onPress={() => setConfirmOpen(true)} />
        <Dialog visible={confirmOpen} onClose={() => setConfirmOpen(false)}>
          <Dialog.Header title="Delete file?" showCloseButton />
          <Dialog.Body>
            <Text style={{ color: bodyColor }}>This action can&apos;t be undone.</Text>
          </Dialog.Body>
          <Dialog.Footer>
            <Button tone="ghost" onPress={() => setConfirmOpen(false)}>
              Cancel
            </Button>
            <Button tone="destructive" onPress={() => setConfirmOpen(false)}>
              Delete
            </Button>
          </Dialog.Footer>
        </Dialog>
      </Section>

      <Section title="Simple (no compound slots)">
        <OpenBtn label="Open info" onPress={() => setSimpleOpen(true)} />
        <Dialog visible={simpleOpen} onClose={() => setSimpleOpen(false)}>
          <Text style={{ color: bodyColor }}>
            Just wrap arbitrary children — Dialog handles the centering and padding.
          </Text>
        </Dialog>
      </Section>

      <Section title="Size showcase">
        <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
          <OpenBtn label="sm (240)" onPress={() => setSizeOpen("sm")} />
          <OpenBtn label="md (320)" onPress={() => setSizeOpen("md")} />
          <OpenBtn label="lg (480)" onPress={() => setSizeOpen("lg")} />
          <OpenBtn label="full (95%)" onPress={() => setSizeOpen("full")} />
        </View>
        {sizeOpen != null ? (
          <Dialog visible size={sizeOpen} onClose={() => setSizeOpen(null)}>
            <Dialog.Header title={`Size = ${sizeOpen}`} showCloseButton />
            <Dialog.Body>
              <Text style={{ color: bodyColor }}>
                minWidth adjusts per preset; maxWidth stays at 95% so the panel shrinks on narrow
                screens.
              </Text>
            </Dialog.Body>
          </Dialog>
        ) : null}
      </Section>

      <Section title="Must-answer (no dismiss)">
        <OpenBtn label="Terms updated" onPress={() => setMustAnswerOpen(true)} />
        <Text style={{ color: captionColor, fontSize: 12, marginTop: 4 }}>
          Backdrop tap does nothing — only the &ldquo;Got it&rdquo; button closes.
        </Text>
        <Dialog visible={mustAnswerOpen}>
          <Dialog.Header title="Terms updated" />
          <Dialog.Body>
            <Text style={{ color: bodyColor }}>Please review the updated terms to continue.</Text>
          </Dialog.Body>
          <Dialog.Footer>
            <Button onPress={() => setMustAnswerOpen(false)}>Got it</Button>
          </Dialog.Footer>
        </Dialog>
      </Section>
    </Screen>
  );
}
