import { forwardRef } from "react";
import type { ComponentRef, ReactNode } from "react";

import { useUIKit } from "../../provider/use-ui-kit";
import { resolveRadius } from "../../utils/radius";
import type { StatCardColors } from "../../tokens/tokens-types";
import {
  StyledStatCard,
  StyledStatCardDelta,
  StyledStatCardDescription,
  StyledStatCardFooter,
  StyledStatCardHeader,
  StyledStatCardIconWrapper,
  StyledStatCardTitle,
  StyledStatCardTrend,
  StyledStatCardTrendIcon,
  StyledStatCardValue,
} from "./stat-card.styled";
import type { StatCardColorsInput, StatCardProps, StatCardTrend } from "./stat-card-types";

type StatCardRef = ComponentRef<typeof StyledStatCard>;

/**
 * Compact metric display card. Renders one value prominently with a
 * title above and an optional trend indicator (arrow + delta) below.
 * Fits into dashboards, analytics screens, financial widgets, and
 * admin panels.
 *
 * ```tsx
 * <StatCard title="Revenue" value="$12,340" trend="up" delta="+8.2%" />
 * ```
 */
export const StatCard = forwardRef<StatCardRef, StatCardProps>(function StatCard(
  {
    title,
    value,
    description,
    icon,
    trend,
    delta,
    deltaIcon,
    radius = "lg",
    statCardColors,
    testID,
    accessibilityRole = "summary",
    accessibilityLabel,
    ...rest
  },
  ref
) {
  const { tokens } = useUIKit();
  const rootId = testID ?? "stat-card";
  const palette = resolvePalette(tokens.statCardColors, statCardColors);
  const borderRadius = resolveRadius(radius);
  const trendColor = trend != null ? palette[trendColorSlot(trend)] : undefined;
  const composedLabel =
    accessibilityLabel ?? composeAccessibilityLabel(title, value, trend, delta, description);

  return (
    <StyledStatCard
      ref={ref}
      testID={rootId}
      backgroundColor={palette.background}
      borderRadius={borderRadius}
      accessibilityRole={accessibilityRole}
      accessibilityLabel={composedLabel}
      {...rest}
    >
      <StyledStatCardHeader>
        <StyledStatCardTitle testID={`${rootId}-title`} color={palette.title}>
          {title}
        </StyledStatCardTitle>
        {icon != null ? (
          <StyledStatCardIconWrapper testID={`${rootId}-icon`}>
            <IconTintOverride color={palette.icon}>{icon}</IconTintOverride>
          </StyledStatCardIconWrapper>
        ) : null}
      </StyledStatCardHeader>

      <StyledStatCardValue testID={`${rootId}-value`} color={palette.value}>
        {String(value)}
      </StyledStatCardValue>

      {(trend != null || description != null) && (
        <StyledStatCardFooter>
          {trend != null && (
            <StyledStatCardTrend>
              <StyledStatCardTrendIcon testID={`${rootId}-trend-icon`} color={trendColor}>
                {deltaIcon ?? TREND_GLYPH[trend]}
              </StyledStatCardTrendIcon>
              {delta != null && (
                <StyledStatCardDelta testID={`${rootId}-delta`} color={trendColor}>
                  {String(delta)}
                </StyledStatCardDelta>
              )}
            </StyledStatCardTrend>
          )}
          {description != null && (
            <StyledStatCardDescription testID={`${rootId}-description`} color={palette.description}>
              {description}
            </StyledStatCardDescription>
          )}
        </StyledStatCardFooter>
      )}
    </StyledStatCard>
  );
});

/**
 * Merge the per-instance `statCardColors?` override on top of the
 * provider-resolved palette. Missing slots fall through.
 */
function resolvePalette(
  base: StatCardColors,
  override: StatCardColorsInput | undefined
): StatCardColors {
  if (override == null) return base;
  return { ...base, ...override };
}

/**
 * Map the `radius` shorthand onto a `borderRadius` value. Numbers and
 * `"pill"` pass through directly; named preset values map onto the
 * theme's `$uiRadius*` token scale.
 */

/**
 * Map trend → palette slot key. Extracted to keep `resolvePalette` and
 * runtime rendering decoupled from the string-key layout on
 * `StatCardColors`.
 */
function trendColorSlot(trend: StatCardTrend): keyof StatCardColors {
  switch (trend) {
    case "up":
      return "trendUp";
    case "down":
      return "trendDown";
    case "neutral":
      return "trendNeutral";
  }
}

const TREND_GLYPH: Record<StatCardTrend, string> = {
  up: "▲",
  down: "▼",
  neutral: "—",
};

/**
 * Compose the default `accessibilityLabel` when the consumer does not
 * pass one explicitly. Announces the title + value, plus the trend /
 * delta and description when set, so screen readers get the full
 * metric context in one utterance.
 */
function composeAccessibilityLabel(
  title: string,
  value: string | number,
  trend: StatCardTrend | undefined,
  delta: string | number | undefined,
  description: string | undefined
): string {
  const parts: string[] = [`${title}, ${String(value)}`];
  if (trend != null) {
    const trendPart = delta != null ? `${trend} ${String(delta)}` : trend;
    parts.push(trendPart);
  }
  if (description != null) parts.push(description);
  return parts.join(", ");
}

/**
 * The icon slot is `ReactNode` (consumer brings any icon component)
 * so we cannot style its color from CSS. This wrapper sets a `color`
 * on a plain `<Text>`-like container that MOST icon libraries pick
 * up via their `color` prop or inherited CSS `currentColor`. Falls
 * back gracefully — an icon that ignores color simply renders its
 * intrinsic color and the palette does not apply to it.
 */
function IconTintOverride({ color, children }: { color: string; children: ReactNode }): ReactNode {
  return <StyledStatCardTrendIcon color={color}>{children}</StyledStatCardTrendIcon>;
}

export type {
  StatCardColorsInput,
  StatCardProps,
  StatCardRadius,
  StatCardTrend,
} from "./stat-card-types";
