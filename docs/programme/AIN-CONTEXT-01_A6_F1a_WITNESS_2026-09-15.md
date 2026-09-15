# `AIN-CONTEXT-01` · A6 · F1a — FALSE SELF-LOCATION WITNESS

**Date:** 2026-09-15 · **Verdict: ⭐ RED — the proposition HOLDS against untouched source.**
**Authority:** founder act 2026-09-15 — *"A6 OPEN → F1a ONLY."*
**Instrument:** `tests/constitutional/ain-context/f1a-false-self-location.ts`
**Candidate SHA:** the commit recording this witness; the measured source is the working tree
at that commit, with ⛔ **no production source, schema, prompt or serving behaviour changed.**

```text
⛔ A6 REPAIR IS NOT WRITTEN AND IS NOT AUTHORIZED.
⛔ THIS RECORD IS EVIDENCE. IT IS NOT A RULING.
```

---

## 1. The proposition, as put

> In a sufficiently long ACTIVE session, authoritative session depth exceeds the
> prompt-visible conversational window, yet cognition is given a shallow effective turn
> count and no explicit accounting of the displaced current-session material.

---

## 2. ⚠️ The first attempt was scored INSTRUMENT FAILURE and is NOT counted

The first run reported `F1a VERDICT: RED`. ⛔ **It was refused.**

`TurnsStore.addExchange` was called with a plain object literal as the turn posture.
`contentWritable` checks `posture instanceof TurnPosture` and **fails closed**, so every
one of the 400 writes was refused, `durable_turns = 0`, the history was empty, and
`self_location` was `1` — not because material had been displaced, but because **nothing
had ever been written.**

⭐⭐ **A vacuous RED is indistinguishable from a real one at the verdict line, and only at
the verdict line.** The run satisfied both clauses of the falsifier and proved nothing.

⛔ The correct response was not to accept a convenient result. Three fixture guards were
added, and they are now part of the instrument:

- **G4** — `durable_turns` must equal `exchanges × 2`, and must exceed the serving window.
  *A RED must mean "material was displaced", never "material was never written."*
- **G5** — the window must be **saturated** (`selected === 10`), or the finding is about a
  short conversation rather than about displacement.
- **G3** — a **distinct synthetic member per depth probe**, so each measured session is the
  only session its member has ever had.

⭐ The hardened instrument then **refused the next two runs** as well — first on a missing
`exchange_id` column, then after the schema was completed — rather than scoring them.
*That the guards fired before the result did is the reason this record's RED can be
believed.*

---

## 3. Shadow

```text
PostgreSQL 16, disposable cluster created for this run   server_encoding = UTF8
schema  maia_sessions      built by the application's own initializeSessionTable()
        conversation_turns built by the REAL migrations, applied in order:
          015_conversation_turns
          20260204000002_conversation_turns_meta
          20260301000001_conversation_turns_exchange_seq
          posture_at_creation + provenance  (verbatim from 20260718000001_s5_provenance_substrate)
writer  TurnsStore.addExchange           — the production writer, unmodified
counter incrementTurnCount               — the production counter, unmodified
reader  getConversationHistory(sid, 10)  — the production reader, unmodified
builder buildMaiaWisePrompt              — the production CORE prompt builder, unmodified
```

⛔ **Production untouched. No production or shadow database of record was read.** The
cluster was destroyed after the run. Fixture prose is synthetic (`F1A-MEMBER-n` /
`F1A-MAIA-n`); ⛔ no member text existed in this run, and every reported value is a count,
a boolean or an identity.

---

## 4. Guards, passed before any measurement

```text
G1  serving history limit read from source              = 10
G2  CORE self-location expression read from source      = "effectiveHistory.length + 1"
G3  members probed = 5 · max distinct sessions/member   = 1
G4  fixture persisted exactly exchanges × 2 turns       PASS at all five depths
G5  serving window saturated (selected === 10)          PASS at all five depths
```

⭐ **G1 and G2 read the limit and the expression out of production source on this run**
rather than assuming them, so a repair that moved or changed either would fail the
instrument instead of silently passing it.

---

## 5. Result — run of record

```text
depth | authoritative | durable | selected | in-prompt | self-loc | depth-sig | absence-sig | displaced
--------------------------------------------------------------------------------------------------------
   25 |            25 |      50 |       10 |         4 |       11 |      true |       false |        15
   50 |            50 |     100 |       10 |         4 |       11 |      true |       false |        40
  100 |           100 |     200 |       10 |         4 |       11 |      true |       false |        90
  150 |           150 |     300 |       10 |         4 |       11 |      true |       false |       140
  200 |           200 |     400 |       10 |         4 |       11 |      true |       false |       190

(a) authoritative depth > self-location given to cognition : 5/5 depths
(b) NO absence accounting reaches the prompt               : 5/5 depths

F1a VERDICT: RED — the proposition HOLDS against untouched source. The defect is present.
self-location distinct values across depths 25/50/100/150/200 : 11  (saturating = true)
```

