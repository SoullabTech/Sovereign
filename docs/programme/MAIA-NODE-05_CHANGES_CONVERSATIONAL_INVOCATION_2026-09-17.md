# MAIA-NODE-05 — conversational invocation of Changes continuity

**Date:** 2026-09-17
**Authority:** MAIA-NODE-05 — Conversational Invocation of Changes Continuity (founder)
**Prerequisite:** MAIA-NODE-04 PASS ✅
**Branch:** `claude/magical-archimedes-dcsry5`
**Status:** ✅ WIRED END-TO-END · ✅ 66/66 TESTS · ✅ GATES GREEN · ⛔ NOT DEPLOYED

> MAIA becomes more useful by gaining truthful access to what the member has
> already authored — not by becoming more willing to infer.

A member can now ask *"What Changes do I still have open?"* in the canonical
MAIA conversation and receive a governed, factual answer.

---

## 1. Canonical conversation seam

```
POST /api/sovereign/app/maia/list          ← the one canonical MAIA path
  :334  const userId = await resolveMemberIdentity(req)     (getMemberIdFromRequest)
  :362  message validated
  :388  ⭐ tryChangesContinuityTurn(userId, message)         ← THE SEAM
  :371  ── TURN ACCEPTANCE BOUNDARY ──                       (not reached if handled)
  :1366 getMaiaResponse(...)                                 (not reached if handled)
```

⭐ **The placement is the design.** Identity is resolved and the message is
well-formed, but the turn-acceptance boundary has not yet run. §12 requires this
capability to write nothing, and accepting a turn is a durable act — so a
capability answer must return *before* it, forming no turn, no memory and no
episode. A test asserts this ordering by index, so a later edit cannot quietly
move the call past the boundary.

⛔ No Changes-specific chat, no second router, no second dispatcher, no Home
assistant. One MAIA path.

## 2. Invocation mechanism — the seam was repaired, not duplicated

§1: *if conversation has to duplicate domain logic to use a capability, repair
the invocation seam instead.* It did, so I did.

**`lib/changes/readMemberChanges.ts`** — the canonical SELECT and row mapping,
moved **verbatim** out of `GET /api/changes`. That route now calls it and keeps
its authorization exactly where it was.

```
                    readMemberChanges(memberId)          ← ONE query
                        ↑                ↑
        GET /api/changes          tryChangesContinuityTurn
        (auth: getMemberIdFromRequest)   (auth: resolveMemberIdentity → same)
```

⛔ Authorization does **not** live in the reader. It takes an already-verified
member id, scopes the query to it, and cannot authenticate anyone — a documented
precondition, so it can never be handed a header or body value.

⛔ Nothing was recreated: open-state predicate, ordering, phrasing and member
scoping all still come from MAIA-NODE-04's modules.

## 3. Intents

**Invokes** (authored Changes questions):
> What Changes do I still have open? · Which Changes am I working with? · Show me
> my open Changes · Are any of my Changes still open? · do I have any open changes

**Does not invoke — MAIA stays:**
> A lot is changing. · I'm going through a transition. · Things feel unsettled. ·
> I'm still working through this. · everything is changing right now · I'm worried
> about Sophie

**Does not substitute Changes for the broader question** (§4):
> What were we working on yesterday? · What should I return to? · What was I doing
> last time? · What have I left unfinished? · What matters most right now?

All of these return `{ handled: false }` **and the canonical read is never
called** — asserted, so the capability cannot even touch the database on a
sentence that was not a Changes question.

## 4. Response shaping

Deterministic, constructed from the capability result. **The model never sees the
question**, which is how §8 is guaranteed rather than hoped for: a Change absent
from the result is absent from the answer because there is no generation step to
supplement it.

| Case | Response |
|---|---|
| Zero | `You don't currently have any Changes in an open state.` |
| One | `You have one open Change: “…” Its status is active.` |
| Several | `You have three open Changes:` then one per line, `“…” — status`, then `Want to look at one of them?` |
| Read failed | `I couldn't retrieve your Changes just now.` |

Canonical order preserved (§13, `created_at DESC`). Statuses literal — a test
runs the output against *still processing · unresolved · priority · stuck ·
avoiding · most important* and fails on any. The closing line is an **offer**;
a test rejects *I'd start with · you should · the most important · I suggest*.

## 5. Follow-up

*"The beta one."* resolves against the member's open Changes, re-derived by a
fresh canonical read — because §12 forbids writing, there is no stored result
set, and re-reading is still only a read. Unambiguous → factual report.
Ambiguous → MAIA names the candidates and asks.

