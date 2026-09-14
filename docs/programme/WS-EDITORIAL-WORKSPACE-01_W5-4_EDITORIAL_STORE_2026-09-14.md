# W5-4 — EDITORIAL RECORD STORE SEAM

**Programme** `WS-EDITORIAL-WORKSPACE-01`
**Date** 2026-09-14
**Authorized by** founder act, 2026-09-14
**Base** `1b33b724d` (W5-Z0) → `303212ae7` (W5-3 schema custody tip)
**Branch** `claude/w5-4-editorial-runtime-store`

---

## 1. The governing sentence

> Opening an editorial relationship and recording the first thing MAIA actually
> saw must be **one durable act**; failure may leave neither half pretending the
> other happened.

W5-Z0 made a zero-version chain **mountable**. That is precisely what makes a
half-written open dangerous rather than merely untidy: the Canvas would show the
writer a durable editorial relationship for which nobody authored any editorial
act, and it would look completely ordinary.

---

## 2. What this act builds — server persistence only

| Seam | Shape |
|---|---|
| `createInsight(memberId, chainId, observation)` | `author = 'maia'` fixed **here**; identity and time minted by the database |
| `readInsights(memberId, chainId)` | `member_id` **in the predicate** |
| `createMemberDirection(…)` / `createMaiaDirection(…)` | **two functions**, never one taking an `author` field |
| `readDirections(memberId, chainId)` | `member_id` in the predicate |
| `openChainWithInsight(memberId, input, observation)` | one transaction: chain + first Insight, or neither |

**⛔ Not built, deliberately:** no HTTP routes (`POST /insights`,
`POST /directions`, `POST /editorial-chain`), no `openThread()` change, no
chain-bound discourse, no MAIA generation, no Canvas change. Those raise
questions this act has not earned — who may speak as MAIA · what member gesture
authors a Direction · what Work and locus a request may bind · which canonical
turn produced the record. W4 owns them.

**⛔ No chronology.** No `latestInsight`, `currentInsight`, `activeInsight`,
`currentDirection`, `latestDirection`; no `spent`, `answered` or `open` state;
no cross-object editorial timeline. Both reads are `ORDER BY id` — presentation
only, exactly as `readChain()` documents, and **not** `authored_at`: ordering an
authored record by its own timestamp is the inference
`proposalChain/store.ts` constraint 1 forbids, and the nearest column is always
the most tempting way to commit it.

### Two decisions worth stating

**The foreign-key violation is the authority, not a precheck.** The Circles
FR-18 lesson applied: a `SELECT … WHERE member_id` followed by an unconditional
INSERT is two facts with a gap between them. The composite FK
`(member_id, proposal_chain_id) → proposal_chains (member_id, id)` proves
ownership *at write time*, and the refusal is read off the constraint that
refused it. ⛔ Only `23503` maps; everything else rethrows. The constraint
**name** separates the two composite keys, so a chain-ownership failure is never
reported as a bad version reference or the reverse.

**`openChainWithInsight` does not catch the Insight failure.** `transaction()`
commits when its callback returns and rolls back only when it throws — so a
refusal returned politely would **commit the orphan chain**. There is
deliberately no `ok:false` path that could leave a chain standing.

---

## 3. No duplicated chain persistence (Z4)

`openChain()` was refactored into an executor-aware primitive:

```
openChainWithExecutor(exec, memberId, input)     ← the ONE chain INSERT
        ├── openChain(memberId, input)               { query }   · public, unchanged
        └── openChainWithInsight(...)                 tx         · atomic reuse
```

`insertInsight(exec, …)` follows the same shape for the same reason. The witness
pins that the chain adapter holds **exactly one** `INSERT INTO proposal_chains`,
that the editorial store holds **none**, and that there is **one** insight
insert. `openChain()`'s public semantics — arguments, statement, hydration,
autocommit-per-call — are unchanged (Z3).

---

## 4. Evidence

`scripts/witness/w5-4-editorial-store-witness.ts` — **38 passed · 0 failed**
(disposable **W5 schema** database only; rebuild via `w5-rebuild-db.sh`).

All obligations BEHAVIOURAL except Z4 (labelled SOURCE-LEVEL: *"no second chain
INSERT exists"* is a claim about the codebase that no runtime behaviour can
establish).

**R3 runs against a genuinely broken substrate** — the tables are renamed out
from under the reads and restored in a `finally`. That is the 2026-09-10 walk-12
shape, so it is bounded by the disposable-database guard and ⛔ must never point
at a database anyone uses.

`scripts/witness/w5-4-mutations.sh` — **9 killed · 0 survived · 0 crashed · 0 stale**

| Mutant | Killed by |
|---|---|
| `M-W5-ORPHAN-CHAIN` | Z2 (+ Z1, Z3b) |
| `M-W5-INSIGHT-AUTHOR` | I2c |
| `M-W5-DIRECTION-AUTHOR` | D1 |
| `M-W5-FOREIGN-REFERENCE` | D5 |
| `M-W5-FOREIGN-REFERENCE-EVADE` | D4, D4b, D5b |
| `M-W5-CONVERT-INSIGHT` | I4, Z1 |
| `M-W5-CONVERT-DIRECTION` | D6, D4b (+ D1, D2, D3) |
| `M-W5-FOREIGN-READ` | R1 |
| `M-W5-EMPTY-ON-DB-FAIL` | R3 |

