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
M2b database/migrations/20260913000003_disclosure_gesture_authorize_sections.sql
    ⭐ RULED: `authorize_sections` · separate migration, ⛔ not folded into M2

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

### ⭐ AMENDED 2026-09-13 — the judgment call was WRONG, and better than expected

The first candidate refused non-cascade deletion with a **static guard**, on the
reading that a DELETE trigger strict enough to stop pruning would also break
lawful Work deletion. ⛔ That reading is withdrawn. PostgreSQL draws the
distinction exactly:

```text
BEFORE DELETE on a child
  parent still present  → direct / pruning DELETE → REFUSE
  parent already gone   → lawful parent cascade   → ALLOW
```

So both tables now carry database guards, plus **BEFORE TRUNCATE refusals** —
without which `TRUNCATE ask_authorization_consumptions` would bypass every
row-level guard and resurrect every live authorization at once.

⚠️ **G2's claim narrows accordingly**: it proves only that *ordinary repository
code contains no deletion path*. ⛔ It no longer bears the constitutional
guarantee alone. A row trigger cannot defeat the database owner and does not
pretend to — privileged schema mutation stays governance territory.

## 4 · THE GUARDS, AND WHY THEY EXIST

V2 was chosen because permission must be *hard to represent*. **A structure
nobody checks decays into prose**, so five guards check it:

```text
G1  the act table declares none of: authorized · may_cross · consent ·
    section_id · section_ref · scope_kind
G2  no DELETE on the substrate in lib/ app/ scripts/   ⚠️ defence in depth only
G3  the claim is ON CONFLICT DO NOTHING · no FOR UPDATE · no transaction()
G4  completion_ref is not a foreign key · completed_at exists
G5  M2 adds exactly one boundary value and touches no other vocabulary
G6  M2b adds exactly one gesture value and touches no other vocabulary
G7  both tables carry BEFORE DELETE + BEFORE TRUNCATE guards, and the DELETE
    predicate is a PARENT-EXISTENCE test rather than a manifest or a flag
```

⭐ **Every scan strips comments first — the C21 lesson applied before it could
bite.** M1 deliberately documents the forbidden column names so a future reader
knows their absence is intentional; a scanner reading raw source would fail the
file for stating its own compliance.

## 5 · EVIDENCE

```text
GUARDS                    7 / 7 pass
FROZEN TYPECHECK          PASS
FROZEN MATRIX             LETHAL · DISCRIMINATING · reference clean
FROZEN FILES vs 2255b60d  git diff --stat → EMPTY
SUBSTRATE TYPECHECK       resolves everything except `pg`
```

⚠️ **`Cannot find module 'pg'`** is this container having no project
`node_modules`, not a defect in the code. ⛔ It is **not** reported as a pass —
the founder's run with real dependencies is the evidence of record.

## 6 · ⚠️⚠️ TWO THINGS OWED BEFORE THIS CAN BE USED

### 6.1 · ⭐ CLOSED — the gesture is `authorize_sections`

> *The member explicitly authorized MAIA to read the named section set for this
> single developmental Ask.*

⛔ It is **not** consent, standing permission, passage authority, or generic
MAIA access. One gesture may yield N section-scoped receipts, each truthfully
carrying it — **the gesture names the member's act, not the count of boundaries
it caused.** Landed as its own migration (M2b), ⛔ not folded back into M2.

### ⚠️ 6.1b · A COMPLETION-SEMANTIC DEFECT, FOUND IN REVIEW AND REPAIRED

The first `recordCompletion()` carried `AND completed_at IS NULL`, so an
already-completed row **never reached the monotonic trigger**. Three different
situations therefore produced zero rows and were indistinguishable to a `void`
return:

```text
same completion again          → 0 rows
DIFFERENT completion           → 0 rows   ⛔ a contradiction, silently swallowed
no consumption at all          → 0 rows
```

⭐ The safety invariant survived — no second completion was possible — **but the
substrate did not truthfully distinguish the outcomes it claimed to
distinguish.** Repaired: the predicate is dropped, `COALESCE` preserves the
original timestamp, the trigger adjudicates, and the prior state is read in the
same statement so one snapshot answers both questions. `recordCompletion()` now
returns `recorded | already | conflict | no_consumption`.

> ⛔ *Nothing happened* must never masquerade as *completion recorded.*

### 6.2 · The merge itself is a schema-deploy authorization

⛔⛔ Both migrations are **candidates on a non-canonical branch**. By the
2026-09-07 finding, merging them to `clean-main-no-secrets` means *the next
unrelated full deploy applies them*. **Do not merge ahead of W-A and W-B.**

---

## Standing

```text
CLASS-B FREEZE       INTACT @ 2255b60d · verified by diff, typecheck and matrix
M1 · M2 · M2b · M3   CANDIDATE · non-canonical branch · AMENDED per review
GUARDS               7 / 7
GESTURE VALUE        ⭐ RULED `authorize_sections` · M2b landed
W-A DB CONCURRENCY   ⭐ DISCHARGED 2026-09-13 · witness b68eb10d
                     8 connections · 1 claim · 7 losers · 1 consumption row
                     foreign + expired produced NO ROW AT ALL
W-B CRASH/RECOVERY   ⭐ DISCHARGED 2026-09-13 · all six PASS:
                     1 claimed · died · no completion → interrupted, zero crossings
                     2 completed · response lost → same completion identity
                     3 completed · outcome deleted → completion fact survives
                     4 unclaimed · expired → cannot claim, zero consumption
                     5 delete custody → direct deletes REFUSED, lawful cascade removes both
                     6 completion monotonicity → same idempotent · different REFUSED ·
                       unclaimed cannot falsely report completion recorded
ROUTE INTEGRATION    ⛔ NOT AUTHORIZED
MERGE                ⛔ NOT AUTHORIZED — merge is schema-deploy authorization
DISPOSITIONS         S3-M_PHASE_DISPOSITIONS_2026-09-14.md — substrate
                     typecheck allowance TAKEN · insertOne finding HANDED ON ·
                     conflict logging = named route-integration obligation
PRODUCTION           UNTOUCHED
```
