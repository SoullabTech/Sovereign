# MAIA-NODE-04 — truthful continuity / Changes READ

**Date:** 2026-09-17
**Authority:** MAIA-NODE-04 — Truthful Continuity / Changes READ (founder)
**Prerequisite:** MAIA-NODE-03 PASS ✅
**Branch:** `claude/magical-archimedes-dcsry5`
**Status:** ✅ BUILT · ✅ 64/64 TESTS · ✅ GATES GREEN · ⛔ NO PROACTIVE RESURFACING · ⛔ NOT DEPLOYED

> MAIA may remind the member of what the member has actually left open;
> she may not decide what remains unresolved.

---

## 1. Canonical read authority

**`GET /api/changes`** — used as it stands. ⛔ No second query path was created.

| Property | Evidence |
|---|---|
| Credential-verified identity | `getMemberIdFromRequest` (`route.ts:23`) |
| Refuses without a session | `401 Unauthorized` |
| Member-scoped in SQL | `WHERE c.member_id = $1` |
| Not the Phase-0 probe | `probeAuthPosture` absent — asserted by test |
| Canonical ordering | `ORDER BY c.created_at DESC` |

The capability declares this authority rather than re-implementing it:

```ts
authority: { kind: 'route', method: 'GET', path: '/api/changes' }
```

## 2. Eligibility predicate

Selection is a pure function over rows the canonical authority returned:

```
member_id === authenticated member          ← defence in depth; SQL is the boundary
AND status ∈ { naming, active, integrating }
```

```
OPEN      naming · active · integrating     member-authored unfinished states
TRANSIENT casting · consulting              ⛔ never continuity
CLOSED    complete · archived
```

⭐ **The open set is an allowlist, deliberately.** A status this module has never
heard of is **not** open. A future lifecycle value must be *ruled* before it
becomes continuity, rather than becoming continuity by default the moment
someone adds it. Tested with `'percolating'`.

**Why transient states are excluded, in one sentence:** `casting` and
`consulting` are set only by the I Ching cast and council consult sub-routes —
`PATCH /api/changes/[id]` will not accept them — so surfacing them would report
a Change because a *machine step was mid-flight*, not because a person left
something unfinished.

## 3. Member scope

Only the authenticated member's records. The SQL predicate in the canonical
authority is the security boundary; `selectOpenChanges()` re-checks `memberId`
as defence in depth and **drops** any foreign row rather than displaying it.
Tested: another member's `active` Change cannot surface, and an empty member
identity selects nothing.

⛔ No practitioner observations, client records, shared fields, Worldcraft,
Writer's Studio state or memory atoms participate. The module references none of
those tables — asserted by test (comments stripped first; see §6).

## 4. Ordering rule — and a decision I did not take silently

**The canonical order is preserved, not replaced.** `GET /api/changes` already
orders `created_at DESC`; `selectOpenChanges()` filters and preserves.

⚠️ §IX offered "most recently member-updated" as a fallback. **I did not
re-sort by `updatedAt`, and the reason matters:** re-sorting would make MAIA's
list disagree with the member's own Changes surface, for no factual gain. Two
orderings of the same material is the kind of small divergence that later reads
as the system knowing something the member's own screen does not.

So the order means exactly one thing — **most recently named** — and nothing
about importance. `updatedAt` is available in the canonical shape if the founder
prefers it; that is a one-line change and a founder call, not mine.

⛔ No semantic relevance, emotional content, model score, affinity, frequency or
inferred urgency. The function is structurally incapable of ranking: it filters
and preserves.

## 5. Intents

**Supported** (all require the word *change(s)*):
> What Changes do I still have open? · Am I working with any Changes right now? ·
> Remind me which Changes are not complete yet · What Changes have I named? ·
> do I have any open changes

**Refused — the Change lifecycle does not authorize the judgment:**
> What should I work on? · What matters most right now? · What haven't I dealt
> with? · What am I avoiding? · What is unresolved for me?

**Not silently reinterpreted** (§XI): *"remind me what we were working on
yesterday"* and *"what did we do yesterday"* both return `false`. That question
is broader than this slice and is left to whatever canonical continuity existing
conversation behaviour already truthfully possesses.

**Ordinary conversation untouched:** "things are changing for me", "I want to
change how I work", "this changed everything", "nothing is exactly wrong, my
life is just changing" — none trigger the capability, despite containing the
word.

**Named-Change lookup** matches against the member's **own authored title** by
string containment, requires ≥3 characters, and returns *all* matches so the
caller can ask rather than choose. ⛔ No semantic search: "launch" does not find
"…first beta testers".

## 6. What MAIA may say

`describeOpenChanges()` / `describeChange()` state title and status and stop:

> You have three open Changes: "Sharing MAIA with the first beta testers" is
> active, "Moving into business development" is active, and "Rethinking how the
> platform is organized" is integrating.

> "Sharing MAIA with the first beta testers" is currently active.

> You don't currently have any Changes in an open state.

A test runs every produced string against the forbidden vocabulary — *most
important · still processing · haven't resolved · should return · stuck ·
avoiding · unresolved · matters most · probably · seems to be* — and fails if
any appears. **`integrating` is reported as the domain status it is.**

## 7. Test evidence — 64/64 PASS

`lib/maia/continuity/__tests__/changesContinuity.test.ts` (32) ·
`lib/maia/__tests__/capabilityRegistry.test.ts` (32, extended)

