# ER-R3 · MAIA'S DURABLE OUTCOMES + EXACT PREDECESSOR CUSTODY

**Date** 2026-09-15 · **Branch** `claude/ws-editorial-runtime-01` · **Canonical base** `53cd18524`
**Authorized** founder, 2026-09-15.

```
ER-R3 outcome witness    28 passed · 0 failed    BEHAVIOURAL, real PostgreSQL
ER-R2 assembly witness   38 passed · 0 failed
ER-R1 member-act witness 18 passed · 0 failed
ER-F1 … ER-F8            green · 7/7 killed · 0 unclassified
carried seals            145 / 145
targeted typecheck       exit 0
```

⛔ **NO MODEL HANDOFF. NO ROUTE. NO UI. NO ADOPTION. NO PRODUCTION CHANGE.**

---

## 1 · Two executor repairs, and only two

```
createMaiaDirectionWithExecutor()        editorialWorkspace/store.ts
appendAuthoredVersionWithExecutor()      proposalChain/store.ts
```

⭐ **One implementation each, verified by count**: exactly one
`INSERT INTO proposal_versions` and one `INSERT INTO proposal_chain_directions`
remain in the codebase. Both public pool-level seams keep their signatures and
now delegate.

⭐ The MAIA direction executor is added **now that the act needing it exists**.
ER-R1 deliberately did not add it, and the comment saying why was replaced by
the seam itself — *a seam added before the act that needs it is a place a future
caller can assert something nobody authorized.*

⛔ **`appendAuthoredVersionWithExecutor` preserves every step**: lock the owned
chain `FOR UPDATE` with `member_id` in the predicate → read every version inside
that lock → `validateChain` → `appendVersion` on the **author-stated**
predecessor → INSERT.

> ***The store may REREAD current succession to judge whether MAIA's stated
> predecessor is still lawful. It may NOT use that reread to choose a different
> one.*** That distinction is the whole of §2, and it is the same one the
> 2026-09-14 merge blocker was about: *lock acquisition inventing history.*

---

## 2 · ⭐⭐ The invocation is frozen before cognition

```ts
{ chainId: assembly.chainId, threadId,
  authoredAgainstVersionId: assembly.invokedAgainstVersionId }
```

It travels through cognition and comes back unchanged. The proposal write
receives `invocation.authoredAgainstVersionId` **byte-for-byte, as an identity
value**.

⛔ No assembly rerun · ⛔ no head substitution · ⛔ no rebase · ⛔ no retry.

⭐ If the chain moved while MAIA was thinking, `appendVersion` refuses with
`not_successor_of_head` and **the whole outcome rolls back**. That is the right
answer, not a limitation: *MAIA authored against what she was shown, and a
proposal silently rebased onto wording she never saw is a proposal she did not
make.*

---

## 3 · Admission before persistence, visibly separate

```
StructuredBlock[] → admitEditorialToolEnvelope() → EditorialOutcome
                                                 → persistMaiaEditorialOutcome()
```

⭐ `persistMaiaEditorialOutcome` takes an **already-admitted** `EditorialOutcome`
and never a `StructuredBlock[]`, so there is **nowhere** for a refused envelope
to be rescued by reading what MAIA happened to write. The admitter's refusals
reach no transaction at all.

**Refusals abort; they are never politely returned inside the transaction.** A
typed refusal from either store is **thrown** inside and translated outside —
otherwise MAIA's turn would commit while its declared adjunct did not.

⛔ Binding facts are fixed by the service: `turn_speaker = 'maia'`,
`act_author = 'maia'`, never accepted from a caller. The MAIA turn uses
`UNMEASURED`, as ER-R1 does; ⛔ this cut invents no editorial-staleness
semantics.

⛔ And the thread must be editorial **and** be about `invocation.chainId` —
proving only the first would let an outcome authored against one chain land on a
thread about another.

---

## 4 · The witness · `28 passed · 0 failed`

**Admission** — text-only refused `not_through_tool` · two tool calls refused ·
two adjuncts refused · ⭐⭐ **and none of them reached a transaction**, counts
unmoved.

**The three outcomes** — `reply_only` → `1/0/0/0` · `reply_with_direction` →
`2/1/0/1` with the instruction **verbatim** · `reply_with_proposal` → `3/1/1/2`,
and ⭐⭐ on a **zero-version chain** the first proposal is the **root**,
`supersedes` NULL. A second proposal against an unchanged head stores
⭐⭐ `supersedes === the frozen invocation id`.

### ⭐⭐ The ER-F4 race, as real PostgreSQL evidence

```
assemble → frozen against ROOT
V2 appended independently, "while MAIA is thinking"
persist with the frozen invocation

C2  ⭐⭐ REFUSED · not_successor_of_head
C3  ⭐⭐ the ENTIRE outcome rolled back — turn, version and binding
C4  ⛔ no rebase: MAIA-STALE exists nowhere in the database
C5  ⭐ V2 untouched and still the head
C6  ⛔ the frozen invocation was not mutated by the attempt
```

⭐ `ER-F4` modelled this in-process against a test double. **It is now the
database's own behaviour.**

**Refusal positions after the turn is already written** — a Direction
referencing another chain's version → rollback, MAIA's turn gone too · an
invocation naming the wrong chain → `invocation_mismatch`, nothing written · a
binding refusal after the adjunct → rollback, turn *and* Direction gone.

⛔ The binding fault is a **disposable-only** trigger, installed and dropped in a
`finally`, on a `*witness*`-named database. ⭐ **No production fault hook
exists**, and `D3b` proves the fault is gone and the outcome lands again.

⚠️ **Reported rather than hidden**: every governed refusal prints
`❌ [POSTGRES] Transaction rolled back: …` through `transaction()`'s own logging.
That is the S3 expected-refusal disposition surfacing again — a refusal working
exactly as designed, logged as though it were an error. It stays **open and
unrepaired** here; this lane does not own it.

---

## 5 · Standing

```
WS-EDITORIAL-RUNTIME-01
  falsifier suite      ✅ ER-F1…ER-F8 · 7/7 killed
  ER-CARRY-01          ✅ CLOSED
  ER-R1 + R1.1         ✅ 18/0
  ER-R2                ✅ 38/0
  ER-R3                ✅ 28/0 — the durable editorial verb is complete

model / provider handoff   ⏭ next: connect canonical cognition to this verb
thin HTTP route            ⏸
UI · Adopt · legacy        ⛔
production deployment      ⛔ NONE
```

> ***MAIA answers through a tool or she does not answer. What she authored, she
> authored against what she was shown — and if the Work moved underneath her,
> the whole turn is withdrawn rather than quietly re-aimed.***
