# EARLY-FIELD-01 — Production Deployment Record

**Programme day:** 2026-09-30
**Status:** PRE-GATE PRODUCTION HISTORY RECORDED · canonical gate merged · deployment closure pending
**Current production at record opening:** `89f7876e8`
**Next governed target:** `cc1c5b4d79793dd7911d6aea0054e8c678d01bcb`

> Production history is operational evidence. It is kept separate from the
> certified #1547 implementation so deployment facts cannot rewrite the
> candidate that passed CI.

## 1 · Production sequence before EARLY-FIELD-01 merge

The production sequence on 2026-09-30 was:

1. `7ec42ce6f` was deployed at 23:28Z, out of the intended rollout order.
2. Production was moved forward to canonical `89f7876e8`.
3. A rollback was performed.
4. `89f7876e8` was deployed again.
5. The final pre-gate runtime was verified at `89f7876e8`.

The final pre-gate SHA was witnessed two ways: container `printenv` and
Docker `Config.Env` agreed.

## 2 · Exposure state before the gate deploy

`89f7876e8` contains the #1540 repair for H1's failed-read hang and
duplicate-on-Begin risk, but it predates the EARLY-FIELD cohort gate.

Therefore the production environment's closed EARLY-FIELD settings have no
runtime authority at this SHA: `LivingFieldInstrument` remains visible to
every signed-in member who reaches the Living Field.

This is not evidence of wider exposure than the earlier `7ec42ce6f` image;
it is evidence that the intended cohort boundary is **not yet closed**.

The Living Field itself remains universal by law. EARLY-FIELD-01 may gate only
`LivingFieldInstrument`, never the Living Field route, its established APIs,
or its ordinary circulation.

## 3 · Rollback custody

After the deploy → rollback → redeploy sequence:

- `:previous` points to `7ec42ce6f`.
- `04005ca7c` was pruned and is no longer a rollback target.
- Any operational record that still names `04005ca7c` as the current fallback
  is stale and must not be relied on for a rollback decision.

## 4 · New canonical target

#1547 merged at 00:26:13Z.

The canonical branch `clean-main-no-secrets` now resolves to:

```text
cc1c5b4d79793dd7911d6aea0054e8c678d01bcb
```

The governed production target is that canonical merge SHA, **not**
`0e29c65df`, the PR head.

## 5 · Required pre-deploy witness

Immediately before deployment, re-read the minisforum environment and establish:

- `EARLY_FIELD_ENABLED` is unset or exactly `false`;
- `EARLY_FIELD_MEMBER_IDS` is unset or empty.

Do not infer this from an earlier check.

Then deploy `cc1c5b4d79793dd7911d6aea0054e8c678d01bcb` through the normal
immutable-SHA production path and confirm the running SHA independently from
both container `printenv GIT_COMMIT` and Docker `Config.Env`.

## 6 · First post-deploy witness

The first widening-criterion witness is deliberately the excluded population.

A signed-in ordinary member outside the cohort must show all three:

1. the member can still reach the Living Field;
2. `LivingFieldInstrument` is absent;
3. `GET /api/early-field/admission` returns `{"admitted":false}`.

This proves exclusion without withdrawing the established room.

The rollback witness, cohort circulation, #1539 real-stack walk and H1 browser
admission remain separate required evidence acts.

## 7 · Closure

**OPEN.** Append the exact deployed SHA, environment witness, dual runtime-SHA
verification and non-cohort result after the governed deploy. Do not mark this
record closed merely because the image starts successfully.
