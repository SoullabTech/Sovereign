# MAIA House Presence — Implementation Note

**Date:** 2026-07-17 · **Directive:** Kelly, 2026-07-17 ("Unify the relationship before unifying the interfaces")
**Audit:** [MAIA_HOUSE_PRESENCE_AUDIT_2026-07-17.md](./MAIA_HOUSE_PRESENCE_AUDIT_2026-07-17.md) — preserved, not replaced.
**Branch:** `feature/practitioner-program-platform`

## Phase 0 — Audit verification against current branch

Every load-bearing audit anchor re-verified 2026-07-17. Corrections:

| Audit claim | Verified state |
|---|---|
| `lib/maia/platformKnowledge.ts` | **Stale path** — actual: `lib/sovereign/platformKnowledge.ts` (+ `lib/sovereign/__tests__/platformKnowledge.test.ts`). Content as described: 5 blocks + `PLATFORM_KNOWLEDGE_ADDENDUM`, header "NOT WIRED", zero non-test imports. |
| `MaiaPresenceProvider` mounted nowhere | Confirmed. **Correction:** `useMaiaPresence` IS imported by `components/MaiaSettingsPanel.tsx:11` — it runs on the no-provider fallback (all toggles no-op). Its "witness mode" ("MAIA proactively offers reflections") violates directive constraints 4/6/7 and is dead. |
| OracleConversation mounted at `/maia` only (page, no layout) | Confirmed: `app/maia/page.tsx:731` (spatial shell) and `:1453` (classic), no `app/maia/layout.tsx`. Also `/studio/maia`, `/field/talk`. |
| Doorways use `window.location.href` | Confirmed: `components/OracleConversation.tsx:4034,4044,4048,4052,4060,4064` (+ `8602`, `8759`, `9242` — additional hard navs). |
| No route/place in request body | Confirmed: body built at `OracleConversation.tsx:4616-4728`; `studioContext.pathname` received but unused server-side (`list/route.ts:670-678`). |
| Daily sessionId rotation | Confirmed: `app/maia/page.tsx:436-460` (`maia_session_id` + `maia_session_date`, `session_${Date.now()}`). |
| Restore effect (same-day rehydrate) | Confirmed: `OracleConversation.tsx:2810-2901`, no longer gated by `maia_nav_teardown`. |
| Addenda seam | Confirmed: FAST = template literal `maiaService.ts:1270` reading `meta.*Addendum` (~1195-1258); CORE = meta→`MaiaContext` copy (`maiaService.ts:1520-1556`) → `buildMaiaWisePrompt` → `appendAllContextAddenda` (`maiaVoice.ts:477`, called at `:893` and `:1025`). Route passes server-built addenda after `...meta` (`list/route.ts:1041-1050`). |
| Duplicate assistants | Confirmed: `SessionReviewChat`, `MentorChat`, `MentorPanel`, `NowWhatRoom` + endpoint sprawl. |

## Current state → intended state

**Current:** one true conversation surface mounted per-page; no global presence; no place transmission; platform map unwired; 4 parallel MAIA-branded chats; doorway navigation via full page loads; daily session rotation orphans yesterday's visible thread.

**Intended (this correction):** one canonical relationship layer (`MaiaPresence`) mounted once in the root member shell — identity + sessionId + place + presentation state; one quiet handle opening the same conversation as a sheet over any governed room; facts-only `place` reaching the prompt; authored house knowledge wired into FAST + CORE + DEEP; client-router navigation; duplicate surfaces classified (not yet unified — see Phase 6); cross-day semantics documented and STOPPED for Kelly's ruling.

## Architecture decisions (with rationale)

