# WS2-05B-8B-02c-2 · LOCAL RUNTIME WITNESS — fresh run, Execution Clarification #3

## Witnessing location

**Every witness instruction must name the exact SHA being witnessed and the exact worktree
from which it is being witnessed. Before Step 1, the witness must verify both
`git rev-parse HEAD` and the worktree path. A shared checkout path is not evidence of
repository state, and no checkout may be treated as implicitly frozen.**

```bash
pwd                        # MUST equal the worktree the instruction names
git rev-parse --show-toplevel
git rev-parse HEAD         # MUST equal the SHA the instruction names
git status --porcelain     # MUST be empty
```

Why this rule exists: on 2026-09-01, `/Users/soullab/MAIA-SOVEREIGN` was checked out at
`93216567` and was being reasoned about by one lane as the frozen witness tree, while a
second lane committed a repair into it. The path did not change; the repository state did.
Hours were then spent searching for work that was never lost — it was simply in a different
tree than the one assumed. **A location is not an identity.** Naming the SHA makes the
assumption checkable; naming the worktree makes it addressable.

This rule is procedural and applies to every witness lane. It does not alter this run's
DO-NOT-START state, its migration assumptions, or its witness procedure.

---

> **THE STEP-6 FAILURE IS RESOLVED, AND IT WAS THIS REPOSITORY'S OWN DEFECT.** On
> 2026-09-01 the `01Dxk7Q9` transcript was recovered from disk
> (`~/.claude/projects/-Users-soullab-MAIA-SOVEREIGN/bbb2bdfd-….jsonl`, 62 records,
> 03:24:44Z–03:49:44Z). Step 6 failed because `StructureReview.tsx` violated React's
> hook-order invariant and crashed to an error boundary — **the exact defect repaired
> in `58ac95a77` on `fix/ws2-05b-02c-2r-structure-review-hook-order`.**
>
> **The consequence for any rerun is the important part: `93216567` still carries the
> defect.** A witness run pinned to the frozen SHA will reproduce the same Step-6
> failure, deterministically. The rerun must be **re-pinned to a tree containing the
> repair** — `58ac95a77` or a merge carrying it — or it is guaranteed to fail.

**Status of the prior runs:**

| Session | Stop | Standing |
|---|---|---|
| `session_012vWvD8jt9DucdD28bvs5iF` | Step 2 | `HOLD / INCOMPLETE`. Not superseded, not continued. Its Step 8 block stands as that run's record, but is **no longer load-bearing** — its census was re-derived from the database directly. |
| `session_01Dxk7Q9RFrEPK9W3joK4vPd` | Step 6 assertion failure | Its **database effects are now known** (it applied migration 6 at 03:27:09 UTC). Its **Step-6 assertion is still unextracted**, and is the sole remaining blocker. |

---

## Evidence adjudication — 2026-09-01, read directly from the database

Read-only queries against `maia_consciousness` on the Mac Studio. This supersedes both
witness transcripts as the source of truth for database state; a transcript is a memory of
the database, the database is the database.

**Step 2 · six-migration census — COMPLETE**

| # | Migration | Ledger row | Schema object | Verdict |
|---|---|---|---|---|
| 1 | `20260830000001_manuscript_draft_sections` | absent | `manuscript_draft_sections` + both draft columns present | unledgered substrate |
| 2 | `20260830000002_manuscript_structure` | absent | `manuscript_structure_units`, `manuscript_structure_members` present | unledgered substrate |
| 3 | `20260830000003_manuscript_structure_contiguity` | absent | `manuscript_structure_units_sibling_order` + both contiguity triggers present | unledgered substrate |
| 4 | `20260830000005_manuscript_structure_proposals` | absent | `manuscript_structure_proposals` present | unledgered substrate |
| 5 | `20260831000001_structure_proposal_reader_provenance` | absent | `reader_provenance` present **and** freeze function body covers it (`true`) | unledgered substrate |
| 6 | `20260901000001_ask_threads` | **present**, `applied_at 2026-08-31 23:27:09-04` | `ask_threads`, `ask_turns`, `ask_turns_no_update`, `ask_threads_no_repoint` all present | **already applied · checksum matches · DO NOT RERUN** |

Migration 6 checksum, both sides: `f439254d1cf3190a0963b524fcb01e397d35049ca47b495340a824f26682aca8`.
No ledger/checksum conflict anywhere. The five absent ledger rows are absent *uniformly*;
their schema objects are *uniformly* present.

