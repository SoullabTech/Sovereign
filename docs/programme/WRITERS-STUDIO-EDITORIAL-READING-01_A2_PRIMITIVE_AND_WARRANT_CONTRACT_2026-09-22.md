# `WRITERS-STUDIO-EDITORIAL-READING-01 / A2` — EDITORIAL READING PRIMITIVE + WARRANT CONTRACT

**2026-09-22 · CONTRACT + FALSIFIERS · ⛔ NON-EXECUTING · ⛔ NO IMPLEMENTATION**

*Amended in place by `A2R1 — WHOLE-WORK COMMISSION FIDELITY` (founder ruling, same day). The amendment is additive: ⛔ no law below was weakened, and `D1–D14` were not reopened.*

Against canonical `fe65f803922eda2683b7f1bc173e19d0809f0499`.

⛔ No runtime composer · ⛔ no persistence or migration · ⛔ no route or API · ⛔ no
prompt or model call · ⛔ no UI · ⛔ no reuse or wrapping of `editorialSynthesis` ·
⛔ no cross-revision composition · ⛔ no duplicate observation resolver · ⛔ no
member-facing observation action · ⛔ no A3+ · ⛔ no deployment · ⛔ no production
mutation. No `lib/`, `app/` or `database/` file is modified by this act.

---

## 0 · What A2 is

A2 **defines, documents and falsifies** the contract for the new primitive. It
types the **observable law at the boundary** — what may be composed, from what,
under what warrant, and when composition must refuse — ⛔ never the machine
behind it. That is the S3 B-i discipline carried forward through
`OBSERVATION-IDENTITY-01`.

⭐ The governing sentence, from ratified A0:

> **MAIA may say more about the Work only when recorded reading evidence earns
> the right to say it. Seeing comes before changing.**

### Inherited without reopening

