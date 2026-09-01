# WS2-05B-8B-02c-2 · LOCAL RUNTIME WITNESS — lane charter

**Revision 3 — final.** Supersedes `f124f5b`, which supersedes `2145814`.

Revision 1 carried four load-bearing defects: the authentication header would have
401'd every call, the schema census omitted a required migration, the queries were
unscoped, and Jest was allowed to stand in for a runtime witness. Revision 2
repaired those.

Revision 3 repairs four smaller **epistemic** ones — each a way the lane could have
reported a stronger result than it earned: a lawful refusal counted as a closed
witness; refusal mode attributed to a module Ask no longer calls; a proposal
fingerprint that omitted most of what it claimed to protect; and a browser credited
with observing a request it cannot see. Every correction is re-grounded in source
read at the frozen SHA.

**Lane name:** Jarvis — 02c Local Runtime Witness
**Lane identity:** `WS2-05B-8B-02c-2 · LOCAL RUNTIME WITNESS`
**Host:** Mac Studio (local Postgres, `maia_consciousness`). **Not** minisforum. **Not** a cloud container.
**Runtime, frozen:**

```
branch  claude/jarvis-roadmap-sequence-k5d1n3
SHA     93216567b1c06c7105db492f9d00b2395de53b36
```

**Witness target, frozen:**

```
manuscript  a3ae67fd-a21e-4948-8766-4c397d2e4712
proposal    e6cabcc4-a506-4ea7-aa89-9b23b450ca74
```

This lane exists because 02c-2 shipped with one honest hole, recorded three times
in its own build record: *"unwitnessed at runtime — no database in this session,
migration unapplied, no thread ever opened."* Every gate behind 02c-2 is static,
unit-level or structural. This lane closes that and nothing else.

---

## Constitution of the lane

**It is a witness lane, not a build lane.**

- It does **not** redesign, refactor, extend, or "improve while it is in there."
- It does **not** create a git branch and does **not** commit to
  `claude/jarvis-roadmap-sequence-k5d1n3`. The repository stays byte-frozen at `93216567`.
- It does **not** run the section **conversion** service. 04A defers conversion
  deliberately; converting here would create the two writable truths 04A exists to prevent.
- It does **not** touch minisforum or production.
- **It may create exactly one ephemeral measurement instrument** —
  `/tmp/ws2-05b-02c-2-runtime-witness.ts` — outside the repository, uncommitted,
  deleted after the run. That is measurement infrastructure, not product
  development. **If the instrument exposes a product defect, the lane still stops.
  It may not repair it.**
- Authorized database writes, and no others: (a) migrations that pass the step 2
  matrix, under GO; (b) the `ask_threads` / `ask_turns` rows the witness produces;
  (c) the whole-thread `DELETE` of the disposable refusal-mode thread at step 6.
  The Work is read-only for the entire lane.

**Stop conditions — report, never work around:** wrong SHA · dirty worktree · any
STOP row in the step 2 matrix · STOP at step 3 · any non-mutation fingerprint that
moves · any instrument assertion that FAILs · an Ask refusal outside the designed set.

---

## Step 1 · Verify the exact SHA and a clean worktree

```bash
cd <mac-studio worktree>
git fetch origin claude/jarvis-roadmap-sequence-k5d1n3
git checkout claude/jarvis-roadmap-sequence-k5d1n3
git rev-parse HEAD          # MUST equal 93216567b1c06c7105db492f9d00b2395de53b36
git status --porcelain      # MUST be empty
```

Both are hard conditions. A dirty tree means the witness is not witnessing the
frozen slice. Record both outputs verbatim.

---

## Step 2 · Census six migrations against ledger **and** schema

Revision 1 named five. There is a sixth: `loadFrozenReading` selects
`p.reader_provenance` (`lib/manuscript/ask/frozenReading.ts:76`), and that column
is added — and the proposal freeze trigger extended to cover it — by
`20260831000001_structure_proposal_reader_provenance.sql`. Ask cannot load a
frozen reading without it.

