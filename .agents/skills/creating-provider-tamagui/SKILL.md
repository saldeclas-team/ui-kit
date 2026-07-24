---
name: creating-provider-tamagui
description: Create a React context provider that wraps Tamagui and exposes ui-kraken-specific state (tokens, themes, portal host, feature flags, etc.). Covers where providers live in packages/ui-kraken/src/provider/, the required file split (provider tsx, context, hook, types, spec), how to mount TamaguiProvider underneath, and the useMemo discipline required for the config. Use ONLY for React providers/contexts — NOT for visual components (use creating-component-tamagui) and NOT for the token schema itself (use creating-token-set — future skill).
---

# Creating a ui-kraken provider

Scope of this skill: creating a React context provider inside `packages/ui-kraken/src/provider/` (or `packages/ui-kraken/src/providers/<name>/` when we start shipping more than one). Nothing else.

> **Before you start**, read [`AGENTS.md`](../../../AGENTS.md). It carries the repo-wide rules that apply everywhere (naming, exports, types, do-not lists). This skill only covers what is **specific** to building a provider.

Related skills (do not mix responsibilities):

- `creating-component-tamagui` — for visual/interactive components. If you find yourself importing `styled()` here, you are in the wrong file.
- (future) `creating-token-set` — for extending or adding token schemas.

---

## 1. Where the provider lives

If it is the single top-level provider of the library (`KrakenProvider`):

```
packages/ui-kraken/src/provider/
├── kraken-provider.tsx           # the provider component
├── kraken-provider-context.tsx   # createContext + the Context type
├── use-kraken.ts                 # hook returning the context (throws when out of tree)
├── kraken-provider-types.ts      # KrakenProviderProps, KrakenContextValue
├── kraken-provider.spec.tsx      # unit tests (RTL v14)
├── use-kraken.spec.ts            # unit tests for the hook
└── index.ts                      # explicit named exports (no `export *`)
```

If we ever ship additional providers alongside the root one (e.g. a `ToastProvider`, a `PortalProvider` wrapper), promote the folder to plural and give each provider its own subfolder:

```
packages/ui-kraken/src/providers/
├── kraken/
│   ├── kraken-provider.tsx
│   ├── ...
│   └── index.ts
├── toast/
│   ├── toast-provider.tsx
│   ├── ...
│   └── index.ts
└── index.ts                      # re-exports every provider explicitly
```

- **Folder and every file inside share the kebab-case provider name** so grep stays useful.
- **Providers do not contain visual components.** A provider that needs to render UI (a portal host, a toast surface) delegates to a component from `packages/ui-kraken/src/components/`.
- **Providers do not own the token schema.** They accept tokens as a prop and forward them to whatever consumer needs them (`buildKrakenConfig`, `TamaguiProvider`). The schema itself lives in `packages/ui-kraken/src/tokens/`.

## 2. The file split

### `<name>-provider-context.tsx`

Holds the `React.createContext` call and its typed value. Separated from the provider component so tests and hooks can import the context type without pulling the whole provider tree.

```tsx
// packages/ui-kraken/src/provider/kraken-provider-context.tsx
import { createContext } from "react";
import type { KrakenContextValue } from "./kraken-provider-types";

// `null` sentinel lets `useKraken` throw a clear error when called outside the
// provider tree. Never provide a default value — it would silently hide the bug.
export const KrakenContext = createContext<KrakenContextValue | null>(null);
```

### `<name>-provider-types.ts`

Types only. No values. No `React.FC`.

```ts
// packages/ui-kraken/src/provider/kraken-provider-types.ts
import type { ReactNode } from "react";
import type { KrakenTokens, ResolvedKrakenTokens } from "../tokens/kraken-tokens-types";
import type { KrakenConfig } from "../tokens/kraken-tokens";

export interface KrakenProviderProps {
  children: ReactNode;
  tokens?: Partial<KrakenTokens>;
  defaultTheme?: "light" | "dark";
}

export interface KrakenContextValue {
  tokens: ResolvedKrakenTokens;
  tamaguiConfig: KrakenConfig;
}
```

### `<name>-provider.tsx`

