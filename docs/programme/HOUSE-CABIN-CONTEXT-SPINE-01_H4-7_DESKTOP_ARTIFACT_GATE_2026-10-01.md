# HOUSE-CABIN-CONTEXT-SPINE-01 · H4.7 — Desktop Artifact Gate

## Exact candidate

Canonical Cabin convergence is merged at:

- merge commit: `4e4d8ed154a58cbc5443bbddae9bb4080d37441e`
- PR: #1605
- merged head: `d6546325ca30a42270c777543c8b91c82c97cfa0`

## Evidence

- Full MAIA Desktop test suite at the canonical tree: **165/165 PASS**.
- Canonical GitHub build check: **PASS**.
- H4.2–H4.5 Cabin runtime witnesses: complete.
- Desktop builder is configured for arm64 DMG/ZIP, hardened runtime, build-SHA stamping, and staged Cabin runtime.
- Package verifier checks bundle identity, version, arm64, build SHA, codesign, Developer ID, and Gatekeeper.

## Current blockers

The Mac has Apple Development and iPhone Distribution identities, but **no Developer ID Application identity**.

Therefore:

- external Developer ID signing: BLOCKED;
- notarization: BLOCKED;
- stapling: BLOCKED;
- clean second-Mac Gatekeeper acceptance: PENDING.

I also attempted the exact canonical offline root build with
`MAIA_CABIN_MODE=offline npm run build`. Pre-build verification passed and
Next.js entered webpack production compilation. The Mac reached severe swap
pressure (about 14.2 GB of 14.3 GB in use), so the build was stopped before
machine exhaustion. This is a local resource limitation, not evidence of a
source/build failure; the canonical CI build has already passed.

## Release membrane

Still required before a named external cohort:

1. Developer ID Application signing;
2. notarization and stapling;
3. untouched artifact accepted by Gatekeeper on a clean second Mac;
4. named update channel;
5. named rollback owner;
6. explicit tester cohort;
7. tester consent, feedback route, and incident contact.

No public `/cabin` route is authorized.

## Standing

**H4.7 ARTIFACT GATE CENSUS COMPLETE · CABIN IMPLEMENTATION GREEN · EXTERNAL
DISTRIBUTION BLOCKED AT THE DESKTOP SIGNING / CLEAN-DEVICE RELEASE MEMBRANE.**

No further Cabin semantic architecture is required before this gate is solved.
