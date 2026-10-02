# Living Field — Witness Re-baseline at production `d4655e647`

**Date:** 2026-10-02
**Observed production runtime:** `d4655e6477fa40b8f94c5f8f91be47198288d2af`
**Standing:** MACHINE RE-BASELINE PASS · FIRST-ENTRY WITNESS CLASS PRESERVED · EXACT LIVE SHA CANONICAL-ANCESTRAL · PRE-WALK GATES STILL GOVERN

## Trigger

Production moved from the projection runtime `13a0308d7` to canonical convergence commit `d4655e647` before the first human walk. Amendment 1 requires the walk to begin on a runtime with a named source re-baseline; older runtime records remain historical provenance only.

PR #1727 admitted the live production lineage into canonical ancestry with a merge commit whose tree is byte-identical to its canonical first parent. Production now runs that merge commit directly.

## Live production facts

Read-only production capture at `2026-10-02T12:16:12Z` reported:

```text
production_sha=d4655e647
EARLY_FIELD_ENABLED=true
EARLY_FIELD_MEMBER_IDS_COUNT=4
HOUSE_STUDIO_H1_MEMBER_IDS_COUNT=4
MAIA_CABIN_MODE_PRESENT=false
unauthenticated_admission_http=401
postgres_started=2026-10-02T10:12:07.21786677Z restarts=0 oom=false status=running health=healthy
```

No member ids, names, emails, sessions, credentials, or authored content were emitted.

## Canonical ancestry

At capture time, `d4655e6477fa40b8f94c5f8f91be47198288d2af` is an ancestor of `clean-main-no-secrets`.

This satisfies the ancestry shape G5 requires for the exact runtime, subject to the normal walk-time recheck against then-current canonical. This record does not pre-fill the walk-time verdict.

## Source re-baseline

Unlike the earlier production-only projection hops, `d4655e647` includes the canonically admitted Living Field identity-authority repair from PR #1691.

Compared with `13a0308d7`, the declared Living Field / House source set changes in nine files:

- `app/maia/living-field/page.tsx`;
- `components/maia/living-field/LivingEncounterView.tsx`;
- `components/maia/living-field/LivingFieldCard.tsx`;
- `components/maia/living-field/LivingFieldDetailPanel.tsx`;
- `components/maia/living-field/LivingFieldGatheringPanel.tsx`;
- `components/maia/living-field/PersonalLivingFieldDashboard.tsx`;
- `components/maia/living-field/PhaseStatePanel.tsx`;
- `lib/maia/living-field/__tests__/livingFieldClientAuthTransport.test.ts`;
- `lib/maia/living-field/__tests__/livingFieldPageIdentityAuthority.test.ts`.

The change is an identity-authority convergence, not a change to the Living Field semantic or authorship model:

- the page resolves member identity through server-backed `verifyServerIdentity()` rather than trusting browser storage as authority;
- Living Field calls use governed `apiFetch` transport rather than hand-supplied `x-member-id` headers;
- direct child `memberId` plumbing is removed from the affected Living Field components;
- server/session authority remains decisive when browser state disagrees;
- identity uncertainty fails closed to a reconnect state instead of guessing a member;
- the first-entry copy, field hierarchy, authorship invitation, and explicit MAIA-entry gestures remain present.

The new focused tests bind the client-auth transport and page identity-authority behavior. No new semantic relationship, authored substrate, or automatic MAIA entry is introduced by this repair.

## Current mounted projection sources

Exact deployed source continues to project three existing constitutional centers:

1. `personal_living_fields` with latest `personal_living_field_versions` metadata;
2. confirmed, unreleased Vision Studio rows from `member_field_note_threads` whose `source_session_ref` begins `vs-`;
3. `practice_fields` keyed by `practitioner_member_id`.

## Fresh content-blind substrate census

Captured at `2026-10-02T12:16:12Z` on production `d4655e647`, using the configured four-person Early Field cohort internally and emitting counts only:

```text
cohort_members=4
personal_living_fields_members=0
personal_living_fields_rows=0
personal_living_field_versions_rows=0
vision_thread_members=0
vision_thread_rows=0
practice_field_members=0
practice_field_rows=0
```

The first-entry witness therefore remains the truthful witness class. No populated-field continuity claim is admitted by this census.

## Explicit MAIA-entry boundary

Exact source at `d4655e647` still contains both explicit member gestures required by the witness:

- `Explore with MAIA →` in `PersonalLivingFieldDashboard.tsx`;
- `Enter this dimension with MAIA` in `LivingFieldDetailPanel.tsx`.

No source review finding supports treating MAIA as entered before one of those explicit member actions.

## Consequence

This record establishes the machine/source/substrate re-baseline for a walk on `d4655e647`. It does not authorize the walk, satisfy participant admission, approve observation setup, complete the G3 emergency-disable witness, accept standby exposure, widen the cohort, or admit R2.

**Current machine-side standing:**

`PRODUCTION d4655e647 · HEALTH GREEN · EXACT LIVE SHA CANONICAL-ANCESTRAL · FOUR-PERSON COHORT PRESERVED · CURRENT PROJECTION SUBSTRATE 0/4 · EXPLICIT MAIA ENTRY PRESENT · FIRST-ENTRY CLASS PRESERVED · R2 NOT ADMITTED · NO HUMAN WALK AUTHORIZED`
