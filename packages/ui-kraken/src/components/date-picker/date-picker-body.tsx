import type { DatePickerBodyProps } from "./date-picker-body-types";

/**
 * Non-iOS / non-Android / non-web fallback — Metro should always
 * pick one of the platform variants, but Node test harnesses that
 * don't set `Platform.OS` fall here. Renders the trigger + fallback
 * without a native picker.
 */
export function DatePickerBody({ renderTrigger, fallback }: DatePickerBodyProps) {
  if (fallback != null) return <>{fallback}</>;
  return renderTrigger(() => {
    /* no-op — no picker available in this runtime */
  });
}
