# LAYERED ADMISSION
**Status:** Candidate constitutional pattern

**Date:** 2026-09-30

**Scope:** member-facing rollout, experimental capabilities, interpretive layers, relational AI entry, and bounded new behavior layered onto an established member habitat.

> **Preserve the universal human surface. Gate only the experimental interpretation, capability, or interaction layered on top of it.**

Layered Admission governs *where* an admission boundary should be drawn when a new capability enters an already-inhabited member world.

It does not create a general feature-flag system. It is a semantic rule for deciding whether a boundary is legitimate before choosing any mechanism.

---

## I. The distinction

A member-facing system may contain three different things that must not be collapsed:

1. **The member's habitat** — the room, material, work, history, or capability already legitimately theirs.
2. **A new system affordance** — an experimental instrument, crossing, interpretation, synthesis, or AI-mediated action offered inside that habitat.
3. **Admission to the affordance** — the governed decision about who may encounter or exercise the new layer while it is still being witnessed.

The admission boundary should normally surround **2**, not **1**.

> **Admission to an experiment must not silently become withdrawal of the member's existing world.**

## II. Why this exists

The pattern follows existing Soullab constitutional commitments:

- **The member's world is primary.** Member-facing architecture should inhabit the member's world rather than reorganize it around platform internals.
- **Presentation does not grant authority.** A UI layer, classification, or experiment does not acquire authority merely because it exists or can be rendered.
- **The member remains final authority on lived meaning.** New interpretive capability should arrive as invitation, not as a silent takeover of the underlying experience.
- **Rooms must remain inhabitable.** Experimental layering should not make an established room illegible, inaccessible, or semantically false for people outside the experiment.
- **Standing requires explicit admission.** Experimental participation is not inferred from mere availability, technical reachability, lab access, founder status, or client-side knowledge.

Layered Admission therefore asks a prior question before any flag, allowlist, or rollout mechanism is designed:

> **What human distinction does this boundary represent?**

If the answer is only “this component is easy to wrap,” the boundary is probably wrong.

---

## III. Eligibility test

Use Layered Admission only when all of the following are true.

### A. A legitimate base habitat already exists
The member can meaningfully inhabit the base experience without the new layer.

Examples:
- a Living Field dimension exists before MAIA joins it;
- Writer's Studio exists before a House-carried Work context arrives;
- a Living Field room exists before a new visual instrument appears inside it.

### B. The new layer is semantically separable
The experimental affordance can be withheld without falsifying or breaking the base habitat.

A merely technical separation is not enough. The member experience must still make sense.

### C. Withholding the layer preserves member rights and ownership
The boundary must not hide the member's own authored material, revoke an established capability, or make access to their work contingent on joining an experiment.

### D. Admission can fail closed
A missing, malformed, stale, or unavailable admission decision must leave the member in the legitimate base habitat rather than in an error state or accidental experimental state.

### E. The layer has a truthful rollback
Turning the layer off must restore the ordinary habitat without data migration, loss of member material, or semantic residue that falsely implies the experiment is still active.

If any of A–E fails, do not assume Layered Admission is the right pattern.

## IV. The heuristic

A proposed rollout boundary should be explainable in member-world language.

Good:
- “Your field is still yours; this new instrument is available to a small test circle.”
- “Writer's Studio remains available; this experimental House-to-Work arrival is cohort-limited.”
- “Opening your dimension shows your material; entering conversation with MAIA is a separate choice.”

Weak:
- “This branch is behind a flag.”
- “This component is beta.”
- “We gated the route because it was easiest.”
- “Only testers can reach the whole room,” when the room contains material that already belongs to every member.

A useful test is:

> **If all implementation names disappeared, could we still explain the boundary as a meaningful distinction in the member's lived experience?**

If not, the boundary is probably implementation-shaped rather than semantically shaped.

---

## V. Admission is not consent

Cohort admission and member consent are different authorities.

**Admission** answers:
> May this experimental affordance be presented to this member?

**Consent** answers:
> Has this member chosen the relational or consequential act now available to them?

A cohort member may be admitted to see an affordance without having consented to use it.

Therefore:

> **Admission may reveal a doorway. It may not count as walking through it.**

This distinction is especially important for AI-mediated interaction. Access to one's own material is not consent to begin an AI encounter about that material.

