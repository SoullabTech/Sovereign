# DEPLOYMENT-SAFETY-03 · P1 — FIRST PRODUCTION ACTIVATION PREFLIGHT

**Date:** 2026-09-21
**Status:** READ-ONLY PRODUCTION PREFLIGHT COMPLETE
**Canonical target:** `8dd6b93bb4faa6a32bb5c54af85dcebe0a0eda14`
**Production mutation:** NONE

## Purpose

Establish the production ground before any runtime activation of the newly
canonical Review Custody / DS-03 deployment law.

P1 performs no deploy, schema write, container restart, image-tag mutation or
production configuration change.

## Exact reader state

Production `maia-sovereign` reports:

```text
GIT_COMMIT = 0319940f9
resolved    = 0319940f9dc94a637e6f1b0e9f843c971f6fb0c2
container   = running | healthy
```

The production reader therefore predates canonical target `8dd6b93b…`.

## Exact pending migration set

Canonical target contains **495** SQL migration files.

Production `schema_migrations` contains **547** distinct ledger filenames.

Set comparison of canonical target migration filenames against the live
production ledger produced:

```text
pending canonical migration files = 0
ledger-only historical names       = 52
```

So there is **no canonical migration file currently awaiting production
application**.

This matters precisely:

> A normal deployment of `8dd6b93b…` will invoke the migration runner in its
> pre-swap position, but it will not execute a pending migration file.

The first activation can therefore witness the new **ordering** with a no-pending
runner path, but it cannot constitute a production witness of a real
compatibility-governed schema transition.

## Newest canonical migration

Newest canonical migration:

`database/migrations/20260921000001_epistemic_join_persistence.sql`

Production ledger row:

```text
filename   20260921000001_epistemic_join_persistence.sql
applied_at 2026-09-21 18:15:23.406637+00
checksum   <empty>
```

All six objects created by that migration are present:

- `epistemic_join_records`
- `epistemic_warrant_records`
- `epistemic_join_dependencies`
- `epistemic_standing_acts`
- `epistemic_adoption_acts`
- `epistemic_join_admissions`

This is an observed production state, not an inference from repository history.

## Production health at witness time

Both in-container and public Caddy-routed probes returned HTTP 200.

```text
/api/health  200 · health=ok · safeMode=false
/api/ready   200 · ready=true
/api/version 200 · version=1.2.0 · commit=0319940f
```

Readiness dependencies reported:

- database schema ready;
- Ollama ready;
- no critical dependency failures;
- warning: memory provider is session-only / non-persistent.

The session-only memory warning is recorded as existing runtime state; P1 does not
adjudicate or repair it.

## P1 disposition

```text
canonical target            8dd6b93bb4faa6a32bb5c54af85dcebe0a0eda14
running production reader   0319940f9dc94a637e6f1b0e9f843c971f6fb0c2
production health           HEALTHY / READY
canonical migration files   495
production ledger rows      547
pending canonical files     0
real schema transition      NONE pending
production mutation by P1   NONE
```

**P1 is complete.**

The next production act, if authorized, is a reader activation of canonical
`8dd6b93b…` with a pre-swap migration-runner no-pending witness. It must not be
described as the first live proof of compatibility-gated migration because no
migration file is pending.
