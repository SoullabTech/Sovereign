# One MAIA, Many Embodiments

**Status:** **RATIFIED CANON** — Phase 7 adjudication of `MAIA-WHOLE-INTELLIGENCE-CONVERGENCE-01`
**Ratified:** 2026-08-31 (founder ruling)
**Evidence base:** `docs/architecture/MAIA_INTELLIGENCE_FIELD_CENSUS_01_2026-08-31.md` · `docs/architecture/MAIA_INTELLIGENCE_AUTHORITY_AND_EMBODIMENT_2026-08-31.md`
**Generalizes:** `MAIA_CONVERSATIONAL_INTELLIGENCE_NON_DEGRADATION.md` (voice → whole platform)

---

## The ruling

> **MAIA has one canonical cognition and composition authority.**
>
> Surfaces may provide explicit embodiment, task, persona, latency, and permission contracts around that cognition.
>
> **Any divergence in memory eligibility, relational intelligence, authority hierarchy, consent, provenance, or composition requires an explicit architectural ruling. It may not emerge accidentally from endpoint-specific prompt assembly.**

### The governing distinction

> A surface may change MAIA's **embodiment, task, role, latency, or permissions.**
> It may not silently instantiate a **different intelligence.**

This resolves the census ambiguity without forcing every endpoint to become identical. The defect was never *divergence*. The defect is **undeclared divergence in the intelligence that decides who MAIA is and what she knows in this moment.**

---

## Surface adjudications

| Surface / divergence | Ruling |
|---|---|
| `/api/between/chat` | **Canonical MAIA cognition surface. Must converge.** |
| `/api/voice/stream-conversation` | **Same MAIA cognition. Must converge with `between/chat`.** Voice is transport + lifecycle + latency, not a second mind. |
| PWA / Desktop / iOS | **Embodiments only.** No cognition fork by device. Census confirms this axis is already clean — preserve it. |
| `/api/portal/[slug]/chat` | **Legitimate role specialization, not an independent mind.** Inherits canonical cognition, then applies an explicit bounded portal/persona contract. |
| `/api/journal/reflect` | **Legitimate task specialization, not an independent mind.** Same canonical intelligence with an explicit reflective-task constraint. |
| `/api/now-what/interview` | Task specialization. Already calls `getMaiaResponse`; its own `systemPrompt` composition becomes an explicit task contract. |
| `/api/maia/relational-navigation` | Task specialization. Same treatment. |
| `/api/oracle/conversation` | **Retire or converge.** No live surface may point at it undeclared (finding D13). |
| FAST / CORE / DEEP tiers | **Inference/budget variation only.** Tier may change depth, model, latency, or reasoning budget. It **may not** silently change MAIA's memory, relational field, consent, or authority model. |

---

## Corollary 1 — the tier inversion is architecturally incorrect

Not merely odd behavior. **Architecturally incorrect.**

When FAST receives developmental memory and deeper cognition loses it because five addenda happen not to appear in a shared array, then **tier is accidentally functioning as identity.** Nothing in the conceptual model authorizes that.

**And the repair is not to copy the five missing addenda into another array.** That would make the symptom disappear while preserving the architecture that produced it — and would guarantee the sixth addendum drifts next.

Findings D7 and D8 are therefore **re-scoped**: they are not wiring defects to be patched. They are **symptoms of D6 (no Conductor)** and are closed only by the Phase 8 architecture.

## Corollary 2 — some divergence is sovereignty

The ruling is explicitly **not** "everything must converge."

Sanctuary being correctly gated (census D19, verdict `CORRECT`) is the evidence for why. Sanctuary is divergence, and it is the most important behavior in the system.

```text
divergence that is SOVEREIGNTY   → protect  (Sanctuary, consent gates, member opt-outs)
divergence that is TASK          → declare  (journal reflection, now-what interview)
divergence that is EMBODIMENT    → declare  (voice latency, mobile constraints, portal persona)
divergence that is ACCRETION     → converge (between/chat, voice cognition, tier inversion)
```

A convergence program that flattened the first row would destroy the thing it was run to protect.

## Corollary 3 — `USED` is architecture, not telemetry

The census finding that `ConversationMemoryUsesStore` records retrieval rather than use is **consequential, not cosmetic.** The canonical participation chain:

```text
AVAILABLE
   ↓
RETRIEVED
   ↓
OFFERED TO CONDUCTOR
   ↓
SELECTED / WITHHELD          ← the Conductor's decision, recorded
   ↓
USED IN COGNITION
   ↓
SURFACED IN RESPONSE          ← NOT required for USED
```

**A memory can be used without being spoken.** It may shape restraint, interpretation, tone, or what MAIA deliberately does not ask. Conversely, retrieval does not prove use.

After convergence, *"memory is working"* no longer means *a candidate came back from the database.* It means **the composition system has evidence that the source materially participated in the turn** — including participation expressed as withholding.

This is also where the authority hierarchy gets encoded. The loaders enforce it today; the final prompt assembly loses it (finding A2). The Conductor's selection record is the place it survives.

---

## The canonical architecture

```text
                    MEMBER / MOMENT
                           │
                           ▼
                  MAIA COGNITION INPUT
                           │
         ┌─────────────────┼─────────────────┐
         │                 │                 │
      memory           relationship       symbolic /
      evidence          field             developmental
         │                 │                 │
         └─────────────────┼─────────────────┘
                           ▼
                      CONDUCTOR
                  authority + consent
                 relevance + restraint
                  conflict + salience
                           │
                           ▼
                  COMPOSITION PLAN
                what participates now
                 what remains withheld
                           │
                           ▼
                   COGNITION / MODEL
                           │
                           ▼
                embodiment / task adapter
              ┌────────────┼─────────────┐
             text         voice        journal
           between      streaming      reflect
```

**The architectural move is not centralizing strings. It is centralizing the decision about what is allowed to participate in this turn.**

The Conductor receives **structured capability/evidence objects**, not peer prompt fragments. Each source carries enough metadata for the decision to be made at all:

```text
authority        where it sits in the constitutional hierarchy
consent          eligibility state and the gesture that granted it
provenance       member-authored vs system-inferred, and by which writer
relevance        to this moment
confidence       and its decay
recency
relational appropriateness
member-declared significance   (outranks system inference — always)
```

The downstream prompt then becomes **a result of composition**, rather than composition being whatever happened to be concatenated.

---

## The conformance test

Feed the same member moment into text and voice with equivalent permissions. Prove the **composition plan** is equivalent *before* transport-specific behavior begins.

This is a materially stronger test than comparing prompt strings, and it is what Phase 9 (cross-medium witnessing) verifies.

**Architectural test, restated:** remove the UI label. Can you still tell which "MAIA" answered, from the intelligence that was available to her? If yes, forks remain.