---

## VI. Admission is not entitlement

Admission to one experimental layer grants nothing adjacent to it.

- Living Field cohort membership does not imply founder authority.
- Lab access does not imply Living Field admission.
- Living Field admission does not imply House → Writer's Studio contextual arrival.
- H1 cohort admission does not imply access to unrelated experiments.
- A client-side indication cannot manufacture admission.

Each authority should remain narrow enough that its name still tells the truth about what it governs.

> **Shared members do not require shared authority.**

A small test circle may intentionally be listed in several independent cohort authorities, but the authorities remain distinct because the governed acts are distinct.

---

## VII. Anti-patterns

### 1. Whole-room gating for a local experiment
Do not retract an established room merely because one new element inside it is experimental.

### 2. Hidden semantic degradation
Do not remove the experimental layer if doing so leaves labels, navigation, or surrounding copy that imply it is still present.

### 3. Client-authored admission
URL parameters, local storage, React state, browser cookies, and presentation metadata may reflect a decision; they do not create it.

### 4. Shared-authority convenience
Do not reuse an unrelated founder, lab, beta, or practitioner gate merely because it already exists.

### 5. Rollback theater
A switch is not a rollback if turning it off leaves writes, state transitions, inaccessible member material, or irreversible consequences behind.

### 6. “Beta” as ontology
Experimental status is a property of the affordance's current standing, not a claim about the member, their work, or the room that contains it.

### 7. Automatic widening
Time passing, low complaint volume, or technical stability does not itself authorize a larger population.

---

## VIII. Evidence before widening

A layered admission should produce evidence about the layer it governs.

A widening decision should normally have:

1. **admitted-population witness** — the intended layer is actually visible and usable;
2. **excluded-population witness** — the base habitat remains coherent and the layer remains absent;
3. **client-manipulation witness** — obvious client-side attempts cannot manufacture admission;
4. **rollback witness** — closing the layer restores the ordinary habitat;
5. **ownership witness** — member-authored material remains reachable on both sides of the boundary;
6. **consent witness**, where relevant — admission does not silently perform the consequential act;
7. **failure witness** — loss of admission service or malformed configuration fails into the legitimate base state;
8. **explicit disposition of defects** found in the cohort.

“No one complained” is not evidence of semantic fit.

---

## IX. Current proving cases

### Living Field — early instrument
The existing Living Field remains available. `LivingFieldInstrument` is the experimental layer and is admitted separately. Non-cohort members retain the ordinary room and their material.

### House → Writer's Studio — H1 contextual arrival
Writer's Studio remains universal. The experimental layer is explicit Work-context arrival from the House and the Studio's honoring of that carried claim.

### Living Field → MAIA encounter
The dimension and its member-owned content open first. MAIA entry is a distinct member gesture. This is a consent boundary rather than a cohort boundary, but it demonstrates the same semantic discipline: preserve the base habitat; require a separate act for the new relational layer.

These cases do not imply that every future feature should be decomposed this way. They demonstrate the test.

---

## X. Relation to other canon

Layered Admission is subordinate to, and should be read with:

- `THE_MEMBERS_WORLD_IS_PRIMARY.md` — the interface inhabits the member's world;
- `REPRESENTATION_AUTHORITY_LAW.md` — presentation and computation do not confer authority;
- `INTERFACE_HUMILITY.md` — the member remains final authority on lived meaning;
- `INHABITABLE_ARCHITECTURE_STANDARD.md` — member-facing rooms must remain legible and inhabitable;
- `DECLARED_MEMBERSHIP_RATIFICATION_2026-09-16.md` — standing comes from explicit admission under a rule;
- `CONSTITUTIONAL_DIRECTION_OF_AUTHORITY.md` — higher layers may not manufacture authority over lower-layer reality.

This principle adds one narrower question:

> **When a new governed layer enters an existing member habitat, where should the admission membrane sit?**

Its answer is:

> **At the smallest semantically complete boundary that contains the experimental authority while preserving the member's legitimate underlying world.**

---

## XI. Standing

This document records the founder direction expressed on 2026-09-30:

> Use this approach elsewhere when it is semantically and heuristically useful.

That direction does **not** authorize mechanical propagation. Every application must still pass the eligibility test in §III.

**Semantic usefulness outranks architectural repetition.**
