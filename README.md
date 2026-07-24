# ui-kraken

React Native / Expo component library built with [Tamagui](https://tamagui.dev/).

> Status: **pre-alpha** — actively scaffolding. See [`docs/PLAN.md`](./docs/PLAN.md) for roadmap and open decisions.

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
pnpm --filter example start        # run the example app
STORYBOOK_ENABLED=true pnpm --filter example start   # run Storybook on-device
```

## Contributing

See [`CONTRIBUTING.md`](./CONTRIBUTING.md).

## License

MIT © saldeclas-team
