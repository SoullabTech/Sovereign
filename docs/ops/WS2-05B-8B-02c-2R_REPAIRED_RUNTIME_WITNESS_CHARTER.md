# WS2-05B-8B-02c-2R · REPAIRED RUNTIME WITNESS — successor charter

**Successor to** `docs/ops/WS2-05B-8B-02c-2_LOCAL_RUNTIME_WITNESS_CHARTER.md`
(revision 3, commit `23ae8149`). Not a clarification of it. **The object being
witnessed has changed**, so the charter has.

| | |
|---|---|
| **Predecessor asked** | Does the frozen 02c-2 slice work at runtime? |
| **Answer** | **No** — established, closed, not to be re-run |
| **This charter asks** | Does the *repaired* 02c-2 slice make the already-built marker reachable at runtime, without disturbing the witnessed substrate? |

Different SHA, different proposition.

---

## Witnessing location — hard precondition

**Every witness instruction must name the exact SHA being witnessed and the exact worktree
from which it is being witnessed. Before Step 1, the witness must verify both
`git rev-parse HEAD` and the worktree path. A shared checkout path is not evidence of
repository state, and no checkout may be treated as implicitly frozen.**

This lane does **not** witness from the live repair-branch tip. `58ac95a77` is currently the
tip of `fix/ws2-05b-02c-2r-structure-review-hook-order`, and a branch tip is movable. The
charter names a SHA, so the runtime is **structurally pinned** to that SHA rather than
relying on everyone behaving perfectly while the branch can advance underneath them.

Run from **inside** the repository (a bare `~` is not a git repo and the command will fail):

```bash
cd /Users/soullab/MAIA-SOVEREIGN
git worktree add --detach /private/tmp/ws2-02c-2r-runtime-witness 58ac95a77

cd /private/tmp/ws2-02c-2r-runtime-witness
pwd
git rev-parse --show-toplevel
git rev-parse HEAD
git status --porcelain
git branch --show-current
```

**Required observations:**

```
HEAD        58ac95a77...
branch      empty / detached HEAD
status      clean
worktree    /private/tmp/ws2-02c-2r-runtime-witness   (dedicated witness path)
```

> **HARD PRECONDITION.** If `HEAD` is not exactly `58ac95a77`, if the checkout is not
> detached, or if tracked state is dirty before Step 1 — **STOP.** Do not repair the witness
> environment in place. Report the observed state and end the run.

**Repository identity is invariant for the life of the lane.** Once the detached tree
exists, the witness may not run `git pull`, `switch`, `checkout`, `reset`, `merge`,
`rebase`, or `cherry-pick` in it. Disposable *runtime* artifacts are permitted where this
charter authorizes them; repository state is not one of them.

`/Users/soullab/MAIA-SOVEREIGN` is **not** at `93216567` any more, and is not the witness
tree. (Rule earned by incident 2026-09-01; see
`WS2-05B-8B-02c-2_WITNESS_RERUN_CLARIFICATION_3.md`.)

---

## Three kinds of fact — keep them separate

The predecessor's provenance tangle came from mixing these. They are not interchangeable,
and no fact may be promoted across rows.

| Kind | Treatment |
|---|---|
| Database / migration substrate, already established independently | **prerequisite — do not rerun** |
| Predecessor runtime failure at `93216567` | **historical evidence — do not rerun** |
| Any assertion about the behaviour of `58ac95a77` | **witness freshly** |

**Every behavioural and test assertion at `58ac95a77` is a new observation — including
`providerSeamMigration` — even where an equivalent assertion passed on the predecessor.**
A byte-identical test in a different tree is a different proposition. Prior results are
context, never this run's evidence, and may not be carried forward under any heading.

---

## Runtime, frozen

```
branch  fix/ws2-05b-02c-2r-structure-review-hook-order
SHA     58ac95a77
```

`58ac95a77` is a descendant of `93216567` — the frozen slice **plus** the repair and its
falsifier, and nothing else. Witness target, unchanged:

```
manuscript  a3ae67fd-a21e-4948-8766-4c397d2e4712
proposal    e6cabcc4-a506-4ea7-aa89-9b23b450ca74
member      ce284751-e457-42f6-89b6-bc07d0876682
```

