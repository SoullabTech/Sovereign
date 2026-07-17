# Does MAIA Remain Present Throughout the House? — Audit

**Date:** 2026-07-17
**Status:** AUDIT ONLY — no implementation. Stop condition honored: nothing built or refactored.
**Question:** Do members leave MAIA in order to use a feature, or does MAIA accompany them?
**Verdict in one line:** Today, members leave MAIA to use every feature. The relationship survives *underneath* (server memory) but not *experientially* (no presence, no room-awareness, four parallel "MAIAs"). A persistent icon does not exist — and notably, the one that was designed (`MaiaPresenceContext`) was never mounted.

Evidence labels: **[EXISTS]** verified in code · **[PARTIAL]** built but incompletely wired · **[UNWIRED]** built, zero call sites · **[INFERRED]** reasoned, not directly witnessed · **[PROPOSED]** does not exist.

---

## A. Current architecture — how MAIA presence and conversation state actually work

### A.1 One true surface, mounted in three places [EXISTS]
The canonical MAIA relationship surface is `components/OracleConversation.tsx`. It is mounted at:
- `/maia` (`app/maia/page.tsx:731`, inside `MaiaCenterField`)
- `/studio/maia` (`app/studio/maia/page.tsx:107`)
- `/field/talk` (iOS voice-first surface)

Everywhere else in the house, it is unmounted. There is **no `app/maia/layout.tsx`**; the conversation is a page, not a shell.

### A.2 Conversation state model [EXISTS]
- Transcript = React component state (`OracleConversation.tsx:659`), mirrored to localStorage `maia_conversation_${sessionId}` (last 50 msgs, `:2917`) and PostgreSQL `conversation_turns` via `POST /api/conversation/turns` (`:2956`).
- `sessionId` minted in `app/maia/page.tsx:457` as `session_${Date.now()}`, cached in localStorage, **rotates daily** (`page.tsx:437-460`).
- On remount/refresh/deep-link, a restore effect (`OracleConversation.tsx:2825-2901`) rehydrates from localStorage, then PG, keeping whichever is fuller. The CONTINUITY INVARIANT comment (`:2810-2824`) confirms restore is no longer gated by teardown flags.
- **So: same-day transcript survives navigation away and back — via reload, not via a kept-mounted component.** Cross-day, the rotated sessionId orphans the prior transcript (data persists in PG but no UI path reloads an old sessionId — [INFERRED] no such path found).

### A.3 Server-side felt continuity is a separate, stronger subsystem [EXISTS]
The prompt never loads `conversation_turns`; clients resend history (`list/route.ts:715-719` takes `meta.conversationHistory.slice(-6)`). Felt continuity comes from per-member server state independent of any client transcript: memory atoms, cross-session exchanges, developmental memories, Bridge D spiral state, anamnesis writes. This survives total client loss. **Relationship memory is more durable than the visible conversation** — the opposite of what the member experiences.

### A.4 No global MAIA presence — and the designed one is dead code [EXISTS/UNWIRED]
- Root layout (`app/layout.tsx`) mounts Subscription/SystemHealth/AethericConsciousness/FeatureTooltip providers, BetaBanner, BugReportButton, MobileRouteGuard — **no MAIA affordance**.
- `lib/contexts/MaiaPresenceContext.tsx` **[UNWIRED]** — explicitly implements "persistent companion across all pages" (fixed z-9999 floating overlay). `MaiaPresenceProvider` has **zero mount sites**. Its expanded state says "Ambient voice coming soon." This is the house's ghost: the intended answer to this audit's question was designed and never wired.
- Each area supplies its own shell (stellium sidebar, studio rail, labtools sidebar, book-studio chrome, NowWhatShell hallway). No shared inner shell spans areas.

