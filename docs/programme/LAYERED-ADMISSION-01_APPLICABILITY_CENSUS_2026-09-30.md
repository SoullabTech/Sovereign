# LAYERED-ADMISSION-01 — Applicability Census
**Date:** 2026-09-30
**Base:** `008963af1`
**Standing:** read-only architectural census; no runtime change authorized

This census tests the candidate `docs/canon/LAYERED_ADMISSION.md` against existing gates. Its purpose is to prevent the new pattern from becoming a reflex.

> **Question:** is there a legitimate member habitat that should remain intact while a semantically separable experimental layer is admitted independently?

A technical flag alone is not evidence that Layered Admission applies.

---

## 1. Strong semantic fits

### Writer's Studio — Editorial capability

**Finding: strong fit.**

The Writer's Studio Canvas already states the separation explicitly: the server reads `WRITERS_STUDIO_EDITORIAL_ENABLED` once for presentation, while editorial routes independently re-read the server flag for authorization. The comment names the boolean as **presentation state, not authorization**.

The base habitat is the Writer's Studio and manuscript. Editorial capability is additive. Turning editorial off need not remove the member's manuscript or Studio.

**Layered-Admission implication:** if Editorial needs a bounded cohort rather than a global deployment flag, admit the editorial layer, not Writer's Studio itself.

⛔ This census does not authorize a cohort conversion.

### Writer's Studio — Review Discuss

**Finding: strong fit.**

Review remains a complete read-only review surface without Review Discuss. The route page passes `WRITERS_STUDIO_REVIEW_DISCUSS_ENABLED` as a presentation capability, and the Review Discuss API independently refuses when the server flag is off.

The member-facing action is explicitly relational: **Discuss with MAIA**. This is a layer over an already-valid Review experience.

**Layered-Admission implication:** Review should remain universal wherever already admitted; experimental Review Discuss can be admitted separately. Member gesture still governs starting a discussion.

### Writer's Studio — Develop standing

**Finding: semantic fit, but currently a containment case rather than a rollout invitation.**

The Develop source states that the standing controls are optional and that the server route is the real write barrier. It also states that Develop is currently outside the beta tester surface and warns against accumulating further unwitnessed standing acts.

The base habitat is Develop/readings; the standing act is a separable member judgment layer.

**Layered-Admission implication:** if standing later enters a test population, preserve Develop and gate the standing act. Do **not** treat this principle as permission to widen standing now.
## 2. Conditional fits

### Chat — memory-reference citations

**Finding: semantically separable, but the current mechanism is not a cohort authority.**

`ChatMessage` renders citations only when `NEXT_PUBLIC_MEMORY_REFERENCES_ENABLED === 'true'`. Conversation remains usable without the citation presentation, so the visual layer is separable.

But `NEXT_PUBLIC_*` is client-visible presentation configuration. It is not sufficient authority for member-specific admission.

**Layered-Admission implication:** if citations are ever tested with a bounded cohort, preserve ordinary conversation and admit the reference-display/data capability through a server-authoritative boundary. If the flag remains only a global presentation release switch, no cohort mechanism is implied.

### Ideas — Decision/Change recognition after Ask MAIA

**Finding: strong semantic shape, with an existing unresolved safety limitation.**

The Ask MAIA route generates and persists the ordinary MAIA reflection first. Decision/Change recognition runs **after** that response and does not steer MAIA's voice. It already requires both a global server toggle and an explicit member-id allowlist.

That is nearly the Layered Admission shape: base reflection remains; recognition metadata/invitation is the admitted layer.

However, the route explicitly records that Sanctuary mode is not yet wired and currently returns `false` from the placeholder.

**Layered-Admission implication:** keep recognition separate from the underlying Ideas reflection. Do not infer broader readiness from the good layering; the Sanctuary limitation still has its own standing.

---

## 3. Cases where Layered Admission should NOT be imported mechanically

### Now What / room composition — MAIA presence context

**Finding: not a simple presentation-layer admission.**

`NOW_WHAT_MAIA_PRESENCE_ENABLED` changes prompt composition: when enabled, additional memory/presence context enters MAIA's system prompt. The same composition code explicitly distinguishes that optional presence from the constitutional floor, which may never be flag-removable.

This is an invisible cognition/context boundary, not merely a new member-visible affordance inside an unchanged habitat.

**Disposition:** Layered Admission alone is insufficient. Any cohort use needs its own disclosure, memory-authority, consent, and epistemic analysis. Do not convert this into “hide/show a component” merely because a flag exists.

### RLM access

**Finding: not a member-habitat problem.**

`lib/rlm/access.ts` gates an internal/dev capability using production enablement plus a key. There is no underlying member-facing habitat whose rights or authored material would be withdrawn.

**Disposition:** keep the infrastructure/access-control model. Layered Admission adds no useful semantics here.

### Research self-awareness UI

**Finding: whole-surface gating is coherent.**

`/research/self-awareness` is itself the experimental research surface; when `RESEARCH_UI_ENABLED` is off, the route returns `notFound()`. There is no established member room at that same route whose material must remain available underneath it.

**Disposition:** whole-route gating can be the correct semantic boundary. Layered Admission does not require decomposition when the entire surface is the experiment.
## 4. Heuristic outcome

The census supports four distinct answers, not one:

| Existing surface | Layered Admission standing |
|---|---|
| Writer's Studio Editorial | **Strong fit** if cohort rollout is needed |
| Review Discuss | **Strong fit** |
| Develop standing | **Strong semantic fit; do not widen yet** |
| Memory-reference citations | **Conditional fit; current client flag is not cohort authority** |
| Ideas recognition | **Strong shape; separate Sanctuary limitation remains** |
| Now What presence context | **Not sufficient — cognition/disclosure authority required** |
| RLM | **Not applicable** |
| Research self-awareness page | **Not applicable; whole surface is experimental** |

The useful conclusion is therefore not “gate smaller things.”

It is:

> **Choose the smallest boundary that remains semantically whole.**

Sometimes that is one affordance inside a room. Sometimes the whole route is the experiment. Sometimes the change is invisible cognition and the relevant law is consent/disclosure rather than rollout presentation.

## 5. No implementation act follows automatically

This census authorizes no refactor, no new flag, no cohort, no widening, and no migration of existing flags.

Any future lane that invokes Layered Admission must name:

1. the base habitat being preserved;
2. the new layer being admitted;
3. why the layer is semantically separable;
4. what authority admits it;
5. what member act, if any, is still required after admission;
6. the fail-closed state;
7. the rollback;
8. the admitted and excluded population witnesses.

If those cannot be named cleanly, the pattern is not yet justified.