| # | Migration | Schema object that proves it ran |
|---|---|---|
| 1 | `20260830000001_manuscript_draft_sections.sql` | table `manuscript_draft_sections`; columns `manuscript_working_drafts.section_addressable_at`, `.section_conversion_version` |
| 2 | `20260830000002_manuscript_structure.sql` | tables `manuscript_structure_units`, `manuscript_structure_members` |
| 3 | `20260830000003_manuscript_structure_contiguity.sql` | constraint `manuscript_structure_units_sibling_order`; triggers `manuscript_structure_members_contiguity`, `manuscript_structure_units_contiguity` |
| 4 | `20260830000005_manuscript_structure_proposals.sql` | table `manuscript_structure_proposals` |
| 5 | `20260831000001_structure_proposal_reader_provenance.sql` | column `manuscript_structure_proposals.reader_provenance` **and** the `manuscript_structure_proposals_freeze()` body containing `reader_provenance` |
| 6 | `20260901000001_ask_threads.sql` | tables `ask_threads`, `ask_turns`; triggers `ask_turns_no_update`, `ask_threads_no_repoint` |

**Decision matrix — applied per migration, independently:**

```
ledger row + matching checksum        → already applied; DO NOT RERUN
ledger row + differing checksum       → STOP
ledger row + null/empty checksum      → STOP · applied but unverifiable
no ledger row + schema object absent  → eligible to apply under GO
no ledger row + schema object present → STOP · schema/ledger divergence
```

The last row is not bookkeeping pedantry. `20260830000003` runs
`ALTER TABLE … ADD CONSTRAINT manuscript_structure_units_sibling_order` with **no
`IF NOT EXISTS`**, and creates its constraint triggers unguarded; re-running it
against a database that already carries them errors mid-migration. And
`20260831000001` does `CREATE OR REPLACE FUNCTION manuscript_structure_proposals_freeze()`
— replacing the body installed by `20260830000005` — so "column present, function
body old" is a real partial state the probe must distinguish.

**Expect most of these to be already applied.** The target Work carries authored
structure and a frozen proposal, which cannot exist without migrations 2–5.
Requiredness is not a reason to reapply.

```bash
export DATABASE_URL='postgresql://soullab@localhost:5432/maia_consciousness'
export MANUSCRIPT_ID='a3ae67fd-a21e-4948-8766-4c397d2e4712'
export PROPOSAL_ID='e6cabcc4-a506-4ea7-aa89-9b23b450ca74'

psql "$DATABASE_URL" -c "SELECT current_database() db, inet_server_addr() host, inet_server_port() port, current_user, version();"

psql "$DATABASE_URL" -c "
  SELECT filename, checksum, applied_at FROM schema_migrations
   WHERE filename IN (
     '20260830000001_manuscript_draft_sections.sql','20260830000002_manuscript_structure.sql',
     '20260830000003_manuscript_structure_contiguity.sql','20260830000005_manuscript_structure_proposals.sql',
     '20260831000001_structure_proposal_reader_provenance.sql','20260901000001_ask_threads.sql')
   ORDER BY filename;"

# File-side checksums at this SHA, to compare against the ledger column
for f in 20260830000001_manuscript_draft_sections 20260830000002_manuscript_structure \
         20260830000003_manuscript_structure_contiguity 20260830000005_manuscript_structure_proposals \
         20260831000001_structure_proposal_reader_provenance 20260901000001_ask_threads; do
  printf '%s  ' "$f"; shasum -a 256 "database/migrations/$f.sql" | awk '{print $1}'
done

# Schema-side presence, for the two "no ledger row" branches
psql "$DATABASE_URL" -c "
  SELECT 'tables' k, string_agg(tablename,',' ORDER BY tablename) v FROM pg_tables
   WHERE schemaname='public' AND tablename IN ('manuscript_draft_sections','manuscript_structure_units',
     'manuscript_structure_members','manuscript_structure_proposals','ask_threads','ask_turns')
  UNION ALL SELECT 'constraint', string_agg(conname,',') FROM pg_constraint
   WHERE conname='manuscript_structure_units_sibling_order'
  UNION ALL SELECT 'triggers', string_agg(tgname,',' ORDER BY tgname) FROM pg_trigger
   WHERE NOT tgisinternal AND tgname IN ('manuscript_structure_members_contiguity',
     'manuscript_structure_units_contiguity','ask_turns_no_update','ask_threads_no_repoint')
  UNION ALL SELECT 'reader_provenance_col', string_agg(column_name,',') FROM information_schema.columns
   WHERE table_name='manuscript_structure_proposals' AND column_name='reader_provenance'
  UNION ALL SELECT 'draft_cols', string_agg(column_name,',' ORDER BY column_name) FROM information_schema.columns
   WHERE table_name='manuscript_working_drafts' AND column_name IN ('section_addressable_at','section_conversion_version')
  UNION ALL SELECT 'freeze_covers_provenance',
     (pg_get_functiondef('manuscript_structure_proposals_freeze'::regproc) LIKE '%reader_provenance%')::text;"
```

