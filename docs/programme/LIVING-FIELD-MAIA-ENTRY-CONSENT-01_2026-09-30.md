# LIVING-FIELD-MAIA-ENTRY-CONSENT-01
Date: 2026-09-30
Base: `8b2680254` / PR #1545 auth-runtime repair
Status: implementation in progress; merge/deploy not authorized

## Founder ruling

> Opening a Living Field dimension opens the member's field, not a MAIA
> encounter. MAIA enters only through an explicit member action.

The real-stack auth/runtime repair made an older behavior visible: the detail
panel initialized `encounterOpen` to true, so clicking “Open dimension”
mounted `LivingEncounterView` immediately and created an encounter without a
second member action.

That conflated two different acts:
1. opening member-owned field material; and
2. beginning a relational exchange with MAIA.

## Repair law

> Access to my own material is not consent to begin an AI encounter about it.

The dimension therefore opens with `encounterOpen=false`. The existing
“Enter this dimension with MAIA” button becomes the explicit transition into
the encounter. Current Expression, gathering evidence, history, sources and
consent remain available inside the dimension without requiring MAIA entry.

No MAIA prompt, cognition, persistence rule, route authority, or R2 surface is
changed by this act.
## Falsifier and real-stack witness

The consent falsifier was written before the code change. With the inherited
`useState(true)` it failed exactly the default-entry law while the explicit
button and field-content assertions already held. After changing only the
default state to false, the focused Living Field suite passes 70/70.

A real Mac Studio browser walk then used the actual Next app, actual auth/runtime
repair, and a fresh disposable PostgreSQL database with synthetic member data.

The walk passed 10/10:

- no MAIA encounter exists on Living Field arrival;
- opening Current Questions creates no encounter request;
- the explicit “Enter this dimension with MAIA” action is visible;
- Current Expression and Development History remain available first;
- authorship can be inspected before MAIA entry;
- inspecting history still creates no encounter;
- clicking the explicit MAIA action starts exactly one encounter;
- encounter open returns HTTP 200;
- the page then visibly names “In conversation with MAIA”.

The database, synthetic session, server and temporary browser state are
disposable. No production/member content was used and no external model call
was made.

This closes the consent blocker for cohort preparation. It does not itself
authorize cohort exposure or deployment.
