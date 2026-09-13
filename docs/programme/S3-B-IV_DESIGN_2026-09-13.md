# S3 B-IV · DESIGN — the durable transition substrate

**Opened** founder, 2026-09-13 · **Frozen law** Class-B freeze @ `2255b60d`
**Input** `S3-B-IV_DURABLE_TRANSITION_SUBSTRATE_CENSUS_2026-09-13.md` (`63612fa5`)

> **THESIS (ruled).** S3 joins an atomic single-consumption claim with durable
> completion recovery, keyed by a **first-class member-act identity**. Request
> identity may correlate execution; ⛔ it may never substitute for act identity.

⛔ **No migration. No table chosen by this record — two shapes are put against
the frozen law and one is RECOMMENDED for founder ruling.** ⛔ Nothing is copied
forward from the reference double.

---

## 1 · ACT IDENTITY — the object the census found missing

```text
MINTED       by the surface witnessing the member gesture (ACT 2 pause)
OPAQUE       carries no meaning a client could read or forge
STABLE       across transport retry
DISTINCT     for two gestures with byte-identical prose
BOUND        server-side to the exact pending Ask it serves
⛔ NEVER     sufficient authority
```

⭐ `request_id` stays for trace and correlation. **It does not answer *which
human act occurred*.** That separation is what keeps DC-2 from creeping back in
through a convenient existing column.

---

## 2 · ATOMICITY LAW

> **The successful database mutation IS the claim. A prior read is never the
> authority.**

```text
⛔ FORBIDDEN   SELECT unclaimed? → yes → do work → mark claimed

⭐ PERMITTED   one atomic database operation
               winner receives the claim · loser receives the existing fact
               ONLY the winner may cross
```

⛔ `transaction()` contributes no such guarantee — plain BEGIN, READ COMMITTED,
no row lock (census §1.5). B-iv establishes atomicity **explicitly** and proves
it against **real concurrent connections**. ⛔ No advisory lock: the census found
no reason to introduce one.

---

## 3 · THE TWO SHAPES

### V1 · ONE TABLE — claim state on the identity row

```text
member_authorization_acts
  id               opaque, PK
  member_id · work_id · ask binding (reading + anchor identity)
  claimed_at       NULL until claimed
  completion_ref   NULL until completed
  expires_at

CLAIM      UPDATE … SET claimed_at = NOW()
            WHERE id = $1 AND claimed_at IS NULL AND expires_at > NOW()
           RETURNING …                        ← the OAuth precedent (§1.1)
COMPLETE   UPDATE … SET completion_ref = $2
            WHERE id = $1 AND claimed_at IS NOT NULL AND completion_ref IS NULL
```

### V2 · TWO TABLES — identity immutable, consumption is a row

```text
member_authorization_acts        write-once; frozen by trigger after insert
act_consumptions
  act_id UNIQUE REFERENCES member_authorization_acts(id)
  claimed_at · completion_ref NULL

CLAIM      INSERT INTO act_consumptions (act_id)
           SELECT a.id FROM member_authorization_acts a
            WHERE a.id = $1 AND a.expires_at > NOW()
           ON CONFLICT (act_id) DO NOTHING
           RETURNING id                       ← receipts precedent (§1.3),
                                                INSERT…SELECT exactly as
                                                threadStore.appendTurn already does
COMPLETE   UPDATE act_consumptions SET completion_ref = $2
            WHERE act_id = $1 AND completion_ref IS NULL
```

### ⭐ Both derive the three states from POSITIVE facts only

```text
no claim                        → pending      (may compete for the claim)
claim, no completion            → interrupted  (⛔ no replay crossing)
claim + completion              → recovered    (the SAME completion)
```

⭐ **Neither stores an `interrupted` declaration.** Interruption is *read off*
the absence of a completion beside the presence of a claim — the founder's
preference, and the two-lane law the census found: *do not store a confident
negative the database cannot actually know.*

---

## 4 · BOTH ACCOUNT FOR EVERY FROZEN TRANSITION

| frozen transition | V1 | V2 |
|---|---|---|
| fresh act → exactly one claimant | conditional UPDATE | unique INSERT |
| concurrent duplicate → one winner | row-level atomic UPDATE | uniqueness on `act_id` |
| transport retry, same act → never another claim | `claimed_at IS NULL` fails | conflict → no row |
| separate act, same prose → independently claimable | distinct `id`; prose is not stored as identity | same |
| claimed + completed → same completion recoverable | `completion_ref` read back | same |
| claimed, no completion → interrupted, no crossing | derived | derived |
| client wider than server scope | scope re-derived server-side; not in this substrate | same |
| receipt / ref / completion → cannot authorize another act | substrate stores no permission | same |
| one act, N sections → one consumption, N receipts | one row claimed; receipts are `context_disclosure_receipts`, singular `section_ref` each | same |

