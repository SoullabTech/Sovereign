# `C4-WITNESS-01` — LONG-SESSION RESTORE ORDERING · PROCEDURE

**Status**: ⭐ **SPECIFIED · ⛔ UNSPENT · ⛔ NOT AN AUTHORIZATION TO RUN**
**Date**: 2026-09-15 · **Programme**: AIN Continuity, step 1 (pre-Phase I)
**Boundary** **[F]**: *establish the actual long-session restore behaviour on untouched production
code; preserve the evidence; **stop**.* ⛔ **No repair in this act.**

⚠️ **Cannot be spent in the session that authored it**: no database server, no `DATABASE_URL`, no
`node_modules` in this container (`psql` client present, `pg_ctl` absent). Following the
`S3-F8-WITNESS-01` precedent, **the founder's run is the evidence of record.**

---

## 1. THE CLAIM UNDER TEST

`AIN-CONTEXT-01` **C4**, currently **derived from source and never run**:

> `app/api/conversation/turns/route.ts:69-75`, session-scoped branch:
> `SELECT … FROM conversation_turns WHERE user_id = $1 AND session_id = $2`
> **`ORDER BY created_at ASC LIMIT 100`**
> — so for a session exceeding 100 turns, restore returns the **oldest** 100 and discards the most
> recent. The cross-session branch immediately below (`:78-84`) is `ORDER BY created_at DESC`.

⭐ **A GREEN here is a good outcome, not a failure.** It removes a false finding from the record.
The witness is run to *find out*, ⛔ never to confirm — and a procedure written by the party that
authored the claim must say so explicitly.

---

## 2. SCOPE — DELIBERATELY NARROW **[F]** *"narrowly"*

| | |
|---|---|
| ✅ **C4a — IN SCOPE** | the endpoint's ordering: which 100 rows are returned for a >100-turn session |
| ⛔ **C4b — OUT OF SCOPE** | the client's `if (pgMessages.length > loadedMessages.length)` preference (`OracleConversation.tsx:3124`) selecting that set over the recency-correct `slice(-50)` localStorage cache. Needs a browser; **a separate witness** |
| ⛔ OUT | `truncateHistoryForAPI`, `MAX_API_HISTORY`, cross-session recall, any repair |

⚠️ **C4b is where the member-facing harm actually completes**, and scoping it out is a choice about
this act's size, ⛔ not a judgement that it does not matter. It is owed.

---

## 3. THE DECISIVE CHAIN — WHOLE OR NOT AT ALL

```
a disposable session exists with STRICTLY MORE THAN 100 turns
  AND every turn carries a DISTINCT, MONOTONIC created_at        ← §4 trap
  AND the fixture member resolves through the endpoint's auth     ← §5.2
        ↓
GET /api/conversation/turns?sessionId=<S>&userId=<M>
        ↓
returned_count == 100
        ↓
compare returned turn IDS against the session's true oldest-100 and true newest-100
        ↓
RED  ⟺ returned set == true oldest-100  AND  excludes the newest turn
```

⛔ **There is no partial RED.** Anything short of the whole chain is **instrument failure → no
evidence**, never a weaker finding.

---

## 4. ⭐⭐ THE FIXTURE TRAP THAT WOULD SILENTLY INVALIDATE THE RUN

> **`NOW()` in PostgreSQL returns the TRANSACTION start time, not the statement or row time.**

A natural fixture —

```sql
INSERT INTO conversation_turns (user_id, session_id, role, content, posture_at_creation)
SELECT $1, $2, CASE WHEN i % 2 = 1 THEN 'user' ELSE 'assistant' END, 'x', 'standard'
FROM generate_series(1, 150) AS i;          -- ⛔ ALL 150 ROWS GET AN IDENTICAL created_at
```

— gives every row the **same** `created_at`. `ORDER BY created_at ASC LIMIT 100` then returns an
**arbitrary** 100 rows at the planner's discretion. The run would measure **planner behaviour, not
the ordering defect**, and could yield either a false RED or a false GREEN with nothing in the
output to reveal it.

**Required**: explicitly distinct, monotonically increasing timestamps — e.g.
`NOW() - (interval '1 second' * (150 - i))`, or `clock_timestamp()` (which *does* advance within a
transaction), or one transaction per row.

