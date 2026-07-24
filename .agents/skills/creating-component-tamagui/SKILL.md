---
name: creating-component-tamagui
description: Create a UI component that ships in packages/ui-kraken/src/components/. Covers the seven files a component needs (component, styled, types, spec, stories, README, index), the Tamagui `styled()` patterns for variants, the color-override prop convention, testID propagation, and the checklist to run before opening the PR. Use ONLY for building visual/interactive components — do not use for providers, hooks, tokens, or non-component code (each has its own skill).
---

# Creating a ui-kraken component

Scope of this skill: creating a visual/interactive component inside `packages/ui-kraken/src/components/<name>/`. Nothing else.

> **Before you start**, read [`AGENTS.md`](../../../AGENTS.md). It carries the repo-wide rules that apply everywhere (naming, exports, types, styling, testing, do-not lists). This skill only covers what is **specific** to building a component.

Related skills (do not mix responsibilities):

- `creating-provider-tamagui` — for React providers / contexts.
- (future) `creating-hook` — for standalone hooks.
- (future) `creating-token-set` — for extending the Tokens schema.

---

## 1. Where the component lives

```
packages/ui-kraken/src/components/<component-name>/
├── <component-name>.tsx           # component logic (compound export if variants)
├── <component-name>.styled.ts     # Tamagui styled() primitives only
├── <component-name>-types.ts      # <ComponentName>Props + role-based color interfaces
├── <component-name>.spec.tsx      # unit tests (RTL v14)
├── <component-name>.stories.tsx   # Storybook on-device story
├── README.md                      # public docs — props table + usage examples
└── index.ts                       # explicit named exports (no `export *`)
```

- **Folder name = component name in kebab-case.** e.g. `button/`, `product-card/`.
- **Every file inside starts with the same kebab-case name** so grep across the repo stays useful.
- **Never nest components inside components.** A `ButtonLabel` subcomponent lives in `button.tsx` or `button.styled.ts` — never in `button/label/`.
- **Do not put context, hooks, or token logic in a component folder.** Those go elsewhere (see the sibling skills).

## 2. Color-override props (project-wide convention)

Every component with any styleable color surface exposes overrides as **grouped object props**, one per semantic role. **Do NOT expose flat props** like `primaryColor` / `textPrimaryColor`.

Shape: `<something>Colors` where `<something>` is the role (`button`, `text`, `icon`, `border`, `background`, ...). Each object maps variant/state names to color strings.

```tsx
// GOOD — grouped by role, scales as the component gets more surfaces
<Button.Primary
  buttonColors={{ primary: "#2563EB", secondary: "#1E40AF", disabled: "#93C5FD" }}
  textColors={{ primary: "#FFFFFF", secondary: "#E0E7FF", disabled: "#DBEAFE" }}
  iconColors={{ primary: "#FFFFFF" }}
>
  Save
</Button.Primary>

// BAD — flat props explode combinatorially and are painful to type
<Button.Primary
  primaryColor="#2563EB"
  textPrimaryColor="#FFFFFF"
  disabledColor="#93C5FD"
  disabledTextColor="#DBEAFE"
  ...
/>
```

Types go in the component's `*-types.ts`, one interface per role:

```ts
// packages/ui-kraken/src/components/button/button-types.ts
export interface ButtonColors {
  primary?: string;
  secondary?: string;
  disabled?: string;
  loading?: string;
}

export interface TextColors {
  primary?: string;
  secondary?: string;
  disabled?: string;
}
```

Fallback order at render time:

1. Per-instance override prop (`buttonColors.primary`).
2. Theme token derived from `Tokens` (e.g. `$krakenPrimary9`) — provided by whatever provider is mounted above the component.

The component knows nothing about how the theme tokens were produced. It just reads `$kraken*` tokens from Tamagui.

## 3. `*.styled.ts` — Tamagui primitives only

- Styled files contain ONLY calls to `styled()`, `getTokens()`, and Tamagui type helpers. No hooks. No React components. No business logic.
- Use `$kraken*` theme tokens for every color, spacing, radius. **No hex literals inside `.styled.ts`.**
- Variants live in `styled(Base, { variants: { ... } as const, defaultVariants: { ... } })`.
- Press feedback on button-like elements: `pressStyle={{ scale: 0.98, opacity: 0.9 }}`.
- Minimum touch target 48 × 48 px on interactive elements.

