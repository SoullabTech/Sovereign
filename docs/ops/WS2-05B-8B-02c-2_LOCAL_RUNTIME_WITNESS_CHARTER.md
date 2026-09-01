# WS2-05B-8B-02c-2 · LOCAL RUNTIME WITNESS — lane charter

**Lane name:** Jarvis — 02c Local Runtime Witness
**Lane identity:** `WS2-05B-8B-02c-2 · LOCAL RUNTIME WITNESS`
**Host:** Mac Studio (local Postgres, `maia_consciousness`). **Not** minisforum. **Not** a cloud container.
**Starts from:**

```
branch  claude/jarvis-roadmap-sequence-k5d1n3
SHA     93216567b1c06c7105db492f9d00b2395de53b36
```

This lane exists because 02c-2 shipped with one honest hole, recorded three
times in its own build record: *"unwitnessed at runtime — no database in this
session, migration unapplied, no thread ever opened."* Every gate behind 02c-2 is
static, unit-level or structural. This lane closes that and nothing else.

---

## Constitution of the lane

**It is a witness lane, not a build lane.**

- It does **not** redesign, refactor, extend, or "improve while it is in there."
- It does **not** create a git branch. It runs on the pushed branch exactly as frozen.
- It does **not** commit to `claude/jarvis-roadmap-sequence-k5d1n3`.
- It does **not** run the section **conversion** service. 04A defers conversion
  deliberately; converting here would create the two writable truths 04A exists
  to prevent.
- It does **not** touch minisforum or production.
- The only authorized write to the database is (a) the five named migrations,
  under GO, and (b) the `ask_threads` / `ask_turns` rows the one real Ask call
  produces. Nothing else. The Work is read-only for the whole lane.
- If it finds a defect, it **stops and reports**. Repair is a separate authorized
  act on a separate branch, requested from the founder — never taken inside this lane.

**Stop conditions (report, do not work around):** wrong SHA · dirty worktree ·
STOP at step 3 · a migration that is already applied with a different checksum ·
any non-mutation proof that fails · a witness FAIL · an Ask refusal that is not
one of the eight designed behaviours.

---

## Step 1 · Verify the exact SHA and a clean worktree

```bash
cd <mac-studio worktree>
git fetch origin claude/jarvis-roadmap-sequence-k5d1n3
git checkout claude/jarvis-roadmap-sequence-k5d1n3
git rev-parse HEAD          # MUST equal 93216567b1c06c7105db492f9d00b2395de53b36
git status --porcelain      # MUST be empty
```

Both conditions are hard. A dirty tree means the witness is not witnessing the
frozen slice. Record both outputs verbatim in the evidence.

---

## Step 2 · Inspect the real DB and the migration ledger

```bash
export DATABASE_URL='postgresql://soullab@localhost:5432/maia_consciousness'

psql "$DATABASE_URL" -c "SELECT current_database() db, inet_server_addr() host, inet_server_port() port, current_user;"

psql "$DATABASE_URL" -c "
  SELECT filename, left(checksum,12) AS checksum, applied_at
    FROM schema_migrations
   WHERE filename IN (
     '20260830000001_manuscript_draft_sections.sql',
     '20260830000002_manuscript_structure.sql',
     '20260830000003_manuscript_structure_contiguity.sql',
     '20260830000005_manuscript_structure_proposals.sql',
     '20260901000001_ask_threads.sql')
   ORDER BY filename;"

psql "$DATABASE_URL" -c "
  SELECT c.relname, (SELECT count(*) FROM pg_class x WHERE x.oid=c.oid) AS present
    FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
   WHERE n.nspname='public'
     AND c.relname IN ('member_manuscripts','manuscript_sections',
                       'manuscript_working_drafts','manuscript_draft_sections',
                       'manuscript_structure_proposals','ask_threads','ask_turns')
   ORDER BY 1;"
```

For each of the five migrations record one of: **absent from ledger** ·
**applied, checksum matches the file at this SHA** · **applied, checksum
DIFFERS**. The third is a STOP — a migration file changed after it was applied is
never something this lane resolves.

Checksum of each file at this SHA:

```bash
for f in 20260830000001_manuscript_draft_sections 20260830000002_manuscript_structure \
         20260830000003_manuscript_structure_contiguity 20260830000005_manuscript_structure_proposals \
         20260901000001_ask_threads; do
  printf '%s  ' "$f"; shasum -a 256 "database/migrations/$f.sql" | awk '{print $1}'
done
```

---

## Step 3 · GO / STOP on the 174 section-addressable rows

This is the decision the whole lane turns on. `loadSectionHeads`
(`lib/manuscript/ask/frozenReading.ts:122`) will return rows only where
`manuscript_working_drafts.section_addressable_at IS NOT NULL`. The migration
creates `manuscript_draft_sections` **empty and performs no conversion**. So the
question is not "can we make 174 rows" — it is **"does the real database already
carry them."**

