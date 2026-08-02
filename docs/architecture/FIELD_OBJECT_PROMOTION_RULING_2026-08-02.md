# Ruling — Capsule → Field Object promotion is an explicit member act

**Date**: 2026-08-02
**Authority**: Kelly (founder ruling)
**Recorded by**: Claude
**Occasion**: W8 failure of the Writer's Studio Phase 1 release walk
(`docs/releases/WRITERS_STUDIO_PHASE1_RELEASE_WALK_2026-08-02.md`)
**Governed by**: Member Field re-centering canon (#882) — *the Field is the platform root;
Studios only reference.* `Reference = durable · Placement = surface state.`
**Scope**: the **W8-specific application** of a general constitutional rule. See below.

---

## Relationship to canon — this applies, it does not compete

`MEMBER_FIELD_AND_STUDIO_DIRECTIVE.md` **Amendment 5 — Field Object Declaration** is the general
invariant across **all** sources:

> **A source does not create an enduring Field Object merely by producing or saving an artifact. A
> Field Object comes into being only through an explicit human declaration that something belongs in
> the person's enduring Field.**
>
> Source surfaces may host the declaration gesture, but all must invoke **one governed declaration
> capability.** Source lifecycle state may determine *when* the gesture is offered; **it does not
> itself constitute declaration.**

⭐⭐⭐ **Review makes a source eligible to be offered. Declaration makes a Field Object exist.**

**This document does not restate that ontology and must not diverge from it.** It governs the one
path that actually failed at W8 — conversation capsule → Workbench Shelf — as an *application* of
the invariant above. Where the two ever appear to differ, **the canon amendment governs.**

**Concretely, for capsules:** the persisted `reflection_capsules.draft = false` state (*"brought
into the Lab"*) is a legitimate **eligibility condition** for offering the gesture. ⛔ It is **not**
the declaration. Flipping `draft` must not mint an atom, and the capsule route must not invent its
own Field Object semantics — it passes capsule identity and provenance into the one governed
declaration capability.

⛔ **`draft` is therefore not part of the Field ontology.** The capsule's editing history and the
enduring declaration are **separate histories**: reopening a capsule must not delete, demote, or
rewrite a Field Object already declared from it, and no interface may imply that reopening retracts
the declaration.

---

## The ruling

⛔ **Do not make the Workbench ingest capsules directly.**
⛔ **Do not silently treat capsules as atoms.**

> The prominent Keep gesture must **create or explicitly mint the canonical Field Object**
> that the member's Field and Shelf use.

A capsule may remain the **review/refinement artifact** produced by the conversation flow.
At the end of that flow the member needs an **explicit act** — *"Keep in my Field"* /
*"Save as a Keep"* / *"Add to my Field."*

That act mints the canonical atom with **member-authored provenance**. The Shelf then keeps
reading **canonical Field Objects** rather than learning every upstream storage format.

**The conversion is not automatic. The member must choose it.**

---

## The preserved separation (ratified)

| Layer | What it is |
|---|---|
| **Capsule** | a developed conversational artifact |
| **Field Object / Keep atom** | an enduring member insight |
| **Shelf card** | a projection/reference of that Field Object |
| **Placement** | where the reference currently sits |

---

## Why this resolves the ontology question

`Field = medium · Work = object` **does not require every medium artifact to become a Field
Object.** The distinction:

- conversation, journal, notebook, capsule, and idea records may be **sources or
  developmental forms**;
- a **Field Object exists when the member performs the act** that says, in effect,
  *"this belongs in my enduring Field."*

⭐⭐⭐ **That act is the authority boundary.** It can occur from multiple source surfaces
without making those surfaces ontologically identical.

```text
conversation moment
      ↓
capsule / review
      ↓ explicit member act
canonical Keep atom
      ↓
search, contextual offering, project reference, Shelf
```

⛔ No silent promotion. ⛔ No duplicate ownership. ⛔ No backfill of unknown historical
material.

---

## The bounded correction slice

**Narrow claim:**

> Let a member turn a reviewed conversation Keep into an enduring Field Object through an
> explicit act, then find it on the Workbench Shelf.

**Acceptance criteria (pre-registered):**

1. "Keep this moment" still opens the existing capsule review flow.
2. Saving the capsule does **not** automatically mint an atom — **nor does marking it reviewed**
   (`draft = false`). Review only makes the gesture **eligible to be offered**.
3. The review surface offers an explicit **Keep in my Field** act, invoking the **one governed
   declaration capability** — not a capsule-local implementation of it.
4. That act creates **exactly one** `member_memory_atom` stamped `generated_by='member-gesture'`.
5. Retry or double-submit returns **the same atom** rather than minting duplicates.
6. The atom **preserves source provenance** back to the capsule/conversation.
7. The new Keep appears on `/maia/workbench`.
8. The capsule remains **intact and distinct**.
9. **No historical** capsule or atom is silently converted.
10. Removing a Shelf placement does **not** delete the atom or capsule.
11. **Reopening the capsule** (setting `draft` back to `true`) does **not** delete, demote, or
    rewrite the declared Field Object, and the interface does **not** imply that it retracts the
    declaration.
12. The **"Keep as draft"** affordance in `CaptureSpiritPanel` is renamed so the two acts are
    legible — *Save for later* / *Save capsule draft* versus **Keep in my Field**. ⭐ A member must
    never have to infer which kind of keeping occurred.

**Open seams to verify before implementation** (audit 2026-08-02, no coercion permitted): capsule
`user_id` is `TEXT` while the canonical authenticated member id and the atom ownership column may be
a different domain — ⛔ **do not create a direct FK by coercion.**

**Provenance uses the explicit discriminator `source_type='capsule'` with the capsule UUID as
`source_id`.** This value is distinct from the pre-existing `reflection` bridge stub and
unambiguously identifies `reflection_capsules` as the source domain:

| value | source domain |
|---|---|
| `capsule` | `reflection_capsules` |
| `reflection` | existing reserved bridge stub — **not** silently repurposed |

Uniqueness rule: **one member declaration per capsule**.

*(An earlier draft of this paragraph anticipated `source_type='reflection_capsule'` as a seam
to verify. It was superseded by the explicit ruling of 2026-08-02, which selected `capsule`:
`source_type` names the actual source object the member declared from, not the broader family
of experience it resembles. `reflection_capsule` would carry the table's implementation name
into the enduring Field vocabulary and imply that capsules and the `reflection` stub share one
namespace. Corrected here rather than left to contradict the migration and the type union —
no rows existed yet, which made this the cheap and truthful moment to align the record.)*

⚠️ **Drift, recorded not repaired:** `bringIntoLab()` (`lib/capsules/capsuleService.ts:381`) has zero
callers — the UI flips `draft` through the generic PATCH. ⛔ Do not repair or consolidate it inside
this slice unless the implementation genuinely needs it. **The declaration capability must not be
built on dead code merely because its name is convenient.**

---

## The other two corrections — independent of this ruling

They do **not** need the ontology ruling and proceed on their own:

- **WriterField click-to-focus** — a narrow member-facing defect.
- **Continue Writing identity routing** — use the known manuscript ID rather than
  positional selection.

⭐ **Separate PRs, or clearly separate commits** — each has its own acceptance and its own
revert shape.

---

## Release state (unchanged by this ruling)

> **FAILED at W8. Founder acceptance unavailable. Deployment unauthorized.**

⛔ **This ruling authorizes no implementation.** The sequence below states the order corrections must
take if and when they are separately authorized; authorization is a distinct founder act.

**Implementation sequence:**

1. Fix real click-to-focus.
2. Fix return-by-identity.
3. Build explicit capsule → Field Keep promotion.
4. **Repeat the release walk from W1** — not resume at W8 — because the assembled release
   object will have changed.
