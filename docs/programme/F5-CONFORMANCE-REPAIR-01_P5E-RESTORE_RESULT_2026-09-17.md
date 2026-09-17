# F5-CONFORMANCE-REPAIR-01 - P5-E GOVERNED RESTORE REHEARSAL - RESULT

**Date:** 2026-09-17
**Authority:** `F5-CONFORMANCE-REPAIR-01_P5E-RESTORE_FOUNDER_AUTHORIZATION_2026-09-17.md`
**Subject:** `846910281623d7418a3839cf5c16a117a73191bc`

```text
FRESH BOOTSTRAP + MIGRATIONS      PASS
TARGETED PRE-ERASURE BACKUP       PASS
R3 READ-ONLY PREFLIGHT            PASS
R4 GOVERNED EXECUTOR              PASS
PRE-RESTORE ERASED STATE          PASS
GOVERNED RESTORE                  FAIL / RETURN
POST-FAIL NO RESURRECTION         PASS
P5-E VERDICT                      RETURN / STOP
ROLLOUT READINESS                 NOT EARNED
PRODUCTION / STAGING              UNTOUCHED
```

## 1 - Returned defect

The restore script correctly declares the governed restore lane before replaying a dump, but standard PostgreSQL dumps also reset the session search path to empty. P5-D restore-time trigger/helper functions rely on unqualified function/table lookup and therefore cannot execute under the dump's session authority.

This is not an absent-migration defect: `public.account_erasure_member_is_tombstoned(text)` exists. It is a dependency-resolution defect caused by mutable session `search_path`.

## 2 - Constitutional consequence

The failed restore did not resurrect the member, credentials, sessions or Circle representation. The S5 member tombstone and completed erasure act remained present. However, the governed restore path itself did not complete, so disaster-recovery anti-resurrection remains unproved end-to-end.

## 3 - Next bounded repair

```text
P5-D-R5 · RESTORE SEARCH-PATH AUTHORITY
```

R5 must, at minimum:

1. make every P5-D restore-time trigger/helper dependency independent of caller `search_path` (schema-qualified dependencies or an equivalently explicit function-level authority);
2. prove `public.account_erasure_member_is_tombstoned(text)` works with `search_path=''`;
3. prove member-row and generic member-reference fences suppress erased-member resurrection with `search_path=''` in the governed restore lane;
4. prove all three Circle state fences resolve their governance dependencies with `search_path=''` and still yield `revoked / withdrawn + payload NULL / left`;
5. replay the targeted pre-erasure dump far enough to clear the data-replay phase before P5-E governed restore may resume;
6. preserve R1-R4, runtime-authority, immutable-ledger and transaction semantics unchanged.

The failed-run mode-`0600` governance preservation tempfile is also recorded as cleanup debt. It should not be silently conflated with search-path authority; a subsequent bounded repair may close it explicitly.

This result does not authorize R5 by itself.

## 4 - Standing

```text
P5-A      COMPLETE
P5-B      COMPLETE
P5-C      COMPLETE
P5-D      CANDIDATE · R5 REQUIRED
P5-D-R1   CLOSED / PASS
P5-D-R2   CLOSED / PASS
P5-D-R3   CLOSED / PASS
P5-D-R4   CLOSED / PASS

P5-E      RETURNED DURING GOVERNED RESTORE DATA REPLAY
P5-D-R5   CLOSED · NEW FOUNDER CONTINUATION REQUIRED

complete restore witness             NOT EARNED
rollout-readiness ruling             NOT EARNED
canonical merge / deploy             CLOSED
production / staging                 UNTOUCHED
```