Wires the props → context value → children. **Keep it under ~60 lines.** If it grows, extract helpers to sibling files.

```tsx
// packages/ui-kraken/src/provider/kraken-provider.tsx
import { useMemo } from "react";
import { PortalProvider, TamaguiProvider } from "tamagui";

import {
  DEFAULT_KRAKEN_TOKENS,
  buildKrakenConfig,
  coarseToFineTokens,
} from "../tokens/kraken-tokens";
import { KrakenContext } from "./kraken-provider-context";
import type { KrakenProviderProps } from "./kraken-provider-types";

export function KrakenProvider({ children, tokens, defaultTheme = "light" }: KrakenProviderProps) {
  const contextValue = useMemo(() => {
    const merged = { ...DEFAULT_KRAKEN_TOKENS, ...tokens };
    return {
      tokens: coarseToFineTokens(merged),
      tamaguiConfig: buildKrakenConfig(merged),
    };
  }, [tokens]);

  return (
    <TamaguiProvider config={contextValue.tamaguiConfig} defaultTheme={defaultTheme}>
      <PortalProvider shouldAddRootHost>
        <KrakenContext.Provider value={contextValue}>{children}</KrakenContext.Provider>
      </PortalProvider>
    </TamaguiProvider>
  );
}
```

Notes:

- `useMemo` on the context value is not optional — without it, every parent re-render rebuilds the Tamagui config, which walks the whole theme tree and thrashes styled components.
- The dependency array is the **input prop**, not the derived context value. If a consumer passes a fresh object literal every render, they will pay for the rebuild — document this in the README.
- Mount `PortalProvider` from Tamagui here (not per-component) so future overlay components (`Sheet`, `Dialog`, `Toast`) land without a breaking provider migration.

### `use-<name>.ts` — the accessor hook

Every provider ships with a `use*` hook. It throws a helpful error when used outside its provider tree — never returns a fallback silently.

```ts
// packages/ui-kraken/src/provider/use-kraken.ts
import { useContext } from "react";

import { KrakenContext } from "./kraken-provider-context";
import type { KrakenContextValue } from "./kraken-provider-types";

export function useKraken(): KrakenContextValue {
  const value = useContext(KrakenContext);
  if (value === null) {
    throw new Error(
      "useKraken must be called inside <KrakenProvider>. Wrap your app root with KrakenProvider before rendering ui-kraken components."
    );
  }
  return value;
}
```

### `*.spec.tsx` / `*.spec.ts` — tests

Cover three things minimum:

1. Provider mounts children.
2. `useKraken()` throws with a clear message when called outside the provider.
3. Passing new `tokens` to the provider rebuilds the context value (verified via a stable/unstable reference assertion or by rendering a child that reads a specific override).

In v14 `render()` returns a `Promise` — always `await` it, then read queries from the `screen` global.

```tsx
// packages/ui-kraken/src/provider/kraken-provider.spec.tsx
import { render, screen } from "@testing-library/react-native";
import { Text } from "react-native";

// Tamagui pulls ESM-only entry points Jest cannot transform; a pass-through
// mock keeps the test hermetic and fast. Stub `createTamagui` / `createTokens`
// too because `buildKrakenConfig` calls them inside the useMemo.
jest.mock("tamagui", () => ({
  TamaguiProvider: ({ children }: { children: React.ReactNode }) => children,
  PortalProvider: ({ children }: { children: React.ReactNode }) => children,
  createTamagui: (config: unknown) => config,
  createTokens: (tokens: unknown) => tokens,
}));
jest.mock("@tamagui/config/v4", () => ({
  defaultConfig: { tokens: { color: {}, radius: {}, space: {}, size: {} } },
}));

import { KrakenProvider } from "./kraken-provider";
import { useKraken } from "./use-kraken";

function ReadPrimary() {
  const { tokens } = useKraken();
  return <Text testID="primary">{tokens.color.primary9}</Text>;
}

describe("KrakenProvider", () => {
  it("mounts children", async () => {
    await render(
      <KrakenProvider>
        <Text testID="child">hi</Text>
      </KrakenProvider>
    );
    expect(screen.getByTestId("child")).toBeTruthy();
  });

  it("exposes overridden tokens through useKraken", async () => {
    await render(
      <KrakenProvider tokens={{ primaryColor: "#FF6B00" }}>
        <ReadPrimary />
      </KrakenProvider>
    );
    expect(screen.getByTestId("primary").props.children).toBe("#FF6B00");
  });
});
```

