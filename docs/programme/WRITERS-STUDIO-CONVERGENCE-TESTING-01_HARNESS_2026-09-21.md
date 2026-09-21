# `WRITERS-STUDIO-CONVERGENCE-TESTING-01` — Acceptance and Falsification Harness

**Status** ⭐ **RATIFIED AS A TESTING INSTRUMENT** (founder, 2026-09-21) · ⛔ **NOT build
authorization for the capabilities under test**
**Governs** how the ratified convergence laws are proved.

> ⭐ **Testing principle (founder):** *Mechanical invariants are tested mechanically. Human
> experience is witnessed by the Founder only where human perception is actually required.*

⛔ Founder manual repetition may **never** substitute for automated conformance. ⭐ The founder is
the **final witness**, ⛔ not the test harness.

---

## 0 · ⭐⭐ LETHALITY FIRST — the harness is built BEFORE the implementation

This repository has already ratified the discipline this harness needs, in the S3 Class B phase:

> *"**B-ii** BUILD each named defeat candidate as a disposable stub · **B-iii** demonstrate the
> suite **KILLS EACH ONE** — ⛔ a surviving candidate repairs the **SUITE**, never the candidate ·
> **B-iv** only then the real implementation, written to a suite already proven lethal."*
> *"Lethality becomes a precondition of the implementation rather than a hope about it."*

⚠️ **A suite written against an implementation that already exists passes by construction and
proves nothing.** ⛔ That is the failure mode this ordering exists to prevent, and it is the one a
convergence lane is most exposed to, because every law here is easy to satisfy in appearance.

⭐ **Required order**: author the suite → build a deliberately wrong candidate per law → prove each
dies on its named test → **then** implement. ⛔ Any law whose defeat candidate survives means the
test is too weak; repair the test.

### Defeat candidates, named in advance

| Law | The competent, plausible, ⛔ WRONG implementation |
|---|---|
| A · same observation | Facets each call the reader separately — ⭐ three readings, three renderings, **indistinguishable from one reading rendered three ways unless identity is compared** |
| A · authorship | Guided prepends a fuller draft "to be helpful"; authorization is untouched, so narrow authorship authority still passes |
| A · reachability | Guided caps at six with **no** *See more*; passes every per-observation test |
| B · adoption | *"Am I hearing that correctly?" → Yes* writes the declaration (⭐ the §1 finding of ARRIVAL-EXPERIENCE-01) |
| B · states | Unreached dimensions render *Still discovering*; data looks complete and correct |
| C · order | Manuscript order **with ties broken by severity** — positional almost everywhere, ranked where it matters |
| D · passes | The range-picker is hidden but still required when coverage is large |
| E · Compass | Compass text is concatenated into the reader's prompt but not into `evidence` |

---

## A · Facet conformance

For **one identical governed observation** through **GUIDED · LEARNING · DIRECT**, prove identical:
underlying observation · evidence · coverage · revision authority · observation reachability.
⭐ Facet changes affect **presentation only**.

**⛔ FAIL IF** facet changes the underlying conclusion · Guided or Learning makes observations
unreachable · facet changes how much prose MAIA may author · Learning prescribes quality rather
than describing technique · Direct gains a different editorial truth.

### ⚠️⚠️ PREREQUISITE — AN OBSERVATION HAS NO IDENTITY TODAY

⭐ **Test A is unwritable as stated, and this is the most important finding in this document.**

`ReaderClaimDraft` (`lib/manuscript/developmentalReader/contract.ts`) carries exactly:

```
text            — what was noticed, in MAIA's words
refs            — evidence refs, bound before a result exists
doesNotEstablish — at least one, from the closed non-conclusion vocabulary
```

⛔ **There is no id.** So *"the same underlying observation across three facets"* has nothing to
compare — except `text`, ⛔ **which facets vary by design.** ⚠️ A suite that compares rendered text
either fails always (facets differ, correctly) or is weakened until it passes vacuously.

> ⭐ **Binding: facet conformance requires an observation identity INVARIANT UNDER PRESENTATION.**
> ⭐ It must derive from what a facet cannot change — `refs` · `doesNotEstablish` · the commissioned
> lens · the frozen evidence state. ⛔ It must **never** derive from `text`.

⭐ This is not merely a testing convenience. **It is the founder's own architecture —
*One observation. Three expressions.* — requiring an object that does not yet exist.** ⛔ Without
it, "three expressions of one observation" and "three separate readings" are indistinguishable from
outside, which is exactly what defeat candidate A-1 exploits.

### ⚠️ One named condition is NOT mechanically testable as written

> *"Learning prescribes quality rather than describing technique"*

⛔ This is a **semantic judgment about generated prose.** A test can prove teaching content **exists**,
is **optional**, and is **attached to an observation**; ⛔ it cannot prove the content does not
import an external standard of good writing.

⭐ Two honest resolutions, ⛔ neither chosen here:

1. ⭐ **Make it structural** — teaching is drawn from a **bounded, reviewable governed set** rather
   than generated free-form. Then it is testable by construction, and the set is auditable once
   rather than per-turn. ⚠️ Architectural consequence, ⛔ not a test-harness decision.
2. Assign it to **founder witness** (§F) and ⛔ say so plainly, rather than letting a weaker
   proxy test imply it was established.

⛔ **What the suite may never do is report this as mechanically proved.**

---

## B · Work Compass / intention custody