*Inference, not evidence:* the asymmetry is most simply explained by migration 6 going in
through the migration runner (which records a ledger row) while 1–5 went in by some path
that did not. Nothing in the database establishes this. Do not carry it as a finding.

**Step 3 · GO — measured, not assumed**

```
section_addressable_at   2026-08-30 13:13:48-04    NOT NULL   OK
section_rows             174                       exactly    OK
round_trip_ok            t                                    OK
proposal e6cabcc4…       manuscript_id = a3ae67fd…            OK
```

Draft `48ccfc89-23f8-4c73-bc58-4d28441be9ac`, 380,343 content chars, revision 6,
`section_conversion_version` 25. Proposal `review_revision` 0, `reviewed_at` and
`adopted_at` both null, `reader_provenance` present. **All four charter GO conditions met.**

**Who applied migration 6.** `03:27:09Z` falls inside `01Dxk7Q9`'s window
(03:24:31Z–03:38:01Z) and after `012vWvD8` had already stopped (03:21:07Z). `01Dx` applied
it, three minutes into its run. Since the charter permits that only under a Step-3 GO, `01Dx`
very likely passed Step 3 — *inference from the charter, not evidence; the transcript must
confirm it.*

**`ask_threads` and `ask_turns` are both empty (0 rows).** Either no thread was ever created,
or one was created and removed under the Step-6 whole-thread `DELETE` the charter authorizes.
Row counts cannot separate these. **UNKNOWN** — only the transcript settles it.

**The `question_count = 0` lead is REFUTED — and it exposed a charter defect.** The
proposal carries **five** editorial questions. The zero came from the charter's own Step-3
probe reading `interpretation->'questions'`, which is the wrong path; the questions live at
`editorialSynthesis.questionsForAuthor`. `01Dx` caught this at 03:27:49Z and recorded it
correctly as *"noted, not a GO condition."* The five, from the transcript at 03:27:42Z,
begin: *"Does Part Two begin at the Sacred Flame, or earlier?"* (4 sectionIds).

**Charter defect to fix before any rerun:** the Step-3 question-count query reads a path
that does not exist and will always return 0. It is not a GO condition, so it did not
corrupt the verdict — but it is a false instrument and it misled this adjudication once
already. Correct the path or drop the probe.

## Step 6 · what actually failed — recovered from the transcript

| | |
|---|---|
| **Instrument** | `/tmp/ws2-05b-02c-2-runtime-witness.ts`, 176 lines, written 03:31:18Z against a controlled dev server the lane started itself (`base=http://localhost:3131`) — no pre-existing server was credited as the frozen slice |
| **Progress before failure** | `[PASS] 1 identity` · `[PASS] 2 target/proposal` · session token acquired (03:32:40Z) |
| **Failure** | 03:33:17Z, browser console: *"React has detected a change in the order of Hooks called by %s. This will lead to bugs and errors if not fixed."* |
| **Diagnosis in-session** | early return at line 344 (`if (!view)`) sitting above `takeUpMark = useCallback` at line 378; blamed to `e586c4189` and `b9e55c7e5` (03:33:26Z–03:34:02Z) |
| **Verdict recorded** | 03:34:58Z — *"`StructureReview.tsx` crashes to an error boundary on every load. The review surface never renders, so the marker 02c-2 exists to prove is unreachable at runtime."* |
| **Classification** | **implementation behaviour** — a real product defect, not a witness assumption, not database state, not environment |

**The lane behaved correctly.** It stopped at the defect rather than repairing it, exactly as
the charter requires of a witness lane. Fingerprints before (03:27:21Z) and after (03:34:21Z)
are identical — `proposal 64fae7bd…`, `draft 7d47966d…`, `sections d4cf0cfa…`,
`source 23d7efdc…` — so no non-mutation fingerprint moved. The instrument was deleted and the
worktree verified still at `93216567` with only `?? .jarvis/` (03:34:37Z). A clean stop.

**Migration 6, confirmed from the transcript as well as the database.** 03:27:09Z:
`=== STAGED === 20260901000001_ask_threads.sql === APPLY === COMMIT INSERT 0 1 ✅ Applied`.
The earlier inference that `01Dx` applied it is now direct evidence.

---

## Paste this as the opening message of the fresh Mac Studio session

You are the lane **Jarvis — 02c Local Runtime Witness**, lane identity
`WS2-05B-8B-02c-2 · LOCAL RUNTIME WITNESS`.

