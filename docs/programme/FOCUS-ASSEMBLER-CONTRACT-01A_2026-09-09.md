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

⚠️ **Witness-environment consequence, worth its own note — ⚖️ narrowed (founder,
2026-09-09):** those two artifacts are **absent from the captured production
baseline of 2026-09-01**. ⛔ That is a fact about a *snapshot*, not about the live
database: **current live-production presence requires a runtime ledger witness.**
The earlier wording here said "absent from production", which claimed more than
the repository can show.

Whatever database the human witness runs against must have `20260830000001`
applied, or Focus fails for schema reasons that have nothing to do with the
boundary. ⛔ **Do not apply the migration to production merely to enable the
walk** — production migration is a separate governed act.

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

## ⚖️ RULED — `FOCUS-ASSEMBLER-CONTRACT-01B · WHOLE-WORK FIDELITY`

**Founder ruling 2026-09-09. ⛔ RULED, NOT YET AUTHORIZED FOR IMPLEMENTATION.**

The trigger states the system's own contract: every character belongs to a
section, and concatenating section text with **no separator** reproduces the draft
byte-for-byte. `assembleFocus` joins `whole_work` with **`'\n\n'`**, manufacturing
two characters at every section boundary.

⭐ That is not formatting. **At this seam the returned string represents itself as
the Work.**

> ⭐⭐ **A Work disclosure must preserve the writer's character stream exactly.
> Representation may surround the Work; it may not silently alter the Work while
> calling the result the Work.**
>
> ⭐ **Structure may accompany the Work as structure. It may not be smuggled into
> the Work as synthetic characters.**

That corollary is why the fix is not cosmetic: section boundaries, headings and
hierarchy may one day reach MAIA legitimately — through
`computed.writer_structure` or another adjudicated representation, **never as
invisible punctuation inside `retrieved.writer_work_context`.**

**The narrow repair, when authorized:**

```text
whole_work → ordered draft sections → join('')
```

⛔ **Not** by switching to `manuscript_working_drafts.content` to make the equality
easy. The ruled read authority stays section-native draft truth; the database
invariant only tells us how those sections lawfully flatten.

**Witness strengthening owed with it** — the present checks prove *"draft not
Source"* and correct order, but **not exact equality**:

```text
whole_work === canonical draft flattening
whole_work === manuscript_working_drafts.content     (must coincide once addressable)
mutation: join('') → join('\n\n')                    must go RED
```

`section` and `passage` need no repair.

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

## ⚖️ Custody corrections (founder, 2026-09-09)

1. **This record was forward-dated `2026-09-10`.** The programme dates records by
   founder-local time; this session's clock reads UTC, which had already rolled
   over. Corrected by rename in a **subsequent** commit — ⛔ `edf6352f…` is not
   amended, so the historical commit stays intact.
2. **"Absent from production" narrowed** to "absent from the captured production
   baseline", above. *A snapshot is a reading at a time, not a claim about now.*

⚠️ Both corrections postdate `edf6352f…`, whose commit message still carries the
un-narrowed wording. It stands as written; this record is the correction.

## Before the human witness — both runtime identities

```text
serving code SHA     <post-01B implementation SHA>
serving database     manuscript_draft_sections exists
                     section_addressable_at exists
                     schema_migrations contains 20260830000001_manuscript_draft_sections.sql
DB instrument SHA    edf6352f9adcc73b68ce688de9a97c835833b58e
gate                 PASS against a repo-derived disposable DB
```

**Standing: implementation `8384fc8d…` FROZEN and unchanged · instrument hardened
`edf6352f…` · ⚖️ `whole_work` fidelity RULED, 01B NOT AUTHORIZED · `section` and
`passage` unaffected · live DB schema state NOT established · flag OFF · human
witness HOLD · `#1275` FROZEN.**