**Mandatory pre-assertion, before the endpoint is called:**

```sql
SELECT count(*) AS total,
       count(DISTINCT created_at) AS distinct_ts
FROM conversation_turns WHERE session_id = $1;
-- total > 100 AND distinct_ts = total, else ⚠️ INSTRUMENT FAILURE, abort
```

⭐ This is the analogue of `S3-F8`'s null-body fixture trap: **a fixture that looks valid and
silently cannot express the distinction being measured.**

---

## 5. STOP CONDITIONS — ANY ONE VOIDS THE RUN

1. session has **≤ 100** turns — the `LIMIT` never binds; ⛔ proves nothing in either direction.
2. `distinct_ts ≠ total` (§4).
3. endpoint returns **403** — `claimMatchesOrNull(searchParams.get('userId'), memberId)`
   (`route.ts:55`) requires the query's `userId` to match the resolved member; a fixture member that
   does not resolve fails here, ⛔ which is auth, not ordering.
4. `conversation_turns` absent, or a schema constraint rejects the fixture.
5. the route is unreachable, or returns `success: false`.
6. ⚠️ **the client no longer calls this endpoint** — ACT 1 read the call at
   `OracleConversation.tsx:3110`; **confirm it rather than inherit it**, or the run measures a dead
   route.
7. any exception unrelated to the measured boundary.
8. the run touches production data (§7).

---

## 6. WHAT IS RECORDED — CONTENT-FREE BY CONSTRUCTION

⭐ **The entire result is expressible without a single authored character**, which is the test that
the record is content-free by construction rather than by carefulness:

```
session_turn_count            : int
distinct_timestamp_count      : int      (must equal session_turn_count)
returned_count                : int
returned_equals_oldest_100    : bool     (by turn id set comparison)
returned_contains_newest_turn : bool
returned_first_id_is_session_oldest : bool
returned_last_id_is_session_newest  : bool
endpoint_reachable_from_client      : bool   (§5.6)
```

⛔ **No `content`, no excerpt, no digest, no offset, no member identifier** — turn IDs are compared
as sets and reported as booleans, never enumerated into the record. Carries `AIN-CONTEXT-01`'s
**D3** discipline (*record presence, not content*) unchanged.

---

## 7. CONTAINMENT

- **Disposable shadow database only.** ⛔ Production is not read and not written.
- **Untouched production code** — the route, the query and the client are read as they stand. ⛔ No
  instrumentation that alters the measured behaviour (**D2**: *a witness that perturbs its subject
  reports on itself*).
- Fixture member and session are synthetic; ⛔ no real member's session is used, even read-only.
- Shadow destroyed after the run.

---

## 8. THREE OUTCOMES AND NO FOURTH

| Outcome | Meaning | What follows |
|---|---|---|
| ⭐ **RED** (expected) | returned == oldest 100, newest excluded | **C4 CONFIRMED.** ACT 1 §6 upgraded *derived* → *witnessed*. ⛔ Still no repair — a repair act opens separately |
| ✅ **GREEN** | the returned set includes the most recent turns | **C4 REFUTED.** ACT 1 §6 and finding **C4** amended **in place** — struck, reason recorded, ⛔ never deleted. The *"continuity without temporality"* mapping in ACT 2 §4 loses its named cause and must be re-sourced or withdrawn |
| ⚠️ **INSTRUMENT FAILURE** | any §5 stop condition | **No architectural evidence.** ⛔ Not a weak RED. Re-fixture and re-run, or report the blocker |

⛔ **In all three cases the act ends at the record.** Evidence preserved · result classified ·
**stop** · a new founder ruling before any implementation.

---

## 9. STANDING

```
C4-WITNESS-01     ⭐ SPECIFIED · ⛔ UNSPENT · ⛔ UNAUTHORIZED
C4b witness       ⛔ UNSPECIFIED, OWED (§2)
repair            ⛔ UNOPENED
```

⛔ This procedure is **not** an authorization to run it (**R6**: *proposed ≠ authorized*). Spending
it requires an explicit founder opening act whose authority is recoverable from the durable record.
