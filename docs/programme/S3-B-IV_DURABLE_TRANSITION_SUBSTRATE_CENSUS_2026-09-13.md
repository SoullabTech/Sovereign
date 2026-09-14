# S3 B-IV · DURABLE TRANSITION SUBSTRATE CENSUS — READ-ONLY

**Lane** S3-DESIGN-01 · B-iv, opened by founder 2026-09-13
**Frozen law** Class-B freeze @ `2255b60d`
**Date** 2026-09-13

> The question is no longer *what should S3 mean* — that is frozen. It is:
> ⭐⭐ **what is the smallest durable mechanism capable of satisfying the frozen
> law under real concurrency, crash, replay and recovery?**

⛔ **No table chosen. No migration authored. No schema designed.** Repository
truth only — ⛔ **no live or shadow database was read.**

---

## 1 · INVENTORY

### 1.1 · ATOMIC CLAIM — ⭐ exactly ONE in the repository

```text
lib/auth/googleOAuthState.ts
  UPDATE … SET consumed_at = NOW()
   WHERE state = $1 AND consumed_at IS NULL AND expires_at > NOW()
  RETURNING member_id
```

⭐ A grep for conditional single-use claims (`consumed_at IS NULL` /
`used_at IS NULL` / `redeemed_at IS NULL`) across `lib/**` returns **that file
and its test, and nothing else.** The pattern S3 needs exists **once**, in auth,
and nowhere in the manuscript or disclosure lanes.

### 1.2 · ACT IDENTITY — ⛔ no precedent

Nothing in the repository models *an unfinished member act* as a first-class
durable object. The nearest neighbour is `lib/coachField/invitation.ts`, which
takes `FOR UPDATE` on an invitation row precisely so a concurrent accept cannot
double-spend it — ⚠️ **an invitation, not an authorization act**, and its
identity is the invite, not the gesture.

⭐ This is the census's confirmation of the freeze's own lesson: **act identity
has to be constituted; it cannot be borrowed.**

### 1.3 · IDEMPOTENCY — two, both first-write-wins

```text
context_disclosure_receipts   disclosure_id TEXT NOT NULL UNIQUE
                              INSERT … ON CONFLICT (disclosure_id) DO NOTHING
                              ⭐ MintOutcome refuses to let idempotency become
                                authority

runtime_consent_state         request_id TEXT NOT NULL UNIQUE
                              immutable by trigger · first write wins
```

### 1.4 · ⭐⭐ DURABLE COMPLETION IDENTITY — one precedent, and it is the right one

```text
email_delivery_attempts (20260825000001)
  state               attempting | accepted | indeterminate | refused
  settled_at          NULL while in flight
  provider_message_id present IFF state='accepted'
```

⭐ Its own migration comment states S3's lost-response problem in another
domain, in advance:

> *"NULL long after created_at is itself a finding: the process died between the
> provider call and the outcome write."*

and

> *"'exception' is indeterminate because a transport throw may have died AFTER
> the provider received and acted on the request. Calling that refused asserts
> knowledge we do not have, in exactly the case where a duplicate send is most
> likely."*

⭐⭐ **That is Ruling 6 reasoned out independently, by a different lane, about a
different boundary.** `provider_message_id` is a **durable completion identity
issued by the act's effect, not by the request** — the closest thing the
repository has to `completion_ref`.

### 1.5 · TRANSACTIONAL CROSSING — isolation is per-callsite, not a helper property

```text
lib/db/postgres.ts · transaction()
  pool.connect() → BEGIN → callback → COMMIT
  ⛔ ordinary BEGIN · READ COMMITTED · NO row lock · no isolation argument
```

⚠️ **This is the exact fact that defeated the Circles candidate `093379e8d`** —
a read and a write inside `transaction()` are not serialized against each other.
A caller wanting more must ask: `lib/manuscript/development/capture.ts` issues
`SET TRANSACTION ISOLATION LEVEL REPEATABLE READ` explicitly, and locks the
draft row `FOR UPDATE`.

⭐ **So S3 cannot inherit atomicity from the helper. Whatever it chooses, it
chooses explicitly and proves.**

### 1.6 · RECOVERY — one model, and it is a sweep

```text
vault_erasure_queue (20260907000001)
  attempts int · last_attempt_at · last_error (ERRNO only, ≤32 chars)
  rows REMOVED on success
  ⛔ "a row here means an erasure is in progress, not that one occurred;
      this table is not an audit log"
```

⚠️ **A sweep model, not a completion model.** It can retry forever and records
no outcome identity — ⛔ unusable as-is for S3, where a completed act must stay
recoverable. It is, however, the repository's only worked example of
*re-entrant work after a crash* and of **errno-only failure recording** (the
message is refused because it would embed the path).

