# S3-FALSIFIERS-01 · FALSIFIER SPECIFICATION

**Lane** S3-DESIGN-01 · P1 sequence step 8
**Authority** design doc §14 Ruling 3 · §15 Rulings 5–7 (founder, 2026-09-13)
**Input** `S3_PENDING_ASK_REF_SUBSTRATE_CENSUS_2026-09-13.md`
**Date** 2026-09-13

⛔ **SPECIFICATION ONLY.** No test code authored. No storage designed. No
migration. No source change. This says exactly what must be proved, what each
proof is guarding against, and — for each falsifier — **what makes it evidence
rather than ceremony.**

---

## 0 · A NAMING COLLISION, DECLARED NOT ABSORBED

⚠️ The label `F1…F7` is **already in use in this lane** — design doc §9 carries
the SEL-0 acceptance obligations F1–F7, one of which (F7) is superseded.

⭐ The falsifier set is therefore written as **`S3-F1 … S3-F10`**, mapping 1:1
onto the founder's F1–F10. ⛔ **Nothing is renamed in substance**, and the
legacy F1–F7 keep their meaning untouched.

*The lane has already paid once for a word denoting three different things.*

---

## 1 · THE STRUCTURAL PROBLEM WITH "RUN AGAINST KNOWN-BAD"

Ruling 3 is law: *known-bad behaviour must make the purported regression test
FAIL before that test counts as evidence.* ⭐ But the census established that
**nine of these ten falsifiers describe a protocol that does not exist yet.**

```text
a test of an endpoint that has never been written FAILS trivially
⛔ trivial failure is NOT the doctrine's RED
```

A test that goes red because `act: 'authorize_sections_and_resume'` is
unrecognised proves nothing about consumption, identity or cardinality. It
proves the route is not built, which is already known.