Record all six verdicts before moving on.

---

## Step 3 · GO / STOP on the 174 section-addressable rows — scoped to the target Work

`loadSectionHeads` (`lib/manuscript/ask/frozenReading.ts:122`) returns rows only
where `manuscript_working_drafts.section_addressable_at IS NOT NULL`, and
`20260830000001` creates `manuscript_draft_sections` **empty, converting nothing**.
So the question is not "can we make 174 rows" — it is **"does the real database
already carry them, for this Work."**

Every query is scoped to `$MANUSCRIPT_ID`. Revision 1's database-wide census is
withdrawn: an unrelated local write must not be able to manufacture a verdict.

```sql
\set mid 'a3ae67fd-a21e-4948-8766-4c397d2e4712'
\set pid 'e6cabcc4-a506-4ea7-aa89-9b23b450ca74'

-- Identity: the Work, its owner, its single draft
SELECT m.id AS manuscript_id, m.member_id, d.id AS draft_id,
       d.section_addressable_at, d.section_conversion_version,
       length(d.content) AS content_chars, d.revision_count
  FROM member_manuscripts m
  JOIN manuscript_working_drafts d ON d.manuscript_id = m.id
 WHERE m.id = :'mid';

-- The count that decides GO / STOP
SELECT count(*) AS section_rows
  FROM manuscript_draft_sections s
  JOIN manuscript_working_drafts d ON d.id = s.draft_id
 WHERE d.manuscript_id = :'mid';

-- The 174 identities themselves, ordered — the instrument re-reads this list
SELECT s.id, s.position, s.source_section_id, length(s.text) AS chars
  FROM manuscript_draft_sections s
  JOIN manuscript_working_drafts d ON d.id = s.draft_id
 WHERE d.manuscript_id = :'mid' ORDER BY s.position ASC;

-- Round-trip integrity, on bytes, for this draft only
SELECT d.id AS draft_id,
       convert_to(d.content,'UTF8') = convert_to(coalesce(
         (SELECT string_agg(s.text,'' ORDER BY s.position)
            FROM manuscript_draft_sections s WHERE s.draft_id = d.id),''),'UTF8') AS round_trip_ok
  FROM manuscript_working_drafts d WHERE d.manuscript_id = :'mid';

-- The frozen proposal must be this Work's, and must carry a reading
SELECT id, manuscript_id, created_at, review_revision, reviewed_at, adopted_at,
       section_topology_hash, interpretation_input_hash,
       (reader_provenance IS NOT NULL) AS has_reader_provenance,
       jsonb_array_length(coalesce(interpretation->'questions','[]'::jsonb)) AS question_count
  FROM manuscript_structure_proposals WHERE id = :'pid';
```

