# DEPLOYMENT-SAFETY-03 / STEP 3 — Compatibility-Gated Migrate-Before-Swap

**Date:** 2026-09-21  
**Authorized parent:** `d75e304711e12174dfe2d7e80f26c7a5e1ad2f5f`  
**Branch:** `feature/deployment-safety-03-step3-migrate-before-swap-20260921`

## Founder-authorized objective

Reorder normal `deploy` and `update` only after the composed Review Custody +
migration-compatibility gate passes:

```text
build candidate
→ verify candidate image identity
→ exact review + compatibility gate
→ re-witness exact old reader
→ run migrations while old reader remains live
→ migration success only
→ tag rollback images
→ swap candidate reader
→ verify candidate reader identity
→ smoke / constitutional checks
```

Migration failure must prevent the candidate reader swap.

## Implementation

`scripts/deploy-production.sh` now:

- preserves the Step 2B composed gate unchanged;
- records the exact old-reader commit only when pending migrations exist and
  the composed gate applies;
- immediately before migration, reads the live container's `GIT_COMMIT`,
  resolves it to a repository commit, and requires exact equality with the
  compatibility-bound old reader;
- runs migrations before `tag_images_for_rollback` and before
  `deploy_ctx_compose up -d` on both normal `deploy` and `update`;
- exits on migration failure before any candidate reader swap;
- states that a failed migration may leave a partially migrated schema and
  does not claim that interrupted prefixes are compatibility-proven;
- leaves the standalone `migrate` command's ordering unchanged.

## Structural witness

`tests/constitutional/migration-compatibility-gate/step3-ordering.ts` pins:

1. `deploy`: gate → old-reader re-witness → migrate → tag → swap → reader verify;
2. `update`: gate → old-reader re-witness → migrate → tag → swap → reader verify;
3. exact live-reader equality against the compatibility-bound commit;
4. migration failure text admits partial-schema risk;
5. the migration-only command is not broadened by Step 3.

## What this establishes

- normal deploy/update cannot swap the candidate reader before a successful migration;
- compatibility admission cannot be reused after the old reader changes;
- migration failure prevents candidate reader activation;
- reader rollback remains available after a later post-swap provenance failure.

## What this does **not** establish

- no production deployment has been run;
- no production database has been read or written;
- no migration has been executed against production;
- no interrupted migration prefix is asserted to be old-reader compatible;
- no branch has been merged under this act;
- no deployment authorization follows from this implementation candidate.

**Standing:** IMPLEMENTATION CANDIDATE · NO PRODUCTION MUTATION · NO MERGE