⭐⭐ **SO EVERY FALSIFIER HERE CARRIES A `DEFEAT CANDIDATE`** — a *plausible,
competent, wrong* implementation that passes the rest of the set and fails this
one. That is the Circles-lane discipline (T10d killed "fix it by revoking the
token"; T10f killed "precheck instead of mutate"), and it is the only thing that
makes a falsifier for unbuilt behaviour non-vacuous.

```text
CLASS A   falsifies CANONICAL BEHAVIOUR THAT EXISTS TODAY
          → genuine known-bad RED is available now
          → S3-F8 only

CLASS B   falsifies A PROTOCOL NOT YET BUILT
          → known-bad RED is vacuous
          → the DEFEAT CANDIDATE is the evidence
          → S3-F1…S3-F7, S3-F9, S3-F10
```

⛔ **Do not report a Class B red against canonical as "reproduced the defect".**

### ⭐ RATIFIED — founder, 2026-09-13

The split is law for this lane. ⭐ **The defeat candidates are what make the
suite architectural rather than ceremonial** — each corresponds to something a
competent engineer could quite reasonably build:

```text
request-id idempotency
read-before-write
prose equivalence
per-section consumption
regeneration instead of recovery
"no completion" read as "permission remains"
client-carried authorization
```

⛔ Without the split, *"RED first"* degrades into ritual rather than evidence.

---

## 2 · THE FALSIFIERS

### ⭐ S3-F1 · CONCURRENT CLAIM

```text
LAW      §10.6a · one member act is consumed at most once
SETUP    one pendingAskRef in status `pending`
ACT      two ACT 3 requests race the same ref
ASSERT   EXACTLY ONE obtains execution authority
         the loser crosses nothing and mints no receipt
CLASS    B
```

**DEFEAT CANDIDATE** — `SELECT status → if pending → UPDATE`. Read-then-write
with no row lock passes every single-threaded test and loses this one. ⛔ This
is the precise shape the founder rejected in `093379e8d` on the Circles lane:
*the authority is the MUTATION, not a precheck.*

⚠️ Determinism requirement: a genuine interleaving witness, not two sequential
calls. The Circles lane solved this with a client wrapper on one rolled-back
transaction rather than a second connection; the same constraint applies here.

### ⭐⭐ S3-F2 · NEW-REQUEST REPLAY

```text
LAW      §10.6a · a replay must never mint another boundary
SETUP    pendingAskRef consumed and completed
ACT      same ref, NEW request id, new HTTP request
ASSERT   no second claim · no second boundary · no loadRevisionContent call
CLASS    B
```

**DEFEAT CANDIDATE** — keying idempotency on the serving request. ⭐ **The census
proved this is not hypothetical**: `context_disclosure_receipts.request_ref`
references `runtime_consent_state(request_id)`, so an implementer reusing that
table's identity would key on the request, and **a replay carrying a new request
id would not collide.** S3-F2 is the falsifier that kills that reuse.

### ⭐⭐ S3-F3 · PROSE COLLISION

```text
LAW      identity is the ACT, never the characters
SETUP    two distinct member acts with BYTE-IDENTICAL authored prose
         ACT A → ref AAA     ACT B → ref BBB
ACT      execute both
ASSERT   BOTH execute independently · neither consumes the other
CLASS    B
```

**DEFEAT CANDIDATE** — `isHeldRetry`, or anything shaped like it. The census
found it decides by comparing authored prose; extended to consumption it would
**silently merge two real member acts into one**. ⛔ Forbidden at any level of
hardening, not merely insufficient.

### ⭐⭐ S3-F4 · PROSE MUTATION

```text
SETUP    pendingAskRef AAA, consumed
ACT      replay AAA with the prose edited / reformatted / whitespace-changed
ASSERT   still consumed · no new identity · no renewed authority
CLASS    B
```

⭐ **S3-F3 and S3-F4 are the same law from both sides**, and together they are the
conceptual centre of S3:

> identity moves from **what the human happened to write**
> to **which human act the system is serving.**

⛔ A candidate that passes one and fails the other has not understood the law.

### S3-F5 · MULTI-SECTION ACT

```text
LAW      §15 Ruling 5 · consumption 1:N section receipts
SETUP    one member act authorizing sections {S, T}
ACT      one ACT 3
ASSERT   ONE consumption · TWO section disclosure receipts
         ⛔ NOT two consumptions · ⛔ NOT one receipt covering both
CLASS    B
```

**DEFEAT CANDIDATE** — consuming once per section (re-opens S3-F1 per section),
or minting one receipt with a plural scope (⛔ refused by the receipt law: the
`section_ref` column is singular and admitted only under section scope).

### ⭐ S3-F6 · COMPLETED LOST RESPONSE

```text
LAW      §15 Ruling 6 · recoverable, never authoritative
SETUP    ref consumed · crossing completed · response lost
ACT      retry
ASSERT   the SAME completion identity returns
         ZERO additional crossings · ZERO additional receipts
CLASS    B
```

**DEFEAT CANDIDATE** — re-executing because the caller has no answer. ⚠️ Also
kills the subtler wrong fix: returning a *fresh* equivalent answer. ⭐ The
assertion is on the **completion identity**, not on answer text — two runs of
cognition can produce different words from the same authority, and equality of
prose is neither necessary nor sufficient.

### ⭐⭐ S3-F7 · CLAIMED BUT INCOMPLETE

```text
SETUP    ref consumed · process died before any crossing completed
ACT      retry
ASSERT   ⛔ NO crossing
         recover a canonical result if one exists,
         else surface an interrupted/incomplete state
         a fresh member act is required to proceed
CLASS    B
```

**DEFEAT CANDIDATE** — treating absence of completion as permission. ⛔ This is
the half-authorized permission §10.6a names and forbids: *never persist a
half-authorized permission waiting to be reused.*

⭐ Note the asymmetry S3-F6 and S3-F7 pin together: **completion is recoverable;
incompletion is not resumable BY REPLAY OF THE MEMBER ACT** (§15 Ruling 6
qualification, founder 2026-09-13).

⚠️ **S3-F7 asserts about the member's replay path only.** It must NOT be written
so broadly that it forbids a future, separately governed privileged recovery
protocol — operator repair, deterministic continuation from a durable execution
record, reconciliation. ⛔ The prohibition is on a mechanism that turns a retry
into consent, never on recovery as such.

### ⭐ S3-F8 · KNOWN-BAD DEVELOPMENTAL PATH — THE ONLY CLASS A FALSIFIER

```text
LAW      P1 §13 claim
SETUP    canonical developmental Ask whose answer requires authored body
ACT      ordinary Ask, no authorization act anywhere
ASSERT   loadRevisionContent is UNREACHABLE without disclosure authority
CLASS    A — MUST GO RED AGAINST CANONICAL TODAY
```

⭐ **This is the one genuine known-bad reproduction available**, and the census
confirmed it holds: `developmentalTurn()` calls

```text
loadRevisionContent(readState.draftId, readState.revisionNumber)
```

**unconditionally**, and `establishDisclosureBoundary` has exactly one non-test
caller in the repository — Focus, not this route.

⛔ **If S3-F8 does not go red against canonical, stop.** Either the assertion is
wrong or the route moved, and in both cases the rest of the set is built on a
false premise.

⭐ **Its witness is specified separately and strictly** —
`S3-F8-WITNESS-01_PROCEDURE_2026-09-13.md`: three outcomes, ten stop conditions,
two independent instruments, and the null-`revisionContent` trap that would
otherwise let an empty fixture impersonate a refusal.

### S3-F9 · SERVER DERIVATION

```text
LAW      §10.7 step 3 · re-derive, never believe the client
SETUP    ACT 3 whose client-supplied `authorizes` set is WIDER than required
ACT      resume
ASSERT   the authorized set is derived server-side (sectionIdsOf or successor)
         a client claim NEVER widens W2
         a client claim NARROWER than required → BODY_SCOPE_INCOMPLETE
CLASS    B
```

⭐ The census confirmed this is substrate-backed today: `sectionIdsOf()` derives
the section set from the observation's evidence refs. **Step 3 is what makes
step 2 safe** — it is why an identity-only ref is viable at all.

### ⭐⭐ S3-F10 · AUTHORITY ISOLATION

```text
SETUP    an existing receipt / completion / pendingAskRef
ACT      attempt to use it as authority for ANOTHER section or ANOTHER act
ASSERT   it authorizes NOTHING
CLASS    B
```

**DEFEAT CANDIDATE** — the §10.6 prohibited durable shape:

```text
{ pendingAskRef, sectionId, authorized: true }
```

⭐ **The design names this shape; only the implementation can violate it.**
S3-F10 is the falsifier that makes the naming falsifiable.

---

## 3 · THE ADVERSARIAL IDENTITY FIXTURE

⭐⭐ One fixture proves S3-F3 + S3-F4 + S3-F2 together, and it is the fixture the
lane should be judged on:

```text
ACT A   text = "Help me revise this section."   pendingAskRef = AAA
ACT B   text = "Help me revise this section."   pendingAskRef = BBB
        → BOTH must execute independently

then

replay  new HTTP request · same text · pendingAskRef = AAA
        → must NOT execute again
```

⛔ **Every prose-derived, request-derived and thread-derived identity scheme
fails this fixture.** Only act identity passes it.

---

## 4 · EXECUTION ENVIRONMENT — STATED, NOT ASSUMED

```text
S3-F8              runnable against canonical NOW (Class A)
S3-F1              needs a deterministic interleaving witness
S3-F2 F5 F6 F7     need durable state → a disposable shadow database
S3-F3 F4 F9 F10    need the protocol surface to exist
```

⚠️ **This session cannot run any of them.** `node_modules` is absent in this
container and no database is reachable. ⛔ **That is a statement about this
environment, not a deferral of the obligation** — the run is owed, and per the
lane's own rule a founder-run witness on a disposable shadow is the evidence of
record.

---

## 5 · WHAT THIS SPECIFICATION REFUSES TO DECIDE

```text
⛔ the storage shape of pendingAskRef
⛔ whether `status` is a column, a state machine, or derived
⛔ TTL / expiry values
⛔ the boundary vocabulary widening (its own governed migration)
⛔ what completion_ref points AT
```

⭐ All five are step 10. Specifying them here would let the falsifiers be written
to fit an implementation that does not yet exist — **the exact failure Ruling 3
was written to prevent** (*the R1·B guard that shipped green because it compared
a function with itself*).

---

## 6 · THE CLASS B PHASE — entered 2026-09-13

⭐ **S3-F8 is SPENT and the expected RED is established** at witnessed SHA
`833ec87f` (`S3-F8-WITNESS-01_RESULT_2026-09-13.md`, recorded on
`chore/s3-f8-witness-record-20260913` as `41d7d6f7`, whose parent IS the
witnessed SHA). The Class A block on Class B is **DISCHARGED**.

⛔ **That discharges a block. It authorizes no implementation.**

### 6.1 · The dependency Class B actually has

A Class B falsifier needs something to call, and the `PENDING → CLAIMED →
COMPLETED` machine does not exist. ⛔ Waiting for it would mean writing the
suite against a live implementation — **the exact failure Ruling 3 forbids.**

### 6.2 · ⭐⭐ THE ORDER THAT RESOLVES IT

```text
B-i    author S3-F1…F7 · F9 · F10 against the TRANSITION LAW's contract,
       not against any storage · runnable against ANY candidate

B-ii   BUILD each named DEFEAT CANDIDATE as a disposable stub
       — the read-then-write precheck, the request-keyed idempotency,
         the prose comparison, the per-section consumption,
         the regenerating retry, the absence-as-permission reader,
         the { ref, sectionId, authorized: true } durable shape

B-iii  demonstrate THE SUITE KILLS EACH ONE
       ⛔ a defeat candidate that survives means the suite is not lethal,
         and the suite is repaired — never the candidate

B-iv   only then is the real implementation written
       — to a suite already PROVEN lethal
```

> ⭐ **Lethality becomes a precondition of the implementation rather than a hope
> about it.** A suite written after the thing it guards can only confirm what was
> built; a suite that has already killed seven wrong machines is the first thing
> in this lane that could genuinely refuse the eighth.

⚠️ **One decision this needs and does not make:** whether the transition law is
written as prose-in-record or as a typed contract the falsifiers import. ⛔ A
typed contract is closer to code and edges on step 10; prose keeps step 10 shut
but leaves the suite bound to nothing checkable. **Founder act.**

---

## Standing

```text
FALSIFIER SPECIFICATION   COMPLETE · S3-F1 … S3-F10 + identity fixture
CLASS A                   ⭐ S3-F8 SPENT · EXPECTED RED ESTABLISHED at 833ec87f
                          canonical defect REPRODUCED · block on Class B DISCHARGED
CLASS B                   nine falsifiers, each carrying a DEFEAT CANDIDATE
                          ⭐ the defeat candidate IS the evidence where
                            known-bad RED would be vacuous

RULINGS CARRIED           §15 Ruling 5 (cardinality) · Ruling 6 (completion)
                          · Ruling 7 (reuse the law, not the object)
TERMINOLOGY               §10.6a "receipt" → "consumption", amended in place

SPLIT                     ⭐ RATIFIED · founder 2026-09-13
NEXT ACT                  CLASS B · §6 — B-i author · B-ii build the defeat
                          candidates · B-iii prove the suite kills each
                          ⛔ B-iv (real implementation) NOT AUTHORIZED
OPEN                      transition law as prose or as typed contract — §6.2

TEST CODE                 NOT AUTHORED
STORAGE DESIGN            NOT OPENED
SOURCE                    UNCHANGED
PRODUCTION                UNTOUCHED
```
