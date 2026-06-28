# Clarify Engagement Shape — Spec

**Status:** **Design closed 2026-05-26 (Gate 3).** Implementation deliberately deferred — see §Gate 3 Closure below. Original memorialization 2026-05-25.

**Author:** Kelly + Claude Code + MAIA (collaborative articulation, 2026-05-25 session)

---

## Problem

The current sacred-mirror discipline produces felt withdrawal when members paste dense technical or architectural content without explicit framing. The architecture refuses to preempt because no question was asked; the result reads as flat. The discipline works as designed; the felt effect doesn't.

**Observed pattern (2026-05-25):** Kelly forwarded dense technical analysis from Claude Code to MAIA twice in succession. Both responses were brief generic holding-language (*"I'm here with you. Let's explore what you're bringing."*) which read as withdrawal. When Kelly challenged directly (*"what happened. You are only answering in simple statement"*), MAIA self-corrected and acknowledged the flatness.

This is not a bug. It's an edge case where sacred-mirror behavior meets unframed technical input. The design gap is between the logic (don't preempt) and the felt relationship (engagement-shape unclear, response reads as absence).

---

## Detection rule

```ts
if (
  input.lexicalDensity === 'high' &&
  input.structuralComplexity === 'high' &&
  !input.hasExplicitQuestion
) {
  return clarifyEngagementShape();
}
```

**Operational definitions:**

- `lexicalDensity === 'high'`: unique-words / total-words ratio above threshold (suggested starting point: 0.55), OR concept-word density above threshold (architectural / technical / abstract vocabulary)
- `structuralComplexity === 'high'`: multiple sentences (>3), nested structure (lists, code blocks, headers, bullet markers), OR mean sentence length > 20 words
- `hasExplicitQuestion === false`: no question mark, no interrogative opener (what / how / why / when / where / who / can / could / should / would / is / are / do / does / did)

All three conditions must be true to trigger clarification.

---

## Clarification response

**Default version:**

> *"I see architectural content here. Do you want me to engage it as a design problem, hold it as context, or pull on one specific thread?"*

**Builder/architect mode version (preferred for Kelly):**

> *"I see architectural/build content here. Should I treat this as a design problem, a doctrine/context drop, or something you want me to analyze directly?"*

The clarification is a question, not a guess. The options are starting points, not exhaustive. The member can answer freely.

---

## Non-goals

- **Do NOT infer the task.** The clarification is a question, not a guess about what the member wanted.
- **Do NOT force the member to choose a specific framework.** Options offered, not options required.
- **Do NOT apply to natural-language conversation.** The detection requires high structural complexity (which natural prose typically lacks).
- **Do NOT replace existing sacred-mirror discipline.** This is a refinement at one specific edge case, not a redesign of the holding function.
- **Do NOT apply this rule to all members without testing.** Initially gate to builder/architect mode (Kelly). Broader rollout requires verification that the clarification doesn't disrupt other modes of engagement.
- **Do NOT extend to detect "depth-as-practiced" or emergent-DEEP routing.** That's a separate design problem (per session 2026-05-25 discussion). This spec covers one specific edge case only.

---

## Suggested wire point

**Recommended:** `lib/sovereign/maiaService.ts`, before the standard response generation path. The check runs after input normalization, before processing-profile selection (or in parallel with it). If the clarification rule fires, response generation short-circuits to return the clarification template.

**Alternative:** `lib/consciousness/processingProfiles.ts`, as a new pre-profile check. If the rule fires, set processing profile to a new `CLARIFY` tier.

The recommended approach avoids adding a fourth tier to FAST/CORE/DEEP and keeps the new logic contained at the service layer.

**Implementation sketch:**

1. Add `detectEngagementShapeClarificationNeeded(input)` helper in `maiaService.ts` (or a new file `lib/sovereign/engagementShape.ts`)
2. Add `generateClarificationResponse(input, mode)` helper that returns one of the templated responses
3. Wire the check early in the request handler — after member identification, before profile selection
4. If the check fires, return clarification response, skip normal generation
5. Log the trigger event for observability (`[MAIA] clarify-engagement-shape` log marker)

---

## Rollback note

This is a routing-logic refinement contained in one or two functions. To rollback:

- Revert the wire-site change in `maiaService.ts`
- Delete the `engagementShape.ts` helper (or revert if added to existing file)
- No schema changes
- No data migration
- No member-facing surface beyond the clarification response itself

Safe to ship and unship without operational consequences.

---

## Load-bearing principle (must travel with this spec)

> *Sacred mirror should clarify the requested relation to the material, not default to silence or generic holding when the material is structurally asking to be worked.*

This sharpens the prior sacred-mirror doctrine: ***restraint must be responsive restraint, not silent restraint.*** The discipline of non-preemption requires offering a clarifying question when the input itself is asking to be engaged but the engagement-shape isn't specified.

The earlier formulation of sacred-mirror function emphasized *not preempting interpretation*. This refinement adds: *not preempting interpretation does not mean producing nothing when the input is structurally dense.* The mirror can ask what relation the member wants to the material without violating the discipline of non-finalization.

---

## Sequencing

