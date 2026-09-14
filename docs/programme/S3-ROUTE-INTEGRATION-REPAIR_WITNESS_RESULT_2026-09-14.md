# S3 · ROUTE INTEGRATION REPAIR — PHYSICAL WITNESS RESULT

**Candidate** `6ec5ff1d` (atomic post-cognition completion + sibling route-effect law)
**Prior candidate** `8e5da279` (R1–R12 PASS · RI-X1 RED · RI-X2 RED)
**Frozen law** Class-B freeze @ `2255b60d`
**Date** 2026-09-14

> **VERDICT: R1–R12 PASS · POST-REPAIR F8 PASS · RI-X1 PASS · RI-X2 PASS ·
> R10 PASS · PROJECT TYPECHECK PASS.**
>
> Both integration-only crash falsifiers now hold at the strengthened form the
> founder specified. No frozen instrument was amended.

⛔ **MERGE NOT AUTHORIZED. SCHEMA DEPLOY NOT AUTHORIZED. PRODUCTION UNTOUCHED.**

---

## 1 · METHOD

Fresh disposable PostgreSQL 16 cluster (`initdb`, UTF8, unix socket, its own data
directory), created for this act and destroyed after it. Canonical baseline plus
all candidate migrations applied: **424 of 480 applied, 56 refused**. ⚠️ The 56
are legacy files that need absent extensions or predecessors (selflet / bardic /
comms / encounters / pgvector families); **every table this route reaches was
created**, and each is named in §6. Synthetic fixtures only.

The real HTTP route ran, under a real Next server, against the shadow: real
session auth, ownership check, envelope parse, requirement derivation, database
claimant, consent state, disclosure boundary and receipts, thread store,
recovery, and the atomic post-cognition transaction.

⭐ **The structured-model transport alone was replaced, AT THE WIRE, downstream of
prompt assembly** — a loopback stub bound to `127.0.0.1` returning one synthetic
answer and counting invocations. ⛔ No fixture body left the host for a model
provider. ⛔ No product source was altered: the substitution is an environment
variable the vendor SDK already reads.

PostgreSQL ran `log_statement=all` with `log_parameter_max_length=0`. Body reads
are counted as executions of the revision-body SELECT — cited as **the
operation**, ⛔ never a line number (D1).

**Fault injection changed the disposable shadow only**, as `BEFORE` triggers
armed and dropped around single cases. ⛔ No branch was altered, no authority
established, no receipt populated (D2). Every fault message carries **counts
only** — ⛔ no identifier, no excerpt, no digest, no offset (D3).

---

## 2 · R1–R11

```text
R1   PASS  body-required ACT 1 → BODY_AUTHORITY_REQUIRED
           body SELECT 0 · claim 0 · receipts 0 · cognition 0 · sections 1

R2   PASS  incomplete authorization → BODY_SCOPE_INCOMPLETE
           consumption 0 (opportunity unspent) · body SELECT 0 · receipts 0
           · cognition 0

R3   PASS  valid two-section ACT 3
           1 consumption · 2 receipts, both SINGULAR, both crossed
           · 1 body read · 1 MAIA turn · 1 completion · 1 cognition

R4   PASS  completed replay → ALREADY_COMPLETED · SAME completion identity
           0 new body reads · 0 new receipts · 0 new cognition
           · 0 new consumption

R5   PASS  claimed-but-incomplete replay → INTERRUPTED
           0 new body reads · 0 receipts · 0 cognition · 0 completions

R6   PASS  2 concurrent ACT 3 → exactly ONE reaches body
           1 body read · 1 receipt crossed · 1 MAIA turn · 1 consumption
           · 1 cognition

R7   PASS  client names 2 sections; server derives 1
           1 receipt, on the derived section only
           ⭐ a section-run's carried section id does NOT widen body authority

R8   PASS  foreign Work → 404, authorizes nothing
           a same-member opportunity minted for a DIFFERENT ask →
           409 authorization_not_for_this_ask · stays spent · body SELECT 0
           · receipts 0

R9   PASS  shadow forces disclosure boundary refusal after claim
           → 503 disclosure_unavailable · act consumed, not completed
           · body SELECT 0 · receipts 0 · cognition 0

R10  PASS  recorded → already (ORIGINAL timestamp preserved) → conflict
           → no_consumption
           expected-refusal console.error calls 0
           ⭐ an unexpected DB failure on the SAME path threw AND logged

R11  PASS  valid authority + unrecoverable historical body
           → BODY_UNVERIFIABLE · body SELECT 1 · receipt stays attempted
           · crossed 0 · cognition 0 · never BODY_AUTHORITY_REQUIRED
```