```ts
// packages/ui-kraken/src/components/button/button.styled.ts
import { styled, Stack, Text } from "tamagui";

export const StyledButton = styled(Stack, {
  name: "KrakenButton",
  tag: "button",
  role: "button",
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  gap: "$uiSpacingSm",
  minHeight: 48,
  borderRadius: "$uiRadiusMd",
  pressStyle: { scale: 0.98, opacity: 0.9 },

  variants: {
    tone: {
      primary: { backgroundColor: "$krakenPrimary9" },
      secondary: { backgroundColor: "$krakenSecondary9" },
      ghost: { backgroundColor: "transparent", borderWidth: 1, borderColor: "$krakenPrimary9" },
      destructive: { backgroundColor: "$krakenDanger9" },
    },
    size: {
      sm: { minHeight: 36, paddingHorizontal: "$uiSpacingSm" },
      md: { minHeight: 48, paddingHorizontal: "$uiSpacingMd" },
      lg: { minHeight: 56, paddingHorizontal: "$uiSpacingLg" },
    },
    disabled: { true: { opacity: 0.45, pointerEvents: "none" } },
  } as const,

  defaultVariants: { tone: "primary", size: "md" },
});

export const StyledButtonLabel = styled(Text, {
  name: "KrakenButtonLabel",
  fontFamily: "$body",
  fontWeight: "600",
  color: "$uiTextOnPrimary",
});
```

## 4. `*.tsx` — component logic

The component file wires props → styled primitives, applies per-instance overrides, and handles slots (icons, loader).

```tsx
// packages/ui-kraken/src/components/button/button.tsx
import { forwardRef } from "react";
import type { ComponentRef } from "react";
import { View } from "react-native";

import { StyledButton, StyledButtonLabel } from "./button.styled";
import type { ButtonProps } from "./button-types";

type ButtonRef = ComponentRef<typeof StyledButton>;

export const Button = forwardRef<ButtonRef, ButtonProps>(function Button(
  { children, leftIcon, rightIcon, loading, disabled, buttonColors, textColors, testID, ...rest },
  ref
) {
  const rootId = testID ?? "button";
  const bgOverride = buttonColors?.primary;
  const textOverride = textColors?.primary;

  return (
    <StyledButton
      ref={ref}
      testID={rootId}
      disabled={disabled || loading}
      backgroundColor={bgOverride}
      {...rest}
    >
      {leftIcon != null && !loading && <View testID={`${rootId}-left-icon`}>{leftIcon}</View>}
      {loading && <View testID={`${rootId}-loader`}>{/* Loader component */}</View>}
      {children != null && (
        <StyledButtonLabel testID={`${rootId}-label`} color={textOverride}>
          {children}
        </StyledButtonLabel>
      )}
      {rightIcon != null && <View testID={`${rootId}-right-icon`}>{rightIcon}</View>}
    </StyledButton>
  );
});
```

If the component has variants that consumers select as subcomponents (`Button.Primary`, `Button.Ghost`), build the compound export at the bottom of the file:

```tsx
const withTone = (tone: ButtonProps["tone"]) =>
  forwardRef<ButtonRef, ButtonProps>(function ButtonVariant(props, ref) {
    return <Button ref={ref} tone={tone} {...props} />;
  });

const ButtonPrimary = withTone("primary");
const ButtonSecondary = withTone("secondary");
const ButtonGhost = withTone("ghost");
const ButtonDestructive = withTone("destructive");

export {
  ButtonPrimary as Primary,
  ButtonSecondary as Secondary,
  ButtonGhost as Ghost,
  ButtonDestructive as Destructive,
};

// Dual export: `<Button>` behaves as `<Button.Primary>` for the 80% case,
// AND `<Button.Primary>` etc. work as named variants.
// The consumer barrel (index.ts) attaches the subcomponents onto Button.
```

## 5. `*-types.ts` — types only

- One interface per grouped color role (`ButtonColors`, `TextColors`, `IconColors`).
- One `<ComponentName>Props` interface that extends the styled primitive's props (via `GetProps<typeof StyledButton>`) so every Tamagui style prop flows through with autocomplete.
- Always include `testID?: string`.
- Use `import type` for every Tamagui / React type.

```ts
// packages/ui-kraken/src/components/button/button-types.ts
import type { ReactNode } from "react";
import type { GetProps } from "tamagui";
import type { StyledButton } from "./button.styled";

export interface ButtonColors {
  primary?: string;
  secondary?: string;
  disabled?: string;
  loading?: string;
}

export interface TextColors {
  primary?: string;
  secondary?: string;
  disabled?: string;
}

export interface IconColors {
  primary?: string;
  secondary?: string;
  disabled?: string;
}

type StyledButtonProps = GetProps<typeof StyledButton>;

export interface ButtonProps extends Omit<StyledButtonProps, "children"> {
  children?: ReactNode;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  loading?: boolean;
  buttonColors?: ButtonColors;
  textColors?: TextColors;
  iconColors?: IconColors;
  testID?: string;
}
```

