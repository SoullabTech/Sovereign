# Writer's Field — Reconciliation Decision Record

**Date:** 2026-08-05 · **Referent:** deployed `f46a4fde4`
**Status:** ⛔ **DECISION BOUNDARY DOCUMENT. Ratifies nothing. Authorizes no implementation.**
**Governing question:** ⛔ not *"what do we build?"* but —

> ⭐⭐⭐ **What evidence would justify moving from candidate design to authorized implementation?**

**Companions:** `WRITERS_FIELD_GAP_MAP_2026-08-05.md` (observation) ·
`WRITERS_FIELD_GOVERNING_CONSTRAINTS_2026-08-05.md` (constraints) ·
`WRITERS_FIELD_STATE_AND_PHASE_PLAN_2026-08-05.md` (founder assessment)

---

## 0. The constitutional line, first

> ⭐⭐⭐ **MAIA is not the authoring intelligence in the Writer's Field. MAIA is the boundary that
> protects authorship.**

| Allowed verbs | Prohibited verbs |
|---|---|
| witness · hold · return · surface · reflect | write · decide · import · restructure · optimize |

⛔ This is not a feature decision. It is the **constitutional boundary of the environment**, and it
governs every alternative below. Grounded in the corpus's own three refusals — *never writes for
you · never edits behind you · **never brings anything in unasked*** — and in its admiration for a
tool with **no inference engine**.

---

## 1. Status before synthesis

| Artifact | Status | What it means |
|---|---|---|
| Phase-b prototypes (5 HTML) | **candidate** | experiential exploration |
| `R1_EXPERIENTIAL_SPECIFICATION` | **candidate** | design hypothesis — *"governs nothing, authorizes no build"* |
| Architecture docs (4) + Design Constitution | **candidate** | constraints and questions — *"recorded, not ratified"* |
| claude.ai artifact set (12) | **candidate, unread** | 10 of 12 not readable from this environment |
| Existing code at `f46a4fde4` | **deployed substrate** | actual capability |
| Gap map | **observation** | comparison instrument |
| `a3fcd2c50` | **local commit, unpushed** | one defect repaired |

⛔ **The relationship that must not form:**
```
candidate design  ──→  implementation authority
```
✅ **The relationship that must:**
```
candidate design  ──→  evidence + decision  ──→  authorized implementation
```

---

## 2. Evidence — what is measured, not asserted

Verified by source inspection at `f46a4fde4` during the 2026-08-05 session:

| Claim | Evidence |
|---|---|
| Source is immutable | **zero** writers can `UPDATE`/`DELETE` `manuscript_sections`, anywhere |
| Draft writers are bounded | exactly **3** non-test files, the same 3 for drafts and revisions |
| All draft writers authenticated | `getMemberIdFromRequest` → 401; ownership `[id, memberId]` → 404 |
| History cannot be rewritten | `working_draft_revisions` UPDATE refused by DB trigger |
| The **Bring in →** gesture exists | `f24ea189e` — *"bring a kept passage into the working draft at the caret"* |
| Blank creation invents nothing | no title · no source · no attachment · no implicit creation |
| Return-by-identity is live | #892, ancestor of `f46a4fde4` |
| ⚠️ Scroll restoration is inert | `#869` residue — `.cm-scroller` `overflow: visible`, `scrollTop` always 0 |
| ⚠️ Canvas has no server persistence | 52-line iframe over 3,784-line static file; `localStorage`; no table in any migration |
| ⚠️ "Start writing" was reachable in one state only | repaired locally in `a3fcd2c50`, **not deployed** |

---

## 3. Candidate claims — what the corpus asserts but has not proven

⛔ None of these is established. Each is a hypothesis the corpus states with confidence.

1. **"Home is the work."** Arrival should land *in* the writing, not in a list of works.
2. **"Restore. Never interpret."** Return means putting the writer back, asking nothing.
3. **"Nothing moves."** Position preserved is the mechanism of orientation and authorship.
4. **0 decisions · under 10 seconds · open → first keystroke** is the acceptance test.
5. **"The unit of design is a moment"** — not the manuscript, work, or person.
6. **"Faithful return, not continuous focus"** is the competency. ⛔ Engagement is excluded as a measure.
7. **Returning is a heartbeat inherited by every phase**, not a phase.
8. **Integrate is the missing bridge** — material has value only insofar as it can be explicitly brought into the work.

---

## 4. Contradictions and gaps

