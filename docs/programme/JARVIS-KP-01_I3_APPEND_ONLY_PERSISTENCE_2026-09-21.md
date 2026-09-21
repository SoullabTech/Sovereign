# JARVIS-KP-01 · I3 — APPEND-ONLY EPISTEMIC JOIN PERSISTENCE

**Date:** 2026-09-21
**Exact canonical base:** `2eb441edf8577b35b25e63b6e3cc5e8f6aa3738b`
**Status:** IMPLEMENTATION CANDIDATE · FEATURE FLAG DEFAULT-OFF · NO RUNTIME CALL SITE
**Upstream:** ACT 10 → ACT 11 → ACT 12 → ACT 11A → ACT 12A → I1 → canonical I2

> **NO SEMANTIC JOIN WITHOUT A WARRANT.**

## Purpose

I3 gives the canonical I2 evaluator durable custody without granting downstream
representation or behavioural authority. I2 remains the semantic authority:
the persistence adapter re-evaluates each supplied request before it can write.

Persistence lives below the I2 pure-core scan at:

`lib/ain/epistemic-join/persistence/`

The original I2 top-level inventory and purity guard remain unchanged.

## Schema

Migration:

`database/migrations/20260921000001_epistemic_join_persistence.sql`

Dedicated member-scoped tables hold immutable join records, warrant records,
typed reference/reliance rows, standing acts, adoption acts, and append-only
admission records. Every child row carries the member scope.

There is **no mutable current-standing column**. Current admitted standing is
derived by `epistemic_join_current_standing` from the admission with no
successor.
## Concurrency and crash posture

Same-join writers take a transaction-scoped PostgreSQL advisory lock before
observing the current admission tip. A caller must name the exact previous
admission id it believes current. A stale caller fails closed.

Standing chains have one root per subject and one successor per act. Admission
chains have one root per join and one successor per admission. Database
transactions prevent partial custody after failure.

All six persistence tables reject UPDATE and DELETE structurally. Foreign keys
use RESTRICT; the I3 schema introduces no cascading deletion.

## Feature gate

`AIN_EPISTEMIC_JOIN_PERSISTENCE_ENABLED` is ON only for the literal value
`1`. Missing, empty, `0`, and `true` are all OFF. No application/runtime
surface imports the persistence adapter in I3.

## Representation boundary

The admission table has a database CHECK requiring:

- `downstreamRepresentationAuthorized = false`
- `representationAuthority = closed`

I3 supplies no projection module, application reader, prompt integration,
memory integration, graph integration, routing change, provider/model call, or
production deployment.

## Evidence

- I2 + I3 Jest suite: **104/104 PASS**
- I3 static constitutional matrix: **18/18 PASS**
- strict `typecheck:epistemic-join`: **EXIT 0**
- repository typecheck: **229 vs baseline 239 · 0 regressions · EXIT 0**
- blank-database canonical bootstrap with the I3 migration: **PASS**
- disposable PostgreSQL I3 DB witness: **PASS**
- rollback + direct reconstruction: **PASS**
- `git diff --check`: required before candidate freeze
- production/member data: **NONE — synthetic only**

A later repeat of the entire platform blank bootstrap hit host disk exhaustion
(`No space left on device`); it did not expose a schema failure. The committed
DB witness therefore uses a minimal empty PostgreSQL substrate plus `members`
to test I3 itself. The earlier full canonical bootstrap PASS is retained as
separate evidence.

## Disposition

> **I3 PERSISTENCE CANDIDATE — DURABLE CUSTODY PROVEN LOCALLY · DEFAULT OFF · NO REPRESENTATION OR RUNTIME AUTHORITY**

No PR, merge, I4 shadow, feature activation, production read/write, or
deployment is authorized by this candidate.