**GO** — exactly when, for this Work: `section_addressable_at IS NOT NULL`,
`section_rows = 174`, `round_trip_ok = true`, and the proposal resolves to
`$MANUSCRIPT_ID`.

**STOP** — every other outcome, reported as itself, none repaired here:

| Finding | Meaning | Action |
|---|---|---|
| 0 rows, `section_addressable_at` NULL | This Work was never converted | **STOP.** Conversion is not this lane's to run. |
| rows ≠ 174 | Frozen expectation and database disagree | **STOP.** Report both numbers. Adjust neither side. |
| `round_trip_ok = false` | Draft and its sections have drifted | **STOP.** Byte-level integrity finding. Do not run Ask against it. |
| proposal's `manuscript_id` ≠ target | The two frozen ids do not belong together | **STOP.** |

A STOP at step 3 ends the lane. Steps 4–7 are not attempted, and that is a
complete, successful run.

---

## Step 4 · Under GO only — apply *only* what the matrix marked eligible

Do **not** run `scripts/apply-migrations.sh` against `database/migrations`; it
applies the whole directory. Stage exactly the files the step 2 matrix marked
**eligible to apply** — possibly none — and point the ledger-aware applier at that
staging directory, so the ledger records real filenames and real SHA-256 checksums
while nothing else runs.

```bash
STAGE=$(mktemp -d)
# copy ONLY the eligible ones, by name, from the step 2 verdicts
cp database/migrations/<eligible>.sql "$STAGE/"
ls -1 "$STAGE"                  # read this before proceeding
MIG_DIR="$STAGE" bash scripts/apply-migrations.sh
```

If the matrix marked none eligible, **skip this step and say so.** Re-run the step
2 census afterwards and record the after-state.

---

## Step 5 · Non-mutation baseline — the target Work only

Take this **before** anything is asked, and identically **after** step 7.

**FULL ROWS, NOT CHOSEN COLUMNS.** Revision 2 hand-picked fields and thereby
omitted `evidence`, `coverage`, `reviewed`, `interpretation_input_hash`,
`reader_provenance` and `adopted_review_revision` — most of what the claim actually
covers. If the claim is *"the Work did not move,"* then timestamps, provenance links
and metadata moving are mutations too. `to_jsonb(row)` cannot omit a column, and a
column added later is covered automatically.

```sql
SELECT 'proposal' AS what, md5(to_jsonb(p)::text) AS fp
  FROM manuscript_structure_proposals p WHERE p.id = :'pid'
UNION ALL
SELECT 'draft', md5(to_jsonb(d)::text)
  FROM manuscript_working_drafts d WHERE d.manuscript_id = :'mid'
UNION ALL
SELECT 'sections', md5(coalesce(string_agg(md5(to_jsonb(s)::text), '|' ORDER BY s.position, s.id),''))
  FROM manuscript_draft_sections s JOIN manuscript_working_drafts d ON d.id = s.draft_id
 WHERE d.manuscript_id = :'mid'
UNION ALL
SELECT 'source', md5(coalesce(string_agg(md5(to_jsonb(ms)::text), '|' ORDER BY ms.id),''))
  FROM manuscript_sections ms WHERE ms.manuscript_id = :'mid';
```

Record the four hashes verbatim. If one moves, also print the offending row's
`to_jsonb` before and after, so the report names *which field* moved rather than
only that something did.

Also record the canonical fingerprint the route computes (`canonicalFingerprint`),
and — scoped to this Work — `count(*)` of `ask_threads` and `ask_turns`. Those two
counts are the **only** things permitted to change, by exactly one thread and its turns.

Any movement in the four fingerprints is a **defect finding**: 02c-2's gate 7
claims the Ask route cannot write the Work, and this is its first runtime test.

---

## Step 6 · The machine witness — an authorized ephemeral instrument

