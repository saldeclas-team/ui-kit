import { forwardRef } from "react";
import type { ComponentRef } from "react";

import { useUIKit } from "../../provider/use-ui-kit";
import { resolvePalette } from "../../utils/resolve-palette";
import { StyledSurface } from "./surface.styled";
import type { SurfaceProps } from "./surface-types";

type SurfaceRef = ComponentRef<typeof StyledSurface>;

/**
 * Theme-bound background container. Picks a background color from the
 * active theme's `surfaceColors` palette based on the `level` prop
 * (defaults to `"base"`). Every other visual concern — padding,
 * radius, flex, gap, borders — flows through as Tamagui `YStack`
 * pass-through props.
 *
 * `Surface` intentionally ships without shadows in v1. "Elevation" is
 * expressed through background color only, following the Material 3
 * "tint over shadow" direction. If a consumer needs a shadow they
 * wrap in a shadow container or use `Button` chrome.
 */
export const Surface = forwardRef<SurfaceRef, SurfaceProps>(function Surface(
  { level = "base", surfaceColors, testID, children, ...rest },
  ref
) {
  const { tokens } = useUIKit();
  const palette = resolvePalette(tokens.surfaceColors, surfaceColors);
  const rootId = testID ?? "surface";

  return (
    <StyledSurface ref={ref} testID={rootId} backgroundColor={palette[level]} {...rest}>
      {children}
    </StyledSurface>
  );
});

export type { SurfaceColorsInput, SurfaceLevel, SurfaceProps } from "./surface-types";