---

## Prior findings — settled prerequisites, not steps to replay

Established by direct read-only evidence on 2026-09-01 and by the recovered `01Dxk7Q9`
transcript. **Recorded as settled; not skipped.**

```
Database substrate        ESTABLISHED — all six migrations' schema objects present
Migration 6               APPLIED 2026-08-31 23:27:09-04 · checksum matches · DO NOT RERUN
Migrations 1-5            unledgered substrate · do not reapply · do not backfill
Steps 2-3 census facts    ESTABLISHED — section_rows 174 · round_trip_ok true ·
                          section_addressable_at non-null · proposal belongs to manuscript
Step 4                    NO ACTION — nothing in the matrix is eligible
Runtime defect            IDENTIFIED on 93216567 — StructureReview hook-order violation,
                          error boundary on every load, marker unreachable
Repair                    58ac95a77 · pinned by structureReviewLifecycle.test.ts
New witness scope         old Step 5 forward only
```

### Closed predecessor verdict

```
93216567 runtime witness
VERDICT: FAIL — implementation defect
CAUSE:   StructureReview hook-order violation
STATUS:  CLOSED
```

A valid **negative** witness, not an incomplete positive one. Re-running that SHA would
produce no new knowledge, and is not authorized.

### `session_012vWvD8jt9DucdD28bvs5iF`

```
RETIRED WITHOUT ADJUDICATION — superseded by stronger direct evidence
```

Its transcript was **not** examined. Its census purpose was superseded by reading the
database, and it never reached the runtime threshold now at issue. Not "passed," not
"closed clean."

### Removed instrument

The predecessor's Step-3 question-count probe read `interpretation->'questions'`. The
questions live at `editorialSynthesis.questionsForAuthor` (there are five). That probe
always returned 0, and the false zero misled one adjudication. **It is removed from this
charter entirely** — a runtime reachability witness does not need an editorial-question
census. It is not corrected and carried; it is gone.

---

## Constitution of the lane

Unchanged from the predecessor in every respect except the SHA and the scope.

- Witness lane, not a build lane. No redesign, no refactor, no "improve while in there."
- **No commits.** `58ac95a77` stays byte-frozen. If this run finds a further defect, the
  lane **stops and reports**; it does not repair.
- Does not run the section conversion service. Does not touch minisforum or production.
- **One ephemeral instrument**, `/tmp/ws2-05b-02c-2r-runtime-witness.ts` — outside the
  repository, uncommitted, deleted after the run.
- Authorized writes, and no others: the `ask_threads` / `ask_turns` rows the witness
  produces, and the whole-thread `DELETE` of the disposable refusal-mode thread.
  **No migrations. The Work is read-only for the entire lane.**

**Stop conditions — report, never work around:** wrong SHA · dirty worktree · any
non-mutation fingerprint that moves · any instrument assertion that FAILs · an Ask refusal
outside the designed set · any recurrence of a hook-order or render fault.

---

## Step 1 · Verify SHA and worktree

Per **Witnessing location** above. Both are hard conditions. Record verbatim.

## Step 2 · Confirm the substrate has not drifted

Read-only, cheap, and **not** a re-derivation. Agreement is *not* a new finding; report it
as `UNCHANGED`. Disagreement **is** a finding: report and stop.

```bash
psql "$DATABASE_URL" -c "SELECT filename, checksum, applied_at FROM schema_migrations
  WHERE filename='20260901000001_ask_threads.sql';"
psql "$DATABASE_URL" -c "SELECT count(*) FROM manuscript_draft_sections s
  JOIN manuscript_working_drafts d ON d.id=s.draft_id
 WHERE d.manuscript_id='a3ae67fd-a21e-4948-8766-4c397d2e4712';"
```

Expected: the migration row with checksum
`f439254d1cf3190a0963b524fcb01e397d35049ca47b495340a824f26682aca8`, and `174`.

## Step 3 · Non-mutation baseline — the target Work only

Inherited unchanged from the predecessor's Step 5. Take it **before** anything is asked and
identically **after** Step 5 of this charter.

