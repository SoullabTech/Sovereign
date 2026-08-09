# Founder Ruling — MAIA Persistent Corrigibility (Gate 1)

**Date:** 2026-08-09 · **Author:** Kelly (founder) · **Status:** RULED — Gate 1 implementation authorized subject to the dispositions below.
**Accepts:** `docs/architecture/audits/MAIA_PERSISTENT_CORRIGIBILITY_RECONCILIATION_2026-08-09.md` as the governing evidence record, including its architectural diagnosis (turns lack sibling-store supersession semantics; corrected and correcting turns are peer recall candidates; the detector may identify correction but not create durable authority; MemoryWriteback aggravates; the Layer-B brief is to be completed, not duplicated; recurrence→authority is rejected).

**Central distinction of this ruling:** *The member authors the correction; the system may faithfully register the consequence of that correction.* The critical boundary is between **transcribing the consequence of an explicit act** and **inferring that an ambiguous utterance constitutes correction**.

---

## F1 — A member correction is a first-class authored act

A correction explicitly uttered or written by the member is a **member-authored act**. The system may persist that act verbatim with provenance. MAIA does not become the author merely because software recognizes the member's utterance as corrective and records its governed consequence.

Preserve as distinct: `member said correction` (member authorship) ≠ `system classified utterance as correction` (system metadata) ≠ `MAIA interpreted what the correction means` (MAIA interpretation unless separately confirmed).

## F2 — Correction changes eligibility; it does not erase history

A valid member correction may supersede prior material **for purposes of current recall eligibility**. Supersession does not delete or rewrite the historical turn. The system must remain able to establish: what was originally said · what MAIA previously understood/recalled · what the member corrected · when · which prior material lost current eligibility · what remains historically preserved.

`superseded ≠ deleted` and `historical ≠ currently assertable`. Follow the system's existing temporal/supersession grammar wherever possible.

## F3 — Correction authority does not propagate into MAIA interpretation

"No, X is wrong. I mean Y" → Y may carry member authority **to the extent actually expressed by the member**. MAIA's subsequent "then Y must mean Z" acquires nothing. The member's correction of X does not authorize the system to generate additional member claims by implication. `correction ≠ replacement ≠ interpretation ≠ confirmation` — one act does not silently license the next.

## F4 — Silence and recurrence confer no authority

Retained: silence is not consent · recurrence is not confirmation · repetition does not promote an interpretation into member truth · model confidence does not create member authority. The former COGOS recurrence→authority rule is constitutionally rejected. **DO NOT RESURRECT.**

## F5 — Explicit conversational correction is sufficient; no second ceremony

A member must not be required to visit a separate room, memory manager, or confirmation interface merely to make an explicit correction persist. An ordinary conversational act is itself constitutive when the member clearly performs the correction (semantic equivalents of: "That's not what I meant" · "No, that's wrong" · "I meant Y, not X" · "Please don't remember me that way" · "I used to think X, but that's changed" · "That isn't true about me").

The system may detect such an act and register its consequence. **Detection does not create authority; the member's utterance does.** The detector functions as recognition/transcription of an authored act, not as author.

**Ambiguous language must fail toward non-supersession**: hesitation, topic change, emotional shift, contradiction inferred from context, or MAIA's suspicion that something changed are insufficient by themselves.

## F6 — Detection must be inspectable and reversible

The durable record must be capable of establishing: member identity · correcting turn · corrected/superseded referent · verbatim correction where applicable · timestamp · detection/classification provenance · resulting eligibility change. The member must ultimately be able to **correct the correction** or restore material where the system misclassified. "Reversible" does not authorize a particular UI in this gate — the constitutional requirement is **corrigibility of the corrigibility mechanism itself**.

## F7 — Authority principle (narrow ratification for this gate)

**Epistemic authority arises from an attributable act or an explicitly governed authority state; it does not arise merely from recurrence, inference, silence, statistical confidence, or system repetition.**

This ruling is narrow: do not expand it beyond the epistemic/corrigibility domain without separate review. Broader claims of `AUTHORITY_IS_AUTHORED_OR_HELD_2026-08-06.md` remain PROPOSED.

---

## Implementation authorization

Gate 1 implementation is authorized subject to these rulings.

- **Piece A — durable conversational correction**: conversation-turn eligibility/supersession semantics + first-class member correction record. Requirements: original turns historically preserved · superseded turns ineligible for unqualified current recall · correction attributable and verbatim where appropriate · ambiguous detector output cannot silently supersede · chains reconstructable · correction-of-correction works · member isolation preserved.
- **Piece B — interpretation authority**: RECONNECT + COMPLETE the existing Layer-B design brief under its governed promotion semantics. No recurrence-based authority. Promotion grounded in the member act.
- **Retrieval enforcement**: all six live re-entry paths honor supersession. Prefer eligibility at the common SQL/read boundary; never rely solely on prompt instructions. A superseded item should not ordinarily reach the model as current memory; historical retrieval only when the use itself calls for historical context.
- **MemoryWriteback**: corrective exchanges must not distill into durable memory in a way that reasserts the superseded misunderstanding. Do not merely delete correction significance — preserve *"a meaningful correction happened"* without preserving *"the corrected claim remains current truth."*
- **Invariants**: implement the reconciliation's 11; at minimum prove: correction persists across sessions · corrected material loses current-recall eligibility · remains historically inspectable · replacement retains member authorship · MAIA interpretation does not inherit member authority · silence cannot promote · recurrence cannot promote · correction-of-correction resolves · ambiguity does not supersede · all six re-entry paths honor eligibility · no cross-member effect. Mutation-test those most capable of silently regressing.
- **Production data**: **no retroactive inference of corrections across historical turns; no bulk detector pass.** The repair governs new correction acts prospectively. If migration must represent eligibility, default existing turns to eligible. **Do not fabricate supersession history.**

## Gate completion standard

Gate 1 closes only after: implementation → invariants → mutation proof → regression → merge → deploy → **production-equivalent correction encounter** → later-session recall verification. Live proof: member states X → MAIA can recall X → member explicitly corrects X to Y → later encounter recalls Y appropriately → X does not return as current truth → historical evidence of X remains → MAIA interpretation around Y has not silently become member truth. Synthetic/test-member data; no private member content in the verification artifact.

**After Gate 1: STOP.** Return closure evidence + updated readiness scorecard. Gate 2 requires its own authorization.