```sql
-- Which Work, whose, and is its draft section-addressable at all
SELECT m.id AS manuscript_id, m.member_id, d.id AS draft_id,
       d.section_addressable_at, d.section_conversion_version,
       length(d.content) AS content_chars
  FROM member_manuscripts m
  JOIN manuscript_working_drafts d ON d.manuscript_id = m.id
 ORDER BY d.updated_at DESC NULLS LAST
 LIMIT 20;

-- The count that decides GO / STOP
SELECT d.manuscript_id, d.id AS draft_id, count(s.id) AS section_rows
  FROM manuscript_working_drafts d
  LEFT JOIN manuscript_draft_sections s ON s.draft_id = d.id
 GROUP BY 1,2 ORDER BY 3 DESC;

-- Source-side comparison: how many Source sections exist for the same Work
SELECT manuscript_id, count(*) AS source_sections
  FROM manuscript_sections GROUP BY 1 ORDER BY 2 DESC;

-- The round-trip invariant, asserted against the real rows before trusting them
SELECT d.id AS draft_id,
       convert_to(d.content,'UTF8') = convert_to(
         (SELECT string_agg(s.text,'' ORDER BY s.position)
            FROM manuscript_draft_sections s WHERE s.draft_id = d.id),'UTF8') AS round_trip_ok
  FROM manuscript_working_drafts d
 WHERE d.section_addressable_at IS NOT NULL;
```

**GO** — exactly when, for the target Work: `section_addressable_at IS NOT NULL`,
`count(manuscript_draft_sections) = 174`, and `round_trip_ok = true`.

**STOP** — every other outcome, each reported as itself, none repaired here:

| Finding | Meaning | Action |
|---|---|---|
| 0 rows, `section_addressable_at` NULL | The Work was never converted | **STOP.** Conversion is not this lane's to run. Report and return to the founder. |
| rows ≠ 174 | The frozen expectation and the database disagree | **STOP.** Report both numbers and the Source-section count. Do not adjust either side. |
| `round_trip_ok = false` | Draft and its sections have drifted | **STOP.** A byte-level integrity finding. Report immediately; do not run Ask against it. |
| 174 rows but the tables are absent | Ledger/DB disagreement | **STOP.** Report. |

A STOP at step 3 ends the lane. Steps 4–7 are not attempted.

---

## Step 4 · Under GO only — apply *only* the required schema

Do **not** run `scripts/apply-migrations.sh` against `database/migrations`; it
applies the whole directory. Stage exactly the five files and point the ledger-
aware applier at that staging directory, so the ledger records real filenames and
real SHA-256 checksums while nothing else is applied.

```bash
STAGE=$(mktemp -d)
for f in 20260830000001_manuscript_draft_sections 20260830000002_manuscript_structure \
         20260830000003_manuscript_structure_contiguity 20260830000005_manuscript_structure_proposals \
         20260901000001_ask_threads; do
  cp "database/migrations/$f.sql" "$STAGE/"
done
ls -1 "$STAGE"                  # MUST list exactly 5 files — read it before proceeding
MIG_DIR="$STAGE" bash scripts/apply-migrations.sh
```

Apply only those already reported **absent from ledger** at step 2. The applier
skips ones already applied with a matching checksum and hard-fails on a mismatch;
that failure is a STOP, not something to force.

Then re-run the step 2 ledger query and record the after-state.

---

## Step 5 · Prove non-mutation

Take a baseline **before** anything is asked, and the identical measurement
**after** step 7. They must be equal.

```sql
-- Baseline. Re-run verbatim after the Ask call; the two outputs must be identical.
SELECT 'draft'    AS what, md5(string_agg(d.id::text||':'||d.content, '|' ORDER BY d.id)) AS fp
  FROM manuscript_working_drafts d
UNION ALL
SELECT 'sections', md5(string_agg(s.id::text||':'||s.position||':'||s.text, '|' ORDER BY s.id))
  FROM manuscript_draft_sections s
UNION ALL
SELECT 'source',   md5(string_agg(ms.id::text||':'||coalesce(ms.heading,''), '|' ORDER BY ms.id))
  FROM manuscript_sections ms
UNION ALL
SELECT 'proposals', md5(string_agg(p.id::text||':'||p.review_revision||':'
                                  ||coalesce(p.reviewed_at::text,'-')||':'
                                  ||coalesce(p.adopted_at::text,'-'), '|' ORDER BY p.id))
  FROM manuscript_structure_proposals p;
```

Also record, before and after, `SELECT count(*) FROM ask_threads;` and
`SELECT count(*) FROM ask_turns;` — these two are the **only** counts permitted to
change, and only by exactly one thread and its turns.

Any change in the four fingerprints is a **defect finding**, not a nuisance:
02c-2's gate 7 claims the Ask route cannot write the Work, and this is the first
runtime test of that claim. Report it and stop.

