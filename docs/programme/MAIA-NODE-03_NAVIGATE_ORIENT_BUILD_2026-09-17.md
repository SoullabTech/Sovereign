# MAIA-NODE-03 — NAVIGATE + bounded ORIENT

**Date:** 2026-09-17
**Authority:** MAIA-NODE-03 — First Nodal Slice Build Authorization (founder)
**Input:** `MAIA-NODE-02_AUTHORITY_RECONCILIATION_2026-09-17.md`
**Branch:** `claude/magical-archimedes-dcsry5`
**Status:** ✅ BUILT · ✅ 30/30 TESTS · ✅ GATES GREEN · ⛔ CAPTURE NOT BEGUN · ⛔ NOT DEPLOYED

> MAIA first earns the right to know where things are. Only then does she earn
> the right to act within them.

---

## 1. What was built

```
member utterance
  → resolveNavigationIntent()     whole authored phrase, never a bare noun
  → CAPABILITY_REGISTRY           capability identity
  → resolveDestination()          ⭐ the permission step — refuses non-executable
  → getDestination()              HOUSE_DESTINATIONS, the only route authority
  → dispatchHouseDestination()    the House's own dispatcher
```

**Five files. Three modified (additively), two new. No schema, no writes, no new auth.**

⭐ **Navigation was not reimplemented.** `dispatchHouseDestination` already
existed and already handles sheets, native policy and the `/open-web` bridge.
The capability layer resolves to a `HouseDestination` and hands it over — so
this slice adds a *doorway*, not a second navigation system.

## 2. Registry changes — strictly additive

`lib/maia/capabilities.ts`

| Change | Detail |
|---|---|
| `MaiaCapability` | +5 ids: `journal.open` · `relationships.open` · `livingField.open` · `keeps.open` · `writersStudio.open` |
| `CapabilityClass` | new type — the 9 classes of MAIA-NODE-01 §XIII |
| `CapabilityAvailability` | new type — `executable` \| `withheld` \| `unknown` |
| `CapabilityDefinition` | +4 **optional** fields: `purpose`, `operationClass`, `destinationId`, `availability` |
| Astrology | `availability: withheld` on both entries |
| Registry | 13 → 18 entries |

⭐ **Absence is not permission.** `isExecutable()` requires
`availability.state === 'executable'`. The thirteen pre-existing capabilities
carry no `availability`, are therefore `unknown`, and **cannot execute** — a
field nobody filled in can never become an accidental grant. Tested directly.

⛔ No speculative population: `authority`, `provenance`, `confirmation`,
`entitlement` and device metadata were **not** added, because this slice
established no evidence for them. The registry grows by evidence.

## 3. House lookup seam

`lib/navigation/houseDestinations.ts` — one additive export:

```ts
export function getDestination(id: string): HouseDestination | undefined {
  return HOUSE_DESTINATIONS.find((d) => d.id === id);
}
```

`HouseDestination.id` is typed `string`, so a derived union would collapse to
`string` and enforce nothing — **the record does not pretend TypeScript provides
enforcement it does not.** The mechanical enforcement is the drift guard
(§6), in the `houseNavDrift` idiom.

The dependency is one-directional and compiler-visible:

```
HOUSE_DESTINATIONS  ←  capability layer          ✅ built
```

⛔ Not: a second route map inside MAIA. A test asserts **no capability contains
a route literal at all**.

## 4. Capabilities implemented

| Capability | House id | Canonical route (from the House) | Availability |
|---|---|---|---|
| `journal.open` | `journal` | `/journal` | executable |
| `relationships.open` | `relationships` | `/relationships` | executable |
| `livingField.open` | `living-field` | `/maia/living-field` | executable |
| `keeps.open` | `keeps` | `/maia/keep-capture` | executable |
| `writersStudio.open` | `studio` | `/writers-studio` | executable |

All five are `audience: 'all'` in the House registry. Routes are **never**
written here — the table above is what the House resolves to, not what the
capability stores.

