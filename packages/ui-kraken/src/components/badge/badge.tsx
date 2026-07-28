import { forwardRef } from "react";
import type { ComponentRef, ReactNode } from "react";
import { Text as TamaguiText, YStack } from "tamagui";

import { mergeBadgeToneColors } from "../../tokens/defaults/badge";
import { useUIKit } from "../../provider/use-ui-kit";
import type { BadgeProps, BadgeSize, BadgeTone } from "./badge-types";

type BadgeRef = ComponentRef<typeof YStack>;

const SIZE_MAP: Record<
  BadgeSize,
  { paddingVertical: number; paddingHorizontal: number; fontSize: number; minHeight: number }
> = {
  sm: { paddingVertical: 2, paddingHorizontal: 6, fontSize: 10, minHeight: 16 },
  md: { paddingVertical: 3, paddingHorizontal: 8, fontSize: 12, minHeight: 20 },
};

const DOT_SIZE: Record<BadgeSize, number> = { sm: 8, md: 10 };

/**
 * Compact pill for notification counts, status labels, and inline
 * indicators. Three rendering modes coexist:
 *
 * ```tsx
 * <Badge tone="success">Active</Badge>            // text
 * <Badge tone="danger" count={5} />                // "5"
 * <Badge count={120} maxCount={99} />              // "99+"
 * <Badge dot tone="success" />                     // status dot
 * ```
 *
 * Mode precedence: `dot` wins over `count` wins over `children`.
 */
const BadgeBase = forwardRef<BadgeRef, BadgeProps>(function Badge(
  {
    tone = "neutral",
    size = "md",
    count,
    maxCount = 99,
    dot = false,
    children,
    badgeColors,
    testID = "badge",
    accessibilityRole = "text",
    accessibilityLabel,
    ...rest
  },
  ref
) {
  const { tokens } = useUIKit();
  const basePalette = tokens.badgeColors[tone];
  const palette = mergeBadgeToneColors(basePalette, badgeColors);
  const dimensions = SIZE_MAP[size];
  const content = resolveContent(dot, count, maxCount, children);
  const isDot = dot;
  const dotSize = DOT_SIZE[size];
  const a11yLabel = accessibilityLabel ?? (isDot ? "Indicator" : contentToA11yLabel(content));

  if (isDot) {
    return (
      <YStack
        ref={ref}
        testID={testID}
        width={dotSize}
        height={dotSize}
        borderRadius={dotSize / 2}
        backgroundColor={palette.background}
        accessibilityRole={accessibilityRole}
        accessibilityLabel={a11yLabel}
        {...rest}
      />
    );
  }

  return (
    <YStack
      ref={ref}
      testID={testID}
      paddingVertical={dimensions.paddingVertical}
      paddingHorizontal={dimensions.paddingHorizontal}
      minHeight={dimensions.minHeight}
      borderRadius={dimensions.minHeight / 2}
      backgroundColor={palette.background}
      alignItems="center"
      justifyContent="center"
      accessibilityRole={accessibilityRole}
      accessibilityLabel={a11yLabel}
      {...rest}
    >
      <TamaguiText
        testID={`${testID}-text`}
        color={palette.text}
        fontSize={dimensions.fontSize}
        fontWeight="600"
      >
        {content}
      </TamaguiText>
    </YStack>
  );
});

/**
 * Resolve the badge's rendered content based on mode precedence:
 * `dot` wins over `count` wins over `children`. Extracted for
 * direct pure-function tests.
 */
export function resolveContent(
  dot: boolean,
  count: number | undefined,
  maxCount: number,
  children: ReactNode | undefined
): ReactNode {
  if (dot) return null;
  if (count != null) return formatCount(count, maxCount);
  return children ?? null;
}

/**
 * Format a count for display. Numbers above `maxCount` render as
 * `"{maxCount}+"` (`120` with `maxCount=99` → `"99+"`). Otherwise
 * the number is stringified as-is (including `0`).
 */
export function formatCount(count: number, maxCount: number): string {
  if (count > maxCount) return `${maxCount}+`;
  return String(count);
}

/**
 * Compute a fallback `accessibilityLabel` from the rendered
 * content. String content passes through; anything else falls
 * back to `"Badge"`.
 */
function contentToA11yLabel(content: ReactNode): string {
  // Count is always pre-formatted to a string via `formatCount`; the
  // remaining reachable content types are string children (passed
  // through) or arbitrary ReactNodes (fall back to a generic label).
  if (typeof content === "string") return content;
  return "Badge";
}

/**
 * Compound export. `BadgeBase` is the raw `forwardRef`; we attach
 * `.Primary` / `.Success` / `.Warning` / `.Danger` shortcuts as
 * static properties. No `.Neutral` — that's the base `<Badge>`
 * default.
 */
type BadgeToneComponent = ForwardRefBadge;
type ForwardRefBadge = typeof BadgeBase;

function withTone(tone: BadgeTone) {
  return forwardRef<BadgeRef, Omit<BadgeProps, "tone">>(function ToneBadge(props, ref) {
    return <BadgeBase ref={ref} tone={tone} {...props} />;
  });
}

type BadgeComponent = BadgeToneComponent & {
  Primary: ReturnType<typeof withTone>;
  Success: ReturnType<typeof withTone>;
  Warning: ReturnType<typeof withTone>;
  Danger: ReturnType<typeof withTone>;
};

const BadgeWithTones = BadgeBase as BadgeComponent;
BadgeWithTones.Primary = withTone("primary");
BadgeWithTones.Success = withTone("success");
BadgeWithTones.Warning = withTone("warning");
BadgeWithTones.Danger = withTone("danger");

export const Badge = BadgeWithTones;

export type { BadgeColorsInput, BadgeProps, BadgeSize, BadgeTone } from "./badge-types";