**Evidence class per column.** `authoritative` · `durable` · `selected` · `in-prompt` ·
`depth-sig` · `absence-sig` are **WITNESSED** — produced by executing production code on
this run. `self-loc` is **ENTAILED** — the CORE `summary` expression, read out of
production source on this run (G2) and evaluated against the WITNESSED `selected`.
⛔ Entailment from source that has been read is honest evidence; calling it witness is not.

---

## 6. What the numbers say

**⭐⭐ 6.1 — Self-location saturates at 11 and never moves.** Across a span from 25 to 200
turns — an eightfold difference — the value reaching cognition is **11 at every depth**.
`saturating = true`. At depth 200, cognition is located at turn 11 while 190 exchanges of
the same active session sit durable and unread.

**⭐⭐ 6.2 — MAIA is not told nothing. She is told something false.** `depth-sig = true` at
every depth: a depth statement **does** reach the prompt. It is simply wrong. ⭐ This is
sharper than ACT 1's framing and it matters for A6's design: the repair is not *add a
depth signal*, it is *make the depth signal true*. A system given no number might hedge;
a system given a confident wrong number has no reason to.

**⭐ 6.3 — A second narrowing, witnessed.** `selected = 10` but `in-prompt = 4`. Six of the
ten exchanges the serving path loads are discarded again by the prompt builder's own
`slice(-4)`. Both narrowings are live and they compose. The 10-exchange window is not the
floor; **4 is.**

**⭐⭐ 6.4 — Absence is never represented.** `absence-sig = false` at every depth, against
**six deliberately generous probes**. At depth 200, nothing in the assembled prompt
distinguishes *190 exchanges exist and are not here* from *190 exchanges do not exist*.
That is R1's first and second epistemic conditions collapsed — the exact collapse the
ratified invariant forbids.

**6.5 — The RED does not depend on cross-session memory.** Each depth used its own
synthetic member with exactly one session (G3). No cross-session carrier was invoked,
none could have contributed, and the failure belongs to the active session alone — as the
authorization required.

---

## 7. ⭐ One structural observation, routed out

`MaiaContext` declares `turnCount?: number`. On the serving path it is **never assigned the
authoritative value**, and `buildMaiaWisePrompt` **never reads it**. The only depth signal
reaching the CORE prompt is the prose string inside `summary`.

⚠️ **The slot for the true value already exists, empty, in the type the prompt builder
receives.** ⛔ Recorded as an observation about where a repair could sit. ⛔ It is **not** a
design decision and confers no authority: a field being conveniently present is not
evidence it is the right carrier — the near-match discipline from ACT 2 §6.1 applies to
this as much as to `memory_type = 'correction'`.

---

## 8. Reproduction

```bash
# disposable cluster; then, with DATABASE_URL pointed at it:
npx tsx tests/constitutional/ain-context/f1a-false-self-location.ts
# exit 0 = RED (proposition holds) · 1 = NOT RED · 2 = INSTRUMENT FAILURE
```

⚠️ The instrument requires `pg` and a TypeScript runner. This container had no
`node_modules`; they were installed into a scratchpad and linked in for the run, and the
link was removed afterwards. ⛔ **The founder's own run is the evidence of record** —
*"I happened to have TypeScript installed" is not an instrument.*

---

## 9. Verdict and stop

```text
F1a                       RED · the defect is present on untouched source
Proposition               HOLDS at 25 / 50 / 100 / 150 / 200
First attempt             INSTRUMENT FAILURE · not counted · guards added
Guards                    G1-G5 PASS
Cross-session dependence  NONE (required by the authorization; established by G3)
Shadow                    DESTROYED
Production                UNTOUCHED
A6 repair                 ⛔ NOT WRITTEN · ⛔ NOT AUTHORIZED
```

Per the authorization: evidence preserved, verdict classified, **stopping here.**

> A separate founder ruling is required before implementation proceeds.

Owed at that ruling, and deliberately not answered here: whether the proposed A6 repair
attacks this mechanism cleanly — in particular whether it satisfies acceptance clause (2)
(*depth and selected evidence distinguishable as two facts, never one number*) given §6.3,
where **two** narrowings compose, and clause (3) (*incompleteness as positive evidence*)
given §6.4.
