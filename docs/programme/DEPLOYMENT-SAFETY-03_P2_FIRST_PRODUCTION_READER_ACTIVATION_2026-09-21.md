# DEPLOYMENT-SAFETY-03 · P2 — FIRST PRODUCTION READER ACTIVATION · ZERO-PENDING PATH

**Date:** 2026-09-21
**Status:** PRODUCTION ACTIVATION PASS · ZERO-PENDING ORDERING WITNESSED
**P1 evidence:** `ca4cd640e689844d52dd94c0511b13da2cd4508a`
**Activated target:** `8dd6b93bb4faa6a32bb5c54af85dcebe0a0eda14`
**Previous production reader:** `0319940f9dc94a637e6f1b0e9f843c971f6fb0c2`

## Authorization boundary carried

P2 authorized reader activation only while the canonical pending migration set
remained exactly zero.

Immediately before mutation, the production ground was re-witnessed:

```text
canonical target           8dd6b93bb4faa6a32bb5c54af85dcebe0a0eda14
running reader             0319940f9dc94a637e6f1b0e9f843c971f6fb0c2
app container              running | healthy
postgres container         running | healthy
/api/health                200
/api/ready                 200
/api/version               200 · commit 0319940f
canonical migration files  495
production ledger rows     547
pending canonical files    0
```

Because pending remained zero, P2 proceeded through the normal canonical
`deploy <SHA>` path. No Review Custody / compatibility waiver was taken.

## Pre-deploy custody

The production checkout contained no tracked modifications. Historical untracked
backup/operator files were present and left untouched.

Before the deploy:

```text
running container image
  sha256:1db4d66e6b1e531cdfa2dc58149cae1b3f6a240163057dc30f12eaa07eecbb06

maia-sovereign:current
  sha256:1db4d66e6b1e531cdfa2dc58149cae1b3f6a240163057dc30f12eaa07eecbb06

maia-sovereign:previous
  sha256:5157209cb3f077d1958af0eeccaadb940b340f52b0c330e1b890a833435e1f62

schema_migrations rows
  547

schema_migrations filename-set SHA-256
  5ec60809ad88153f60fd5bb871df87e43a6f933e1b1430ed793f9288e6766b7f

latest applied migration
  20260921000001_epistemic_join_persistence.sql
  2026-09-21 18:15:23.406637+00
```

The production repository was then detached at exact target `8dd6b93b…` so
the deploy driver itself was the newly canonical DS-03 implementation.

Deploy command:

`./scripts/deploy-production.sh deploy 8dd6b93bb4faa6a32bb5c54af85dcebe0a0eda14`

## Live ordering witness

The deploy lock was acquired and the target was materialized from an immutable
git archive.

Built-image provenance passed:

```text
maia-sovereign:prod GIT_COMMIT=8dd6b93bb
asserted target              =8dd6b93bb
```

The decisive first production DS-03 ordering observation was:

```text
=== SQL migrations ===
NOTICE: relation "schema_migrations" already exists, skipping
=== No pending migrations (547 already applied, 495 total) ===
[OK] Migrations applied before candidate swap
```

Only **after** that runner result did rollback tagging begin.

The observable order was therefore:

```text
build exact target
→ verify built-image provenance
→ pre-swap migration runner
→ NO PENDING
→ rollback-tag transition
→ candidate container swap
→ verify exact running target
```

This is a production witness of the new migrate-before-swap **ordering** on the
zero-pending path.

It is **not** a production witness of a real compatibility-governed schema
transition. No migration file was pending, so the Review Custody / old-reader
compatibility branch was not spent on a schema mutation.

## Rollback custody

After the no-pending migration runner completed successfully:

```text
maia-sovereign:current
  sha256:dfd6f221821eef6e8d533f3caf4dc318a998543c1dc972c19817475bd81c6db4

maia-sovereign:prod
  sha256:dfd6f221821eef6e8d533f3caf4dc318a998543c1dc972c19817475bd81c6db4

maia-sovereign:8dd6b93bb
  sha256:dfd6f221821eef6e8d533f3caf4dc318a998543c1dc972c19817475bd81c6db4

maia-sovereign:previous
  sha256:1db4d66e6b1e531cdfa2dc58149cae1b3f6a240163057dc30f12eaa07eecbb06
```

