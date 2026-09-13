# BCS-01A · Step 7 — Predicate Preflight

**Date:** 2026-09-13 · **Branch:** `claude/bold-bohr-pmtynu` · **Base:** `f7b4a367` (Steps 2–6 closed, 85/85)
**Obligations:** P8 · P9 · secondary closure of P3's first real material crossing and the Step-4 M5 divergent-read half
**Gate:** BCS-M1 — *a name is a claim; its semantic strength may not exceed what the evidence establishes*

**Standing:** ⛔ **NO CODE · NO SCHEMA · NO MIGRATION** written or authorized by this document.
⛔ No observation path · no coverage producer · no recurrence discovery · no CMT material.

---

## 0 · Two methodological refinements carried in (founder, 2026-09-13)

**R1 — Instrument the prohibited relation, not the vocabulary.**
> A legitimate occurrence of the word `coverage` must not fail merely because the word exists.
> What must fail is an unauthorized **derivation** — checkpoint/lineage → `DevelopmentalCoverage`.

⭐ Earned by the Step-6 M8 collision: a word-ban instrument went RED on correct code the moment
the concept was legitimately needed, which would have forced either a false green or a dishonest
workaround. **A prohibition instrument broader than the prohibition is its own defect.**

**R2 — A known-bad mutation must be independently shown to instantiate the prohibited behavior.**
> *"Mutant stayed green"* is not evidence of a strong instrument until the mutant itself is
> verified bad.

⭐ Earned in the withdrawn build: a mutation hid its own insert behind `WHERE false` and stayed
green. ⛔ Every Step-7 mutation must first demonstrate the forbidden effect, then be measured.

**Applied to Step 7 as two kinds of negative witness, on purpose:**

```text
SCHEMA ALLOW-LIST        forbidden STORAGE   no currency/stale/is_current column · no prose ·
                                             no execution-side authority copy
STRUCTURAL / BEHAVIOURAL forbidden RELATION  no checkpoint→coverage producer · no lineage→
                                             observation producer · no currency→enqueue path ·
                                             no caller-supplied frozen authority · no exported
                                             checkpoint-without-lineage path
```

> **The instrument must live where the forbidden relation could actually appear. A column absence
> cannot prove a function does not derive the same thing.**

---

## 1 · The five pinned predicates (founder-issued, recorded verbatim)

### `checkpoint_inputs`
> Durable relation recording the frozen input supplied to the successful computation whose
> checkpoint it accompanies; **not** output, coverage, observation, or causality.

- **HONEST WHEN** it accompanies a checkpoint that already exists, names material the provider
  actually returned, and carries no prose.
- **DOES NOT** assert that the material was important, interpreted, or affected anything.
  ⛔ `CONTRIBUTED ≠ EFFECT ESTABLISHED` (FR-J3). There will be no `effect`, `influence`, `weight`
  or `contribution_score` column, because none could be established.

### `FrozenSectionProvider`
> Authorized seam that recovers the exact frozen section material named by commission + partition
> from the existing immutable revision custody domain; **not** a second Work store and **not**
> authority.

- **HONEST WHEN** it only recovers, never decides: it is invoked **after** `permitCrossing`
  passes and after the claim generation is verified, and its return is validated before use.
- **DOES NOT** grant permission, hold custody, or define what counts as frozen. ⭐ The commission
  fixes the frozen subject; the provider merely fetches it.

### `recorded_at`
> Time the lineage record was durably written; **not** `read_at`, execution time, or proof of when
> cognition occurred.

- ⭐ The database knows when the row was written. It does not know the instant the processor
  inspected the bytes. The narrower name is the only one the evidence supports.

### `range`
> Code-point interval of that section inside the immutable revision state actually supplied to the
> computation; **not** an offset into live prose and **not** a version in its own right.

- ⭐ Matches existing law verbatim — `lib/manuscript/development/readState.ts` already defines
  `SectionState { revisionNumber, range: CodePointRange, digest }` with `range` in **Unicode code
  points** into the content of a named revision, and already warns against attaching *"the current
  sections' ranges to an older checkpoint"*. Step 7 reuses that unit; it does not redefine it.

