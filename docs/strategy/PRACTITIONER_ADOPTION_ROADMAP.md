# PRACTITIONER ADOPTION ROADMAP (grounded)

**Date**: 2026-06-10
**Register**: Plan + verified substrate. Tier items are **proposals**, not commitments; building is gated (discipline + observation + branch verification below). Substrate marked **BUILT / WIRED / DATA-ONLY / ABSENT / VERIFY**.
**Companions**: [`PLATFORM_CENTER_OF_GRAVITY.md`](./PLATFORM_CENTER_OF_GRAVITY.md), [`CO_LAB_NORTH_STAR.md`](./CO_LAB_NORTH_STAR.md), [`CO_LAB_REVEAL_AUDIT.md`](./CO_LAB_REVEAL_AUDIT.md).
**Discipline**: *Move forward by **building*** (presentation/workflow/orchestration over existing substrate) vs *move forward by **defining*** (schema/governance/consent before features) vs *design before building* (spec only).

---

## Substrate verification — honesty flags (read before trusting any "Build Now")

A read-only substrate pass (2026-06-10) grounded the plan. Three flags change the picture and **must not be papered over**:

1. **Branch flag (precondition for any Studio build).** The working tree is on `fix/studio-calendar-timezone-edit` (HEAD `34a505de3`); **#401's Studio reveal (`4ab6b25b0`) is NOT in it.** This branch's `/studio/page.tsx` is the *operator cockpit* (triage / agents / quick-delegate), **not** the deployed practitioner reveal. → Any Studio home/Prepare-Me UI work **must branch from `clean-main` (post-#401)**, or it builds onto stale code.
2. **Supabase flag (dead data).** The "community" engagement tables an explorer cited — `community_profiles`, `community_presence`, `community_bbs` — live under `db/supabase/migrations/`. **This project does not use Supabase** (CLAUDE.md). Treat them as **dead**; do NOT build Community Visibility on them. Use live Postgres signals instead (below).
3. **Breakthrough correction.** "Last breakthrough" is **not absent** (an explorer checked the wrong table). Two real sources exist: **member-side** `member_memory_atoms.is_breakthrough` (Cat 6 live, member-marked) and **case-side** `case_memories.memory_type='breakthrough'` (practitioner/MAIA-marked). For a client brief, `case_memories` is the source.

---

## Tier 1 — BUILD NOW (presentation/orchestration over existing substrate)

### 1. Prepare Me — **ALREADY LIVE in #401 (verified 2026-06-10) — NOT a build**
> **Correction (verified firsthand on `clean-main`)**: the Studio reveal home (`app/studio/page.tsx:191`) already renders a LIVE "Prepare Me" card — no `comingSoon` gate; code comment reads *"the crown jewel, impossible to miss"* / *"the existing engine, finally on the threshold."* When a next booking exists it surfaces `SessionBriefingCard` inline → `/api/studio/sessions/[id]/briefing` → `getSessionPrep()`, a real **safety-aware** brief (last session, recurring themes, risk/safety-plan flags, rate) from `practitioner_clients` + `practitioner_sessions`. **Building Prepare Me would rebuild a live feature.**
**Intent**: "Who am I seeing next?" → "What matters before I walk into this room?" (before / during / after).
**Two prep engines — do not conflate**:
- **Studio (LIVE, surfaced in the reveal home)**: `/api/studio/sessions/[id]/briefing` → `getSessionPrep()` — data-assembled, safety-aware.
- **Stellium (engine exists, surfaced only in `/stellium/sessions`, siloed from studio)**: `app/api/stellium/maia/prepare/route.ts` — LLM-narrated; `storeMaiaPrep`. The earlier "no UI trigger" note referred to THIS engine.
- **BUILT** — practitioner↔client spine: `practitioner_cases` + `case_notes` + `case_memories` (`20260107000001`); `case_memories.memory_type` ∈ {breakthrough, pattern, stuck_point, spiral_transition, intervention_outcome, hypothesis, supervision_insight} + significance + vector embedding → *before-session brief fields already have sources.*
- **BUILT** — upcoming session (`sessions`/`practice_sessions`/`calendar_events`); Session Room (`app/studio/session-room/page.tsx`) + one-tap launch (`/studio/camera?sessionId=`) + live notes (`scribe_sessions`).
- **ABSENT** — UI gesture; "commitments" table; "important life events" link (`expansion_events` FK unclear — VERIFY); practitioner-invited-reflections link; **post-session continuity hooks**.
**VERIFIED 2026-06-10** (read-only; see [`PREPARE_ME_VERIFICATION_2026-06-10.md`](./PREPARE_ME_VERIFICATION_2026-06-10.md)): live + correctly wired, but **NOT working in use** — (1) **0 upcoming bookings** (all 32 `sessions` are past) → every practitioner sees the empty stub; (2) the brief reads `practitioner_sessions` = **0 rows** while real session data (**69**) lives in `scribe_sessions`. **Real gap = connection + data, not UI** (and not the after-session hook). Client seam sound; practitioner-id `practitioner_sessions→members` divergence latent (unverifiable while empty).
**Next steps = investigation, not build**: (a) why 0 upcoming bookings — is a booking flow producing future `sessions`? (b) is `scribe_sessions` the source the brief should read (or write through into `practitioner_sessions`)?
**TRACED 2026-06-10** (see [`SESSION_DATA_ARCHITECTURE_2026-06-10.md`](./SESSION_DATA_ARCHITECTURE_2026-06-10.md)): booking code path is **sound** (writes→`sessions`, home reads `sessions`) but **effectively unused** — 24/32 bookings cancelled, 8 past, **0 upcoming**, none created in ~2mo. `practitioner_sessions` (the brief's source) is **orphaned** (written only by voice-note-draft); bridge columns `sessions.scribe_session_id` / `scribe.booking_id` exist but are **0% populated**. Session Room is mostly **solo practice** (48 solo / 16 witness / **5 client-mode** of 69; 3 users). **Compound root = connection deficit + pre-adoption usage.** Reframed priority: understand *why client bookings/sessions aren't happening* BEFORE wiring session-history plumbing (connecting now reveals near-empty data).

### 2. Practitioner Workflow — *half-revealed already*
**Intent**: make the next right thing obvious (Home / Sessions / Follow-ups / Memory).
**Verified substrate**:
- **WIRED** — "Who needs me today?" = `/studio/caseload` (view + `practitioner_cases`); "What's next?" = `/studio/calendar` (view + `calendar_events`/`practice_sessions`).
- **DATA-ONLY** — "Who am I waiting on?" = `focus_reminders`/`focus_tasks` (reminder_type follow_up/check_in) exist, **no practitioner view**; "What should I revisit?" = `case_memories` (vector search) exists, **no browse view**.
- **ABSENT** — a "next right thing" orchestrating home.
**Build-ready core**: 2 thin new views (waiting-on, revisit) + an orchestrating home over existing data.
**Precondition**: the home must be built on `clean-main`'s reveal (this branch's `/studio` is the operator cockpit — see flag 1).

