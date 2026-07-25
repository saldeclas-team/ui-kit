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

**Hard rule** (see `each-component-owns-color-space` memory): every component with any styleable color surface owns its own color block on the token schema. NEVER reuse another component's block. Consumers get overrides at BOTH the provider level (re-theme every instance) AND per-instance level (one-off paint).

Naming pattern — mirror what Button + Text + Alert + RadioGroup do:

| Type name                              | Lives in                     | Shape                                                                                                                                          |
| -------------------------------------- | ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `<X>VariantColors` (if variants)       | `tokens/tokens-types.ts`     | The slot set for ONE variant, e.g. `{ background, label, border? }`.                                                                           |
| `<X>Colors` (aggregate)                | `tokens/tokens-types.ts`     | The full palette. Variant-based (`{ primary: <X>VariantColors, ... }`) OR slot-based (`{ primary: string, ... }`).                             |
| `<X>ColorsInput` (provider)            | `provider/provider-types.ts` | Partial. `Partial<Record<keyof <X>Colors, Partial<<X>VariantColors>>>` for variant-based, `Partial<<X>Colors>` for slot-based.                 |
| `<X>VariantColorsInput` (per-instance) | Component's `*-types.ts`     | `Partial<<X>VariantColors>` — the variant is implicit (already picked by compound or `variant` prop). Only exists on variant-based components. |

For slot-based components (like Text, RadioGroup — no variants) the per-instance override type is the same shape as the provider input (`Partial<<X>Colors>`), so one type is enough.

Fallback order at render time:

1. Per-instance override prop (`<x>Colors={{ ... }}` on the component instance).
2. Provider-resolved palette (`tokens.<x>Colors` from `useUIKit()`), which merges the consumer's `<UIKitProvider tokens={{ <x>Colors: ... }}>` on top of `DEFAULT_TOKENS`.

The component reads `useUIKit().tokens.<x>Colors` at render time and merges the per-instance override on top. Do NOT reference `$ui*` Tamagui tokens directly in `<component>.tsx` for color slots — use the hook so per-instance overrides work correctly. `.styled.ts` files MAY reference `$ui*` tokens for static styling (spacing, radius, layout).

## 3. `*.styled.ts` — Tamagui primitives only

- Styled files contain ONLY calls to `styled()`, `getTokens()`, and Tamagui type helpers. No hooks. No React components. No business logic.
- Use `$ui*` theme tokens for every color, spacing, radius. **No hex literals inside `.styled.ts`.**
- Variants live in `styled(Base, { variants: { ... } as const, defaultVariants: { ... } })`.
- Press feedback on button-like elements: `pressStyle={{ scale: 0.98, opacity: 0.9 }}`.
- Minimum touch target 48 × 48 px on interactive elements.

```ts
// packages/ui-kraken/src/components/button/button.styled.ts
import { styled, Stack, Text } from "tamagui";

export const StyledButton = styled(Stack, {
  name: "UIKitButton",
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
      primary: { backgroundColor: "$uiButtonPrimaryBackground" },
      secondary: { backgroundColor: "$uiButtonSecondaryBackground" },
      ghost: {
        backgroundColor: "transparent",
        borderWidth: 1,
        borderColor: "$uiButtonOutlineBorder",
      },
      destructive: { backgroundColor: "$uiButtonDestructiveBackground" },
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
  name: "UIKitButtonLabel",
  fontFamily: "$body",
  fontWeight: "600",
  color: "$uiButtonPrimaryLabel",
});
```

### 3.1 Animation

- **Only `react-native-reanimated`.** RN's built-in `Animated` + `Easing` are banned in `packages/ui-kraken/src/**` (ESLint). Reanimated is a required peer dep; consumers already have it.
- Standard shape: `useSharedValue` for the animated value, `useAnimatedStyle` to bind it, `withTiming` / `withRepeat` / `withSequence` / `withSpring` for the interpolation, `cancelAnimation(sharedValue)` in the `useEffect` cleanup for loops. Import `Animated` (default) from `react-native-reanimated` for the animated view (`<Animated.View>`, `<Animated.Text>`).
- Jest already has a hand-rolled reanimated mock in `packages/ui-kraken/jest.setup.ts` (worklets resolve synchronously to their end value). No component-level mock needed.