**FULL ROWS, NOT CHOSEN COLUMNS** — `to_jsonb(row)` cannot omit a column, and a column
added later is covered automatically.

```sql
\set mid 'a3ae67fd-a21e-4948-8766-4c397d2e4712'
\set pid 'e6cabcc4-a506-4ea7-aa89-9b23b450ca74'

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

Also record `canonicalFingerprint`, and — scoped to this Work — `count(*)` of `ask_threads`
and `ask_turns`. Those two counts are the **only** things permitted to change, by exactly
one thread and its turns.

For reference, the values `01Dx` recorded at `93216567` on 2026-09-01, unchanged across its
whole run: `proposal 64fae7bd…` · `draft 7d47966d…` · `sections d4cf0cfa…` ·
`source 23d7efdc…`. **Reference only — re-measure, do not assume.**

## Step 4 · The machine witness — the fourteen assertions

Inherited from the predecessor's Step 6, with the marker line numbers **re-pinned to this
tree**. The instrument must establish, before any human judgement is invited:

1. **Identity** — running SHA, Node/Next runtime, `current_database()`, host, port, user.
2. **Target** — the manuscript, the proposal, and that the proposal belongs to it.
3. **The 174** — section ids and positions re-read, count = 174, byte round-trip true.
4. **Schema/trigger state** — the six migrations' objects present, including
   `ask_turns_no_update` and `ask_threads_no_repoint`.
5. **Verified session authentication** — a real `auth_sessions` session; a call with no
   session 401s.
6. **A real browser opens the review surface** for that proposal.
   **This is the assertion the predecessor died on.** At `93216567` the surface crashed to
   an error boundary before rendering. Here it must mount. A recurrence is a **DEFECT**,
   reported and stopped on, not repaired.
7. **It clicks an actual `data-mark-question` control** — `StructureReview.tsx:1058` at this
   SHA — not a synthesized event on a div.
8. **The Ask room opens *from that mark*** — not from the inspector's separate per-question
   affordance. The mark and the room must be the same act.
9. **The submitted request carries the exact frozen `questionIndex`** the mark rendered.
   `takeUpMark` (`:371` at this SHA) consumes `questionMarks` — the questions owned by that
   row, by deepest containing division — and opens directly only when the row owns exactly
   one.
10. **An open-tag marker routes to `division`, never an inferred `UncertainRegion`.** Click
    `data-mark-open` (`:1074` at this SHA) and assert the outgoing anchor is
    `{on:'division', proposalId, unitId}`. A tag is not a region.
11. **Thread ownership** — the persisted `ask_threads` row carries the correct
    `manuscript_id` and `member_id`.
12. **Frozen reading identity and a real `canonicalAtOpen` persist. Binary — a lawful
    refusal is not a pass.**

    ```
    PASS         thread persisted · canonical_at_open non-empty
                 canonical_at_open == the Step-3 canonical fingerprint
    INCOMPLETE   canonical_unmeasurable 503 · no thread opened
    /HOLD
    ```

13. **Ask has no body-read or tool capability — two evidence classes, never merged.**

    ```
    runtime (the instrument observes)
      the browser's Ask request carries only the expected envelope —
      anchor (or threadId) and question, nothing else

    machine / source contract (a test proves, on this exact SHA)
      lib/manuscript/__tests__/providerSeamMigration.test.ts:217
      lib/manuscript/ask/frozenReading.ts:122
    ```

    Run that targeted test at `58ac95a77` and report it under its own heading, in this
    shape — the predecessor's result is context, not evidence:

    ```
    providerSeamMigration
    PREDECESSOR: passed at 93216567
    SUCCESSOR:   rerun at 58ac95a77
    VERDICT:     <whatever this run actually observes>
    ```

    It is **not** a browser-runtime observation and must not be labelled one.
14. **Before/after full-row fingerprints unchanged** — draft, sections, source, proposal,
    plus the canonical fingerprint.

## Step 5 · The single paid call — through the marker, not around it

One call, through the real UI marker, by the instrument, on the target proposal. Not curl,
not a synthesized POST.

**Authentication.** `x-member-id` alone will **401**. `getMemberIdFromRequest` requires a
verified session — the `maia_session` cookie or `x-session-token` resolved against
`auth_sessions`. **`$TOK` is never printed into the witness record.** Record only that a
verified session was used and which member it resolved to.

### Acceptance semantics — three outcomes, one closes the slice

```
ACCEPTED — 02c-2 witnessed at runtime on the repaired tree. All of:
  HTTP 200 · exactly one real thread on the target Work
  author turn present · MAIA turn present · answer_provenance present
  the exact clicked anchor persisted (frozen questionIndex, or division+unitId)
  all four Work fingerprints unchanged

