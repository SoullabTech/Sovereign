# Living Field Representation Trace

**Date:** 2026-06-24  
**Branch:** feature/rapport-pilot-v1  
**Purpose:** Architecture trace for moving MAIA toward a Living Field / semantic workspace model where conversation is one of many representations of the same member continuity.  
**Scope:** Read-only. No code changes. No commits.

---

## Executive Summary

**What exists and is ready:**
- `member_memory_atoms` is live with 127 Kelly rows, source types spanning `idea`, `idea_block`, `journal`, `dream`, `reflection`, `decision`, `change`, `session_excerpt`, `spontaneous`. The portfolio API (`/api/psyche/portfolio/atoms`) supports `?view=still_alive` filtering. The `KeepCapturePage` (`/app/maia/keep-capture/page.tsx`) is the existing member-facing surface. This is the highest-readiness representation candidate.
- `member_relationships` (29 rows) + `relationship_entries` (959 rows) with `kind` values: checkin, note, reflection, threshold, rupture, repair. Rich, member-authored, constitutionally safe. The Relationship Map representation is the second-most ready data substrate.
- `maia_sessions` (829 rows) + `member_sessions` (515 rows) — session history exists. No UI surfaces it as a "timeline" to the member.
- `app/studio/field/page.tsx` — the Studio Field page already implements a `stillAlive` concept: it pulls change/decision/threshold questions that remain alive from the practitioner Studio (not the member-facing MAIA space). This is the closest existing prototype of the representation-shift pattern.
- `app/maia/calendar/page.tsx` — a `/maia/calendar` page exists. The calendar API (`/api/studio/calendar/events`) aggregates MAIA bookings + Google Calendar + studio events. But this is currently a practitioner-facing surface, not a member-facing one. The member calendar substrate (`booking_requests`: 12 rows, `events`: 1 row) is very sparse.

**What is missing entirely:**
- No dedicated `calendar_events` table for member-owned events. Calendar data lives in practitioner booking tables (`booking_requests`, `events`) and relies on Google/CalDAV OAuth integration — not available for members without OAuth connection.
- No `tasks` or `projects` table. `focus_tasks` exists (0 rows) but uses `user_id: text` (not `member_id: uuid`) — suggests it was built for a different auth model.
- No `dreams` table. Dreams live as atoms with `source_type='dream'` — none in production yet.
- No `decisions` table as a member-facing entity. `field_decisions` (3 rows) is practitioner Studio. `member_memory_atoms` with `source_type='decision'` would be the member path (also currently zero rows of that type).
- `trajectory_focus` (0 rows) — exists as schema, never populated.
- `member_spiral_state` (9 rows) — exists and live, but no member-facing view surfaces it.
- `iching_hexagrams` (0 rows) — the I Ching / Changes UI exists in Studio (`components/studio/changes/`) but the member-facing atom type `change` is zero rows.

**Recommended first prototype: Option B — Still Alive / Memory expansion.**

Calendar data is too thin and relies on OAuth that most members haven't connected. The Still Alive atom substrate is already live, has 127 rows, has a `?view=still_alive` API filter, has a member-facing page (`/maia/keep-capture`), has a `still_here_count` column for signal strength, and has `is_breakthrough` for elevation. Building the representation-shift offer inside the MAIA conversation ("Would it help to see what has remained alive?") requires only: a detection trigger in conversation, a panel open gesture, and reuse of the existing `/api/psyche/portfolio/atoms?view=still_alive` endpoint. No new schema. No new auth. All data is member-authored.

---

## Section 1 — Data Inventory

### Table Status Key
- **Live** — table exists, rows present, code reads/writes it in production path
- **Dormant** — table exists, rows zero or near-zero, code written but not exercised
- **Orphaned** — schema exists, no active code references it
- **Missing** — no table, no schema

