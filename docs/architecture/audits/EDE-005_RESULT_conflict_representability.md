# EDE-005 — Result (executed)

**Companion**: `EDE-005_PREREGISTRATION_conflict_representability.md` — on disk before execution,
unedited.
**Status**: ✅ **EXECUTED.** 21 runs: 6 cells × n=3 withheld, + 3 briefed control on C3.
**Headline**: ⭐⭐ **H-R survived falsification — and in doing so removed the candidate's evidentiary
basis.** The pre-registered rule for this outcome fires exactly as written.

---

## 1. Representability matrix (withheld)

|  | D0 concordant | D1 moderate | D2 maximal |
|---|---|---|---|
| **disjoint** | NO,NO,NO **[3/3 ✅]** | NO,NO,NO **[3/3 ✅]** | NO,NO,NO **[3/3 ✅]** ⭐ |
| **intersect** | NO,NO,NO **[3/3 ✅]** | NO,NO,NO **[0/3 ❌]** | NO,NO,NO **[0/3 ❌]** |
| *expected* | disjoint NO · NO · NO | intersect NO · **YES** · **YES** | |

**Briefed C3** (disjoint/D2): NO, NO, NO ✅

**Text-invariance control**: C3 vs C6 differ in exactly 2 lines — `authored_by` and
`authority_scope`. The claim texts are byte-identical across the scope factor, as required.

## 2. ⭐ H-R survived — and the pre-registered consequence is unfavourable to the candidate

**C3 is the falsification cell**: maximal semantic pressure (exact mirror-negation) with scopes
demonstrably disjoint. It passed **3/3 on verdict and 3/3 on rationale**, with jurisdiction
load-bearing and unaided:

> **C3·rep1**: *"an* authority *conflict requires that the claims compete for the same authority,
> i.e. share an `authority_scope`… Here the scopes are disjoint."*
> **C3·rep2**: *"The scopes are disjoint, so neither claim's authority reaches into the other's
> domain, and there is no shared ground on which one could override or outrank the other."*
> **C3·rep3**: *"Nothing in the records establishes that these scopes overlap, rank against one
> another, or that either claim is asserted within the other's scope."*

Pre-registered rule §7, applied without amendment:

> *"**C1–C3 all pass** → ⛔ H-R holds unaided; **EDE-004 B2 was construction-specific** and the
> candidate loses its evidentiary basis. Report as such."*

> ⛔ **`CONFLICT_REPRESENTABLE(A,B) requires scope(A) ∩ scope(B) ≠ ∅` — the candidate is reported as
> having LOST ITS EVIDENTIARY BASIS.** The model performs the operation unaided, at maximal semantic
> pressure, citing the canonical ground.

## 3. ⚠️ But the verdict carries no information — 18/18 were NO

Every withheld run in every cell answered NO. **Zero verdict variance.** The disjoint column
therefore cannot be scored as scope reasoning on the verdict alone; only the **rationales** are
cell-sensitive, and they are, systematically:

| cell | operative rationale |
|---|---|
| C1/C2/C3 disjoint | scope disjointness — canonical ✅ |
| C4 intersect/concordant | *"duplication, not disagreement… possibly a double-entry artifact"* ✅ |
| C5 intersect/moderate | *"an assertion of unclarity does not negate a determinate reading"* |
| C6 intersect/maximal | *"a substantive contradiction* within *a single lens… not an authority conflict"* |

C4 is a genuine positive: the reciprocal control held, and for the right reason — intersection alone
was **not** read as conflict.

## 4. ⭐⭐ The new finding — a distinction canon does not draw

C5 and C6 failed 0/3 on a consistent and articulate theory: **an authority conflict requires two
distinct authorities.**

> **C6·rep2**: *"An authority conflict is a conflict* between *authorities — it requires two distinct
> scopes whose claims the record cannot jointly defer to… There is only one authority in play, and
> it stands on both sides."*
> **C5·rep1**: *"Here there is only one authority speaking twice… Encoding it as an authority
> conflict would fabricate a second authority that the evidence does not contain."*

⭐ **The model is not refusing to represent the tension.** C6·rep1: *"That is representable, and
should be, but as an **intra-scope contradiction**, not an authority conflict."* It is refusing the
**label**, and proposing a distinction §7 lacks:

| | §7 as written | the model's proposal |
|---|---|---|
| distinct authorities, intersecting scopes, contradictory | conflict | **authority conflict** |
| same authority, same scope, contradictory | conflict | **intra-scope contradiction** — a matter for revision or dating within that lens |

This replicates EDE-004 B3 (0/3, *"one authority revising its own reading"*). Across B3 + C5 + C6
that is **9 runs**, consistent. ⚠️ Ruled **`CANONICALLY UNRESOLVED`**, on the same reasoning that
governs B3: the evaluator cannot score disputed admissibility semantics, and briefed agreement
cannot settle it when the briefing supplies the interpretation.

