import { useContext } from "react";

import { UIKitContext } from "./provider-context";
import type { ContextValue } from "./provider-types";

export function useUIKit(): ContextValue {
  const value = useContext(UIKitContext);
  if (value === null) {
    throw new Error(
      "useUIKit must be called inside <UIKitProvider>. Wrap your app root with UIKitProvider before rendering ui-kraken components."
    );
  }
  return value;
}