**Revision 1 was wrong here.** It offered `jest lib/manuscript/ask` + `typecheck`
as the machine evidence. Those prove source and runtime assertions *inside Jest*.
They do not prove the real HTTP route, real Postgres persistence, real session
authentication, or the marker that started this slice. Neither does a direct
`POST /ask`: curl cannot prove that **clicking "a question for you" opens the exact
question it names.** That is the claim 02c-2 exists to make.

So the lane builds one instrument, at `/tmp/ws2-05b-02c-2-runtime-witness.ts` —
outside the repo, uncommitted, deleted after the run. Model it on the existing
read-only witnesses (`scripts/ws2-05b-02a-legibility-witness.ts` aborts every
non-GET the page attempts and re-reads afterwards to assert nothing moved).

### What it must mechanically establish, before Kelly is asked to judge anything

1. **Identity** — running SHA, Node/Next runtime, `current_database()`, host, port, user.
2. **Target** — manuscript `a3ae67fd…`, proposal `e6cabcc4…`, and that the proposal belongs to the manuscript.
3. **The 174** — section ids and positions re-read, count = 174, byte round-trip true.
4. **Schema/trigger state** — the six migrations' objects present, per the step 2 matrix, including `ask_turns_no_update` and `ask_threads_no_repoint`.
5. **Verified session authentication** — a real `auth_sessions` session; a call with no session 401s.
6. **A real browser opens the review surface** for that proposal.
7. **It clicks an actual `data-mark-question` control** (`app/writers-studio/canvas/StructureReview.tsx:1052`) — not a synthesized event on a div.
8. **The Ask room opens *from that mark*** — not from the inspector's separate per-question affordance. The mark and the room must be the same act.
9. **The submitted request carries the exact frozen `questionIndex`** the mark rendered. `takeUpMark` consumes `questionMarks` — the questions owned by that row, by deepest containing division — and opens directly only when the row owns exactly one. Same frozen indices in, same conversation out.
10. **An open-tag marker routes to `division`, never an inferred `UncertainRegion`.** Click `data-mark-open` (line 1068) and assert the outgoing anchor is `{on:'division', proposalId, unitId}`. A tag is not a region, and a click must not launder one into the other.
11. **Thread ownership** — the persisted `ask_threads` row carries the correct `manuscript_id` and `member_id`.
12. **Frozen reading identity and a real `canonicalAtOpen`** persist. **Binary — a lawful refusal is not a pass.** The route measures the canonical fingerprint *before* `openThread` and returns 503 when it cannot establish the baseline, so **no thread is persisted** in that case (`route.ts:212`, `:242`).

    ```
    PASS         thread persisted
                 canonical_at_open non-empty
                 canonical_at_open == the Step-5 canonical fingerprint

    INCOMPLETE   canonical_unmeasurable 503
    /HOLD        no thread opened
    ```

    INCOMPLETE means the route behaved lawfully and the witness did not close. Record it as HOLD, never as a green assertion 12.

13. **Ask has no body-read or tool capability — recorded in two evidence classes, never merged.** A browser instrument observes the browser → Ask HTTP request. It cannot ordinarily see the server-internal `StructuredRequest` handed to `runStructured`, nor the provider wire request. Crediting it with that would be the same inflation this lane exists to refuse.

    ```
    runtime (the instrument observes)
      the browser's Ask request carries only the expected
      envelope — anchor (or threadId) and question, nothing else

    machine / source contract (a test proves, on this exact SHA)
      lib/manuscript/__tests__/providerSeamMigration.test.ts:217
        "sends exactly the four keys the asker sent, and no fifth"
        — askReader.ts:228 OMITS the tools key rather than emptying it
      lib/manuscript/ask/frozenReading.ts:122
        loadSectionHeads selects s.id, s.position, ms.heading only —
        no body column is reachable from the read at all
    ```

    Run that targeted test on the Mac Studio at `93216567` and report it under its own heading. It is useful supplemental evidence; it is **not** a browser-runtime observation and must not be labelled one.

