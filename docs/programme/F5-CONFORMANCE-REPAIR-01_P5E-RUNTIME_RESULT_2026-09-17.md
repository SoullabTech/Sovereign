# F5-CONFORMANCE-REPAIR-01 · P5-E RUNTIME REHEARSAL — RESULT

**Date:** 2026-09-17
**Authority:** `F5-CONFORMANCE-REPAIR-01_P5E-RUNTIME_FOUNDER_AUTHORIZATION_2026-09-17.md`

```text
R1 MIGRATION APPLICATION        PASS
SYNTHETIC PRE-ERASURE SEED      FAIL
EXECUTOR REHEARSAL              NOT RUN
GOVERNED RESTORE REHEARSAL      NOT RUN
P5-E VERDICT                    RETURN / STOP
ROLLOUT READINESS               NOT EARNED
PRODUCTION / STAGING            UNTOUCHED
```

## 1 · Returned defect

`account_erasure_circle_state_fence()` is attached to three relations with different row schemas. Direct `NEW.shared_by` / `NEW.member_id` field access is not safe in one shared PL/pgSQL record-shaped trigger. A lawful synthetic Circle membership insert therefore fails before erasure can even be exercised.

This is distinct from R1. R1 correctly repaired *which relations receive the generic fence*. The new defect is inside the dedicated Circle special-state fence.

## 2 · Next bounded repair

```text
P5-D-R2 · CIRCLE FENCE RECORD-SHAPE
```

R2 must prove at minimum:

1. ordinary pre-erasure inserts into all three Circle relations succeed when no erased-member tombstone exists;
2. the shared/special trigger never references a field absent from the current relation shape;
3. active share, live inquiry response, and active membership remain refused for an erased member outside the governed restore lane;
4. governed restore still projects the three lawful historical states: `revoked`, `withdrawn + payload null`, and `left`;
5. fresh canonical bootstrap + full migration run remain green;
6. only after those pass may P5-E resume executor and restore rehearsal.

## 3 · Standing

```text
P5-A      COMPLETE
P5-B      COMPLETE
P5-C      COMPLETE
P5-D      CANDIDATE · R2 REQUIRED
P5-D-R1   CLOSED / PASS
P5-E      RETURNED AT SYNTHETIC RUNTIME SEED

P5-D-R2   CLOSED · NEW FOUNDER CONTINUATION REQUIRED
P5-E executor rehearsal          CLOSED
P5-E governed restore rehearsal  CLOSED
CANONICAL MERGE / DEPLOY         CLOSED
PRODUCTION                       UNTOUCHED
```