⭐ **On paper both satisfy the frozen law.** The selection therefore cannot be
made on capability. It is made on **what each shape makes easy to get wrong.**

---

## 5 · ⭐⭐ THE DISCRIMINATING ARGUMENT

The §10.6 prohibited durable shape is:

```text
{ pendingAskRef, sectionId, authorized: true }
```

— *permission living on the identity row.*

```text
V1   identity and claim state share one mutable row.
     The prohibited shape is ONE COLUMN AWAY, and nothing structural refuses it.

V2   the identity row is write-once and trigger-frozen.
     Adding `authorized` to it is REFUSED BY ITS OWN TRIGGER;
     adding it to the consumption row is visibly a different object.
```

⭐ V2 also **is** the join the census described: the consumption row is the mail
lane's *attempt*, and `completion_ref` is its `provider_message_id`. V1 inherits
one precedent and reinvents the other.

⚠️ **V1's honest advantages**, stated rather than suppressed: one row, one lock
target, no orphan possible, no join, and a smaller migration. ⛔ They are real
and they are not decisive — *the lane's entire history is of permission arriving
by a convenient adjacent field.*

> **RECOMMENDED: V2.** ⛔ Recommended, not taken — **one/two tables is a founder
> ruling.**

---

## 6 · WHAT `completion_ref` POINTS AT

F6 requires a retry to return **the same completion**, never a fresh equivalent.

```text
CANDIDATE   the identity of MAIA's completed turn on the Ask thread
            (ask_turns is append-only — a DB trigger refuses every UPDATE,
             so a completion identity pointing at it cannot be rewritten)

⛔ NOT      the disclosure receipt — there are N per act, so it is not singular
⛔ NOT      the answer text, a digest of it, or anything textual
```

⚠️ **`ask_turns` permits DELETE** (author sovereignty over their own record), so
a completion can be deleted out from under a reference. ⭐ **The law that
follows, and it is load-bearing:**

> **A dangling completion reads as *completed, outcome no longer held* — NEVER
> as *not completed*. Deletion of the outcome must not resurrect the act.**

⛔ Otherwise member deletion becomes a replay loophole.

---

## 7 · TTL

```text
UNCLAIMED       may expire under an operational policy
CLAIMED         ⛔ does not become unclaimed because time passed
COMPLETED       ⛔ does not lose its completion identity because time passed
```

⭐ Both shapes satisfy this **structurally**, because `expires_at` appears only
in the claim predicate, which is unreachable once a claim exists.

⛔⛔ **And a hard consequence for operations: expiry is a PREDICATE, never a
DELETE.** A sweep that deleted expired rows could delete a completed act and
resurrect it. **No pruning job may touch this table** — the receipts precedent,
for the same reason.

---

## 8 · BOUNDARY — answered separately, as required

```text
Does an existing ratified boundary denote this exact crossing?

  writers_studio.focus->maia_cognition      ⛔ NO — that is the Focus path;
                                            S3 is the developmental Ask path

→ boundary-vocabulary widening is REQUIRED, and is its own governed act
```

⭐ **The precise finding: exactly ONE CHECK value needs adding.** Everything else
in the receipt vocabulary already admits what S3 needs —
`source_class='work'` · `participation_basis='member_invoked'` ·
`scope_kind='section'` · singular `section_ref` · `authorized_by='member'`.
A `gesture` value may also be owed and is named, not chosen, here.

⛔ **A convenient nearby boundary is not evidence that it is the same boundary.**
This decision does not travel with the storage ruling.

---

## 9 · OWED BEFORE MIGRATION — two physical witnesses

The doubles cannot prove either, and ⛔ **neither amends the frozen suite.**

```text
W-A  REAL CONCURRENT DATABASE CLAIM
     independent connections racing the same act · exactly one wins
     ⭐ this is what S3-F1 could only model

W-B  CRASH / RECOVERY
     claim survives process loss
     completion recoverable where present
     ⛔ non-resumable where absent
```

---

## Standing

```text
CLASS-B FREEZE        INTACT @ 2255b60d
B-iv DESIGN           DRAFTED · thesis + act identity + atomicity law +
                      two shapes + discrimination
RECOMMENDED SHAPE     V2 (two tables) — ⛔ founder ruling owed
completion_ref TARGET  candidate named; dangling-completion law stated
TTL                   ruled structurally · ⛔ expiry is a predicate, never a DELETE
BOUNDARY              widening REQUIRED · exactly one CHECK value · separate act
W-A · W-B             OWED
MIGRATION             ⛔ NOT AUTHORIZED
PRODUCT IMPLEMENTATION ⛔ NOT AUTHORIZED
PRODUCTION            UNTOUCHED
```
