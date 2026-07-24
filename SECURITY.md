# Security Policy

Thanks for helping keep `ui-kraken` and its users safe. This document explains how to report security vulnerabilities responsibly and what to expect after you do.

## Reporting a vulnerability

**Do NOT open a public GitHub issue for security vulnerabilities.** Public disclosure before a fix is available puts every consumer of `ui-kraken` at risk.

**Preferred channel — GitHub Security Advisories (private):**

Open a private advisory at <https://github.com/saldeclas-team/ui-kit/security/advisories/new>. This creates a draft ticket only visible to the maintainer + you, where we can collaborate on assessment, fix, and coordinated disclosure. GitHub tracks the timeline, links the eventual patch commit, and can issue a CVE if applicable.

**Alternative — email:**

If you don't use GitHub or prefer email, send report to **`yilmar0309@gmail.com`**. Please include "SECURITY" in the subject line. Encrypted email is welcome but not required — email us and we'll set up a channel.

**When reporting, please include:**

- A description of the vulnerability and its potential impact
- Steps to reproduce (a minimal example or Expo Snack helps a lot)
- The `ui-kraken` version(s) affected
- The platform(s) where you observed the issue (iOS / Android / Web)
- Any suggested mitigation or patch, if you have one

## Supported versions

`ui-kraken` is pre-1.0. Security fixes land on the **latest minor version only**. Once we ship 1.0, this table will be extended to cover a longer support window.

| Version | Supported                               |
| ------- | --------------------------------------- |
| `0.5.x` | ✅ Security fixes and general bug fixes |
| `< 0.5` | ❌ Please upgrade                       |

## Response timeline

Realistic commitments from a solo maintainer:

- **Acknowledge receipt** within 3 business days
- **Initial assessment** (severity, scope, reproduction confirmed) within 7 business days
- **Fix or mitigation** timeline depends on severity:
  - Critical (arbitrary code execution, data exfiltration): target 7 days
  - High (auth bypass, denial-of-service against a consuming app): target 30 days
  - Medium / Low: target next scheduled release
- **Public disclosure** happens only AFTER a fix is available, OR after a **90-day grace period** from initial report (industry standard) — whichever comes first. We coordinate the disclosure date with you.

If a scheduled response is going to slip, we'll email you a status update before the deadline passes.

## Scope

**In scope** (please report):

- Vulnerabilities in `ui-kraken` library code that consumers ship to their users (XSS on web target, prototype pollution, injection via component props, etc.)
- Dependency vulnerabilities in packages that `ui-kraken` directly requires (`peerDependencies` + `dependencies`), when the vulnerability is exploitable through `ui-kraken`'s API
- Security-relevant behavior of the OIDC publish flow or the Chromatic pipeline (e.g. secret leakage in CI logs)

**Out of scope** (please don't report as security):

- Vulnerabilities in `apps/example` — the example / showcase app that is NOT published to npm and is not a consumer-facing artifact
- Theoretical DoS via extremely large / malformed props on components (JS runtime will drop it; not a vulnerability class)
- Issues in upstream dependencies (`expo-router`, `tamagui`, `react-native`, etc.) that are NOT exploitable through `ui-kraken`'s API — please report those directly to the upstream project

If you're unsure whether something is in scope, err on the side of reporting it — we'd rather triage a false positive than miss a real issue.

## Credit

Reporters are credited in:

- The published GitHub Security Advisory
- The release notes / `CHANGELOG.md` entry for the fix
- The commit message of the patch (as `Reported-by:`)

If you'd prefer to stay anonymous, tell us in the initial report and we'll omit your name from every artifact.

## Not a bug bounty

`ui-kraken` does not run a paid bug bounty program. We deeply appreciate the time researchers spend making the ecosystem safer, but we cannot pay rewards. Public credit (above) is the only compensation we offer.
