# H1 cohort gate — production rollout record — 2026-09-30

```text
Class: A programme · controlled production exposure
Runtime code / production SHA at opening: 3421a2096c3afcce617a394bca1ffe246171f39f
Canonical after #1560 admission-doc merge: 008963af155f1bf17239d369741bd5f2f6155b8c (documentary-only delta)
Implementation: #1551
Browser admission witness: PASS on exact canonical SHA
Production cohort: 4 founder-designated members, explicit UUID allowlist
Standing: PRODUCTION COHORT OPEN · SMALL CONTROLLED EXPOSURE
```

## Boundary opened

Only the H1 experimental crossing is open for the production cohort: explicit Work-context arrival
from House into Writer's Studio, and the corresponding Studio-side authority to honour `work=`.

Writer's Studio itself, manuscripts, member Works, H1-R2 multi-manuscript correctness, House
presentation, Living Field, and EARLY-FIELD-01 are not governed by this cohort.

## Operational act

Production `.env.production` was changed from no H1 configuration to:

- `HOUSE_STUDIO_H1_ENABLED=true`
- `HOUSE_STUDIO_H1_MEMBER_IDS=<four explicit production member UUIDs>`

The UUIDs are deliberately not copied into source control. Production configuration remains the
operational authority. All four configured UUIDs were resolved read-only against the production
member directory: configured count `4`, resolved count `4`, no extra ids.

Only the `maia` service was force-recreated from the already-current production image. No image was
rebuilt, no migration ran, and no source deployment was performed as part of opening the cohort.

## Post-restart witness

- container `GIT_COMMIT`: `3421a2096`
- Docker health: `healthy`
- in-container `/api/health`: `health=ok`, version `3421a2096`
- public `https://soullab.life/api/health`: `health=ok`, version `3421a2096`
- production H1 switch: `true`
- production H1 configured cohort count: `4`
- production unauthenticated `GET /api/house-studio/admission`: `401`

The exact same SHA had already passed the two-population browser witness before production opening:
admitted member → H1 House link + Work arrival; ordinary member → plain Studio link and a hand-typed
owned `work=` ignored; unauthenticated direct entry → Sign in, zero H1 arrival surfaces.

## Rollback

A pre-change backup was written before editing the production env:

`/home/soullab/MAIA-SOVEREIGN/.env.production.h1-20261001T012910Z.bak`

Immediate rollback remains either:

1. set `HOUSE_STUDIO_H1_ENABLED=false` and recreate only `maia`, or
2. restore the backup env and recreate only `maia`.

Neither rollback hides Writer's Studio, manuscripts, Works, or member-authored material.

## Remaining production witness

The mechanism, production configuration and unauthenticated boundary are verified. A member-visible
production witness with an actually signed-in cohort member and an actually signed-in ordinary
member remains the final observational step. It should use their existing sessions; this rollout did
not create, inspect, copy or alter member session credentials in order to manufacture that evidence.
