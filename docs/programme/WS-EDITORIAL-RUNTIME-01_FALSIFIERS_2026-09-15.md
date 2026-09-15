# WS-EDITORIAL-RUNTIME-01 · THE FALSIFIERS, BEFORE THE IMPLEMENTATION

**Date** 2026-09-15 · **Branch** `claude/ws-editorial-runtime-01` · **Base** canonical
`53cd18524` · **Authorized** founder, 2026-09-15.

```
npm run matrix:editorial-runtime
⭐ LETHAL AND DISCRIMINATING · 0 failures
```

⛔ **NO IMPLEMENTATION. NO ROUTES. NO UI. NO PRODUCTION CHANGE.** The founder's
first instruction was to prove the semantic boundary *before* implementing, and
that is all this act does.

---

## 1 · ⚠️⚠️ THE FINDING THAT MUST BE RULED ON BEFORE IMPLEMENTATION

**Canonical carries the schema and none of the code that can reach it.**

```
ON CANONICAL 53cd18524
  ✅ all seven migrations — chains · versions · insights · directions ·
     bindings · the subject XOR · the four UNIQUE targets
  ✅ ask_threads / ask_turns runtime (threadStore.ts)
  ✅ the cognition seam (lib/ai/structured/router.ts, developmentalAskReader.ts)
  ✅ lib/maia/canonical-turn
  ⛔ NOTHING that can read or write a single editorial object
  ⛔ the four editorial producer ids: unregistered anywhere

ABSENT FROM CANONICAL, on claude/w4-2-schema-design
  20 files · 6,303 lines
    editorialDiscourse/     contract.ts (1158) + its 722-line seal
    editorialWorkspace/     ontology.ts · store.ts + seal
    proposalChain/          contract · store · succession · proposalWork ·
                            proposalWorkTarget · editorialSubject + seal
    revisionAuthorization/  contract · store · execute · executionFit ·
                            status + seal            (1,713 lines)
    + exactText.ts · sections/coordinateSpace.ts
```

⭐ **This is not a complaint about the carrier — the narrow carrier was correct.**
It is the consequence: W5-LANDING and W4-SCHEMA-LAND deliberately carried
migrations, records and witnesses and nothing else, so the ruled, sealed
*seams* stayed where they were authored.

⛔ **The runtime cannot be written without them, and it must not rebuild them.**
Rebuilding `contract.ts` or `proposalChain/store.ts` would create **a second
independently falsifiable answer to a question already ruled** — the exact
defect this programme refused when it deleted `lineageOrder()` for being a
second succession resolver.

**So the carry-forward is a scope question, and it is the founder's.** ⛔ I did
not perform it: the files were pulled into a working tree to measure the
closure, then removed. Nothing in this commit depends on them.

### ⭐ And the closure is larger than it looks — a seal proved it

Carrying the first twelve files and running their own seals gave
**`112 passed · 1 failed`**. The failure is not a defect in the code:

```
ontology.test.ts → ENOENT lib/manuscript/revisionAuthorization/store.ts
```

A **source-level pin against a file that was not carried.** ⭐ The seal
correctly reported an incomplete carry-forward rather than passing over it —
and that is how `revisionAuthorization/` (six files, 1,713 lines) entered the
count at all. *A closure guessed from directory names was wrong by a third.*

---

## 2 · The law this lane exists to preserve

> ***A semantic editorial act is DECLARED. It is never DERIVED FROM TEXT.***

Both halves, and they are one law from two sides:

```
member   "Could you make this quieter?"   → ⛔ NO Direction
         unless the act DECLARED `direction` at the time of the turn

MAIA     "I might tighten this paragraph…" → ⛔ NO ProposalVersion
         unless the structured outcome DECLARED `reply_with_proposal`
```

⛔ If the system decides an utterance *was* a Direction, then the system — not
the member — authored a steering act.

---

## 3 · The suite · `ER-F1 … ER-F8`

| | law |
|---|---|
| **ER-F1** | ⛔ member prose that **sounds** directive, declared as discourse, mints no Direction |
| **ER-F2** | ⭐ a declared Direction carries the turn body **character for character** |
| **ER-F3** | ⛔⛔ MAIA prose that **sounds** like a suggestion, under `reply_only`, mints no ProposalVersion |
| **ER-F4** | ⭐⭐ a proposal succeeds the **exact predecessor MAIA was invoked against** — no head lookup |
| **ER-F5** | ⛔ at most **one** semantic adjunct per MAIA turn |
| **ER-F6** | ⛔⛔ **no late extraction** — observing stored discourse mints nothing |
| **ER-F7** | ⛔ the member act is **atomic** — a refusal lands nothing, not even the turn |
| **ER-F8** | ⭐ a **declared** MAIA Direction is representable — restraint is not the only lawful outcome |

⭐ `ER-F1` and `ER-F3` use text chosen to read *exactly* like the act it must not
become. A falsifier whose fixture prose is neutral cannot fail a classifier.

⭐ `ER-F8` exists so the suite cannot be satisfied by a runtime that simply never
does anything. *A law that only forbids is passed by paralysis.*

---

## 4 · Lethality — seven defeat candidates, seven kills

⛔ **Known-bad RED is vacuous here**: the protocol does not exist, so a test that
fails because nothing is implemented proves only that nothing is implemented.
Every obligation therefore carries a **defeat candidate** — a plausible,
competent, *wrong* runtime that passes the rest of the suite and fails this one.

| candidate | dies on | the error it models |
|---|---|---|
| DC-1 prose-directive classifier | `ER-F1` | classifies member prose into a steering act |
| DC-7 host-normalised instruction | `ER-F2` | the host rewrites the member's words (a `.trim()`) |
| DC-2 MAIA prose scraper | `ER-F3` | lifts quoted wording out of MAIA prose |
| DC-3 post-cognition head rebase | `ER-F4` | reads the head *after* cognition and rebases |
| DC-4 two adjuncts on one turn | `ER-F5` | honours both when both are present |
| DC-5 late extraction on observe | `ER-F6` | a tidy-up pass that mints Directions |
| DC-6 non-atomic member act | `ER-F7` | writes the turn separately from its declared adjunct |

**Every candidate died on its named falsifier, and no candidate produced
unclassified collateral** — each is narrow enough to isolate one error while
still being a competent embodiment of it.

⭐ **DC-7 is the quiet one.** Its whole error is `act.text.trim()`. It looks like
hygiene; it means the Direction's words are the host's, not the member's.

---

## 5 · ⛔ What this matrix does NOT establish

- **The reference is a TEST DOUBLE, not a seed.** No database, no transaction,
  no schema. It proves the eight laws are mutually **satisfiable** — ⛔ never how
  to implement them, and ⛔ the implementation may not be derived from it.
- **`ER-F7` models atomicity in-process.** A real all-or-none write must be
  proved against a database in the implementation's own witness.
- ⛔ It says nothing about cognition assembly, producer registration, or the
  route — those are the implementation, and the implementation is not open.

---

## 6 · Standing

```
W5 substrate                    ✅ production
W4 semantic schema              ✅ production
W4 post-landing                 ✅ 18/0

WS-EDITORIAL-RUNTIME-01
  falsifier suite               ✅ ER-F1…ER-F8
  lethality                     ✅ 7 candidates · 7 kills · 0 unclassified
  implementation                ⛔ NOT STARTED — blocked on §1

carry-forward of the 20 seam files   ⛔ FOUNDER RULING OWED
UI · Adopt · beta witness            ⏭
```

> ***The runtime may not decide that an utterance was a steering act. It may only
> carry the act the writer declared — and the seven machines that would have
> decided instead are all dead.***
