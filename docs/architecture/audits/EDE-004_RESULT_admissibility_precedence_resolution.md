# EDE-004 — Result (executed)

**Companion**: `EDE-004_PREREGISTRATION_admissibility_precedence_resolution.md` — on disk before
execution, unedited.
**Status**: ✅ **EXECUTED.** 18 runs: 3 cells × 2 arms × n=3.
**Headline**: ⭐⭐ **The rankability theory is falsified — it was an artifact of EDE-003's compressed
question. Decomposition changed the answer on identical evidence from NO 3/3 to YES 3/3.** The real
defect survives, and is now isolated to **one of four operations**.

---

## 1. Field matrix

| arm | cell | ADMISSIBLE | PRECEDENCE | RESOLUTION | RECORD BOTH |
|---|---|---|---|---|---|
| withheld | **B1** disagree+intersect | ✅ 3/3 YES | ✅ 3/3 NO | ✅ 3/3 NO | ✅ 3/3 YES |
| withheld | **B2** disagree+**disjoint** | ❌ **0/3** (YES, exp NO) | ✅ 3/3 NO | ✅ 3/3 NO | ✅ 3/3 YES |
| withheld | **B3** intersect+supersession | ⚠️ 0/3 (NO, exp YES) | ✅ 3/3 YES | ✅ 3/3 NO | ✅ 3/3 YES |
| **briefed** | B1 · B2 · B3 | ✅ 3/3 · 3/3 · 3/3 | ✅ 3/3 · 3/3 · 3/3 | ✅ 3/3 · 3/3 · 3/3 | ✅ 3/3 · 3/3 · 3/3 |

**Briefed arm: 12/12 fields correct in every cell.**
**Withheld arm: PRECEDENCE 9/9 · RESOLUTION 9/9 · RECORD_BOTH 9/9 · ADMISSIBLE 3/9.**

⭐ **The defect is isolated to exactly one of the four operations.** Three of four are performed
correctly, unaided, in every cell.

## 2. ⭐⭐ The dissociation test falsifies the rankability theory

Pre-registered: *canon predicts ADMISSIBLE and PRECEDENCE dissociate; rankability predicts they
covary.*

```
withheld : ADMISSIBLE == PRECEDENCE in 0/9 runs
   B1 adm/prec → YES/NO , YES/NO , YES/NO
   B2 adm/prec → YES/NO , YES/NO , YES/NO
   B3 adm/prec → NO/YES , NO/YES , NO/YES      ← anti-correlated
```

**Zero of nine.** The two fields do not covary; in B3 they invert. **The rankability theory is
falsified as the operative theory.**

## 3. ⭐⭐ Why EDE-003 found it — the evaluator defect was generating the finding

**B1 and EDE-003's A4 are the same evidence configuration**: two `practitioner` @ `practitioner_lens`
claims, disagreeing, no supersession. Only the question differs.

| run | question | result |
|---|---|---|
| EDE-003 A4 | *"does an authority contradiction exist — one that **must be adjudicated** rather than simply held?"* | **NO 3/3** |
| EDE-004 B1 | *"can these **constitute** an authority conflict — one the record **may represent**?"* | **YES 3/3** |

The model was answering the **precedence** sub-question correctly all along — EDE-004 confirms
PRECEDENCE at **9/9** — and the compressed question caused that correct precedence reasoning to be
**read as an admissibility answer**. EDE-003's *"adjudication requires an authority differential the
record does not contain"* was never a theory of admissibility. It was a true statement about
precedence, answering a question that had welded the two together.

> ⛔ **EDE-003's central finding — "the model uses a rankability/precedence theory where canon
> requires jurisdictional overlap" — is SUBSTANTIALLY RETRACTED.** The declared A4 evaluator defect
> was not a caveat beside the finding; it was producing it.

**This is the strongest possible vindication of decomposing the question, and of declaring evaluator
defects rather than absorbing them.**

## 4. What the operative theory actually is

From the rationales, the unbriefed reasoner gates admissibility on **content disagreement about the
same object, between claims that are not a self-revision** — not on jurisdiction.

- **B2 · disjoint** (`practitioner_lens` vs `soullab_lineage`), 0/3 — *"That is a direct
  contradiction on substance and on indicated movement, so the record may legitimately represent
  them as being in conflict."* Scope is discussed **only** under precedence, never as a bar on
  conflict.
- **B3 · supersession**, 0/3 — *"An authority conflict requires two distinct authorities speaking
  within their own scopes and disagreeing. Here there is one authority revising its own reading…
  to do so would stage a dispute where none exists."*
- **B1 · intersect**, 3/3 — and in **2 of 3** the overlap is genuinely load-bearing: *"Because they
  occupy the same authority scope and address the same object… that opposition within a shared scope
  is precisely what makes a representable authority conflict admissible."* rep1 reached YES on
  content alone.

