# S3 · ROUTE INTEGRATION — PHYSICAL WITNESS RESULT

**Candidate** `8e5da27967e5c7ef64802d6970f6824849dd137f`
**Frozen law** Class-B freeze @ `2255b60d`
**Inputs** substrate `3a65ad1b` · W-A/W-B `b68eb10d` · dispositions `dd05877d`
**Date** 2026-09-14

> **VERDICT: R1–R12 PASS · POST-REPAIR F8 PASS · CANDIDATE NOT ACCEPTABLE.**
>
> Two integration-only crash falsifiers exposed defects in the post-cognition
> completion tail. Neither reopens the Class-B freeze or the V2 substrate.

⛔ **MERGE NOT AUTHORIZED. SCHEMA DEPLOY NOT AUTHORIZED. PRODUCTION UNTOUCHED.**

---

## 1 · METHOD

Founder-side physical witness on the Mac Studio against a fresh disposable
PostgreSQL shadow built from the exact candidate SHA. Canonical baseline plus all
candidate migrations were applied. The shadow contained synthetic fixtures only.

The real HTTP route, database claimant, disclosure boundary, receipt machinery,
thread store and recovery code ran. The structured-model transport alone was
replaced after prompt assembly with a synthetic answer, so no fixture body left
the shadow for a model provider.
PostgreSQL statement logging had `log_statement=all` and
`log_parameter_max_length=0`. The repaired F8 proposition therefore used the
same semantic operation as the historical witness — the revision-body SELECT —
without logging its parameters or authored body.

Fault injection changed the disposable shadow only. No product source was
altered by the witness.

---

## 2 · R1–R12

```text
R1   PASS  body-required ACT 1 → BODY_AUTHORITY_REQUIRED
           body SELECT 0 · claim false · receipts 0 · cognition 0

R2   PASS  incomplete authorization → BODY_SCOPE_INCOMPLETE
           opportunity unconsumed · body SELECT 0 · receipts 0

R3   PASS  valid two-section ACT 3
           1 consumption · 2 singular receipts crossed · 1 body read
           · 1 MAIA turn · 1 completion

R4   PASS  completed replay → ALREADY_COMPLETED
           same completion · 0 new body reads/receipts/cognition
```
```text
R5   PASS  claimed-but-incomplete replay → INTERRUPTED
           0 new body reads · 0 receipts · 0 cognition

R6   PASS  2 concurrent ACT 3 requests
           exactly 1 winner reaches body · 1 body read · 1 receipt · 1 MAIA turn

R7   PASS  client names 2 sections; server derives 1
           1 receipt · only derived section body reaches cognition
           ⭐ section-run's carried section id does NOT widen body authority

R8   PASS  another member / Work / reading / observation
           authorizes nothing; mismatched same-member opportunities stay spent
           and cross no body

R9   PASS  shadow forces disclosure boundary refusal after claim
           → disclosure_unavailable · act remains interrupted · body SELECT 0
           · receipt 0

R10  PASS  contradictory completion → conflict · expected console.error calls 0
           unexpected DB failure on the same path throws and stays loud

R11  PASS  valid authority + unrecoverable historical body
           → BODY_UNVERIFIABLE · body SELECT 1 · receipt stays attempted
           · no cognition · never BODY_AUTHORITY_REQUIRED
```
R12 is the unchanged constitutional/static field:

```text
Class-B freeze diff       EMPTY
substrate guards          11 / 11 PASS
substrate typecheck       PASS · exactly one named inherited allowance
frozen typecheck          PASS
frozen matrix             LETHAL · DISCRIMINATING · reference clean
askRuntimeCannotWrite     8 / 8 PASS · test unchanged
ship typecheck            229 errors vs baseline 239 · 0 regressions · PASS
```

⭐ **R1–R12 are therefore discharged for this candidate as they were specified.**
The defects below are not retroactively called failures of a gate that did not
ask their question.

---

## 3 · POST-REPAIR S3-F8 — PASS

Historical F8 remains the RED at `833ec87f`; it is not edited or reinterpreted.

Against `8e5da279`, the same body-required ordinary Ask, before any authorization
act, produced:

```text
revision-body SELECT issued     0
consumption                     0
section disclosure receipts     0
body cognition                  0
result                           BODY_AUTHORITY_REQUIRED
```
⭐ **The exact known-bad path is no longer reachable before authority on the
integrated candidate.**

---

## 4 · RI-X1 — CANONICAL RESULT EXISTS, COMPLETION FACT DOES NOT

The first integration-only falsifier injected a failure at exactly the final
`recordCompletion()` UPDATE. Everything before it ran normally.

Observed before retry:

```text
member act consumed             true
canonical MAIA turn persisted   true
section receipt state           crossed
completion fact                 absent
response                        lost / request failed
```

After removing the fault, the member replayed the same ACT 3. The route returned:

```text
INTERRUPTED
new body reads    0
new receipts      0
new cognition     0
```

The non-replay half is correct. **The recovery half is not.**
Frozen Ruling 6 says, for claimed-but-incomplete:

> recover a canonical result if one exists; else surface interrupted.

Here a canonical result **does** exist. Returning `INTERRUPTED` loses the
relationship between the consumption and what it already became.