R12 — the static field, all re-run on `6ec5ff1d`:

```text
Class-B freeze diff       EMPTY
substrate guards          12 / 12 PASS   (G12 new; G10 updated to track the
                                          renamed call, law unchanged)
substrate typecheck       PASS · exactly one named inherited allowance
frozen typecheck          PASS
frozen matrix             LETHAL · DISCRIMINATING · reference clean
askRuntimeCannotWrite     8 / 8 PASS · TEST UNCHANGED
askRouteEffectFamily      5 / 5 PASS · sibling law, new
ship typecheck            229 errors vs baseline 239 · 0 regressions · PASS
```

⭐ **The project typecheck is a real run with dependencies installed** — the
obligation the TS2307-only result could not discharge. It reports the same
229/239 the founder's run on `8e5da279` reported: **the repair introduced no
regression.**

---

## 3 · POST-REPAIR S3-F8 — PASS

Historical F8 remains the RED at `833ec87f`; it is not edited or reinterpreted.

Against `6ec5ff1d`, a body-required ordinary Ask before any authorization act:

```text
revision-body SELECT issued     0
consumption                     0
section disclosure receipts     0
body cognition                  0
result                          BODY_AUTHORITY_REQUIRED
```

---

## 4 · RI-X1 — LATEST-POINT TRANSACTIONAL FAILURE

The fault fires on the completion UPDATE, i.e. **after the canonical turn was
inserted and after every receipt confirmation executed**, and reports counts
scoped to this Work from inside the still-open transaction:

```text
IN-TRANSACTION, at the moment of failure
  in_tx_maia_turns            1
  in_tx_crossed_receipts      2
```

That is the whole tail already applied. Then:

```text
AFTER ROLLBACK
  canonical MAIA turn         ABSENT
  receipt 1                   ATTEMPTED
  receipt 2                   ATTEMPTED
  completion                  ABSENT
  act                         consumed + incomplete
  HTTP                        500 · refusal "answer_not_recorded"
  HTTP success                ABSENT
  (cognition had run: 1 · body had been read: 1 — neither is undone, and
   neither is claimed to be)
```

⭐ **RI-X1b — and the retry is now TRUTHFUL.** With the fault removed, the member
replayed the same ACT 3:

```text
INTERRUPTED
  canonical MAIA turn   0      new body reads   0
  new cognition         0      new receipts     0
```

⭐ `INTERRUPTED` was the defect at `8e5da279` because a canonical result existed.
Here **no canonical result exists**, so `INTERRUPTED` is the correct answer under
frozen Ruling 6 rather than a loss of the relationship between a consumption and
what it became.

---

## 5 · RI-X2 — MULTI-RECEIPT ROLLBACK (N = 2)

⭐ **The strengthened proposition the founder pinned before the witness was spent:
`confirm ALL section receipts` is INDIVISIBLE.** Two receipts were minted.
Receipt 1's `attempted → crossed` UPDATE was **allowed to succeed inside the
transaction**; receipt 2's confirmation was then forced to fail. The fault reports
what was already durable-in-transaction at that instant:

```text
IN-TRANSACTION, at the moment of failure
  in_tx_crossed_before_abort  1        ← receipt 1 HAD been crossed
```

```text
AFTER ROLLBACK
  receipts minted             2
  receipt 1                   ATTEMPTED      ← the successful UPDATE was undone
  receipt 2                   ATTEMPTED
  canonical MAIA turn         ABSENT
  completion                  ABSENT
  act                         consumed + incomplete
  HTTP                        500 · refusal "answer_not_recorded"
  HTTP success                ABSENT
```

⭐ **This is the stronger claim, not the weaker one.** A single-receipt failure
would only have shown that the throwing API can abort. `in_tx_crossed_before_abort
= 1` followed by `attempted / attempted` shows that a **committed-in-transaction
durable change was actually rolled back** — which is what makes the N receipts one
fact rather than N facts that happen to be attempted in order.

---

## 6 · THE COMMITTED-BUT-RESPONSE-LOST PROPOSITION — NO GAP, NO NEW ARCHITECTURE

The founder asked that this be confirmed through an existing test, or its absence
exposed. **It exists, twice, at two scopes. Nothing was invented.**