14. **Before/after full-row fingerprints unchanged** — draft, sections, source, proposal (step 5), plus the canonical fingerprint.

### The retry witness, before any paid call

**Where refusal mode actually comes from.** Revision 2 cited
`lib/ai/modelService.ts:83`. That attribution is stale: after the provider
migration Ask calls `runStructured` (`lib/manuscript/ask/askReader.ts:22`, `:232`),
whose mode is resolved by `resolveStructuredMode` in `lib/ai/structured/policy.ts:38`
— unset or empty → `primary`; an explicit `sovereign` / `local_only` → that mode.
The procedure below is unchanged; only the source is corrected.

Run a temporary instance with `MAIA_INFERENCE_MODE=sovereign`. Submit **the same
question twice**. Prove **one thread and one author turn**, not a duplicate:
`isHeldRetry` requires the last turn to be the author's and byte-identical, and a
reworded question is lawfully a new turn.

This works precisely because the author's words are recorded **before** the model is
called (`route.ts:266`), so a refused inference loses the answer and never the
question — the thread and its author turn persist under a 502.

Then delete that disposable thread **whole**:

```sql
DELETE FROM ask_threads WHERE id = '<disposable-thread-id>';   -- turns cascade
```

This is expressly permitted and is the only shape permitted: `ask_turns_no_update`
refuses turn rewrites, `ask_threads_no_repoint` refuses re-pointing, and the
migration's own comment states DELETE exists so an author may remove their record
whole. Do not UPDATE either table.

Restart the instance with `MAIA_INFERENCE_MODE` unset (or `primary`) for step 7 —
by `resolveStructuredMode`, those are the same resolution.

---

## Step 7 · The single paid call — through the marker, not around it

One call. Made **through the real UI marker**, by the instrument, on the target
proposal. Not curl, not a synthesized POST. The frozen `questionIndex` comes from
the mark that was clicked; nothing selects "whichever proposal is newest."

**Authentication — revision 1's defect.** `x-member-id` alone will **401**.
`getMemberIdFromRequest` (`lib/auth/getMemberFromRequest.ts:30`) requires a
verified session — the `maia_session` cookie or the `x-session-token` header
resolved against `auth_sessions`. `x-member-id` is an *unverified claim*, honored
only when it matches that session and rejected as possible impersonation when it does not.

```
x-session-token: $TOK
x-member-id: $MEMBER_ID     # optional; if present it must match the session
```

**`$TOK` is never printed into the witness record** — not in a curl line, not in a
log, not in the evidence block. Record only that a verified session was used and
which member it resolved to.

Record the HTTP status, the answer or refusal, then:

```sql
SELECT id, manuscript_id, member_id, anchor, canonical_at_open, initiated_by, opened_at
  FROM ask_threads WHERE manuscript_id = :'mid' ORDER BY opened_at DESC LIMIT 1;
SELECT thread_id, turn_index, speaker, left(body,200) AS body, staleness, answer_provenance, created_at
  FROM ask_turns WHERE thread_id = '<thread>' ORDER BY turn_index ASC;
```

### Acceptance semantics — three outcomes, and only one closes 02c

A designed refusal proves the route behaved **lawfully**. It does not close this
slice. Revision 2 blurred the two; revision 3 separates them.

```
ACCEPTED — 02c-2 witnessed at runtime. All of:
  HTTP 200
  exactly one real thread on the target Work
  author turn present
  MAIA turn present
  answer_provenance present
  the exact clicked anchor persisted (frozen questionIndex, or division+unitId)
  all four Work fingerprints unchanged

HOLD / INCOMPLETE — lawful behaviour, witness not closed. Any of:
  anchor_requires_reading 422 · anchor_reading_mismatch 409
  anchor_unresolved 404 · anchor_unknown 422
  canonical_unmeasurable 503   (no thread persisted — route.ts:212)
  unreachable / empty_answer 502 (route.ts:299 — the model did not answer;
    the thread and the author turn DO persist, the MAIA turn does not)
  Record which, and why the runtime took that branch. Not necessarily a
  product defect. Not an ACCEPTED run either.

DEFECT — stop and report. Any of:
  a 500, or any status outside the two sets above
  a refusal whose branch the source does not explain
  any Work fingerprint moved
  the persisted anchor differs from the one the marker rendered
```

