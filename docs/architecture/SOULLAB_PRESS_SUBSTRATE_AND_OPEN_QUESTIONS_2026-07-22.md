# Soullab Press — Verified Substrate & Open Object Questions

**Date:** 2026-07-22 · **This is the #2 slot, held open on purpose.**

The ontology (document #2) is **not written**, and will not be written until behavior — not code, not theory — answers the questions below. With almost nothing built to constrain it, an ontology authored now would be invention wearing the costume of discovery. This page records only what is *verified* and what must be *witnessed*. No hierarchy, no naming, no objects proposed.

Grounded in: [Current-State Audit #1](./SOULLAB_PRESS_CURRENT_STATE_AUDIT_2026-07-22.md). Answered only by: [Witness Protocol](../ops/SOULLAB_PRESS_WITNESS_PROTOCOL_2026-07-22.md).

---

## Verified substrate (exists in code)

- member-scoped arrangement (`workbench_uploads`, `workbench_tables`, `arranger_id`-keyed)
- mechanical assembly of the creator's own material (`graduateGroup`)
- DOCX ingest (`import-docx`)
- an artifact-agnostic render engine (`renderHtmlToPdf(html)` — coupling to one book lives in the route, not the engine)
- a reusable annotation pattern (`reading_moments`)

## Present on the PRODUCTION branch (added 2026-07-22 — branch reconciliation)

The verified-substrate list above is from the `feature/practitioner-program-platform` audit. The **production** branch `clean-main-no-secrets` (PR #673 + #676) additionally has a DB-backed Manuscript Room — migration `20260721000003_press_manuscript_room.sql`:

- a **member-scoped manuscript container** (`member_manuscripts`)
- **sections** (`manuscript_sections`)
- **keeps** (`manuscript_keeps`)
- **collections** + items (`manuscript_collections`, `manuscript_collection_items`)

*(Tables + 5 routes + page confirmed to exist; full runtime wiring not yet audited on the deploy branch. This moves "body-of-work object / keeps / collections" out of "confirmed absent" — pending a deploy-branch audit.)*

## Confirmed absent (both branches, no code, no schema)

- world container
- project container spanning multiple manuscripts/artifacts
- collaboration primitives (shared/attributed authorship)
- versioning / edition model
- artifact definitions (deck / workbook / retreat / journal)
- publication model (ISBN, distribution, proofs)

## Open object questions (answerable only by behavior)

- What object do creators naturally **gather around**?
- What object **persists across** artifacts?
- What object do collaborators **share**?
- What object do members **reach for unprompted**?

---

*Stop here. The next line added to this page is a dated observation from a walk — not a proposed object.*
