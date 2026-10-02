# Living Field — Witness Re-baseline at production `c9e4f7f7e`

**Date:** 2026-10-02
**Observed production runtime:** `c9e4f7f7eccb4049bf036d189cac7feb007ef3cc`
**Prior admitted re-baseline:** `d4655e647` via PR #1735 / merge `2db5eae59f7aab65f11bde68d6295a231d6e4ab0`
**Standing:** MACHINE RE-BASELINE PASS · FIRST-ENTRY WITNESS CLASS PRESERVED · EXACT LIVE SHA CANONICAL-ANCESTRAL · PRE-WALK GATES STILL GOVERN

## Trigger

Production moved from `d4655e647` to `c9e4f7f7e` before the first human walk. Amendment 1 requires a named source re-baseline for the exact walk runtime even when the Living Field source bytes are unchanged.

## Live production facts

Read-only captures at `2026-10-02T18:12:50Z` and `18:13:04Z` reported:

```text
production_sha=c9e4f7f7e
EARLY_FIELD_ENABLED=true
EARLY_FIELD_MEMBER_IDS_COUNT=4
HOUSE_STUDIO_H1_MEMBER_IDS_COUNT=5
MAIA_CABIN_MODE absent: cabin_exit=1
unauthenticated_admission_http=401
postgres_created=2026-10-02T13:24:32.412861029Z
postgres_started=2026-10-02T13:24:32.980763622Z
restarts=0
oom=false
status=running
health=healthy
active_cohort_sessions_last_15m=0
```

`HOUSE_STUDIO_H1_MEMBER_IDS_COUNT=5` is recorded as a separate H1 configuration change. It does **not** widen the four-person Early Field cohort used by this Living Field witness.

No member ids, names, emails, session credentials, birth dates, or authored content were emitted.

## Canonical ancestry and source delta

At capture time, `c9e4f7f7eccb4049bf036d189cac7feb007ef3cc` was an ancestor of `clean-main-no-secrets` (`git merge-base --is-ancestor` exit 0).

Compared with the prior admitted runtime `d4655e647`, there are **no byte changes** in the declared Living Field / identity / live safety source set:

- `app/maia/living-field/**`;
- `app/api/maia/living-field/**`;
- `components/maia/living-field/**`;
- `lib/maia/living-field/**`;
- `lib/auth/**`;
- `app/api/sovereign/app/maia/list/route.ts`;
- `lib/safety/**`.

The server-verified identity-authority repair admitted in the d465 re-baseline therefore remains the governing source shape on this runtime.

## Fresh content-blind substrate census

Captured at `2026-10-02T18:13:04Z` on production `c9e4f7f7e`:

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

The first-entry / empty-field witness remains the truthful witness class. The populated-field continuity witness remains blocked by evidence.

## Explicit MAIA-entry boundary

Exact deployed source at `c9e4f7f7e` still contains both explicit member gestures required by the witness:

- `Explore with MAIA →` in `PersonalLivingFieldDashboard.tsx`;
- `Enter this dimension with MAIA` in `LivingFieldDetailPanel.tsx`.

No source finding supports treating MAIA as entered before one of those explicit member actions.

## Consequence

This record establishes the machine/source/substrate re-baseline for a walk on `c9e4f7f7e`. It does not authorize the walk, resolve the Class A admission exception around PR #1736, accept the current disaster-recovery exposure, execute G3, satisfy participant admission, complete observation disclosure, close G7, widen the Early Field cohort, or admit R2.

**Current machine-side standing:**

`PRODUCTION c9e4f7f7e · HEALTH GREEN · EXACT LIVE SHA CANONICAL-ANCESTRAL · EARLY FIELD 4 · H1 5 (SEPARATE CONFIGURATION) · SUBSTRATE 0/4 · EXPLICIT MAIA ENTRY PRESENT · FIRST-ENTRY CLASS PRESERVED · POPULATED-FIELD BLOCKED · R2 NOT ADMITTED · NO HUMAN WALK AUTHORIZED`
