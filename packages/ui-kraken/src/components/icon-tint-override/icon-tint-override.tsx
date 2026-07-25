import type { ReactNode } from "react";
import { Text } from "react-native";

/**
 * Wrap an icon / label `ReactNode` in a plain `<Text>` container so
 * the `color` style prop cascades into any text-glyph icon
 * (`<Text>i</Text>`, `<Text>▲</Text>`, most icon-library components
 * that expose a `color` prop or inherit via `currentColor` on web).
 *
 * The consumer-supplied icon is a `ReactNode` — we cannot style its
 * color directly from CSS. This wrapper is a defensive best-effort:
 * icons that ignore color simply render their intrinsic color and
 * the primitive's palette does not apply to them (which is usually
 * the whole point for branded logos like Google's multi-color G).
 *
 * Internal-only. Consumed by Alert / Hint / StatCard / SocialButton
 * / Collapsible / ExternalLink to keep the "tint an icon slot" body
 * consistent across primitives. NOT re-exported from the public
 * barrel (`src/index.ts` or `components/index.ts`) because it's
 * shared implementation, not part of the user-facing API.
 */
export function IconTintOverride({
  color,
  children,
  testID,
}: {
  color: string;
  children: ReactNode;
  testID?: string;
}): ReactNode {
  return (
    <Text testID={testID} style={{ color }}>
      {children}
    </Text>
  );
}
