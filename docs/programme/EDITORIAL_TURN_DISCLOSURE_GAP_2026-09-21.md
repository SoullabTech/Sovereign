# Editorial Turn — Disclosure Gap

**2026-09-21** · found by source inspection while tracing the boundary before a
live manuscript request · **READ ONLY, NO CODE CHANGED**
**Standing** ⚠️ **GAP ESTABLISHED IN SOURCE** · ⛔ INTENT NOT ESTABLISHED ·
⛔ NO REPAIR · ⛔ W1 HELD PENDING A RULING

---

## What was traced, and why before rather than after

W1 of `WS-EDITORIAL-SCOPE-01` sends a real passage of an authored manuscript to
an external provider. Before doing that a second time, the disclosure path was
traced. ⭐ The question was not whether the laws under test work — it was
**whether the crossing they operate inside is recorded at all.**

## The finding

**The editorial turn route creates no `context_disclosure_receipts` row.**

Import closure, checked at every level of the path:

| file | disclosure import |
|---|---|
| `app/api/writers-studio/editorial/turn/route.ts` | ⛔ none |
| `lib/manuscript/editorialRuntime/turn.ts` | ⛔ none — imports `runStructured` directly |
| `lib/manuscript/editorialRuntime/memberAct.ts` | ⛔ none |

Every production writer of receipts sits elsewhere and is unreachable from this
path: `app/api/sovereign/manuscripts/[id]/ask/route.ts` ·
`lib/writers-studio/focusCrossing.ts` · `lib/disclosure/*` ·
`app/api/members/delete-account/route.ts` (custody).

So authored prose reaches `runStructured` → Anthropic, and no durable record
names that crossing, its destination, or what was sent.

⭐ **The path is not ungoverned.** The route carries `TurnPosture` from
`lib/sanctuary/`. But Sanctuary posture and a disclosure receipt answer different
questions — *may this be retained* versus *what crossed, to where, under whose
authorization* — and ⛔ neither should silently stand in for the other.

## ⛔ What this does NOT establish

- ⛔ **That it is a defect.** A ruling may exist placing the editorial path under
  Sanctuary posture rather than receipts. None was found; ⭐ **absence of a found
  ruling is not absence of a ruling.**
- ⛔ **That the failed W1 request transmitted prose.** It did not reach the
  provider cleanly — it returned `structured_refused`. And the order in
  `anthropicStructuredAdapter.ts` is load-bearing here: `new Anthropic()` (line
  88) runs **before** `toAnthropicParams(req)` (line 89), so a constructor
  failure means the request body was never built and **nothing left the
  process**. A later network failure would not carry that guarantee. ⭐ Which of
  those occurred is readable only from the refusal's `detail`, and is **not
  inferable from `structured_refused` alone.**
- ⛔ **Any connection to the 45 deleted receipts** recorded in
  `DISCLOSURE_RECEIPTS_ANOMALY_FINDING_2026-09-20.md`. Those carried
  `writers_studio.ask->maia_developmental`; this route writes no receipts at all,
  so it did not produce them. ⛔ The two findings share a table and a date of
  discovery, nothing more. Their provenance is separately open.

## The question this returns to the founder

> Is external editorial processing intended to require a durable disclosure
> record naming destination and disclosed context, in addition to authorization —
> or is `TurnPosture` the intended governance for this path?

⭐ A receipt **documents the act; it does not grant consent.** If both are
intended, that is its own change with its own record — ⛔ not something to add to
a route in the middle of an unspent witness procedure, where it would alter the
surface the procedure is measuring.

## Held

⛔ **W1 does not resume until this boundary is settled.** Provider diagnosis
continues meanwhile using **synthetic text only** — ⛔ no manuscript passage
leaves the machine while the question is open.

⛔ NOT AUTHORIZED BY THIS RECORD: adding receipt minting to the editorial path ·
changing `TurnPosture` · changing scope, voice, sequence or latitude law ·
changing inference policy · sending manuscript prose.