## 5. ⭐⭐⭐ The result that outranks all of the above — instability under paraphrase

**EDE-004 B1 and EDE-005 C6 are the same structural configuration**: two `practitioner` @
`practitioner_lens` claims, directly contradictory, no supersession. They received **opposite
answers, for opposite reasons, from the same premise**:

> **EDE-004 B1·rep2** *(ADMISSIBLE = YES)*: *"Because they occupy the same authority scope… that
> opposition **within a shared scope** is precisely what makes a representable authority conflict
> admissible."*
> **EDE-005 C6·rep1** *(REPRESENTABLE = NO)*: *"c-4471 and c-9002 occupy identical standing in the
> record, so **no authority axis separates them**… Encoding it as [an authority conflict] would
> fabricate a distinction in standing that the evidence does not contain."*

Shared scope is read as **the ground for** conflict in one run and **the ground against** it in the
other. This is **not a stable alternative theory. It is instability.**

**And it is the second such reversal in this sequence:**

| pair | same evidence structure | result |
|---|---|---|
| EDE-003 A4 ↔ EDE-004 B1 | disagree + intersect | NO 3/3 → **YES 3/3** |
| EDE-004 B2 ↔ EDE-005 C3 | disagree + disjoint | YES 3/3 → **NO 3/3** |

> ⛔ **The measured defect is not stable under question paraphrase.** Both times, a change in how the
> question was decomposed or worded reversed a 3/3 result. **The instrument has been measuring
> constructions at least as much as capabilities.**

**HYPOTHESIS — NOT ESTABLISHED**: EDE-004's four-field prompt may have leaked — asking
`PRECEDENCE_ESTABLISHED` immediately after admissibility plausibly licensed a loose *"there is a
conflict, but no precedence"* reading that the single-question format forecloses. Testable; not
tested here.

## 6. ⚠️ Fourth consecutive falsified forecast

I predicted C3 would **fail**, with failures increasing D0→D2. C3 passed **3/3**, and the disjoint
row was flat. EDE-002, -003, -004 and -005 forecasts are now all falsified. They stay on the record.

## 7. Execution path

| | |
|---|---|
| Harness | `…/scratchpad/ede-005.mjs` — disposable; results in `ede-005-result.json` |
| Path | Anthropic Messages API, direct `fetch`; key from `MAIA-SOVEREIGN/.env` |
| Model requested / served | `claude-opus-5` / `claude-opus-5`, all 21 calls |
| Sampling | ⚠️ NOT pinned — `temperature` deprecated for this model. n=3 per cell |
| Prompt hygiene | the words *precedence · adjudicate · resolve · discard · withdraw · rank · override · supersede* appear nowhere in the prompt, per pre-registration |
| Position control | replicate 3 inverted to `NO\|YES`; no verdict changed in any cell |
| Checkout | `feature/labtools-redesign` @ `87a972013` |

## 8. Classification

> **EDE-005: H-R SURVIVES FALSIFICATION · CANDIDATE'S EVIDENTIARY BASIS WITHDRAWN ·
> INSTABILITY UNDER PARAPHRASE IS THE DOMINANT FINDING.**
> Under maximal semantic pressure with disjoint scopes, the unbriefed reasoner declined to represent
> an authority conflict, 3/3, citing jurisdiction. Per the pre-registered rule, EDE-004 B2 is
> construction-specific and `CONFLICT_REPRESENTABLE(A,B) requires scope ∩ ≠ ∅` **loses its
> evidentiary basis**.
> ⚠️ Verdicts were uniformly NO (18/18); only rationales discriminate.
> ⚠️ C5/C6 (0/3) surface a distinct-authorities requirement canon does not state — ruled
> **CANONICALLY UNRESOLVED**, replicating EDE-004 B3 across 9 runs.
> ⛔ EDE-004 B1 and EDE-005 C6 contradict each other on identical structure. Two paraphrase
> reversals now stand in the record.

## 9. Recommendation

**⛔ No implementation is warranted on this evidence, and the ground for it is weaker now than
before EDE-005 ran.** Five experiments have produced a candidate that survives only in the
constructions that generated it.

**What would be required before any code**, stated so it is not mistaken for a plan:

1. **Paraphrase stability first.** Any defect must survive ≥3 independent phrasings of the same
   question before it counts as a property of the reasoner rather than of the prompt. Neither
   reversal above would have passed that bar. This should become a standing EDE rule.
2. **Resolve the canonical question, by founder act, not by evaluator.** Does §7's *conflict* cover
   same-authority intra-scope contradiction, or is the model's distinction correct? Nine runs now
   turn on an ontology canon does not settle. ⛔ The evaluator must not settle it.
3. **Only then** ask whether a deterministic set-intersection check adds anything the model does not
   already supply — a question EDE-005 currently answers *no*.

⛔ No code written. No implementation. No adjudication gate. No `intersection ⇒ adjudicate`. No
semantics changed to accommodate observed behaviour. No model prose promoted to proof.

**STOP.**
