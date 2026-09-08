# Episodic Phase 2 — Design Constraint: Regularity Bias in Retrieval

**Status**: Named design constraint. **Not canon. Not a lane. Not authorization to change decay, ranking, or schema.** An input to the (still unauthored) temporal Episodic Phase 2 spec, in the same posture as `TEMPORAL_MEMORY_DIRECTION_2026-09-06.md`: frozen reference, not standing permission.

**Date**: 2026-09-08
**Authorized by**: founder ruling, 2026-09-08 (capture this constraint only)

---

## §0. Naming collision — read first

Two documents carry the name "Episodic Phase 2":

1. `docs/specs/EPISODIC_LAYER_PHASE_2_SPEC_2026-07-13.md` — **implemented** (backend only, substrate lane). Member-marked episodes reaching the prompt.
2. The **temporal** Episodic Phase 2 named in `CLAUDE.md` and in `TEMPORAL_MEMORY_DIRECTION_2026-09-06.md` — **unauthored**, sequence step 5.

**This constraint attaches to (2).** It does not amend, reopen, or criticise (1).

## §1. The constraint

> **A retrieval system must not make recurrence a proxy for developmental significance. A singular, once-said encounter may be more developmentally important than a frequently reinforced pattern.**

## §2. Why this is not already discharged

`EPISODIC_LAYER_PHASE_2_SPEC_2026-07-13.md` §II.B already refuses **manufactured significance** at selection: its loader's only criterion is `marked_by_member = TRUE`, and it never reads `significance`, `emotional_intensity`, or `breakthrough_level`.

That is a **different stage and a different table**. It governs which `episodic_memories` rows are eligible. The regularity bias operates downstream of eligibility, in **ranking and cut-off** over developmental memories in `MemoryBundle` — where a row that is admitted can still lose its place to a better-scored competitor. Refusing to manufacture significance does not prevent a scoring function from *demoting* significance the member already declared.

## §3. Production grounding (F2/F3, `TEMPORAL_MEMORY_DIRECTION_2026-09-06.md`)

Stated at the strength the evidence supports, not above it:

- **Witnessed.** Invisible age decay changes which developmental rows survive the non-vector top-12 retrieval cut for 2 of the 14 members whose pool exceeds 12. For member `17a14614`, five of twelve retrieved candidates change on roughly a one-month age difference (rank displacement 12–15). Mean absolute rank shift across all 2018 candidates is 22.8; maximum 396. **The material upstream selection effect is established.**
- **Not witnessed.** Whether that effect propagates through `MemoryBundle.build()` (merge → rerank → dedupe → `maxBullets`, default 5) into prompt-injected memory. F2 observed the retrieval stage, not the prompt. This remains the carried open question.
- **Structural but not operative.** The recurrence half of the bias exists in the scoring function — `calculate_decayed_confidence(...)` takes `last_confirmed`, and a separate SQL term rewards `confirmed_by_user` (max contribution 0.0225). **None of the twelve membership-flipped rows were member-confirmed**, so reinforcement did not cause the measured flips. Recurrence is a live *term*, not a witnessed *cause*.
- **Suggestive, unmeasured.** The only `memory_type` present in production is `pattern` (2018 of 2018 rows). Whether `pattern` rows are recurrence-derived or member-marked is a **provenance question F2 did not measure**; the type label alone does not settle it. If they are recurrence-derived, then the sole live developmental memory type is one constituted by repetition, and the singular encounter has no live substrate at all. That is a question for Phase 2 to answer, not a finding to assert here.

Note also F3: decay has **two divergent implementations** (SQL function vs `lib/memory/confidenceDecay.ts`) and no single authoritative definition. Any Phase 2 work against this constraint inherits that ambiguity and must resolve it before claiming a measurement.

## §4. The Phase 2 question

> **Can the memory architecture preserve and recover singular, high-significance developmental encounters without requiring repetition to establish their retrieval authority?**

Candidate retrieval architectures are required to **falsify against this constraint**, not to assert compliance with it. Minimum falsification shape:

1. Capture `selectionTrace` for the two members F2 identified and close the carried open question — does the upstream effect reach the prompt?
2. Construct the discriminating case: a single, member-marked, never-repeated encounter of high declared significance, competing against a frequently reinforced pattern. Show whether the singular row survives to the prompt, and under what conditions it does not.
3. State the answer as a measurement, not a design intention.

**No mechanism is prescribed here.** Boosting member-marked rows, exempting them from decay, reserving slots, separating pools, or changing half-lives are all *unauthorized candidate responses* — listing them is not endorsing them. Choosing among them is Phase 2 work, decided on evidence.

### §4.a. Shared-competition requirement

*Appended by founder authorization, 2026-09-08. This defines what would count as a valid falsification of the already-ratified constraint. It is not a choice of acceptance mechanism.*

> A falsifier does not test this constraint if the singular encounter and the reinforced pattern are placed in separate pools or retrieval paths that never compete. The witness must establish that both candidates contend for the same retrieval budget at the same selection stage toward the same prompt destination. If the architecture intentionally separates them, the witness must instead identify and test the **cross-pool arbitration** that determines which reaches the prompt. Segregation alone is not evidence that singular developmental significance has been preserved.

The reason, which belongs with it:

> **A system may not pass this constraint by arranging for the discriminating comparison never to occur.**

This constrains the **witness**, not the architecture. Every mechanism remains open — shared pool, reserved capacity, separate pools with explicit arbitration, or something not yet named. What it forecloses is a **false-positive witness**: a Phase 2 candidate reporting preservation when it has only achieved segregation, and never placed the two classes under the same selection pressure.

Concretely, a witness discharging §4.2 must state, as measured facts and not as design intent: the selection stage at which the two candidates met, the budget they contended for, and the prompt destination they were competing to reach — or, where they did not meet, the arbitration step that chose between them and the result of testing it.

## §5. Provenance of the constraint

Surfaced 2026-09-08 while reading a transcript of a Terence McKenna talk on shamanism, in the passage observing that only what recurs is "authenticated by our languages," while "the edge of cognition, the unique part of our own felt experience" is not.

**The transcript is not adopted as authority and is not doctrine.** Its imagery, its epistemology, and its initiatory hierarchy are all outside this record. What transfers is a single structural observation, which is admitted here **only because production evidence independently supports the mechanism**. Same posture as the tutorial in `TEMPORAL_MEMORY_DIRECTION_2026-09-06.md`: the reading occasioned the question; the audit is what grounds it.

No new `docs/research/human-experience/` artifact was created from that transcript, by founder ruling.

## §6. Relationship to existing law

This constraint is an application of already-constituted architecture, not a new authority:

- **Canon v1.1 §V, interpretive displacement** — a system that ranks the member's singular declaration below its own inferred pattern has displaced their interpretation with its own statistics.
- **Constitutional Direction of Authority** — authority moves upward through authored experience. A retrieval score that outranks an authored encounter with a system-derived pattern inverts that direction silently.
- **Growth obligation** (`RECIPROCAL_SOVEREIGNTY_INTENTION_2026-08-04.md`) — *what uncertainty does this introduce, and how is it preserved?* This document introduces none: it restrains rather than extends capability, and it makes an existing, previously invisible selection effect legible as a question. The responsibility it creates is that any future Phase 2 candidate must answer §4 before shipping, and may not pass by asserting the constraint is satisfied.

## §7. What this document does not authorize

No decay change. No ranking change. No schema. No migration. No wiring of `shouldPromptForConfirmation`. No lane. No re-run of the frozen audit. `TEMPORAL_MEMORY_DIRECTION_2026-09-06.md` remains **FROZEN** and is cited here, never edited.
