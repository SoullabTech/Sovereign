# F5-CONFORMANCE-REPAIR-01 - P5-E FINAL EXECUTOR + RESTORE REHEARSAL - RESULT

**Date:** 2026-09-17
**Authority:** `F5-CONFORMANCE-REPAIR-01_P5E-FINAL_FOUNDER_AUTHORIZATION_2026-09-17.md`
**Subject:** `396d2c2cc7cee6fe100a3168ad30c363dd338029`

```text
FRESH BOOTSTRAP + MIGRATIONS      PASS
SYNTHETIC SEED                    PASS
PRE-ERASURE BACKUP                PASS
R3 READ-ONLY PREFLIGHT            PASS
EXECUTOR TRANSACTION              FAIL / CLEAN ROLLBACK
DURABLE FAILURE RECORD            PASS
GOVERNED RESTORE REHEARSAL        NOT RUN
P5-E VERDICT                      RETURN / STOP
ROLLOUT READINESS                 NOT EARNED
PRODUCTION / STAGING              UNTOUCHED
```

## 1 - Returned defect

The governed executor reached completion-evidence recording after the supported transaction work and post-state verification path, but the transaction aborted because one SQL parameter is reused across incompatible UUID and text contexts.

`recordCompletionEvidence()` uses `$1::uuid` as the act id and also uses bare `$1` as the S5 `evidence_ref` branch in the same statement. PostgreSQL binds `$1` as UUID and rejects the alternate text value `p5d-poststate-census` with SQLSTATE `22P02`.

The same pattern exists in the verification-evidence insert and must be repaired as the same defect class rather than one line at a time.

## 2 - Constitutional consequence

This failure strengthens, rather than weakens, the transaction boundary evidence:

- the synthetic member remains present;
- credentials/settings/sessions remain present;
- Circle representations remain active;
- no S5 manifest or tombstone survived;
- no frozen plan row survived;
- the durable erasure act survived outside the transaction;
- exactly one terminal `act_failed / execution_transaction_rolled_back` record exists.

No completion was falsely reported and no partial erasure survived.

## 3 - Next bounded repair

```text
P5-D-R4 · EVIDENCE REFERENCE PARAMETER TYPING
```

R4 must, at minimum:

1. make every `evidence_ref` value explicitly text-typed and independent from UUID parameter inference;
2. cover both `disposition_succeeded` and `verification_succeeded` bulk inserts, plus any terminal insert that reuses an act-id parameter as evidence text;
3. prove S5-backed rows store the act UUID as text evidence while ordinary verified rows store `p5d-poststate-census`;
4. preserve the append-only ledger, immutable plan, transaction rollback, R3 runtime authority and Circle/S5 ordering semantics unchanged;
5. rerun the synthetic executor to durable `act_completed` before P5-E restore rehearsal may resume.

This result does not authorize R4 by itself.

## 4 - Standing

```text
P5-A      COMPLETE
P5-B      COMPLETE
P5-C      COMPLETE
P5-D      CANDIDATE · R4 REQUIRED
P5-D-R1   CLOSED / PASS
P5-D-R2   CLOSED / PASS
P5-D-R3   CLOSED / PASS

P5-E      RETURNED AT EXECUTOR COMPLETION-EVIDENCE WRITE
P5-D-R4   CLOSED · NEW FOUNDER CONTINUATION REQUIRED

restore rehearsal                  NOT RUN
rollout-readiness ruling           NOT EARNED
canonical merge / deploy           CLOSED
production / staging               UNTOUCHED
```