**Frozen scope — `S3-F6`**, in `tests/constitutional/s3/falsifiers.ts`, frozen @
`2255b60d`:

> *a completed outcome is recoverable and never authoritative (Ruling 6)* —
> defeats *re-execution, and the subtler wrong fix: a FRESH EQUIVALENT answer*.

It asserts `retry.kind === 'recovered'`, `retry.completion === first.completion`
(⭐ completion identity, never answer text), and no added crossing. It ran in this
act inside the matrix: DC-2 and DC-6 die on it, the conforming reference passes
it, and the matrix reports **LETHAL and DISCRIMINATING**.

**Route scope — `R4`**, run here against `6ec5ff1d`:

```text
transaction COMMIT succeeds  →  response lost  →  retry
  result                ALREADY_COMPLETED
  completion identity   IDENTICAL to the first
  new body reads        0
  new receipts          0
  new cognition         0
  new consumption       0
```

⭐ The lawful-success world this design creates is therefore witnessed, not
assumed: the same execution is recovered, never regenerated.

**Tables the route reaches, all present in the shadow:** `member_manuscripts` ·
`manuscript_working_drafts` · `manuscript_draft_sections` ·
`working_draft_revisions` · `manuscript_sections` · `manuscript_structure_units`
· `manuscript_structure_members` · `manuscript_structure_proposals` ·
`developmental_readings` · `ask_threads` · `ask_turns` ·
`ask_authorization_acts` · `ask_authorization_consumptions` ·
`runtime_consent_state` · `context_disclosure_receipts` · `members` ·
`auth_sessions`.

---

## 7 · ONE COLLATERAL OBSERVATION — HANDED ON, NOT TAKEN

⚠️ In R6, the losing concurrent request returned **500** rather than a clean
refusal. Root cause, read from the shadow: **`ask_turns_pkey` duplicate key on
the AUTHOR turn.** `appendTurn` computes `MAX(turn_index) + 1` inside its
statement, so two requests arriving on one thread can compute the same index and
one loses the primary key.

⛔ **This is NOT an S3 authority defect and NOT introduced by the repair.**
It happens *before* any claim (the colliding row's speaker is `author`), the
statement is byte-identical to the one at `8e5da279` — the repair changed only
which client executes it — and R6's own proposition is undisturbed: exactly one
request reached body, with 1 body read, 1 crossed receipt, 1 MAIA turn, 1
consumption and 1 cognition.

⭐ *The lane that finds a defect does not thereby own it.* Recorded as a
**thread-store concurrency finding**: a second concurrent turn on one thread
should be refused legibly rather than surfacing as an unhandled 500. ⛔ Not
repaired here — it is outside this bounded repair and changes behaviour for every
Ask lane, not only S3.

---

## 8 · CONTAINMENT

```text
candidate source          unchanged (tree clean after the run)
Class-B freeze            unchanged · diff EMPTY
askRuntimeCannotWrite     unchanged
historical F8 record      unchanged
production                UNTOUCHED
model provider            no fixture body sent — loopback stub only
shadow cluster            DESTROYED (data directory removed, server stopped)
witness harness           DESTROYED (never committed)
record content            counts and outcomes only — no excerpt, digest,
                          fingerprint, offset, prompt, answer or identifier
```

---

## Standing

```text
CLASS-B FREEZE            INTACT @ 2255b60d
ROUTE CANDIDATE           6ec5ff1d

R1–R12                    ⭐ PASS
POST-REPAIR F8            ⭐ PASS
RI-X1 (latest-point)      ⭐ PASS — all three durable facts rolled back
RI-X2 (N = 2 receipts)    ⭐ PASS — a crossed receipt was actually undone
COMMITTED-BUT-LOST        ⭐ PASS — S3-F6 (frozen) + R4 (route); no gap
PROJECT TYPECHECK         ⭐ PASS — 229 vs baseline 239 · 0 regressions

THREAD-STORE CONCURRENCY  ⚠️ FINDING HANDED ON (not an S3 defect)

MERGE                     ⛔ NOT AUTHORIZED
SCHEMA DEPLOY             ⛔ NOT AUTHORIZED
PRODUCTION                UNTOUCHED
```

**The candidate produced only the two durable worlds it claims to permit:**
committed — turn, N crossed receipts and completion together, recoverable on a
lost response; or rolled back — no turn, receipts attempted, no completion, the
act consumed and incomplete, and a fresh member act required. ⛔ No third world
was observed.
