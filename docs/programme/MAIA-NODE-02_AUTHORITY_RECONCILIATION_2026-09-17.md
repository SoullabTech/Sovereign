# MAIA-NODE-02 — registry and authority reconciliation

**Date:** 2026-09-17
**Authority:** MAIA-NODE-02 — Registry and Authority Reconciliation Ruling (founder)
**Input:** `MAIA-NODE-01_CAPABILITY_CENSUS_2026-09-17.md`
**Branch:** `claude/magical-archimedes-dcsry5`
**Status:** ✅ RECONCILIATION COMPLETE · ⛔ NOTHING IMPLEMENTED · STOPPED FOR AUTHORIZATION

> MAIA may be the member's doorway to the whole ecology without becoming the
> owner of what lies behind each door.

Repository truth only. No source changed, no registry extended, no slice built.

---

## 1. Journal — candidates and canonical survivor

**Method: the survivor is not chosen by endpoint name. It is the write whose rows
the member's own Journal surface reads back.** That chain is now traced end to end.

```
HOUSE_DESTINATIONS id 'journal'  →  route '/journal'
        (registry comment: "corrected: the native-bundled journal
         (was /labtools/journal — founder-gated + stripped)")
   ↓
app/journal/page.tsx  →  <JournalRoom/>
   ↓
components/journal/room/JournalRoom.tsx
   :55  GET  apiFetch('/api/journal/quick/list?limit=100')   ← reads
   :78  POST apiFetch('/api/journal/quick/list')             ← writes
   ↓
app/api/journal/quick/list/route.ts:227
   INSERT INTO quick_journal_entries (user_id, entry_type, content, tags, source, meta)
```

### ⭐ CANONICAL SURVIVOR — `POST /api/journal/quick/list`

It satisfies every clause of Decision 3:

| Requirement | Evidence |
|---|---|
| Writes the existing member Journal object | `quick_journal_entries` (`20260102000000_quick_journal_base`) |
| Authenticated member identity | `getMemberIdFromRequest` (`:197`) |
| Produces entries the canonical surface reads | Same route serves `JournalRoom`'s GET |
| Does not depend on a Phase-0 identity probe | ⭐ Hardened: the route comments record that *"a `userId` query param is ignored"* (`:278`) |
| No parallel MAIA-specific record type | Nothing MAIA-specific exists |

⚠️ **One property to settle before CAPTURE is wired (§9-U1):** this route also
writes `INSERT INTO episodic_memories` with a 768-dim `semanticVector`. A journal
entry therefore lands in **two** stores. That is existing behaviour and not a
defect — but *"MAIA, save this to my Journal"* would then also create an episodic
memory, which is a second consequence the member did not name. **Sanctuary
interaction is UNVERIFIED on this path** (no `sanctuary` reference found in the
route).

### The other candidates, classified rather than blended

| Route | Classification |
|---|---|
| `POST /api/journal/quick/audio` | **Same semantic operation, different modality** — audio variant of the survivor. Adapter candidate, not a rival |
| `POST /api/journal/reflect` | **Different semantic operation** — reflection over journal material, not a Journal write |
| `POST /api/journal/chart-integration` | **Different semantic operation** — astrology↔journal linkage (`journal_chart_integration`) |
| `POST /api/community/elemental-alchemy/journal` | **Different object** — `elemental_journal_entries`, community surface, reached via `/maia/community/...` |
| `/labtools/journal` | **Legacy** — named in the House registry as the corrected-away route (founder-gated, iOS-stripped) |

⛔ No new Journal write is authorized, and none is needed: the survivor exists and is already hardened.

---

## 2. "Keep" — one platform meaning, ratified against the registry

⭐ **The House registry already ratifies Decision 2 independently.**
`HOUSE_DESTINATIONS` id `keeps` → route **`/maia/keep-capture`** — the
member-memory-atom gesture. The manuscript object has **no** House destination
and is therefore not a member-facing *place* called Keeps at all.