⭐ **Ordinals are refused explicitly, and that was not theoretical.** *"The first
one"* reaches the follow-up matcher with the fragment `first`, and *"Sharing MAIA
with the **first** beta testers"* contains it — so without an explicit guard the
ordinal would have resolved **by coincidence**, and the canonical ordering would
have silently started meaning something §13 says it does not. My own test caught
this; the guard and the test both remain.

A phrase matching no open Change yields to ordinary conversation rather than
being hijacked.

## 6. Failure behavior

A failed canonical read produces the truthful line above and **never** falls back
to generic memory search. A failed read on a bare follow-up simply yields
(`handled: false`) rather than announcing a failure the member did not ask about.

A fault anywhere in the seam is caught in the route and falls through to ordinary
conversation — a capability bug must never cost the member their turn.

## 7. Negative control (§12)

```ts
'A lot is changing.'
  governed boundary  isChangesContinuityRequest(...)  → false
  plausible loosening  /\bchang/i.test(...)           → true
```

The gap between those two lines is the protection, and the test asserts they
differ. Loosening the boundary to "mentions change" would make ordinary
reflection query the member's records — which is exactly the behaviour you asked
me to make impossible.

## 8. Test evidence — 66/66

`lib/maia/continuity/__tests__/changesTurn.test.ts` (new) ·
`…/changesContinuity.test.ts` (updated for the seam)

The canonical read is mocked to **record arguments and return rows unfiltered**,
so every claim passes because the capability's own predicate did the work.

Covers: explicit intent invokes · verified member passed through · no identity →
no call · reflective language does not invoke · broader questions do not
substitute · negative control · zero/one/several responses · canonical order ·
literal statuses · offer-not-choice · another member's Change cannot appear ·
follow-up resolution · ambiguity asks · ordinal refused · unmatched phrase yields
· read failure does not fabricate · no writes in the module · **capability
returns before the turn-acceptance boundary and before cognition** · invoked with
the route's verified identity · ordinary conversation reaches cognition.

| Gate | Result |
|---|---|
| `npm run typecheck` | ✅ **0 regressions** |
| `npm run check:no-supabase` | ✅ clean |
| NODE-04 + NODE-05 suites | ✅ 66/66 |
| Regression (`lib/maia`, `lib/navigation`, `lib/changes`, `app/api/sovereign`, `components/maia`, `lib/workbench`) | ✅ 59 suites / **1,068 tests** pass |

⚠️ **19 pre-existing failures, none mine — verified, not assumed.** Stashing this
work and re-running on clean HEAD reproduced **16** failures across four
manuscripts/episodes suites (`readings`, `draft`, `draft/revisions`,
`episodes/mark/sanctuaryGuard`) plus the known **3** in `writersStudioRoom` —
exactly the 19 observed. ⛔ Not repaired; they belong to other lanes.

## 9. Zero writes, zero visual change

| | |
|---|---|
| Semantic writes | ✅ none — capability returns before turn acceptance; no turn, memory, episode, atom, affinity or return-preference is created |
| Module scan | ✅ no `fetch(`, `apiFetch(`, `query(`, `db.`, `INSERT INTO`, `UPDATE `, `DELETE FROM` in the turn handler |
| Status mutation | ✅ none — the capability is a GET |
| `/maia` visual | ✅ untouched — no page, shell, centre, card, badge, panel or navigation control |
| Change navigation | ✅ none — the disputed `/studio/changes` route is not used; `changes.continuity` still carries no `destinationId` |
| Journal CAPTURE · Calendar · Astrology | ✅ untouched; Astrology still `withheld` |
| Voice | ✅ untouched |
| Schema | ✅ no migration, no DDL |
| Proactive invocation | ✅ none — member-initiated only |

**Files:** 3 modified (`app/api/changes/route.ts` — seam repair;
`app/api/sovereign/app/maia/list/route.ts` — +28 lines at one insertion point;
one test), 3 added (reader, turn handler, test).

## 10. Standing

**CHANGES CONTINUITY ✅ INVOCABLE IN CONVERSATION · 66/66 · GATES GREEN ·
⛔ NO YESTERDAY RECAP · ⛔ NO PROACTIVE RESURFACING · ⛔ NO STATUS MUTATION ·
⛔ NO CHANGE NAVIGATION · ⛔ NO CAPTURE · ⛔ NO CALENDAR · ⛔ ASTROLOGY WITHHELD ·
⛔ NO CONVERSATION-THREAD OPENNESS · ⛔ NO GENERALIZED TOOL CALLING ·
⛔ NO SCHEMA · ⛔ NO WRITES · ⛔ `/maia` UNTOUCHED · ⛔ NOT DEPLOYED ·
PRODUCTION UNTOUCHED.**

Returned for member witness. The behaviour worth testing by hand is the
*negative* one: say *"a lot is changing in my life"* and confirm she stays with
you rather than reaching for the database.