```tsx
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

export function PulsingDot() {
  const opacity = useSharedValue(0);
  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 600, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 600, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
    return () => cancelAnimation(opacity);
  }, [opacity]);
  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));
  return <Animated.View style={[baseStyle, style]} />;
}
```

**Why single-stack**: mixing RN `Animated` (JS thread) with reanimated (UI thread worklets) in the same tree causes drop-frames and confusing debugging. Every animated component in ui-kraken uses reanimated so consumers get one predictable perf profile.

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
    uiButtonPrimaryBackground: { val: "#2563EB" },
    uiButtonPrimaryLabel: { val: "#FFFFFF" },
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

## 8. `*.stories.tsx` — Storybook (also feeds Chromatic visual regression)

- One `.stories.tsx` per component, at least one story per variant × size, one story with per-instance overrides, one dark-theme story.
- File name is the component in kebab-case (matches every other file). The story `title` is in `UI Kit/<PascalCase>` for the Storybook sidebar.
- **Stories are the source of truth for Chromatic visual regression.** Every story gets pixel-diffed against the baseline on every PR (via `.github/workflows/chromatic.yml`). This means: adding a component variant WITHOUT adding a story for it is an unreviewed regression risk — the visual matrix is what you write in this file. Contributors reviewing your PR will see side-by-side diffs of every story in the Chromatic UI; keep the story set complete and representative.
- Stories run in TWO renderers automatically: on-device via `.rnstorybook/` (RN native, dev tool for the maintainer) AND on Storybook Web via `.storybook/` (Chromatic, CI). Write once, both pick it up. Do not add renderer-specific code in the story file itself.

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
export type {
  ButtonProps,
  ButtonVariantColorsInput,
  ButtonTone,
  ButtonSize,
  ButtonRadius,
  ButtonElevation,
} from "./button-types";
```

Then add the component to `packages/ui-kraken/src/components/index.ts` (also explicit) and to the public barrel `packages/ui-kraken/src/index.ts`.

## 11. Wiring a color-using component to the token schema

Every color-using component owns its own block on `Tokens`. Adding a new one is 7 edits — always in this order so intermediate steps typecheck. See `each-component-owns-color-space` memory for rationale.

1. **`packages/ui-kraken/src/tokens/tokens-types.ts`** — declare the interfaces:
   - `<X>VariantColors` (only if the component has variants) with the slot set for one variant.
   - `<X>Colors` — the aggregate palette (variant-based or slot-based).
   - Add `<x>Colors: <X>Colors` to `Tokens` AND `ResolvedTokens`.
2. **`packages/ui-kraken/src/tokens/defaults/<x>.ts`** — new file with:
   - `DEFAULT_LIGHT_<X>_COLORS` + `DEFAULT_DARK_<X>_COLORS` — fully populated palettes.
   - `merge<X>Colors()` (+ `merge<X>VariantColors()` if variants).
3. **`packages/ui-kraken/src/tokens/defaults/index.ts`**:
   - Import the two defaults and add `<x>Colors` to `DEFAULT_TOKENS` + `DEFAULT_DARK_TOKENS`.
   - Re-export the defaults + merge helpers.
4. **`packages/ui-kraken/src/utils/flatten.ts`** — add `flatten<X>Colors(colors: <X>Colors): Record<string, string>` that emits `ui<X><Variant><Slot>` (variant-based) or `ui<X><Slot>` (slot-based) keys. Optional slots are omitted when `undefined`.
5. **`packages/ui-kraken/src/utils/index.ts`** — re-export the new flatten function.
6. **`packages/ui-kraken/src/tokens/tokens.ts`**:
   - Import `flatten<X>Colors` from `../utils/flatten`.
   - Spread `flatten<X>Colors(lightResolved.<x>Colors)` into `tokens.color` inside `createTokens(...)`.
   - Spread into `themes.light` and `themes.dark` inside `createTamagui(...)` (using `lightResolved` / `darkResolved` respectively).
   - Re-export the defaults + merge helpers at the bottom of this file.
7. **`packages/ui-kraken/src/tokens/tokens-derive.ts`** — destructure `<x>Colors` from `tokens` inside `coarseToFineTokens` and pass it through in the returned `ResolvedTokens`.
8. **`packages/ui-kraken/src/provider/provider-types.ts`**:
   - Add `<X>ColorsInput` — `Partial<Record<keyof <X>Colors, Partial<<X>VariantColors>>>` for variant-based, `Partial<<X>Colors>` for slot-based.
   - Add optional `<x>Colors?: <X>ColorsInput` to `TokensInput`.
9. **`packages/ui-kraken/src/provider/provider.tsx`** — import `merge<X>Colors`; extend both `mergedLight` and `mergedDark` in the `useMemo` to call `merge<X>Colors(DEFAULT_[DARK_]TOKENS.<x>Colors, tokens?.<x>Colors)`.
10. **`packages/ui-kraken/src/provider/index.ts`** — re-export `<X>ColorsInput`.
11. **`packages/ui-kraken/src/tokens/index.ts`** — re-export the new type + defaults + merge helpers.
12. **`packages/ui-kraken/src/index.ts`** — re-export from the public barrel.
13. **Component consumption**: read `useUIKit().tokens.<x>Colors` inside `<component>.tsx` and merge the per-instance `<x>Colors?` prop on top. Do NOT reference `$ui*` tokens directly for color slots.

## 12. Checklist

Before opening the PR:

- [ ] Folder `packages/ui-kraken/src/components/<name>/` exists with the seven files.
- [ ] `*.styled.ts` uses only `$ui*` theme tokens for spacing / radius / layout — no hex literals. Color surfaces come from `<component>.tsx` at render time via `useUIKit()`.
- [ ] Prop interface named `<ComponentName>Props`, exported from `*-types.ts`, includes `testID?: string`.
- [ ] Component owns its color block on the token schema (steps in Section 11). No reuse of another component's block.
- [ ] `<X>ColorsInput` type in `provider-types.ts` for provider-level override; per-instance override in the component's `*-types.ts`.
- [ ] `flatten<X>Colors` added to `utils/flatten.ts` and re-exported from `utils/index.ts`.
- [ ] Provider merge extended for both light + dark.
- [ ] `testID` propagates to every measurable/interactive subelement with kebab-case suffixes.
- [ ] `*.spec.tsx` mocks `useUIKit` to return the component's `<x>Colors` block; covers each variant, each interactive state, at least one per-instance override, one provider-level override (assert consumer palette flows through), and `onPress` if interactive.
- [ ] `*.stories.tsx` includes every variant × size, one override story, one dark-theme story.
- [ ] `README.md` has the full props table + at least three usage examples (default, with slots, with overrides) + a Platform support table (iOS · Android · Web).
- [ ] `index.ts` re-exports every public symbol explicitly. No `export *`.
- [ ] Component and types added to `packages/ui-kraken/src/components/index.ts` and to the public barrel `packages/ui-kraken/src/index.ts`.
- [ ] Minimum touch target 48 × 48 px on interactive elements.
- [ ] Dark theme validated in Storybook.
- [ ] Example app: new screen in `apps/example/app/(pages)/components/<name>.tsx`, new `Stack.Screen` in `apps/example/app/_layout.tsx` with `headerBackTitle: "Components"`, and a new row in the components home (`apps/example/app/(pages)/index.tsx`) with `status: "shipped"`.
- [ ] `pnpm lint && pnpm typecheck && pnpm test && pnpm --filter ui-kraken build` all green locally.
- [ ] `docs/{COMPONENT}-PLAN.md` created / flipped to `shipped on YYYY-MM-DD in ui-kraken vX.Y.Z`.
- [ ] Changeset added (`pnpm changeset`).