```text
RI-X1  ⭐ RED
LAW    completion is recoverable; incompletion is not resumable by replay
FAULT  process dies after canonical result persistence but before completion fact
BUG    retry reports interrupted despite an existing canonical result
```

⛔ This does **not** authorize replaying cognition. The result must be recovered,
never regenerated.

---

## 5 · RI-X2 — RECEIPT CONFIRMATION FAILURE IS SWALLOWED

The second falsifier injected failure only when the already-minted section
receipt attempted `attempted → crossed`.

`confirmDisclosureCrossed()` correctly returned `false`. The route ignored the
boolean and continued.

Observed:

```text
canonical MAIA turn persisted   true
receipt state                    attempted
act state                        completed
route response                   200 success
```
That state is false in both directions: the route tells the member the execution
completed, while the authority ledger permanently says the crossing may have
occurred and was never confirmed.

```text
RI-X2  ⭐ RED
LAW    accountability and completion may not contradict one another
FAULT  receipt confirmation fails after cognition
BUG    false is ignored; route records completion and returns success
```

The current receipt helper is correct for callers that can tolerate an unresolved
crossing as an explicit anomaly. **This route cannot ignore that anomaly while
also declaring the member act completed.**

---

## 6 · THE COMMON CAUSE

These are not two storage defects. They are one integration ordering defect.
The current durable tail is three separate commits:

```text
persist canonical MAIA turn
        ↓
confirm N section receipts
        ↓
record authorization completion
```

A process can die between any two arrows. A receipt confirmation can also fail
and return `false` without stopping the tail.

⭐ The V2 claim remains correct. The missing atomicity is **after cognition**, not
at the member-act claim.
---

## 7 · REPAIR DIRECTION — ONE ATOMIC POST-COGNITION COMMIT

⛔ **Direction, not implementation in this witness branch.**

After cognition returns successfully, one ordinary database transaction should
commit together:

```text
1  persist the canonical MAIA turn
2  confirm every section receipt crossed
3  record the authorization completion pointing at that persisted turn
COMMIT
```

If any one fails, **all three durable changes roll back**.

This use of `transaction()` does not contradict S3's atomic-claim ruling. The
claim is still the standalone UNIQUE `INSERT ... ON CONFLICT DO NOTHING`; a
plain BEGIN never becomes authority. The transaction here provides only
all-or-nothing persistence of facts about an execution that already happened.

Consequences:

```text
transaction commits
  → turn exists · N receipts crossed · completion exists
  → lost HTTP response can recover the SAME completion

transaction rolls back / process dies before commit
  → no persisted turn · receipts remain attempted · no completion
  → act is interrupted; there is no canonical result to recover
  → replay crosses nothing; fresh member act required
```
The repair will need transaction-aware forms of the three writers. In the atomic
path, receipt confirmation failure must be transactional failure, not a swallowed
`false`; completion conflict/no-consumption must likewise prevent commit.

⭐ **RI-X1 and RI-X2 become acceptance gates for that repair.** They are
route-integration falsifiers, not additions to or amendments of the frozen
Class-B suite.

---

## 8 · ROUTE-SCOPE WRITE LAW — FOUNDER DISPOSITION

`askRuntimeCannotWrite` remains correct and unchanged. It protects the Ask
**library**: thread writes only; no Work writes. Moving the authority substrate
out of that library was the right disposition.

The integrated route now has a broader legitimate effect surface, so its law
must be stated by a **new sibling structural guard**, never by widening the old
allowlist:

> **The developmental Ask route may write the conversation and explicit
> authority/accountability records. It may never mutate the Work.**

Its admitted effect family is bounded to:

```text
conversation       ask_threads · ask_turns
authority          ask_authorization_acts · ask_authorization_consumptions
posture evidence   runtime_consent_state
crossing evidence  context_disclosure_receipts
```

⛔ Manuscript/draft/revision/section/structure/proposal/developmental-reading
writes remain forbidden from the route's reachable effect graph.
The guard should inspect reachable database effects with comments stripped. It
must not become a raw filename/text allowlist that can be satisfied by moving a
writer elsewhere.

---

## 9 · CONTAINMENT

```text
candidate source          unchanged
Class-B freeze            unchanged
historical F8 record      unchanged
production                untouched
model provider            no fixture body sent
shadow                    disposable · destroy after record
witness harness           ephemeral · never committed
```

---

## Standing

```text
CLASS-B FREEZE        INTACT @ 2255b60d
ROUTE CANDIDATE       8e5da279
R1–R12                ⭐ PASS AS SPECIFIED
POST-REPAIR F8        ⭐ PASS

RI-X1 CRASH WINDOW    🔴 RED · canonical result exists but replay says interrupted
RI-X2 CONFIRM SWALLOW 🔴 RED · route returns success with receipt still attempted

ROOT CAUSE            post-cognition durable tail is not atomic
NEXT REPAIR           atomic turn + receipt confirmations + completion commit
ROUTE-SCOPE GUARD     OWED · sibling of askRuntimeCannotWrite

MERGE                 ⛔ NOT AUTHORIZED
SCHEMA DEPLOY         ⛔ NOT AUTHORIZED
PRODUCTION            UNTOUCHED
```

**`8e5da279` is not an acceptable integration candidate.** The substrate remains
accepted evidence; the route integration stays open for the bounded repair above.
