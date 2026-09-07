# Epistemic Scope Transparency — CANDIDATE

**Status:** **CANDIDATE — drafted for founder ruling 2026-09-07. NOT RATIFIED.**
Nothing in this document governs anything yet. It authorizes no audit, no repair, and no claim.
**Type:** Candidate canon — a *constraint on disclosure*. It grants no capability and widens no access.
**Occasioned by:** the Studio Council truth-in-UI correction (`f3dbf11a`), recorded as **Specimen 01**.
**Sibling canon:** [Intelligence Field Access Map](./INTELLIGENCE_FIELD_ACCESS_MAP.md) · [Longitudinal Memory Category Gradient](./LONGITUDINAL_MEMORY_CATEGORY_GRADIENT.md) · [Interface Humility](./INTERFACE_HUMILITY.md) · [Right to Remain Unpossessed](./RIGHT_TO_REMAIN_UNPOSSESSED.md) · [MAIA Sovereignty Invariants](./MAIA_SOVEREIGNTY_INVARIANTS.md)

---

## Candidate core

> **Before a member invokes an intelligence-bearing function, the member must be able to
> know what sources that function is authorized to use for that invocation.**
>
> **Any declaration of epistemic scope must be true of the actual retrieval boundary.**

Two requirements, inseparable. Either alone is worthless: a scope no one can learn is not a
boundary, and a scope declared falsely is worse than none, because it converts a member's
reasonable caution into misplaced trust.

---

## 1 · What "epistemic scope" means

The **epistemic scope** of an act is the complete set of sources an intelligence is
*authorized to consult* in performing that act:

- records and objects (the current document, decision, change, session)
- memory of any category (conversational, episodic, semantic, atoms, patterns, anchors)
- prior acts by the same member, and prior rounds of the same object
- material authored by *other* people (practitioner notes, client inquiry, Circle material)
- fields, indexes, corpora, and static framing material
- tools, connectors, and external services it may call
- anything a sub-agent or downstream call may reach on its behalf

Scope is **authorization, not usage.** A source the function may consult but happened not to
use this time is inside scope. The boundary is what the code *can* reach for this act, not
what it did reach.

Scope is **per-invocation**, not per-product. The same surface may hold different scope for
different acts; the declaration attaches to the act the member is about to take.

**Distinction from the sibling instrument.** `INTELLIGENCE_FIELD_ACCESS_MAP` answers *what
does this intelligence access?* — a system-facing audit. This candidate answers a different
question: *can the member know it before they act, and is what they'd learn true?* The access
map can be perfectly accurate while this law is wholly unmet. Specimen 01 is exactly that case.

---

## 2 · When explicit disclosure is required

**This law is not "put privacy microcopy under every button."** Indiscriminate disclosure
produces clutter, and clutter produces blindness — a member who has learned to skip the small
grey text is less protected than one who never saw it. Disclosure spent where it is not owed
is disclosure unavailable where it is.

**Proposed governing rule — the divergence test:**

> **Disclosure is owed wherever the true scope and the member's reasonable default
> expectation diverge — in either direction.**

Divergence runs both ways, and the second direction is the one the Council incident exposed:

- **Over-reach divergence** — the function reaches *further* than the member would assume.
  Disclosure states what it reaches.
- **Under-reach divergence** — the function reaches *less* than the member would assume,
  because the surrounding environment (a companion that does remember, a platform that speaks
  of continuity) makes narrowness surprising. Disclosure states what it does *not* reach.

Where true scope and reasonable expectation coincide, **silence is honest** and disclosure is
clutter. This is the ordinary case and must stay the ordinary case.

Applied to the classes named in the act:

| Class | Default | Why |
|---|---|---|
| Scope obvious from the immediate object | **no disclosure** | expectation matches reality; a summarize-this-paragraph act reaching only that paragraph surprises no one |
| Scope extends beyond the visible object | **disclosure owed** | over-reach divergence — the member cannot see what was consulted |
| Scope involves memory or prior conversations | **disclosure owed** | over-reach; and memory is the category where mistaken assumption is most costly |
| Scope is narrow *inside a memory-bearing environment* | **disclosure owed** | under-reach divergence — Specimen 01 |
| Cross-person / collective context | **disclosure owed, both directions** | the member cannot reason about others' material from their own view |
| External connected sources | **disclosure owed** | leaving the sovereign boundary is never a reasonable default assumption |
| A member act that intentionally widens scope | **disclosure owed at the act, and consent required** | see §5 — this is authorization, not notice |

Open for ruling: whether the divergence test is the right governing rule, or whether reach
alone should trigger. Divergence is proposed because reach-alone would have found Specimen 01
compliant. See **D1**.

---

## 3 · Acceptance test (two parts, neither sufficient alone)

```
BEFORE INVOCATION   Can the member know the scope?
AT RUNTIME          Is the represented scope actually true of the retrieval path?
```

Part one without part two is a comforting fiction. Part two without part one is Specimen 01:
a boundary held perfectly and known to no one.

**Portable audit question, usable across products:**

> *Before the member invokes this intelligence, do they know what it is allowed to know for
> this act — and is that representation true?*

---

## 4 · The change law

> **A change in retrieval authority is a change in the member-facing epistemic contract.**

