# Correction 3 — Field Object Declaration (bounded implementation spec)

**Date**: 2026-08-02
**Authority**: Kelly (founder). Recorded by Claude.
**Occasioned by**: Phase 1 release walk, **W8 failure** —
`docs/releases/WRITERS_STUDIO_PHASE1_RELEASE_WALK_2026-08-02.md` (#887)
**Governed by**: `MEMBER_FIELD_AND_STUDIO_DIRECTIVE.md` **Amendment 5 — Field Object
Declaration** (#894) → `docs/architecture/FIELD_OBJECT_PROMOTION_RULING_2026-08-02.md` (#886)

⛔ **This document authorizes no implementation.** It records what a bounded implementation
must satisfy. The owning lane returns with the implementation *and its evidence*.

---

## The diagnosis

> **"Keep" currently means three different things, while the Workbench recognizes only one
> of them.**

The fix is **not** to make the Shelf read capsules or episodic memories. It is to create
**one explicit, governed declaration act** that turns a source artifact into an enduring
Field Object.

## The repaired member journey

```text
Conversation moment
        ↓
Mark moment / create capsule
        ↓
Review or develop it
        ↓
Explicit member act:
"Keep in my Field"
        ↓
Canonical Field Object
        ↓
Workbench Shelf
```

The capsule, the episodic memory, and the Field Object **remain separate records**.

---

## 1. One common declaration service

⛔ **Do not put atom-minting logic inside the capsule component or route.** Create a shared
domain function, conceptually:

```ts
declareFieldObject({
  memberId,
  sourceType,
  sourceId,
  title,
  content,
  metadata,
  idempotencyKey,
})
```

It must:

- verify the source belongs to the member;
- create **one** canonical `member_memory_atom`;
- stamp `generated_by = 'member-gesture'`;
- preserve `source_type` and `source_id`;
- **return the existing atom on retry**;
- **never** mutate or delete the source artifact;
- **never** change `return_preference` or privacy silently.

This becomes the **governed declaration capability** that any future source invokes.

## 2. An explicit "Keep in my Field" action

On the capsule review surface, once the capsule is **eligible**, show a distinct action:

> **Keep in my Field**

⛔ Do **not** reuse **Keep this moment** or **Keep as Draft** — those already mean different
things. A clearer set:

| Act | Label |
|---|---|
| Preserve a conversation event | **Mark this moment** |
| Save unfinished capsule work | **Save for later** |
| Create an enduring Field Object | **Keep in my Field** |

⭐ **The member must understand what will happen before pressing the button.**

## 3. Capsule review is eligibility, not declaration

```text
draft:false   = eligible to OFFER the declaration
button press  = the declaration
```

`draft = false` may allow the button to appear. It must **not** automatically create the
Field Object. If the capsule is later **reopened, the Field Object remains** — source
lifecycle and Field declaration are **independent histories**.

## 4. Idempotent at the database

Add a uniqueness guarantee equivalent to `member_id + source_type + source_id` for declared
Field Objects, or an equivalent partial unique constraint fitting the existing atom schema.

Two taps, retries, or two browser requests must produce:

```text
201 created
200 existing
same atom id
```

⛔ **The UI alone cannot guarantee this.**

## 5. The Shelf is unchanged

It continues reading **canonical Field Objects**. ⛔ It must not ingest
`reflection_capsules`, `episodic_memories`, source-native Ideas, or journal rows directly.

The new atom appears **because the member performed the act the Shelf already recognizes.**

---

## Acceptance test — fresh disposable member

Fixture baseline must be recorded **before** any mutation (`walk.878` is contaminated and
inadmissible — see the walk-fixture protocol).

1. Create a real conversation.
2. Mark or capture the moment.
3. Confirm **no Shelf item exists yet**.
4. Review/save the capsule.
5. Confirm **no atom was automatically minted**.
6. Press **Keep in my Field**.
7. Confirm **exactly one** atom exists, with correct source provenance.
8. **Double-submit**; confirm no duplicate.
9. Open `/maia/workbench`.
10. Confirm the new Field Object appears.
11. Place and remove its placement.
12. Confirm capsule and atom remain unchanged.
13. Reopen the capsule; confirm the atom remains valid.
14. Confirm **historical capsules were not converted**.

---

## The narrow implementation claim

> **A member can explicitly declare that a reviewed source artifact belongs in their
> enduring Field, creating one canonical, provenance-preserving Field Object that becomes
> available on the Workbench Shelf without converting or consuming the source.**

---

## Sequence this sits inside

1. Merge Amendment 5 (#894) once CI passes.
2. Review and merge #892 (corrections 1 and 2 — independent of this ontology).
3. Build correction 3 around the shared declaration service.
4. Create a new **baseline-recorded** fixture.
5. Run the complete Phase 1 walk again **from W1**.
6. Obtain founder acceptance.
7. Assemble a fresh release object against the exact candidate SHA.
8. Deploy through the **migration-capable** path only after explicit SHA authorization.

⛔ Until that full walk passes: **Phase 1 failed at W8. Founder acceptance unavailable.
Deployment unauthorized.**