---

## Step 6 · Run the machine witness

**Named gap, to be resolved by the founder before this step runs.** At SHA
`93216567` there is **no `ws2-05b-02c-*-witness.ts`**. The witness scripts present are:

```
scripts/ws2-05a-structure-witness.ts
scripts/ws2-05b-02a-legibility-witness.ts
scripts/ws2-05b-proposal-witness.ts
scripts/ws2-05b-review-witness.ts
scripts/ws2-05b-reader-run.ts
```

None of these witnesses Ask. The lane must **not** write one — that is building,
and this lane does not build. So step 6 is executed as the **existing** machine
evidence, run on the Mac Studio against the applied schema:

```bash
npx jest lib/manuscript/ask --config jest.config.js
npm run typecheck
```

and, if the founder names one of the scripts above as the intended instrument,
that script with its documented env (`BASE`, `TOK`, `MANUSCRIPT`, `PROPOSAL`,
`MEMBER_ID`). Otherwise the lane reports: *02c has no dedicated machine witness;
the runtime evidence is step 7 plus the non-mutation proof.* Say which of the two
happened. Do not let a green 02a legibility run stand in for a 02c witness.

---

## Step 7 · One real anchored Ask MAIA call

One call. Not a suite, not a loop.

Anchor on a real frozen reading. Only three anchor kinds are parseable at the
runtime boundary — `question`, `uncertainty`, `division` — and each has a **closed**
key set (an extra or missing key is a 422, by design):

```jsonc
{ "on": "division",    "proposalId": "<uuid>", "unitId": "<id>" }
{ "on": "question",    "proposalId": "<uuid>", "questionIndex": 0 }
{ "on": "uncertainty", "proposalId": "<uuid>", "regionIndex": 0 }
```

```bash
# Discover a real proposal on the target Work first
psql "$DATABASE_URL" -c "
  SELECT id, manuscript_id, created_at FROM manuscript_structure_proposals
   WHERE manuscript_id = '<MANUSCRIPT_ID>' ORDER BY created_at DESC LIMIT 5;"
```

```bash
POST http://localhost:3000/api/sovereign/manuscripts/<MANUSCRIPT_ID>/ask
  header: x-member-id: <MEMBER_ID>        # per lib/http/apiBase.ts convention
  body:   { "anchor": { "on": "question", "proposalId": "<uuid>", "questionIndex": 0 },
            "question": "<one real question, in the founder's own words>" }
```

Record the full response, the HTTP status, and then:

```sql
SELECT id, manuscript_id, anchor, canonical_at_open, initiated_by, opened_at
  FROM ask_threads ORDER BY opened_at DESC LIMIT 1;
SELECT thread_id, turn_index, speaker, left(body,200) AS body, staleness, created_at
  FROM ask_turns ORDER BY created_at DESC LIMIT 4;
```

A refusal is **not** a failure if it is one of the designed ones —
`anchor_requires_reading` (422), `anchor_reading_mismatch` (409),
`anchor_unresolved` (404), `anchor_unknown` (422), `canonical_unmeasurable` (503).
Record which, and why the runtime took that branch. A refusal outside that set,
or a 500, is a defect finding.

Then re-run step 5 and compare.

---

## Step 8 · Return the evidence and stop

One report. No follow-on work, no cleanup refactor, no "while I was in there."

```
SHA verified            <rev-parse output> == 93216567…  yes/no
Worktree clean          <porcelain output>               yes/no
DB identity             db / host / port / user
Ledger before           5 rows, each: absent | match | MISMATCH
Section rows            <n>  (expected 174)
section_addressable_at  <timestamp | NULL>
round_trip_ok           true | false
GO / STOP               <verdict, and the row that decided it>
Migrations applied      <exactly which, or none>
Ledger after            5 rows, each state
Non-mutation before     draft / sections / source / proposals fingerprints
Machine witness         which instrument ran, and its result — or "none exists for 02c"
Ask call                status, refusal-or-answer, thread id, turn indexes
Non-mutation after      same four fingerprints — EQUAL / NOT EQUAL
ask_threads / ask_turns before → after
Defects found           <none | list, each with the exact observation>
```

The lane's success condition is **an honest report**, not a GO. A STOP at step 3
with the real row count named is a complete, successful run of this lane.

---

## Provenance of this charter

Written in a cloud session that **cannot** execute it: `DATABASE_URL` unset,
Postgres port closed, no Mac Studio and no minisforum reachable. Every step above
is grounded in source read at `93216567` —
`app/api/sovereign/manuscripts/[id]/ask/route.ts`,
`lib/manuscript/ask/frozenReading.ts`,
`database/migrations/20260830000001_manuscript_draft_sections.sql`,
`scripts/apply-migrations.sh` — not in a remembered run. The 174 is the founder's
frozen expectation carried into a query that can falsify it; this session did not
observe it and does not assert it.
