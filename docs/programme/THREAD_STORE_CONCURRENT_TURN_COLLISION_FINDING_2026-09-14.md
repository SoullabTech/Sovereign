# FINDING · CONCURRENT TURNS ON ONE ASK THREAD COLLIDE ON `ask_turns_pkey`

**Found** 2026-09-14, in the S3 route-integration witness `e5241151` (case R6).
**Routed out of `S3-DESIGN-01` by founder ruling the same day.**

⛔ **NO LANE IS OPENED HERE. NO REPAIR IS AUTHORIZED.**

---

## The observation

Two concurrent ACT-3 requests on one Ask thread: one succeeded; the other
returned **HTTP 500** rather than a legible refusal. Root cause read from the
shadow: a **duplicate key on `ask_turns_pkey (thread_id, turn_index)`** for the
**author** turn.

`appendTurn` computes the index inside its own statement:

```sql
COALESCE((SELECT MAX(turn_index) + 1 FROM ask_turns WHERE thread_id = t.id), 0)
```

Two statements running concurrently can compute the same index; the primary key
refuses the second. ⭐ The refusal is CORRECT — append-only ordering is being
defended by the database, exactly as designed. What is wrong is only the
**surface**: an unhandled exception where a legible refusal belongs.

## Why it is not an S3 defect, stated precisely

- It occurs **before the authority claim** — the colliding row's `speaker` is
  `author`, appended ahead of any `claimAct`.
- The statement is **byte-identical to `8e5da279`**. The atomic repair changed
  only *which client* executes it, never the SQL.
- It **does not falsify R6's proposition**: exactly one request reached body,
  with 1 body read, 1 crossed receipt, 1 MAIA turn, 1 consumption, 1 cognition.
- ⛔ Nothing about disclosure authority, consumption, crossing or completion is
  implicated.

⭐ *The lane that finds a defect does not thereby own it.*

## Scope, for whoever picks this up

⚠️ It is **not S3-shaped**. `appendTurn` serves every Ask lane — structure and
developmental alike — so any change here changes behaviour for all of them. That
is the reason it was refused as an opportunistic fix inside a bounded repair, and
the reason it needs its own act rather than a follow-on commit.

Open questions, ⛔ none of them answered here:

1. Should a second concurrent turn on one thread be **refused legibly** (a
   conflict the surface can render) rather than surfacing as a 500?
2. Is a retry ever lawful, or is a colliding turn always the caller's to resolve?
   ⛔ A silent retry that renumbers the turn would make append order depend on
   scheduling.
3. Does anything else rely on `MAX(turn_index) + 1` in the same way?

## Standing

```text
FINDING                 RECORDED
LANE                    ⛔ NOT OPENED
REPAIR                  ⛔ NOT AUTHORIZED
S3                      UNAFFECTED · CLOSED on its own terms
PRODUCTION              UNTOUCHED
```
