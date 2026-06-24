# Living Orientation Engine — Architecture Paper

**Date:** 2026-06-24
**Branch:** feature/rapport-pilot-v1
**Status:** Cat 1 — Preserved direction. Research complete. Awaiting authorization to begin prototype.
**Produced by:** Architecture research agent (read-only pass)
**Companion docs:**
- `docs/architecture/LIVING_ORIENTATION_ENGINE_DESIGN_DIRECTIVE_2026-06-24.md` — the design directive this paper responds to
- `docs/architecture/LIVING_FIELD_REPRESENTATION_TRACE.md` — data inventory (already complete)
- `docs/architecture/REPRESENTATION_ENGINE_2026-06-24.md` — representation layer design

---

## 1. Executive Summary

**What exists:**

The MAIA platform has a functioning conversation engine (`/api/sovereign/app/maia/list`), a left-rail spatial navigation system (six worlds: MAIA, Journal, Ideas, Relationships, Wisdom, Anchor), a right-panel host (`MaiaRightPanelHost`) with five live panel components (Patterns, Journal, Wisdom, Ideas, Relationships), and 127 live `member_memory_atoms` rows as the richest constitutionally-clean data substrate. The `ConversationInsightPanel` component exists but is wired to mock data only (Phase 6 — structure proved, no real data flowing). The `ChangesSheet` and `DecisionsSheet` are live modal-sheets accessible from the MAIA page. The `practiceRecommendation` field already exists on the oracle response schema (confidence-gated), establishing a precedent for the oracle offering contextual, non-mandatory offers alongside conversation text. The Studio Field page (`app/studio/field/page.tsx`) already implements the `stillAlive` pattern — pulling live questions from changes, decisions, and thresholds — though it is practitioner-facing, not member-facing.

**What is missing:**

The Orientation Engine itself — the layer that translates what the member expressed into what movement is possible next — does not exist. No `representations: RepresentationOption[]` field on oracle responses. No `InvitationCard` component. No Living Pathways flow. No mechanism to generate context-sensitive movement offers from conversation. The right-panel worlds are reachable only through the left-rail (member must know to navigate there); the panel content is world-scoped rather than conversation-contextual.

**Recommended first prototype:**

**Living Pathways** — after a member's expression, MAIA offers 2–4 next possible movements in-conversation (not a menu; part of the response). The offer is contextual, not hardcoded. It reuses existing data infrastructure. It requires: (a) adding `representations: RepresentationOption[]` as an optional field to the oracle response schema, (b) updating the MAIA system prompt to recognize representation opportunities and populate the field when confident, (c) building an `InvitationCard` component that renders the offer inline in conversation, and (d) connecting the first panel — Still Alive atoms — because it is the only panel with live member data, a working API endpoint, and constitutional cleanliness. The calendar substrate is too thin and OAuth-gated for most members; relationship entries are partially inferred (pattern_hint, maia_reflection) and require consent gates before surfacing; everything else requires new schema or data collection.

**The smallest valid proof:** A member says something. MAIA's response includes an optional offer: "Would it help to see what has remained alive?" If the member accepts, the existing `/api/psyche/portfolio/atoms?view=still_alive` endpoint feeds the existing `KeepCapturePage` logic in a panel form. No new schema. No new auth. One new oracle response field. One new component.

---

## 2. Entry Points Inventory

