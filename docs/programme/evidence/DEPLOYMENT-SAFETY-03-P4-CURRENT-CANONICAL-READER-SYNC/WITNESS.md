# DEPLOYMENT-SAFETY-03 · P4 — CURRENT-CANONICAL ZERO-PENDING READER SYNC

**Date:** 2026-09-21
**Status:** PRODUCTION READER SYNC PASS
**Previous reader:** `bcd4debfed1285d2ff14829db7f117ffaff05f11`
**Activated target:** `4c097b4c81402c62e42613e83ae28180fef46f08`

## Preflight

Immediately before activation:

```text
current canonical
4c097b4c81402c62e42613e83ae28180fef46f08

production reader
bcd4debfe

pending canonical migrations
0

production health
running | healthy
```

The canonical delta from `bcd4debf...` to `4c097b4c...` contained:

- one Serving Identity F1 contract document;
- one constitutional matrix;
- one `package.json` matrix-script entry.

There were no runtime source-file changes and no migration delta.

The `package.json` change was exactly:

`matrix:serving-disclosure-f1`

No dependency, version, lockfile or runtime package change was present.

## Initial guarded refusal

The first deploy invocation named exact target `4c097b4c...`, but the production
repository had not yet fetched that commit.

The immutable deploy-context guard refused before mutation:

`does not resolve to a commit ... refusing`

No reader swap or schema change occurred.

The production repository then fetched `origin/clean-main-no-secrets`, resolving
exact target:

`4c097b4c81402c62e42613e83ae28180fef46f08`

and the deploy kernel lock was confirmed free before retry.

## Governed deploy

The retry used:

`./scripts/deploy-production.sh deploy 4c097b4c81402c62e42613e83ae28180fef46f08`

The deploy driver:

1. acquired the deploy lock;
2. materialized an immutable git-archive build context;
3. stamped `GIT_COMMIT=4c097b4c8`;
4. built the production image;
5. verified built-image provenance;
6. found no production-pending migrations;
7. invoked the migration runner before candidate swap;
8. observed:
   `=== No pending migrations (548 already applied, 496 total) ===`;
9. reported:
   `Migrations applied before candidate swap`;
10. swapped containers only after the no-pending runner completed;
11. verified running provenance;
12. ran the complete smoke suite.

Deploy process exit code: **0**.

## Post-deploy provenance

Both runtime provenance channels agree:

```text
container printenv GIT_COMMIT
4c097b4c8

container Config.Env GIT_COMMIT
4c097b4c8
```

Container health:

`running | healthy`

Public production endpoints:

```text
/api/health   200 · health=ok · version=4c097b4c8
/api/ready    200 · ready=true · dbSchema=ready
/api/version  200 · commit=4c097b4c
```

Built-in smoke suite passed:

- `/api/health`
- `/api/version`
- `/api/ready`
- main page
- `/api/build/status` auth lock
- `/api/build/alert` auth lock
- constitutional verification

## Database standing

Post-deploy:

```text
schema_migrations rows
548

pending canonical migration files
0
```

No new migration file was applied by P4.

## Rollback custody

```text
current
sha256:0ced1e8065dae613f2f7ea4e74f15b50461333f54964dd009c33c672271f3fc2

prod
sha256:0ced1e8065dae613f2f7ea4e74f15b50461333f54964dd009c33c672271f3fc2

4c097b4c8
sha256:0ced1e8065dae613f2f7ea4e74f15b50461333f54964dd009c33c672271f3fc2

previous
sha256:b99a4a8ba0da65b782b1ff68372cb47bcb82117879516615343ee16045db7de8

bcd4debfe
sha256:b99a4a8ba0da65b782b1ff68372cb47bcb82117879516615343ee16045db7de8
```

Thus `:previous` is the exact reader replaced by P4.

The kernel deploy lock was free after completion.

## Canonical freshness after activation

After deployment:

```text
current canonical
4c097b4c81402c62e42613e83ae28180fef46f08

production reader
4c097b4c8
```

Production and canonical are synchronized.

## Carried operational findings

P4 does not close the already-known deployment-security findings:

- production host lacks `pnpm`, so dependency audit is skipped by current deploy logic;
- dependency vulnerability output remains non-blocking in the current build contract;
- readiness continues to report session-only, non-persistent memory;
- unset LiveKit variables continue to warn;
- post-deploy alert delivery may fail non-critically.

These remain separate operational lanes.

## P4 standing

```text
current canonical reader sync    PASS
target                            4c097b4c81402c62e42613e83ae28180fef46f08
pending before                    0
pending after                     0
schema mutation                   NONE
runtime provenance                PASS
health/readiness                  PASS
smoke suite                       PASS
rollback previous                 exact prior reader
kernel deploy lock                FREE
canonical/production freshness    SYNCHRONIZED
```

**P4 is CLOSED · CURRENT CANONICAL READER SYNC PASS.**
