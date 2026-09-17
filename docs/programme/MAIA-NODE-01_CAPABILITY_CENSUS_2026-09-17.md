# MAIA-NODE-01 — capability census

**Date:** 2026-09-17
**Authority:** MAIA-NODE-01 — MAIA as the Relational Nodal Point (founder)
**Branch:** `claude/magical-archimedes-dcsry5`
**Status:** ✅ CENSUS COMPLETE (READ-ONLY) · ⛔ NOTHING BUILT · ⛔ NO REGISTRY WRITTEN

Repository truth only. No source changed. Where a pathway could not be settled
from evidence it is marked UNKNOWN rather than inferred.

---

## 1. Executive finding

**The nodal architecture is already written down, already named, and inert.**

`lib/maia/capabilities.ts` opens with the MAIA-NODE-01 thesis nearly verbatim:

> *"MAIA is not a feature set. MAIA is the orchestrator. Capabilities are things
> MAIA can invoke, guide, and contextualize. Users don't navigate to features.
> They speak, and MAIA routes."*

It defines `CAPABILITY_REGISTRY` with 13 capability ids across journal,
astrology, pattern, wisdom, relationship, depth, studio and schedule.

**It has zero consumers.** The only reference anywhere is a *type* import in
`lib/maia/cognitionEvents.ts:12`, for an event variant `capability_available`
which is **never emitted** (VERIFIED by search). The registry array itself is
imported by nothing.

⭐ So MAIA-NODE-01 is not a greenfield architecture. It is an **unfinished one**,
and the census question changes from *"what should we build"* to *"why did this
stop, and what is actually missing underneath it."*

The answer to the second half is concrete: the existing registry carries
`label`, `worldId`, `modalId` and `voicePhrases`. Of the thirteen fields
MAIA-NODE-01 §III requires, it has **three and a half**. It is a
phrase→modal mapper. **It models no authority at all** — no source of truth, no
read/write, no required context, no permission, no confirmation, no provenance,
no device availability, no failure behaviour.

That is precisely the gap §XIV names: *"MAIA knows what pathways exist and can use
those pathways when the member has authority to do so."* The pathways are
sketched. The authority model is absent.

**Second finding — MAIA already navigates, through a second map.**
`OracleConversation.tsx` calls `router.push()` to `/journal`, `/maia/ideas`,
`/studio/decisions`, `/studio/changes`, `/worlds/patterns`, `/worlds/journey`,
`/reflections/{id}` — as inline literals. Meanwhile `lib/navigation/houseDestinations.ts`
is the declared *"single authoritative definition of every place the House can
open"*, test-guarded against drift. **Nothing in `lib/maia/**` or `lib/sovereign/**`
imports it.** Two navigation maps, one of them canonical and one of them the one
MAIA actually uses.

**Third finding — there is no single authority to check.** See §5: the four
capabilities MAIA would orchestrate use **four different authorization
mechanisms**, one trusting a bare header and one with no authentication at all.

---

## 2. Registry census — three exist, none is the one needed

| Registry | Wired? | What it actually models |
|---|---|---|
| `lib/maia/capabilities.ts` — `CAPABILITY_REGISTRY` | ❌ **INERT** (0 consumers) | 13 ids · label · worldId · modalId · voicePhrases. No authority, no source of truth, no permission |
| `config/toolRegistry.ts` — `TOOL_REGISTRY` | ✅ **LIVE** | Lab tools, categories, modes; **per-member enablement** via `memberToolsService` + `/api/member-tools/*` |
| `lib/connectors/registry.ts` — `CONNECTOR_DEFINITIONS` | ✅ **LIVE** | External providers; Google with `send_email`, `create_calendar_event`, `read_calendar`, `read_contacts`; status/connect/disconnect endpoints |
| `lib/navigation/houseDestinations.ts` | ✅ **LIVE** (House renders from it) | Every destination, route, audience, native policy, return behaviour — drift-guarded |

⭐ **The pieces MAIA-NODE-01 §II asks for exist, in three different places.**
- *What exists* → `houseDestinations` (places) + `connectors/registry` (external)
- *What this member can access* → `toolRegistry` + `memberToolsService` (the only per-member entitlement layer found)
- *What is appropriate in this context* → `member_memory_atoms.memory_scope`, LF-SCOPE-01's boundary, the Ask/disclosure lanes

