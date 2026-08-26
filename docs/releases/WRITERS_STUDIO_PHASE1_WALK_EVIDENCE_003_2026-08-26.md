# Writer's Studio Phase 1 — Walk Evidence Record 003

> ⏳ **STATUS: IN PROGRESS.** This record is **open**. P0-M is recorded and closed; P0-D has not
> been executed. When P0-D runs, its deployed-candidate witness, raw SQL evidence, `verifyCustody`
> result and resulting verdict are **appended here** — founder ruling, 2026-08-26. A new evidence
> number means a genuinely new attempt or a new candidate **after** Run 003 fails or is aborted;
> it does not mean "the next thing that happened."

> **This is the evidence record, not the specification and not an acceptance decision.**
> It supersedes nothing in records 001 or 002. 001 recorded P0 against canonical; 002 recorded the
> mechanism against an assembled v2 candidate and stands as v1.0 evidence, not re-judged. This
> record judges the **v4 candidate** against **Frozen v1.1**, in which P0 is split into P0-M and
> P0-D and passes only when both do. **It authorizes nothing.**

## Run identity

| Field | Value |
|---|---|
| Specification version | **1.1**, frozen 2026-08-24; freezing commit `e5f36d83ce4a449f5a59aab5c5bc75ec71cb6f87`, sealed by `4a551d3d1` |
| Run | 003 |
| Date | 2026-08-26 |
| Status | **IN PROGRESS** — P0-M closed, P0-D owed |

### Release candidate — assembled

