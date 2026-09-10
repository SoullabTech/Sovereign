# S3 implementation lane · `pendingAskRef` substrate census

```text
SUBJECT     canonical c509976b5
MODE        READ-ONLY · no source change · no migration · no test
QUESTION    Can an existing canonical object carry the pendingAskRef contract?
DECISIVE    Can two concurrent or replayed ACT 3 requests both get past
            consumption?  If yes, that representation FAILS.
AUTHORIZED  founder, 2026-09-10, as the first act of the Class B lane
```

⛔ **A candidate passes only if the answer is NO by executable construction** —
across separate requests and processes — ⛔ **never because application code
happens to check first.**

---

## 1 · THE THREE PROPERTIES, KEPT SEPARATE

```text
continuity recognition   "is this the Ask?"
atomic claim             "I am the ONE invocation allowed to resume it"
completion state         "did that claimed invocation complete the crossing?"
```

⭐ **Atomic uniqueness is evidence of a concurrency pattern, not yet evidence of
single-consumption semantics.** A primary key that forces one competing insert to
lose proves the database can arbitrate a race; it does not prove anything encodes
`pending → consumed` for exactly one unfinished Ask.

**And the ordering requirement is part of the contract.** The losing invocation
must fail **before**:

```text
establishDisclosureBoundary · may_cross · loadRevisionContent · completed receipt
```

⛔ A mechanism could mark an Ask consumed atomically **after** two callers had
already crossed the sensitive seam. **That is atomic bookkeeping after the
constitutional event, and it is useless.**

---

## 2 · THE INVALID AND VALID SHAPES

```text
⛔ INVALID
   SELECT pending
   if pending: UPDATE consumed

✅ VALID
   atomic mutation whose predicate INCLUDES "still pending"
   → exactly one caller can win
   → every competitor loses before boundary establishment
```

⭐ Same law the founder applied to `joinWithInviteWithClient` on 2026-09-07: *the
authority is the MUTATION, not a precheck.*

---

## 3 · CANDIDATES, MEASURED

### 3.1 · `ask_threads` — ⛔ FAILS on identity granularity

`20260901000001_ask_threads.sql`. Columns: `id · manuscript_id · member_id ·
anchor · reading_identity · canonical_at_open · initiated_by · opened_at`.

```text
⛔ NO state column of any kind
⛔ WRONG GRANULARITY — a thread carries MANY Asks (many ask_turns pairs).
   "This thread" cannot name "this one unfinished Ask".
⚠️ ask_threads_freeze() names specific columns, so a NEW column would be
   mutable — but a mutable column on the wrong object is still the wrong object.
```

⭐ **This independently confirms the ruling that `threadId` is not enough**, and
for a reason stronger than single-use: **the granularity is wrong before
concurrency is even reached.**

### 3.2 · `ask_turns` — ⛔ FAILS by construction

```sql
CREATE TRIGGER ask_turns_no_update BEFORE UPDATE ON ask_turns
  FOR EACH ROW EXECUTE FUNCTION ask_turns_append_only();
-- RAISE EXCEPTION 'ask turn %/% is append-only'
```

⛔ **UPDATE is refused unconditionally.** `ask_turns` cannot carry a
`pending → consumed` transition at all.

⭐ Its concurrency pattern is real and worth naming precisely: `turn_index` is
computed **inside** the INSERT (`COALESCE((SELECT MAX(turn_index)+1 …), 0)`) with
`PRIMARY KEY (thread_id, turn_index)` refusing the loser. **That is atomic
arbitration producing unique turn numbers.** ⛔ It is not a state transition, and
it does not become one by being adjacent to the Ask.

**Measured, not assumed: atomic uniqueness ≠ single-consumption semantics.**

### 3.3 · `isHeldRetry` — ⛔ NOT EVIDENCE ABOUT REPLAY

`lib/manuscript/ask/retry.ts`, called at the route. A pure comparison of the
incoming question against prior turns, deciding whether to append. **It
transitions no state and consumes nothing.**

