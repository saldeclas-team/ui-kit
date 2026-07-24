# ui-kraken

[![npm version](https://img.shields.io/npm/v/ui-kraken?color=cb3837&logo=npm)](https://www.npmjs.com/package/ui-kraken)
[![CI](https://github.com/saldeclas-team/ui-kit/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/saldeclas-team/ui-kit/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/saldeclas-team/ui-kit/branch/main/graph/badge.svg?flag=ui-kraken)](https://codecov.io/gh/saldeclas-team/ui-kit)
[![Chromatic](https://img.shields.io/badge/Chromatic-visual%20tests-ff4785?logo=storybook&logoColor=white)](https://www.chromatic.com/library?appId=6a63d07d1946f494a4c93ad3)
[![license: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)

React Native / Expo component library built with [Tamagui](https://tamagui.dev/).

> Status: **pre-alpha** — the `0.1.0` release is the scaffold with no components yet. See [`docs/PLAN.md`](./docs/PLAN.md) for roadmap and open decisions.

## Install

```bash
npm install ui-kraken tamagui react-native-reanimated
# or
pnpm add ui-kraken tamagui react-native-reanimated
```

## Monorepo layout

```
ui-kit/
├── packages/
│   └── ui-kraken/       # The library published to npm
└── apps/
    └── example/         # Expo app that showcases the library and hosts Storybook
```

## Requirements

- Node.js >= 20 (use `nvm use` — see `.nvmrc`)
- pnpm (auto-provisioned via `corepack enable pnpm`)
- iOS simulator (Xcode) and/or Android emulator (Android Studio)

## Quick start

```bash
corepack enable pnpm
pnpm install
pnpm --filter @ui-kraken/example start                                 # run the example app
pnpm --filter @ui-kraken/example storybook:ios                         # run Storybook on-device
```

## Contributing

See [`CONTRIBUTING.md`](./CONTRIBUTING.md).

## License

MIT © saldeclas-team