Report the outcome by name. **"Green" is reserved for ACCEPTED.**

Then re-run step 5 and compare. Then delete `/tmp/ws2-05b-02c-2-runtime-witness.ts`.

---

## Step 8 · Return the evidence and stop

One report. No follow-on work, no cleanup refactor, no "while I was in there."

```
SHA verified            <rev-parse> == 93216567…             yes/no
Worktree clean          <porcelain>                          yes/no
Runtime identity        node / next / db / host / port / user
Target                  manuscript a3ae67fd… · proposal e6cabcc4… · proposal belongs? yes/no
Migration matrix        6 rows: applied-match | eligible | STOP(<which>)
Section rows            <n>  (expected 174)
section_addressable_at  <timestamp | NULL>
round_trip_ok           true | false
GO / STOP               <verdict, and the row that decided it>
Migrations applied      <exactly which, or NONE>
Fingerprints before     draft / sections / source / proposal (full-row) / canonical
Instrument              14 assertions: PASS / FAIL / INCOMPLETE each
                        (assertion 12 is binary — a 503 is INCOMPLETE, not PASS)
Retry witness           one thread + one author turn? · disposable thread deleted whole?
Ask call                ACCEPTED | HOLD(<which refusal>) | DEFECT(<what>)
                        status · thread id · turn indexes · answer_provenance present?
                        persisted anchor == the anchor the marker rendered?
                        (session verified: yes · token NOT recorded)
Seam contract test      providerSeamMigration.test.ts on this SHA — pass/fail
                        (machine/source evidence, NOT a browser observation)
Fingerprints after      same five — EQUAL / NOT EQUAL
ask_threads/ask_turns   before → after (target Work only)
Instrument removed      /tmp/ws2-05b-02c-2-runtime-witness.ts deleted? yes/no
Defects found           <none | list, each with the exact observation>
```

What this run can and cannot deliver:

```
machine:
  marker → exact anchor → route → persistence → MAIA → no Work mutation

then Kelly:
  "Is MAIA actually talking intelligently about the thing I clicked?"
```

The second line has no machine witness and none should be built to fake one, and
the first line is only reached on an **ACCEPTED** run — a HOLD stops short of it and
must say so.

The lane's success condition is **an honest report**, not a GO and not an ACCEPTED.
A STOP at step 3 with the real row count named is a complete run. So is a HOLD at
step 7 with the refusal branch named.

---

## Provenance of this charter

Written in a cloud session that **cannot** execute it: `DATABASE_URL` unset,
Postgres port closed, no Mac Studio and no minisforum reachable. Every step is
grounded in source read at `93216567` — `lib/auth/getMemberFromRequest.ts:30-66`,
`lib/manuscript/ask/frozenReading.ts:76,122`,
`app/writers-studio/canvas/StructureReview.tsx:378-400,1052,1068`,
`app/api/sovereign/manuscripts/[id]/ask/route.ts:212,242,266,299`,
`lib/manuscript/ask/askReader.ts:22,228,232`,
`lib/ai/structured/policy.ts:38-43`,
`lib/manuscript/__tests__/providerSeamMigration.test.ts:217`,
`database/migrations/20260830000003…sql:56,120`,
`database/migrations/20260831000001…sql:37,43`,
`database/migrations/20260901000001_ask_threads.sql:100-146`,
`scripts/apply-migrations.sh` — not in a remembered run. The 174 and the two
frozen ids are the founder's expectation carried into queries that can falsify
them; this session observed none of them and asserts none.