**Recommendation (⛔ not taken): elevate, do not invent.** A capability registry
that re-declares destinations would become a fourth map and drift from
`houseDestinations` the way `OracleConversation`'s literals already have.

---

## 3. The eight pathways

| Capability | Canonical authority | Auth mechanism | Nodal readiness |
|---|---|---|---|
| **Journal capture** | ⚠️ **Contested** — 4+ POST routes (`journal/quick/*`, `journal/reflect`, `journal/chart-integration`, `community/elemental-alchemy/journal`) over 4 tables (`quick_journal_base`, `quick_journal_audio`, `elemental_journal`, `journal_chart_integration`) | `getMemberIdFromRequest` (on the one sampled) | ⚠️ **Which is canonical is UNKNOWN.** §IV forbids MAIA inventing a second write; today she would have to choose among four |
| **Keeps** | ⚠️ **Two different objects share the name**: `member_memory_atoms` (memory Keeps, `kept_at`) and manuscript passage keeps (`/api/sovereign/manuscripts/[id]/keeps`, `/api/sovereign/keeps`) | `getMemberIdFromRequest` | ✅ Substrate strong; ⚠️ the name collision must be resolved before MAIA routes on the word "keep" |
| **Changes / open loop** | ✅ `studio_changes` + `/api/changes` | `getMemberIdFromRequest`; `WHERE member_id = $1` | ✅ **Ready** — see §4 |
| **Relationships navigation** | ✅ `/api/relationships`, `/relationships/[id]` | `getCurrentSession()` (`lib/auth/serverSessions`) | ✅ Ready to navigate; identity resolution by name is UNKNOWN |
| **Writer's Studio continuation** | ✅ `ask_threads` (`20260901000001`, + subject preparation) | Ask-lane authority | ⚠️ Continuation state not traced this pass |
| **Astrology retrieval** | ⚠️ `/api/astrology/reading` — **NO AUTHENTICATION** | ❌ **none** | ❌ **Not ready.** Stateless: birth data arrives in the request body. §VII requires *member identity → authorized birth data*; neither exists on this route. Where authorized birth data lives is UNKNOWN |
| **Route navigation from conversation** | ⚠️ **Duplicated** — inline `router.push` literals in `OracleConversation` vs the `houseDestinations` registry | n/a | ⚠️ Works, through the wrong map |
| **External / calendar** | ✅ `lib/connectors/registry.ts`; Google OAuth with `read_calendar` / `create_calendar_event`; Microsoft calendars route | OAuth per connector, member-connected | ✅ **Strongest substrate found** — declares capabilities, connection status, and per-member connection |

---

## 4. Open-loop state — the question answered directly

**Which states can be established mechanically today:**

| Carrier | Open/return state | Verdict |
|---|---|---|
| **Changes** (`studio_changes.status`) | ✅ **7-state lifecycle**: `naming → casting → consulting → active → integrating → complete → archived`, indexed | ✅ **Open loop is derivable now**: `status NOT IN ('complete','archived')`. Member-named, member-owned, correctly scoped |
| **Conversations** (`conversation_turns`) | ❌ **NONE.** Columns are exactly `id · user_id · session_id · role · content · created_at` | ❌ **No open/return semantics exist.** No status, no resolved, no closed, no returned-to |
| **Threads** (`member_memory_atoms.thread_ids UUID[]`) | ❌ No threads table. The migration says *"Phase 2 will add the threads table; for now UUIDs are stored"* | ❌ Thread continuity is **not** currently modellable |
| **Ask threads** (`ask_threads`) | ⚠️ Exists, Writer's-Studio-scoped; continuation semantics not traced | UNKNOWN |
| **Keeps** (`member_memory_atoms.status`) | ⚠️ `active · still_alive · set_aside · protected · archived` — disposition, not open/closed | ⚠️ Not an open loop; `set_aside` is the nearest and means *parked*, not *unfinished* |

⭐ **So: Changes yes, conversations no.** "MAIA, remind me what we were working on
yesterday" (§VII) is answerable **only** for Changes today. The Chapter-10
example in the ruling — *"left a question open about the transition"* — has **no
substrate**: neither conversations nor threads carry an open state, so that
answer cannot be given truthfully without new modelling.