| Path | File | Purpose | Status | Embeddable as panel? |
|------|------|---------|--------|----------------------|
| `/maia` | `app/maia/page.tsx` | Main conversation center. MaiaShell + OracleConversation + left-rail worlds + right-panel host. | **Live** | No — this is the shell |
| `/maia/ideas` | `app/maia/ideas/page.tsx` | Ideas list page | **Live** | IdeasPanel already exists in right-panel host |
| `/maia/ideas/[id]` | `app/maia/ideas/[id]/page.tsx` | Single-idea workspace | **Live** | Yes — could embed as idea-detail panel |
| `/maia/keep-capture` | `app/maia/keep-capture/page.tsx` | Keep/Capture portfolio (member_memory_atoms). 127 live rows. `?view=still_alive` filter available. | **Live** | Yes — **highest readiness panel candidate** |
| `/maia/anchor` | `app/maia/anchor/page.tsx` | Quiet return space | **Live** | Potentially (requires inspection) |
| `/maia/anchor/history` | `app/maia/anchor/history/page.tsx` | Anchor history | **Live** | Potentially |
| `/maia/calendar` | `app/maia/calendar/page.tsx` | Calendar page (practitioner-facing; aggregates booking + Google Calendar) | **Live, but wrong audience** | No — member calendar substrate too thin (12 booking rows, 1 event row); most members haven't connected OAuth |
| `/maia/field-lab` | `app/maia/field-lab/page.tsx` | Experimental ecology shelf. Not a features pipeline. Hosts `EXPERIMENTS` array. | **Live, experimental** | No — ecological container, not embeddable |
| `/maia/field-lab/relational-navigation` | `app/maia/field-lab/relational-navigation/page.tsx` | Relational Navigation Room (Prepare + Integrate flows). Observation phase. No persistence. | **Live, experimental** | No — standalone flow |
| `/maia/field-dashboard` | `app/maia/field-dashboard/page.tsx` | Field dashboard | **Exists** (requires inspection) | Unknown |
| `/maia/compact` | `app/maia/compact/page.tsx` | Compact MAIA view | **Exists** | Potentially |
| `/relationships` | `app/relationships/page.tsx` | Relationships list page | **Live** | RelationshipsPanel in right-panel host |
| `/relationships/[id]` | `app/relationships/[id]/page.tsx` | Single relationship page | **Live** | Yes |
| `/journey` | `app/journey/page.tsx` | Archetypal Journey — birth chart, soul blueprint, planetary archetypes, elemental balance. Requires birth data. Very large page. | **Live** | No — requires birth data, standalone visualization |
| `/studio/field` | `app/studio/field/page.tsx` | Studio Field (practitioner): stillAlive questions from changes/decisions/thresholds. **Only existing stillAlive implementation.** | **Live, practitioner-only** | Not directly — but pattern is reusable |
| `/studio` (full) | `app/studio/` | Practitioner workspace: calendar, clients, decisions, changes, comms, booking, agents, code, groups, ventures. | **Live, practitioner-only** | Panels exist as separate pages |
| `app/lab/page.tsx` | — | **Does not exist** | MISSING | — |
| `app/session-room/` | — | **Does not exist** | MISSING | — |
| `app/blueprint/` | — | **Does not exist** | MISSING | — |
| `app/portrait/` | — | **Does not exist** | MISSING | — |
| `app/practices/` | — | **Does not exist** | MISSING | — |
| `app/calendar/` | — | **Does not exist** | MISSING | — |

**Key finding:** The "lab" concept lives at `/maia/field-lab`, not `/lab`. There is no standalone lab page. Portrait, Blueprint, Session Room, and Practices do not exist as member-facing top-level pages (practices have extensive API routes under `/api/practice/` and `/api/practitioner/practices/` but no `/practices/` member page).

---

## 3. Routing Logic Audit

### Where routing decisions live

**`middleware.ts` (primary gating):**
- Subdomain routing: `jondi.soullab.life` → `/fields/jondi` (master fields pattern)
- Field/Studio boundary: `X-App-Shell: field` requests are blocked from `/api/studio/*` (except an allowlist, currently empty)
- Auth gate: unauthenticated page requests redirect to `/signin?next=...`; unauthenticated API requests return 401
- Capacitor bypass: iOS WebView requests skip auth redirect, let client-side check take over
- Dev bypass: in development, `/api/stellium` and `/api/notifications` skip auth
- Tier gating: code exists but bypassed during development (`// TODO: Re-enable tier gating`)
- Missing-role returns 403; unmapped routes return 404 in strict mode

**`lib/navigation/maiaNav.ts` (canonical navigation config):**
- Single source of truth for left-rail worlds and boundary transitions
- `MAIA_WORLDS`: maia, journal, ideas, relationships, wisdom, anchor
- `STUDIO_RAIL_ITEM`, `BOOK_STUDIO_RAIL_ITEM`, `CIRCLES_RAIL_ITEM`: founder-only boundaries
- `getVisibleBoundaries(isFounder)` controls what boundary transitions appear
- `getBoundaryFromPathname(pathname)` derives active boundary from URL

