# S3 · M1–M3 — SUBSTRATE CANDIDATE

**Shape** V2, two tables — **TAKEN** (founder, 2026-09-13)
**Frozen law** Class-B freeze @ `2255b60d` · **verified intact, see §5**
**Date** 2026-09-13

⛔ **ROUTE INTEGRATION NOT AUTHORIZED.** Nothing here is wired to the
developmental Ask. *Proving persistence and wiring the surface at the same time
makes a failure ambiguous again.*

---

## 1 · WHAT LANDED

```text
M1  database/migrations/20260913000001_ask_authorization_acts.sql
    ask_authorization_acts          write-once, UPDATE refused by trigger
    ask_authorization_consumptions  UNIQUE act_id · monotonic completion

M2  database/migrations/20260913000002_disclosure_boundary_developmental_ask.sql
    exactly ONE boundary value added

M3  lib/manuscript/ask/authorizationAct.ts
    mintAct · claimAct · recordCompletion · readAct
    ⛔ no route wiring

GUARDS  tests/constitutional/s3-substrate/guards.ts  ⛔ NOT frozen-suite
        tsconfig.s3-substrate.json
        npm run typecheck:s3-substrate · npm run guards:s3-substrate
```

## 2 · THE CLAIM

```sql
INSERT INTO ask_authorization_consumptions (act_id, claim_request_ref)
SELECT a.id, $3 FROM ask_authorization_acts a
 WHERE a.id = $1 AND a.member_id = $2 AND a.expires_at > NOW()
ON CONFLICT (act_id) DO NOTHING
RETURNING act_id
```

⭐ The INSERT **is** the claim. No preceding SELECT. No row lock. No
`transaction()` — a plain BEGIN at READ COMMITTED, which is what defeated
`093379e8d`. Member binding and expiry sit in the predicate, so an act belonging
to someone else, or one whose opportunity has passed, **never produces a row to
conflict over**.

## 3 · THREE DESIGN LAWS, MADE STRUCTURAL

```text
NO STATUS COLUMN          pending / interrupted / completed are DERIVED from
                          two positive facts (a claim row; a completed_at)
                          ⛔ a stored `interrupted` would assert a negative the
                            database cannot know

completion_ref IS NOT A   an FK with SET NULL would let deleting the outcome
FOREIGN KEY               erase the completion and resurrect the act; an FK with
                          RESTRICT would defeat author sovereignty.
                          ⭐ The pointer may dangle. `completed_at` is the durable
                            fact: COMPLETED · OUTCOME NO LONGER HELD

EXPIRY IS A PREDICATE     `expires_at` is unreachable once a consumption exists.
                          ⛔⛔ no pruning may delete these rows:
                             completed → expires → pruned → no consumption
                             visible → AUTHORITY RESURRECTED
```

⚠️ **ONE JUDGMENT CALL, FLAGGED.** Deletion cascading from the Work or the
thread is permitted — once the Work is gone there is no Ask, no revision and no
body, so nothing can be resurrected. Every other deletion path is refused by a
**static guard rather than a trigger**, because a DELETE trigger strict enough to
stop pruning would also break lawful Work deletion. ⭐ Founder attention invited.

## 4 · THE GUARDS, AND WHY THEY EXIST

V2 was chosen because permission must be *hard to represent*. **A structure
nobody checks decays into prose**, so five guards check it:

```text
G1  the act table declares none of: authorized · may_cross · consent ·
    section_id · section_ref · scope_kind
G2  no DELETE on the substrate anywhere in lib/ app/ scripts/
G3  the claim is ON CONFLICT DO NOTHING · no FOR UPDATE · no transaction()
G4  completion_ref is not a foreign key · completed_at exists
G5  M2 adds exactly one boundary value and touches no other vocabulary
```

⭐ **Every scan strips comments first — the C21 lesson applied before it could
bite.** M1 deliberately documents the forbidden column names so a future reader
knows their absence is intentional; a scanner reading raw source would fail the
file for stating its own compliance.

## 5 · EVIDENCE

```text
GUARDS                    5 / 5 pass
FROZEN TYPECHECK          PASS
FROZEN MATRIX             LETHAL · DISCRIMINATING · reference clean
FROZEN FILES vs 2255b60d  git diff --stat → EMPTY
SUBSTRATE TYPECHECK       resolves everything except `pg`
```

⚠️ **`Cannot find module 'pg'`** is this container having no project
`node_modules`, not a defect in the code. ⛔ It is **not** reported as a pass —
the founder's run with real dependencies is the evidence of record.

## 6 · ⚠️⚠️ TWO THINGS OWED BEFORE THIS CAN BE USED

### 6.1 · A gesture value is still missing

`context_disclosure_receipts.gesture` admits only
`ask_maia · work_with_this · widen_focus`. The S3 act is **the member
authorizing named sections**, which is none of them.

> ⛔ **M2 alone is NOT sufficient for a live crossing.** Adding the gesture
> inside M2 would be exactly the accompanying vocabulary redesign that change was
> separated to avoid. It is a separate governed act.

### 6.2 · The merge itself is a schema-deploy authorization

⛔⛔ Both migrations are **candidates on a non-canonical branch**. By the
2026-09-07 finding, merging them to `clean-main-no-secrets` means *the next
unrelated full deploy applies them*. **Do not merge ahead of W-A and W-B.**

---

## Standing

```text
CLASS-B FREEZE       INTACT @ 2255b60d · verified by diff, typecheck and matrix
M1 · M2 · M3         CANDIDATE · non-canonical branch
GUARDS               5 / 5
GESTURE VALUE        ⚠️ OWED · separate governed act
W-A DB CONCURRENCY   OWED — independent connections racing one act
W-B CRASH/RECOVERY   OWED — four cases: interrupted · lost response ·
                     outcome deleted · unclaimed+expired
ROUTE INTEGRATION    ⛔ NOT AUTHORIZED
MERGE                ⛔ NOT AUTHORIZED — merge is schema-deploy authorization
PRODUCTION           UNTOUCHED
```
