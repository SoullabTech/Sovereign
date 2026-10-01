# Living Field First-Entry Witness — Production Re-baseline at `56d0cd679`

**Date:** 2026-10-01
**Status:** MACHINE RE-BASELINE COMPLETE · participant-specific admission + witness-window freeze still owed at walk time
**Readiness runtime:** `975a208b8c39f99e9b47208ce5139bbec94bd8ac`
**RC1 re-baseline runtime:** `03f0fd3abce16fcc1132481836b2e6ff8d364cd7`
**Observed production runtime:** `56d0cd679c247a91dfe5a3592ce59e5a488c1fba`
**Canonical source base when this record was opened:** `89dd12dd8c16`

## Trigger

Production has moved again since both the readiness census and the RC1 re-baseline.
Amendment 1 / clause 4b of the first-entry protocol requires a new source re-baseline plus
live re-witnessing of preconditions 3, 5 and 6 whenever the start SHA differs from the
readiness runtime.

This record establishes only what can be established without selecting a participant or
reading member content.

## Live runtime evidence

Read-only checks against production established:

- public `/api/health` returned HTTP 200, `health: ok`, version `56d0cd679`;
- the running `maia-sovereign` container reported `GIT_COMMIT=56d0cd679`;
- `MAIA_CABIN_MODE` was **unset**;
- `EARLY_FIELD_ENABLED=true`;
- `HOUSE_STUDIO_H1_ENABLED=true`;
- the configured Early Field cohort resolved to **4 members**.
No cohort member IDs, names, emails, session credentials, or private content were emitted by
the re-census.

The unset cabin mode discharges the live condition identified by the RC1 re-baseline: the
House changes guarded by `MAIA_CABIN_MODE === 'offline'` are inert in the live production
container.

## Source re-baseline: `03f0fd3ab` → `56d0cd679`

Across this interval there are **64 commits** and **43 non-documentation paths** changed.

An exact pathspec comparison found **no change** in the witness-sensitive executable surfaces:

- `app/maia/living-field/**`
- `app/api/maia/living-field/**`
- `components/maia/living-field/**`
- `components/maia/living-constellation/**`
- `lib/maia/living-field/**`
- `lib/maia/living-constellation/**`
- `app/house/page.tsx`
- `app/api/house/preferences/route.ts`
- `lib/house/**`
- `middleware.ts`, `lib/auth/**`, and `lib/http/**`

At the exact production source `56d0cd679`, the two consent gestures named by the protocol
remain present in the Living Field implementation:

- `PersonalLivingFieldDashboard.tsx` — **Explore with MAIA →**
- `LivingFieldDetailPanel.tsx` — **Enter this dimension with MAIA**

**Source verdict:** nothing between RC1 and the observed production runtime invalidates the
Living Field first-entry witness surfaces or the explicit-MAIA-entry boundary.
## Aggregate substrate re-census

A read-only production query repeated the readiness categories using only aggregate counts
across the four configured cohort members:

| Source | Members represented | Rows |
|---|---:|---:|
| `personal_living_fields` | 0 | 0 |
| `personal_living_field_versions` | 0 | 0 |
| qualifying Vision Studio threads | 0 | 0 |
| Practice Fields | 0 | 0 |
| `member_facet_crossings` | 0 | 0 |
| quick journal entries | 0 | 0 |
| personal Studio decisions | 0 | 0 |

No private text was selected.

**Readiness verdict at this observation:** authentic cohort Living Field substrate remains
**0 / 4**. The first-entry witness remains the truthful available instrument. The populated-field
continuity witness remains blocked by evidence.

## Still owed at the actual walk

This record does **not** make a human witness runnable by itself. At the actual walk:

1. a participant must be chosen by the founder and consent to participate;
2. the scheduled-against production SHA must be recorded;
3. production health and the start SHA must be read again;
4. that participant, in their own ordinary session, must receive `admitted:true` from the
   Early Field admission boundary;
5. absence/presence of authentic participant substrate must be rechecked without reading content;
6. explicit MAIA entry must still be present at that start SHA;
7. all production deploys must be frozen from start-SHA capture through end-SHA capture;
8. health and the production SHA must be recorded again at the end.

If the scheduled, start, and end SHAs differ, or if the deploy freeze fails, the record is
**VOID — NO EVIDENCE** and is not adjudicated as PASS or STOP.
If production moves away from `56d0cd679` before the walk, this record does not silently carry
forward. The protocol's re-baseline rule applies again to the new start SHA.

## Scope / non-actions

This re-baseline:

- selected no participant;
- changed no cohort membership;
- read no member content;
- obtained no member session credential;
- changed no runtime configuration;
- performed no deployment or rollback;
- changed no Living Field implementation;
- admitted no R2 presentation and authorized no cohort widening.

Its standing is documentary evidence only: the machine side is coherent at
`56d0cd679`, while the participant-specific and witness-window conditions remain deliberately
unclaimed.
