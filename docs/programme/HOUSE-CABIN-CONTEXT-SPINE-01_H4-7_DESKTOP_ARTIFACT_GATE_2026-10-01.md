# HOUSE-CABIN-CONTEXT-SPINE-01 · H4.7 — Desktop Artifact Gate

## Boundary

H4.6 established controlled-cohort readiness. H4.7 is the distribution membrane:
produce one exact MAIA Desktop artifact carrying the canonical Cabin runtime,
prove its identity, then satisfy the existing macOS external-distribution gates.

This unit does not authorize an external tester cohort. It records the exact
blocking conditions encountered while preparing that artifact.

## Source authority

Canonical source at this witness:

`2e657fa0dd6261584dd77463ced7782d80906d7d`

PR #1605 merged the Cabin context spine into canonical. Its complete CI gate
set passed: build, TypeScript no-regression, sovereignty, diagrams, Covenant,
Axis 1, Empty database reconstruction, JARVIS falsifiers, and GitGuardian.

## Distribution prerequisites

The governing Desktop beta contract requires:

- Developer ID Application signing;
- hardened signed artifact;
- notarization and stapling;
- untouched artifact accepted by Gatekeeper on a clean second Mac;
- named update channel;
- named rollback owner;
- tester consent, feedback route, and incident contact.

Current founder Mac witness:

- Developer ID Application identity: **not present** (0 identities found);
- Apple Development identity: present, but insufficient for external beta
  distribution;
- `notarytool` available;
- expected `MAIA-BETA` keychain profile: **not present**.

Therefore external distribution remains closed.

## Local artifact build witness

The build was moved to the external T7 Shield volume because the internal
Data volume has only approximately 6 GiB free and is not suitable for the
large Next standalone build.

A clean detached worktree was created from canonical on T7 Shield.
Dependencies were installed with `npm ci` there.

The local Next build compiled successfully under Next 16.3.6, but failed during
page-data collection with:

`PageNotFoundError: Cannot find module for page: /_document`

The repository does contain `pages/_document.js`. The failure occurred after
successful compilation and before a usable `.next/standalone/server.js` was
produced.

No source repair was made in response to this local build discrepancy.

The canonical CI build is authoritative for source-level convergence and was
already witnessed green on PR #1605. The packaged artifact, however, cannot be
claimed from a CI green source build alone; the final byte-level distribution
rung remains open until the exact artifact is produced and verified.

## Negative controls / non-claims

- No Developer ID certificate was fabricated or substituted.
- Apple Development signing is not treated as Developer ID distribution.
- No notarization profile was invented.
- No unsigned local DMG is being called an external beta artifact.
- No clean-second-Mac acceptance is claimed.
- No tester identity is attached to the release.
- No production deployment was made.
- Public `/cabin` remains 404.

## Standing

**H4.7 ARTIFACT GATE OPEN · SOURCE CONVERGENCE CLOSED · DISTRIBUTION NOT YET
ADMITTED.**

Next executable acts are infrastructure-only:

1. resolve the canonical Desktop build/artifact reproduction on the external
   build volume;
2. obtain/verify Developer ID Application signing capability;
3. establish the notarization credential;
4. produce and digest the exact artifact;
5. perform the clean second-Mac Gatekeeper witness;
6. only then authorize the named small tester cohort.

No broader product or Cabin architecture should be opened to accomplish these
acts.