| | **Keep** (canonical) | **Saved Passage** (Writer's Studio) |
|---|---|---|
| Object | `member_memory_atoms` | manuscript passage keeps |
| Formation act | `kept_at` — *"when the member CHOSE to keep this"* | marking a passage inside a Work |
| Meaning | *"I choose for this to remain available to me"* | *"this line matters in this manuscript"* |
| Scope | Cross-House personal continuity | Bound to one Work |
| Endpoints | `/api/sovereign/atoms/*`, `/maia/keep-capture` | `/api/sovereign/keeps`, `/api/sovereign/manuscripts/[id]/keeps` |
| House destination | ✅ `keeps` | ❌ none |

**Capability-layer naming only.** ⛔ No endpoint renamed, no table migrated, no
schema touched — the `/api/sovereign/keeps` path stays exactly as it is.

**Routing rule:** outside Writer's Studio, *"keep this"* → canonical Keep.
Inside Writer's Studio with clear passage reference, *"save this passage"* →
Saved Passage. Genuine ambiguity → MAIA asks. ⛔ One phrase never routes to two
unrelated objects.

---

## 3. Change lifecycle — actual semantics, and a correction

The census reported the DB CHECK. Checking *behaviour* as Decision 4 requires
changed the picture:

| Status | In DB CHECK | Settable by the member API (`PATCH /api/changes/[id]:176`) |
|---|---|---|
| `naming` | ✅ | ✅ (default) |
| `casting` | ✅ | ❌ |
| `consulting` | ✅ | ❌ |
| `active` | ✅ | ✅ |
| `integrating` | ✅ | ✅ |
| `complete` | ✅ | ✅ |
| `archived` | ✅ | ✅ |

⭐ **The DB admits seven; the member API accepts five.** `casting` and
`consulting` are set only by the I Ching cast / council consult sub-routes —
they are **transient operational states inside an interaction**, not resting
places a member leaves a Change in. Treating them as "open loops" would surface
a Change because a *machine step* was mid-flight.

**Recommended open-state set (⛔ recommendation, not a ruling):**

```
OPEN      = { naming, active, integrating }   ← member-set resting states
TRANSIENT = { casting, consulting }           ← ⛔ never an orientation signal
CLOSED    = { complete, archived }
```

`integrating` deserves a founder look: it is member-set and genuinely unfinished,
but it means *being worked through*, which may or may not be something a member
wants surfaced on arrival. ⚠️ Note it is also the value a 2026-09-07 migration
retired from `circle_inquiries` — a **different table**; `studio_changes` retains it.

**Conversations remain out of scope.** `conversation_turns` carries no
open/resolved/return state (id · user_id · session_id · role · content ·
created_at). MAIA may say *"yesterday we talked about Chapter 10"* where
mechanically supported; she may **not** say *"you left it unfinished."*

---

## 4. Proposed `CAPABILITY_REGISTRY` shape — backward compatible

Every existing field is kept and every new field is **optional**, so the current
13 entries continue to typecheck unchanged. Nothing is renamed.

```ts
// ── additive ────────────────────────────────────────────────────────────────
export type CapabilityClass =
  | 'ORIENT' | 'NAVIGATE' | 'READ' | 'CAPTURE'
  | 'CONTINUE' | 'TRANSFORM' | 'ACT' | 'SHARE' | 'CROSS';

/** Decision 8: existing-conceptually and safe-to-execute are different facts. */
export type CapabilityAvailability =
  | { state: 'executable' }
  | { state: 'withheld'; reason: string }   // exists, deliberately not exposed
  | { state: 'unknown'; reason: string };   // repository truth absent — never guessed

/** Decision 6: execution authority is named, never implied by a phrase match. */
export type CapabilityAuthority =
  | { kind: 'route'; method: 'GET' | 'POST' | 'PATCH' | 'DELETE'; path: string }
  | { kind: 'navigation' }                  // NAVIGATE needs no domain write
  | { kind: 'unresolved'; note: string };

export type ConfirmationPolicy = 'none' | 'ambiguity' | 'consequential';

export interface CapabilityDefinition {
  // ── existing, unchanged ──
  id: MaiaCapability;
  label: string;
  worldId?: MaiaWorldId;
  modalId?: string;
  voicePhrases: string[];

  // ── additive, all optional ──
  purpose?: string;                       // what it helps a member accomplish
  operationClass?: CapabilityClass;
  authority?: CapabilityAuthority;        // canonical owner — never MAIA
  destinationId?: string;                 // HOUSE_DESTINATIONS id, §5
  allowedContexts?: readonly string[];     // personal | writer | practice | relationship
  entitlement?: 'member' | 'founder' | 'connector' | 'unknown';
  confirmation?: ConfirmationPolicy;
  provenance?: string;                    // what execution must record
  surfaces?: readonly ('text' | 'voice' | 'web' | 'native')[];
  availability?: CapabilityAvailability;  // defaults to unknown when absent
  failureMessage?: string;                // truthful words when unavailable
}
```

⛔ **Do not backfill speculatively.** Of the 13 existing capabilities, only those
whose authority this census actually traced should receive `authority` and
`availability: executable`. Everything else takes
`{ state: 'unknown', reason: '...' }`. An absent field must read as *not yet
established*, never as *permitted*.

---

## 5. `HOUSE_DESTINATIONS` integration seam — exact

`HouseDestination.id` is typed `string`, so a derived union would collapse to
`string` and enforce nothing. Two options; the second is recommended because it
changes no existing declaration.

**Option A (compile-time):** add `as const` to `HOUSE_DESTINATIONS` and export
`type HouseDestinationId = typeof HOUSE_DESTINATIONS[number]['id']`.
⚠️ Touches the registry's declaration and may ripple through existing consumers.

**⭐ Option B (recommended — runtime + drift guard, zero edits to the registry):**

```ts
// lib/navigation/houseDestinations.ts — additive helper only
export function getDestination(id: string): HouseDestination | undefined {
  return HOUSE_DESTINATIONS.find((d) => d.id === id);
}
```

plus a jest guard, in the idiom of `houseNavDrift.test.ts`:

> every `destinationId` in `CAPABILITY_REGISTRY` resolves to a live
> `HOUSE_DESTINATIONS` entry, **and** no capability declares a route literal of
> its own.

That makes the dependency real and one-directional, and it fails the build on
drift rather than documenting an intention.

**Duplicate literals recorded for later reconciliation (⛔ not refactored):**
`OracleConversation.tsx` → `/journal` (:4770) · `/maia/ideas` (:4779) ·
`/studio/decisions` (:4782) · `/studio/changes` (:4785) · `/worlds/patterns`
(:4789) · `/worlds/journey` (:4792) · `/reflections/{id}` (:10333).
⚠️ `/studio/decisions`, `/worlds/patterns`, `/worlds/journey` have **no House
destination** — so they are either unregistered places or stale routes. UNKNOWN.

---

## 6. Auth resolver for the first slices

**Use `getMemberIdFromRequest`** (`lib/auth/getMemberFromRequest.ts`).

- Resolves from `maia_session` cookie, falling back to the `x-session-token`
  header for Safari/iOS where cookies are blocked
- Explicitly refuses to trust a bare `x-member-id` / `maia_member_id` without a
  verified session
- Already the authority on the canonical Journal write and on `/api/changes`

⛔ **`probeAuthPosture` is not an execution authority** (Decision 7). It returns
the header verbatim and its own module header calls it Phase-0 scaffolding. It
may stay where it serves its diagnostic purpose; no capability may execute
through it, and ⛔ it must not be wrapped and relabelled as canonical.

⚠️ `getCurrentSession()` (`lib/auth/serverSessions`) is a **second** verified
mechanism, used by `/api/relationships`. Both are credential-based, so either is
defensible; whether they should converge is out of scope and recorded as U3.

---

## 7. First slice — NAVIGATE, then ORIENT

**Slice A — NAVIGATE.** Deliberately the smallest thing that proves the whole
chain while creating no semantic state:

```
member expression ("take me to my Journal")
  → intent resolution        (voicePhrases, existing)
  → CAPABILITY_REGISTRY      (capability id)
  → destinationId            (House id, §5)
  → getDestination()         (canonical route/sheet + audience)
  → existing navigation      (router.push / openMaiaHouse)
```

Proposed first capabilities — **all four already have House destinations**:
`journal` · `relationships` · `living-field` · `studio` (Writer's Studio).

Properties that make this the right first slice:
- **no write, no schema, no provenance** — nothing to get wrong durably
- respects `audience` and `nativePolicy` already carried by the registry, so a
  founder-only or native-unready place cannot be navigated to by accident
- removes duplicate literals for exactly the paths it touches, per Decision 1
- ⛔ does **not** alter `/maia`'s visual composition

**Slice B — ORIENT.** Answering *"what is Living Field for?"* needs one field
the House registry does not carry: a **purpose sentence**. `tooltip` exists but
is optional and written for hover, not explanation. ⚠️ Authoring purpose text is
content work, and it should be **authored, not model-generated** — otherwise
MAIA explains the house in words nobody ratified. Recorded as owed (U4).

---

## 8. Astrology containment

**Requirement: `astrology.reading` and `astrology.transit` carry
`availability: { state: 'withheld', reason: 'unauthenticated route — MAIA-NODE-02 §8' }`
and are not executable through MAIA.**

Finding: `app/api/astrology/reading/route.ts` has **no authentication** and takes
birth data from the request body. There is no member identity and no
authorized-birth-data source on that path.

⭐ The registry shape makes this expressible rather than hidden: the capability
remains *conceptually present* — so MAIA can truthfully say Astrology exists and
is not available to her yet — while being mechanically unexecutable.

**Bounded repair plan (⛔ NOT AUTHORIZED HERE, and not an Astrology redesign):**
1. Locate the canonical member birth-data record — **UNKNOWN**, not traced (U2)
2. Require `getMemberIdFromRequest`; refuse unauthenticated requests
3. Read birth data from the member record; stop accepting it from the body, or
   accept it only as an explicit member-supplied override for their own reading
4. Confirm no cross-member exposure and no echo of body data in responses
5. Preserve symbolic, non-predictive semantics (MAIA-NODE-01 §VII)

⚠️ Note the House already publishes `astrology` → `/astrology` as a member
destination, so the *place* is reachable today by ordinary navigation. This
ruling withholds it as a **MAIA-executable capability**, which is a narrower claim.

---

## 9. Unresolved unknowns

| | |
|---|---|
| **U1** | The canonical Journal write also inserts into `episodic_memories` with an embedding. Is that intended as part of "save to Journal"? **Sanctuary interaction unverified.** Must be settled before CAPTURE |
| **U2** | Where authorized member birth data lives — not traced |
| **U3** | `getMemberIdFromRequest` vs `getCurrentSession()` — two verified resolvers; convergence out of scope |
| **U4** | Purpose text for ORIENT must be authored; who authors it, and where it lives (House registry vs capability registry) |
| **U5** | `/studio/decisions`, `/worlds/patterns`, `/worlds/journey` have no House destination — unregistered or stale |
| **U6** | Writer's Studio *continuation* state (`ask_threads`) not traced; Slice D depends on it |
| **U7** | Whether `integrating` should count as an open loop (§3) |

## 10. Files a later implementation would touch

**Modified (additive only)**
- `lib/maia/capabilities.ts` — optional fields + populate only what is traced
- `lib/navigation/houseDestinations.ts` — add `getDestination()` helper (Option B)
- one bounded navigation call site for Slice A

**New**
- `lib/maia/__tests__/capabilityRegistry.test.ts` — destination resolution + no-route-literals guard
- possibly `lib/maia/capabilityResolution.ts` — intent → capability → destination, pure and testable

**⛔ Untouched**
`app/maia/page.tsx` · `MaiaShell` · `MaiaCenterField` · `OracleConversation`
(beyond the one bounded Slice-A call site) · all journal/astrology/relationship
domain routes · every schema.

## 11. Standing

**RECONCILIATION ✅ COMPLETE · JOURNAL SURVIVOR NAMED · KEEP/SAVED-PASSAGE RULED ·
CHANGE OPEN-STATE SET RECOMMENDED · REGISTRY SHAPE PROPOSED · HOUSE SEAM SPECIFIED ·
AUTH RESOLVER NAMED · ASTROLOGY WITHHELD · ⛔ NOTHING IMPLEMENTED · ⛔ NO SCHEMA ·
⛔ NO CAPTURE · ⛔ `/maia` UNTOUCHED · PRODUCTION UNTOUCHED.**

Stopped for authorization, as instructed.