⚠️ And a discipline note: `conversation_turns` having no open-state is not a
defect to rush. An "unfinished" flag on a conversation is an inference about the
member unless the member declared it. Changes works precisely because the member
*named* the change and *left it* at a stage. Any conversation open-loop model
should inherit that property rather than compute it.

---

## 5. Authority census — four mechanisms, no common check

| Route | Mechanism |
|---|---|
| `/api/journal/quick/list`, `/api/changes`, `/api/sovereign/keeps` | `getMemberIdFromRequest` — credential-verified (cookie / `x-session-token`) |
| `/api/relationships` | `getCurrentSession()` from `lib/auth/serverSessions` |
| `/api/maia/living-field/*` | `probeAuthPosture` — **returns the bare `x-member-id` header**; its own header calls it Phase-0 log-only scaffolding |
| `/api/astrology/reading` | ❌ **none** |

⛔ **MAIA-NODE-01 §V requires a uniform "check entitlement + permission" step in
every invocation chain. It cannot be built over these four without normalizing
them first** — an orchestrator that calls all four inherits the weakest.

⚠️ No confirmation mechanism was found anywhere: nothing implements §VI's
graduated authority (read / navigate / explicit capture / ambiguous capture /
external action / sharing / crossing / destruction). The nearest existing
analogue is the disclosure-crossing receipt lane (`context_disclosure_receipts`,
`ask_authorization_acts`), which already models *authorization as a durable
record* — ⭐ the right precedent for §VI, and out of scope here.

---

## 6. Duplication findings (§ "which are duplicated across routes")

1. **Navigation** — `houseDestinations` registry vs inline `router.push` literals in `OracleConversation`.
2. **Journal** — four write routes over four tables; canonical owner UNKNOWN.
3. **"Keeps"** — two unrelated objects share the word.
4. **Capability description** — `CAPABILITY_REGISTRY` (inert) vs `TOOL_REGISTRY` (live) vs `CONNECTOR_DEFINITIONS` (live).
5. **Authority** — four mechanisms (§5).

---

## 7. Capability classes (§XIII) against reality

| Class | Status |
|---|---|
| **ORIENT** | ❌ Nothing. MAIA has no access to `houseDestinations`, so she cannot explain what a place is for |
| **NAVIGATE** | ⚠️ Partial — works, via hardcoded literals, not the registry |
| **READ** | ⚠️ Per-capability, four different auth postures |
| **CAPTURE** | ⚠️ Exists per surface; canonical journal owner unresolved |
| **CONTINUE** | ⚠️ Changes only (§4) |
| **TRANSFORM** | ⚠️ Writer's Studio lanes exist; not traced |
| **ACT** | ⚠️ Connectors declare it; no confirmation mechanism |
| **SHARE** | ⚠️ Circle/Co-Lab lanes exist; founder-gated |
| **CROSS** | ✅ **Best-modelled class in the repo** — disclosure receipts, authorization acts, `crossing_must_be_false` |

⭐ Worth noting: the class MAIA-NODE-01 treats as most dangerous (CROSS) is the
one this codebase has already built most rigorously. The classes that are weakest
are the ordinary ones — ORIENT and NAVIGATE.

---

## 8. Owed decisions before any build

1. **Which journal write is canonical?** §IV is unenforceable until this is named.
2. **Resolve the "Keeps" collision** — MAIA cannot route on an ambiguous noun.
3. **Normalize authority**, or scope the first nodal capabilities to routes already using `getMemberIdFromRequest`.
4. **Elevate `houseDestinations` into MAIA's context** — the smallest real ORIENT/NAVIGATE step, and it removes a duplicate map rather than adding one.
5. **Astrology**: where does authorized birth data live, and should that route be authenticated? (It is currently open.)
6. **Do not model conversation open-loops by inference** (§4).
7. **Decide the fate of `CAPABILITY_REGISTRY`** — complete it, or retire it so it stops reading as capability that exists.

## 9. Standing

**CENSUS ✅ COMPLETE · ⛔ NO REGISTRY WRITTEN · ⛔ NO ROUTING BUILT · ⛔ NO AUTH
CHANGED · ⛔ NO SOURCE MODIFIED · `/maia` UNTOUCHED · PRODUCTION UNTOUCHED.**

> The pathways are sketched. The authority model is absent. That is the gap.