**`lib/navigation/types.ts` (type system):**
- `MaiaWorldId`: maia | patterns | journal | ideas | relationships | wisdom | anchor
- `NavItemClass`: world | utility | contextual | behavior | modal | studio | admin
- `MaiaContextualPanelId`: session-tools (and implicit panel-per-world in MaiaRightPanelHost)
- Note: `patterns` appears in `MaiaWorldId` but is not in `MAIA_WORLDS` array — the Patterns panel exists in `MaiaRightPanelHost` but no `patterns` world route exists. Appears dormant at the routing level.

**`MaiaRightPanelHost` (right-panel dispatch):**
- Panel selection is currently world-scoped: switch(activeWorld) → one panel per world
- No conversation-context-driven panel selection exists
- `ConversationInsightPanel` is shown at the top of every panel (with mock data in Phase 6)
- Opening the right panel is triggered by left-rail world navigation, not by conversation content

**`MaiaShell` (orchestrator):**
- Manages: activeWorld, rightPanelOpen, userPinnedPanel, calmMode
- All panel and world state is local to the shell; no API-driven orientation logic

### Duplications and gaps

| Issue | Location | Risk |
|-------|----------|------|
| `patterns` world in types but no route or rail item | `types.ts` vs `maiaNav.ts` | Low — Patterns panel renders in right-rail without a world route; cosmetic inconsistency |
| Calendar at two paths: `/maia/calendar` (member-facing shell) + `/studio/calendar` (practitioner) | `app/maia/calendar/` + `app/studio/calendar/` | Medium — same API? Same audience? The member calendar page exists but is practitioner-oriented |
| Tier gating disabled | `middleware.ts` | Low for now; blocks future tier differentiation |
| Panel selection is world-scoped, not context-driven | `MaiaRightPanelHost` | High — **this is the gap the Orientation Engine must fill** |
| `ConversationInsightPanel` exists (structure) but wired to mock data | `components/maia/panels/ConversationInsightPanel.tsx` | Medium — this is the natural home for capability-offer insights |
| No `representations` field on oracle response schema | `lib/sovereign/maiaService.ts` | High — **this is the primary missing wiring** |

---

## 4. Representations Inventory