```tsx
// packages/ui-kraken/src/provider/use-kraken.spec.tsx
import { render } from "@testing-library/react-native";
import { Text } from "react-native";

import { useKraken } from "./use-kraken";

function UseKrakenOrThrow() {
  const value = useKraken();
  return <Text>{value.tokens.color.primary9}</Text>;
}

describe("useKraken", () => {
  it("throws a helpful error when called outside a KrakenProvider", async () => {
    const spy = jest.spyOn(console, "error").mockImplementation(() => undefined);
    await expect(render(<UseKrakenOrThrow />)).rejects.toThrow(/inside <KrakenProvider>/);
    spy.mockRestore();
  });
});
```

### `index.ts` — explicit named exports

```ts
// packages/ui-kraken/src/provider/index.ts
export { KrakenProvider } from "./kraken-provider";
export { useKraken } from "./use-kraken";
export type { KrakenProviderProps, KrakenContextValue } from "./kraken-provider-types";
```

Then re-export from the public barrel `packages/ui-kraken/src/index.ts` — also explicit.

## 3. Escape-hatch contract

The provider's public hook (`useKraken`) intentionally exposes the raw `tamaguiConfig`. This is the escape hatch for consumers who need to drop down to Tamagui APIs directly:

```tsx
import { useKraken } from "ui-kraken";
import { createTokens, Theme } from "tamagui";

function AdvancedUsage() {
  const { tamaguiConfig } = useKraken();
  // build a custom sub-theme, override at the Theme boundary, etc.
  return <Theme name="dark">...</Theme>;
}
```

When you add a new provider, make the equivalent decision explicitly: does the corresponding `use*` hook expose the underlying primitive (Tamagui config, portal ref, etc.) so power users can bypass the abstraction? Document the answer in the provider's README section of `docs/PLAN.md`.

## 4. Do NOT

- **Do not put visual JSX in the provider file** beyond mounting the child tree. If the provider needs to render a portal surface, a toast host, or any visible UI, delegate to a component from `packages/ui-kraken/src/components/`.
- **Do not import from `packages/ui-kraken/src/components/`.** Providers should not depend on components (circular). If you need a UI surface, the component imports the provider hook, not the other way around.
- **Do not define the token schema in the provider file.** Schemas live in `packages/ui-kraken/src/tokens/`. The provider just consumes them.
- **Do not skip `useMemo`** on the context value. It is not an optimization — it is a correctness requirement for any provider that derives its value from other props.
- **Do not use `React.FC`** for the provider signature — use a plain function with an explicit `<Name>Props` interface.
- **Do not `export default`.** Named exports only (AGENTS.md rule).

## 5. Checklist

Before opening the PR:

- [ ] Folder `packages/ui-kraken/src/provider/` (or `providers/<name>/`) exists with the split above.
- [ ] `*-provider-types.ts` contains ONLY types.
- [ ] `*-provider-context.tsx` uses `null` as the default context value (no silent fallback).
- [ ] `use*` hook throws a clear error when called outside the provider.
- [ ] Context value is wrapped in `useMemo` with the correct dependency array.
- [ ] Provider mounts `TamaguiProvider` + `PortalProvider` (for the root ui-kraken provider) or delegates cleanly (for secondary providers).
- [ ] Provider does not import from `packages/ui-kraken/src/components/`.
- [ ] Provider does not define token schema — imports it from `packages/ui-kraken/src/tokens/`.
- [ ] `*.spec.tsx` covers mount, override propagation, and throw-outside-provider.
- [ ] `index.ts` re-exports every public symbol explicitly.
- [ ] Added to the public barrel `packages/ui-kraken/src/index.ts`.
- [ ] `pnpm lint && pnpm typecheck && pnpm test` all green locally.
- [ ] Changeset added (`pnpm changeset`).