The five canonical `A1→A2` boundary rulings (`edece0b0`, admitted via #1473) are
**inherited as law**. ⛔ None is reopened, reinterpreted or softened here. Each
appears below as an enforced falsifier, named.

### Artifacts

| path | what it is |
|---|---|
| `tests/constitutional/editorial-reading/contract.ts` | the typed contract + the laws as pure decidable functions + a conforming reference composer |
| `tests/constitutional/editorial-reading/falsifiers.ts` | `ER-L1 … ER-L14` |
| `tests/constitutional/editorial-reading/candidates.ts` | `D1 … D14`, one deliberately wrong composer per law |
| `tests/constitutional/editorial-reading/matrix.ts` | the lethality + discrimination matrix |
| `tsconfig.editorial-reading-contract.json` | strict · `noUncheckedIndexedAccess` · `noEmit` |
| `npm run typecheck:editorial-reading-contract` · `npm run matrix:editorial-reading-contract` | the repo-defined commands |

⛔ The reference composer is a **test double** — no store, no model, no route, no
durability. ⛔ It is evidence, **never a seed**: A5 must not be derived from it.

---

## I · The primitive

```
ADMITTED DEVELOPMENTAL READINGS
  → (revision law · warrant · inheritance)
    → EDITORIAL READING   |   REFUSAL
```

⛔ Never: `manuscript → model call → confident whole-book verdict`.

### Inputs — admitted readings only

A composer consumes `AdmittedReading` values and nothing else. An unadmitted
reader result is not an input.

### Identity — Ruling 1

`kind: 'editorial-reading'`, a **distinct canonical identity**. ⛔ It is not,
wraps not, aliases not, and is not constructible from the existing
`editorialSynthesis`, whose raw-prose/model-call path A1 §2 located and A0 §XIII
falsifier 3 forbids. `editorialSynthesis` is untouched in its own domain.

### Revision law — Ruling 2

All constituent readings share **one exact `revisionDigest`**, and it must equal
the target revision's authored structure. Mixed digests **REFUSE**. ⛔ Readings
are never composed across revisions merely because they belong to one Work.

### ⭐⭐ The whole-Work warrant predicate

Explicit and decidable over admitted coverage:

> a whole-Work warrant requires **every authored section of the target revision
> read at `body` depth by at least one constituent reading**.

⛔ `position` depth never contributes — reading *where* a section sits is not
reading *what it says*. ⛔ No prose, fluency, model intuition or confidence may
substitute for the predicate. Short of it the warrant is `covered-span`, and the
reading speaks from its actual coverage.

### ⭐⭐ Whole-Work commission fidelity — A2R1

The warrant predicate says what the evidence **can support**. The commission says
what was **asked**. They are different questions, and a result may be lawful as
an object while not being an answer to the question put.

```
requested covered-span + lawful covered-span evidence → may issue
requested whole-work   + predicate satisfied          → may issue
requested whole-work   + predicate NOT satisfied      → REFUSE
                                       INSUFFICIENT_WHOLE_WORK_COVERAGE
⛔ never: whole-work requested → silently downgrade to covered-span
```

⭐ A `covered-span` Editorial Reading remains a **perfectly lawful object**. What
A2R1 forbids is returning one **as though a whole-Work commission had been
fulfilled**. ⛔ That is request fidelity, not coverage semantics.

An absent `commissionedWarrant` means the operation was not commissioned to a
particular warrant, and a `covered-span` result answers it lawfully.

### Non-conclusion inheritance

The union of every source's `doesNotEstablish` flows **upward**. Only
`whole-work-pattern` · `across-unread-span` · `outside-coverage` may be
discharged, and only under a whole-Work warrant. ⛔ `author-intent` ·
`reader-effect` · `editorial-consequence` are **permanent** — the last in its
full ratified meaning: **no defect, importance, priority, or that anything
should change**.

### Provenance

Every claim names its **exact** constituent `readingId` and `observationId`.
⛔ Never a count, never a summary. Every admitted observation stays reachable
(A0 §IX) — compression may organize evidence, ⛔ never discard it.

### Return precision — Ruling 4

```
sectionId known + position known  → SECTION_AND_POSITION
sectionId known + position null   → SECTION_RESOLVED · POSITION_UNRESOLVED
sectionId unresolved              → NO_SECTION_PRECISE_RETURN
```

⛔ No offset, paragraph or span is ever inferred to make a return look precise.

### Refusal — ⛔ never repair by inference

`MIXED_REVISION_DIGEST` · `AMBIGUOUS_OBSERVATION_ID` (Ruling 5) ·
`INSUFFICIENT_WHOLE_WORK_COVERAGE` · `UNRESOLVED_REQUIRED_EVIDENCE` ·
`NO_ADMITTED_INPUT`.

⛔ A refusal says a composition could not lawfully be made. It never says the
Work is defective, and **a refusal is not an occasion to disclose** — the payload
carries identities only (`ER-L14`).

---

## II · Three traps carried deliberately

⭐ The S3 `authoredText` lesson: a law is only enforceable if its violation is
**buildable**.

| carried | without it |
|---|---|
| `CompositionContext.rawProse` | `raw-prose bypass` is a sentence no test can break |
| `CompositionContext.existingEditorialSynthesis` | Ruling 1 cannot be violated by construction, so it cannot be proved enforced |
| `EditorialClaim.text` | a text-keyed composer is unbuildable |

⛔ A conforming composer touches none of the three.

---

## III · Lethality — proved, not asserted

`ER-L1` single revision digest · `ER-L2` warrant requires complete body coverage ·
`ER-L3` warrant never from prose · `ER-L4` inheritance · `ER-L5` permanent
non-conclusions · `ER-L6` discharge only under whole-Work · `ER-L7` ambiguous
identity refused · `ER-L8` identity distinct from `editorialSynthesis` · `ER-L9`
exact provenance · `ER-L10` return precision never fabricated · `ER-L11` evidence
not suppressed · `ER-L12` refuse never repair · `ER-L13` no ranking · `ER-L14`
refusal discloses no authored text · `ER-L15` whole-Work commission refuses,
never downgrades.

**Result — reference 15/15 PASS · all 15 candidates KILLED on their named
falsifier · collateral all CLASSIFIED · typecheck exit 0 · matrix exit 0.**

⚠️ **Lethality is DECISION-LEVEL, ⛔ not implementation-independent.** Every
candidate replaces exactly one decision on an identical substrate
(`buildComposer`). Fourteen standalone implementations would yield unclassified
collateral and *weaker* evidence, so the narrower claim is deliberate.

### ⭐⭐ The matrix found a defect in the SUITE, not in a candidate

The first run went **RED on `D13-rank-claims`, which SURVIVED.** It ranked on
`claim.text` — a field the conforming composer always empties — so it was
**structurally incapable of exhibiting its own error**. The law was unfalsifiable
by that route and the matrix caught it.

⭐ Repaired per the ratified rule (*a surviving candidate repairs the SUITE, never
the candidate*): the candidate now ranks on **breadth of cited evidence**, a
signal a composer genuinely holds, and the `ER-L13` fixture varies that breadth
so a ranking is observable. ⛔ The law was not weakened to let the candidate die.

*A suite only ever run against the conforming implementation would have called
that a pass.* Third time this defect class has surfaced in this programme — after
`RC-F12` (fixture supplied what it was meant to omit) and `DC-C7` (the refusal
was hard-coded in the core, not the decision).

### Classified collateral

| candidate | also kills | why irreducible |
|---|---|---|
| `D2` | `ER-L6`, `ER-L15` | a forged whole-Work warrant necessarily discharges the terms that warrant licenses — and, ⭐ found by A2R1 rather than assumed, satisfies a whole-Work **commission** it never earned, because the commission check consults exactly the warrant D2 forges. *The error is worse than first modelled: it does not merely overstate coverage, it defeats request fidelity too.* |
| `D4` | `ER-L5`, `ER-L6` | an empty inheritance set cannot retain any term |
| `D9` | `ER-L13` | no-ranking is read *through* source identities; a candidate with none exhibits no order |
| `D12` | `ER-L14` | the disclosure law is checked on a refusal this candidate no longer issues |

⭐ Removing any of these would require the candidate to cease embodying its error.

---

## IV · ⚠️ What this contract does NOT establish

- ⛔ **No freeze taken.** A freeze is a founder act (`S3` Class-B precedent).
- ⛔ The reference composer is not an implementation and not a seed.
- ⛔ Nothing here authorizes a member-facing action against `observation_id`; the
  `OBSERVATION-ADDRESS-01` gate holds, and A5-class runtime may not claim closure
  before that lawful seam exists (Ruling 3). ⛔ No duplicate resolver is created.
- ⭐ **RESOLVED by A2R1.** `INSUFFICIENT_WHOLE_WORK_COVERAGE` was reserved and
  unreachable when this record was first written, with the refuse-or-downgrade
  question left explicitly open. The founder ruled **refuse**, and the code is
  now reachable, enforced by `ER-L15` and killed on `D15`. *The vocabulary is
  spent, not merely reserved.*
- ⚠️ **Claim composition itself is not modelled — CONFIRMED as A4's, by ruling.** The reference emits one claim
  per observation, which is the identity mapping, not synthesis. A2 governs what
  synthesis may *conclude and carry*; ⛔ it does not say how several observations
  become one claim. That is the substance of A4, and the laws here bind it
  already.
- ⚠️ Ran with TypeScript 5.6.3 / tsx from a scratchpad toolchain — this container
  has no project `node_modules`. Both commands are repository-defined, so ⭐ **the
  founder's run is the evidence of record.** ⛔ Neither command widens
  `tsconfig.ship.json` nor can move the typecheck baseline.

---

## V · Standing

```
WRITERS-STUDIO-EDITORIAL-READING-01 / A2
CONTRACT AUTHORED · FALSIFIERS AUTHORED · CANDIDATES BUILT
⭐ MATRIX LETHAL + DISCRIMINATING — reference 15/15 · 15/15 candidates KILLED
⭐ TYPECHECK strict + noUncheckedIndexedAccess — exit 0
FIVE A1→A2 RULINGS INHERITED · ⛔ NONE REOPENED
A2R1 WHOLE-WORK COMMISSION FIDELITY APPLIED · ⛔ D1–D14 NOT REOPENED
⛔ NO FREEZE TAKEN — A FOUNDER ACT, AND OWED A PROJECT-NATIVE RUN FIRST
⛔ NO IMPLEMENTATION · ⛔ NO RUNTIME · NO SCHEMA
⛔ NO ROUTE · NO PROMPT · NO UI · ⛔ A3+ NOT OPENED
⛔ editorialSynthesis NOT REUSED, NOT WRAPPED, NOT TOUCHED
PRODUCTION UNTOUCHED
```

⭐ *All governed inputs existed. This act gives the output object its law — and
proves the law can be broken, before anything is built that could break it.*