### 3. Community Visibility — *presentation over LIVE data (not Supabase)*
**Intent**: reveal belonging (People / Circles / Collaborations) instead of channels.
**Verified substrate**:
- **BUILT (live Postgres)** — "active this week" from `members.last_sign_in` + `team_messages(sender_id, created_at)`; "new practitioner" from `practitioners.created_at` / `studio_team_members.joined_at`.
- **BUILT** — **Circles are real**: `circles` + `circle_memberships` (`20260213000004_circles_commons.sql`; roles member/helper/facilitator, invite-only). "Consultation circles" is *not* invented — it has a substrate.
- **ABSENT** — a top-level "People" directory view (data exists; UI gap).
- **DEAD — do not use** `community_profiles`/`community_presence` (Supabase; flag 2).
**Build-ready core**: a People/Circles surface + 3 activity counts, all from live tables.

---

## Tier 2 — DEFINE NOW (design before code)

### 4. Consultation doorway
Primitives **BUILT** (audit): threads (`team_messages.parent_id`) + `message_kind='request'` → `attention_items.kind='request'`. *Define*: the de-identification ritual + the single gesture **"Would it help to carry this with someone?"**. Not channels, not workflows. Small.

### 5. Referrals — *correction: matching is half-built, don't rebuild it*
The filterable matching dimensions **already exist + are searchable**: `practitioner_directory_profiles` (modalities, tags, location, languages, sliding-scale) + connections + de-identified `referral_requests` (audit §7). **What's genuinely undefined is exactly the soft layer the plan names** — *style, relationship, fit*. → *Define* the soft-match principles; **extend** the existing backend, don't define matching from scratch.

### 6. Relationship continuity — *anchor on the taxonomy that already exists*
"What constitutes a thread?" partly answered by substrate: `case_memories.memory_type` is already a thread-element taxonomy; member `is_breakthrough` is live. The plan's list maps: **breakthroughs ✓** (case_memories + atoms), **recurring themes ✓** (memory_type='pattern'), **commitments ✗** (no table), **intentions / declared goals ✗**. → *Define* the thread primitive on the existing taxonomy + name the 2–3 missing primitives. This becomes the primitive Memory later uses.

---

## Tier 3 — DESIGN BEFORE BUILDING (spec only; aligns with existing freeze)

7. **True Relationship Memory** — provenance / consent / scope / deletion / visibility / inference boundaries. Schema before interface. (Consistent with the memory-layer freeze in the project anchor — episodic/coherence under named gates.)
8. **Continuity across people and time** — Person → Relationship → Community → Collective continuity. Do not rush.
9. **The Accompaniment Layer** — not a feature, an organizing principle. First implementation may literally be the one doorway: *"Would it help to carry this with someone?"*

---

## Three horizons (different speeds, on purpose)

- **Stay** ← *Prepare Me* (immediate value; API already exists).
- **Invite colleagues** ← *Consultation*.
- **Irreplaceable** ← *Relationship Memory*.

> Studio gave practitioners a home. The next thing that makes them *stay* is not Memory — it's Prepare Me. These horizons need not arrive at the same speed.

---

## What grounding changed vs the original plan

- **Prepare Me is ALREADY LIVE in #401** (verified firsthand 2026-06-10) — not a gap at all. The reveal home surfaces a real safety-aware briefing inline (*"crown jewel"*). Next move = **verify-in-use, not build.** The earlier "prep API has no UI" finding was about the *stellium* engine, a separate siloed lineage.
- **Practitioner Workflow** is 2 thin views + a home, not a build-from-scratch — caseload/calendar are already wired.
- **Community Visibility** is buildable from **live** data, but the obvious "community" tables are **dead Supabase** — wrong well to draw from.
- **Referral matching** is already built at the filter layer — "define" applies only to the *fit/style/relationship* layer.
- **All Studio builds are gated on starting from `clean-main`** (the reveal), not the current working tree.
