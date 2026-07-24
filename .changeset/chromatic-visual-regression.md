---
---

test(chromatic): visual regression testing on Storybook Web

CI + config only, no user-facing API change. `ui-kraken` package version is not bumped. Adds a parallel Storybook Web build (`apps/example/.storybook/` alongside the existing on-device `.rnstorybook/`), a `chromatic.yml` workflow that publishes to Chromatic on every PR + push to main, and doc updates codifying the visual regression convention.
