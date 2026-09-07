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

while `scripts/run-sql-migrations.sh` **already owned** ledger insertion and checksum.

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

## Promotion note

⛔ These rules are **not yet in `CLAUDE.md`'s "Before Making Changes"** section. Promoting them into the
project invariants is a **founder act**, since that section is global. Until then this file is the
authoritative statement and lanes should cite it.
