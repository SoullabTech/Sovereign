# Living Field — Witness Re-baseline at production `56d0cd679`

**Date:** 2026-10-01  
**Observed production runtime:** `56d0cd679c247a91dfe5a3592ce59e5a488c1fba`  
**Prior readiness runtime:** `975a208b8`  
**Standing:** HUMAN WITNESS HOLD · RE-CENSUS REQUIRED BEFORE RUN

## Trigger

Production moved after the first-entry readiness census. The first-entry protocol Amendment 1 requires live re-witnessing whenever the start SHA differs from the readiness SHA, and requires a readiness re-census if an intervening change touched a Living Field surface.

## Live facts established

- `GET /api/health` returned `health: ok` and runtime `56d0cd679`.
- unauthenticated `GET /api/early-field/admission` returned HTTP `401`.
- production has `EARLY_FIELD_ENABLED=true`.
- the configured Early Field cohort contains **4 UUID-shaped member ids**; no ids were copied into this record.
- production has `HOUSE_STUDIO_H1_ENABLED=true` and the H1 cohort also contains **4 UUID-shaped member ids**.

No member content, session credential, email, name, or private cohort material was read.

## Source re-baseline

Compared with `975a208b8`, the intervening source history does **not** modify:

- `app/maia/living-field/**`;
- `app/api/maia/living-field/**`.

It **does** modify `app/house/page.tsx`, `app/layout.tsx`, and `config/accessMatrix.ts`.

The House diff preserves the member doorway exactly as:

`/maia/living-field?from=house`

The House changes are Cabin/offline and Writer's Studio routing work; they do not rewrite the Living Field doorway itself.
## Consequence

Because the House is part of the participant's required start path and changed between readiness and the current runtime, Amendment 1 is applied conservatively: **do not run the first-entry human witness yet**.

Before the hold can clear, re-run the aggregate, content-blind readiness census at `56d0cd679` and confirm for the intended participant:

- no persisted member-owned Living Field substrate that would convert the walk into a populated-field witness;
- `GET /api/early-field/admission` returns `admitted:true` in that member's own ordinary session;
- the explicit MAIA entry gestures are present in the deployed build.

Then record the production SHA at the start and end of the actual walk. Any mismatch remains `VOID — NO EVIDENCE`.

## What this record does not claim

This record does not re-adjudicate the human witness, widen the cohort, admit R2, or prove populated-field continuity. It only restores a truthful machine-side boundary after production drift.

**Current machine-side standing:**

`PRODUCTION HEALTH GREEN · FOUR-PERSON COHORT PRESERVED · DIRECT LIVING-FIELD SOURCE UNCHANGED · HOUSE TOUCHED · HUMAN WITNESS HELD PENDING FRESH AGGREGATE READINESS CENSUS`