## 6. `testID` propagation

- Every component prop interface includes `testID?: string`.
- Root element: `testID={testID ?? "<component-name>"}`.
- Every measurable/interactive child: ``testID={`${rootId}-<part>`}`` in kebab-case.
- Common part suffixes: `label`, `left-icon`, `right-icon`, `loader`, `input`, `helper`, `error`.

## 7. `*.spec.tsx` — unit tests

- `@testing-library/react-native` v14. In v14 `render()` returns a `Promise` — always `await` it, then use the exported `screen` global for queries (destructuring the return also works, but every query call site has to be `await`-safe).
- Mock `@tamagui/core` (avoids pulling the full engine) and — when testing pure behavior — the component's own `*.styled.ts`.
- Cover: each variant renders, each state (disabled, loading) sets the right props/accessibility, each grouped-color override takes effect, `onPress` fires.
- Prefer `getByTestId` over `getByRole` unless semantics are the thing under test.

```tsx
// packages/ui-kraken/src/components/button/button.spec.tsx
import { fireEvent, render, screen } from "@testing-library/react-native";

import { Button } from "./button";

jest.mock("@tamagui/core", () => ({
  useTheme: () => ({
    krakenPrimary9: { val: "#2563EB" },
    uiTextOnPrimary: { val: "#FFFFFF" },
  }),
  getConfig: () => ({ fonts: { body: { family: { val: "Inter" } } } }),
}));

describe("Button", () => {
  it("calls onPress when tapped", async () => {
    const onPress = jest.fn();
    await render(
      <Button testID="save" onPress={onPress}>
        Save
      </Button>
    );

    fireEvent.press(screen.getByTestId("save"));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("applies per-instance buttonColors override", async () => {
    await render(
      <Button testID="save" buttonColors={{ primary: "#FF0000" }}>
        Save
      </Button>
    );

    expect(screen.getByTestId("save")).toHaveStyle({ backgroundColor: "#FF0000" });
  });

  it("hides leftIcon while loading and shows loader instead", async () => {
    await render(
      <Button testID="save" loading leftIcon={<></>}>
        Save
      </Button>
    );

    expect(screen.queryByTestId("save-left-icon")).toBeNull();
    expect(screen.getByTestId("save-loader")).toBeTruthy();
  });
});
```

### 7.1 Structural snapshots (required for visual components)

Every visual component MUST also ship a `describe("snapshots")` block that iterates every variant × relevant axis (tone / size / state / color / intensity — whatever the component exposes) and calls `expect(screen.toJSON()).toMatchSnapshot()` per case. This complements the targeted assertions above by catching regressions the specific asserts don't — a dropped prop, an accidental extra wrapper, an inline-style flip. See the shipped Button spec and Text spec for the canonical shape.

Coverage guidelines by component axis (adapt per component):

