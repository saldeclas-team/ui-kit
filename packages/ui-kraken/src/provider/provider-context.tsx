import { createContext } from "react";

import type { ContextValue } from "./provider-types";

// `null` sentinel lets `useUIKit` throw a clear error when called outside the
// provider tree. Never provide a default value — it would silently hide the bug.
export const UIKitContext = createContext<ContextValue | null>(null);
