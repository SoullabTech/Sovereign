# Superseding custody correction — one-day-forward date contamination

**Founder-found 2026-09-09 · repair AUTHORIZED and EXECUTED under the founder's repair invariants**
**Supersedes the first draft of this record (commit `87bbc2dd5`), which repaired in-text dates only.**

> ⭐ **RULING CARRIED FORWARD (founder):** *The September 10 error is a one-day-forward custody
> contamination propagated across the September 9 Writer's Studio governance run. Repair is
> authorized only as a provenance-preserving correction. No Git-history rewrite, substantive
> reconsideration, adoption-state change, falsifier-state change, or D9 movement is authorized.*

---

## 1 · ⭐ THREE DATES, NEVER ONE FIELD (founder precision)

```text
ACT DATE      when the founder ruling / witness / acceptance ACTUALLY occurred
              2026-09-09 EDT   [contemporaneous session record]

RECORD DATE   when the artifact was COMMITTED
              2026-09-09 EDT   [Git chronology — independent]

CLAIMED DATE  the date WRITTEN INTO the contaminated artifact
              2026-09-10       ⛔ FALSE
```

⚠️ **Recovery-authority precision, founder-corrected and accepted:** **Git proves the RECORD date.
The session record proves the ACT date.** ⛔ **Commit timestamps alone must not be made to prove the
date of every human act** — they are excellent independent evidence against a document's claim that
an *already-completed* act occurred later, which is exactly this case. **Together they form the
recovery chain; neither alone does.**

## 2 · ⭐ FORENSIC QUESTION — **ANSWERED**

**The founder recorded `absolute introduction — NOT YET ESTABLISHED`. It is now established.**

```text
FIRST INTRODUCTION   03b96911d · 2026-09-09 10:37Z · 06:37 EDT
                     docs(ws2-develop): D8 walk cell A/M1 — The Margin, wordless difficulty
                     created JARVIS-WS2-DEVELOP_D8_WALK_A1_2026-09-10.md

LATEST PROPAGATION   2a2ddf1f8 · 2026-09-09 12:46Z · 08:46 EDT   (Law 6)
CONTAMINATION WINDOW 2h 09m
```

⭐ **This is 1h 35m EARLIER than the founder's earliest positively-confirmed point (`327853cd` @
08:12 EDT).** Method: `git log --all --diff-filter=A -- '*_2026-09-10*'` — every commit that ever
*added* such a path, on any ref. **The D8 walk cells, not the witness chain, are where it entered.**

⚠️ **Bounded claim:** first introduction **on any ref in this repository.** The convention may have
been inherited from a source outside it; that is unestablished and unnecessary for the repair.

## 3 · ⭐ EXHAUSTIVE MANIFEST — **ESTABLISHED**

**The founder's seven-artifact list was correctly labelled a minimum, not a manifest, and was NOT
used to drive repair.** Enumeration was deterministic: `git ls-files` for paths, `git grep` for
content, across the whole tree.

```text
FALSELY DATED PATHS        26   all first committed 2026-09-09, 10:37Z–12:46Z
IN-TEXT DATE ASSERTIONS    30   across 13 files
PATH REFERENCES            3    across 3 files
GENUINELY PROSPECTIVE      0
```

### 3.1 ⚠️ TWO ARTIFACTS IN THE FOUNDER'S LIST DO NOT EXIST IN THIS REPOSITORY

```text
WRITERS_STUDIO_DEVELOP_RESTORATION_LANE_2026-09-10.md   ⛔ no such file on any ref
WRITERS_STUDIO_PROOF_PLAN_2026-09-10.md                 ⛔ no such file on any ref
```

**Verified by `git ls-files` and `git log --all --diff-filter=A`: neither has ever existed here.**
⭐ **Recorded as a cross-session record divergence, not as a missing repair target.** The founder's
inventory was assembled from a different vantage (a GitHub search view and the ChatGPT session's own
record); **two of its seven entries do not correspond to artifacts on this branch.** ⛔ **Nothing to
repair for those two. Flagged because a governance inventory that names non-existent artifacts is
itself a custody signal** — and it is precisely why the founder's instruction *"do not repair from
this list alone"* was correct.

## 4 · ⭐ SEMANTIC CLASSIFICATION — the prohibition on mechanical normalization was honoured

⛔ **Founder invariant: *"do not normalize every 2026-09-10 mechanically… a deterministic search
discovers candidates; semantic classification determines correction."*** **Satisfied, and here is
the evidence rather than the assurance.**

**All 33 occurrences were individually classified before correction:**

```text
PAST-ACT ASSERTIONS   30   "Founder ruling · 2026-09-10" · "Gate ruling, founder 2026-09-10" ·
                           "Predicted 2026-09-10, before walking C" · "WRONG (asserted
                           2026-09-10)" · "Searched 2026-09-10" · "Read 2026-09-10 from …"
                           -> all describe acts ALREADY COMPLETED when written  -> CORRECT

PATH REFERENCES        3   citations of renamed artifacts                        -> CORRECT

PROSPECTIVE            0   ⭐ no sentence of the form "on September 10, perform…"
                           exists anywhere in the corpus
```

⭐ **The prohibition had no work to do here — but it was checked, not presumed.** Had one
prospective date existed, a mechanical sweep would have falsified a future obligation into a past
one, which is the harder error to detect afterward.

## 5 · Repair executed

```text
✅ 26 paths renamed  _2026-09-10.md -> _2026-09-09.md   (git mv — history preserved)
✅ 30 in-text factual dates corrected
✅  3 cross-references rewritten
✅  1 superseding custody record — this document
⛔ Git history NOT rewritten — the contaminated commits stand as the recovery evidence
```

⚠️ **The rename was NOT executed in the first repair pass.** It was withheld and proposed with its
consequences, under Law 4 as ratified in these same documents, and executed only on the founder's
repair-sequence authorization. **Recorded because the constitution's own rule was applied to the
constitution's own repair.**

## 6 · Substance — untouched, and verified as untouched

```text
Git commit chronology     CLEAN        do not rewrite
Artifact filenames        REPAIRED
Internal dates            REPAIRED
Cross-references          REPAIRED
Custody chronology        REPAIRED     via this record
Substantive rulings       NO CORRUPTION FOUND    Laws 1–6 not reopened
M2 / M3 / M4              NO STATE CHANGE
```

> ⭐ **Law 6 remains Law 6. Its custody date was false; its authority is not thereby invalidated.**
> **The same presumption holds for Laws 1–5** — nothing in *retained-is-not-active*, asynchronous
> orientation, the causal stack, the bookends, or any falsifier definition is date-dependent.

**Standing, re-verified in the corrected files after repair:**

```text
M2 / M3 / M4    UNTOUCHED — the only open input
ADOPT           WITHHELD
D9              BLOCKED

F-ABSENCE · F-STRATEGY · F-NORMALIZATION · F-CAPACITY · F-REACTIVE
```

## 7 · The method finding

> ⭐ **Nothing in the record's own machinery ever verified a date against reality.** Every document
> asserted its date; no instrument compared that assertion to anything. **The founder's check —
> commit metadata against document claim — is the missing verification, and it is trivial to
> automate.**

⚠️ **Same shape as FR-14:** *an instrument can satisfy all of its remaining questions by forgetting
to ask the difficult ones.* **A governance record that cannot detect a wrong date in its own headers
has an unexamined trust in its own authorship** — and this one propagated an unverified assertion
across 26 artifacts in 129 minutes without a single check firing.

⛔ **No lane opened. No automation authorized.**