| Representation | Component(s) | Data substrate | Status | Constitutionally safe to surface? | Reusable as panel? |
|----------------|-------------|----------------|--------|-----------------------------------|--------------------|
| Conversation | `OracleConversation.tsx` | Oracle (live) | **Live — primary** | Yes | No — it is the center |
| Still Alive / Memory atoms | `app/maia/keep-capture/page.tsx` | `member_memory_atoms` (127 rows live); API: `/api/psyche/portfolio/atoms?view=still_alive` | **Live — data ready, page exists, no panel yet** | Yes — member-authored only | **Yes — highest priority panel** |
| Ideas | `IdeasPanel` + `app/maia/ideas/` | `member_ideas` (via `/api/ideas`) | **Live — panel exists** | Yes | Yes — already in MaiaRightPanelHost |
| Relationships / Relational map | `RelationshipsPanel` + `app/relationships/` | `member_relationships` (29 rows), `relationship_entries` (959 rows) | **Live — panel exists; data rich** | Partially — member-authored fields (name, note, free_text, felt_signals) safe; `maia_reflection` and `pattern_hint` are inferred (require `inference earns ASK` gate) | Yes — panel exists, but inferred fields need gate |
| Journal | `JournalPanel` | Journal entries (via `/api/journal` or similar) | **Panel exists, data assumed live** | Yes (member-authored) | Yes |
| Patterns | `PatternsPanel` | Patterns data (unclear; panel exists, data source not confirmed live) | **Panel exists; data liveness unknown** | Requires investigation | Yes |
| Wisdom | `WisdomPanel` | Wisdom keepers / sacred texts | **Panel exists** | Yes | Yes |
| ConversationInsight | `ConversationInsightPanel` | Mock data (Phase 6 — structure only) | **Structure proven, NOT wired** | Would be yes when wired | Yes — natural home for capability-offer |
| Calendar | `app/maia/calendar/page.tsx`; `CalendarProposalCard` in components/maia | `booking_requests` (12 rows), `events` (1 row); Google Calendar (OAuth-gated) | **Page exists, data too thin, OAuth not connected for most members** | Partially — booking data safe; Google Calendar requires OAuth consent | Not yet — data substrate insufficient |
| Timeline / Session history | No dedicated component | `maia_sessions` (829 rows), `member_sessions` (515 rows) | **Data exists; no UI surfaces it as a member-facing timeline** | Session count and dates safe; summaries require summarization consent | Not yet — needs dedicated component |
| Changes / I Ching | `ChangesSheet` + change journey components in `components/maia/changes/` | `changes` table (via `/api/changes/`) | **Live — modal sheet accessible from MAIA page** | Yes | Potentially — currently a modal sheet, could become a panel |
| Decisions | `DecisionsSheet` + `components/maia/decisions/` | `decisions` table (via `/api/studio/decisions/` and `/api/fields/[slug]/decisions/`) | **Live — modal sheet accessible from MAIA page** | Yes | Potentially — same as Changes |
| Practices | API routes extensive (`/api/practice/worlds/suggest`, etc.); `practiceRecommendation` on oracle response | `practice_sessions`, `practice_worlds` (liveness unconfirmed) | **API exists; `practiceRecommendation` on oracle schema is confidence-gated but may not fire consistently** | Yes | Possible — precedent exists in oracle schema |
| Soul Portrait / Blueprint | No member-facing page exists (`/portrait/` MISSING); Soul Portrait generated for specific members | Birth data required; astrology calculation pipeline | **Practitioner-generated; no self-serve member page** | Yes (member's own) | Not yet — requires birth data consent gate |
| Journey / Archetypal chart | `app/journey/page.tsx` | Birth data (member-entered) | **Live — very large standalone page** | Yes | No — too heavy; standalone only |
| Projects / Tasks | Not found as member-facing | Studio practitioner infrastructure | **Practitioner-only** | N/A for members | No |
| Documents | Not found as member-facing | Not found | **Not built for members** | N/A | No |
| Field Lab experiments | `app/maia/field-lab/page.tsx`; `EXPERIMENTS` array | Experimental, observation-phase | **Live, experimental** | Yes | No — ecological container |

---

## 5. Living Pathways Analysis

### Can pathways be generated from metadata?

The design directive states: "These are **next possible movements**, generated from context. Not hardcoded. They should emerge from metadata, not from a scripted list."

**What metadata currently exists that could drive this:**

| Signal | Source | Confidence for pathway generation | Available without new infrastructure? |
|--------|--------|-----------------------------------|---------------------------------------|
| Conversation content / theme | Oracle context | High — the oracle already has full conversation | Yes — inference happens at oracle |
| Memory atoms: still_alive | `member_memory_atoms.status = 'still_alive'`, `still_here_count` | High — if atoms exist with status still_alive, "see what's remained alive" is relevant | Yes |
| Memory atoms: is_breakthrough | `member_memory_atoms.is_breakthrough` | High — breakthrough atoms are the highest-salience offer | Yes — column exists, UI gesture not yet wired |
| Session count / recency | `member_sessions.created_at` | Medium — returning member vs. first-time changes the offer set | Yes |
| Active ideas | `member_ideas` via `/api/ideas` | Medium — if member has active ideas, "organize this into an idea" is relevant | Yes |
| Relationships: recent entries | `relationship_entries.created_at` | Medium — if member mentions a person name, "see this relationship over time" is relevant | Requires name-matching heuristic |
| Spiral state / element | `member_spiral_state` | Medium — could shape _which_ pathway, not _whether_ to offer | Yes |
| Elemental lens | `member_memory_atoms.elemental_lenses[]` | Low for initial prototype — secondary enrichment | Yes |
| Practice recommendation | `practiceRecommendation` in oracle response (existing) | Medium — already confidence-gated | Yes — already on schema |

**Assessment:**

Living Pathways can be generated from oracle-side context inference. The oracle already reads: conversation history, memory atoms (via `formatAtomsForPrompt`), spiral state, relational signals. Adding `representations: RepresentationOption[]` to the response schema gives MAIA the channel to express what it has recognized.

The oracle does **not** need client-side heuristics or a second inference pass. Option A (oracle-side, from `REPRESENTATION_ENGINE_2026-06-24.md`) is the correct architecture.

**What metadata is missing for richer pathways:**

- `trajectory_focus` table: 0 rows. If a member had declared focus domains, "look at your focus" would be a natural offer. Requires member-facing trajectory UI (not yet built).
- Practice engagement state: which practices are active? The API exists (`/api/practice/worlds/list`) but production engagement data is unconfirmed.
- Thread membership: `member_memory_atoms.thread_ids[]` is an array but threads table doesn't exist yet; thread-based pathway offers are premature.

---

## 6. Representation Engine Interface Evaluation

### Does the proposed interface simplify things?

```typescript
interface RepresentationOption {
  id: string;
  title: string;          // "See what's remained alive"
  reason: string;         // "You mentioned returning to this several times."
  evidence: string[];     // grounds the offer in conversation content
  component: React.Component;  // the panel that renders it
  requiredData: string[]; // what data keys the panel needs
  confidence: number;     // 0–1, gates whether to offer at all
}
```

**Yes, with one precision:** the `component` field cannot be serialized in a JSON oracle response. The practical implementation must use a `componentId: string` (e.g., `"still-alive-panel"`, `"ideas-panel"`) that the client resolves to the actual React component from a registry.

### Does existing code already approximate this?

**Three partial approximations found:**

1. **`practiceRecommendation`** (closest existing precedent): `lib/maia/state-vector.ts` defines `PracticeRecommendation`; `lib/sovereign/maiaService.ts` line 513 adds it as an optional field on oracle response, confidence-gated (line 2820: "Route practice recommendation (confidence-gated)"). This is exactly the pattern — oracle produces an optional, confidence-gated contextual offer alongside response text. The Representation Engine generalizes this to any representation type.

2. **`ConversationInsightPanel`** (structure waiting for signal): Types `ConversationInsight['type']` include `'capability-offer'`, `'pattern-match'`, `'prior-thread'`, `'sacred-resonance'`, `'theme-emergence'`. The panel renders these distinctions. It is Phase 6 (structure only, mock data). When real `ConversationInsight` objects flow from oracle response processing, this panel becomes the delivery surface for Orientation Engine signals. The capability-offer type is exactly a Living Pathway.

3. **`MaiaRightPanelHost` world-panel dispatch**: A world switch-case already maps world IDs to panel components. The Representation Engine extends this by making the dispatch data-driven rather than world-scoped.

**What does not yet exist:**
- `RepresentationOption[]` on oracle response type
- `InvitationCard` component (renders the offer inside conversation)
- A component registry (`REPRESENTATION_PANELS: Record<string, React.Component>`)
- Oracle prompt instructions to generate representation offers

---

## 7. Adaptive Orientation

### Could MAIA answer "What might help next?" using evidence?

**Yes. The architecture supports it.** Here is what already exists vs. what is needed:

**Existing oracle context reading (live, per `maia/list` route):**
- Memory atoms: `loadMemberMemoryAtomsForPrompt` → `formatAtomsForPrompt` — atoms surface in prompt (FAST + CORE tiers)
- Relational signals: `detectRelationalSignal` + `persistDetectedSignal` — relationship awareness wired
- Spiral state: spiral orientation (Cut 2) — developmental position known
- Conversational block: `[MAIA] conversational-block` — prior session content surfaces (FAST + CORE)
- Memory bundle: `MemoryBundleService` + `MemoryWritebackService` — cross-session context
- Memory health: `buildMemoryHealth` — structural substrate status available
- Practice recommendation: `routePractice` + `PracticeRecommendation` — already producing orientation offers

**What the oracle does NOT yet do:**
- Produce `representations: RepresentationOption[]` alongside response text
- Recognize "I should offer to show this person their still-alive atoms right now" and surface that as a structured field rather than embedding it in conversational text

**What `member_memory_atoms.status` field enables:**
- `status = 'still_alive'`: highest-salience return signal. If a member has atoms with this status, the Orientation Engine should surface them.
- `status = 'active'`: present, available for contextual doorway return
- `status = 'set_aside'`: parked — do not surface proactively
- `status = 'protected'`: voice-ineligible — do not surface at all
- `still_here_count`: integer count of "still alive" confirmations from member. Higher = stronger signal
- `is_breakthrough`: member-marked elevation — highest priority when surfacing

**Approach that would work:**

The oracle response already includes memory context in the prompt. Adding a system instruction of the form: _"If the conversation suggests the member would benefit from seeing a visual representation of their living material, include a `representations` array in your response. Only include options you are confident about (confidence > 0.7). Always include 'Continue in conversation' as an option. Never include representations the member's data does not support."_ — this is a prompt addition, not an architectural addition. The infrastructure is ready. The channel needs to be opened.

---

## 8. Dependency Map

### Fully built (Cat 6 — live runtime)

- `member_memory_atoms` table + migrations + API (`/api/psyche/portfolio/atoms`)
- `KeepCapturePage` (`/maia/keep-capture`) — member-facing surface
- `member_relationships` + `relationship_entries` — data rich, member-authored fields safe
- `maia_sessions` + `member_sessions` — session history exists
- `MaiaRightPanelHost` — panel container architecture exists
- `IdeasPanel`, `RelationshipsPanel`, `JournalPanel`, `WisdomPanel`, `PatternsPanel` — five panels exist
- `ChangesSheet` + API routes under `/api/changes/` — live modal sheet
- `DecisionsSheet` + API routes under `/api/studio/decisions/` — live modal sheet
- `lib/navigation/maiaNav.ts` — canonical navigation config
- `practiceRecommendation` on oracle response — precedent for optional contextual offers
- `ConversationInsightPanel` — structure proven (mock data only)
- Left-rail world navigation (MAIA, Journal, Ideas, Relationships, Wisdom, Anchor)
- Field Lab (`/maia/field-lab`) + Relational Navigation Room (`/maia/field-lab/relational-navigation`)
- Studio Field `stillAlive` pattern (practitioner-side; pattern reusable)

### Partially built (structure exists, not wired for Orientation Engine purpose)

| Item | What exists | What's missing |
|------|-------------|----------------|
| `ConversationInsightPanel` | Component, types, all insight categories including `capability-offer` | Real data source; oracle → insight signal pipeline |
| `practiceRecommendation` | Schema field, confidence-gated routing | Consistent firing in production; member-facing render surface |
| `maia/calendar` page | Page exists | Member data too thin; OAuth unconnected for most members |
| `MaiaRightPanelHost` | Panel-per-world dispatch | Conversation-contextual dispatch; Representation Engine driving it |
| `member_memory_atoms.is_breakthrough` | Column exists, API endpoint exists (`POST /api/sovereign/atoms/[id]/breakthrough`) | Member UI gesture to mark breakthrough (no UI button exists) |
| `member_memory_atoms.thread_ids[]` | Column exists | Threads table does not exist; thread-based pathways premature |
| `trajectory_focus` | Table exists (0 rows) | Member-facing trajectory UI; any member input |

### Duplicated / should be merged

| Duplication | Location | Recommendation |
|-------------|----------|----------------|
| Changes routes: `/api/changes/` + `/api/studio/changes/` | Member-facing vs practitioner-facing | Audit which the ChangesSheet uses; confirm member-facing route is the live one |
| Decisions routes: `/api/studio/decisions/` + `/api/fields/[slug]/decisions/` + `/api/team/decisions/` | Three contexts | For member-facing orientation, only `/api/studio/decisions/` is relevant; studio routes may be practitioner-scoped |
| Calendar: `/maia/calendar/` + `/studio/calendar/` | Member shell vs practitioner shell | Different audiences; not a true duplication, but member calendar is premature |
| `patterns` in MaiaWorldId type vs. absence from MAIA_WORLDS array | `types.ts` vs `maiaNav.ts` | Clean up types.ts or add patterns to nav; currently inconsistent |

### Independent (can build without Orientation Engine)

- Soul Portrait generation pipeline (requires birth data)
- Practices system (API exists; member-facing page is missing)
- Session Room (does not exist; needs design before building)
- Blueprint page (does not exist)
- Episodic memory (Phase 2 spec in progress on separate branch)

### Blocked (must not build until design/data ready)

- Calendar representation: blocked on OAuth connection rate and member data volume
- Inferred relationship representations (`maia_reflection`, `pattern_hint`): blocked on consent gate and `inference earns ASK` governance
- Thread-based pathways: blocked on threads table
- Trajectory-based pathways: blocked on `trajectory_focus` member input
- Field / Coherence layer: blocked per existing freeze doctrine

---

## 9. Recommended First Prototype

**Living Pathways — Still Alive as first panel plugin**

This is the smallest proof that validates the full architecture without requiring new data, new auth, or new schema (beyond one oracle response field).

### What to build

**Step 1 — Oracle response schema:** Add `representations?: RepresentationOption[]` to the oracle response type in `lib/sovereign/maiaService.ts`. Mirror the interface defined in `REPRESENTATION_ENGINE_2026-06-24.md`, using `componentId: string` instead of `component: React.Component`.

```typescript
interface RepresentationOption {
  id: string;
  title: string;
  reason: string;
  evidence: string[];
  componentId: string;   // not a React component — client resolves from registry
  requiredData: string[];
  confidence: number;    // 0-1; only surface if >= 0.7
}
```

**Step 2 — Oracle prompt instruction:** Add a section to the MAIA system prompt (within `buildMaiaWisePrompt` or the FAST/CORE equivalent in `maiaService.ts`) instructing MAIA to produce the representations field when confident. Copy the governance constraints from `REPRESENTATION_ENGINE_2026-06-24.md` §Governance. Key constraint: MAIA only offers; member chooses; no representation surfaces without explicit acceptance.

**Step 3 — InvitationCard component:** A new component (`components/maia/InvitationCard.tsx`) that renders when `representations` is present in the oracle response. Renders: "There are a few ways people often continue from here." + 2–4 movement options. Each option is a quiet card with title + reason. The member can ignore all of them.

**Step 4 — Still Alive panel plugin:** Extract the core of `KeepCapturePage` into a panel-compatible form (`components/maia/panels/StillAlivePanel.tsx`). It calls `/api/psyche/portfolio/atoms?view=still_alive`, renders atoms. Panel opens in MaiaRightPanelHost when member chooses "See what's remained alive."

**Step 5 — Panel registry:** Add a `REPRESENTATION_PANELS` registry mapping `componentId` strings to panel components. MaiaRightPanelHost dispatches from this registry when an InvitationCard choice opens a panel.

### Success criterion

A returning member expresses something. MAIA's response includes an InvitationCard with "See what's remained alive" (if atoms with `status = 'still_alive'` exist for this member). Member accepts. The still-alive atoms appear in the right panel alongside the conversation, which narrows. Member can dismiss the panel and return to full conversation. This must work without the member having to know about `keep-capture`, `atoms`, or any system concept.

### Constitutional check before authorizing

- Does this leave undisturbed the interior space that belongs to the person? Yes — MAIA offers, member chooses, offer can be ignored.
- Does the feature justify its presence, not merely its usefulness? Yes — it surfaces what the member already placed.
- Does this deepen attention rather than compete with it? Yes — atoms are member-authored; this is not a dashboard, it is recognition of what the member held.
- Inference earns ASK, declaration earns REFLECT: the offer is grounded in member-authored material (`status = 'still_alive'` is a member-placed signal), not system inference. Constitutional.
- No inferred data surfaces: `maia_reflection` and `pattern_hint` do not appear in StillAlivePanel. Only `title`, `body`, `status`, `still_here_count`.

---

## 10. Do Not Build Yet

These capabilities were considered during research. They require design, data, or consent infrastructure that does not yet exist. Building them now would either (a) create a misleading experience due to insufficient data, (b) violate the inference-earns-ASK governance law, or (c) create a feature whose experience depends on infrastructure that is not live.

| Capability | Reason not to build yet |
|------------|------------------------|
| Calendar representation panel | Member calendar data is too thin (12 booking rows, 1 event; OAuth unconnected for most members). Build when member calendar data is live and OAuth connection rate is measured. |
| Timeline / Session history view | Session data is live (829 rows) but no design exists for how to surface session history to members in a way that is felt as continuity rather than surveillance. Design first. |
| Inferred relationship representations | `maia_reflection` and `pattern_hint` in `relationship_entries` are MAIA-inferred, not member-authored. Surfacing them requires the `inference earns ASK` gate. Build the gate first; build the panel after. |
| Trajectory-based pathways | `trajectory_focus` has 0 rows. No member-facing input surface exists. Pathways based on declared focus domains cannot be generated. Build member-facing trajectory input first. |
| Thread-based pathways | `member_memory_atoms.thread_ids[]` exists but the threads table does not. Thread coherence cannot be computed. |
| Practices panel | Practices API is extensive but member engagement data liveness is unconfirmed; the member-facing page does not exist. Confirm liveness, build the page, then add as panel. |
| Soul Portrait panel | Requires birth data consent gate (already designed: `BIRTH_DATA_CONSENT_GATE_2026-06-20.md`), practitioner-to-member handoff, and the generator spec implementation. Soul Portrait is a separate product track. |
| Journey / Archetypal chart embedded panel | The Journey page is too heavy (~1800+ lines, multiple async data loads) to embed as a panel. It is a standalone destination. A lightweight summary card could be considered after birth data flows. |
| Field / Coherence layer orientation | Coherence field is frozen per existing doctrine. Wire-up conditions in `COHERENCE_FIELD_WIRE_UP_SPEC_2026-05-24.md` §0.C are not met. |
| Breakthrough member gesture (UI button) | The `is_breakthrough` column and POST route exist. The member UI gesture (a button on an atom card) is the missing piece. This is a small build but belongs in the keep-capture track, not the Orientation Engine track. |
| Pattern Attunement representations | Must emerge downstream of episodic memory + tact calibration. Currently held. |
| Somatic / Morphic representations | Both held per memory service status matrix. No live data substrate. |

---

## Appendix: Docs and Files Cited

**Architecture docs:**
- `docs/architecture/LIVING_ORIENTATION_ENGINE_DESIGN_DIRECTIVE_2026-06-24.md`
- `docs/architecture/LIVING_FIELD_REPRESENTATION_TRACE.md`
- `docs/architecture/REPRESENTATION_ENGINE_2026-06-24.md`
- `docs/architecture/MAIA_ROUTE_AUTHORITY_MAP.md`
- `docs/architecture/ORIENTATION_CONTINUITY_MEANING_2026-06-12.md`
- `docs/architecture/VISIBLE_DOORS_2026-06-12.md`
- `docs/architecture/MANY_FRONT_DOORS.md`
- `docs/architecture/WHAT_MAIA_IS_FIELD_FIRST_ARCHITECTURE.md`

**Key source files examined:**
- `app/maia/page.tsx` — main conversation shell
- `app/maia/keep-capture/page.tsx` — live keep-capture portfolio
- `app/maia/field-lab/page.tsx` + `app/maia/field-lab/relational-navigation/page.tsx`
- `app/maia/ideas/page.tsx` + `app/maia/ideas/[id]/page.tsx`
- `app/journey/page.tsx` — soul blueprint
- `app/studio/field/page.tsx` — existing stillAlive pattern (practitioner)
- `app/relationships/page.tsx` + `app/relationships/[id]/page.tsx`
- `components/maia/MaiaShell.tsx` + `MaiaRightPanelHost.tsx` + `MaiaLeftRail.tsx`
- `components/maia/panels/` (all six panels)
- `components/maia/relational-navigation/Flows.tsx`
- `lib/navigation/maiaNav.ts` + `lib/navigation/types.ts`
- `lib/sovereign/maiaService.ts` (response schema)
- `database/migrations/20260521000001_member_memory_atoms.sql`
- `database/migrations/20260524000002_member_memory_atoms_breakthrough.sql`
- `middleware.ts`
