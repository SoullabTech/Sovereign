# S3 · `pendingAskRef` SUBSTRATE CENSUS — READ-ONLY

**Lane** S3-DESIGN-01 · P1 implementation sequence, step 7
**Authority** `S3-DESIGN-01_SECTION_AUTHORITY_DESIGN_2026-09-10.md` §10.6 · §10.6a · §10.7 · Ruling 2
**Subject** canonical `e1c6f527b` (branch tip; `clean-main-no-secrets` is an ancestor)
**Date** 2026-09-13

⛔ **NOTHING IS IMPLEMENTED BY THIS RECORD.** No source file changed. No
migration authored. No test written. This answers one question and stops.

---

## 0 · METHOD, AND THE LIMIT OF THIS EVIDENCE

⭐ **This is a REPOSITORY-TRUTH census, not a database reading.** Every claim
below was read from committed migrations and committed source in this checkout.

```text
READ        database/migrations/20260901000001_ask_threads.sql
            database/migrations/20260909000001_context_disclosure_receipts.sql
            database/migrations/20260718000001_s5_provenance_substrate.sql
            lib/manuscript/ask/threadStore.ts · retry.ts
            lib/disclosure/disclosureBoundary.ts · contextDisclosureReceipt.ts
            lib/auth/googleOAuthState.ts
            lib/manuscript/development/evidenceRef.ts
            app/api/sovereign/manuscripts/[id]/ask/route.ts
            app/api/members/delete-account/route.ts  (GOVERNED_CONTENT)

⛔ NOT READ   any live or shadow database
```

⚠️ **What that costs.** Schema-level claims here are claims about what the
repository *declares*, not about what any deployed cluster *holds*. Where a
finding would change if production drifted from repository truth, it is marked
**DB-CONFIRMABLE**. No such finding is load-bearing for the decisive question,
which is answered from constraint declarations and code paths alone.

---

## 1 · THE CONTRACT UNDER TEST

From Ruling 2, unmodified:

```text
MUST PROVIDE                          MUST NOT CARRY
identity of exactly one unfinished Ask    may_cross
member binding                            consent
Work binding                              authorized = true
non-prose state for re-derivation         reusable section permission
ATOMIC single-consumption                 authored prose
completion / cancellation invalidation
replay detection across requests
concurrent-request safety
```

⭐⭐ **THE DECISIVE QUESTION**

> **Can two concurrent or replayed ACT 3 requests both get past consumption?**
> If yes, that representation FAILS.

---

## 2 · THE CANDIDATES THAT EXIST

Five canonical objects could plausibly be reached for. All five were examined.

```text
C1  ask_threads row                 thread identity
C2  ask_turns row                   (thread_id, turn_index)
C3  isHeldRetry / historyFor        the "held retry" object named in Ruling 2
C4  context_disclosure_receipts     disclosure_id UNIQUE + ON CONFLICT
C5  runtime_consent_state           request_id UNIQUE, immutable
```

---

## 3 · VERDICTS

### C1 · `ask_threads` — ⛔ FAILS

```text
identity of ONE unfinished Ask   ⛔ NO   a thread is a CONVERSATION
member binding                   ✅ member_id uuid → members(id)
Work binding                     ✅ manuscript_id uuid → member_manuscripts(id)
non-prose re-derivation state    ✅ anchor jsonb + reading_identity jsonb
ATOMIC single-consumption        ⛔ NO   no consumable column exists
invalidation                     ⛔ NO   no completed/cancelled state
replay detection                 ⛔ NO
concurrency safety               ⛔ NO
```

⭐ This is §10.6 confirmed against the substrate rather than asserted: the
migration says so in its own words — *"Grouping key. NOT unique: many threads may
share one anchor."* A thread id is stable, reusable and multi-turn by design.
Handing it to ACT 3 would let every subsequent request claim the same continuing
authority. **`threadId` is not merely insufficient; it is the wrong cardinality.**

⚠️ `ask_threads` carries a `ask_threads_no_repoint` freeze trigger over
`manuscript_id · member_id · anchor · reading_identity · canonical_at_open ·
initiated_by`. A new mutable column would be *outside* that freeze — lawful, but
it would make the thread row simultaneously frozen identity and mutable
authorization state. ⛔ **That is the §10.6 prohibited shape wearing an existing
table's clothes.**

### C2 · `ask_turns` — ⛔ FAILS, STRUCTURALLY

```text
ATOMIC single-consumption        ⛔ IMPOSSIBLE ON THIS TABLE
```