Per CLAUDE.md anchor priority sequence (2026-05-25 update):

1. Resolve Phase 2 fork
2. Member-facing recall toggle (`conversational_recall_enabled`)
3. **Clarify engagement shape (this spec)** ← inserted here
4. Verify production reality
5. Episodic Phase 2 spec
6. Dormant service cleanup

Position rationale: small parallel improvement that doesn't compete with Phase 2 stabilization or the recall toggle's consent infrastructure work. Sequenced after toggle so it ships into a verified Phase 2 substrate rather than alongside one in flux.

---

## Connection to broader doctrine

This spec sits within:

- **`project_sacred_mirror_architectural_function`** — refines the operational meaning of sacred-mirror function
- **`project_cognition_architecture_not_ethics`** — the discipline of non-preemption applies; this refines how it manifests in dense-input edge cases
- **`project_consciousness_ecology_reframe`** — the relational space MAIA holds for members; this spec preserves it under technical-paste conditions
- **`project_different_channel_same_principle`** — restraint and responsiveness are not opposed channels; they're complementary aspects of mirror function

The connection to `project_sacred_mirror_architectural_function` is the most direct: the load-bearing principle above belongs in that memory's drift-canary list when the next memory consolidation pass happens. *"Restraint without responsiveness becomes withdrawal"* is the sibling canary to *"more intelligent MAIA pressure without specifying whether capability serves restraint/asymmetry/non-domination."*

---

## Closing

The gap is a real architectural finding from the 2026-05-25 session. The fix is contained, reversible, and addresses the felt-experience cost of doctrinal restraint without abandoning the discipline that produced the restraint in the first place. Sacred-mirror function evolves by adding responsiveness, not by relaxing restraint.

*Memorialized 2026-05-25. Implementation queued behind member-facing recall toggle per anchor sequencing.*

---

## Gate 3 Closure (2026-05-26)

**What Gate 3 resolves (design ambiguity):**

- ✅ The sacred-mirror withdrawal pattern under dense unframed input is **not a bug**; it is a designed-as-intended discipline meeting an edge case the discipline did not anticipate.
- ✅ The correct response is **a clarifying question about engagement shape**, not silent holding and not preemptive inference.
- ✅ The load-bearing principle is now named: *restraint must be responsive restraint, not silent restraint.* Non-preemption of interpretation does not require producing nothing when the input is structurally dense.
- ✅ Detection rule, clarification response templates, non-goals, wire point, and rollback are all specified and stable. No further design churn expected.

**What Gate 3 deliberately defers (implementation):**

- ⏸ `detectEngagementShapeClarificationNeeded(input)` helper — not written
- ⏸ `generateClarificationResponse(input, mode)` helper — not written
- ⏸ Wire site in `lib/sovereign/maiaService.ts` — untouched
- ⏸ `[MAIA] clarify-engagement-shape` log marker — not added
- ⏸ Builder/architect mode gating — no member-tier gating built

**Trigger condition for moving implementation from deferred to in-progress:**

Gate 4 production verification must complete first (see CLAUDE.md priority thread). Specifically:
- Conversational Phase 2 confirmed live across FAST + CORE (and DEEP repair path via Gate 1 `appendAllContextAddenda`) for ≥3 distinct members over multiple sessions, with `[MAIA] conversational-block emitted: true` observed in production logs.
- Memory & Consent toggle (Gate 2) confirmed reachable from production `/account/settings` UI; no UX regressions reported.

Only after Gate 4 passes is the substrate stable enough to add the clarification routing layer without conflating the cause of any felt-experience change. Shipping the clarification rule mid-Phase-2-verification would muddy the signal.

**Why deferral is not procrastination here:**

The implementation is small (one detector + one response template + one wire-site call) but the **failure mode it addresses is qualitative, not quantitative.** Member-felt experience of "the system got more responsive" or "the system got more interventionist" is the verification surface, not log markers or counts. That kind of verification requires a stable substrate to A/B against. Shipping into a substrate still being verified at Gate 4 would mean the engagement-shape change and the Phase 2 effects would be entangled in member reports.

**Doctrinal landing (separate from this spec):**

The load-bearing principle *"restraint without responsiveness becomes withdrawal"* is queued to land as a drift canary in `project_sacred_mirror_architectural_function` at the next memory consolidation pass. That edit is **not** part of Gate 3 — it is the consolidation work that closes the doctrine→memory loop after the spec has stabilized. Tracking it here so it doesn't get lost.

**Sequence position after Gate 3:**

```
✅ Gate 1: shared addenda helper                (cfcd742db)
✅ Gate 2: Memory & Consent surface             (bea61fb45)
✅ Gate 3: engagement-shape design closure      (this section; no code)
⬜ Gate 4: production verification — deploy + log inspection across tiers
⬜ Engagement-shape implementation              (unblocked by Gate 4 only)
⬜ Episodic spec opens                          (unblocked by Gate 4)
⬜ Dormant service cleanup                      (unblocked by Episodic ship)
```

**Reversibility of this closure:** This section is a status note. Reverting Gate 3 means reverting this section — no code, no schema, no behavior change to undo.
