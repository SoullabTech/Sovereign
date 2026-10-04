# WRITERS-STUDIO-CONVERGENCE-01 · H1-R4 — Gate Independence Witness

**Date:** 2026-10-02
**Runtime witnessed:** `d4655e6477fa40b8f94c5f8f91be47198288d2af`
**Canonical base at record-branch creation:** `f1c1f96f8531a1812630311cc8d36559995d5e80`
**Class:** production witness record; no runtime mutation in this commit
**Standing:** R4 PASS · EARLY FIELD OPEN / H1 CLOSED quadrant witnessed · H1 restored before later founder widening

## 1 · Why R4 existed

The earlier H1-R3 production sequence was preregistered only for Early Field CLOSED.
By 2026-10-02 production truth had moved to Early Field OPEN and H1 OPEN, so the old T1
could not lawfully be replayed.

R4 asked one narrower question:

> Can H1 close and reopen while Early Field remains open, with runtime SHA and image identity
> unchanged?

The source authorities are deliberately independent:

- `EARLY_FIELD_ENABLED` + `EARLY_FIELD_MEMBER_IDS` govern the early Living Field instrument.
- `HOUSE_STUDIO_H1_ENABLED` + `HOUSE_STUDIO_H1_MEMBER_IDS` govern the H1 House → Writer's Studio crossing.

`lib/access/__tests__/monotonicIndependentGates.test.ts` walks the full admission graphs and
rejects cross-gate imports, foreign env reads, route/hook substitution, transitive coupling,
intermediate-file coupling and computed env access.

## 2 · Preflight

Immediately before R4, the founder ran the privacy-safe preflight. It emitted no member ids or names:

```text
runtime=d4655e647
h1_enabled=true
early_enabled=true
h1_count=4 early_count=4 same_set=true
h1_set_digest=7ccaca1d6a0d0183b6cc063716bd4b7ef981b323a4c572bdaf323164bc50bb2c
early_set_digest=7ccaca1d6a0d0183b6cc063716bd4b7ef981b323a4c572bdaf323164bc50bb2c
deploy_lock=clear
active_h1_sessions_last_15m=0
restarts=0 health=healthy
```

This established a quiet window, exact set equality at the start of the witness, and healthy runtime.

## 3 · Locked transition

The witness acquired the production deploy lock:

```text
[deploy-lock] acquired /home/soullab/MAIA-SOVEREIGN/.deploy.lock
entry: H1-R4 gate-independence witness
```

Pre-state:

```text
PRE runtime=d4655e647
image=sha256:d8dbc4b2f1226a25a485e9bdbf509f948d20188414246d867328ee19ec2739ab
h1=true
early=true
restarts=0
health=healthy
```

A timestamped backup was created:

```text
/home/soullab/MAIA-SOVEREIGN/.env.production.h1-r4-20261002T125301Z.bak
```

The complete environment delta was exactly one line:

```diff
-HOUSE_STUDIO_H1_ENABLED=true
+HOUSE_STUDIO_H1_ENABLED=false
```

No cohort list, Early Field setting, source file, image, migration or database state was changed.

## 4 · T1 — H1 closed while Early Field stayed open

Only the `maia` service was force-recreated from the already-current production image.
No build and no migration ran.

```text
T1_CLOSED runtime=d4655e647
image=sha256:d8dbc4b2f1226a25a485e9bdbf509f948d20188414246d867328ee19ec2739ab
h1=false
early=true
restarts=0
health=healthy

quadrant=EARLY_FIELD_OPEN__H1_CLOSED
```

This is the previously unwitnessed production quadrant.

## 5 · T2 — restore

Within the same deploy-lock lifetime, the backup was restored and only `maia` was recreated.

```text
T2_RESTORED runtime=d4655e647
image=sha256:d8dbc4b2f1226a25a485e9bdbf509f948d20188414246d867328ee19ec2739ab
h1=true
early=true
restarts=0
health=healthy

R4_PASS
```

The witness therefore closed with the pre-state restored.

## 6 · Source/test corroboration

A fresh focused run after the witness produced:

- `monotonicIndependentGates.test.ts`: PASS
- `earlyFieldAccess.test.ts`: PASS
- `houseStudioH1Access.test.ts`: 1 stale structural assertion failure, 63 other tests PASS

The failing structural assertion expects:

```text
const houseStudioH1Admitted = canUseHouseStudioH1(member.id);
```

Current source is stricter:

```text
const houseStudioH1Admitted = !cabinOffline && canUseHouseStudioH1(member.id);
```

That inherited assertion drift is not evidence against R4 independence; it should be repaired
as a separate test-maintenance act rather than hidden or folded into this witness.

## 7 · Later state movement: founder H1 admission

After R4 had completed and released its lock, a separate Writer's Studio access lane widened
the H1 allowlist from 4 to 5 by adding the authenticated founder account. It then recreated
`maia` from the same production image.

Current post-widening witness:

```text
runtime=d4655e647
h1=true
early=true
h1_count=5
early_count=4
created=2026-10-02T12:53:45.46680953Z
restarts=0
health=healthy
image=sha256:d8dbc4b2f1226a25a485e9bdbf509f948d20188414246d867328ee19ec2739ab
```

An authenticated founder-session call subsequently returned:

```json
{"status":200,"body":"{\"admitted\":true}"}
```

This later widening does not invalidate the completed R4 witness. It does mean the two production
cohorts are no longer the same set after 12:53:45Z.

The widening shell did not call `acquire_deploy_lock`; it used a bare env-only compose recreate.
That is governance debt and must not be rewritten as a governed deploy-lane act after the fact.

## 8 · Conclusion

R4 establishes, on the exact production runtime and image:

1. Early Field can remain OPEN while H1 is CLOSED.
2. H1 can then be restored OPEN without changing Early Field.
3. Runtime SHA, image identity and health remain invariant across the two H1 transitions.
4. The independent-gates source guard passes.
5. The later 5-member H1 state is a separate founder-admission transition, not part of R4.

**R4 verdict: PASS.**

The historical R3 transition is superseded for execution. Future H1 witnesses must start from
the then-current H1 population and may not assume H1 and Early Field have identical cohorts.