⭐⭐ **The decisive fact is a trigger, not a preference.**
`ask_turns_no_update` raises on *any* UPDATE — the table is append-only enforced
by the database. **A row that can never be updated can never be marked
consumed.** Compare-and-set (C6's precedent) is not available here at all.

The insert path *is* race-correct for its own job — `appendTurn` computes
`MAX(turn_index)+1` inside the statement and the composite primary key refuses
the loser — but that protects *turn ordering*, not *act cardinality*. Two ACT 3
requests would simply become two turns.

⚠️ **DELETE is permitted** on `ask_turns` and `ask_threads` (author sovereignty
over their own record, stated in the migration). Any consumption state parented
to a thread inherits `ON DELETE CASCADE`. That is not fatal — deleting the thread
also destroys the identity a replay would need — but it must be *stated*, not
discovered later.

### C3 · held-retry (`isHeldRetry`) — ⛔ FAILS, AND MUST NOT BE EXTENDED

`lib/manuscript/ask/retry.ts` is a **pure function with no database**. It answers
*"is the last turn byte-identical to what was just submitted?"* — read in
process, after a `loadThread`, with no lock and no write.

```text
two concurrent ACT 3 requests
   both loadThread → both see the same last author turn
   both evaluate isHeldRetry identically
   ⛔ BOTH PROCEED
```

⭐⭐ **And a deeper refusal, beyond the race.** `isHeldRetry` decides by
**comparing authored prose**. A control built on it would make a disclosure-event
integrity decision *out of the member's characters* — the precise
prose→authority crossing S3 exists to close. ⛔ **Not "insufficient". Forbidden
as a consumption control, at any level of hardening.**

### C4 · `context_disclosure_receipts` — ⚠️ THE RIGHT PRIMITIVE, THE WRONG STEP

This is the strongest finding in the census, in both directions.

**What it genuinely has.** `disclosure_id TEXT NOT NULL UNIQUE`, minted through
`INSERT … ON CONFLICT (disclosure_id) DO NOTHING RETURNING id`. That is a true
atomic single-winner across concurrent requests and across processes. And
`MintOutcome` already refuses to let idempotency become authority:

```text
minted                     ⭐ the ONLY outcome that authorizes
existing / 'attempted'     ⛔ does not authorize
existing / 'crossed'       ⛔ does not authorize
identity_mismatch          refuse, loudly
unavailable                fail closed
```

⭐ `{ existing, state:'crossed' }` and `{ existing, state:'attempted' }` map
**exactly** onto §10.6a's lost-response law — completion recoverable vs consumed
but unproven. The vocabulary the design needed already exists in canonical code.

**Why it still cannot be the consumption record.** Four independent blockers:

```text
B1  ORDER      the receipt is minted INSIDE establishDisclosureBoundary,
               which is ACT 3 step 6. Consumption is ruled at step 5a —
               BEFORE the boundary. Using the receipt as the consumption
               record inverts the ruled order.

B2  KEY        request_ref REFERENCES runtime_consent_state(request_id) —
               the receipt is anchored to the SERVING REQUEST. A replayed
               ACT 3 is a NEW serving request with a NEW request id, so a
               request-derived disclosure_id would NOT collide.
               ⭐ Consumption must key on the MEMBER ACT, never the request.

B3  BOUNDARY   boundary CHECK admits exactly one value:
                 'writers_studio.focus->maia_cognition'
               S3's crossing is the developmental Ask path, not Focus.
               ⛔ Only one migration touches this table; the vocabulary has
               never been widened. Admitting an Ask boundary is a governed
               migration in its own right.

B4  CARDINALITY  see §5 — unresolved in ratified copy.
```

⭐ **The honest reading: C4 is the correct PRIOR ART and the wrong OBJECT.** Its
conflict discipline is the model. Its row is not the consumption record.

### C5 · `runtime_consent_state` — ⛔ FAILS

`request_id TEXT NOT NULL UNIQUE`, immutable by trigger, first-write-wins on
retry. Per **serving request**, not per member act — the same B2 defect, in its
purest form, plus no member-act identity at all.

---

## 4 · THE DECISIVE QUESTION, ANSWERED

```text
C1  ask_threads       ⛔ BOTH PASS      no consumable state
C2  ask_turns         ⛔ BOTH PASS      UPDATE refused by trigger
C3  held-retry        ⛔ BOTH PASS      pure read, no write, prose-derived
C4  receipts          ⚠️ WRONG KEY      collision is request-scoped, not act-scoped
C5  consent state     ⛔ BOTH PASS      request-scoped, no act identity
```

> ⭐⭐ **NO EXISTING CANONICAL OBJECT ENFORCES THE §10.6a CONTRACT.**
> Under Ruling 2 this is the condition that PERMITS a dedicated opaque
> pending-Ask reference. ⛔ It does not itself authorize writing one.

---

## 5 · TWO FINDINGS THAT ARE NOT ABOUT THE REF

⚠️ Both are surfaced for founder disposition. ⛔ Neither is decided here.

### 5.1 · A CARDINALITY TENSION IN RATIFIED COPY

```text
§10.6a   "One explicit member authorization act may cause AT MOST ONE
          completed authored-body crossing and AT MOST ONE
          completed-crossing receipt."

§10.7-6  "ONE boundary per authorized section — sectionRef is singular"
```

⭐ If a member authorizes **two** sections in one act, §10.7 produces **two**
boundaries and therefore **two** receipts, which §10.6a's plain words forbid.
This is load-bearing for implementation: it decides whether consumption is
1:1 with receipts or 1:N over them, and therefore what "already consumed,
completion recoverable" must return.

⛔ **Do not resolve this by choosing the convenient reading.** The design phase
already ruled (§8) that a conflict in ratified copy is superseded in place by a
founder act, never silently harmonized by an implementer.

### 5.2 · CANONICAL S3 IS CONFIRMED AS THE FALSIFIERS DESCRIBE IT

`app/api/sovereign/manuscripts/[id]/ask/route.ts` → `developmentalTurn()` calls

```text
loadRevisionContent(readState.draftId, readState.revisionNumber)
```

**unconditionally**, with no disclosure authority anywhere in the function —
`establishDisclosureBoundary` has exactly one non-test caller in the repository, and it is
`lib/writers-studio/focusCrossing.ts`, not this route.

⭐ This is the known-bad behaviour Ruling 3 requires the falsifiers to reproduce:
*NO AUTHORITY → body required → loader unreachable* **must FAIL against this
route today**, or it is not evidence.

⭐ And the re-derivation input exists: `sectionIdsOf(ref)` in
`lib/manuscript/development/evidenceRef.ts` derives the section set from the
observation's evidence refs. **Step 3 of ACT 3 — re-derive the required section
set from the reading and the anchor, never from the client — is substrate-backed
today.** That is what makes an identity-only ref viable at all.

---

## 6 · THE PERMITTED SHAPE — SKETCH ONLY, NOT AUTHORIZED

⛔ **Not a proposal to build. A record of what the census found lawful**, so the
falsifier phase knows what it is falsifying.

The canonical precedent for atomic single-consumption is
`lib/auth/googleOAuthState.ts`:

```sql
UPDATE google_oauth_state
   SET consumed_at = NOW()
 WHERE state = $1 AND consumed_at IS NULL AND expires_at > NOW()
RETURNING member_id
```

⭐ One statement. The loser claims nothing. And it already distinguishes the three
refusals S3 needs — `replayed` · `expired` · `unknown` — rather than collapsing
them, which is exactly §10.6a's requirement that ALREADY-CONSUMED not look like
never-existed.

```text
LAWFUL DURABLE STATE          PROHIBITED DURABLE STATE
ref identity                  may_cross
member binding                consent
Work binding                  authorized = true
Ask binding (reading+anchor)  a section permission set
consumed_at / expires_at      authored prose
```

⚠️ **The one thing the precedent does NOT give S3.** `consumeOAuthState` records
*that* a state was consumed, never *what happened next*. §10.6a's lost-response
case requires *"completion recoverable → return the ALREADY-COMPLETED outcome"*.
⭐ **Recoverability of the completed outcome is an unsolved sub-question, and it
is where C4's `state:'crossed'` becomes relevant again — as the thing CONSULTED
after consumption, never as the consumption itself.**

⚠️ If a dedicated table is created it must be registered in `GOVERNED_CONTENT`
(`app/api/members/delete-account/route.ts`), whose posture is refuse-by-default:
an unlisted table cannot cause a wrongful deletion, but it also cannot be
honestly accounted for to the member.

---

## 7 · WHAT THE NEXT STEP INHERITS

```text
SETTLED BY THIS CENSUS
  no existing canonical object enforces §10.6a
  a dedicated opaque reference is PERMITTED (Ruling 2)
  the atomic claim pattern exists in canon and is citable
  the section set is server-re-derivable today
  canonical S3 loads prose with no authority — falsifier-ready

OWED BEFORE IMPLEMENTATION
  founder disposition on the §5.1 cardinality tension
  the completed-outcome recoverability sub-question
  boundary-vocabulary widening decided as its own governed act
```

⭐ Per Ruling 3, falsifier authoring is authorized now that the representation
question is grounded — and **known-bad must make each test FAIL first.**

---

## Standing

```text
CENSUS                  COMPLETE · READ-ONLY · repository truth only
SUBJECT                 e1c6f527b
VERDICT                 NO EXISTING OBJECT SATISFIES §10.6a
                        dedicated opaque pendingAskRef PERMITTED
                        ⛔ not authorized to be written

§5.1 CARDINALITY        ⭐ RULED same day — design doc §15 Ruling 5
                        consumption 1:≤1 · consumption → receipts 1:N
                        "receipt" in §10.6a amended in place to "consumption"
COMPLETED-OUTCOME       ⭐ RULED same day — §15 Ruling 6
                        completion_ref recoverable, NEVER authoritative
BOUNDARY VOCABULARY     ⚠️ NOT WIDENED · separate governed migration
                        ⭐ §15 Ruling 7 — reuse the LAW, not the OBJECT

FALSIFIER AUTHORING     AUTHORIZED (Ruling 3)
                        → SPECIFIED 2026-09-13:
                          S3-FALSIFIERS-01_SPECIFICATION_2026-09-13.md
IMPLEMENTATION          ⛔ STILL WAITING
SOURCE                  UNCHANGED · no lib/ no app/ no database/
FOCUS ASSEMBLER         UNTOUCHED · dependency did not appear
PRODUCTION              UNTOUCHED
```