### A.5 MAIA does not know where the member is [EXISTS — negative finding]
- Request body (`OracleConversation.tsx:4616-4729`) carries no `currentRoom`/`route`/`pathname`. The only route-ish field, `studioContext.pathname`, is destructured server-side and **never used** (`list/route.ts:670-678`).
- Prompt layers (`maiaService.ts:1270`) include identity, mode, time, relationship, sanctuary, atoms, recall layers, etc. — **no page/room layer**.
- The 5-layer platform map `lib/maia/platformKnowledge.ts` **[UNWIRED]** — self-labeled "AUTHORED CANDIDATE — NOT WIRED"; only its tests import it. What IS wired is `PLATFORM_KNOWLEDGE_BOUNDARY` (`maiaVoice.ts:437-498` via `appendAllContextAddenda`) — a discipline about what MAIA must not claim, not a map of the house.
- Net: MAIA can neither answer "what is this room?" groundedly nor truthfully say "I see you're in the Journal" — she structurally cannot know.

### A.6 Navigation from conversation: seven hard doorways [EXISTS]
`lib/consciousness/intentRouter.ts` keyword-matches 7 intents → `MaiaUiAction`; client `handleDoorwayAction` (`OracleConversation.tsx:4028`) navigates via **`window.location.href`** (`:4034-4064`) — a full page load that tears down the SPA (transcript survives only via the rehydrate path). `isOrientationAsk()` suppresses doorways on orientation questions (good — no routing-engine drift on "show me around"). Caveat under the non-inference principle: `detectIntent` reads `field.userInput + maiaResponse` — it pattern-matches member *speech* (acceptable: explicit statements) but including MAIA's own response text in the match corpus is a mild inference channel worth a ruling.