### 1.7 · REQUEST CORRELATION

```text
runtime_consent_state.request_id UNIQUE
  ← context_disclosure_receipts.request_ref REFERENCES it
```

⛔ Present, resolvable, and **constitutionally disqualified as identity** by the
frozen law (S3-F2 · DC-2). Useful for correlation and audit; never for claim.

### 1.8 · SECTION RECEIPT CARDINALITY

```text
context_disclosure_receipts.section_ref  TEXT, SINGULAR
  CONSTRAINT … CHECK (section_ref IS NULL OR scope_kind = 'section')
  + refused in the application before the CHECK is reached
```

⭐ Ruling 5's `consumption → receipts 1:N` is already **enforceable** by this
shape: N rows, each singular. ⛔ Its `boundary` CHECK still admits only
`writers_studio.focus->maia_cognition` — widening remains its own governed act.

### 1.9 · ⭐ CRASH / INCOMPLETE REPRESENTATION — two, and they agree

```text
email_delivery_attempts   'attempting' = in flight OR the process died before
                          writing an outcome
                          'indeterminate' = outcome genuinely unknown

context_disclosure_receipts  'attempted' = A CROSSING MAY HAVE OCCURRED AND WAS
                             NOT CONFIRMED · ⛔ never "nothing crossed"
                             "no withheld state: it would assert a negative the
                             database cannot prove"
```

⭐⭐ **Two independent lanes reached the same law: a system may not represent
"did not happen" when it only knows "was not confirmed."** S3's `interrupted`
inherits directly from it.

### 1.10 · LOCKING / CAS

```text
FOR UPDATE                 widespread (manuscripts, structure, drafts, channels,
                           streaks, coach invitations, supervision, proposals)
FOR UPDATE SKIP LOCKED     2 worker queues (EmbeddingQueueService,
                           SupervisionStore)
REPEATABLE READ            explicit, capture.ts only
pg_advisory_lock           ⛔ none found in lib/**
compare-and-set            ⛔ one (§1.1)
```

### 1.11 · CLEANUP / EXPIRY

```text
google_oauth_state.expires_at        operational TTL, part of the claim predicate
context_disclosure_receipts          ⛔ NO TTL, no pruning, by constitution;
                                     "a future audit-retention limit must be
                                     separately ratified"
```

⛔ Expiry is admitted here only as operational hygiene. ⛔ It is never authority
semantics, and a claim predicate that reads `expires_at` must not be mistaken
for one.

---

## 2 · ⭐⭐ THE DECISIVE FINDING

Every primitive the frozen law needs exists somewhere in this repository.
**No single object combines the three that matter**, and the two strongest
precedents sit on **opposite sides of the gap**:

```text
googleOAuthState          atomic claim ✅   completion identity ⛔
                          knows THAT it was consumed, never what it became

email_delivery_attempts   completion identity ✅   atomic claim ⛔
                          knows what the act became, never who won the right
                          to perform it
```

> ⭐ **S3's substrate is the join of those two precedents over an act identity
> that does not yet exist.** That is a smaller statement than "design a table",
> and it is the actual shape of the remaining work.

---

## 3 · WHAT THIS CENSUS REFUSES TO DECIDE

```text
⛔ the table
⛔ whether claim is CAS or FOR UPDATE
⛔ whether completion identity is a column, a row, or a foreign key
⛔ TTL values
⛔ the boundary-vocabulary widening
⛔ whether one table or two
```

⭐ All six are the B-iv **design** act, which the founder has not opened. This
census exists so that act is *derived from what exists* rather than assumed from
the reference double — which the freeze prohibits copying forward.

---

## 4 · OWED BY B-iv, NAMED NOW

```text
⭐ A REAL CONCURRENCY WITNESS against the chosen mechanism.
   S3-F1 is proved at model level ONLY; the frozen suite cannot see a database.
   ⛔ The freeze does not prejudice which mechanism that is.
```

---

## Standing

```text
B-IV SUBSTRATE CENSUS   COMPLETE · READ-ONLY · repository truth only
                        ⛔ no live or shadow database read
ATOMIC CLAIM            1 precedent · COMPLETION IDENTITY 1 precedent
                        ⛔ act identity 0 precedents
STORAGE DESIGN          NOT TAKEN
MIGRATION               NOT AUTHORIZED
DB ATOMICITY WITNESS    OWED
CLASS-B FREEZE          INTACT @ 2255b60d
PRODUCT SOURCE          UNCHANGED
PRODUCTION              UNTOUCHED
```