| Category | Table(s) | Row Count | Key Columns | Liveness | Data Author | Safe to Surface? |
|---|---|---|---|---|---|---|
| Memory atoms | `member_memory_atoms` | 127 | id, member_id, source_type, title, body, registers[], elemental_lenses[], status (active/still_alive/set_aside/protected/archived), is_breakthrough, still_here_count, return_preference | **Live** | Member-authored (idea, journal, dream) + system-extracted (session_excerpt, spontaneous) | Yes — member-authored atoms safe; system-extracted require provenance label |
| Sessions / conversations | `maia_sessions` | 829 | id, member_id, mode (continuity/sanctuary), status, themes[], summary, conversation_history, turn_count, started_at, ended_at | **Live** | System-generated | No — conversation content is Sanctuary-boundary-adjacent. Session metadata (dates, themes) may surface with consent |
| Sessions (member-bound) | `member_sessions` | 515 | id, member_id, mode, message_count, summary, session_id | **Live** | System-generated | Session count / date safe; summary only if member has consented to summarization |
| Relationships | `member_relationships` | 29 | id, member_id, name, realm (outer/inner/transpersonal), bond_type, note | **Live** | Member-authored | Yes — member named these people |
| Relationship entries | `relationship_entries` | 959 | id, relationship_id, member_id, kind (checkin/note/reflection/threshold/rupture/repair), felt_signals[], free_text, maia_reflection, pattern_hint | **Live** | Member-authored (free_text, felt_signals) + MAIA-inferred (maia_reflection, pattern_hint) | Member-authored fields safe; maia_reflection/pattern_hint must not be surfaced as fact — inference only |
| Trajectory / spiral | `member_spiral_state` | 9 | member_id, dominant_element, phase, motion, intensity, relational_phase, autonomy_streak, return_count | **Live** (writes) | System-inferred | No — inferred, not member-declared. Cannot silently show. Requires member-confirmation before surfacing per `inference earns ASK` law |
| Trajectory focus | `trajectory_focus` | 0 | id, member_id, domain, intention, element_tone | **Dormant** (schema only) | Would be member-authored | N/A — no data |
| Tasks / projects | `focus_tasks` | 0 | id, user_id (text), capture_text, task_type (task/event/thought), scheduled_for, status | **Dormant** | Member-authored | N/A — no data; also uses string user_id not member_id uuid |
| Journal (quick) | `quick_journal_entries` | 5 | (schema confirmed present) | **Dormant** | Member-authored | Yes — member-authored once wired |
| Journal (elemental) | `elemental_journal_entries` | 1 | (schema confirmed present) | **Dormant** | Member-authored | Yes — member-authored once wired |
| Ideas | `member_ideas` | 29 | (schema confirmed present) | **Live** | Member-authored | Yes |
| Field ideas | `field_ideas` | 1 | (schema confirmed present) | **Dormant** | Member-authored | Yes |
| Calendar (member) | No dedicated member calendar table | — | — | **Missing** | — | — |
| Calendar (practitioner events) | `events` | 1 | practitioner_id, title, start_date, end_date, status, visibility | **Dormant** | Practitioner-authored | No — practitioner surface, not member |
| Calendar (bookings) | `booking_requests` | 12 | — | **Dormant** | Member-initiated | Only booking metadata safe, not content |
| Decisions (member) | atoms with `source_type='decision'` | 0 | (via member_memory_atoms) | **Missing** as distinct rows | Would be member-authored | N/A |
| Decisions (Studio) | `field_decisions` | 3 | — | **Dormant** | Practitioner-facing | No — wrong surface |
| I Ching / Changes | `iching_hexagrams` | 0 | — | **Dormant** | Member-initiated | N/A |
| Dreams | atoms with `source_type='dream'` | 0 | (via member_memory_atoms) | **Missing** as live rows | Would be member-authored | Yes once present |
| Episodic memories | `episodic_memories` | 66 | user_id (text), episode_id, experience_title, significance, marked_by_member, verbatim_text, source_turn_id | **Live** | System-extracted from conversation + member-marked | System-extracted only if marked_by_member=true; verbatim_text required for marked rows |
| Developmental memories | `developmental_memories` | 1,160 | user_id (text), memory_type (effective_practice/spiral_transition/breakthrough_emergence/pattern), content_text, visibility | **Live** | System-inferred | No — system-inferred only; must not be surfaced without member engagement |
| Breakthrough moments | `breakthrough_moments` | 772 | user_id (text), insight, element, integrated, related_themes[], conversation_id | **Live** | System-inferred from conversation | No — system-inferred; requires member recognition before surfacing |
| Practices | No dedicated `practices` table | — | — | **Missing** | — | — |

