# RC-GEN-01 — witness record

Branch `claude/s3-implementation`. ⛔ **Production untouched. Migration
`20260910000001` UNAPPLIED to any real database. No Work mutation path exists
anywhere in this slice.**

## Standing

```
3A-P   protocol                DONE · 16/16 · unit suites green
3A-S   semantic witness        ⛔ NOT WITNESSED
3A     inference contract      ⛔ NOT PASSED

3B     atomic persistence      DONE · 20 checks · 0 failed · real migrations

3C-1   invocation identity     DONE · 17/17 · known-bad discriminated
3C-2   receipt + recovery      DONE · C1-C6 · 25 checks · 0 failed
3C     idempotency             PASSED

3D     end-to-end              CLOSED — and BINARY, never "partially open"
                               sole blocker: 3A-S

schema 00004 proposals         UNAPPLIED
       00005 receipt           UNAPPLIED
prod                           UNTOUCHED
Work                           NO MUTATION PATH
```

⭐ **The governing sentence: 3B and 3C have passed independently. 3A-P has passed;
3A-S remains the SOLE outstanding prerequisite to 3D.**

⚠️ **An earlier phrasing in this session said "A, B and C have each passed
independently." That was too strong and is corrected here.** 3A-P passing is not 3A
passing. A later reader could otherwise infer that the inference contract was
already accepted and that the semantic witness was supplementary. **It is the
prerequisite, not a supplement.**

## ⚠️ Housekeeping corrections

**Migration number collision (mine).** `20260910000001` was already taken by
`pending_ask_claims`. The revision-proposal migration is renamed
**`20260910000004_manuscript_revision_proposals.sql`**. Safe: it is unapplied
everywhere, and `20260910000002`/`0003` were already in use.

**Record date.** This file was first named `…_2026-09-11.md` because the container
clock is UTC (`2026-09-11 00:16 UTC` at the time of writing) while the founder's
working day was still 2026-09-10. ⭐ **The lane's convention is the founder's
working day**, which is what every sibling record uses; renamed to match. Recorded
rather than silently fixed, because a witness filename is a date claim.

## ⚠️ Count correction

The 3B commit message (`02f940044`) says **19 checks**. **The executed witness
reports 20.** *The run is the authority; the message is one count behind.* Recorded
here rather than by rewriting history.

## 3B — atomic persistence · 20 passed · 0 failed

PostgreSQL 16.13, disposable cluster, torn down. **Ten REAL migrations** — members ·
press manuscript room · title optional · source custody · working drafts · draft
sections · revision partition · heading depth · ask_threads · R1 — ⛔ **not the
minimal FK stub**, which answered a different question.

```
B1   commits · joins to its producer turn · canonical wording, target,
     provenance, origin correct · producer IS a MAIA turn · index matches
B5   ⭐ NO turn body contains the canonical proposed wording
B2   proposal insert fails after turn work began -> whole act rolls back:
     no orphan author turn, no orphan producer turn, no proposal
B3   nonexistent producer turn -> rejected
B3b  ⭐ an AUTHOR turn as producer -> rejected by RC-08a IN THE REAL SCHEMA,
     so the trigger is not an artefact of a simplified fixture
B4   no_change commits, records both turns, ZERO proposal rows
B6   recoverable by (thread_id, produced_in_turn_index)
```

⛔ **No same-act specimen exists in this harness, deliberately.** Atomicity must not
acquire credit for idempotency. B6 establishes only that 3C's recovery path exists
**structurally**; it does not perform recovery.

## 3C-1 — invocation identity · 17 passed · 0 failed

**The defect closed:** `actId` is caller-minted and survives a lost response, but
`claim(ref, actId)` never sees the payload — so the same `actId` with a materially
different invocation was **indistinguishable from a retry, and the second
invocation silently disappeared.** ⭐ *That is transport identity overruling member
intention.*

```
same actId + same digest        replay
same actId + different digest   CONFLICT — carries both digests,
                                never `completed`, never `already_consumed`
```

### ⛔ Not "the SHA of the HTTP body"

The canonical **semantic** payload is defined first, then hashed.

```
IN    contract version · thread · member · question ·
      authorized section ids AND their prose as sent
OUT   timestamps · request ids · tracing metadata · user agent ·
      JSON key order · array order · retry counters
```

