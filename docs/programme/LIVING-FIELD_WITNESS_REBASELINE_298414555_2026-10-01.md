# Living Field — Witness Re-baseline at production `298414555`

**Date:** 2026-10-01
**Observed production runtime:** `298414555bbe7eccdf453b09e026737d4f7f4e29`
**Prior admitted re-baseline:** `56d0cd679`
**Standing:** MACHINE RE-BASELINE PASS · FIRST-ENTRY WITNESS CLASS PRESERVED · PRE-WALK GATES STILL GOVERN

## Trigger

Production moved from `56d0cd679` to `298414555` before the first human walk. Amendment 1 requires a new named source re-baseline before any walk starting on a different SHA.

## Live production facts

At `2026-10-01T23:41:47Z` production reported `298414555` and:

```text
MAIA_CABIN_MODE absent: exit=1
maia-postgres started=2026-10-01T21:41:44.870926604Z restarts=0 oom=false status=running health=healthy
```

At the same runtime:

```text
EARLY_FIELD_ENABLED=true
EARLY_FIELD_MEMBER_IDS_COUNT=4
HOUSE_STUDIO_H1_MEMBER_IDS_COUNT=4
unauthenticated /api/early-field/admission = HTTP 401
```

No member ids, names, emails, sessions, or authored content were emitted.

## Source re-baseline

Compared with `56d0cd679`, the declared Living Field source set has no changes under:

- `app/maia/living-field/**`;
- `app/api/maia/living-field/**`;
- `components/maia/living-field/**`;
- `lib/maia/living-field/**`;
- `lib/maia/living-constellation/**`;
- `app/house/**`.

Within that comparison set, only `config/accessMatrix.ts` changed; inspection found no Early Field, Living Field, Cabin, or House-Studio match in that diff.
## Fresh content-blind substrate census

Captured at `2026-10-01T23:42:28Z` on production `298414555`:

```text
cohort_members=4
personal_living_fields_members=0
personal_living_fields_rows=0
living_field_versions_members=0
living_field_versions_rows=0
vision_thread_members=0
vision_thread_rows=0
practice_field_members=0
practice_field_rows=0
facet_crossing_members=0
facet_crossing_rows=0
quick_journal_members=0
quick_journal_rows=0
personal_decision_members=0
personal_decision_rows=0
```

The first-entry witness therefore remains the truthful witness class. The populated-field continuity witness remains blocked by evidence.

## Explicit MAIA-entry boundary

Deployed source at `298414555` still contains both explicit member gestures required by the witness:

- `Explore with MAIA →` in `PersonalLivingFieldDashboard.tsx`;
- `Enter this dimension with MAIA` in `LivingFieldDetailPanel.tsx`.

## Consequence

This record satisfies the Amendment 1 source re-baseline requirement for a walk that starts on `298414555`, but it does not authorize the walk. The Class A pre-walk record still governs G0–G7. At the time of this record, G1 and G2 have fresh machine evidence; G0, G3, G4, G5, G6, and G7 remain independent requirements.

**Current machine-side standing:**

`PRODUCTION 298414555 · HEALTH GREEN · FOUR-PERSON COHORT PRESERVED · SUBSTRATE 0/4 · EXPLICIT MAIA ENTRY PRESENT · FIRST-ENTRY CLASS PRESERVED · POPULATED-FIELD BLOCKED · R2 NOT ADMITTED · NO HUMAN WALK AUTHORIZED`
