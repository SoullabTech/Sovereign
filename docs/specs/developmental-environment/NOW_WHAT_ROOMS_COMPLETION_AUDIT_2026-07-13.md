# Now What? Rooms — Completion Audit (Phase 0–2, pre-authorization)

**Date:** 2026-07-13 · **Status:** AUDIT ONLY — no code changed. Stops for authorization.
**Charge:** *Complete the environment in layers of truth, not layers of appearance.* Every room ends in one of three states: built-and-usable · truthfully scaffolded with an honest explanation · deliberately unavailable because its constitutional dependencies are not ready.

## Refs (findings bind to these)

| Fact | Witness |
|---|---|
| Origin main tip = deployed prod | `2bfc97f2b` (merge PR #598); `docker exec maia-sovereign printenv GIT_COMMIT` → `2bfc97f2b` (2026-07-13) |
| PR #595 (program position, FULL deploy w/ migration) | **MERGED** 2026-07-12 21:21Z. PR #596 (walk-corrected environment) also MERGED. |
| Prod DB | `field_programs` ✅ exists, **0 rows** · `field_program_positions` ✅ exists, **0 rows** (2026-07-13) |
| Branch `feature/now-what-program-catalog` tip `040be82eb` | **Behind prod.** The 4 uncommitted worktree files (`EnvironmentMapView.tsx`, `NowWhatShell.tsx`, `NowWhatRoom.tsx`, `app/now-what/field/page.tsx`) are line-identical to their state at `2bfc97f2b`. New work must branch from origin main tip, not this branch. |
| Local `clean-main-no-secrets` | stale (`44662052c`) — do not read gating facts from it |

## The map as the code defines it

`components/now-what/EnvironmentMapView.tsx` — **7 rooms, no status enum**; `route: null` is the taking-shape flag.
- `OPEN_ROOMS` (L60–76): **Session room** → `/now-what/room` · **Your field** → `/now-what/field`.
- `COMING_ROOMS` (L78–84, all `route: null`, dead/non-clickable): `position` "Where you are" · `next` "What may be next" · `questions` "Questions you're living" · `themes` "Themes" · `reflections` "Reflections".
- SVG scaffold chambers (L189–218) are hand-drawn literals labeled "TAKING SHAPE"; word-index (L282–299) renders coming rooms as `<div>` (no link). Practitioner clearance: `app/studio/environment/page.tsx` renders the same component `viewer="practitioner"`, structure-only tier 1 (tiers 2–3 sitting-gated).

## Governing constraints (all rooms)

- **Invariant 16 / upward-only authority** (`docs/canon/CONSTITUTIONAL_DIRECTION_OF_AUTHORITY.md`, RATIFIED): the system never manufactures higher-order meaning the member hasn't authored.
- **Memory safeguards** (`docs/architecture/MEMORY_EXPANSION_PLAN_2026-05-24.md` §0): provenance-grounded surfacing, member-marked salience, **no cross-exchange theme claims unless the member names them first**.
- **Landscape flags** (`DEVELOPMENTAL_LANDSCAPE_CANDIDATE_2026-07-13.md`, "fix before any rendering"): **no numeric stat tiles** (things, not numbers) · **seasons self-placed or absent** — MAIA never assigns one.
- Position **never inferred, never scored**; **no practitioner read of positions — ever** (`NOW_WHAT_PROGRAM_POSITION_SPEC_2026-07-10.md` §2/§4/§5; `LARRY_PROGRAM_FIELD_WALK_PROTOCOL` Constitutional Principles #4 incl. divergence flag).
- Themes/Reflections **member-pulled, never ambient** (Template seven-room grammar; Larry Promise #4; Ruling 3: *enters → asks → reflects*).

## PHASE 0 — Ground-truth matrix

### 1. Where you are — disposition: **WIRE**
- **In production:** the full mechanism, wired into the *Session room*, not the map room. Migration `database/migrations/20260712000001_field_programs_and_positions.sql` (`field_programs`, `field_program_positions` — `focal_point`, `stated_by ∈ {member_confirmed, member_stated, practitioner_seeded}`, departure hard-deletes); service `lib/practiceField/programPositionService.ts` (`resolveArrival`, `getMemberPositions`, `composeProgramPositionBlock`); route `app/api/now-what/program-position/route.ts` (**POST only**: confirm/focalPoint/depart); read path `NowWhatRoom.tsx` L305–336 via `GET /api/now-what/field-note` → `json.arrival`; composed in `lib/maia/roomComposition.ts:63`.
- **Data:** prod tables empty. Seed `scripts/seed-larry-program-doors.ts` (4 doors on field `now-what-demo`) has **not** been run in prod — Kelly/Larry decision.
- **Unbuilt:** the map room itself (route `null`); no member-facing GET of one's own positions (route is POST-only; `getMemberPositions` exists unexposed).
- **Lawfully reads:** the member's own `field_program_positions` rows + `field_programs` catalog. **Never:** inference, scoring, progress %, practitioner visibility.
- **Smallest truthful next:** a room page rendering the member's own confirmed/stated positions (with `stated_by` honesty — practitioner-seeded shown as "assumed until you speak"), a member-facing GET, and the map route flipped from `null`.
- ⚠️ Reconciliation note: the position spec's own build gate was "Kelly's word" and the build proceeded past that hold (already flagged in the experience-map reconciliation memory) — the *sitting* owns that reconciliation; this audit only extends the already-merged mechanism.

### 2. What may be next — disposition: **WIRE (link, don't build)**
- Nothing room-specific exists. The member-pulled Now What? experience is live: Session room phases (proposal → practice → offering, `NowWhatRoom.tsx`), `GET /api/now-what/field-note` composition. Template grammar: Practices thread-kind live; **no compliance tracking**.
- **Smallest truthful next:** the map room routes into the existing member-pulled experience with honest framing copy. No new mechanism. Never: system-authored "next steps," advancement, ranking.

### 3. Questions you're living — disposition: **BUILD-small (one confirmation pending)**
- **No dedicated substrate.** Closest existing: interview route files atom-threads `kind: "question"` (`app/api/now-what/interview/route.ts:167`) — member-authored, provenance-grounded.
- **Smallest truthful next:** render only member-authored question-kind threads (empty state honest: "No questions kept yet — questions live here when you place them"). No paraphrase, no synthesis, no MAIA-suggested questions.
- **Pending:** Template grammar ties member-authored-question *persistence* to the episodic ship. Rendering already-authored threads is provenance-only and arguably lawful now — **this call belongs to Kelly**, listed below.

### 4. Themes — disposition: **HOLD + EXPLAIN**
- Gate **unmet**: Pattern layer is Phase-1 observed-only, flagged "highest interpretive risk"; requires episodic + member-confirmation gate; "you always" forbidden (Memory plan §2). `EpisodicMemoryService` confirmed **0 live callers** (`substrateMap.ts`: "Service preserved; no live consumer wired").
- **Smallest truthful next:** replace the dead scaffold with a restrained explanation (member-pulled promise, no background interpretation). No dashboard, no fake empty state.

### 5. Reflections — disposition: **HOLD + EXPLAIN**
- Constitutional bound: *enters → asks → reflects; never ambient*. Gated on episodic Phase 2 + tact calibration (neither shipped).
- **Smallest truthful next:** same honest-explanation treatment.

### 6. Session room — disposition: **EXPLAIN now; guard after the sitting**
- **Live**, production-witnessed (`app/now-what/room/page.tsx` → `NowWhatRoom.tsx`; threshold-gated).
- Open finding: `LARRY_PROTOCOL` §D found **unguarded keep-filing** — trust copy and enforcement must land as one act; that pairing is sitting-scheduled, not this slice. Trust copy for the room itself can ship now.
- (The separate `/open/session-room/[roomId]` WebRTC smoke room is transport-only, join-consent-gated; out of scope.)

### 7. Your field — disposition: **VERIFY + trust copy**
- **Live:** `app/now-what/field/page.tsx` → `GET /api/now-what/field-note` → member-authored **Vision Studio threads** (private by default, `can_be_shown_to_practitioner` per-thread), Box-1/2/3 card grammar. Note: this renders *threads*, not memory atoms — the atoms self-view lives at `app/studio/field/page.tsx`. Docs calling this room "Keeps/Library" should not be read as atoms-wired.
- Journey/timeline view over keeps stays gated on Episodic Phase 2. **Smallest truthful next:** trust copy only.

## PHASE 1 — Dependency-ordered plan

**Step 0 — repo hygiene (precondition):** branch fresh from `origin/clean-main-no-secrets` tip; do not extend `feature/now-what-program-catalog` (tip behind prod; worktree diffs are already deployed content).

- **A. Operational now:** (1) "Where you are" room + member GET + map route. (2) "What may be next" linked to the live experience. (3) "Questions you're living" over existing question-kind threads — *if Kelly clears the persistence-gate reading*.
- **B. Honest designed-state now:** taking-shape rooms become legible, not clickable-into-fakery — restrained explanation panels for Themes/Reflections (and Questions if held); **trust copy on all 7 rooms**: what it holds / doesn't hold / who can see it / how the member controls it. Consent-pattern precedents to mirror: Daily Anchor `surface_preference`, atoms `return_preference` (default-private, member-pulled, per-item opt-in).
- **C. Remains gated:** Themes + Reflections function (episodic Phase 2 + member-pull + tact) · seasons/self-placement vocabulary (sitting) · group-shared material (unspecced, Kelly) · session-room keep-filing guard (one act with its trust copy, sitting) · practitioner map tiers 2–3 (sitting; 2 AccessMatrix rows needed) · prod seed of Larry's doors (Kelly/Larry).

## PHASE 2 — Proposed first slice (one vertical slice)

"Where you are" + "What may be next" + trust copy everywhere (+ "Questions" if cleared). Files touched:
- `components/now-what/EnvironmentMapView.tsx` — flip routes for the slice rooms; honest-explanation affordance for held rooms (map stays register-quiet: quiet ≠ invisible).
- **New** `app/now-what/position/page.tsx` (or `/now-what/where-you-are`) — renders `getMemberPositions` output; things, not numbers.
- `app/api/now-what/program-position/route.ts` — add member-scoped GET (self-only; same session auth; no practitioner path).
- **New** `app/now-what/questions/page.tsx` — question-kind threads only (if cleared).
- `components/now-what/NowWhatShell.tsx` + room pages — trust copy blocks.
- **No migrations. No new tables. No writes to member data. Nothing ambient.**

**Tests/witnesses required:** narrow-scope typecheck; Co-Lab boundary gate 31/31 (positions are a scoped surface — add the 2 pending AccessMatrix rows or explicitly defer with the tier-2/3 hold); prod witnesses after deploy: authenticated member GET returns only own rows; practitioner clearance shows **no** position data (negative proof); map click-through on all slice rooms; `GIT_COMMIT` = deployed SHA.

## Decisions that belong to Kelly / the sitting — NOT the code lane

1. Authorize the slice at all (this audit stops here).
2. "Questions you're living": render existing member-authored question threads now, or hold with Themes/Reflections until episodic?
3. Seed Larry's four doors into prod `field_programs` (his field, his catalog; Larry register = experiential).
4. Honest-explanation copy for Themes/Reflections — approve exact wording (claim-discipline: designed-state, not live-state).
5. Position build-past-hold reconciliation (existing sitting item; noted, not resolved here).
6. Self-placement vocabulary/seasons; group-shared material; keep-filing guard scheduling; practitioner tiers 2–3.
