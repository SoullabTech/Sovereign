# FOCUS-ASSEMBLER-CONTRACT-01A · INSTRUMENT HARDENING

**Implementation subject FROZEN at `8384fc8d6797ad931fcd9ee9b2ddf3d0bafbca4a` —
⛔ unchanged by this lane.** Tooling, gate wiring and record only.

> ⭐⭐ **The SQL must meet a real database, and the database used to judge it must
> itself descend from repository truth.**

## Schema lineage census (read-only, first act)

**The canonical bootstrap already exists and is repo-owned:**

```text
npm run db:bootstrap   database/baseline/0001_baseline_2026-09-01.sql
                       + 0001_baseline_2026-09-01.manifest  (ledger seed)
npm run db:migrate     database/migrations/*.sql not already in the ledger
```

⭐ **The baseline is a production snapshot, and says so in its own header**:
*"Tables belonging to unmerged work are ABSENT by construction."* That explains
what first looked like a gap — `manuscript_draft_sections` and
`section_addressable_at` are **not in the baseline**, because they are not in
production.

**No STOP condition.** The manifest ends at `20260828…` and does **not** stamp
`20260830000001_manuscript_draft_sections.sql`, so `db:migrate` applies it. The
lineage reconstructs every subject relation:

| relation | supplied by |
|---|---|
| `member_manuscripts` · `manuscript_sections` · `manuscript_working_drafts` | canonical baseline |
| `manuscript_draft_sections` · `manuscript_working_drafts.section_addressable_at` | `20260830000001` via `db:migrate` |

⚠️ **Witness-environment consequence, worth its own note:** those two artifacts are
absent from **production**. Whatever database the human witness runs against must
have `20260830000001` applied, or Focus fails for schema reasons that have nothing
to do with the boundary.

## What the hand-written schema was hiding

Running the real assembler against the **repo-derived** schema failed twice before
it passed, and both failures were things a modelled schema cannot contain:

1. ⭐ **A foreign key.** `member_manuscripts.member_id` and
   `manuscript_working_drafts.member_id` both `REFERENCES members(id)`. The
   fixture now seeds real members.
2. ⭐⭐ **A round-trip trigger.** `manuscript_working_drafts_round_trip()` enforces
   that once `section_addressable_at` is set, `content` **must equal**
   `string_agg(s.text, '' ORDER BY s.position)`. The fixture now creates the draft
   un-addressable, writes its sections, then flattens and makes it addressable in
   one step.

*A modelled schema is a second source of truth, and it is always the more
forgiving one.*

## ⛔ FINDING FOR THE PRODUCT LANE — not repaired here

The trigger states the system's own definition of the flattening: sections joined
with **`''`**, no separator. `assembleFocus` joins `whole_work` with **`'\n\n'`**.

So a `whole_work` payload is **not** the Work's canonical flattening — it contains
separator text that is not in the Work. Under 01A the assembler may not be
touched, and this is a product ruling, not an instrument fix. It matters most for
`whole_work`; `section` and `passage` are unaffected.

## The gate

```bash
DATABASE_URL=postgres://…/<disposable> npm run gate:focus-assembler
```

Constructs the database from repository truth, then executes the **real** assembler
SQL against it. ⛔ `set -euo pipefail`, and **no fallback to a local production
schema** — that would trade one uncontrolled second truth for another. Verified on
a **fresh empty database**: bootstrap → migrate → `10 passed · 0 failed` → gate
PASSED.

The witness now **creates nothing**. Absent relations print
`SCHEMA NOT CONSTRUCTED`, name what is missing, and say to build from repo truth —
*a schema-lineage finding is more valuable than a green fake schema.* It removes
only its own fixture rows; it never drops a subject relation.

## Two subjects, recorded

```text
implementation subject   8384fc8d6797ad931fcd9ee9b2ddf3d0bafbca4a   (FROZEN)
DB instrument subject    this commit
schema input             baseline 0001_baseline_2026-09-01 + manifest
                         + database/migrations (529 ledger entries)
                         draft-section genesis: 20260830000001_manuscript_draft_sections.sql
verdict                  10 / 10
mutation proof           wrong relation 5F · Source substituted 3F
                         gate removed 1F · code-point slicing 1F · unmutated 0F
```

## Pre-human-witness gate, now mandatory

```text
unit falsifiers          required
typecheck no-regression  required
no-supabase              required
DB schema-contract gate  REQUIRED   npm run gate:focus-assembler
human witness            only after all four
```

⛔ If disposable Postgres cannot be run, the human witness is **blocked, not
waived**.

**Gates:** contract gate **10/10** from an empty database, 4 mutations red ·
**203 unit tests · 0 failed** · typecheck 228 vs baseline 239 · 0 regressions ·
`check:no-supabase` clean.

**Standing: implementation `8384fc8d…` FROZEN and unchanged · instrument hardened ·
flag OFF · human witness HOLD · `#1275` FROZEN · one product finding owed a ruling
(`whole_work` separator).**