| # | Issue | State |
|---|---|---|
| C1 | **Navy vs espresso.** Phase-b prototypes are navy; STATUS.md says the Studio is espresso and ⛔ must not drift to navy. But the claude.ai *"The field"* renders **espresso**. | ⛔ unresolved |
| C2 | **Two corpora, same date.** Phase-b (in repo, page-centred) and the claude.ai set (rail-centred) are **both 2026-07-31**. Siblings, not revisions — ⛔ dates cannot say which governs. | ⛔ unresolved |
| C3 | **Is the companion material a *rail*?** *"The field"* draws one. Phase-b does not. `Places & Gestures` is the artifact that would settle it — **unread**. | ⛔ unresolved |
| C4 | ⭐⭐⭐ **Waiting has no representation.** See §5. | ⛔ open governing question |
| C5 | **Revision reached no finding.** `study-revision` records observations only. ⛔ Do not supply a conclusion it withheld. | deliberate silence |
| C6 | **KEEP · VOICE · QUESTION · RESEARCH** — only Keep has verified substrate. | ⚠️ unverified, ⛔ not "missing" |
| C7 | **Three alternatives were never produced** as `DESIGN_LENSES` requires. | discharged by §6 below |
| C8 | **10 of 12 claude.ai artifacts unread** — three retrieval surfaces failed. | ⛔ blocking a complete read |

---

## 5. ⭐⭐⭐ Waiting — elevated to a governing question

The product's implicit model:
```
active work  →  visible / hidden
```
The Atlas's model:
```
Appears · Gathers · Deepens · Waits · Changes · Expresses      ↕ Returning throughout
```

**Waiting is not absence. A dormant book is still a relationship.**

This is the same distinction the memory lane already ruled, in another key:

| Memory | Writer's Field |
|---|---|
| stored ≠ alive | dormant ≠ abandoned |
| hidden ≠ gone | quiet ≠ finished |
| offered ≠ adopted | waiting ≠ nothing |

⛔ **A Writer's Field that cannot represent Waiting will recreate the same error: absence of
activity read as absence of meaning.** ⛔ Do not implement Waiting now. ✅ Every alternative below
must state what it does to a waiting work.

---

## 6. Three alternatives — required by `DESIGN_LENSES`

⛔ These are **experiments, not competing products.** Each is stated with the substrate it would
use, so none is chosen on appeal.

### Alternative A — *Obvious*: extend the current Author Studio
```
House → Author Studio → Manuscripts → Writing surface
```
**Substrate:** everything already present; no new anything.
**Advantages:** least disruption · fastest · uses all existing work.
**Risk:** ⛔ **preserves manuscript-first grammar** — the drift itself.
**Waiting:** unrepresented; a dormant work stays a row in a list.
**Question it must answer:** *Does this make the existing model better, or preserve the original drift?*

