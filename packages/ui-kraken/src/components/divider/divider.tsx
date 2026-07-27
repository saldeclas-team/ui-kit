import { forwardRef } from "react";
import type { ComponentRef } from "react";
import { YStack } from "tamagui";

import { useUIKit } from "../../provider/use-ui-kit";
import { resolvePalette } from "../../utils/resolve-palette";
import type { DividerOrientation, DividerProps } from "./divider-types";

type DividerRef = ComponentRef<typeof YStack>;

/**
 * Thin line for visual separation. Horizontal by default; vertical
 * variant for inline separators (e.g. between two icons in a row).
 * Extremely narrow surface — one prop for orientation, one for
 * thickness, one for inset, plus the standard palette + testID
 * conventions every ui-kraken primitive has.
 *
 * ```tsx
 * // Between rows in a Card
 * <Card>
 *   <Card.Header>...</Card.Header>
 *   <Divider />
 *   <Card.Body>...</Card.Body>
 * </Card>
 *
 * // Vertical inline
 * <Row>
 *   <Icon /><Divider orientation="vertical" /><Icon />
 * </Row>
 * ```
 *
 * ### Composition
 *
 * Renders a plain `<YStack>` with a resolved `backgroundColor` and
 * a `height` (horizontal) / `width` (vertical) matching `thickness`.
 * `alignSelf: "stretch"` on the cross-axis so the line fills its
 * parent without a manual `width: '100%'` at the callsite.
 */
export const Divider = forwardRef<DividerRef, DividerProps>(function Divider(
  {
    orientation = "horizontal",
    thickness = 1,
    inset = 0,
    dividerColors,
    testID = "divider",
    ...rest
  },
  ref
) {
  const { tokens } = useUIKit();
  const palette = resolvePalette(tokens.dividerColors, dividerColors);
  const sizeProps = orientationSizeProps(orientation, thickness);
  const marginProps = orientationInsetProps(orientation, inset);
  return (
    <YStack
      ref={ref}
      testID={testID}
      backgroundColor={palette.line}
      alignSelf="stretch"
      accessibilityRole="none"
      {...sizeProps}
      {...marginProps}
      {...rest}
    />
  );
});

/**
 * Map `orientation` + `thickness` to the axis-specific size prop.
 * Horizontal dividers get `height`; vertical dividers get `width`.
 * Extracted to a pure helper for direct unit tests.
 */
export function orientationSizeProps(
  orientation: DividerOrientation,
  thickness: number
): { height: number } | { width: number } {
  return orientation === "vertical" ? { width: thickness } : { height: thickness };
}

/**
 * Map `orientation` + `inset` to the axis-specific margin prop.
 * Horizontal dividers get `marginHorizontal` (left + right pull-in);
 * vertical dividers get `marginVertical` (top + bottom pull-in).
 * Returns an empty object when `inset === 0` to avoid overriding
 * consumer-passed margins.
 */
export function orientationInsetProps(
  orientation: DividerOrientation,
  inset: number
): Record<string, number> {
  if (inset === 0) return {};
  return orientation === "vertical" ? { marginVertical: inset } : { marginHorizontal: inset };
}

export type { DividerColorsInput, DividerOrientation, DividerProps } from "./divider-types";
