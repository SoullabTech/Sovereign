# Practitioner Stewardship Loop — Implementation Plan

**Date:** 2026-08-05 · **Status:** IMPLEMENTATION PLAN (founder-directed promotion from candidate)
**Origin:** the `/now-what/admin` candidate surface (snapshot `95cfae2e8`, never merged) +
founder build directive 2026-08-05: *"Not a dashboard. Build the minimum useful steward loop."*
**Constraint system (settled, not restated here):** provenance constitution
(`docs/specs/PRACTITIONER_WISDOM_FIELD_PRODUCT_DEFINITION_v0.md`), authority schema
(`docs/governance/PRACTITIONER_FIELD_AUTHORITY_SCHEMA.md`), corpus gate (`corpusIsComposable`),
CF-D5a/b/c vocabulary rulings.

## The loop

```
Create field → Shape field → See what members encounter → Refine field
```

One loop, three surfaces. Everything below either serves this loop or is out.

## What already exists (build on, don't duplicate)

| Capability | Substrate | State |
|---|---|---|
| Field identity layers (about_practice etc.) | `practice_fields` + `PUT /api/practitioner/practice-field` | deployed |
| Append-only revision history | `practice_field_revisions` (+ immutability trigger) | deployed |
| Corpus composition gate | `corpusIsComposable()` — false until ratified+validated sources exist | deployed |
| Member rooms composing the field | `roomComposition.ts` / `practiceFieldService.ts` | deployed |
| Source provenance model + permission compiler | `feature/practitioner-authority-infrastructure` (in build) | in flight |

## Surface 1 — Develop

Where the practitioner authors and revises their field.

- **Edit authored field**: the existing `practice_fields` identity layers, surfaced for the
  practitioner with the existing PUT route. No new write model.
- **Revision history**: read view over `practice_field_revisions` (already append-only). Render as
  "what changed, when, in whose words" — never as version-control jargon.
- **Publish changes**: an explicit gesture separating *drafting* from *what members encounter*.
  v1: reuse the revision boundary — saving = draft revision; publishing = marking a revision as the
  live expression. Needs one column (`published_revision_id` on `practice_fields`) — the only new
  schema in this plan.

## Surface 2 — Explore

Member-facing preview: the practitioner sees the rooms **exactly as a member would**, composed
through the same `formatFieldContextForRoom` path — never a parallel renderer (a preview that
diverges from the real composition is a false control surface).

- v1: read-only render of the member room with the practitioner's field composed, clearly framed
  "as a member will encounter it."
- The preview composes the *published* expression, not the draft — showing drafts as live would
  reintroduce the readiness-as-authority confusion.

## Surface 3 — Monitor

Field health, **never member surveillance**. Everything here is about the practitioner's own
authored material and its translation state.

Show:
- **Current published expression** — what is live, which revision, since when.
- **Resources available** — the practitioner's own sources and their authority state
  (discovered / reviewed / ratified / validated), straight from the sources substrate.
- **Recent field revisions** — their own change history.
- **Translation state** — which rooms/doors compose the field, and whether the corpus channel is
  open or gated for each (the compiler's per-source reasons rendered honestly:
  "not yet validated", "awaiting ratification").

Never build (constitutional, already enforced elsewhere — listed for the reviewer, not debate):
- member activity, engagement, progress, or reading indicators of any kind
- aggregate claims about members ("your clients frequently…") — Path B barred
- scores or rankings of anything, including the field itself

## Sequencing

1. **Blocked-by**: sources substrate + permission compiler (in flight). Monitor's "resources"
   panel reads it; Develop's publish gesture should land after it so publishing and authority
   never get conflated (publishing ≠ authorizing — a published expression still composes only
   what the compiler allows).
2. **Slice 1**: Develop (edit + revision history read + `published_revision_id`).
3. **Slice 2**: Explore (same-path preview).
4. **Slice 3**: Monitor (published expression + resources + revisions + translation state).
5. Each slice: build → walk → founder acceptance → merge. Member-facing changes never auto-merge.

## Open questions (founder)

1. Door placement: does the steward loop live at `/studio` (practitioner home) or `/now-what/admin`
   (field-local)? The snapshot chose field-local; the practitioner-door ruling (one `pro-studio`
   door) suggests `/studio` hosts it and field-local is at most a shortcut.
2. Does "publish" require re-ratification when the edit touches composed layers? (Compiler says
   corpus yes by construction; identity layers currently compose ungated.)
3. Multi-field practitioners: v1 assumes one field per practitioner (matches `getAuthoredField`).
