# Living Field + Writer's Studio Witnesses — Re-baseline after RC1

**Date:** 2026-10-01
**Status:** SOURCE RE-BASELINE COMPLETE · ⛔ two live confirmations owed at walk time
**Previous readiness runtime:** `975a208b8c39f99e9b47208ce5139bbec94bd8ac`
**Current production runtime:** `03f0fd3abce16fcc1132481836b2e6ff8d364cd7` (founder deploy, ~14:35Z)

## Correction to the premise

The first-entry protocol does **not** pin `975a208b8`. Its precondition 4 reads *"production health is green and runtime SHA is recorded"*. The pin sits in the readiness census (`LIVING-FIELD-FIRST-HUMAN-WITNESS_READINESS_2026-10-01.md`), which measured preconditions 3, 5 and 6 against that build.

Precondition 6 (*explicit MAIA entry is present in the deployed build*) depends on the build. So the concern is valid: a new build requires a re-baseline before the witness may rely on the old readiness.

## Source re-baseline: `975a208b8` → `03f0fd3ab`

There are 173 non-documentation paths changed. Filtering them against Living Field surfaces gives:

| Surface | Changed? |
|---|---|
| Living Field routes, components, libraries, R1R3 instrument, constellation, facet-flow, Early Field admission | **No.** No path matching `living-field`, `livingField`, `constellation`, `early-field`, `facet` or `r1r3` changed. |
| `middleware.ts`, `lib/auth/*`, `lib/http/*` | **No.** |
| `app/house/page.tsx`, `app/api/house/preferences/route.ts`, `lib/house/houseCabinContext.ts` | **Yes.** The protocol's task starts *"Start from the House"*. |

**House changes.** Every changed branch in `app/house/page.tsx` and in the preferences route is guarded by `process.env.MAIA_CABIN_MODE === 'offline'`. When that is unset:
- `houseStudioH1Admitted` reduces to its previous expression;
- the Writing links reduce to their previous expressions;
- preferences are read through the previous path.

`docker-compose.production.yml` at `03f0fd3ab` does not set `MAIA_CABIN_MODE` itself. ⚠️ But it loads `env_file: .env.production`, which is host-only and gitignored, so **source cannot rule the variable out**. The House → Living Field door is behaviorally unchanged in production **only if** live check 1 below returns empty.

**Verdict (source):** RC1 did not touch Living Field surfaces. The House changes are inert unless cabin offline mode is set.

## Live confirmations owed (read-only, at walk start)

```bash
# 1. Cabin mode must be unset in the live container (expect: empty line)
ssh soullab@minisforum 'docker exec maia-sovereign printenv MAIA_CABIN_MODE'

# 2. Start SHA (repeat at the end; a difference makes the walk NO EVIDENCE)
ssh soullab@minisforum 'docker exec maia-sovereign printenv GIT_COMMIT'
```

Then re-witness live, as the protocol already requires:
- precondition 3: aggregate substrate counts only, never content;
- precondition 5: early-field admission returns `admitted:true`;
- precondition 6: explicit MAIA entry is present.

The old census does not carry forward. Time has passed and members may have authored substrate since.

## Writer's Studio cohort walk: same rule

No Writer's Studio cohort-walk protocol is on record yet. Whoever writes it inherits:
- production SHA recorded **at start and at end**, and a mismatch makes the walk **NO EVIDENCE**;
- the walk's subject build is `03f0fd3ab`. Any later deploy before the walk requires a new re-baseline.

The Living Field protocol and its record template were amended to match (protocol Amendment 1, made before any run).
