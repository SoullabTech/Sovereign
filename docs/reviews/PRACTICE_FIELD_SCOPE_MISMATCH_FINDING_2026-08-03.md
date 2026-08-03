# Architectural Finding — Practice Field scope mismatch

**Class:** architectural finding, not an incident artifact.
**Status:** recorded. Authorizes no construction.
**Date:** 2026-08-03

---

## The finding

> **The system had a relationship-scoped container for identity, but the corpus content was never
> scoped to that same boundary. The conceptual model and the persistence model diverged — and that
> divergence is what made the incident possible.**

This is recorded separately from the incident because fixing the incident does not fix this. The
composition gate (`c327dd526`) closes the corpus channel; it does not reconcile the scope models.

### Observed

- `practice_field_snapshots` is **per-`relationship_space`** — a frozen copy with `field_status` and
  `snapshotted_at`. This is the relationship-scoped container.
- Snapshots carry the **identity fields** but **not** `active_field_content`.
- Therefore corpus material was **never space-scoped**. It composed **globally per slug**.

The likely reason is chronological — snapshots predate the corpus column. That explains the
divergence; it does not reduce it. A container that scopes some of a field's composable material and
silently omits the rest is not a partial boundary. **It is a boundary that reports success while the
uncovered material travels freely.**

---

## Two composition surfaces, two different failure classes

The gate addresses one of these. It structurally cannot address the other.

### Corpus authority failure — addressed

```text
unratified source material → composition pathway → system presents it with authority
```

Control: `corpusIsComposable()` → `return false`. Fail-closed around meaning.

### Translation fidelity failure — NOT addressed, and not addressable by a gate

```text
legitimate identity surface → representation of the practitioner's framework
                            → representation is inaccurate
```

Live instance: `practice_fields.about_practice` (512 chars) states *"five practice domains:
attention, relationships, meaning, contribution, presence"* — **invents "attention"**, **drops
Time Affluence and Health and Energy**. `practiceFieldService.ts:270` pushes `about_practice`
**unconditionally** into every slug-resolved room. Not covered by `corpusIsComposable()`, which
gates `active_field_content` only.

### ⛔⛔ The repair that must NOT be made

**Do not correct the five-domain list ourselves.** Replacing an inaccurate interpretation with a
more appealing interpretation is still interpretation without source authority — the same failure at
smaller scale. The only valid path:

```text
Larry's original language → validated representation → identity surface
```

Engineering judgment is not an authority for this field. **Hold it open.**

---

## ⭐⭐ Consequence: permission and accuracy are independent dimensions

The current model conflates *may this compose* with *is this faithful*. They are orthogonal, and a
field may be legitimately composable while still requiring provenance caution.

| Dimension | Values |
|---|---|
| Composition permission | `allowed` · `blocked` |
| Representation status | `source-authored` · `practitioner-approved` · `translated` · `candidate` · `unresolved` |

⛔ Recorded as a **finding**, not a design. The vocabulary must be validated against what a
practitioner actually distinguishes, not authored ahead of that conversation.

---

## 🔴 Correction: "slug-unreachable" is not "unreachable"

The residual 63,861-char copy on a NULL-`field_slug` row was described as slug-unreachable. True,
but **not the reason it is safe.** `practice_fields` has three lookup paths:

```sql
WHERE field_slug = $1              -- cannot reach a NULL-slug row
WHERE practitioner_member_id = $1  -- getAuthoredField: CAN reach it
WHERE id = $1                      -- CAN reach it
```

`getAuthoredField(memberId)` resolves a practitioner's field **without** consulting the slug, and
feeds `buildPracticeFieldContext`. **A NULL slug removes one path, not all paths.**

What actually makes the residue non-exposing is **environment**: the copy is in the local dev
database, not production. Production's `now-what-demo` row is zeroed with `status_reason` recorded.

⚠️ Two consequences:
1. It belongs in the **evidence inventory and the dev-DB contamination register** — not in incident
   containment scope.
2. ⛔ **Do not generalise "NULL slug ⇒ cannot compose."** That inference is unsound and would be
   wrong the moment such a row exists in production.

⚠️ The shared dev database already caused one false measurement in this incident: a parallel session
found this copy post-containment and read it as the whole story.

---

## What this finding does NOT do

- Does not authorize a snapshot-model change.
- Does not authorize a representation-status schema.
- Does not resolve `about_practice` — that is Larry's language, not ours.
- Does not close the incident. The gate remains **branch-only**; production still runs pre-gate code.

## Closure criterion (amended)

> **The system must both enforce the authority boundary and preserve fidelity of the material that
> remains inside permitted channels.**

The gate proves the first. **Only Larry's confirmation is a valid authority for the second.**