1. **Canonical identity module** (`lib/maia/presence/conversationIdentity.ts`): extracted from `app/maia/page.tsx:436-460` verbatim semantics (same keys, same daily rotation). Both `/maia` and the global provider call it → structural impossibility of duplicate session mint. Daily rotation is PRESERVED (changing it = Phase 7 Kelly ruling).
2. **Partial controller extraction — declared, not hidden.** The directive's ideal controller owns transcript/streaming/sendMessage. `OracleConversation.tsx` is 9,399 lines with streaming, voice, crisis, capsule, and doorway logic interwoven; extracting its message pipeline in this pass is a rewrite-scale risk. What IS canonicalized now: identity (session + member), place, presentation state, and a **single global instance** of OracleConversation (lazy-mounted in the provider's sheet, kept mounted across routes once opened). Rooms never instantiate conversation state. Full-page surfaces (`/maia`, `/studio/maia`, `/field/talk`) remain expressions of the same identity; handle/sheet suppressed there to prevent dual mounts. Cross-surface continuity between sheet and full page rides the existing localStorage+PG rehydrate (same sessionId) — honest continuity matrix reflects this (identity-and-persistence shared; live React state shared only within each surface).
3. **Sheet, not bubble.** Handle: small, static (no pulse/ping — the dead overlay's `animate-ping` is exactly what the directive forbids), labeled MAIA, consistent placement, dismissible; never auto-opens; renders only for signed-in members (`getValidMemberId()` — same gate as BugReportButton) on governed routes.
4. **Governed-route predicate** (single source in `lib/maia/presence/place.ts`): governed = registry match. Excluded: public/marketing/onboarding/auth, `/now-what/*` (founder-directed isolation — approved exception pending ruling), full conversation surfaces (suppression), practitioner-only admin surfaces (labtools/stellium/founder — not member rooms).
5. **Place = facts only, sent only with speech.** `place` rides the message POST body exclusively (constraint 5 satisfied structurally — no other transmission channel exists). Registry-declared facts; `useMaiaPlace` lets a room add object-level facts (`objectType`/`objectId`). No timers, no click/dwell/scroll telemetry anywhere in the layer.
6. **Platform knowledge wired always-on** at the authored choke point (`appendAllContextAddenda`) + FAST template. The file's own wiring instruction specifies this exact seam. No retrieval infra exists for a smaller deterministic subset; keyword-gating AREAS would be brittle (misses "how do I get back to my journal?"). ~2.2k tokens/turn cost accepted; retrieval optimization documented as follow-up. Kelly's Phase-5 directive is recorded as the voice-pass approval the file header awaited. **Deploy-order rider (R-B) preserved:** the Now What? compass entry describes the FIXED rail; PR #621 must merge before this reaches production (listed in Unresolved Rulings).
7. **Duplicate surfaces:** classified this pass (typed `MaiaPosture` contract created); code unification deferred per directive's own ordering ("Claude Code should not begin by deleting the mentor chats"). Dispositions + required rulings in the final deliverable table.

## Files changed (running log)

- `docs/architecture/MAIA_HOUSE_PRESENCE_IMPLEMENTATION.md` — this note
- `lib/maia/presence/conversationIdentity.ts` — NEW: canonical session identity
- `lib/maia/presence/place.ts` — NEW: MaiaPlaceContext type, validation, governed-room registry, addendum builder
- `lib/maia/presence/postures.ts` — NEW: MaiaPosture contract (Phase 6)
- `components/maia/presence/MaiaPresence.tsx` — NEW: canonical provider + handle + sheet + `useMaiaPlace`
- `app/layout.tsx` — mount MaiaPresence once
- `app/maia/page.tsx` — session mint → canonical module; passes place
- `components/OracleConversation.tsx` — `placeContext` prop → body `place`; doorways → `router.push`
- `app/api/sovereign/app/maia/list/route.ts` — validate `body.place` → `placeAddendum`
- `lib/sovereign/maiaService.ts` — FAST: place + platform knowledge in template; CORE: place passthrough
- `lib/sovereign/maiaVoice.ts` — `placeAddendum` in MaiaContext + ADDENDA_SPECS; platform knowledge in `appendAllContextAddenda`
- `lib/sovereign/platformKnowledge.ts` — header status update (wired under 2026-07-17 directive)
- `app/maia/moments/page.tsx`, `app/maia/anchor/history/page.tsx` — explicit return affordances
- `lib/contexts/MaiaPresenceContext.tsx` — DELETED (dead abstraction); `components/MaiaSettingsPanel.tsx` — remove dead ambient/witness toggles
- Tests: `lib/maia/presence/__tests__/*`, `lib/sovereign/__tests__/platformKnowledgeWiring.test.ts`

## Decisions required (Kelly) — running list

1. Cross-day session semantics (Phase 7 options doc — implementation STOPPED).
2. Disposition of `MentorChat` / `MentorPanel` / `SessionReviewChat` (unify-as-posture vs rename-as-tool, per surface).
3. Now What? isolation: keep excluded from global presence, or govern it.
4. Deploy ordering: PR #621 (compass fix) before this reaches production (R-B rider).
5. Overlay conversation ships text-first (voice reachable at `/maia`) — confirm or extend voice to sheet.

## Risks

- OracleConversation is heavy; sheet uses lazy `next/dynamic` mount on first open (no cost until summoned). Kept mounted afterward — memory footprint of one conversation instance persists across the session (accepted; it's the relationship).
- Two active surfaces cannot be simultaneously live (suppression on full-surface routes prevents this); switching surfaces relies on rehydrate — same-day only until Phase 7 ruling.
- Platform knowledge adds ~2.2k tokens per turn across tiers.
- iOS/Capacitor: MobileRouteGuard limits routes; handle inherits that gate. Static-export builds keep localStorage restore only (pre-existing).

## Phase 6 — Assistant-surface reconciliation

Contract created: `lib/maia/presence/postures.ts` (`MaiaPosture`) — the only sanctioned specialization mechanism going forward. Per the directive's ordering ("unify the relationship before unifying the interfaces"), no functioning surface was deleted this pass. Dispositions:

| Surface | Previous behavior | Classification | Relationship to canonical MAIA | Disposition |
|---|---|---|---|---|
| `OracleConversation` (`/maia`, `/studio/maia`, `/field/talk`, presence sheet) | The true conversation | **1 — canonical MAIA surface** | IS the relationship; now also the global sheet instance | **Unified** (single global instance + full-page expressions on shared identity) |
| `HelpHubSheet` | Static orientation panel | **3 — bounded non-conversational tool** | No conversation; routes to guides | **Retained** as-is |
| Ideas detail "Continue thinking…" composer | Idea-scoped notes | **3 — bounded non-conversational tool** | A room tool, not an assistant | **Retained**; must never gain a MAIA voice |
| `MentorChat` (`/studio/changes/[id]`, SSE `/api/studio/changes/[id]/mentor/chat`) | "Inline Streaming Conversation with MAIA Mentor" — separate impl, separate state | **2-candidate / 4** | Wears MAIA's name without her memory or thread → duplicate-identity risk | **Retained pending Kelly ruling** (unify as `change-reflection` posture vs rename as tool). Global handle now present in the room, so the real MAIA is reachable beside it — the contradiction is visible and must be resolved |
| `MentorPanel` (`/studio/decisions/[id]`, `/api/studio/decisions/[id]/mentor`) | "MAIA Mentor Panel" reflection generator | **2-candidate / 4** | Same duplicate-identity risk | **Retained pending Kelly ruling** (posture `decision-witness` vs tool rename) |
| `SessionReviewChat` (`/studio/session-room`, `/api/scribe/review-session`) | "Post-session conversation with MAIA" | **2-candidate / 5** | Touches scribe/practitioner/session privacy boundaries | **Retained pending Kelly ruling** — stop condition ("specialized mentor surface whose purpose cannot safely be preserved" + practitioner/client visibility) |
| `NowWhatRoom` (`/api/now-what/interview`) | Guided MAIA conversation, own container | **5 — intentionally isolated** | Founder-directed isolation; excluded from presence registry | **Retained**; unification is Kelly's call (stop condition: Now What? data visibility) |
| `/api/library/ask-jeeves` | Library Q&A service | **3 — internal knowledge service** | One-voice ruling: backstage retrieval, never a second character | **Retained** (rename = held cleanup) |
| Dormant endpoints (`/api/oracle/conversation`, `/api/between/chat` default, `/api/ask-maia`, `/api/maia/chat`) | Zero/low traffic parallel routes | **4 — legacy duplicates** | Not member-visible surfaces | **Documented**; removal is Phase-6 follow-up, not this pass |
| `lib/contexts/MaiaPresenceContext.tsx` + Ambient/Witness settings toggles | Dead "persistent companion" + toggles promising proactive reflections | **4 — legacy duplicate (dead)** | Contradicted constitution (proactive witness mode) | **REMOVED** |

## Phase 7 — Continuity: what is fixed vs. what awaits ruling

Concepts explicitly separated (do not conflate):
- **UI mount continuity** — FIXED: the presence provider + global conversation instance survive client-side route changes; doorways no longer force full-document loads.
- **Visible transcript persistence** — same-day: localStorage + `conversation_turns` rehydrate (pre-existing, now exercised by one canonical sessionId). No duplicate session mint is possible (single identity module).
- **Active conversation identity** — canonical: `lib/maia/presence/conversationIdentity.ts`.
- **Cross-session memory / episodic / anamnesis / member marks** — untouched; separate server subsystems; consent + Sanctuary behavior unchanged.
- **Daily session grouping** — UNCHANGED, decision pending (below).

**Cross-day semantics — STOPPED for Kelly's ruling.** Today the sessionId rotates each calendar day; yesterday's transcript persists in PG but no UI path reloads it, so the next-morning open is visually blank while server memory remains whole — the felt/actual continuity split. Options (all implementable on the canonical module):
1. **One continuously visible conversation** — restore member-scoped recent turns regardless of sessionId. Maximal continuity; risks the conversation feeling like an endless scroll rather than a living present.
2. **Daily chapters within one relationship** — keep rotation; sheet/page shows a quiet "yesterday" affordance that loads the prior session on request. Continuity offered, never imposed.
3. **Consciously closed sessions** — rotation stays; MAIA's opening acknowledges continuity through memory (as now), with an explicit member gesture to reopen any prior day.
4. **Another governed model** Kelly names.
No option was implemented. The rotation's meaning is a relationship decision, not infrastructure.

## Verification evidence (2026-07-17)

**Automated:** 75/75 jest tests green (`lib/maia/presence/__tests__/place.test.ts`, `lib/sovereign/__tests__/platformKnowledgeWiring.test.ts`, `lib/sovereign/__tests__/platformKnowledge.test.ts`). `npm run typecheck`: **0 errors**. `npm run check:no-supabase`: clean.

**Live dev-server walkthrough** (fabricated member in localStorage; dev DB absent, so API-backed content shows load errors — presence layer is independent of that):
| Route | Expected | Actual |
|---|---|---|
| `/guides` (member) | quiet handle renders | ✅ handle present |
| `/now-what` → `/arrive` | NO presence (isolation) | ✅ absent |
| `/signin` (post sign-out redirect) | NO presence (ungoverned) | ✅ absent |
| `/maia/moments` (member) | handle; open → sheet with same conversation; place label | ✅ sheet opened, OracleConversation greeted ("I'm here when you're ready"), header shows "· Marked Moments"; screenshot captured in session |
| Escape key | sheet closes, stays mounted, handle returns | ✅ `sheetStillMounted: true, sheetHidden: true, handleBack: true` |
| Moments header | explicit "← MAIA" destination | ✅ renders and navigates |
| Console | no errors | ✅ none |

**Not walkable locally** (needs a real authenticated member — Kelly's walk): `/maia` full-surface suppression live (covered by `isFullConversationRoute` unit test + code path), place block appearing in a production prompt (`🚪 [Route] place context applied` / `🏠 [House Knowledge]` log markers are greppable post-deploy), cross-room transcript continuity under real auth, mobile behavior.

**Commits** (branch `feature/practitioner-program-platform`):
`40b8a8c5c` refactor: establish canonical MAIA presence provider · `bb4e3ceb3` feat: mount persistent MAIA surface in member shell · `ea5022bb8` fix: preserve MAIA state across house navigation · `0dd8462e6` feat: add facts-only room context and wire platform knowledge into MAIA · `16364112c` test: verify MAIA house presence and continuity

## Continuity matrix (honest claims only)

| Event | Visible transcript | Conversation identity | Server memory |
|---|---|---|---|
| Sheet close/reopen | **Survives live** (kept mounted) | same | untouched |
| Client route change (governed↔governed) | **Survives live** (provider persists) | same | untouched |
| Route to ungoverned room / full surface and back | Survives via same-day rehydrate (localStorage+PG) — invisible seam, not live state | same | untouched |
| Sheet ↔ /maia full page | Shared identity + persistence, NOT shared live React state — rehydrate on surface switch | same | untouched |
| Refresh / new tab | Survives via rehydrate | same | untouched |
| Browser restart | Survives via rehydrate (localStorage intact) or PG restore | same | untouched |
| Daily boundary | **Does not survive visibly** (rotation orphans thread — PENDING Kelly ruling, Phase 7) | rotates | **survives** (atoms, spiral state, anamnesis) |
| Explicit session close | n/a — no such gesture exists today (option 3 in Phase 7) | — | — |

## Privacy & non-monitoring proof

**What is sent:** exactly one optional `place` object — `{placeId, placeName, route, purpose?, objectType?, objectId?}` — and only inside the POST body of a message the member sends. **When:** at send time; the pathname is read at that moment. **Structurally unavailable:** there is no route-change listener that transmits, no timer, no click/scroll/dwell capture anywhere in `lib/maia/presence/` or `components/maia/presence/`; server-side `validatePlaceContext` drops every non-allowlisted field, so even a tampered client cannot smuggle behavioral data into the prompt; the PLACE block text itself instructs MAIA never to infer why the member is there; room registration (`useMaiaPlace`) writes only to React state. Unauthenticated routes render children only — no member state exists in the layer. Sanctuary, consent, sealed-learning, and practitioner/client boundaries: untouched (no changes to any memory write path).