### Notable unlisted tables with significant row counts
These are infrastructural and not candidate representation surfaces:
- `conversation_memory_uses` (57,159) — telemetry
- `conversation_turns` (35,393) — raw turns
- `agent_runs` (28,519) — Corpus Callosum substrate
- `relationship_entries` (959) — covered above; highest member-meaning density outside atoms

---

## Section 2 — UI Surface Inventory

| Path / Component | Current Purpose | Can Embed? | What Would Change |
|---|---|---|---|
| `app/maia/keep-capture/page.tsx` | Portfolio of kept atoms — member's own material, "Keep this for me" gestures, lens passes | Yes — can be opened as panel alongside conversation | Needs: trigger from conversation context, panel mode rather than full-page, filter to `still_alive` view by default |
| `app/studio/field/page.tsx` | Studio "Field" — shows stillAlive questions from changes/decisions/thresholds for practitioner team | Partially — the `FieldPulse.stillAlive` pattern is exactly the right model | This is a practitioner surface. Member-facing version would replace changes/decisions source with `member_memory_atoms?view=still_alive` |
| `app/studio/calendar/page.tsx` | Practitioner calendar — month/week/day views, Google Calendar sync, MAIA proposal integration (AskMaia component) | Yes — the calendar view itself is well-built | Needs: member-auth (currently practitioner only), member calendar data source (currently aggregates bookings + Google Calendar for practitioners) |
| `app/maia/calendar/page.tsx` | Member-facing calendar — exists as page | Needs inspection | Unknown current state; exists at maia-level which is promising |
| `app/studio/changes/page.tsx` | Studio Changes — I Ching-based "changes" lifecycle for practitioners | Not directly | Member analog would need member atom source_type='change' rows |
| `app/studio/decisions/page.tsx` | Studio Decision Council — multi-perspective reflection for practitioner decisions | Not directly | Member analog would need source_type='decision' atom rows |
| `components/psyche/KeepAffordance.tsx` | The "Keep this for me" inline affordance | Yes — already designed to embed | Could be surface for offering a still-alive panel view |
| `components/memory/PatternDrawer.tsx` | Pattern drawer — likely shows inferred patterns | Only post-confirmation | Must not show inferred content without member-initiated gesture |
| `components/journal/QuickJournalSheet.tsx` | Quick journal sheet | Yes | Needs member data (5 rows), sheet mode can embed alongside conversation |
| `components/studio/changes/ChangeExperienceTimeline.tsx` | Change timeline for Studio Changes | Candidate | Could become member-facing representation for changes/threshold atoms |
| `app/maia/field-lab/page.tsx` | Field Lab — member-facing lab features | Yes | Current lab destination; representations could live here |
| `app/fields/[field]/with-me/page.tsx` | Fields "With Me" — conversation in a field context | Yes | May already support multi-representation; needs inspection |
| `app/studio/session-room/page.tsx` | Session Room — practitioner-facing session container | Candidate model | Constitutional model for "conversation + representations alongside" |

---

## Section 3 — Representation Candidates with Readiness Assessment

### a) Calendar View — "Would it help to see your week?"

**Data readiness:** LOW  
The only member-calendar tables are `booking_requests` (12 rows, practitioner-side bookings) and `events` (1 row, practitioner events). There is no member-owned personal calendar table. The Google Calendar integration (`GoogleCalendarService`, `/api/auth/google/calendars/`) exists for practitioners; most members have not connected OAuth. The maia-level calendar page (`/app/maia/calendar/page.tsx`) exists but its data source needs inspection.

