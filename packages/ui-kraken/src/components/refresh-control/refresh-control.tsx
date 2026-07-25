import { forwardRef } from "react";
import type { ComponentRef } from "react";
import { RefreshControl as RNRefreshControl } from "react-native";

import { useUIKit } from "../../provider/use-ui-kit";
import { resolvePalette } from "../../utils/resolve-palette";
import type { RefreshControlProps } from "./refresh-control-types";

type RefreshControlRef = ComponentRef<typeof RNRefreshControl>;

/**
 * Themed pull-to-refresh control for `ScrollView` / `FlatList` /
 * `SectionList`. Wraps RN's native `RefreshControl` so consumers get
 * theme-aware spinner + background colors on both iOS and Android
 * automatically.
 *
 * Not rendered standalone — passed to a scrollable via the
 * `refreshControl` prop:
 *
 * ```tsx
 * <ScrollView refreshControl={<RefreshControl refreshing={...} onRefresh={...} />}>
 * ```
 *
 * Palette derived from `tokens.refreshControlColors` on the provider,
 * overridable per-instance via the `refreshControlColors?` prop.
 */
export const RefreshControl = forwardRef<RefreshControlRef, RefreshControlProps>(
  function RefreshControl({ refreshing, onRefresh, refreshControlColors, testID, ...rest }, ref) {
    const { tokens } = useUIKit();
    const palette = resolvePalette(tokens.refreshControlColors, refreshControlColors);
    const rootId = testID ?? "refresh-control";

    return (
      <RNRefreshControl
        ref={ref}
        testID={rootId}
        refreshing={refreshing}
        onRefresh={onRefresh}
        // iOS: color of the spinning arrow.
        tintColor={palette.spinner}
        // Android: RN wants an array so it can rotate through multiple
        // colors — we pass a single-color monochrome array for a
        // consistent look.
        colors={[palette.spinner]}
        // Android: circular background behind the spinner.
        progressBackgroundColor={palette.background}
        // iOS: color of the optional `title` text below the spinner.
        titleColor={palette.title}
        {...rest}
      />
    );
  }
);

export type { RefreshControlColorsInput, RefreshControlProps } from "./refresh-control-types";
