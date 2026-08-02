# Phase 1 Walk-Definition Audit — read-only

**Run:** 2026-08-02 · **Referent:** canonical trunk `origin/clean-main-no-secrets` @ `d61872e2a`
**Question:** does a canonical artifact define the extent of the Phase 1 release walk?
**Method:** read-only. No implementation, no edits to any walk record.

---

## Disposition

**Option 4 — the canonical walk is incomplete and requires a new pre-registered
specification before evidence can be gathered.**

No canonical artifact anywhere on trunk enumerates the Phase 1 walk's steps. What exists is
a **record**, not a **specification**.

⛔ **`W1→W16` has no referent on canonical trunk and must not be used as a release gate.**

---

## Findings

### 1. The only W-step headings on trunk are W4 and W8

Searched every `*.md` on trunk for headings matching `^#+ *W[0-9]+`. Exactly one file
matched — `docs/releases/WRITERS_STUDIO_PHASE1_RELEASE_WALK_2026-08-02.md` — and it carries
**W4 and W8 only**. Those are the two steps it reports on: the failure (W8) and the
not-clean pass (W4).

### 2. That artifact is a record, not a specification

It references W1–W7 as passed and states plainly:

> W9 and all later Workbench steps were **not reached**.

So it *acknowledges* steps beyond W9 exist, while **never defining what they are or how many
there are**. Its step vocabulary is `W1, W4, W7, W8, W9`. There is no step list, no total
count, and no acceptance criteria per step.

### 3. Every `W16` / "sixteen" hit on trunk is unrelated content

| Token | Files on trunk | Relevance |
|---|---|---|
| `W16` | `data/ain/source/Elemental Alchemy…md`, `docs/book-studio/ELEMENTAL_ALCHEMY_MANUSCRIPT.md` | manuscript text — **unrelated** |
| "sixteen" | John of the Cross use frame (×2), `ELEMENTAL_ALCHEMY_REBUILT_COMPLETE_DRAFT.md`, `docs/fields/larry/experience-audit-2026-07-28/02_SURFACE_AND_NAVIGATION.md` | prose — **unrelated** |
| `W1-W16` / `W1–W16` / `W1→W16` | **0 files** | — |

The `W10`–`W19` tokens that appear on trunk at all are from the same unrelated manuscript
and field-audit prose, not from any walk protocol.

### 4. No other walk spec exists

Candidate canonical files: `docs/product/WRITERS_STUDIO_PHASE_1_CHARTER.md`,
`docs/product/releases/WRITERS_STUDIO_PHASE_1_RELEASE_RECORD.md`,
`docs/releases/WRITERS_STUDIO_PHASE1_RELEASE_WALK_2026-08-02.md`. **None enumerates walk
steps.** The charter defines construction order (1A–1D), not acceptance steps.

### 5. Open PRs — searched because canonical returned no result

[#895](https://github.com/SoullabTech/Sovereign/pull/895) *docs(spec): correction 3 — Field
Object Declaration, bounded* is the Correction 3 specification
(`docs/specs/CORRECTION_3_FIELD_OBJECT_DECLARATION_2026-08-02.md`). Its W-vocabulary is
**W1 and W8 only** — it references the Phase 1 walk, it does not extend its numbering.

**On the conflation hypothesis** (that `W1→W16` merged the Correction 3 criteria with Phase
1 walk numbering): **not confirmed and not refuted.** No 14- or 16-item list carrying
W-numbering was found on trunk or in #895. The hypothesis remains plausible — the nearest
known 14-item set is the #890 practitioner-notes acceptance list, a different lane
entirely — but this audit found no artifact that would have produced the conflation.
Recording it as an open inference, not a finding.

### 6. ⚠️ Incidental — the local copy of the walk record differs from trunk

`docs/releases/WRITERS_STUDIO_PHASE1_RELEASE_WALK_2026-08-02.md` in this working tree
differs from the trunk version by **+74 / −11**. The step vocabulary happens to agree, so
last turn's "the artifact reaches W9" reading was not distorted — but the file read was not
the canonical one. Another instance of *a delivered copy is not the artifact*, caught here
only because this audit was run against `origin/` explicitly.

---

## Consequence for the re-walk

The walk cannot be re-run "completely" until *complete* has a definition. Per the
pre-registration discipline — **an acceptance criterion must be established before the
acceptance event** — the specification must be authored and frozen **before** the repaired
candidate is exercised, and it must not be produced by appending steps to the failed-walk
record after the fact.

⛔ **Do not append the missing steps to
`docs/releases/WRITERS_STUDIO_PHASE1_RELEASE_WALK_2026-08-02.md`.** That file is evidence of
a failed run. Editing it would make the record of the failure and the criteria for the
retry the same document, and would date the criteria after the implementation they judge.

---

## Accepted disposition (Kelly, 2026-08-02)

Audit accepted. Option 4 accepted.

### The three artifacts a release walk requires

| # | Artifact | Answers | Canonical state |
|---|---|---|---|
| 1 | **Specification** | what must be done, in what order, with what pass/fail criteria | ⛔ **DOES NOT EXIST** |
| 2 | **Candidate** | the explicitly assembled release object, identified by SHA | existed for the failed run (`9e1611306`); **does not yet exist for the retry** |
| 3 | **Evidence** | the completed record of what happened when that candidate was exercised | exists — the failed-walk record |

> ⭐ **The evidence record is not the specification. The specification is frozen before
> execution; the evidence records what happened when it was executed.**

That sentence is the durable governance lesson, and it belongs inside the specification
itself when it is written.

**Consequence:** a rerun cannot honestly claim to execute *"the complete walk,"* because the
complete walk has never been frozen as a specification.

### Corrected chain — specification precedes candidate

```text
Author and freeze the Phase 1 Walk Specification
   ↓
Assemble ONE release candidate and identify it by SHA
   ↓
Create a fresh baseline-recorded fixture
   ↓
Execute the frozen walk against that SHA
   ↓
Produce the evidence record
   ↓
Founder acceptance
   ↓
Reconcile Model A vs Model B  →  authorize the next phase
```

⭐⭐ **Why the specification comes first, ahead of assembling the candidate** (Kelly's
refinement, 2026-08-02): *a walk specification must not be written against a particular
implementation. It defines how **any** candidate will be judged. Freezing it before the
candidate is assembled removes the appearance that the criteria were tuned to the
implementation.* This is the pre-registration discipline applied one level up — from
individual criteria to the whole protocol.

### Binding constraints on writing it

- ⛔ **Do not extend or edit
  `docs/releases/WRITERS_STUDIO_PHASE1_RELEASE_WALK_2026-08-02.md` into the
  specification.** It remains historical evidence of the failed run.
- The specification is a **new canonical document**.
- No further acceptance walk is attempted until it exists and is frozen.
