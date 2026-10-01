# Living Field Consent Repair — Production Deployment Record

**Programme day:** 2026-09-30
**Deployed:** 2026-10-01 UTC
**Target / canonical at deployment:** `975a208b8c39f99e9b47208ce5139bbec94bd8ac`
**Source PR:** #1554 · explicit MAIA entry
**Standing:** DEPLOYED · PRODUCTION HEALTHY · EARLY FIELD STILL CLOSED

> Opening a Living Field dimension opens the member's field, not a MAIA encounter.
> MAIA enters only through an explicit member action.

## 1 · Deployment boundary

This deployment advances production from `bde0f6590` to `975a208b8`.

The Living Field changes between those production points are limited to the already-admitted
House-return cleanup and the explicit-MAIA-entry consent repair. No database migration file
is present in the production-to-target diff.

The deployment does **not** open the Early Field cohort and does not widen H1.

## 2 · Pre-deploy gates

Before the build and swap:

- deploy lane lock: free, then acquired by the governed deploy command;
- disk: **151 GB free** on `/`, floor 60 GB;
- Co-Lab boundary verifier: **33 passed · 0 failed · 0 warned**;
- target commit resolved and materialized as an immutable git-archive build context;
- build stamp: `GIT_COMMIT=975a208b8`;
- migration delta from production `bde0f6590` to target: **0 files**.
## 3 · Governed deploy act

Production was changed only through the immutable-SHA deployment lane:

```text
./scripts/pre-deploy-gate.sh deploy-maia 975a208b8
```

The lane:

1. acquired the production deploy lock;
2. materialized exactly `975a208b8c39f99e9b47208ce5139bbec94bd8ac`;
3. built `maia-sovereign:prod`;
4. verified the built image's baked `GIT_COMMIT`;
5. advanced rollback tags;
6. force-recreated only the MAIA service;
7. verified the running container's `printenv` and Docker `Config.Env` stamps against the asserted SHA.

The deploy process exited **0**.

## 4 · Running provenance and health

Post-swap witnesses:

- running `maia-sovereign` `GIT_COMMIT`: **`975a208b8`**;
- Docker health state: **healthy**;
- in-container `/api/health`: **health=ok**, version **`975a208b8`**;
- public `https://soullab.life/api/health`: **health=ok**, version **`975a208b8`**;
- database/table checks reported healthy in the health payload.

The MAIA service is not exposed on host `127.0.0.1:3000`; the failed host-local curl is
therefore not treated as a health failure. In-container and public health are the applicable witnesses.
## 5 · Exposure state after deployment

The production environment was not widened by this deploy:

- `EARLY_FIELD_ENABLED`: **unset / closed**;
- `EARLY_FIELD_MEMBER_IDS`: **empty**;
- `HOUSE_STUDIO_H1_ENABLED`: **true**;
- `HOUSE_STUDIO_H1_MEMBER_IDS`: **set, count 4**.

No member UUID is copied into this record.

Therefore the newly repaired explicit-MAIA boundary is live universally in the ordinary
Living Field, while the experimental Early Field instrument remains closed pending its own
small-cohort opening act.

## 6 · Rollback custody

Image tags immediately after deployment:

- `:current` / `:prod` / `:975a208b8` → image `96a539353023`;
- `:previous` / `:bde0f6590` → image `c344292669b0`;
- `:68af62fda` remains available as an older retained SHA tag.

The retention task pruned the stale `:3421a2096` SHA tag. The old `:staging` tag remains
because Docker reported it in use.

The immediate rollback target is therefore the **current `:previous` image**, not an older
historical SHA remembered from a prior deployment record.

## 7 · Next valid state transition

This deployment makes the consent repair live; it does **not** itself authorize Early Field
cohort exposure.

The next valid Living Field rollout act is:

```text
EARLY FIELD CLOSED · CONSENT REPAIR LIVE
        ↓ explicit cohort selection + governed env change
SMALL EARLY FIELD COHORT OPEN
        ↓ first real human witness
PASS / PASS WITH FRICTION / NOT ADMITTED-STOP
```

Cohort membership, first-human evidence, and any later widening remain separate governed acts.
