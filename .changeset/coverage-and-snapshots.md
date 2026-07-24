---
---

test(coverage,snapshots): wire Codecov + add 66 structural snapshot tests

No user-facing API change — the `ui-kraken` package version is not bumped. This PR adds test / CI infrastructure only: `packages/ui-kraken/coverage/` files, `__snapshots__/` folders, `codecov.yml`, and a Codecov action step in CI. Consumers of the published `ui-kraken` package see nothing different.