### A.7 Multiple unrelated assistants [EXISTS]
Four member-facing, MAIA-branded conversational surfaces exist **outside** OracleConversation, each with its own state and endpoint (detail in §C.5). Plus dormant/parallel endpoints: `/api/between/chat` (OracleConversation's *default* apiEndpoint, `:560`), `/api/oracle/conversation` (dormant), `/api/library/ask-jeeves`, `/api/ask-maia`, `/api/maia/chat`, `/api/portal/[slug]/chat`.

**Current presence model, named:** MAIA is *available only on conversation pages*, with *duplicate room-local assistants* elsewhere, over a *durable server-side relational substrate* that the member cannot see from inside a room.

---

## B. Room-by-room map

| Room | Arrival | MAIA present | Continuity | Context MAIA has | Return path | Evidence |
|---|---|---|---|---|---|---|
| **/maia** (baseline) | post-onboarding redirect; sign-in flows | **Yes** — OracleConversation + overlay sheets (QuickJournal `:1679`, HelpHub `:1725`) that do NOT unmount conversation | Preserved | Full prompt stack; no room concept needed | — | `app/maia/page.tsx:730-731` |
| **Home/landing** | `/` marketing → `/home` redirects to `/signin` or `PortalThreshold` | No (by design pre-auth) | n/a | none | flows push to `/maia` | `app/page.tsx:3`, `app/home/page.tsx:83-88` |
| **Studio** | nav links | **No** on index; separate `/studio/maia` mounts real OracleConversation (back → `/studio`) | Weakened (full unmount; same-day rehydrate on return) | none | `/studio/maia` exists but is a *second copy* of the surface | `app/studio/page.tsx:53`, `app/studio/maia/page.tsx:90,107` |
| **Ideas** `/maia/ideas` | link from IdeasPanel in conversation (`components/maia/panels/IdeasPanel.tsx:85`) | **No**; detail page has idea-scoped "Continue thinking…" composer (`[id]/page.tsx:880`) — a tool, near duplicate-assistant line | Weakened | none | **Yes** — "Return to MAIA" `router.push('/maia')` (`page.tsx:122`) | `app/maia/ideas/*` |
| **Journal** | `/journal` = server redirect; real journal is QuickJournalSheet **overlay on /maia** | **Yes** (as sheet — the one room that got this right) | **Preserved** — conversation stays mounted beneath | conversation context intact | close sheet | `app/journal/page.tsx:3`, `app/maia/page.tsx:1679` |
| **Changes** `/studio/changes` | studio nav | **No**; detail embeds `MentorChat` — separate SSE "MAIA Mentor" (`/api/studio/changes/[id]/mentor/chat`) | **Broken** + duplicate assistant | none shared with main MAIA | **None** (studio-scoped nav only) | `app/studio/changes/[id]/page.tsx:881`, `components/studio/changes/MentorChat.tsx` |
| **Decisions** `/studio/decisions` | studio nav | **No**; detail embeds `MentorPanel` ("MAIA Mentor Panel", `/api/studio/decisions/[id]/mentor`) | **Broken** + duplicate assistant | none shared | **None** | `app/studio/decisions/[id]/page.tsx:846` |
| **Guides/HelpHub** | `/guides`; HelpHubSheet overlay on `/maia` | Guides page: No (static). HelpHubSheet: static orientation panel, **not** an assistant — pushes to `/maia/guide`, `/guides` | Guides: weakened; HelpHub sheet: preserved | none | **Yes** — `backHref="/maia"` "Back to MAIA" | `app/guides/page.tsx:9`, `components/help/HelpHubSheet.tsx` |
| **Soul Portrait** `/soul-portrait/[slug]` | share/portrait flows | No (server-rendered static) | Weakened | none | `ReturnToSoullab` (not to `/maia`) | `app/soul-portrait/[slug]/page.tsx:36,50` |
| **Session Room** `/studio/session-room` | studio | **No**; embeds `SessionReviewChat` ("Post-session conversation with MAIA", `/api/scribe/review-session`) — duplicate assistant | **Broken** | none shared | "Return to sessions" only; **no** back-to-MAIA | `app/studio/session-room/page.tsx:1083,1649` |
| **Moments** `/maia/moments` | link from within OracleConversation (`:8200`) | No | Weakened (same-day rehydrate on return) | none | `router.back()` only — history-dependent, breaks on deep-link | `app/maia/moments/page.tsx:44,103` |
| **Anchor history** `/maia/anchor/history` | from `/maia/anchor` | No | Weakened | none | `router.back()` only | `app/maia/anchor/history/page.tsx:55,123` |
| **Now What** `/now-what/*` | own front door (`arrive`), own sign-in; **deliberately isolated** (founder direction) | `NowWhatRoom` is a MAIA-guided conversation but a **parallel implementation** (`/api/now-what/interview`) | Separate world by intent | its own | none to `/maia` (intentional) | `components/now-what/NowWhatRoom.tsx:409`, `NowWhatShell.tsx` |

Pattern worth naming: **the Journal sheet is the only room built as "room over relationship" (overlay) rather than "room instead of relationship" (route).** It is the existing proof that the desired shape works in this codebase.

---

## C. Breakpoints — where the member is handed off

### C.1 Visual absence [EXISTS]
Every non-conversation route. No global dock/handle; `MaiaPresenceProvider` unmounted (§A.4). The member's only way to be accompanied is to *go back to the conversation page* — inverting the principle "a member never needs a feature to be accompanied" into "a member needs the conversation feature to be accompanied."

### C.2 Conversation-state loss [PARTIAL — narrower than it looks]
- Same-day, same-device: transcript survives via rehydrate. Not a kept relationship — a reconstructed one, but the seam is invisible (`:2887-2891`).
- **Cross-day:** daily sessionId rotation orphans yesterday's thread; no UI reloads it. Next-day return = visually blank slate despite full PG history. This is the largest *pure state* break.
- Doorway navigation itself uses `window.location.href` — every MAIA-suggested room entry is a full teardown/reload.

### C.3 Context loss [EXISTS — total]
No room context ever reaches MAIA (§A.5). If a member opens the conversation from inside Decisions and asks "what is this room for?", MAIA cannot answer groundedly — and the wired boundary discipline (correctly) forbids her pretending. Context loss is structural, not accidental: the map (`platformKnowledge.ts`) is authored+tested but has zero imports.

### C.4 Navigation fragmentation [EXISTS]
Three inconsistent return grammars: explicit "Back/Return to MAIA" (Ideas, Guides), bare `router.back()` (Moments, Anchor history — breaks on deep links/refresh), and **none** (Changes, Decisions, Session Room, Soul Portrait, Encounters). Studio has its own second mount of the surface (`/studio/maia`) rather than a way back to *the* conversation.

### C.5 Duplicate-assistant risk [EXISTS — already actualized]
Four parallel MAIA-branded conversational implementations, none sharing the main surface, thread, or memory write-path with the member's relationship:
1. `SessionReviewChat` (Session Room, `/api/scribe/review-session`)
2. `MentorChat` (Changes, `/api/studio/changes/[id]/mentor/chat`)
3. `MentorPanel` (Decisions, `/api/studio/decisions/[id]/mentor`)
4. `NowWhatRoom` (`/api/now-what/interview`) — isolated by founder direction; listed for completeness, not as a defect
Plus endpoint sprawl (§A.7). This directly contradicts the ratified one-MAIA/one-voice ruling (Jeeves ruling). The member meets "MAIA" in four rooms and none of those MAIAs is the one who knows them.

### C.6 Mobile-specific [EXISTS/INFERRED]
- `MobileRouteGuard` allowlist means some rooms don't exist on iOS at all — presence map differs per platform.
- Static Capacitor builds lose the PG restore path (API routes excluded) → transcript continuity degrades to localStorage-only; WebView resets then produce the known "it forgot me" symptom while server memory silently remains intact — the worst version of the felt/actual continuity split.

---

## D. Smallest coherent architecture [PROPOSED]

Design stance: **presence = shared state + place-awareness + one voice — not an icon.** The Journal sheet pattern, generalized and inverted: today the journal is a sheet over the conversation; the proposal makes the conversation a sheet over any room.

### D.1 What should be global (one thing, mounted once)
A single `MaiaPresence` layer in the **root layout** (member-authenticated routes only; excluded on public/marketing/share/Now-What surfaces), owning:
- the member's thread identity (sessionId + continuity policy),
- one **quiet handle**: small, fixed, identical in every room — no badge, no pulse, no unprompted speech, dismissible per-session. Quiet = size + silence, never hidden (per quiet-≠-invisible discipline).
- one **conversation sheet**: opening the handle slides the *same* OracleConversation state over the current room (room stays visible/dimmed beneath, keeps visual priority when closed). Closing returns to the room exactly as left.
`MaiaPresenceContext.tsx` is the natural skeleton to revive — but as this conversation sheet, not the "ambient voice coming soon" bubble it currently sketches.

### D.2 What stays local to each room
Everything else: room state, room tools, room composers (the idea-notes composer is a *tool* and should stay one — labeled as a tool, not as MAIA). Rooms remain fully usable with the sheet never opened. No room imports conversation logic.

### D.3 How current-room context is passed — facts only
- Client: one field in the existing request body, e.g. `place: { room: 'decisions', detail?: 'decision:<id-title>' }` — derived from the pathname at *send time only*. **No dwell time, no click trail, no route-change events, no "member has been idle."** Context rides only on messages the member chooses to send; presence of context never triggers MAIA speech. This keeps the non-monitoring principle structural: nothing is transmitted except when the member speaks.
- Server: one small prompt layer ("The member is currently in the Decisions room") + **wire `platformKnowledge.ts` AREAS layer** (currently authored, tested 78/78, unwired — awaiting Kelly's voice pass per standing note) so "what is this room?" gets a grounded answer. The existing `PLATFORM_KNOWLEDGE_BOUNDARY` stays as the guardrail: MAIA knows the house's shape, never the member's account state or reasons for entering.

### D.4 Conversation continuity
- Decouple transcript restore from daily sessionId rotation: on open, load the member's recent turns (member-scoped, not sessionId-scoped) so day boundaries stop amputating the visible relationship. (Whether yesterday's thread *should* be visible by default is a Kelly ruling — continuity vs. fresh-morning threshold; both are implementable.)
- Replace `window.location.href` doorway navigation with `router.push` so MAIA-suggested movement stops being a teardown.

### D.5 Summoning and dismissal
Member-initiated only. Handle → sheet opens (MAIA says nothing until spoken to; the room's name may appear as a quiet label, which is state, not speech). Dismiss → sheet closes, room untouched. Deep links and refreshes land in the room with the handle present and the sheet closed.

### D.6 What must NOT be centralized
- Room logic and room tools (no "MAIA renders the room").
- The four mentor/review chats' *functions* — but their *voice* needs a ruling: fold each into the one MAIA (same surface, room context supplied) or explicitly rename/reframe them as tools that do not wear MAIA's name. Leaving four MAIAs standing is the one option the one-voice ruling forecloses. This is Kelly's call per surface, not this audit's.
- Now What stays sovereign (explicit founder direction) unless Kelly rules otherwise.

### D.7 What stays unbuilt (refusals)
No route-change auto-open. No per-room assistants. No screen narration. No behavior/inactivity monitoring. No inferred-intent expansion (the orientation guard's doorway-suppression stays). No proactive "I noticed you're in…" — MAIA may *know* the room; she may not *volunteer* observations about the member's movement through it.

---

## E. Experience sketches (under the proposed architecture)

**1. Book idea → Studio.** Member and MAIA are mid-conversation about a book. Member opens Studio via ordinary nav (or a doorway). The room takes the screen; the quiet handle sits in the corner. Mid-work, the member opens the sheet: same transcript, same thread — "how does this chapter outline relate to what we discussed?" MAIA answers with conversation context *and* `place: studio`. Sheet closes; Studio never moved.

**2. Independent Decisions use.** Member deep-links to `/studio/decisions/[id]`, works alone for twenty minutes. MAIA neither appears nor speaks — the handle just exists. Member opens the sheet and asks "what's this room actually for?" MAIA answers from the wired AREAS knowledge + `place: decisions`. She does not know how long they were there, what they clicked, or why they came — structurally cannot, per D.3.

**3. Soul Portrait → Journal.** Member views their portrait, opens the sheet, talks about what it stirred, then says they want to write. MAIA offers the journal doorway; `router.push` opens it (as the existing sheet on /maia, or its room form). The thread that held the portrait conversation is the same thread present beside the journal. Returning to conversation is not a return at all — it never ended.

---

## F. Recommendation and sequence

**Copy/interaction design only (no architecture):**
1. Unify the return grammar — explicit "Back to MAIA" (never bare `router.back()`) on Moments, Anchor history; add return paths to Soul Portrait, Changes, Decisions, Session Room. *Smallest real repair available today.*
2. Naming pass on the mentor/review surfaces pending the one-voice ruling.

**Achievable through the existing shell (small, reversible):**
3. Mount the global presence layer (revive `MaiaPresenceContext` as handle + conversation sheet, D.1) — the provider slot in root layout already exists; the sheet reuses OracleConversation and the existing rehydrate path.
4. Doorways: `window.location.href` → `router.push`.

**Architectural change (Kelly review first):**
5. `place` field + room prompt layer + wiring `platformKnowledge.ts` AREAS (gated on Kelly's voice pass, already pending).
6. Member-scoped transcript restore across the daily sessionId boundary (needs the continuity-vs-threshold ruling).
7. One-voice reconciliation of `SessionReviewChat` / `MentorChat` / `MentorPanel` (per-surface rulings).

**Remains unbuilt:** everything in D.7.

**Safest sequence:** 1 → 3 → 4 → (Kelly reviews this audit) → 5 → 6 → 7. Step 1 is pure links; step 3 is one mount + one component, removable in a single revert; nothing before step 5 changes what MAIA knows, only where she can be reached.

**Sovereignty check (per CLAUDE.md §6):** agency ↑ (member summons, never summoned-at); pushes outward (rooms stay primary, MAIA quiet); psychological centrality ↓ over time (rooms usable alone by design; no monitoring channel exists to create centrality). No framework imposition — room names are the member's platform vocabulary, not interpretive language.

---

## Stop condition

This document is the deliverable. Nothing has been implemented. Awaiting Kelly's review of: the current-state map (§A–B), the relationship breaks (§C), and the smallest coherent solution (§D, sequenced in §F).