An implementation may not widen input scope while leaving an older declaration standing. The
declaration is part of the feature, not documentation of it. "The feature still works" is not
a defence: the feature the member consented to was the narrow one.

Corollary: a scope declaration must live where it breaks if the boundary moves — co-located
with the retrieval path, single-sourced, subject-true. A notice that can drift out of truth
silently is a latent false statement.

---

## 5 · Disclosure is not authorization

**Knowing that a surface *can* reach something is not consent that it *may* reach it for this
act.** Where existing canon requires consent — memory formation, Sanctuary Mode, cross-person
material — this law adds a requirement and removes none. Disclosure never discharges consent.

The failure this guards: shipping a scope-widening capability, adding an honest notice, and
treating the notice as the member's agreement. That is disclosure laundering consent.

---

## 6 · SPECIMEN 01 — Studio Council

Cited as the occasion of discovery. **The law is not defined in its terms.**

| | |
|---|---|
| **Prior state** | Decision and Change councils held true isolation: inputs bound to the object (`WHERE decision_id = $1` / `change_id = $1`), no conversational memory, atoms, or session loader anywhere in the path. |
| **Defect** | The member could not know that before invoking. A beta tester had to *ask* whether the Council read their MAIA conversations. Isolation held by implementation, declared nowhere. |
| **Divergence class** | **Under-reach.** The boundary was narrower than a member of a memory-bearing platform would assume. Reach-alone testing would have called this compliant. |
| **Repair** | A subject-true declaration at all ten invocation points, rendered before invocation, single-sourced and co-located with the retrieval boundary. Copy only; no input, schema, or memory change. |
| **What it demonstrates** | Correct behaviour is not sufficient. A boundary a member cannot see is not yet a boundary they can rely on. |

---

## 7 · Anti-patterns

1. **Ambient widening** — memory or a new source wired in without the contract changing.
2. **Stale declaration** — implementation moved, notice did not. A false statement to a member.
3. **Vague scope** — "uses your context", "personalized to you". Names no boundary; unfalsifiable.
4. **Post-hoc disclosure** — scope revealed after invocation. The member already acted.
5. **Disclosure as consent** — notice treated as authorization where authorization is required.
6. **Under-declaration** — declaring narrower scope than the retrieval path actually holds.
7. **Compliance by association** — one audited surface cited as evidence for unaudited ones.
8. **Disclosure clutter** — notices where expectation and reality already agree, degrading the notices that matter.

---

## 8 · Proposed verifier shape (proposal only — nothing built)

Should this be ratified with an enforcement obligation, the shape that fits existing practice:

- **Declaration co-located with the boundary.** Each intelligence-bearing endpoint exports its
  own scope declaration from the module that owns its retrieval, as `councilScope.ts` now does.
- **Static binding check.** Every invocation surface reaching an intelligence-bearing endpoint
  imports that endpoint's declaration — a surface with a hand-written notice, or none, fails.
- **Truth check — the hard half, and honestly unsolved.** Binding a declaration to a *retrieval
  path* is not statically decidable in general. The tractable approximation is a declared
  source-set per endpoint plus a review obligation on any diff that adds a data read inside a
  declared path. This is a review discipline with a tripwire, not a proof. It must not be
  described as verification. See **D5**.

---

## 9 · Applicability not yet established

**All non-Council intelligence surfaces remain UNAUDITED against this candidate law.** No audit
was performed in this act and none is authorized by it. That the principle generalizes is not a
claim that it has been applied anywhere else. Any statement of platform-wide compliance would
be false today.

A census of intelligence-bearing surfaces should not open until the law is ratified and its
applicability boundaries are explicit — auditing against a partly implicit principle produces
findings whose severity cannot be adjudicated.

---

## 10 · Genuine founder decisions

- **D1 · Governing trigger.** Adopt the divergence test (§2), or reach-alone? Reach-alone is
  simpler and cheaper to apply, but would have ruled Specimen 01 compliant.
- **D2 · Placement.** Standalone canon, or Invariant 17 in `MAIA_SOVEREIGNTY_INVARIANTS.md`?
  Invariant placement makes it a ship gate; standalone makes it a design law.
- **D3 · MAIA's own surfaces.** MAIA is *expected* to remember, so per-turn disclosure would be
  pure clutter. Is the standing instrument (Sanctuary Mode, consent gates, the anchor
  surface-preference model) already the discharge, or is a durable scope surface owed?
- **D4 · Strength of "able to know."** Availability-to-know is proposed. Does any class —
  memory, cross-person, external — instead require acknowledgment before invocation? That is a
  materially heavier obligation and should be chosen deliberately, not slid into.
- **D5 · Enforcement.** Canon-only, or a verifier obligation? §8's truth check is a review
  discipline, not a proof; ratifying it as "verification" would repeat the error this law names.
- **D6 · Whose knowing counts.** Specimen 01 spans both a member surface (`/maia` sheet) and a
  practitioner surface (`/studio`) operating over a *client's* material. When a practitioner
  invokes an intelligence over someone else's material, is the disclosure owed to the
  practitioner, the client, or both? This candidate does not answer it, and the answer likely
  reaches beyond disclosure into consent.

---

**STOP — founder ruling required. This document ratifies nothing.**