### `current digest provider`
> A read-only mechanism that answers the digest of the same referenced material **as it is now**,
> or explicitly cannot measure it; it does **not** return permission, currency, or prose.

- ⭐ This is the predicate that keeps the P9 side from acquiring accidental authority: the
  currency path can ask *what is it now*, and can be told *I cannot tell you* — and can do nothing
  else. ⛔ "Cannot measure" must surface as `unmeasured`, never as `unchanged`.

---

## 2 · Additional terms the implementation will need

### `frozen_digest`
- **PREDICATE** — SHA-256 over the exact section content that the provider returned and validation
  accepted, in the commission's revision.
- **DOES NOT** identify the Work now, and is never recomputed from later bytes. ⛔ A mismatch
  **refuses**; it is never repaired into a new frozen identity.

### `evidence ref` (Step 7 form)
- **PREDICATE** — the typed `{ kind: 'section', sectionId }` from
  `lib/manuscript/development/evidenceRef.ts`. ⛔ The Step-2 opaque `evidenceRef: string` does not
  survive into durable lineage.
- ⭐ **The reference carries no version; the frozen state carries the version.** That is existing
  evidence law, and it is why `section_id`, `draft_id`, `revision_number`, `revision_digest`,
  `member_id` and `manuscript_id` are **not duplicated** on a lineage row — they resolve through
  `checkpoint → partition → execution → commission`.

### `acquisition`
- **PREDICATE** — one authorized invocation of the provider for one partition, under a valid
  current claim, after `permitCrossing` passed.
- **DOES NOT** occur when permission refuses: the witness asserts **provider call count 0**, i.e.
  *the material was never acquired* — not that it was acquired and discarded.

### `lineage loader`
- **PREDICATE** — reconstructs the typed relation for one checkpoint (evidence ref · manuscript ·
  draft · revisionNumber · revisionDigest · range · frozenDigest).
- **DOES NOT** return prose, authority, coverage, or causal language.

### `currency` (Step-7 form)
- **PREDICATE** — a comparison, **computed now**, of durable frozen lineage against the Work as it
  is now: `unchanged | changed | unmeasured`.
- ⛔ **DERIVED, NEVER STORED.** A stored `currency = 'unchanged'` becomes false the moment the Work
  changes. If measurement history is ever required, it is a separately named responsibility —
  `currency measurement + measured_at` — never timeless current state.
- **DOES NOT** establish that a change affected anything, alter lifecycle, or authorize execution.

---

## 3 · Words refused at this gate

| Word | Disposition |
|---|---|
| `read_at` on a lineage row | ⛔ **REFUSED** — claims knowledge of when bytes were inspected. Use `recorded_at` |
| `currency` · `stale` · `is_current` as a column | ⛔ **REFUSED** — a summary beside the facts it summarizes, false on the next edit |
| `effect` · `influence` · `weight` · `contribution_score` | ⛔ **REFUSED** — lineage is contribution, never causality |
| `evidenceRef: string` | ⛔ **REFUSED** in durable rows — use the typed ref; version lives in the frozen state |
| `coverageFromCheckpoints` · `coverageFromLineage` | ⛔ **REFUSED** — lineage is an *ingredient* of a future claim's coverage, not coverage |

⭐ Note the R1 discipline applied to that last row: the refusal is of the **derivation**, not of the
word. A future authorized path may legitimately use lineage as evidence when constructing
claim-specific coverage — which is why the instrument must test the relation, not the token.

---

## 4 · Standing

```text
STEP 7 PREFLIGHT   COMPLETE
PINNED             checkpoint_inputs · FrozenSectionProvider · recorded_at · range ·
                   current digest provider
ADDED              frozen_digest · evidence ref · acquisition · lineage loader · currency
REFUSED            read_at · stored currency/stale/is_current · effect-family ·
                   opaque evidenceRef string · coverage derivations
INSTRUMENT RULE    schema allow-lists for storage · structural/behavioural for relations
MUTATION RULE      every known-bad must first be shown bad
NEXT               implementation — migration + provider seam + permission wiring,
                   then witnesses A–K and mutations M1–M10
CODE / SCHEMA      NONE
```

> Any field, type, status, table, API verb or durable relation entering Step 7 without a stated
> predicate is a charter failure, independent of whether the code works.