Sections are **sorted** before hashing (order is not identity) and every field is
**length-prefixed**, so no combination of prose can imitate a field boundary and
forge another invocation's digest. A test asserts that.

### ⭐ C5 discriminates, and the known-bad fails in the OPPOSITE direction

Against `sha256(JSON.stringify(request))`:

```
section reorder -> same digest?  FALSE
key reorder     -> same digest?  FALSE
```

Both of C5's tests go red. ⚠️ **And the harm is the inverse of the defect we set out
to fix:** a genuine retry whose JSON was merely re-serialized — a reordered key
crossing a client, proxy or framework boundary — acquires a NEW digest and is
classified as a **CONFLICT**. An honest retry refused as a different act.

> **An idempotency key that breaks under re-serialization protects nothing, and an
> identity bound to the wire can fail in both directions at once.**

## 3C-2 — receipt and recovery · 25 passed · 0 failed

Thirteen real migrations, disposable PostgreSQL 16, torn down.

**Identity is bound at claim; outcome is bound at completion.** `request_digest`
lands atomically with `consumed_by_act`, so a second presentation is classifiable
**while the original is still in flight**. `outcome_kind` + `produced_in_turn_index`
+ `completed_at` land inside the act transaction, so there is no state where the act
is committed and its receipt is absent.

```
C1  exactly one historical act · cognition called once
C2  replay · ⭐ cognition count REMAINS 1 · turns unchanged · proposals
    unchanged · ⭐ recovered outcome SEMANTICALLY EQUAL to the historical act
C3  ⭐ HARD CONFLICT · no new inference · original unchanged · the verdict
    carries neither `completed` nor `already_consumed`
C4  a new actId is allowed and performs a new act
C5  same canonical digest -> lawful replay
C6  no_change recovers POSITIVELY from the receipt, not from absence
    proposals receipt + missing proposal -> HARD RECOVERY FAILURE,
      ⛔ never downgraded to no_change
    no_change receipt + attached proposal -> HARD RECOVERY FAILURE
    consumed-but-uncompleted is `incomplete`, visibly not a replay
    ⭐ the SCHEMA refuses completion without receipt evidence
```

⚠️ **Honest qualification on C5 at the database level.** The witness's C5 presents a
shallow copy, which is not a genuinely different serialization — it confirms that a
matching digest replays lawfully, and no more. **Digest invariance under
re-serialization is proven in the unit suite** (`revision-invocation-identity`:
section reorder, key reorder, deep JSON round-trip), where the known-bad
`sha256(JSON.stringify(...))` fails all three. The two together cover C5; neither
does alone.

⛔ **Inference is stubbed by a counter, deliberately.** C2's claim is about the
CALLER CONTRACT — that a replay never reaches cognition — not about what a model
would say. A real provider here would prove less, not more.

## Previously owed, now discharged

```
3C-2  the caller-level retry contract must RETURN the historical result,
      not merely its status:
        same actId + same digest + completed
          -> do NOT infer again · do NOT persist again
          -> locate the historical producer act
          -> reconstruct the typed outcome  (proposals: via the producer
             turn; no_change: from durable evidence, manufacturing no row)
          -> return it

      acceptance: a caller experiencing a lost response cannot distinguish
      the recovered response from the successful historical act in any
      SEMANTICALLY relevant way. Byte-identical incidental metadata is not
      required; the same authoritative outcome is.

C1    first invocation X+A            -> exactly one historical act
C2    lost response, exact retry      -> no new inference, no new turns,
                                         no new proposal, prior result returned
C3    X + digest B (B != A)           -> HARD CONFLICT, original unchanged,
                                         second payload NOT reported as
                                         successful or replayed
C4    Y + digest B                    -> allowed, new historical act
C5    same request, different
      serialization                   -> same digest, lawful replay   DONE
```

## 3A-S — specimen 2 repaired

⚠️ The earlier fixture was merely **strong prose under an open question**, so a
model could plausibly object to tense, rhythm or a repeated word and a proposal
would have shown editorial **taste** rather than a failure of restraint. The test
was unfalsifiable in the direction that mattered.

⭐ **The repair narrows the requested DIMENSION rather than strengthening the
prose.**

```
fixture    "The kettle clicked off. Mara poured the water over the coffee grounds."
question   "Is this passage too abstract? Change it only if it needs to be
            made more concrete."
```

A proposal is now **unnecessary intervention**, not taste — the precise test of
*authorization is not an invitation to intervene.*