⭐ Relevant to **continuity recognition** only. ⛔ Silent on the atomic claim.

### 3.4 · `context_disclosure_receipts` — ⚠️ RIGHT MECHANISM, WRONG SEAM

```sql
INSERT INTO context_disclosure_receipts (…)
VALUES (…) ON CONFLICT (disclosure_id) DO NOTHING RETURNING id
```

⭐ **This IS an atomic insert-once claim**, and the loser's outcome already
refuses: `{ kind:'existing', state:'attempted'|'crossed' }` — and
`mayCross` admits `'minted'` only. *"An `attempted` receipt is ambiguous by
constitution … Neither is fresh authority."*

⛔ **But it fails the ordering requirement.** The claim happens **inside**
`establishDisclosureBoundary`, so a losing invocation fails *during* boundary
establishment, not *before* it. The contract requires the competitor to lose
earlier.

⛔ **And it would conflate two identities.** `disclosureId` is minted fresh per
member act by design; deriving it from `pendingAskRef` to obtain the collision
would make the disclosure identity a function of the pending identity — exactly
the coupling P1 §10.6 forbids.

⭐ **Recorded as the closest existing mechanism, and refused on placement**, not
on mechanism.

### 3.5 · ⭐⭐ `google_oauth_state` / `consumeOAuthState` — THE EXACT VALID SHAPE

`lib/auth/googleOAuthState.ts:83-95`, table `20260907000001_google_oauth_state.sql`:

```sql
UPDATE google_oauth_state
   SET consumed_at = NOW()
 WHERE state = $1
   AND consumed_at IS NULL        -- ⭐ "still pending" IS the predicate
   AND expires_at > NOW()         -- ⭐ bounded lifetime, same statement
RETURNING member_id
```

```ts
if (claimed.rows.length === 1) { /* the one winner */ }
```

⭐ **The module's own header already rejects the invalid shape, in this
repository, for this reason:**

> *"SELECT-then-UPDATE would leave a window where a replayed callback races the
> original and both store tokens."*

⭐ **And it keeps three refusals distinct** — `replayed` · `expired` · `unknown`
— *"they warrant different responses and must not look alike in the logs."* That
maps directly onto P1's need to distinguish **ALREADY-CONSUMED** from **expired**
from **unknown**, rather than collapsing them into one failure.

**The table carries identity and lifecycle, and NO permission:**

```text
state PRIMARY KEY · member_id · created_at · expires_at · consumed_at · initiated_ip
```

⛔ **`consumed_at` is kept rather than the row deleted, so a replay attempt is
VISIBLE.** Same discipline as the delivery ledger's idempotency key.

⛔ **This is the PATTERN, not the table.** S3 must not reuse `google_oauth_state`
— it is an auth-flow substrate with its own custody answers.

---

## 4 · VERDICT

```text
ask_threads                    ⛔ FAILS · wrong granularity · no state
ask_turns                      ⛔ FAILS · UPDATE refused by trigger
isHeldRetry                    ⛔ NOT EVIDENCE · continuity only
context_disclosure_receipts    ⚠️ right mechanism, WRONG SEAM + identity coupling
google_oauth_state pattern     ⭐ the valid shape — as PRECEDENT, not as substrate
```

> **NO EXISTING CANONICAL OBJECT CAN CARRY THE `pendingAskRef` CONTRACT.**

⭐ Under the founder's ruling that is a permitted outcome: *"If none can, then a
dedicated opaque pending-Ask reference is permitted, but its design must remain
non-authoritative."*

**The shape indicated by canonical precedent** — ⛔ **NOT AUTHORIZED HERE, and no
migration is authored:**