Runtime, frozen:

```
branch  claude/jarvis-roadmap-sequence-k5d1n3
SHA     93216567b1c06c7105db492f9d00b2395de53b36
```

Charter, frozen — read it in full before acting:

```
commit 23ae81498970df7684c6f49830dfe86fe601c500
file   docs/ops/WS2-05B-8B-02c-2_LOCAL_RUNTIME_WITNESS_CHARTER.md
```

Execute the charter as written, with one addition.

### Execution Clarification #3 — as amended 2026-09-01

**First paragraph — SUPPORTED by the census, stands unchanged:**

For this Mac Studio development database only, migrations 1–5 are accepted as pre-existing,
behaviourally witnessed substrate despite missing ledger rows. Record the ledger anomaly, but
do not reapply those migrations and do not backfill their ledger entries.

**Second paragraph — CONTRADICTED by the census, WITHDRAWN.** It read: *"Migration 6 remains
unledgered and absent from schema. Proceed to Step 3 before applying it."* Both halves are
false. Migration 6 is ledgered, present, and checksum-clean; Step 3 already passes. It is
replaced by:

> Migration 6 is already applied, with a matching checksum. Under the Step-2 matrix this is
> *"ledger row + matching checksum → already applied; DO NOT RERUN."* Nothing in the six-row
> matrix is eligible to apply. **Step 4 has nothing to do.**

**Consequence for the shape of any fresh run.** Steps 2 and 3 are settled. A rerun re-verifies
them cheaply (read-only, ten seconds) and must **not** treat re-measurement as new evidence if
it agrees. The substantive work begins at Step 5.

### Step 3 — already measured; re-verify only

Step 3 was measured against the live database on 2026-09-01 and returned **GO**. A fresh run
re-runs these read-only probes to confirm nothing drifted, and continues. **Agreement is not a
new finding.** Disagreement is a real one: report it and stop.

Probes, all scoped to `$MANUSCRIPT_ID`:

| Probe | Required value |
|---|---|
| `section_addressable_at` | non-null? |
| `section_rows` | exactly 174? |
| `round_trip_ok` | true? |
| proposal `e6cabcc4-a506-4ea7-aa89-9b23b450ca74` | belongs to manuscript `a3ae67fd-a21e-4948-8766-4c397d2e4712`? |

Then:

- **Step-3 STOP** → report the exact Step 3 evidence verbatim and **halt**. Do not apply
  migration 6. Do not continue.
- **Step-3 GO** → apply **only** `20260901000001_ask_threads.sql`, then **continue**
  through the runtime witness and the paid Ask, per the charter. Do not stop for
  re-adjudication at this point.

### Standing constraints (unchanged)

- Witness lane, not a build lane. No redesign, no refactor, no "improve while in there."
- No git branch, no commit to `claude/jarvis-roadmap-sequence-k5d1n3`. Repo stays
  byte-frozen at `93216567`.
- Do not run the section conversion service.
- Do not touch minisforum or production.
- One ephemeral instrument permitted: `/tmp/ws2-05b-02c-2-runtime-witness.ts`,
  outside the repo, uncommitted, deleted after the run. If it exposes a product
  defect, the lane still stops — it may not repair it.
- Authorized writes only: migration 6 under GO; the `ask_threads` / `ask_turns` rows
  the witness produces; the whole-thread `DELETE` of the disposable refusal-mode
  thread at Step 6. **The Work is read-only for the entire lane.**
- Stop conditions — report, never work around: wrong SHA · dirty worktree ·
  **a Step-2 STOP row, as narrowed below** · STOP at Step 3 · any non-mutation
  fingerprint that moves · any instrument assertion that FAILs · an Ask refusal outside
  the designed set.

### Step-2 stop conditions, as narrowed for this rerun only

Clarification #3 exempts five rows that the unmodified charter would stop on. This
narrowing is what makes the exemption operative — without it the lane stops on exactly
the rows #3 accepted.

```
Step-2 rows 1-5:
  PRE-EXISTING BEHAVIORALLY WITNESSED SUBSTRATE
  ledger anomaly recorded
  NOT a STOP
  do not reapply
  do not backfill

Migration 6:
  evaluate normally from current DB state

All other Step-2 STOP conditions remain active.
```

The narrowing is scoped to Step-2 rows 1–5 on this Mac Studio development database, for
this rerun. It does not amend the charter and does not carry to any other lane or host.
