# S3 · ROUTE INTEGRATION REPAIR — ATOMIC POST-COGNITION COMPLETION

**Date:** 2026-09-14
**Lane:** `S3-DESIGN-01`
**Authority:** founder ruling on the route-integration witness `2864fbcc`
(`chore/s3-route-integration-witness-20260914`, parent `8e5da279`).
**Branch:** `chore/s3-class-b-phase-20260913`.

**Standing:** CLASS-B FREEZE INTACT @ `2255b60d` · ⛔ MERGE NOT AUTHORIZED ·
⛔ SCHEMA DEPLOY NOT AUTHORIZED · ⛔ PRODUCTION UNTOUCHED.

---

## 1. What was ruled

The witness returned a paradox: **R1–R12 all pass, post-repair F8 passes, and
`8e5da279` is still not acceptable.** Two new REDs sat underneath a green gate
set, both in the sequential tail that runs *after* cognition.

**RI-X1 — the completion crash window.** The canonical MAIA turn, the crossed
receipts and the consumption all existed while the completion did not. A retry
then reported `INTERRUPTED` — truthfully, by the substrate's own reading, and
*wrongly*, because a canonical result existed. ⭐ That is the frozen **Ruling 6**
violation from the other side: incompletion is not resumable by replay, but a
COMPLETED execution must be recoverable, and this made one unrecoverable and
indistinguishable from an interrupted one.

**RI-X2 — the ignored confirmation.** `confirmDisclosureCrossed` returned
`false`; the route ignored it and answered HTTP 200 with the receipt still
`attempted`. ⭐ A crossing that MAY have occurred and was not confirmed was
delivered as an ordinary success.

Founder ruling: **one bounded repair — atomic post-cognition completion.**
Persist the canonical turn → confirm ALL section receipts → record the
completion identity, in one transaction; any failure ROLLS BACK ALL THREE. In
that path a receipt-confirmation failure may not be converted to `false` and
ignored, and `conflict` or `no_consumption` may not be treated as successful
completion. Plus: ⛔ **do not modify `askRuntimeCannotWrite`** — add a sibling
route-level structural guard instead.

---

## 2. What was built

### 2.1 Transaction-aware forms (house `…WithClient` convention)

| Module | Added | Shape |
|---|---|---|
| `lib/manuscript/ask/threadStore.ts` | `appendTurnWithClient` | same statement, caller's client; `appendTurn` now delegates with the pool client |
| `lib/disclosure/contextDisclosureReceipt.ts` | `confirmDisclosureCrossedWithClient` | ⭐ returns **`Promise<void>`** and **throws** — there is no value to ignore |
| `lib/disclosure/authorizationAct.ts` | `recordCompletionWithClient` + `CompletionNotRecorded` | ⭐ `recorded`/`already` returned; `conflict`/`no_consumption` **throw** |

⭐⭐ **THE RETURN TYPES ARE THE REPAIR.** RI-X2 is what ignoring a boolean looks
like. The fix is not to remember to check it — it is to remove the value.

⛔ The boolean form is NOT deleted. `lib/writers-studio/focusCrossing.ts` uses it
deliberately: it has no transaction to abort and its handling of `false` is its
own. Two shapes for two lanes, neither pretending to be the other.

⛔ `queryWithExpectedRefusal` is deliberately NOT used inside the transaction: it
is a pool-level helper and would run outside it. The conflict is classified on
the transaction client, which logs nothing — so the expected-refusal discipline
(⭐ *a refusal is not an occasion to disclose*) holds without it, and the thrown
error's message carries **no act reference and no completion identity**.

### 2.2 The route tail

`answerFrom()` now wraps turn → confirmations → completion in one
`transaction()`. On any failure: one content-free lane-named log line, and a
**500 `answer_not_recorded`**.

⛔ **THE ANSWER TEXT IS NOT RETURNED ON ROLLBACK.** A result delivered outside an
accountable completion is precisely the outcome the record is supposed to stand
for.

⛔⛔ **ATOMICITY, NEVER AUTHORITY.** The transaction opens *after* the body has
already crossed. The authority was the `ON CONFLICT DO NOTHING` claim and the
`may_cross` boundaries, both of which happened earlier; this transaction can
neither grant, withhold, nor restore them. ⛔ `transaction()` remains a plain
BEGIN at READ COMMITTED with no row lock — the fact that defeated `093379e8d` —
and nothing here may be read as it supplying a claim.

