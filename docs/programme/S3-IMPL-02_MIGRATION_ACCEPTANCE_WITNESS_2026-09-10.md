# S3 · P1 — migration acceptance witness

```text
SUBJECT     20260910000001_pending_ask_claims.sql              ADDITIVE
            20260910000002_context_disclosure_boundary_developmental.sql
                                                              ALTERS A CHECK
INSTRUMENT  scripts/witness/s3-migration-acceptance.ts
DATABASE    disposable PostgreSQL 16.13 cluster · created and destroyed for
            this run · ⛔ production untouched
RESULT      25 passed · 0 failed · exit 0
```

⚠️ **SCOPE, STATED HONESTLY.** The subject is those two migrations. Their
ancestors — `runtime_consent_state`, `deletion_manifests`,
`provenance_tombstones`, `members`, `member_manuscripts`, `ask_threads` — are
stood up minimally, the first three verbatim from
`20260718000001_s5_provenance_substrate.sql`, because running the whole
historical chain would witness other lanes' migrations rather than these. ⛔ **So
this run says nothing about the health of anything but these two.**

---

## The run, verbatim

```text
PASS  A1      ancestors + receipts substrate rebuilt on an empty schema
PASS  A2      pending_ask_claims applies to a fresh database
PASS  A3      a production-shaped Focus receipt exists before the widening
PASS  A4      the boundary widening applies with existing rows present
PASS  B1      columns: completed_at, consumed_at, created_at, expires_at, manuscript_id, member_id, observation_key, reading_id, ref, thread_id
PASS  B2      no permission-bearing column exists
PASS  B3      expires_at must follow created_at
PASS  B4      a low-entropy ref is refused
PASS  B5      a completion cannot exist without the claim that produced it
PASS  C1      the atomic claim wins once
PASS  C2      a second claim matches no row
PASS  C3      a consumed claim can never return to pending
PASS  C4      the Ask binding cannot be re-pointed
PASS  C5      completion is recorded once
PASS  C6      an expired resume cannot be claimed
PASS  D1      the pending migration re-applies without error
PASS  D2      rollback rehearsed: 2 row(s) discarded, table rebuilt clean
PASS  E1      the pre-existing Focus receipt survived the widening
PASS  E2      its meaning is unchanged: boundary=writers_studio.focus->maia_cognition state=attempted scope=section
PASS  F1      the developmental boundary value is now accepted
PASS  G1      an unrelated boundary value is still rejected
PASS  H1      new Focus receipts are still admitted
PASS  I1      narrowing FAILS while a developmental receipt exists — evidence is not disposable
PASS  I2      rollback succeeds while no developmental receipt has ever been written
PASS  I3      once a developmental receipt exists the rollback is UNAVAILABLE — and that is correct, not a defect

25 passed · 0 failed
```

---

## What each phase established

```text
A  FRESH RECONSTRUCTION
   both migrations apply to an empty schema, and the widening applies with a
   production-shaped Focus receipt already present — so the CHECK was validated
   against existing data, not an empty table

B  pending_ask_claims · STRUCTURE
   exactly ten columns, and NONE of section_id · section_ref · sections ·
   authorized · scope_kind · disclosure_id · may_cross · consent · permission ·
   grant · body · text · prose · passage
   ⭐ a durable IDENTITY record; ⛔ never a durable PERMISSION record

C  pending_ask_claims · TRIGGERS
   the atomic claim wins once · a second claim matches no row ·
   a consumed claim never returns to pending · the Ask binding cannot be
   re-pointed · completion is recorded once · an expired resume cannot be claimed

D  IDEMPOTENCE AND ROLLBACK
   re-application is clean; the documented rollback was rehearsed and the table
   rebuilt from nothing

E  EXISTING DATA
   the pre-existing Focus receipt survived, with boundary, state and scope
   unchanged — ⭐ the widening changes what MAY BE RECORDED going forward, and
   changes the meaning of no existing row

F  the developmental value is accepted
G  an unrelated boundary value is still rejected
H  new Focus receipts are still admitted

I  THE ROLLBACK PATH
   I1 narrowing FAILS while a developmental receipt exists
   I2 narrowing SUCCEEDS while none has ever been written
   I3 ⭐ so the rollback is CONDITIONAL, and its unavailability after a real
      crossing is correct rather than a defect
```

---

## ⭐⭐ Two things the witness found by running rather than reading

**1 · The receipts table refuses a row until the tombstone ledger exists.** Its
INSERT trigger consults `provenance_tombstones` — a tombstoned receipt can never
be restored — so the ledger is a hard dependency of accepting any receipt at all.
The first draft stood up only `runtime_consent_state` and four checks failed with
`relation "provenance_tombstones" does not exist`.

**2 · ⛔ THE FIRST DRAFT OF I2 REHEARSED THE ROLLBACK BY DELETING THE
DEVELOPMENTAL RECEIPTS** — which would have proved the rollback works by doing the
one thing the migration's own note forbids: *"Delete nothing to make the
constraint fit; a receipt is not disposable."* The delete was refused by the
receipts table's governed-custody trigger, and **the refusal was right**. The
rehearsal is now conditional and honest: rollback is available only while no
developmental receipt has ever been written.

⭐ *An instrument that tests a rollback by destroying the evidence the rollback is
supposed to respect has tested the wrong thing.*

---

## Standing

```text
MIGRATION ACCEPTANCE      COMPLETE · 25/25 · disposable cluster only
pending_ask_claims        ACCEPTED as an additive durable substrate
boundary CHECK widening   ACCEPTED · existing rows valid · meanings unchanged
                          rollback CONDITIONAL and documented

PRODUCTION MIGRATION      ⛔ NOT APPLIED · NOT AUTHORIZED
SERVER-SIDE P1            CLOSED (founder, 2026-09-10)
WRITER-FACING GESTURE     NOT BUILT · next stage
D9 INTEGRATION            NOT STARTED
PHENOMENOLOGY WITNESS     UNSPENT
#1277 D9                  UNTOUCHED · DRAFT
PRODUCTION                UNTOUCHED
```