⚠️ `studio` carries `interim: true` ("placement is settled; the room set behind
it is still growing"). Navigating there is exactly as safe as tapping it in the
House, so it is included; the flag is recorded rather than hidden.

**Keeps means the canonical personal Keep gesture** → `/maia/keep-capture`. The
Writer's Studio manuscript object is a **Saved Passage** at this layer, has no
House destination, and cannot be reached by this path. Tested.

## 5. ORIENT — advisory, governed, and it does not move anyone

`resolveOrientation()` answers "what is Living Field for?" from the capability's
**authored** `purpose` string.

- ⛔ No model generation. A capability with no authored purpose produces
  **nothing** rather than an invented description of the product. Tested.
- ⛔ An orientation question never navigates — answering "what is X for?" by
  moving the member is not an answer. Tested for both phrasings.
- `orientationLine()` composes description + *"I can take you there if you'd
  like."* A test asserts the output never contains *you should / you need to /
  you must / recommended*.

## 6. MAIA may also stay (§6)

Routing requires a **whole authored phrase**. These all resolve to `null`, and
are tested as a group:

> "I'm worried about Sophie" · "my relationship with my daughter is hard right
> now" · "I keep thinking about this" · "I wrote something in a journal years
> ago" · "this feels like studio work" · "nothing is exactly wrong, my life is
> just changing"

The bar is deliberately high: a missed routing opportunity costs a sentence; an
unwanted one interrupts a person mid-thought.

## 7. Bounded literal conversion (§8)

**Converted — exactly one:** `OracleConversation.tsx` `case 'open_journal'`
now resolves through the capability layer and dispatches through the House
(+18/−2 lines, the only change to that file).

**Residual literals, recorded not refactored:**

| Literal | House destination? |
|---|---|
| `router.push('/maia/ideas')` | ✅ `ideas` |
| `router.push('/studio/changes')` | ⚠️ House has `changes` as a **sheet**, not this route |
| `router.push('/studio/decisions')` | ❌ **none** |
| `router.push('/worlds/patterns')` | ❌ **none** |
| `router.push('/worlds/journey')` | ❌ **none** |
| `` router.push(`/reflections/${capsuleId}`) `` | ✅ `reflections` (templated) |

A test pins this list, so the residual set stays a deliberate record rather than
drifting. ⛔ The three unregistered paths are not navigable as capabilities, not
registered, and not deleted — *a capability must not become executable simply
because old code contains a URL.*

## 8. Withheld and unavailable

| Capability | State | Reason |
|---|---|---|
| `astrology.reading`, `astrology.transit` | **withheld** | unauthenticated reading route (MAIA-NODE-03 §12) |
| The other 11 pre-existing capabilities | **unknown** (implicit) | authority not established by any census |

⭐ MAIA can truthfully know Astrology exists in Soullab and cannot execute it.
Astrology remains reachable by ordinary House navigation; only the
MAIA-executable capability is withheld. ⛔ Nothing about Astrology was repaired.

## 9. Tests and gates

**`lib/maia/__tests__/capabilityRegistry.test.ts` — 30/30 PASS**, covering every
clause of §15: registry resolution · absence-is-not-permission · withheld refusal
· drift guard (executable ⇒ destination resolves; phantom destination fails;
`getDestination` never synthesizes; no route literals in the layer) · five
canonical navigations · Keeps-vs-Saved-Passage · ordinary conversation does not
route · ORIENT advisory and non-navigating · unregistered legacy paths unreachable
· Astrology cannot execute · no write/fetch in the slice · no state mutated ·
bounded literal converted and residuals pinned.

| Gate | Result |
|---|---|
| `npm run typecheck` | ✅ **229 vs baseline 239 · 0 regressions** |
| `npm run check:no-supabase` | ✅ clean |
| Slice suite | ✅ 30/30 |
| Regression (`lib/navigation`, `lib/maia`, `components/maia`, `app/relationships`, `lib/workbench`) | ✅ 40 suites / 744 tests |

⭐ `lib/navigation` passing includes **`houseNavDrift.test.ts`** — the House's own
drift guard is intact after the accessor was added.

⚠️ **One pre-existing failure, not mine.** `lib/maia/canonical-turn/__tests__/writersStudioRoom.test.ts`
fails 3/51 on `PRODUCER_REGISTRY` membrane entries — verified against clean HEAD
during LF-SCOPE-01 (identical 3 failed / 48 passed). Reported, ⛔ not repaired.

⚠️ **Typecheck caution, carried forward:** a run taken while a dev server has
been running is untrustworthy — `.next/types/**` pulls extra files into the
program and produces phantom diagnostics. `.next` was confirmed absent for the
run above.

## 10. Confirmation of what was NOT touched

| | |
|---|---|
| `/maia` visual composition | ✅ untouched — `app/maia/page.tsx`, `MaiaShell`, `MaiaCenterField` unmodified. No capability UI, no menu, no rail |
| Journal writes | ✅ untouched — no write is called; CAPTURE not implemented |
| Astrology execution | ✅ withheld; route unmodified |
| Changes reads | ✅ not implemented; no arrival resurfacing |
| Voice architecture | ✅ untouched — no VoiceKernel, STT, TTS, TurnCoordinator, mic |
| Schema | ✅ no migration, no DDL |
| Keep schemas / endpoints | ✅ unrenamed, unmigrated |
| Relationships | ✅ untouched |
| House navigation design | ✅ unchanged — one accessor added, no destination moved |

## 11. Open-state ruling recorded (§10), not implemented

`naming · active · integrating` = **open** (member-controlled unfinished states)
`casting · consulting` = **transient**, machine-mediated — ⛔ never an orientation signal
`complete · archived` = **closed**

⛔ No arrival resurfacing was built. Factual openness and orientation policy
remain separate authorities, and MAIA has no Changes READ capability.

## 12. Standing

**NAVIGATE ✅ BUILT · ORIENT ✅ BOUNDED · 30/30 · GATES GREEN · ⛔ CAPTURE BLOCKED ·
⛔ CHANGES READ NOT BUILT · ⛔ ASTROLOGY WITHHELD · ⛔ NO CONVERSATION OPEN LOOPS ·
⛔ NO PROACTIVE ORIENTATION · ⛔ NO SCHEMA · ⛔ NO WRITES · ⛔ `/maia` UNTOUCHED ·
⛔ NOT DEPLOYED · PRODUCTION UNTOUCHED.**

Returned for the fork: **continuity** ("what were we working on?") versus
**agency** ("save this to my Journal").