Synthetic member cases: all declared · partial · declared-open · never-declared · revises prior ·
rejects MAIA wording · **partially** accepts · skips arrival · switches facet after declaring ·
contradicts an earlier declaration.

**⛔ FAIL IF** inferred wording becomes declaration without adoption · never-declared renders as
incomplete required fields · Compass changes when facet changes · Compass evidence discharges
manuscript coverage · an earlier declaration silently overrides a later one.

⭐ **Two conditions added from ARRIVAL-EXPERIENCE-01**, both being cases the listed set does not
reach:

- ⛔ **FAIL IF** a comprehension confirmation (*"Am I hearing that correctly?" → Yes*) produces a
  declaration without the separate adoption act.
- ⛔ **FAIL IF** a dimension the conversation never reached is written as *Still discovering* —
  ⭐ that is MAIA declaring on the member's behalf, and it collapses **declared-open** into
  **never-declared**.

⭐ Testability note: **adoption provenance is already required by the custody law** — each
declaration records *whether the member wrote it directly or adopted wording developed in
conversation.* ⭐ That field is what makes case 6/7 and the adoption condition mechanically
checkable; ⛔ without it they are not.

---

## C · Observation reachability

⭐ Ordering follows **manuscript order**. ⛔ No severity, confidence, actionability or hidden ranking
may determine the cut. ⭐ All governed observations remain reachable.

⭐ **Test it as a total function**: the full observation set must be recoverable from **every**
facet by ordinary navigation, and the surfaced prefix must be a **positional prefix** of the
manuscript-ordered set. ⛔ *"Manuscript order with ties broken by severity"* must fail — ⭐ so the
tie-break itself must be positional and asserted.

---

## D · Convergence spine

`WORK → REVIEW → OBSERVATION → PASSAGE → CONVERSATION → REVISION → WORK` on **Elemental Alchemy**.

Verify: review requestable ⛔ without technical lens selection · long manuscript read through
**governed passes**, ⛔ not member-operated range selection · coverage **recorded** · observations
in lawful order · **Show me** resolves to the **exact** location · disagreement **preserves** the
dialogue ⛔ rather than forcing closure · proposed wording **editable before authorization** ·
mutation **requires** authorization · **Undo** works · return **restores** location.

⭐ *No dead end* and *no loss of place* are graph properties and are fully mechanical: every state
reachable in the walk must have a route back to the manuscript, and the restored location must
equal the departed location by **identity**, ⛔ not by chapter.

---

## E · Compass separation

During the EA review, EA-as-governed-knowledge stays **unavailable to the reader**. The Compass may
orient conversation; ⛔ it must not serve as evidence for textual claims.

**⛔ FAIL IF** *"You told me the Work is about X"* becomes *"The manuscript is about X"* without
coverage-derived textual evidence.

### ⭐⭐ This is already TRUE BY SHAPE — test it there, not behaviourally

`DevelopmentalReaderRequest` carries exactly **three** fields — `commissionedLens` · `evidence`
(*"carries no prose by construction"*) · `recovered`. ⛔ **There is no field a Compass declaration
could travel in.**

> ⭐ **Binding test: the reader request type gains no field capable of carrying a declaration.**

⭐ A type-level guard is strictly stronger than a behavioural one, and it is this codebase's settled
preference — *true by shape rather than by a check somebody must remember.* ⚠️ It also catches
defeat candidate E-1, which slips the Compass into the **prompt** while leaving `evidence` clean:
⛔ the guard must therefore cover **everything the reader is handed**, not the `evidence` field
alone.

⭐ `lib/manuscript/structure/readScope.ts` already states the governing law — the reader interprets
the Work **as written**, ⛔ not authorial intention reconstructed from auxiliary material.

---

## F · Founder witness — minimal

⭐ **After automated conformance is green**, three walks only:

1. **Guided** — whole-manuscript *Elemental Alchemy* review
2. **Learning** — one chapter with contextual teaching
3. **Direct** — one explicit professional editorial commission

Asking only: Is the next action obvious? · Does the Work remain primary? · Does MAIA feel
relational rather than procedural? · Is disagreement easy? · Is authorship visibly mine? · Can I
return to the manuscript without losing place?

### ⛔ The confabulation boundary

⭐ These six are **experiential properties**. ⛔ **No automated result may report them as
established**, and ⛔ no harness output may be phrased so that a later reader mistakes a green suite
for a human finding.

⭐ The lawful form the harness may claim: *"this surface presents N actions, all with stated
consequence, and every state has a route back"* — ⛔ never *"this feels simple."*
⭐ *Unknown — requires the founder walk* is a **result**, ⛔ not a gap.

---

## Standing

**⭐ RATIFIED** as the testing instrument for the convergence laws.
**⭐ OWED BEFORE IMPLEMENTATION** (§0): the suite, the defeat candidates, and proof of lethality.
**⚠️ PREREQUISITE, BLOCKING TEST A**: an observation identity invariant under presentation.
⛔ Not designed here — it is an object the architecture needs, and its shape is a founder act.
**⚠️ NOT MECHANICALLY TESTABLE AS WRITTEN**: *Learning prescribes quality* — resolve structurally
or assign to §F, ⛔ never proxy it.
**⛔ NOT AUTHORIZED BY THIS ACT**: implementing any capability under test · the arrival · Compass
persistence · convergence steps 2–8, which remain **NOT STARTED**. ⛔ **Production untouched.**
