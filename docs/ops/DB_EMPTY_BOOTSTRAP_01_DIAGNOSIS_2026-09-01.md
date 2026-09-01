# DB-EMPTY-BOOTSTRAP-01 — Empty Database Reconstruction Diagnosis

Diagnosis lane. No repair authorized. Branch `chore/db-empty-bootstrap-01-diagnosis`
forked from trunk `8b31d931c` (which does not contain `58ac95a77`).

Provenance: `c9a850269` — `.witness/DB-EMPTY-BOOTSTRAP-01.md`,
`.witness/db_empty_bootstrap_01_migrate.log`.

---

## 1. Earliest recovered origin of `developmental_memories`

`c388b97c5` (2025-12-24) "feat(memory): Revolutionary consciousness memory system".

**The DDL lives only in a Markdown file** — `CONSCIOUSNESS_MEMORY_SYSTEM_COMPLETE.md`
— never in a `.sql` migration. Pickaxe across all refs finds no other
`CREATE TABLE developmental_memories` in repository history, and no runtime DDL
in `lib/`, `scripts/`, or `app/`. Its documented sibling `lattice_nodes` has the
same status and does not exist in production at all.

Recovery status: **PARTIAL** — a documented genesis shape exists, but it is prose,
never an applied artifact, and it is not the current shape.

## 2. Current-schema comparison

| | documented 2025-12-24 | current |
|---|---|---|
| `id` | `TEXT` PK | `uuid DEFAULT gen_random_uuid()` |
| `memory_type` | nullable, CHECK 7 values | `NOT NULL`, CHECK 8 (`+emergent_pattern`) |
| `trigger_event` | `JSONB NOT NULL` | `jsonb` nullable |
| `significance` | `REAL` CHECK 0..1 | `numeric DEFAULT 0.5 NOT NULL`, no range check |
| `vector_embedding` | `REAL[]` | `public.vector(1536)` (pgvector) |
| `created_at` | present | **absent** — replaced by `formed_at timestamptz` |
| added since | — | `content_text`, `recall_count`, `last_recalled_at`, `source_consciousness_entry_id`, `visibility`, `share_scope`, `confirmed_by_user`, `last_confirmed_at`, `valid_from`, `valid_to` |

Read from the schema-only clone; `maia_consciousness` was not modified.

Part of that evolution **is** in `database/migrations/` (visibility/share_scope,
memory_type drift repair, content_text). The repository therefore carries the
**evolution** of this table but not its **genesis**.

## 3. Census of missing prerequisites

Instrument: diagnostic replay probe — each migration applied in runner order
(lexicographic glob) with `--single-transaction`, continuing past failures to
enumerate all blockers. **This is not the canonical runner**, which uses
`ON_ERROR_STOP on` under one advisory lock and aborts entirely at the first
failure. `schema_migrations` pre-created to match runner behaviour (without it,
8 additional failures are probe artifacts, not defects).

```text
456 migrations   424 applied   32 FAILED
```

**Class A — never created anywhere in the repository (root):**

```text
developmental_memories      exists in production
integration_passes          exists in production   (Corpus Callosum substrate)
studio_people               exists in production   (Co-Lab)
studio_meetings             exists in production
manuscript_draft_sections   exists in production   (Writer's Studio)
lattice_nodes               ABSENT in production too — dead reference
```

Four of these five have **no DDL anywhere in the repo** — not migrations, not
scripts, not docs. Only `developmental_memories` has the Markdown DDL.

**Class B — created, but ordered after first use (ordering defects):**
`agent_runs`, `comms_messages`, `comms_threads`, `lead_magnets`, `maia_sessions`,
and intra-file cases `maia_misattunements`, `v_rl_venture_dashboard`.

**Class C — cascades** from A/B: `sessions`, `encounters`,
`encounter_media_streams`, `manuscript_structure_units`, `comms_analysis_queue`,
`practitioner_comms_credentials`.

**Sharpest single fact:** two of the four migrations in
`database/required_migrations.txt` — the single source of truth read by both
`scripts/ensure-migrations.sh` and `lib/db/schemaGate.ts` — cannot be applied to
an empty database:
`20260112000010_add_origin_route_and_processing_profile.sql` and
`20260122_comms_delivery_infrastructure.sql`.
The schema gate requires migrations the runner cannot produce from empty.

**Span:** the Class A tables date from 2025-12 to 2026-08. Out-of-band schema
creation is not one historical era; it is a **continuing practice**.

## 4. Historical bootstrap mechanism

- **Prisma** — `prisma/schema.prisma` (53 models), one migration dir
  (`20251221_consciousness_traces_rules`), scripts `db:push`,
  `db:migrate:prisma`. Last touched 2025-12-11. It defines **none** of the
  Class A tables. Early-era, abandoned, not the source.
- **`database/init/`** — mounted at `/docker-entrypoint-initdb.d` in the
  production compose file; contains only `001_extensions.sql`. Extensions only.
- **`backups/field-stable-v1-schema.sql`** (2025-12-08, 6.8 KB) — too small for
  a baseline; defines none of the Class A tables.

No repository-captured canonical bootstrap mechanism was recovered — no baseline
dump, squash, or bootstrap phase. Archaeology establishes absence from the
repository, not absence from the world. Conclusion: the current schema appears to
have been produced by **forward migration over a database whose genesis was
applied out-of-band**, and that genesis is not captured in source.

## 5. Actual contract of `npm run db:migrate`

Grounded in code, not the script name: `scripts/apply-migrations.sh` builds one
psql script under an advisory lock, tracks `schema_migrations` with checksums,
and skips already-applied files. `schemaGate.ts` asserts only that the schema is
**not behind** a required list. No script, header, or doc anywhere claims
reconstruction from empty.

