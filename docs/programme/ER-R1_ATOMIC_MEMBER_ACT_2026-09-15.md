# ER-R1 · SERVICE SEAM + ATOMIC MEMBER ACT

**Date** 2026-09-15 · **Branch** `claude/ws-editorial-runtime-01` (from `94fca2303`)
**Canonical base** `53cd18524` · **Authorized** founder, 2026-09-15.

```
ER-R1 database witness    18 passed · 0 failed   BEHAVIOURAL, real PostgreSQL
ER-F1 … ER-F8             green · 7/7 candidates killed · 0 unclassified
carried seals             144 / 144
```

⛔ **NO PRODUCER REGISTRATION. NO COGNITION. NO MAIA OUTCOMES. NO ROUTE. NO UI.
NO PRODUCTION CHANGE.**

> ***The writer can say something, explicitly declare that saying as a Direction
> when they choose, and the database either remembers the ENTIRE authored act or
> remembers NONE of it.***

---

## 1 · ⭐⭐ The load-bearing repair the founder named

`createMemberDirection()` wrote through the **pool-level `query`**, while
`appendTurnWithClient()` correctly accepts the caller's transaction. An atomic
act built from both as-is would have written **the turn inside the transaction
and the Direction outside it** — and `ER-F7` would have read green while being
**false**, because the turn alone would survive a Direction refusal.

**Repaired without a second INSERT.** `insertDirection` now takes an
`SqlExecutor` as its first parameter; there is still exactly **one** Direction
INSERT in the codebase.

⭐ **`SqlExecutor` was already imported in that file** — the W5-4 seam declared
it. The abstraction was not invented here; a redundant second import was written
and removed. *Two statements that must agree is the shape drift arrives in.*

Public seams preserved: `createMemberDirection` / `createMaiaDirection` are
unchanged in signature and now delegate with `{ query }`. One new seam,
`createMemberDirectionWithExecutor`. ⛔ **No MAIA executor variant** — MAIA's
turn is the next cut, and *a seam added before the act that needs it is a place
a future caller can assert something nobody authorized.*

---

## 2 · The act

`persistMemberEditorialAct({ memberId, threadId, act })` —
`lib/manuscript/editorialRuntime/memberAct.ts`.

⭐⭐ **The chain is DERIVED from the owned thread, inside the transaction:**

```sql
SELECT proposal_chain_id FROM ask_threads WHERE id = $1 AND member_id = $2
```

⛔ A caller-supplied chain id would let one member's thread bind to a chain about
someone else's Work — the 01A.1 wrong-Work substitution arriving through the
runtime instead of through persistence. Ownership is in the **SQL predicate**,
not a precheck a caller could skip. ⭐ `NULL` there is not an error state: it is
an **anchored** Ask thread, a perfectly good thread with no editorial subject →
`not_editorial`.

```
discourse   BEGIN  append member ask_turn                                COMMIT
direction   BEGIN  resolve owned editorial thread → its proposal_chain_id
                   append member ask_turn
                   create member Direction   instruction = text EXACTLY
                                             refersTo    = refersTo EXACTLY
                   insert editorial_turn_binding
                     same thread · returned turn_index · author · same chain
                     · member · direction_id · version_id NULL           COMMIT
```

⛔ **No `.trim()` on what is stored. No paraphrase. No focus-default for
`refersTo`. No prose classifier. No post-write extraction.** The only thing
consulted is `act.act`; `act.text` is written and never read for meaning.

⭐ `.trim()` appears once — to **ask** whether the instruction is empty, never to
change the answer that gets stored.

⛔ **The binding's denormalised columns are fixed in the function, never passed
in.** `turn_speaker='author'` and `act_author='member'` are facts about which
function is running, and the schema FK-verifies each against its own source row,
so a wrong value **does not insert** rather than being trusted.

⛔ **The refusal is thrown inside the transaction and caught outside it.** A
politely-returned refusal would commit the half-written act — the exact defect
the W5-4 seam was built to refuse.

⚠️ **What this cut does not answer**: an editorial turn's `staleness` is written
`UNMEASURED` — *every dimension unmeasured, the honest starting point, never a
default answer*. What staleness **means** for a thread whose subject is a
proposal chain rather than a reading is a real question, and inventing a value
here would have answered it by accident.

---

## 3 · `ER-F7` is now database evidence

`scripts/witness/er-r1-member-act-witness.ts` — real PostgreSQL 16.13, real
transactions, counts read back from the tables afterwards.

**The positive halves**

- declared **discourse** → `1 turn · 0 Direction · 0 binding`, on prose that
  reads exactly like an instruction (*"Could you make this quieter?"*)
- declared **Direction** → `1 turn · 1 Direction · 1 binding`, and
  ⭐⭐ `instruction === turn body` character for character, with the member's
  leading and trailing whitespace intact; binding reads `author/member`,
  `version_id` NULL

**The three refusal positions — every one `turn 0 · Direction 0 · binding 0`**

| | refusal | where it lands |
|---|---|---|
| **R1** | foreign member → `thread_not_found` | the turn cannot be written at all |
| **R1b** | anchored thread → `not_editorial` | before anything is written |
| **R2** | `refersTo` a version in **another chain** | ⭐⭐ **after** the turn insert — and the turn that had already been written is **gone** |
| **R3** | the binding itself refuses | ⭐⭐ **after** turn *and* Direction — **both gone** |

⛔ **R3's fault is disposable-only** — a trigger installed by the witness,
dropped in a `finally`, on a database whose name must contain `witness`, which
is then dropped. ⭐ **No production fault hook exists**; the 2026-09-10 lesson
was that a witness which mutates a database anyone uses is a witness that can
wedge it. `R3b` then proves the fault is gone and the act lands again.

### ⭐ An instrument defect a rerun found, and what it revealed

The first version **passed on a fresh database and died on a duplicate key the
second time.** The obvious repair — delete the fixtures first — **is impossible
by design**: `proposal_chains` is append-only and Directions are refused DELETE
by `authored_editorial_record_immutable`.

⭐⭐ *An authored editorial record cannot be removed by anything — including its
own witness.* So the witness now **refuses a dirty database by name** and points
at `scripts/witness/er-r1-rebuild-db.sh`, rather than reporting a result that
depends on whether it has run before. Proven repeatable across rebuild cycles.

⚠️ **Noise, reported rather than hidden**: R3's expected fault is logged by
`query()` as a `console.error` with SQL and params — the S3 expected-refusal
disposition, one layer down. It is a disposable witness fault, so this is noise
and not a leak; the disposition itself remains open and is not repaired here.

---

## 4 · Standing

```
WS-EDITORIAL-RUNTIME-01
  falsifier suite             ✅ ER-F1…ER-F8 · 7/7 killed
  ER-CARRY-01                 ✅ CLOSED · 20/20 · 144/144
  ER-R1 service + member act   ✅ 18/0 on a real database

producer registration          ⏸ next runtime cut
cognition assembly             ⏸
MAIA three outcomes            ⏸
thin route                     ⏸
UI / Canvas · Adopt · legacy   ⛔
production deployment          ⛔ NONE
```

> ***The runtime does not decide that an utterance was a steering act. It carries
> the act the writer declared — whole, or not at all.***
