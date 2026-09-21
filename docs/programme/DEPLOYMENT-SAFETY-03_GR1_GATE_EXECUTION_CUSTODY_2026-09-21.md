# DEPLOYMENT-SAFETY-03 · GR1 — MIGRATION GATE EXECUTION CUSTODY

**Date:** 2026-09-21
**Status:** REPAIR CANDIDATE · PRODUCTION SCHEMA UNTOUCHED
**Exact base:** `47aa54dac2470ab33c307629c645b94c0c0dbfdb`

## Production stop that opened GR1

Current canonical introduced one genuinely pending migration:

`database/migrations/20260921000002_epistemic_join_integration_shadow.sql`

The exact pending migration was independently reviewed under Review Custody and
the second strict review produced:

```text
migration verdict       APPROVED
old-reader compatibility COMPATIBLE
failure-prefix verdict  ALL_PREFIXES_COMPATIBLE
review SHA-256          7e39caafdc9da6e683bde03de1bb3c95d5b18680fb04cb1fc253565d9938c54a
trace SHA-256           dcec899ff08f90d3bbec46b856cb1ce4ddca0208f76bcce8ca911629175d29c9
coverage                12 physically witnessed files
```

The composed migration gate passed on the Mac Studio against exact target
`47aa54da…` and live old reader `8dd6b93b…`.

Production then stopped before schema mutation because the production checkout has
no `node_modules/.bin/tsx`.

That refusal was truthful and fail-closed. No migration file was applied.

## Substrate census

The production host has:

```text
node              present
npm               present
host node_modules absent
host tsx          absent
```

The deployed sovereign image contains the TypeScript execution substrate but did
**not** contain Git:

```text
/app/node_modules/.bin/tsx                    PRESENT
/app/scripts/review-custody-migration-gate.ts PRESENT
node                                           PRESENT
git                                            ABSENT
```

A real, non-mutating container mechanism witness therefore refused:

`REFUSED [GIT_UNREADABLE] — git rev-parse ... failed: spawnSync git ENOENT`

This falsified the first GR1 candidate before merge. GR1 now also installs `git`
in the sovereign runner stage, because immutable Git-object recomputation is part
of the gate's custody contract.

Installing a mutable host dependency tree merely to execute a gate would weaken
deployment custody. GR1 therefore uses the already-built, immutable target image
as the fallback execution substrate and requires that image to carry Git.

## GR1 law

The direct host path is preserved whenever
`$PROJECT_DIR/node_modules/.bin/tsx` exists.

If host tsx is absent, the fallback is available only when:

1. `MAIA_BUILD_CONTEXT` exists, proving this is the immutable deploy/update lane;
2. `maia-sovereign:prod` re-verifies as the exact target commit;
3. record, review and trace are regular files;
4. repository and all three evidence files are mounted into the gate container
   read-only;
5. the gate executes using the target image's own `tsx` and gate source;
6. the exact target SHA, old-reader SHA and complete ordered pending set cross
   into the containerized gate.

The repository bind is explicitly admitted to Git with:

`safe.directory=/repo`

only for read-only git-object inspection.

Migration-only does not have an immutable build context and cannot use the image
fallback. If host tsx is absent, migration-only remains refused.

## Falsifier

`scripts/verify-review-custody-gate-runtime.sh` proves:

```text
13 passed · 0 failed
```

including:

- target runtime image carries Git for immutable object verification;
- verified target image + host tsx absent → gate may execute;
- target-image provenance is re-witnessed;
- target-image tsx and target-image gate source are used;
- repository and evidence mounts are read-only;
- exact target, old reader and pending set are forwarded;
- git read custody is explicit;
- unverified target image refuses before container execution;
- containerized gate failure refuses;
- no immutable build context refuses;
- migration-only refusal is explicit;
- missing evidence refuses before bind mount.

The pre-existing migration-binding suite remains:

`9 passed · 0 failed`

## Neighbor standing

After GR1:

- Review Custody frozen bytes: **INTACT**
- Review Custody law: **14/14**
- coverage witness: **8/8**
- migration compatibility: **10/10**
- compatibility composition: **6/6**
- failure-prefix compatibility: **5/5**
- Step 3 ordering: **PASS**
- immediate relation witness: **10/0**
- migration fail-closed: **11/0**
- deploy provenance: **27/0**
- deploy lock: **25/0**
- exact bundle provenance: **PASS**
- composed E2E: **PASS**
- relevant typechecks: **PASS**

## Non-authorizations

GR1 does not:

- change Review Custody law;
- change migration compatibility law;
- change any migration;
- change migration ordering;
- authorize migration-only image fallback;
- install host dependencies;
- waive exact-image provenance;
- apply the pending production migration;
- deploy a reader;
- repair or waive the separately observed dependency-audit gap.

Production remains healthy on reader `8dd6b93bb`, with the I4 migration still
pending.