Covering every clause of §XVI: the ruled open set · transient exclusion ·
unrecognised status not open by default · member-only selection · foreign row
dropped · honest zero · canonical order preserved · bounded intents · judgment
questions refused · broad-yesterday not reinterpreted · ordinary conversation
unaffected · factual phrasing · no interpretive vocabulary · title match without
semantics · authority declared · no navigation added · canonical route scopes by
member under a verified credential · no memory/affinity source · reading does not
mutate.

### ⭐ Discriminating negative control

One fixture set; guards dropped:

```
guarded   → 4 rows   (the member's open Changes)
unguarded → 9 rows
admitted  → Mid-cast · Mid-consult · Finished thing · Put away ·
            "Another member's change"                          (5 prohibited)
```

Without it the pass would be vacuous. With it, the guards are shown to be what
excludes those rows.

### Registry guard generalized, not weakened

NODE-03 asserted *every executable capability names a House destination*. A READ
capability has no destination, so that guard was **split rather than relaxed**:

- executable **NAVIGATE** ⇒ destination resolves in `HOUSE_DESTINATIONS`
- executable **anything** ⇒ names a destination **or** an authority — because an
  executable capability that defers to neither would be MAIA claiming to own the
  operation herself, which is the one thing the nodal architecture forbids

Two further assertions were sharpened honestly rather than loosened:
- *"no route literals"* now distinguishes a **member-facing navigation route**
  (still forbidden) from an **API authority path** (required to be `/api/…` and
  required not to be a House route)
- the read-only scan now targets **calls**, not words, because
  `CapabilityAuthority` legitimately declares `'DELETE'` as a method a future
  capability could name — declaring that an operation exists is not performing one

⚠️ And one assertion I had briefly reduced to a tautology (`length === length`)
was replaced with a real before/after snapshot. A guard that compares a value
with itself is exactly the failure this repo names elsewhere.

⚠️ For the third time in this lane, a scan failed against a file **documenting
its own compliance** — the module says it is *"not an embedding"* and a raw scan
matched the word. Comments are stripped first, per the C21 repair.

## 8. Non-mutation evidence

- No slice module contains `fetch(`, `apiFetch(`, `query(`, `db.`, `INSERT INTO`, `UPDATE `, `DELETE FROM` — asserted per module
- The capability's only authority is a **GET**
- A fixture snapshot is byte-identical after selection, title matching and description
- ⛔ Nothing mutates Changes, memory atoms, episodic memories, affinities, Keeps, conversation state or return preferences

## 9. Changes sheet / route mismatch — recorded again as debt

`HOUSE_DESTINATIONS` models `changes` as a **sheet** (`kind: 'sheet'`,
`sheet: 'changes'`), while `OracleConversation` retains
`router.push('/studio/changes')`. **The repository holds two different answers to
what Changes *is* — a panel over the current surface, or a place you travel to.**

⛔ Not reconciled here. This slice is READ only and adds **no** navigation:
`changes.continuity` carries no `destinationId`, asserted by test. Recorded as
architectural debt for a later ruling.

## 10. Confirmation of what was NOT touched

Two files changed (`lib/maia/capabilities.ts`, one test), two added.

| | |
|---|---|
| `/maia` | ✅ untouched — no page, shell, centre or arrival copy |
| Journal CAPTURE | ✅ not implemented; blocked pending the episodic-memory + Sanctuary reconciliation |
| Conversation state | ✅ untouched; no open-loop inference of any kind |
| Astrology | ✅ still `withheld`; route unmodified |
| Voice | ✅ untouched |
| Schema | ✅ no migration, no DDL |
| Proactive orientation | ✅ none — member-requested only; MAIA does not greet with an open Change |
| API routes | ✅ none modified — `app/api/**` untouched |
| Visual work | ✅ no card, badge, panel, feed, dashboard or navigation field |

| Gate | Result |
|---|---|
| `npm run typecheck` | ✅ **0 regressions** |
| `npm run check:no-supabase` | ✅ clean |
| NODE-04 + registry suites | ✅ 64/64 |
| Regression (`lib/navigation`, `lib/maia`, `components/maia`, `lib/workbench`, `app/relationships`) | ✅ 41 suites / 778 tests |

⚠️ Pre-existing, not mine: `writersStudioRoom.test.ts` 3/51 — verified against
clean HEAD during LF-SCOPE-01. ⛔ Not repaired.

## 11. Standing

**CHANGES READ ✅ BUILT · 64/64 · GATES GREEN · ⛔ NO PROACTIVE RESURFACING ·
⛔ NO YESTERDAY RECAP · ⛔ NO CONVERSATION OPEN LOOPS · ⛔ NO CAPTURE ·
⛔ NO CALENDAR · ⛔ ASTROLOGY WITHHELD · ⛔ NO SCHEMA · ⛔ NO WRITES ·
⛔ `/maia` UNTOUCHED · ⛔ NOT DEPLOYED · PRODUCTION UNTOUCHED.**

⚠️ **One thing this slice does NOT yet do:** the capability is resolvable,
authorized and tested, but **no conversational surface calls it**. It is a
capability MAIA *has*, not yet one she *uses* — wiring it into a turn is a
separate act, and doing it silently inside a READ authorization would have been
the kind of scope creep this lane exists to refuse.