Thus `:previous` points to the reader that was live immediately before P2.

Retention pruned two older SHA tags. The script also reported a non-blocking
failure to remove `maia-sovereign:staging` because it appeared to be in use.
No broad image prune was performed.

## Post-swap provenance and health

Both independent runtime provenance channels agree:

```text
container printenv GIT_COMMIT   8dd6b93bb
container Config.Env GIT_COMMIT 8dd6b93bb
asserted deployment target      8dd6b93bb
```

New production container:

`b017eaf4d46c9275c7a35251ad75a8df14ba304a35046c61797900b04d1060a8`

Production state:

```text
maia-sovereign   running | healthy
/api/health      200 · health=ok · version=8dd6b93bb · safeMode=false
/api/ready       200 · ready=true · dbSchema=ready · Ollama=ready
/api/version     200 · version=1.2.0 · commit=8dd6b93b
```

The built-in post-deploy smoke suite also passed:

- `/api/health`
- `/api/version`
- `/api/ready`
- main page
- `/api/build/status` authentication lock
- `/api/build/alert` authentication lock
- constitutional verification

Deploy process exit code: **0**.

## Database non-mutation witness

Post-deploy ledger state is identical to the pre-deploy filename population:

```text
pre rows      547
post rows     547

pre filename-set SHA-256
5ec60809ad88153f60fd5bb871df87e43a6f933e1b1430ed793f9288e6766b7f

post filename-set SHA-256
5ec60809ad88153f60fd5bb871df87e43a6f933e1b1430ed793f9288e6766b7f

latest filename
20260921000001_epistemic_join_persistence.sql

latest applied_at
2026-09-21 18:15:23.406637+00

post-deploy pending canonical files
0
```

Therefore P2 added **no migration filename** to the production ledger and the
canonical pending set remained zero.

The persistent `.deploy.lock` file is a durable operation record, not a held
kernel lock. After completion, a non-blocking `flock` acquisition succeeded:

`DEPLOY_FLOCK=FREE`

## Operational observations routed out of P2

These observations occurred during the activation and are recorded without
silently treating them as P2 failures or repairs:

1. The production host has no `pnpm`, so the deploy script's dependency-security
   audit printed **"pnpm not found — skipping dependency audit"**. No
   `SKIP_AUDIT` override was supplied.
2. An image-build `npm ci` reported **92 package vulnerabilities**
   (9 low, 41 moderate, 33 high, 9 critical). The current build path does not make
   that report a deploy refusal.
3. Next build warned that `@capacitor-community/contacts` could not be resolved
   from `DeviceContactsService.ts`, but the production build completed.
4. The internal-import checker reported 44 unresolved aliases as warn-only.
5. Next.js reported an `@next/swc` 15.5.7 / Next.js 15.5.11 version mismatch.
6. A build-time static-page telemetry query attempted
   `127.0.0.1:5432` and received `ECONNREFUSED`; the build continued.
7. The build verifier reported external `openai` dependencies as a warning,
   not a blocking finding.
8. Compose reported unset `LIVEKIT_API_KEY` / `LIVEKIT_API_SECRET` warnings.
9. Readiness continues to warn that memory is session-only / non-persistent.
10. Post-deploy alert delivery failed and was explicitly classified non-critical
    by the deploy script.

These are **separate operational findings**. P2 does not adjudicate or repair
them.

## P2 standing

```text
target reader activated         8dd6b93bb4faa6a32bb5c54af85dcebe0a0eda14
old reader replaced             0319940f9dc94a637e6f1b0e9f843c971f6fb0c2
pre-swap migration ordering     WITNESSED IN PRODUCTION
pending migration files         0 before · 0 after
schema migration adoption       NONE
ledger filename population      UNCHANGED
rollback previous reader        PRESERVED
running provenance              PASS · two channels
production health/readiness     PASS
built-in smoke suite            PASS
deploy exit                     0
deploy kernel lock after exit   FREE
real compatibility migration    NOT YET WITNESSED
```

**P2 is complete.**

The first live compatibility-governed schema transition remains intentionally
unspent. It should occur only when a genuine pending migration naturally exists;
no migration should be manufactured merely to obtain that witness.