HOLD / INCOMPLETE — lawful behaviour, witness not closed. Any of:
  anchor_requires_reading 422 · anchor_reading_mismatch 409
  anchor_unresolved 404 · anchor_unknown 422
  canonical_unmeasurable 503 (no thread persisted)
  unreachable / empty_answer 502 (thread and author turn persist, MAIA turn does not)

DEFECT — stop and report. Any of:
  a 500, or any status outside the two sets above
  a refusal whose branch the source does not explain
  any Work fingerprint moved
  the persisted anchor differs from the one the marker rendered
  any render or hook-order fault
```

**"Green" is reserved for ACCEPTED.** Then re-run Step 3, compare, and delete the
instrument.

## Step 6 · Return the evidence and stop

```
SHA verified            <rev-parse> == 58ac95a77…            yes/no
Detached HEAD           <branch --show-current> empty?       yes/no
Witness worktree        /private/tmp/ws2-02c-2r-runtime-witness
Worktree clean          <porcelain>                          yes/no
Runtime identity        node / next / db / host / port / user
Target                  manuscript · proposal · belongs? yes/no
Substrate drift         migration 6 checksum · 174 rows      UNCHANGED / MOVED(<what>)
Fingerprints before     draft / sections / source / proposal (full-row) / canonical
Surface mounts          assertion 6 — PASS / DEFECT(<the fault>)
Instrument              14 assertions: PASS / FAIL / INCOMPLETE each
                        (assertion 12 is binary — a 503 is INCOMPLETE, not PASS)
Ask call                ACCEPTED | HOLD(<which refusal>) | DEFECT(<what>)
                        status · thread id · turn indexes · answer_provenance present?
                        persisted anchor == the anchor the marker rendered?
                        (session verified: yes · token NOT recorded)
Seam contract test      providerSeamMigration.test.ts — PREDECESSOR passed at 93216567 /
                        SUCCESSOR rerun at 58ac95a77 / VERDICT <observed>
                        (a new observation; machine-source evidence, NOT a browser one)
Fingerprints after      same five — EQUAL / NOT EQUAL
ask_threads/ask_turns   before → after (target Work only)
Instrument removed      deleted? yes/no
Defects found           <none | list, each with the exact observation>
```

What this run can and cannot deliver:

```
machine:
  marker → exact anchor → route → persistence → MAIA → no Work mutation

then Kelly:
  "Is MAIA actually talking intelligently about the thing I clicked?"
```

The second line has no machine witness and none should be built to fake one. The first is
reached only on an **ACCEPTED** run.

The lane's success condition is **an honest report**, not an ACCEPTED. A HOLD at Step 5 with
the refusal branch named is a complete run. So is a DEFECT, reported and not repaired.

---

## Provenance of this charter

Written in a cloud session that **cannot** execute it — no Mac Studio, no Postgres, no
minisforum. Marker line numbers (`:371`, `:1058`, `:1074`) were read from
`StructureReview.tsx` at `58ac95a77` and differ from the predecessor's because the repair
shifted them; the ancestry `93216567 → 58ac95a77` was verified with `git merge-base`. The
settled prerequisites come from read-only queries run on the Mac Studio on 2026-09-01 and
from the `01Dxk7Q9` transcript recovered from disk, both recorded in
`WS2-05B-8B-02c-2_WITNESS_RERUN_CLARIFICATION_3.md`. The 174 and the two frozen ids remain
the founder's expectation carried into queries that can falsify them.