⛔ **ROLLBACK DOES NOT UNDO A CROSSING.** Nothing can. Receipts stay `attempted`
— permanently, truthfully, queryably — and the act stays
consumed-and-incomplete, which is `interrupted`, which needs a fresh member act.
What the abort prevents is the *second* wrong: a durable canonical outcome
recorded as accountable when its accountability was never established.

### 2.3 The sibling guard

`lib/manuscript/ask/__tests__/askRouteEffectFamily.test.ts` — walks the route's
transitive **value**-import graph (31 files) and scans the SQL it can reach.

⭐ **THE LAW:** *the developmental Ask route may write conversation and explicit
records of authority and accountability; it may never mutate the Work.*

Permitted family, one reason each — `ask_threads`, `ask_turns` (the
conversation) · `ask_authorization_acts` (the opportunity's identity) ·
`ask_authorization_consumptions` (the first durable fact a human acted, and its
completion) · `runtime_consent_state` (what the crossing was evaluated against)
· `context_disclosure_receipts` (the accountability record).

The eleven Work tables are ALSO named explicitly and asserted absent, and the two
sets are asserted disjoint — so a guard accidentally reduced to a tautology still
fails. Comments are stripped before every scan (the C21 lesson).

⭐ **`askRuntimeCannotWrite` IS UNCHANGED — not even by one allowlist entry.** Its
claim over `lib/manuscript/ask` (thread and turns, nothing else) is true,
load-bearing, and still true. ⛔ Weakening a constitutional instrument so a new
change can pass it is the move this lane exists to refuse. The route is simply no
longer as narrow as the library, and that needed a law at its own address.

### 2.4 `G12`

`tests/constitutional/s3-substrate/guards.ts` gains **G12 — the turn, the
confirmations and the completion commit together or not at all**: the swallowing
forms are unreachable from the route; all three `…WithClient` symbols sit inside
the transaction; the confirmation returns `Promise<void>`; and the two failure
modes throw `CompletionNotRecorded`. **G10 was updated to track the renamed call
— its law is unchanged.**

---

## 3. Evidence recorded here

| Gate | Result |
|---|---|
| Freeze diff vs `2255b60d` over `tests/constitutional/s3/` + `tsconfig.s3-constitutional.json` | **EMPTY** |
| `tsc -p tsconfig.s3-constitutional.json` | **exit 0** |
| `tests/constitutional/s3/matrix.ts` | **LETHAL + DISCRIMINATING · reference clean** |
| `tests/constitutional/s3-substrate/guards.ts` | **12/12** |
| G12 discrimination probe (route reverted to the boolean form) | ⛔ **G12 FAILS**, restored → passes |
| Effect-guard discrimination probe (a Work `UPDATE` planted in the graph) | ⛔ **FAILS on both checks**, restored → passes |
| `askRuntimeCannotWrite` table + symbol checks re-run | **PASS, instrument unchanged** |

⚠️ **NOT REPORTED AS A TYPECHECK PASS.** The four changed source files produce
**five diagnostics, all `TS2307` unresolvable modules** (`next/server`,
`next/headers`, `pg`, `@anthropic-ai/sdk`) — this container has no project
`node_modules`. Zero real diagnostics, but the founder's run is the evidence of
record. The new test sits under `lib/**/__tests__/**` and `**/*.test.*`, both
excluded from `tsconfig.ship.json`, so it cannot move the baseline.

⛔ **NOTHING WAS EXECUTED AGAINST A DATABASE.** R1–R12, the post-repair F8
witness, and re-runs of RI-X1 and RI-X2 all need a disposable shadow and are
**OWED**.

---

## 4. Standing

**ROUTE INTEGRATION REPAIR BUILT · GUARDS 12/12 · SIBLING EFFECT GUARD LANDED ·
FROZEN SUITE UNTOUCHED · ⛔ R1–R12 + POST-REPAIR F8 + RI-X1 + RI-X2 UNRUN ON THIS
CANDIDATE · ⛔ MERGE NOT AUTHORIZED · ⛔ SCHEMA DEPLOY NOT AUTHORIZED · ⛔
PRODUCTION UNTOUCHED.**
