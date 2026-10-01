# EARLY-FIELD-01 — Production Deployment Record

**Programme day:** 2026-09-30
**Status:** DEPLOYED · PROVENANCE VERIFIED · NON-COHORT EXCLUSION WITNESSED · widening/admission still open
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

## 7 · Closure gate

This record closes only when the exact deployed SHA, environment witness,
dual runtime-SHA verification and non-cohort result are present. Container
startup alone is not sufficient evidence.

Sections 8–11 record that closure evidence.

## 8 · Pre-deploy environment witness

Immediately before deployment, the minisforum was re-read rather than relying
on the earlier observation.

Host shell:

```text
EARLY_FIELD_ENABLED=UNSET
EARLY_FIELD_MEMBER_IDS=EMPTY_OR_UNSET
```

Running `maia-sovereign` container `Config.Env`:

```text
EARLY_FIELD_ENABLED=UNSET
EARLY_FIELD_MEMBER_IDS=EMPTY_OR_UNSET
```

The target commit was already present in the production repository, and
`origin/clean-main-no-secrets` resolved exactly to
`cc1c5b4d79793dd7911d6aea0054e8c678d01bcb`.

## 9 · Governed deploy transaction

A deploy for the same canonical target was already holding the production lane:

```text
entry=pre-deploy-gate.sh deploy-maia
target=cc1c5b4d7
started=2026-10-01T00:34:40Z
```

A second deploy attempt was refused by the deploy lock. The lock was not
deleted, bypassed or forced. The existing immutable-SHA deploy was allowed to
finish.

The holder exited at approximately `2026-10-01T00:41:04Z`. At
`2026-10-01T00:41:18Z` the production container reported `healthy`.

Post-deploy provenance:

```text
docker exec maia-sovereign printenv GIT_COMMIT  = cc1c5b4d7
docker inspect maia-sovereign Config.Env        = cc1c5b4d7
maia-sovereign:current                          = cc1c5b4d7
maia-sovereign:previous                         = 89f7876e8
```

## 10 · Non-cohort production witness — PASS

The witness used the existing authenticated Safari production session; no
session cookie, member id or credential was extracted.

On `https://soullab.life/maia/living-field` the signed-in member reached the
normal Living Field and member-specific field content loaded. At the exact
mount position governed by EARLY-FIELD-01, the page moved directly from the
Living Field introduction into the existing wider-field constellation.
`LivingFieldInstrument` was absent.

In the same authenticated browser session:

```text
GET https://soullab.life/api/early-field/admission
{"admitted":false}
```

This satisfies EARLY-FIELD-01 widening criterion 3: exclusion is witnessed
without withdrawing the Living Field itself.

The visual witness was inspected locally but is not committed to the repository,
because the Living Field screen contains member-specific content. The evidence
record preserves only the minimum operational facts needed for adjudication.

## 11 · Standing after this deploy

The production deployment act is **VERIFIED** at canonical `cc1c5b4d7`.

The following claims are now supported:

- production is running the canonical merge commit from #1547;
- runtime `printenv` and Docker `Config.Env` agree on that identity;
- the rollback chain advanced truthfully to `current=cc1c5b4d7` and
  `previous=89f7876e8`;
- a signed-in non-cohort member retains the Living Field;
- that member does not receive `LivingFieldInstrument`;
- the server admission endpoint answers `{"admitted":false}`.

This does **not** admit or widen EARLY-FIELD-01. The rollback witness, cohort
circulation evidence, #1539 real-stack witness, and the separate H1 browser
admission remain open under their own governing records.