**UI readiness:** MEDIUM  
The studio calendar page is a fully-built calendar UI (month/week/day, date-fns, AskMaia integration). Reusing it at the member level is architecturally sound but requires a member-appropriate data source.

**Governance:** Calendar content is member-authored (their own events). Safe to surface. The proposal model already in the Studio calendar (AskMaia proposes → human confirms) is exactly the right consent pattern.

**Verdict:** Do not build first. Calendar is the right long-term representation, but the data substrate (member's own calendar items) doesn't exist in MAIA — it would require Google OAuth onboarding for each member or a new member-facing event creation flow. High UI readiness, very low data readiness.

---

### b) Timeline View — "Would it help to see the thread over time?"

**Data readiness:** MEDIUM  
`maia_sessions` (829 rows) provides session history with dates. `member_memory_atoms` provides dated kept items. The `relationship_entries` provide dated relational moments. Combining these into a timeline is feasible.

**UI readiness:** LOW  
No existing timeline component for member-facing use. `components/studio/CaseMemoryTimeline.tsx` exists (practitioner-side). `components/studio/changes/ChangeExperienceTimeline.tsx` exists. Neither is wired to member atoms or sessions.

**Governance:** Session dates are safe. Session content is Sanctuary-boundary-adjacent — show metadata (date, turn count, mode) not conversation content. Atom titles/bodies are member-authored and safe. Inferred themes from `maia_sessions.themes` must not be surfaced as facts.

**Verdict:** Viable second prototype, but needs new component work. Would reuse atom + session data. Medium complexity.

---

### c) Relationship Map — "Would it help to see the pattern with [person]?"

**Data readiness:** HIGH  
`member_relationships` (29 rows) + `relationship_entries` (959 rows) is the richest member-authored substrate after atoms. The entry kinds (checkin/note/reflection/threshold/rupture/repair) provide genuine relational texture. `relationship_entry_patterns` (14 rows) exists.

**UI readiness:** LOW  
No member-facing relationship map UI. Practitioner-side relational tooling exists (`app/practitioner/labtools/network/`). The `app/founder/relational-patterns/page.tsx` path suggests a pattern was designed.

**Governance:** Member-authored `free_text` and `felt_signals` are safe. `maia_reflection`, `pattern_hint`, `suggested_movement` are MAIA-inferred — must not be surfaced as fact or synthesized without member engagement. `crossing_must_be_false` constraint on atoms applies here too: MAIA cannot author the pattern, only reflect it back as a question.

**Verdict:** Strong data foundation. UI doesn't exist yet. Build after Still Alive. Natural "third representation" after memory surface is established.

---

### d) Project / Task View — "Would it help to turn this into a plan?"

**Data readiness:** VERY LOW  
`focus_tasks` has 0 rows and uses `user_id: text` instead of `member_id: uuid`. No projects table. No member-owned task substrate.

**UI readiness:** LOW  
No member-facing task/project UI in the MAIA surface.

**Governance:** Would be fully member-authored if built. Safe.

**Verdict:** Do not build. Missing data substrate. Would require schema work + new member experience. Not a representation of existing continuity — it would be a new feature category.

---

### e) Still Alive / Memory View — "Would it help to see what has remained alive?"

**Data readiness:** HIGH  
127 live atoms, `?view=still_alive` API filter already implemented, `still_here_count` column for signal strength, `is_breakthrough` for elevation, multiple source types populated (idea/idea_block). The portfolio API (`/api/psyche/portfolio/atoms`) already exists as a read-only endpoint.

**UI readiness:** HIGH  
`/app/maia/keep-capture/page.tsx` is a live, governed, member-facing portfolio surface. `KeepAffordance.tsx` component exists for inline gesture. The existing page already has the discipline headers ("The member sees their own material first", "no system-generated insights", "no inferred patterns").

**Governance:** All atom content is member-authored or member-confirmed. `source_type` tracks provenance. `crossing_must_be_false` constraint is constitutional. The `return_preference` column (member_pulled / contextual_doorway / ritual_review_opt_in) already encodes the consent model for how atoms return.

**Verdict:** Build first. Highest readiness in both data and UI. Requires minimal new code.

---

### f) Practice View — "Would it help to choose a practice?"

**Data readiness:** VERY LOW  
No `practices` table exists. No member practice data.

**UI readiness:** LOW  
`components/studio/protocols/ProtocolCard.tsx` and `ProtocolCreator.tsx` exist for practitioner protocols, not member practices.

**Governance:** Would be fully member-authored if built. Safe.

**Verdict:** Do not build yet. No substrate.

---

## Section 4 — Recommended First Prototype

### Option B: Still Alive / Memory expansion

**Rationale:**
1. Data exists (127 live atoms) — no schema changes needed.
2. API exists — `GET /api/psyche/portfolio/atoms?view=still_alive` is already implemented with full view filtering.
3. UI exists — `/app/maia/keep-capture/page.tsx` is a live, governed page with the right discipline.
4. The pattern is already proven in Studio — `app/studio/field/page.tsx` shows a `stillAlive` pulse from changes/decisions/thresholds. The member version replaces the Studio data source with `member_memory_atoms?view=still_alive`.
5. Option A (Calendar) is blocked by missing member calendar data.

**What the prototype looks like:**

In `OracleConversation.tsx` (or the MAIA entry layer), detect expressions like "I keep coming back to this", "I've been stuck", "something is still alive for me", "I haven't resolved this yet". Offer: *"Would it help to see what has remained alive for you?"*

If member accepts:
- A panel slides in alongside the conversation (or replaces it conditionally)
- Calls `GET /api/psyche/portfolio/atoms?view=still_alive`
- Renders atom titles + brief body in the existing KeepCapturePage UI style
- Member can gesture on atoms (still here / set aside) without leaving context
- Panel closes when member returns to conversation

**Minimal new code required:**
1. Detection hook in conversation (expression pattern → offer trigger)
2. Panel wrapper around existing `KeepCapturePage` content (not the full page)
3. Conversation-to-panel state bridge in `OracleConversation.tsx`

**No schema changes. No new routes. No auth changes.**

---

## Section 5 — Governance Notes per Representation

### What is evidence (member-authored expression)?
- `member_memory_atoms`: title, body (when captured from member expression)
- `relationship_entries`: free_text, felt_signals (member-chosen)
- `member_relationships`: name, realm, bond_type, note (member-named)
- `quick_journal_entries`, `elemental_journal_entries`: member text
- `member_ideas`: member-authored
- Calendar events: member-created (when substrate exists)

### What is inference (system-generated)?
- `member_spiral_state`: element, phase, motion — all system-inferred
- `developmental_memories`: pattern, breakthrough_emergence, spiral_transition — system-inferred from conversation
- `breakthrough_moments`: insight, element — system-inferred (not member-declared)
- `episodic_memories`: experience_description, themes — system-extracted; only `marked_by_member=true` rows are member-confirmed
- `relationship_entries`: maia_reflection, pattern_hint, suggested_movement — MAIA-inferred (not member-authored)
- `member_memory_atoms` with `source_type='session_excerpt'` or `'spontaneous'` — system-extracted

### What must not be silently shown?
- `member_spiral_state` fields — never show without member-initiated request
- `developmental_memories` — system-inferred; never show as member's "patterns" without member recognition
- `breakthrough_moments` — system-inferred; only surface if member explicitly asks about past breakthroughs
- `maia_reflection` in relationship_entries — may be offered as a question, never stated as fact
- Conversation content (`maia_sessions.conversation_history`) — Sanctuary boundary; do not surface

### What requires member confirmation before surfacing?
- Any atom with `source_type='session_excerpt'` or `'spontaneous'` — system-extracted; confirmation gesture required before treating as "kept"
- Relational pattern summaries derived from `relationship_entry_patterns` — must be offered as hypothesis, not shown as conclusion
- Spiral element inferences from `member_spiral_state` — can offer "I notice fire has been present in our recent conversations — is that true?" but not display as fact

### Governing constraint (constitutional)
`crossing_must_be_false` check on `member_memory_atoms` is not just a database constraint — it is the constitutional principle made structural. MAIA does not cross into the member's meaning-making. Every representation offered is an invitation, not a placement.

---

## Section 6 — Do Not Build Yet

The following are explicitly out of scope for the Living Field first prototype. Each has a named reason.

| Item | Reason | When to revisit |
|---|---|---|
| Calendar representation | No member calendar data substrate. OAuth dependency. | After member-facing calendar onboarding is built |
| Relationship Map UI | Data exists but no UI component; would be second or third representation | After Still Alive is live and stable |
| Timeline View | UI doesn't exist; would require new component | After Still Alive + Relationship Map establish the pattern |
| Task / Project View | No data substrate (`focus_tasks` empty, no projects table) | Only if member task-capture becomes a product feature |
| Practice View | No practices table or substrate | Only if member practice-tracking is introduced |
| Spiral state surface | `member_spiral_state` is system-inferred; surfacing violates `inference earns ASK` law | Only if member explicitly asks or a member-confirmation ritual is built |
| Developmental memories surface | 1,160 rows but all system-inferred; surfacing as "your patterns" is constitutionally forbidden | Only after episodic Phase 2 ships and member-marking patterns are established |
| Breakthrough moments surface | 772 rows but system-inferred; `breakthrough_moments` is different from member-marked `is_breakthrough` on atoms | Only after member `is_breakthrough` gesture is live and proven |
| Dream representation | `source_type='dream'` atoms = 0 rows | Only after dream-capture UI is built |
| I Ching / Changes member surface | `iching_hexagrams` = 0 rows; Studio Changes is practitioner-only | After member-facing change-naming flow is built |
| Any synthesized cross-layer view | Would violate the "no cross-spiral synthesis" constraint and `inference earns ASK` | Not until episodic + relational + atom layers each have member-confirmation rails |
| Auto-switching to any representation | Violates the governing principle: MAIA offers, member chooses. Never auto-switch. | N/A — structural constraint, not a timing issue |

---

## Appendix — Key File Paths

**Data layer:**
- `/lib/psyche/portfolio.ts` — `listAtoms()` with PortfolioView filtering
- `/lib/psyche/types.ts` — MemoryAtomSourceType, PortfolioView, MemoryRegister, ElementalLens
- `/app/api/psyche/portfolio/atoms/route.ts` — `GET /api/psyche/portfolio/atoms`
- `/app/api/psyche/portfolio/atoms/[id]/gesture/route.ts` — gesture endpoint

**Existing member-facing surfaces:**
- `/app/maia/keep-capture/page.tsx` — Still Alive portfolio (primary prototype target)
- `/app/maia/calendar/page.tsx` — Member-facing calendar (state unknown, needs inspection)
- `/app/maia/orientation/page.tsx` — Memory orientation page
- `/app/maia/field-lab/page.tsx` — Field Lab

**Studio surfaces to study (practitioner pattern to adapt):**
- `/app/studio/field/page.tsx` — Studio Field Pulse (stillAlive pattern)
- `/app/studio/calendar/page.tsx` — Studio Calendar (UI to adapt for member)
- `/app/studio/changes/page.tsx` — Studio Changes (I Ching lifecycle)
- `/app/studio/decisions/page.tsx` — Studio Decision Council

**Conversation layer (where to add trigger):**
- `/components/OracleConversation.tsx` — primary voice/conversation orchestrator

**Calendar infrastructure (practitioner-grade):**
- `/app/api/studio/calendar/events/route.ts` — aggregates MAIA bookings + Google + studio events
- `/lib/calendar/GoogleCalendarService.ts` — Google OAuth integration
- `/app/api/sovereign/proposals/calendar/confirm/route.ts` — proposal confirmation pattern