- Every variant / tone at the default size (5–13 snapshots depending on how many variants exist).
- Every size at the primary variant (typically 3 — sm / md / lg).
- Every state that visibly changes the output: `disabled`, `loading`, with/without icons, icon-only.
- Every radius / elevation preset — for elevation, cross with `light` / `dark` theme if the component has a dark-mode-specific rendering path (Button does; Text doesn't).
- Every color slot × the base variant (hierarchy / semantic / on-\*).
- Every intensity / opacity modulator.
- Every truncation / alignment / passthrough prop that changes output.
- At least one per-instance override snapshot.

Use `it.each([...])` to parametrize where the axis has more than 3 values. Keep tests inside the same `describe("<Component>", () => { ... })` block as the behavioral tests, and reset any mocked hook state in a `beforeEach` inside the snapshots describe so intra-file mock leakage doesn't cause false diffs.

Intentional snapshot change:

```bash
pnpm --filter ui-kraken test -u          # regenerate
git diff packages/ui-kraken/src/components/<name>/__snapshots__/
# eyeball the diff, commit both the code and the snapshot update together
```

Accidental snapshot change (CI fails): fix the code or, if the change is desired but the intent wasn't captured, treat as intentional above.

## 8. `*.stories.tsx` — Storybook

- One `.stories.tsx` per component, at least one story per variant × size, one story with per-instance overrides, one dark-theme story.
- File name is the component in kebab-case (matches every other file). The story `title` is in `UI Kit/<PascalCase>` for the Storybook sidebar.

```tsx
// packages/ui-kraken/src/components/button/button.stories.tsx
import type { Meta, StoryObj } from "@storybook/react-native";
import { View } from "react-native";
import { Theme } from "tamagui";

import { Button } from "./button";

const meta = {
  title: "UI Kit/Button",
  component: Button,
  args: { children: "Save" },
  argTypes: { onPress: { action: "pressed" } },
  decorators: [
    (Story) => (
      <View style={{ flex: 1, justifyContent: "center", padding: 24 }}>
        <Story />
      </View>
    ),
  ],
} satisfies Meta<typeof Button>;

export { meta as default };

type Story = StoryObj<typeof meta>;

export const Primary: Story = {};
export const Ghost: Story = { render: (args) => <Button.Ghost {...args} /> };
export const WithOverride: Story = {
  args: {
    buttonColors: { primary: "#FF6B00" },
    textColors: { primary: "#FFFFFF" },
  },
};
export const DarkTheme: Story = {
  render: (args) => (
    <Theme name="dark">
      <Button {...args} />
    </Theme>
  ),
};
```

## 9. `README.md` — public docs

Written for a consumer of the `ui-kraken` npm package (not for the maintainer).

```markdown
# Button

Interactive button with primary / secondary / ghost / destructive variants.

## Props

| Prop           | Type                   | Default    | Description                                                                                 |
| -------------- | ---------------------- | ---------- | ------------------------------------------------------------------------------------------- |
| `children`     | `ReactNode`            | —          | Label content.                                                                              |
| `size`         | `"sm" \| "md" \| "lg"` | `"md"`     | Vertical size.                                                                              |
| `disabled`     | `boolean`              | `false`    | Disables interaction.                                                                       |
| `loading`      | `boolean`              | `false`    | Replaces `leftIcon` with a loader.                                                          |
| `leftIcon`     | `ReactNode`            | —          | Slot rendered before the label.                                                             |
| `rightIcon`    | `ReactNode`            | —          | Slot rendered after the label.                                                              |
| `buttonColors` | `ButtonColors`         | —          | Per-instance surface color overrides.                                                       |
| `textColors`   | `TextColors`           | —          | Per-instance label color overrides.                                                         |
| `iconColors`   | `IconColors`           | —          | Per-instance icon tint overrides.                                                           |
| `testID`       | `string`               | `"button"` | Root testID. Subelements derive: `{testID}-label`, `{testID}-left-icon`, `{testID}-loader`. |

## Usage

\`\`\`tsx
import { Button } from "ui-kraken";

<Button.Primary onPress={onSubmit}>Save</Button.Primary>

<Button.Ghost leftIcon={<TrashIcon />} onPress={onDelete}>
Delete
</Button.Ghost>

<Button.Primary
buttonColors={{ primary: "#FF6B00" }}
textColors={{ primary: "#FFFFFF" }}

>

Custom brand
</Button.Primary>

<Button loading>Submitting</Button>
\`\`\`
```

## 10. `index.ts` — explicit named exports

```ts
// packages/ui-kraken/src/components/button/index.ts
export { Button } from "./button";
export type { ButtonProps, ButtonColors, TextColors, IconColors } from "./button-types";
```

Then add the component to `packages/ui-kraken/src/components/index.ts` (also explicit) and to the public barrel `packages/ui-kraken/src/index.ts`.

## 11. Checklist

Before opening the PR:

- [ ] Folder `packages/ui-kraken/src/components/<name>/` exists with the seven files.
- [ ] `*.styled.ts` uses only `$kraken*` theme tokens — no hex literals.
- [ ] Prop interface named `<ComponentName>Props`, exported from `*-types.ts`, includes `testID?: string`.
- [ ] Color overrides ship as **grouped object props** (`buttonColors`, `textColors`, `iconColors`) — no flat `primaryColor`-style props.
- [ ] `testID` propagates to every measurable/interactive subelement with kebab-case suffixes.
- [ ] `*.spec.tsx` covers each variant, each interactive state, at least one grouped-color override, and `onPress`.
- [ ] `*.stories.tsx` includes every variant × size, one override story, one dark-theme story.
- [ ] `README.md` has the full props table and at least three usage examples (default, with slots, with overrides).
- [ ] `index.ts` re-exports every public symbol explicitly. No `export *`.
- [ ] Component and types added to `packages/ui-kraken/src/components/index.ts` and to the public barrel `packages/ui-kraken/src/index.ts`.
- [ ] Minimum touch target 48 × 48 px on interactive elements.
- [ ] Dark theme validated in Storybook.
- [ ] `pnpm lint && pnpm typecheck && pnpm test` all green locally.
- [ ] Changeset added (`pnpm changeset`).