**Contract today: forward upgrade of an existing historical database. Empty-database
reconstruction is not implemented, not claimed, and was never tested.**

## 5b. Two incompatible notions of "required"

This is the clearest single demonstration of the defect, and it should not be
read as a detail of the census.

`database/required_migrations.txt` is the single source of truth for what the
system declares mandatory, read by both `scripts/ensure-migrations.sh` and
`lib/db/schemaGate.ts`. Two of its four entries cannot be applied to an empty
database at all:

```text
20260112000010_add_origin_route_and_processing_profile.sql   blocked on agent_runs
20260122_comms_delivery_infrastructure.sql                   blocked on comms_messages
```

So the repository holds two notions of "required" that are not reconcilable:

```text
runtime-required            the app refuses to boot without these migrations
constructible-from-source   these migrations cannot be reached from empty
```

A schema gate demands a state the schema source cannot construct. Any repair
design must reconcile these two senses explicitly rather than satisfy one of
them.

## 6. Root cause

Not a missing table. **There is no enforced invariant that a relation's genesis
DDL enter `database/migrations/`.** Tables were, and still are, created directly
against live databases; migrations then reference and evolve them. The migration
tree is an *amendment log*, not a *constructive schema*. `maia_consciousness` is
the only complete artifact of the schema, and it exists in exactly one place.

Consequence: no disaster recovery from source, no reproducible CI/test database,
no verifiable review of schema changes, and a required-migrations gate that
cannot be satisfied from empty.

## 7. Repair options (not chosen)

- **O1 — Baseline snapshot + forward migrations.** Capture current schema as a
  reviewed baseline; migrations after it. Fast, honest, restores reproducibility.
  Cost: blesses current shape without recovering history; baseline is generated,
  not authored.
- **O2 — Recover/author genesis migrations for Class A**, placed before first
  use, plus reorder Class B. Truest to a migration tree. Cost: four tables have
  no recoverable DDL — that is reconstruction, and renumbering rewrites applied
  history and breaks checksums.
- **O3 — Bootstrap phase in the runner** (init/baseline applied before the tree).
  Smallest runner change. Cost: leaves ordering defects latent.
- **O4 — O1 + a standing gate** (CI replays migrations into an empty database on
  every PR) so the defect cannot recur. Only option that makes the class
  structurally impossible.

## 8. Recommended next ruling

**O1 + O4**, sequenced: capture a reviewed baseline, then add the empty-replay CI
gate that keeps it honest. O2 for the four undocumented tables would be
reconstruction presented as recovery — the thing this lane was opened to avoid.
Class B ordering defects should be recorded and left untouched until the baseline
lands, since a baseline makes most of them moot.

Falsifier for any repair — no copying from `maia_consciousness` may count:

```text
new empty PostgreSQL database → canonical bootstrap command →
all migrations succeed → schema invariants hold → app schema gate passes
```

---

## Boundaries observed

`maia_consciousness` never modified (read-only `pg_dump --schema-only`); no member
data written; no `CREATE TABLE developmental_memories` authored; no migration
skipped to obtain green in any claim; no historical SQL patched;
`required_migrations.txt` unchanged; no discovered defect repaired.

---

## Ledger

```text
DB-EMPTY-BOOTSTRAP-01

Empty replay reproducible: NO
developmental_memories origin recovered: PARTIAL
Single-table defect: NO
Historical bootstrap mechanism:
  no repository-captured canonical bootstrap mechanism recovered;
  schema genesis appears to have been applied out-of-band
Migration runner contract:
  forward upgrade of an existing historical database; reconstruction from
  empty is not implemented, not claimed, and was never tested
Root cause:
  no invariant requiring genesis DDL to enter the migration tree; the tree
  amends a schema it cannot construct
Repair authorized: YES — see Closure
```

---

## Canonical-runner confirmation

§3's census used a diagnostic replay probe, not the runner. The runner has since
been run against an empty PostgreSQL 16 database with `database/init/` applied:

```text
456 migrations on disk
 36 applied
 37 ABORT  20251231_memory_architecture_enhancements.sql:123
           ERROR: relation "developmental_memories" does not exist
```

The probe's 32 failures and this single abort are the same defect seen through
two instruments. The abort is the one that matters: it is what the canonical
bootstrap command actually does, and it happens at migration 37 of 456 — the
tree is unreachable from empty almost immediately, not marginally.

---

## Closure

Diagnosis closed. No `DB-EMPTY-BOOTSTRAP-02` design lane is opened: the direction
was already decided here (O1 + O4), and a second governance pass would produce
paperwork rather than a schema. Founder ruling, 2026-09-01 — the repair proceeds
as ordinary engineering work, and archaeology resumes only if implementation
exposes a genuinely new unknown.

Shipped against this diagnosis:

```text
scripts/capture-baseline.sh                    O1  capture the reviewed baseline
database/baseline/                             O1  baseline + generated cut line
scripts/apply-migrations.sh  bootstrap phase   O1  empty-only; inert on any
                                                   database that has a schema
scripts/test-empty-db-reconstruction.sh        O4  the falsifier, verbatim from §8
.github/workflows/empty-db-reconstruction.yml  O4  the standing gate
```

O2 stays rejected — four of the Class A tables have no recoverable DDL, and
authoring it would be reconstruction presented as recovery. O3 stays rejected as
primary architecture. Class B ordering defects remain recorded and untouched;
the baseline subsumes them.

Outstanding, and the only thing between here and PASS: `database/baseline/schema.sql`
must be captured from the known-good database. It cannot be synthesized from the
repository — that is the defect itself — so it is one read-only `pg_dump` on the
host that holds `maia_consciousness`. The gate reports and does not enforce until
that file lands.