```text
identity          opaque, high-entropy, meaningless alone
member binding    member_id
Work binding      manuscript_id
Ask binding       enough NON-PROSE state for server re-derivation
                  (the anchor's coordinates — readingId, observationKey —
                   NOT the requirement, NOT the section set, NOT prose)
lifecycle         created_at · expires_at · consumed_at
claim             UPDATE … SET consumed_at = NOW()
                   WHERE ref = $1 AND consumed_at IS NULL AND expires_at > NOW()
                   RETURNING …            ⭐ exactly one winner
refusals          consumed / expired / unknown, kept DISTINCT

⛔ NEVER          may_cross · consent · authorized = true
                  a section id as a permission claim · authored prose
```

```text
lawful durable state       "Ask 123 is pending / consumed"
prohibited durable state   "Ask 123 is authorized to read section 7"
```

⚠️ **Note on Ask binding:** storing the anchor's coordinates is storing *which
question*, not *what may be read*. The requirement and the section set are
**re-derived** at ACT 3 (P1 step 3) and must not be persisted — persisting them
is how the identity record becomes a permission record.

---

## 5 · ⚠️ TWO FINDINGS THE CENSUS SURFACED

### 5.1 · Isolation level changes the loser's failure mode

Under **READ COMMITTED** (the default for `transaction()`), the second UPDATE
blocks, re-evaluates its predicate after the first commits, and matches **zero
rows** — the clean `rows.length !== 1` loss.

⚠️ Under **REPEATABLE READ**, which `captureEvidence` explicitly sets
(`SET TRANSACTION ISOLATION LEVEL REPEATABLE READ`), a concurrent update raises a
**serialization failure** instead. That still fails closed, but it is a **thrown
error, not a zero-row result**.

⛔ **The loser must be reported as ALREADY-CONSUMED, never as a 500.** A
serialization failure surfacing as an internal error would make a correctly
refused replay indistinguishable from a broken server — and the writer would be
told something false about their own boundary, which is the same class of defect
as `BODY_UNVERIFIABLE` masquerading as authorization absence.

⭐ **Reported, not designed around.** Which isolation level the claim runs under
is an implementation decision the falsifiers must pin, not a detail.

### 5.2 · The claim must precede boundary establishment, and nothing enforces
that ordering yet

P1 places atomic consumption at **ACT 3 step 5a**, before step 6. ⛔ Nothing in
canonical enforces that ordering — it is a property of the code that will be
written.

⚠️ **This is exactly the shape of the Q4 gate question**, and it deserves the same
answer: the route decides, and a type/capability seam should make the wrong order
hard to express. **Named here so the falsifiers test the ORDER, not only the
outcome** — a test that only asserts "the second request got no answer" would pass
against an implementation that crossed twice and cleaned up afterwards.

---

## Standing

```text
SUBSTRATE CENSUS          COMPLETE · READ-ONLY
SUBJECT                   canonical c509976b5

EXISTING OBJECT           ⛔ NONE can carry the contract
DEDICATED REFERENCE       permitted by prior ruling · ⛔ NOT DESIGNED HERE
PATTERN OF RECORD         consumeOAuthState — atomic claim whose predicate
                          includes "still pending", three distinct refusals
                          ⛔ pattern only · not the table

⚠️ FINDING 5.1            isolation level decides the loser's failure mode;
                          a serialization failure must read as ALREADY-CONSUMED,
                          never as a 500
⚠️ FINDING 5.2            the claim-before-boundary ORDER is enforced by nothing
                          in canonical; falsifiers must test the order

MIGRATION                 NOT AUTHORED
SOURCE CHANGE             NONE
FALSIFIERS                NOT AUTHORED — next act, on ruling
IMPLEMENTATION            NOT AUTHORIZED

FOCUS ASSEMBLER CUSTODY   NOT A BLOCKER · separate lane · untouched
AUTHORED-STRUCTURE        separate future lane · NOT OPENED
PASSAGE DESIGN            OUT OF SCOPE
#1277 D9                  UNTOUCHED · DRAFT
FOCUS WITNESS             UNSPENT
PRODUCTION                UNTOUCHED
```

⭐ *The repository already contains the right shape, reasoned about for replay, in
an auth flow — and it is a precedent, not a substrate. What S3 lacks is not the
technique but an object of the right granularity to apply it to.*
