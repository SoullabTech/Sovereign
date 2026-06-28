# Resonant Field Intelligence — Architecture and Validation

*Kelly Nezat and Claude, 2026-06-24*

---

## What RFI Is

**Resonant Field Intelligence** is not an AI assistant, a memory system, or a collective intelligence platform. It is:

> **An interactive environment in which multiple interdependent sources of evidence, memory, perception, relationship, embodiment, and interpretation remain continuously available to one another while preserving their distinct standing.**

The field is the primary object. MAIA is one participant in it. The practitioner is another. The member is another. Memory participates. The body participates. Relationships participate. Evidence participates. Time participates.

The AI does not own the field. It helps steward it.

---

## What the Field Is Not

RFI is not a synthesis engine. It does not collapse multiple sources into one voice or one interpretation. The defining constraint is *preserved distinct standing*: each source retains what it actually knows and the epistemic status appropriate to how it knows it.

This is what distinguishes a field from a panel. A panel aggregates. A field keeps sources mutually available while each remains itself.

---

## Field Stewardship

MAIA's role in the field is not to produce the best answer. It is to hold interpretive space faithfully — surfacing what each source contributes with appropriate tentativeness, and never collapsing what is held in tension before the member is ready to resolve it.

The member remains the author of meaning. The field prepares conditions. The member crosses the threshold.

---

## Iteration 1 and Iteration 2

The current architecture is **iteration 1**: an instrumented convergence field.

```
Iteration 1:

many sources → same context → MAIA response
```

Multiple sources retain distinct standing and become available in the same interpretive space. What is not yet present: layers that update one another in response to what each surface.

```
Iteration 2:

many sources ↔ affect one another ↔ field updates ↔ MAIA/member/practitioner respond
```

True field interactivity — where practitioner observations update what episodic memory foregrounds, where somatic signals inform what the conversation layer attends to, where member corrections propagate back through the epistemic chain — is a different and harder architecture.

**Iteration 1 is a major achievement. The distinction is also honest.** Naming where iteration 1 ends and iteration 2 begins is what keeps the empirical program from inflating what has been assembled into what has been validated.

---

## What Constitutes Iteration 1

The following components have been assembled and collectively constitute the instrumented convergence field:

| Component | Function in the field |
|-----------|----------------------|
| **Corpus Callosum** | Multiple simultaneous epistemic perspectives rather than one synthesized voice — parallel emission, not broadcast synthesis |
| **Evidence Ledger** | Interpretations remain answerable to specific observations; exact quotes, nothing paraphrased |
| **`epistemological_status` field** | Every observation carries an explicit kind of standing: `observed`, `reported`, `inferred`, `provisional`, `claimed` |
| **Practitioner observations** | Enter memory with structured provenance — `facilitator_id`, `source_id`, `provenance` JSONB — rather than becoming anonymous facts |
| **With-Me bridge** | Facilitator-approved synthesis candidates cross into longitudinal member memory with approval gate and idempotency |
| **Hierarchy of permission** | Governs the movement from observation → description → hypothesis → constitutional commitment |
| **Research observatory framing** | Positions the purpose as studying conditions of human orientation, not classifying people |
| **`crossing_allowed = FALSE`** | Constitutional constraint at the database level: practitioner observations may not be collapsed into member-confirmed truth without the member's own act |

Together, these are not coincidentally assembled features. They are the architecture of a field that keeps sources distinct while making them mutually available.

---

## The Validation Gate

RFI has been revived on firmer architectural ground. It has not yet been validated.

**Revival ≠ validation.**

The first empirical gate:

> *Does a practitioner observation from a real With-Me session later help MAIA support that member in a way the member recognizes as accurate, appropriately tentative, and genuinely useful?*

If yes — not once, but repeatedly — that is the first evidence that the field is not just an elegant design but a functioning one.

### The Four-Link Chain

Successful validation requires all four links to hold:

1. **Practitioner saw something real.** The observation was grounded in what actually happened in the session, not in what the practitioner expected or inferred.

2. **Memory preserved it with correct standing.** `epistemological_status = 'observed'`, `primary_register = 'witnessed'`, `crossing_allowed = false`. The chain from session → approved candidate → atom preserves the epistemic character of the observation.

3. **MAIA surfaced it with correct relevance and register.** At the right moment, in the `# PRACTITIONER OBSERVATIONS` block, with the framing: *"A practitioner observed…"* — never *"You are…"* before the member confirms it as their own truth.

4. **Member received it without feeling classified.** A technically accurate observation can fail relationally if it arrives as capture. The fourth link is not just comprehension — it is the member's experience of the field as one that accompanies rather than names them.

   The constitutional chain arriving intact looks like this:
   > *A practitioner observed X in a prior session.*
   > *I'd treat that as witnessed context, not a conclusion.*
   > *I'm not sure if it fits here — what would you say?*

   "Does that resonate?" invites agreement. "I'm not sure if it fits here — what would you say?" returns authority. The behavioral test distinguishes these.

All four must hold. If any breaks, the architecture is legible enough to identify which link failed. That legibility is not incidental — it is part of the design.

---

## Why Failure Must Be Informative

> *A system you can't fail informatively isn't a research instrument.*

Provenance, epistemic status, and member correction are not safeguards bolted onto the architecture. They are **what makes the field researchable**.

Without `epistemological_status`, you cannot distinguish a failed observation from a failed framing from a failed timing. Without provenance, you cannot trace which session produced which atom or which practitioner approved which candidate. Without the member correction mechanism, you cannot know whether an observation was recognized or rejected.

The safeguards are the measurement instruments. Remove them and you have a system that may or may not be doing what you think, but you cannot find out.

This is also the self-referential structure: the epistemic constitution requires that every important idea earn its standing through the process it governs. RFI is a claim about epistemic governance. By its own rules, it can only be known through observation. The validation sequence is not just a test of RFI — it is RFI applying its own constitution to itself.

---

## Current Status

**Cat 1 — Preserved direction, iteration 1 assembled, validation not begun.**

- Iteration 1 components: assembled and operational
- Iteration 2 (reciprocal field interactivity): not yet designed
- First empirical study: awaiting first live With-Me session completing with approved candidates, migration applied to production, and behavioral observation across the four-link chain
- Canon standing: not yet earned — must be earned through the process the constitution describes

The idea no longer depends on belief. It has reached the stage where it can earn its standing through observation, exactly the way the architecture says every important idea should.

---

*See also:*
- `docs/architecture/FROM_COLLECTIVE_INTELLIGENCE_TO_EPISTEMIC_GOVERNANCE.md` — the research instrument framing and epistemic constitution
- `docs/specs/COHERENCE_FIELD_WIRE_UP_SPEC_2026-05-24.md` — freeze conditions and lift gates for coherence field wiring
- `docs/canon/FIS_FIELD_STATE_PRIMITIVE.md` — the canonical field state primitive (Cat 2)
- `app/api/studio/with-me/sessions/[sessionId]/route.ts` — the governed bridge that constitutes the validation path
- `lib/maia/memoryAtomsLoader.ts` — `formatAtomsForPrompt`, which enforces the register distinction in MAIA's prompt