**Prior witnesses, re-run unchanged:** succession store `26/0` and its mutations
`12 killed · 0 survived` (the store was refactored, so this is the load-bearing
no-regression evidence) · 01A `18/0` · 01A.2 `13/0` · 01B.0 `7/0` · Step 2
integration `20/0` · W2 `12/0` · W5-Z0 `38/0` · runtime-seam mutations
`6 killed · 0 survived · 0 crashed` · W5-3 schema `36/0`.

**Repo gates:** typecheck *no regressions* · no-supabase clean · scoped jest
`23 failed · 3006 passed` — identical to the W5-Z0 baseline, i.e. the same 4
held pre-existing red obligations and no new ones.

---

## 5. Three instrument findings, reported not smoothed

### 5.1 ⚠️ A mutation run was WITHDRAWN, not relabelled

The first `9 killed · 0 survived` run was taken against a witness whose **clean
baseline was already red**: my new I2c probe wrote a third Insight into the
shared fixture chain, and I5 and R3b — which count that chain's record —
failed on the correct implementation.

> An obligation that changes the fixture it is measured beside is an obligation
> that breaks its neighbours, and every mutant killed beside it is killed by
> accident.

I2c now opens its own chain. The run reported above is the re-run after that
repair, against a clean `38 passed · 0 failed`.

### 5.2 ⚠️ Two mutants CRASHED, and a crash judges nothing

`M-W5-CONVERT-INSIGHT` and `M-W5-CONVERT-DIRECTION` manufacture a
`ProposalVersion`; that row then collides with the one-root index when the
witness lays its *next* fixture, so `main()` rejected with exit 2 and the
harness reported CRASHED. Repaired twice over — the 01B.0 lesson, applied
again:

- an unexpected throw is now a **named failing obligation** (*"the witness could
  not complete — every obligation after this point was NOT judged"*), so the run
  finishes and the harness can judge it;
- and each creation call a mutant can make throw is wrapped, so the **substantive**
  obligation still fires. `M-W5-CONVERT-DIRECTION` is now killed by D6 and D4b,
  not by the catch-all. A mutant killed only by *"the witness could not
  complete"* is killed for the wrong reason.

### 5.3 ⚠️ A mutant SURVIVED because it changed no behaviour

`M-W5-INSIGHT-AUTHOR` first only added a **defaulted** `author` parameter and
ignored the value. `Function.length` counts parameters before the first default,
so the arity obligation read 3 either way, and no behavioural probe could see it.
The operator now writes what it is handed, and **I2c** pushes a fourth argument
at the seam exactly as a forwarding route would — the record must come back
`maia`. ⛔ A mutant that changes no behaviour is not a weaker mutant; it is a
mutant the witness cannot be asked to kill.

### 5.4 ⚠️ And one C21-class error in my own witness

I4b originally scanned the Insight record for `authoriz` — which matched
`__notAuthorizable`, the one field whose entire purpose is to declare that the
object is **not** authorizable. A prohibition firing on the field that states the
prohibition. Re-asserted as the whole shape: the record has exactly
`__notAuthorizable · author · authoredAt · chainId · id · observation`, and there
is nowhere for wording to live.

---

## 6. Standing after this act

```
W5-3 schema                          ✅ CLOSED · 303212ae7 · custody sealed
W5-Z0 chain-level subject            ✅ CLOSED · 1b33b724d
W5-4 editorial record store seam     ✅ IMPLEMENTED · 38/0 · 9 killed

W4 chain-bound discourse/openThread  ⛔ not authorized
01B execution-response recovery      ⛔
W6 decision experience               ⛔
W7 legacy retirement                 ⛔

W5-SCHEMA-LAND                       ⛔ future explicit founder act
canonical merge                      ⛔
ordinary deployment                  ⛔
protected migration execution        ⛔
production                           UNTOUCHED
maia_focus_witness                   FROZEN
```

W5 is now ready to hand to W4:

```
chain identity                     ✅
Insight persistence                ✅
Direction persistence              ✅
zero-version MAIA Insight act      ✅
candidate wording succession       ✅
member counter-formulation         ✅

chain-bound conversation           ⛔ W4
canonical MAIA response            ⛔ W4
Direction → response relationship  ⛔ W4
Insight → producing turn relation  ⛔ W4
```

`openThread()` may acquire the chain binding at W4 — **not one act sooner**.

---

## 7. Open, and named

- **Nothing calls these seams yet.** That is the act's shape, not an oversight:
  creation authority stays internal until W4 decides who may speak as MAIA and
  what member gesture authors a Direction.
- **`refusalFor` keys on the constraint name.** If a migration ever renames
  `proposal_chain_directions_version_fkey`, `reference_not_in_chain` silently
  degrades to `chain_unknown`. D5 is the falsifier that would catch it, and it
  runs against the real constraint — but the coupling is real and is recorded
  here rather than left implicit.
