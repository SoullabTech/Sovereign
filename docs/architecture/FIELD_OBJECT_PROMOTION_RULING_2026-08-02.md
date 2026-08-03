# Ruling — Capsule → Field Object promotion is an explicit member act

**Date**: 2026-08-02
**Authority**: Kelly (founder ruling)
**Recorded by**: Claude
**Occasion**: W8 failure of the Writer's Studio Phase 1 release walk
(`docs/releases/WRITERS_STUDIO_PHASE1_RELEASE_WALK_2026-08-02.md`)
**Governed by**: Member Field re-centering canon (#882) — *the Field is the platform root;
Studios only reference.* `Reference = durable · Placement = surface state.`

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
2. Saving the capsule does **not** automatically mint an atom.
3. The review surface offers an explicit **Keep in my Field** act.
4. That act creates **exactly one** `member_memory_atom` stamped `generated_by='member-gesture'`.
5. Retry or double-submit returns **the same atom** rather than minting duplicates.
6. The atom **preserves source provenance** back to the capsule/conversation.
7. The new Keep appears on `/maia/workbench`.
8. The capsule remains **intact and distinct**.
9. **No historical** capsule or atom is silently converted.
10. Removing a Shelf placement does **not** delete the atom or capsule.

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

**Implementation sequence:**

1. Fix real click-to-focus.
2. Fix return-by-identity.
3. Build explicit capsule → Field Keep promotion.
4. **Repeat the release walk from W1** — not resume at W8 — because the assembled release
   object will have changed.