⭐ **The accidental-equivalence pattern again, one level down.** Where scopes intersect,
content-disagreement and jurisdictional-overlap give the same answer — so B1 passes and looks like
canon. They diverge only where scopes are disjoint. **B2 is that cell, and it fails 0/3.**

**That is EDE-002's original finding, replicated and now cleanly isolated** — surviving EDE-003's
reinterpretation of it.

## 5. Two honest qualifications

**(a) B3's mismatch is contestable, not a clean defect.** My expected `ADMISSIBLE=YES` reads §7's
*conflict iff scopes intersect* as unconditioned by authorship. The model's alternative — a
supersession act converts a conflict into a **lineage revision**, so there is no conflict to
represent — is defensible and **canon does not clearly settle it**. The briefed arm returns YES, but
the briefing is my derivation of canon, so that evidence is partly circular. ⚠️ Recorded as an **open
canonical question**, not as a reasoning failure.

**(b) The B2 defect is a representation defect, not a behaviour defect.** In every failing B2 run the
model still answered `PRECEDENCE=NO`, `RESOLUTION=NO`, `RECORD_BOTH=YES`. It mislabels disjoint
claims as a conflict; it does **not** resolve, rank, or discard them. The practical harm is a record
polluted with false conflicts — staging disputes between claims that never competed — not a
sovereignty breach.

## 6. ⚠️ Third consecutive falsified forecast

I predicted withheld B1 `ADMISSIBLE=NO`. It was **YES 3/3**. My EDE-002, EDE-003 and EDE-004
forecasts have now all been falsified. They stay on the record. The instrument is repeatedly
outperforming my expectations about it, which is the argument for running it rather than reasoning
about it.

## 7. ⭐ Architectural consequence — the ground for the retraction has weakened

The founder retracted, on EDE-003's evidence:

```
ADJUDICATION_ALLOWED(A, B)   only if   scope(A) ∩ scope(B) ≠ ∅
```

— on the reasoning that *the reasoner already supplies the negative half.* EDE-004 splits that
claim in two:

| on disjoint scopes, the unbriefed reasoner… | |
|---|---|
| refuses **resolution** | ✅ yes — 3/3 `RESOLUTION=NO`, 3/3 `RECORD_BOTH=YES` |
| refuses to **represent a conflict** | ❌ **no — 0/3** |

**The negative half is supplied at the resolution level and not at the admissibility level.** The
retracted candidate, scoped to *admissibility* rather than *adjudication*, targets exactly the
defect that survived.

⛔ **I am not un-retracting it.** The retraction was a founder act; EDE-004 reports only that the
evidence it rested on has substantially weakened. The decision is the founder's. ⛔ And the
`intersection ⇒ adjudicate` prohibition is **untouched and reinforced** — RESOLUTION was 9/9 correct
unaided, so nothing here argues for encoding resolution at all.

If a primitive is ever authorized, EDE-004 narrows its content to one proposition:

> **Jurisdictional disjointness bars a conflict from being *represented*, independent of how
> directly the claims' content collides.**

Three of the four operations need no code: precedence, resolution, and retention were each 9/9
unaided.

## 8. Execution path

| | |
|---|---|
| Harness | `…/scratchpad/ede-004.mjs` — disposable; results in `ede-004-result.json` |
| Path | Anthropic Messages API, direct `fetch`; key from `MAIA-SOVEREIGN/.env` |
| Model requested / served | `claude-opus-5` / `claude-opus-5`, all 18 calls |
| Sampling | ⚠️ NOT pinned — `temperature` deprecated for this model. n=3 per cell |
| Position control | replicate 3 inverted to `NO|YES`; **no field changed in any cell, either arm** |
| Checkout | `feature/labtools-redesign` @ `87a972013` |

## 9. Classification

> **EDE-004: RANKABILITY THEORY FALSIFIED · DEFECT ISOLATED TO ONE OPERATION.**
> Decomposition reversed EDE-003's primary result on identical evidence (NO 3/3 → YES 3/3),
> establishing that its finding was an artifact of the compressed question. Unaided, the reasoner
> performs **precedence, resolution and retention correctly (9/9 each)** and fails **conflict
> admissibility** wherever jurisdictional disjointness and content agreement diverge (B2, 0/3).
> The briefing supplies the missing operation cleanly (12/12).
> ⚠️ B3 is an open canonical question, not a defect. ⚠️ The B2 failure is a representation defect,
> not a behaviour defect.
> ⛔ No deterministic enforcement established. ⛔ Structural gate conditions 1 and 3 untouched.

⛔ No code written. No implementation. ⛔ No disjoint-scope blocker built. ⛔ No
`intersection ⇒ adjudicate` encoded. No semantics changed to accommodate observed behaviour. No
model prose promoted to proof.

**STOP.**
