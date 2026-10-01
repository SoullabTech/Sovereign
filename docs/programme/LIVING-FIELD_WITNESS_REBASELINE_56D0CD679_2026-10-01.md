# Living Field — Witness Re-baseline at production `56d0cd679`

**Date:** 2026-10-01  
**Observed production runtime:** `56d0cd679c247a91dfe5a3592ce59e5a488c1fba`  
**Prior readiness runtime:** `975a208b8`  
**Standing:** MACHINE RE-BASELINE PASS · FIRST-ENTRY WITNESS ELIGIBLE SUBJECT TO PARTICIPANT-SESSION ADMISSION CHECK

## Trigger

Production moved after the first-entry readiness census. The first-entry protocol Amendment 1 requires live re-witnessing whenever the start SHA differs from the readiness SHA, and requires a readiness re-census if an intervening change touched a Living Field surface.

## Live facts established

- `GET /api/health` returned `health: ok` and runtime `56d0cd679`.
- unauthenticated `GET /api/early-field/admission` returned HTTP `401`.
- production has `EARLY_FIELD_ENABLED=true`.
- the configured Early Field cohort contains **4 UUID-shaped member ids**; no ids were copied into this record.
- production has `HOUSE_STUDIO_H1_ENABLED=true` and the H1 cohort also contains **4 UUID-shaped member ids**.
- `MAIA_CABIN_MODE` is unset in the live container, so the intervening Cabin/offline House branches are inert for this witness path.

No member content, session credential, email, name, or private cohort material was read.

## Source re-baseline

Compared with `975a208b8`, the intervening source history does **not** modify:

- `app/maia/living-field/**`;
- `app/api/maia/living-field/**`.

It **does** modify `app/house/page.tsx`, `app/layout.tsx`, and `config/accessMatrix.ts`.

The House diff preserves the member doorway exactly as:

`/maia/living-field?from=house`

The House changes are Cabin/offline and Writer's Studio routing work; they do not rewrite the Living Field doorway itself.

## Fresh aggregate readiness census

A content-blind census was rerun against the four configured Early Field cohort members at `56d0cd679`. No member ids or content were emitted.

```text
cohort members                         4
personal_living_fields                 0 members · 0 rows
personal_living_field_versions        0 members · 0 rows
qualifying Vision Studio threads       0 members · 0 rows
Practice Fields                        0 members · 0 rows
member_facet_crossings                 0 members · 0 rows
quick_journal_entries                  0 members · 0 rows
personal studio_decisions              0 members · 0 rows
```

The deployed source at `56d0cd679` also contains both explicit MAIA entry gestures used by the witness: `Explore with MAIA →` and `Enter this dimension with MAIA`.

## Consequence

The machine-side re-baseline is now complete. The first-entry witness remains the truthful witness class: no cohort member has accumulated substrate in the sources used by this experience.

At the actual walk, confirm `GET /api/early-field/admission` returns `admitted:true` in the chosen member's own ordinary session. Then record the production SHA at both start and end. Any SHA mismatch remains `VOID — NO EVIDENCE`.

## What this record does not claim

This record does not re-adjudicate the human witness, widen the cohort, admit R2, or prove populated-field continuity. It only restores a truthful machine-side boundary after production drift.

**Current machine-side standing:**

`PRODUCTION HEALTH GREEN · FOUR-PERSON COHORT PRESERVED · FRESH AGGREGATE SUBSTRATE CENSUS 0/4 · EXPLICIT MAIA ENTRY PRESENT · FIRST-ENTRY WITNESS ELIGIBLE · POPULATED-FIELD WITNESS BLOCKED BY EVIDENCE · R2 NOT ADMITTED`
