import { forwardRef, useCallback, useState } from "react";
import type { ComponentRef } from "react";
import { Image } from "react-native";
import { Text as TamaguiText, YStack } from "tamagui";

import { useUIKit } from "../../provider/use-ui-kit";
import { resolvePalette } from "../../utils/resolve-palette";
import type { AvatarProps, AvatarShape, AvatarSize } from "./avatar-types";

type AvatarRef = ComponentRef<typeof YStack>;

/**
 * Displays a user image with an initials fallback. Two rendering
 * modes coexist: pass `source` for a real image; pass `name` (or
 * explicit `initials`) so ui-kraken computes initials on a colored
 * background. If the image fails to load, the component swaps to
 * initials automatically via `onError`.
 *
 * ```tsx
 * <Avatar name="Alexis Noriega" />            // → "AN" on gray-200
 * <Avatar source={{ uri: "..." }} name="AN" /> // → image, initials as fallback
 * <Avatar size="lg" shape="rounded" />         // → 56px, 8px radius
 * ```
 */
export const Avatar = forwardRef<AvatarRef, AvatarProps>(function Avatar(
  {
    source,
    name,
    initials,
    size = "md",
    shape = "circle",
    avatarColors,
    testID = "avatar",
    accessibilityRole = "image",
    accessibilityLabel,
    ...rest
  },
  ref
) {
  const { tokens } = useUIKit();
  const palette = resolvePalette(tokens.avatarColors, avatarColors);
  const [imageFailed, setImageFailed] = useState(false);
  const handleImageError = useCallback(() => setImageFailed(true), []);

  const dimension = resolveAvatarSize(size);
  const borderRadius = resolveAvatarBorderRadius(shape, dimension);
  const showImage = source != null && !imageFailed;
  const displayInitials = initials ?? computeInitials(name ?? "");

  return (
    <YStack
      ref={ref}
      testID={testID}
      width={dimension}
      height={dimension}
      borderRadius={borderRadius}
      backgroundColor={palette.background}
      alignItems="center"
      justifyContent="center"
      overflow="hidden"
      accessibilityRole={accessibilityRole}
      accessibilityLabel={accessibilityLabel ?? name ?? "Avatar"}
      {...rest}
    >
      {showImage ? (
        <Image
          testID={`${testID}-image`}
          source={source}
          onError={handleImageError}
          style={{ width: dimension, height: dimension }}
        />
      ) : displayInitials !== "" ? (
        <TamaguiText
          testID={`${testID}-initials`}
          color={palette.text}
          fontSize={Math.floor(dimension * 0.4)}
          fontWeight="600"
        >
          {displayInitials}
        </TamaguiText>
      ) : null}
    </YStack>
  );
});

/**
 * Compute initials from a full name. First letter of the first
 * word + first letter of the last word, uppercased. Single-word
 * names yield just the first letter. Empty / whitespace-only input
 * yields an empty string (the Avatar renders an empty background
 * instead of a ghost text node). Extracted for direct pure-function
 * tests.
 */
export function computeInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "";
  // Post-filter: every entry is a non-empty string, so words[i][0]
  // is always a real character — non-null assertions are safe.
  if (words.length === 1) return words[0]![0]!.toUpperCase();
  const first = words[0]![0]!;
  const last = words[words.length - 1]![0]!;
  return `${first}${last}`.toUpperCase();
}

/**
 * Map a `size` prop value to a pixel dimension. Presets resolve to
 * fixed sizes; raw numbers pass through untouched.
 */
export function resolveAvatarSize(size: AvatarSize | number): number {
  if (typeof size === "number") return size;
  if (size === "sm") return 24;
  if (size === "md") return 40;
  if (size === "lg") return 56;
  return 80; // "xl"
}

/**
 * Map a `shape` prop value + resolved size to a border radius.
 * Circle → half the dimension (perfectly round); rounded → 8;
 * square → 0.
 */
export function resolveAvatarBorderRadius(shape: AvatarShape, dimension: number): number {
  if (shape === "circle") return dimension / 2;
  if (shape === "rounded") return 8;
  return 0; // "square"
}

export type { AvatarColorsInput, AvatarProps, AvatarShape, AvatarSize } from "./avatar-types";