### Alternative B — *Simpler*: make the writing surface the primary destination
```
House → Current Work → Write
```
The manuscript object persists underneath, unexposed.
**Substrate:** `useCurrentManuscript` · identity routing (#892) · `WorkingDraftEditor` · caret persistence. ⚠️ Requires the `a3fcd2c50` fix, and depends on inert scroll restoration (`#869`).
**Advantages:** aligns with *"Home is the work"* · tests the core hypothesis quickly · fewer concepts exposed.
**Risk:** may underrepresent gathering, revision, publishing, returning.
**Waiting:** ⛔ actively worsened — "Current Work" implies exactly one work is live.
**Question:** *Can the first living loop exist without building the whole Field?*

### Alternative C — *Minimal*: one complete return loop
```
Open → Recognize current work → Write → Leave → Return
```
**Substrate:** ⭐ all of it exists. Draft + autosave + revisions + caret + identity routing + blank creation. ⚠️ Except scroll restoration (`#869`, inert).
**Proves only:** I can find my place · I can write · my material stays mine · I can come back.
**Advantages:** ⭐⭐⭐ **directly tests the pre-registered acceptance criterion** · smallest irreversible commitment · adds no architecture · violates no refusal.
**Risk:** may feel too small against the richness of the corpus.
**Waiting:** neutral — neither represents nor worsens it.
**Question:** *Does one inhabited room prove the House?*

⛔ **No alternative is recommended here.** Selection is a founder act.

---

## 7. Proposed evidence threshold

**What would justify moving from candidate design to authorized implementation:**

1. **A ratification act.** ⭐⭐⭐ At least one candidate document must be ratified, or explicitly
   named as governing-for-this-slice. ⛔ Until then no disposition is executable on the corpus's
   authority. *(This is the §1 relationship, made operational.)*
2. **C1 + C2 resolved** — which corpus governs, and which palette. ⛔ Not inferable from dates.
3. **An alternative selected**, with its Waiting answer accepted.
4. **The acceptance criterion made measurable** — *0 decisions · under 10 seconds · open → first
   keystroke* is currently unmeasurable in the product. An instrument must exist **before** the
   slice, ⛔ never authored after, or it will be shaped to the result.
5. **A human crossing.** ⛔ The agent cannot supply it. The standing criterion remains: ***"Did you
   forget the software and feel like you were writing your book?"***

⚠️ **Threshold 4 is the one most likely to be skipped.** Every other gate has a document; this one
requires building a measurement of *time and decisions to first keystroke* that does not exist.

---

## 8. Explicit non-decisions

⛔ This record does **not** decide, and nothing downstream may treat as decided:

- which corpus governs (phase-b vs claude.ai) · which palette
- whether companion material is a rail
- whether a "work" is a document container or a living thread with many expressions
- whether Waiting is represented, and how
- Model A vs Model B phase numbering *(held open since 2026-08-02)*
- whether Canvas is ported, rebuilt, or left in Book Studio
- Voice · Question · Research as first-class kinds
- the fate of `a3fcd2c50` — held local, unpushed, no PR
- Arrival mood (Mystical / Warm Hospitality / Premium)
- anything about Book Studio, publishing, or AI writing assistance

---

## 9. Founder refinements — 2026-08-05, after first reading

### 9.1 The MAIA boundary, at the level of the act
The §0 verb lists resolve a temptation that will recur: *"if MAIA understands the writer's work,
shouldn't she help organize it?"* ⭐⭐⭐ **Only if the writer remains the source of movement.**

| Allowed | ⛔ Not allowed |
|---|---|
| surface a kept passage | **choose** the passage |
| restore where you stopped | **decide** what matters |
| reflect a pattern | **create** the author's pattern |
| hold context | **own** meaning |

### 9.2 What Alternative C actually is
⛔ Not *"C is best."* ⭐⭐⭐ **C has the smallest distance between existing substrate and the
governing question.** It appears to isolate one hypothesis:

> **Can a person return to their work, write, leave, and return — without entering a management
> relationship with the system?**

⚠️ **A small experiment can still carry hidden architectural assumptions.** Isolation is a property
to be verified, not granted because the diff is short.

### 9.3 The instrument measures more than speed
*0 decisions · under 10 seconds* is shorthand. The instrument should carry:

- number of **choices presented**
- number of **interpretation steps** required
- **time** from arrival to writing
- the **first uncertainty point**
- **recovery** after interruption

⭐⭐ The quantitative measure **supports** the qualitative one; ⛔ it does not replace it. The
standing criterion remains *"Did you forget the software and feel like you were writing?"*

⛔ **Failure mode named:** build → measure → declare success. By then the environment has changed
the measurement. The instrument precedes the slice.

### 9.4 Waiting as the discriminator
```
alive relationship
       ├── active
       └── waiting
```
⭐⭐⭐ **Whether the Field can represent Waiting may be the strongest test of whether it is
architecturally different from a project manager.** A dormant work is not a missing work.
Aligns with: *stored ≠ alive · offered ≠ adopted · available ≠ allowed · present ≠ meaningful.*

---

## 9bis. Writer's Field Crossing v1 — the named form of Alternative C

**Status:** candidate governing test for Alternative C
**Authority:** ⛔ **requires founder ratification before implementation**
**Does not discharge:** ⛔ **W8 Keep/Shelf repair**

### Question
> **Can a writer enter a living work environment where authorship remains theirs throughout the act
> of writing?**

### The crossing — a writer can:
1. **Enter their work** without first choosing manuscript-management objects.
2. **Begin writing.**
3. **Understand** that original material is preserved separately from their evolving draft.
4. **Make changes only** in their working draft.
5. **Leave** the work.
6. **Return to the same place** ⛔ without the system claiming to know what matters.

### Acceptance criterion
> ⭐⭐⭐ **Did you forget the software and feel like you were writing your book?**

### Evidence produced
✅ **Can demonstrate:** orientation · authorship preservation · source/draft distinction · return
continuity.

⛔ **Cannot demonstrate:** that a Keep gesture creates a canonical Field atom · that Shelf retrieval
works · that conversational material can enter the Field correctly.

---

## 9ter. 🔴🔴 The two instruments — non-equivalence

⛔ **A referent collision was caught 2026-08-05 and is recorded here so it cannot recur.** The
crossing question and the W8 question are different objects with different failures, and the
crossing was briefly described as "the W8 fix."

```
Writer's Field Crossing v1
        ↓
proves the room preserves the writer's relationship to the work

W8 repair (keepSource)
        ↓
proves material can move from conversational encounter into the Field/Shelf substrate
```

⭐⭐⭐ **They are related, but neither is evidence for the other.**

### W8 — Keep → Shelf repair
**Status:** held pending the appropriate walk.
**Question:** *Can a member intentionally preserve a meaningful moment and later find it where the
Workbench Shelf says it will appear?*

**Known failure:**
```
Keep gesture → capsule created → Shelf expects atom → no reachable member path
```
**Required repair** (ruled `FIELD_OBJECT_PROMOTION_RULING_2026-08-02`):
```
member performs explicit "Keep in my Field" → keepSource() → canonical atom minted → Shelf surfaces it
```

### ⭐⭐ The two failures are mirror images
| | Failure | Seam |
|---|---|---|
| **Crossing** | the system has the material relationship but **has not created the right human doorway** | **experience** seam |
| **W8** | the system has the doorway concept but the material **does not complete the journey through the substrate** | **persistence / provenance** seam |

⛔ **They must not be merged, because passing one could falsely hide the other.**

> 🔴🔴 **Passing Writer's Field Crossing v1 does not constitute resolution of W8.
> Passing W8 does not constitute evidence that the Writer's Field environment works.
> Both are required for the complete loop.**

---

## 10. ⏳ THE OPEN FOUNDER DECISION

> ⭐⭐⭐ **Which artifact, if any, is granted governing authority for the crossing?**
>
> ⛔ Not *"which design wins."*

Three candidate answers, stated so the decision is narrow. ⛔ None recommended.

| # | Option | What it would authorize | What it leaves open |
|---|---|---|---|
| **G1** | The existing **crossing instrument** (`AUTHOR_STUDIO_FIRST_CROSSING_WALK_INSTRUMENT`) becomes the governing test | measurement of the room that exists today, on its own terms | the design corpus stays advisory; nothing in the gap map becomes executable |
| **G2** | The **Writer's Field candidate corpus** becomes *governing-for-this-slice* | the gap map's dispositions become executable within a named slice boundary | ⛔ C1/C2 must be resolved first — which corpus, which palette — since "the corpus" is currently two |
| **G3** | A new **minimal covenant** is written | a purpose-built instrument scoped exactly to the crossing | costs an authoring act, and risks restating what §0/§9.1 already fix |

⚠️ **G2 is not available until C1 and C2 are resolved.** Granting authority to "the corpus" while
two corpora exist would grant it to an ambiguous referent — the failure this whole lane exists to
correct.

### 10.1 ⭐⭐⭐ G1 and G2 are not competing on the same dimension

A refinement that changes the shape of the decision (Kelly, 2026-08-05):

| | The question it answers | Its strength |
|---|---|---|
| **G1** | *What must the writer **experience** for authorship preservation?* | **authorship** |
| **G2** | *What larger **environment** should that experience belong inside?* | **place** |

⛔ These may eventually converge, but **they are different decisions.** Treating them as rival
designs mis-states the choice.

**So the actual fork is not "which design wins."** It is:

> ⭐⭐⭐ **For this first crossing — are we proving an existing covenant, or authorizing a new
> environment?**

Equivalently, which question does the first experiment test:

```
G1 →  Can the writer safely inhabit the room?
G2 →  Can this room become the Writer's Field?
```

⛔ **Keep these separate until the governing artifact is chosen.** Collapsing them would let a
covenant proof read as environment authorization, or an environment proof read as authorship
evidence — the same non-equivalence failure §9ter records between the crossing and W8, one level up.

### 10.1a ✅ G2 ruled OUT — for now (Kelly, 2026-08-05)

> ⭐⭐⭐ **"Not yet the Writer's Field corpus. The corpus is preserved, but by its own declarations it
> is candidate material. It cannot govern itself."**

⭐⭐⭐ This is a **stronger** bar than the C1/C2 referent ambiguity recorded above. Even with the two
corpora reconciled, **candidate material cannot be its own authority.** G2 requires an *external*
act granting the relationship — it can never be reached by the corpus becoming clearer about itself.

⛔ G2 is therefore not merely blocked; it is **declined for this crossing**, and reopening it needs a
founder grant, not a resolution of C1/C2.

### 10.1b ✅✅ **G1 RATIFIED — for the crossing event only** (Kelly, 2026-08-05)

> ⛔ The ruling is **not** *"the Writer's Field corpus governs this implementation."*
> ✅ It is: ⭐⭐⭐ **"The existing Crossing v1 instrument governs this evidence event. Its purpose is
> to test authorship preservation, not to authorize the Writer's Field environment."**

| ✅ G1 authorizes | ⛔ G1 does **not** authorize |
|---|---|
| the **Crossing v1 instrument** as the measurement authority | Writer's Field implementation |
| the **C1–C9 evidence sequence** | corpus adoption |
| **evaluation of authorship preservation** | Canvas · G2 · W8 resolution · environmental redesign |

⭐⭐⭐ **Why G1 is the right authority — ⛔ not because it is the "best design."** That framing would
reopen the contest §10.1 just closed. It is because it answers the **smallest unresolved question**,
and that question **already has a defined instrument**:

> **Can the system preserve the author's relationship to their work?**

**The authorized sequence:**
```
G1 → Run Crossing v1 → Evidence → Founder decides what, if anything, the evidence authorizes
```
⛔ **NOT:**
```
G1 → Writer's Field exists → build roadmap begins
```
⚠️ That second shape would recreate the G2 collapse by another route.

### 10.1b-i ⭐⭐⭐ The general rule G2's refusal produced

> **Candidate material cannot be its own authority.**

⭐⭐ Preserve this **above** the specific decision. It is a **general governance rule**, not a
Writer's Field rule — it applies wherever a draft, prototype, candidate, or recorded proposal is
asked to license the work that would implement it.

### 10.1b-ii Ratified state

| | State |
|---|---|
| **G1** | ✅ **governs Crossing v1 only** |
| **G2** | ⛔ declined for this crossing |
| **G3** | unnecessary for this event |
| **Crossing v1** | ✅ governing measurement instrument |
| Writer's Field corpus | preserved candidate material |
| W8 | separate, held |
| Implementation | ⛔ still gated on evidence |

---

### 10.1b-prior ⏳ The leaning, as recorded before ratification *(historical)*

Kelly, same message: *"Given the current state, the **least assumption-heavy path appears to be**"* —

```
Preserve corpus
      ↓
Use existing Crossing v1 as the measurement instrument
      ↓
Run evidence
      ↓
Decide whether the result warrants a new governing relationship
```

⭐⭐ Its rationale — **experience before architecture** — is the project's own standing discipline.

⛔⛔ **Recorded as a leaning, not a ruling.** The phrasing is subjunctive (*"appears to be"*), and
this project has already ruled that **counsel stated as *what I would rule* is not the act of
ruling** (`CORRECTION_3_AND_PHASE_1_RULING_DRAFT_2026-08-03` §three-stage separation). Granting G1
governing authority remains an outstanding founder act.

⚠️ Note what G1 would and would not do: it makes Crossing v1 the **measurement instrument** for
authorship preservation. It does **not** make the corpus governing, does not authorize Writer's
Field construction, and leaves *"can this room become the Writer's Field?"* unasked and unanswered.

### 10.1c The measurement chain must not drift

```
MEASUREMENT              f46a4fde4
                             ↓
                    observed / reported state
                             ↓
                 documents preserve interpretation

CURRENT DEVELOPMENT      c0a133059+
                             ↓
                    future work may change it
                             ↓
       requires NEW measurement if acceptance depends on it
```

⛔ **The preservation branch may not silently become a new evidence referent.** These documents are
records of a measurement at a stated SHA; the branch they sit on is newer than that SHA by
construction and says nothing about the current tree. ⚠️ Trunk moved **twice** on 2026-08-05
(`57b0324fd` → `f46a4fde4` → `c0a133059`).

### 10.1d Two commits, two questions — ⛔ keep separate

| Commit | Question it answers | Kind |
|---|---|---|
| `a3fcd2c50` | *Can a writer enter writing without being blocked by the system's uncertainty?* | **behaviour change** |
| `6f9ed48f3` | *What larger question is the Writer's Field trying to answer?* | **governance record** |

⛔ Keeping them apart prevents the collapse this lane guards against: **a small fix becoming an
accidental architecture decision.**

### 10.2 What the record has already blocked

| Tempting error | Why it is blocked |
|---|---|
| *"The design exists, therefore build it."* | ⛔ the corpus declares itself candidate (§1) |
| *"The crossing passed, therefore W8 is fixed."* | ⛔ the two instruments have separate identities (§9ter) |
| *"G1 vs G2 is a design contest."* | ⛔ they answer different questions (§10.1) |

⭐⭐⭐ **The pieces are not absent; the organizing relationship is.** This decision names *what
relationship is allowed to organize them.*

---

## 11. Standing state

Phase 1 **failed at W8** · `a3fcd2c50` **local, unpushed** · Canvas work **exists in one browser
profile only** · 10 of 12 claude.ai artifacts **unread** · design corpus **found, unratified**.

⭐⭐⭐ The lane's own summary: **the pieces are not absent; the organizing relationship is.**
