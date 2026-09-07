# MIGRATION WITNESS DOCTRINE

**Ratified** 2026-09-08 (founder). **Scope: project-wide, not Circle-specific.**

Learned in `JARVIS-CIRCLES-01` / I0.5, but **these are not Circle rules** — they apply to every lane
that authors a migration. Recorded here rather than only in the Circle rulings file so the next lane
finds them.

---

## Rule 1 · The dual-witness rule

> **A migration must be verified both against an upgrade-shaped database and against the canonical
> empty-bootstrap executor path. Neither witness subsumes the other.**

| witness | what it exercises | what it CANNOT see |
|---|---|---|
| **upgrade-shaped** — restore a production dump, apply the migration on top | behaviour against real data and real prior state | **bootstrap defects**: the ledger table already exists with rows, so double-writes, ordering assumptions and create-vs-alter confusions are absorbed silently |
| **empty-bootstrap** — reconstruct from nothing via the canonical runner | that the migration set actually *builds a database* | behaviour against real data |

⛔ Passing one is not evidence for the other. A migration that has only ever run on a restored dump
**has not been shown to be part of a working schema**.

## Rule 2 · The reconcile rule

> **A reconcile checks migration + executor + ledger semantics — not merely migration-file
> commutation.**

Asking *"did the base add migrations?"* and *"does the base touch my files?"* is **necessary and
insufficient**. Also ask:

- has the thing that **RUNS** migrations changed hands or changed contract?
- does the runner **already do** what this migration does — ledger insertion, checksum, ordering?
- who owns `schema_migrations` writes: the runner, the migration, or (the defect) **both**?

> ⭐ **A migration and its runner are not independent artifacts.**

---

## The case that produced these rules

Three Circle migrations each ended with:

```sql
INSERT INTO schema_migrations (filename, applied_at)
VALUES ('…sql', NOW()) ON CONFLICT (filename) DO NOTHING;
```

while `scripts/run-sql-migrations.sh` **already owned** ledger insertion.

> ⚠️ **CORRECTION (2026-09-08, I0.5 production closure).** An earlier form of this sentence read
> *"ledger insertion **and checksum**"*. **That was wrong.** The runner creates the `checksum`
> column (`ALTER TABLE schema_migrations ADD COLUMN IF NOT EXISTS checksum TEXT` — commented
> *"for future compatibility"*) but its recording statement is
> `INSERT INTO schema_migrations (filename) VALUES ('$filename') ON CONFLICT (filename) DO NOTHING;`
> — **filename only. No checksum is ever computed or stored.** The repair itself stands
> (migrations must not self-register); only its stated justification over-claimed.
>
> ⭐ **Consequence for any witness contract:** a production-side ledger check may require
> **filename rows exactly once**, and must NOT require checksums — the canonical executor cannot
> supply them. A contract demanding a checksum pass would be unsatisfiable, and would push a
> future lane toward either faking it or being blocked by its own instrument.
>
> ⚠️ *This is the doctrine's own lesson recurring against itself: **the doctrine described a
> ledger its executor does not produce.** A migration and its runner are not independent
> artifacts — and neither are a witness contract and the runner it audits.*
>
> **Populating checksums is deploy-tooling debt, not a failed migration.** ⛔ Not opened as a lane.

- ⚠️ **The runner did not change during the reconcile window.** `git diff 39daacae5 e535e6246` touches
  no runner file. **The double-write was latent from authorship** — not introduced by base drift.
- It **survived three separate `63/63` witness passes**, because every one of them restored a
  production schema dump: `schema_migrations` already existed with rows, and `ON CONFLICT DO NOTHING`
  absorbed the redundant write in silence.
- It failed the first time an **empty database** was reconstructed — which is the only path that
  exercises the bootstrap.

Repaired in `321cb1536` by deleting the twelve redundant ledger-write lines and letting the canonical
runner own them. Merged as `891b33ee0`.

> **The witness was not unlucky. It had a blind spot, and the blind spot had a name.**

---

## Promotion — AUTHORIZED, TIMING HELD

```
GLOBAL PROMOTION TO CLAUDE.md     AUTHORIZED (founder, 2026-09-08)

TIMING                            after the cohort witness releases
                                  AND I0.5 production closure

UNTIL THEN                        this file is the authoritative cited doctrine

CURRENT CANONICAL                 891b33ee0 remains UNTOUCHED
```

⭐ **Why the timing hold, and it is not caution for its own sake.** Canonical currently holds a clean,
**already-qualified release target** — `891b33ee0`. Moving canonical now for a documentation promotion
would change the SHA the next full deployment should target, turning

```
verified release → deploy 891b33ee0
```

into

```
verified release → canonical moves for unrelated docs → new deploy target → provenance explanation
```

⛔ **Nothing is gained by introducing that churn while another production witness already owns the
deploy lane.** The lesson becomes global **and** the qualified artifact stops moving underneath us.

⚠️ **Recording this ruling does not move canonical.** It lands on the doctrine lane
(`claude/jarvis-circles-programme-reouzc`), which is not canonical and is not the release path.

### The promotion text, pinned verbatim

So the future act is a paste, not a re-drafting:

> **Migration witness law:** A migration must be verified both against an upgrade-shaped database and
> through canonical empty-database reconstruction. Neither witness substitutes for the other.
>
> **Migration reconcile law:** Reconciliation must inspect the migration and its executor/ledger
> semantics; checking only migration/data deltas is insufficient.
>
> Canon and rationale: `docs/ops/MIGRATION_WITNESS_DOCTRINE.md`.
