[Reading 112 lines from start (total: 112 lines, 0 remaining)]

# Living Field — Witness Re-baseline at production `d4655e647`

**Date:** 2026-10-02
**Observed production runtime:** `d4655e6477fa40b8f94c5f8f91be47198288d2af`
**Prior production re-baseline:** `298414555` (historical; PR #1681 was correctly closed when production moved)
**Standing:** MACHINE RE-BASELINE PASS · FIRST-ENTRY WITNESS CLASS PRESERVED · PRE-WALK GATES STILL GOVERN

## Trigger

Production moved again before the first human walk. Amendment 1 requires the witness to bind to the
runtime actually in front of the member, not to a prior production SHA or to a newer canonical head.

At capture, production `d4655e647` was an ancestor of canonical `8aa79ee445`. Canonical therefore
contains newer code that is not part of this witness. This record uses the deployed production
projection only.

## Live production facts

At `2026-10-02T12:14:08Z` production reported:

```text
production_sha=d4655e647
EARLY_FIELD_ENABLED=true
EARLY_FIELD_MEMBER_IDS_COUNT=4
HOUSE_STUDIO_H1_ENABLED=true
HOUSE_STUDIO_H1_MEMBER_IDS_COUNT=4
MAIA_CABIN_MODE absent: exit=1
unauthenticated /api/early-field/admission = HTTP 401
```
At `2026-10-02T12:14:20Z` the same runtime reported public health green:

```text
health=ok
version=d4655e647
database=ok
members=true
conversation_turns=true
member_settings=true
```

Postgres at that moment was:

```text
started=2026-10-02T10:12:07.21786677Z
restarts=0
oom=false
status=running
health=healthy
```

No member ids, names, emails, sessions, credentials, or authored content were emitted.

## Fresh content-blind substrate census

At `2026-10-02T12:17:20Z` / `12:17:38Z`, production was still `d4655e647` and the configured
four-person Early Field cohort returned:

```text
cohort_members=4
personal_living_fields_rows=0
living_field_versions_rows=0
vision_thread_rows=0
practice_field_rows=0
facet_crossing_rows=0
quick_journal_rows=0
personal_decision_rows=0
```

Zero rows across every source means zero cohort members have substrate in those sources. The
first-entry witness remains the truthful witness class; populated-field continuity remains blocked
by evidence.
## Source re-baseline

Between the prior production `298414555` and deployed `d4655e647`, the Living Field source delta
is one governed lineage:

```text
de9644e06 fix(living-field): converge client identity authority
```

The touched Living Field files are:

- `app/maia/living-field/page.tsx`;
- `components/maia/living-field/{LivingEncounterView,LivingFieldCard,LivingFieldDetailPanel,LivingFieldGatheringPanel,PersonalLivingFieldDashboard,PhaseStatePanel}.tsx`;
- two Living Field identity/auth transport tests.

The change moves Living Field client identity from browser-local belief to server-verified session
authority and aligns downstream requests with that verified identity. It does not create member
substrate and does not remove the explicit MAIA-entry boundary.

## Explicit MAIA-entry boundary

The deployed `d4655e647` source still contains both required gestures:

- `PersonalLivingFieldDashboard.tsx:99` — `Explore with MAIA →`;
- `LivingFieldDetailPanel.tsx:163` — `Enter this dimension with MAIA`.

The first-entry instrument therefore still observes a member-controlled transition into MAIA rather
than an automatic entry.

## Consequence

This record satisfies the Amendment 1 machine/source re-baseline requirement for a walk that starts
on `d4655e647`, subject to G5 confirming that production is still on this SHA at walk start.

It does **not** authorize the walk. G0-G7 remain independently binding. In particular, G2 must bind
the current Postgres recreate boundary, G3 remains unwitnessed in canonical evidence, G4 is
participant-specific at walk time, and G6/G7 require the actual human setup.

**Current machine-side standing:**

`PRODUCTION d4655e647 · HEALTH GREEN · FOUR-PERSON COHORT PRESERVED · SUBSTRATE 0/4 · EXPLICIT MAIA ENTRY PRESENT · FIRST-ENTRY CLASS PRESERVED · POPULATED-FIELD BLOCKED · NO HUMAN WALK AUTHORIZED`

[executed on device: Kellys-Mac-Studio.local (b4b2914c-b72a-4b09-b98c-689002658094)]