| Field | Value |
|---|---|
| **Candidate SHA** | `83efa86df2e6b5d158bbf4d478061c29a5a8e409` |
| **Tree** | `3d0a7116653c40b467317a998e278e081518a0ba` — the evidence below binds to this tree |
| Branch | `feature/ws-01-source-custody-v4` |
| Base | `7531a92901afa59257baa17df60f755ee3014654` (canonical, incl. PR #1102) |
| Parents | `7531a9290` + `4a551d3d1` |
| Assembled by | **Merge**, not cherry-pick. Replaying the v3 commits would mint new SHAs and force a re-seal, making the standard v1.2 by accident. Merging keeps the v1.1 freezing commit `e5f36d83c` a genuine ancestor, so the seal is true as written |

**Why a new candidate.** The v3 candidate `4a551d3d1` lost deployment correspondence, and the
runtime substrate subsequently reached canonical through PR #1096 — an integration merge that did
**not** complete the frozen acceptance walk. Pinning canonical would let an unwalked merge become
the accepted object retroactively; canonical also carries the walk specification at `Draft`, which
is not executable. Redeploying v3 would roll production backward to prove code whose exact bytes
are already present in the forward-moving system.

⛔ **Ancestry is inherited; acceptance is not.** This is not retroactive acceptance of #1096.

### Candidate gate — PASS

Cumulative diff against the base is **three files, all documentary**, and contains **none** of the
prohibited surfaces (`app/writers-studio/canvas/**`, `components/canvas/**`, `app/book-studio/**`,
any PR #995 implementation):

```text
A  docs/design/contracts/manuscript-room.md
M  docs/product/WRITERS_STUDIO_PHASE_1_WALK_SPECIFICATION.md
A  docs/releases/WRITERS_STUDIO_PHASE1_WALK_EVIDENCE_002_2026-08-24.md
```

**Runtime delta against canonical: 0 files.** All ten WS-01 runtime files are byte-identical to
canonical. The candidate adds no runtime code; what it carries is the **executable standard** —
canonical's copy of the walk specification reads `Current status: Draft`, this one reads
`Current status: Frozen — version 1.1, frozen 2026-08-24`, blob `93d9edcab7`, identical to the seal.

### Fixture baseline

A disposable fixture member, created and destroyed inside the witness run. **No real member's
manuscript was used.** Environment: local PostgreSQL 16.13 + a local filesystem vault, not
production. Cluster and vault destroyed after the run.

---

## Verdicts

| Step | Verdict | Notes |
|---|---|---|
| **P0-M — mechanism** | **`PASS`** | **27** witness controls + 23 unit tests, all passed. Migration idempotency is proven separately, not counted among the 27. See below |
| **P0-D — deployed candidate** | **`NOT EXECUTED`** | Exclusive deploy lease not yet established |
| **P0 — source custody** | **`NOT CLOSED`** | v1.1: P0 passes only when both P0-M and P0-D do |
| A–H | `NOT REACHED` | The human walk has not been executed |
| G1 · final felt criterion | `NOT REACHED` | Founder gates |

---

## P0-M — the evidence

Migration `20260824000001` applied to a real PostgreSQL 16.13 database, then **applied a second
time and completed cleanly** — idempotent, as the repository's migration convention requires.

⛔ **Migration idempotency is a separate proof.** It is not one of the 27 witness controls. The
27 enumerate as: **11** file-backed · **2** negative leg · **8** pasted leg · **5** omission
witness (1 lossless accounting + 4 line witnesses) · **1** fixture cleanup. The witness prints a
final `P0 WITNESS: ALL CONTROLS PASSED` summary line, which is **not** a control — counting it is
how this record briefly read 28.

### File-backed leg

| # | Control | Result |
|---|---|---|
| 3 | Source arrival row exists | PASS |
| 4 | Persisted with artifact custody, before any interpretation | PASS |
| 6 | `SHA-256(recovered from vault) === SHA-256(arrived)` — `c2ff1f196afc…` | PASS |
| 6b | Recovered bytes byte-for-byte identical | PASS |
| 7 | Source text stored independently, with its own hash | PASS |
| 7b | For a plain-text artifact the two hashes coincide — no silent normalization | PASS |
| 7c | For a non-identity extraction the two hashes **diverge** (`mammoth-convertToMarkdown`), so a changed extraction stays distinguishable from a changed artifact | PASS |
| 8 | Extractor identity and version recorded — `utf8-decode` / `node-buffer-utf8` | PASS |
| 9 | Manuscript claims the correct arrival | PASS |
| 9b | Manuscript labelled `source_custodied` | PASS |
| 10 | `verifyCustody` → PASS (`artifact_recovered`) | PASS |

### The negative leg — what makes the ruling load-bearing

The stored artifact was deleted while every database column was left intact.

| Control | Result |
|---|---|
| `verifyCustody` → **FAIL** (`artifact_missing`) | PASS |
| The hash was still in the database, so the refusal was not incidental | PASS |

**A hash without recoverable bytes is not accepted as source custody.** Verification reads the
bytes back and re-hashes them; it does not take the row's word.

### Pasted leg

| Control | Result |
|---|---|
| `source_kind = member_supplied_text` | PASS |
| `artifact_ref` NULL | PASS |
| `artifact_hash` NULL | PASS |
| `artifact_size` NULL | PASS |
| `original_filename` NULL | PASS |
| Source text is the exact confirmed text | PASS |
| `verifyCustody` PASS for a paste (`member_supplied_text`) | PASS |
| Giving a paste artifact provenance **fails structurally** | PASS |

The refusal came from the database — constraint `manuscript_source_arrivals_kind_fields` — not
from convention.

### Omission witness

Fixture `TITLE / SUBTITLE / AUTHOR NAME / First real paragraph.` — the shape that made the
known-bad implementation drop consecutive headings.

```text
arrived lines    4
accounted lines  4
lossless         true
```

Every arriving line is still present in the stored source witness: `TITLE`, `SUBTITLE`,
`AUTHOR NAME`, `First real paragraph.`

### Unit suite

`lib/manuscript/source/__tests__/sourceCustody.test.ts` — **23 passed, 0 failed**, including
stacked headings and headings trailing the end of the document.

### Reproducibility

```bash
DATABASE_URL=... FILE_STORAGE_PATH=... WS01_WITNESS_CONFIRM=1 \
  npx tsx scripts/verify-ws01-source-custody.ts
```

Guarded behind `WS01_WITNESS_CONFIRM=1`. Creates a disposable fixture member, exercises the real
code paths, and deletes everything it made. Final line: `P0 WITNESS: ALL CONTROLS PASSED`.

---

## P0-D — NOT EXECUTED

```text
STATUS   NOT EXECUTED
REASON   exclusive deploy lease not yet established
```

An exclusive production deploy lease is required and is **held, not released**: one lane
acknowledging the hold does not activate the lease. P0-D is invalidated if **any** production
deployment occurs during the witness interval.

⛔ **P0-D may not be satisfied locally, by an agent-driven browser, or by re-running the
mechanism.** It requires, in order:

1. deployment of the **exact** candidate `83efa86df`
2. running `GIT_COMMIT` + `DEPLOY_LANE` verification against the live container
3. two **real authenticated member arrivals** — one file-backed `.docx`/`.pdf` through the actual
   ingest HTTP path, one pasted/member-supplied text through the actual member path
4. raw server-side SQL evidence capture — `artifact_extraction` → recoverable artifact/bytes
   relationship; `member_supplied_text` for the paste; no arriving content silently lost
5. `verifyCustody`
6. PASS / FAIL / ABORT determination

`scripts/verify-p0d.ts` may serve only as a read-only supporting witness. **Its process exit code
is not sufficient evidence** — it can skip unclaimed arrivals. Capture the raw rows.

**Inadmissible:** HTTP success alone · section counts · immutable `manuscript_sections` · a UI
label reading "Source" · the absence of later `UPDATE` statements.

When P0-D runs, append its results to **this record**. Do not open Evidence 004 for it.

---

## Scope of this verdict — what P0-M PASS does and does not mean

**Proven:** the mechanism, against a real PostgreSQL and a real filesystem vault, through the real
migration and the real code paths, including both negative legs. The evidence binds to the tree
`3d0a7116653c`, so it covers the candidate exactly.

**Not proven, and not claimed:**

- **Not the production deployment.** Nothing was deployed or migrated on minisforum. The session
  that produced this record has no `ssh` binary and no route to it.
- **Not through the member's HTTP path.** The witness calls the library functions directly. The
  member-facing import path is walk act **C**, and remains `NOT REACHED`.
- **Not on a real manuscript.** *Elemental Alchemy* is deliberately not the first fixture; it
  becomes a later real-manuscript witness once the mechanism is proven in place.
- **Not acceptance.** Assembling, naming and pinning a candidate is not acceptance. Acceptance
  begins only when the candidate is deployed and witnessed under the frozen standard, and closes
  only by explicit Founder Acceptance.

---

## A note on the parallel assembly

Two lanes assembled a v4 candidate independently and converged on the **same tree**
`3d0a7116653c` from the same two parents. The duplicate commit envelope `0b2f985ed` was never
pushed and has been deleted; `83efa86df` is the sole named candidate because it was named first.
There is no rival object — only a discarded envelope. Recorded because a future reader finding two
SHAs with one tree deserves the explanation rather than the ambiguity.

---

## P0-D — the deployed-candidate witness

Executed 2026-08-26 by the founder on minisforum, against the running container. Both legs
witnessed on the same deployed candidate; the running identity was read before and after each
window and did not move.

```text
RUNNING IDENTITY   GIT_COMMIT   83efa86df      (before AND after both windows)
                   DEPLOY_LANE  deploy-lane
```

### Leg 1 — file-backed arrival (`artifact_extraction`)

Arrived 2026-08-26 01:46:59Z, after the 01:44 deploy of this candidate; witnessed at ~01:50Z.

```text
claimed                t
source_custody         source_custodied
artifact_ref/hash/size present, all three
verifyCustody          custodied=true   reason=artifact_recovered
```

`artifact_recovered` is the load-bearing word: the bytes were re-read from the vault and
re-hashed at witness time, so what passed is that the original is genuinely **recoverable**, not
merely that a row says so.

### Leg 2 — pasted arrival (`member_supplied_text`)

Arrived 2026-08-26 16:28:07Z through the member-facing import form at
`/press/manuscript?import=1` — the textarea path, confirmed with **Import into Author Studio**
and then **Save manuscript**. Manuscript `094d0a2a-e2fd-4e9e-8a91-26cf293acb0e` ("Transcription",
~5 pages), which opened in the Writer Canvas and reported `saved`.

```text
source_kind            member_supplied_text
artifact_ref           NULL
artifact_hash          NULL
artifact_size          NULL
claimed                t
source_custody         source_custodied
verifyCustody          custodied=true   reason=member_supplied_text
```

All three artifact fields NULL is the whole point. A pasted arrival that carried artifact
provenance would be the precise failure WS-01 exists to make impossible — text presented as an
extracted file, so a later reader believes an original exists that never did. The CHECK
constraint makes that row unwritable; this witness confirms the real path produces the honest one.

### Raw rows as read

```text
     source_kind      | ref_null | hash_null | size_null | claimed |  source_custody  |          created_at
----------------------+----------+-----------+-----------+---------+------------------+-------------------------------
 artifact_extraction  | f        | f         | f         | f       |                  | 2026-08-25 15:47:44.142729+00
 artifact_extraction  | f        | f         | f         | f       |                  | 2026-08-26 01:34:31.535763+00
 artifact_extraction  | f        | f         | f         | t       | source_custodied | 2026-08-26 01:46:59.10073+00
 member_supplied_text | t        | t         | t         | t       | source_custodied | 2026-08-26 16:28:07.472422+00
```

Rows 1 and 2 are **unclaimed** — recorded arrivals the member never confirmed into a manuscript.
Not failures, and not counted: an arrival with no manuscript is a member who changed their mind.
Reported here rather than filtered, because a future reader counting four rows and two passes
deserves the reason.

### One honest limit of the supporting witness

The `scripts/verify-p0d.ts` inside the running container reported `arrivals found: 1`. It windows
its read to roughly the last hour, so this run saw only the pasted arrival. That is why the raw
SQL above is the authoritative read and the script is the `verifyCustody` confirmation — exactly
as this record required in advance. The file-backed leg's `verifyCustody` result is the one
captured at ~01:50Z, on this same candidate, and row 3 above confirms that binding still holds.

A two-leg version of the script now travels with the ship candidate so a future witness does not
depend on a run-time window and reports each leg by name.

### The two legs were witnessed ~15 hours apart

Deliberate and admissible: the requirement is both legs on the **exact deployed candidate**, not
both within one sitting. `GIT_COMMIT` was verified as `83efa86df` at the start and end of each
window, and no deploy occurred between them — the production hold held, which is what the hold is
for.

---

## P0 verdict

```text
P0-M  MECHANISM        PASS   27/27 witness controls · 23/23 unit · both negative legs
P0-D  DEPLOYED         PASS   both legs on 83efa86df, running identity verified either side
P0    SOURCE CUSTODY   PASS
```

What arrived is preserved before anything interprets it, and the system cannot claim a provenance
it does not have. That is the whole of P0, and it now holds on the deployed candidate rather than
only in a test harness.

---

## State after this run

```text
WALK SPECIFICATION     FROZEN v1.1
CANDIDATE              83efa86df2e6b5d158bbf4d478061c29a5a8e409
CANDIDATE TREE         3d0a7116653c40b467317a998e278e081518a0ba
CANDIDATE GATE         PASS
P0-M  MECHANISM        PASS
P0-D  DEPLOYED         PASS
P0    SOURCE CUSTODY   PASS
MEMBER WALK A–H        A–C REACHED (import form, confirm, save — the pasted leg walked them)
G1 / FINAL CRITERION   AWAITING FOUNDER ACCEPTANCE
FINAL VERDICT          AVAILABLE — P0 closed; acceptance is the founder's act, not this record's
FOUNDER ACCEPTANCE     PENDING
WS-01 STATE            IN ACCEPTANCE — P0 closed
CANVAS FREEZE          BINDING until acceptance
DEPLOY                 HOLD until acceptance
MEMBER ACTS            HOLD until acceptance
EVIDENCE RECORD 003    OPEN — closes on Founder Acceptance
```

⛔ **This record does not accept WS-01.** Assembling evidence is not acceptance; P0 passing is not
acceptance. Acceptance is an explicit founder act, and the deploy hold stands until it is given.
