# Conversational Layer — Phase 2 Spec (Prompt Influence)

**Status:** Implemented (backend only) — UI for opt-out toggle pending.
**Date:** 2026-05-24 (evening)
**Branch:** `clean-main-no-secrets`
**Kelly directive (live):** *"yes I want full memory in all arenas in a safe but functional way. No more hardened rules against providing the one thing that makes soulful engagement possible and makes this platform more than a chat bot."*
**Authority chain:**
- `docs/canon/MAIA_CANON_v1.1.md`
- `docs/canon/MAIA_OATH.md`
- `docs/canon/MAIA_SOVEREIGNTY_INVARIANTS.md`
- Memory: `project_substrate_label_split_declared_unfed`
- Memory: `project_observation_phase_freeze_doctrine`
- Memory: `project_different_channel_same_principle`
- Memory: `project_resonance_operational_not_mystical`
- Memory: `project_breakthrough_memory_member_ratified`

---

## §0. Lift Acknowledgment

This spec exists because Kelly explicitly lifted the observation-phase freeze
on the conversational layer in session on 2026-05-24 evening, immediately
following the substrate-doctrine surfacing of `project_substrate_label_split_declared_unfed`.

The freeze doctrine remains in force for all other layers (episodic, somatic,
field, meta). This document does not constitute authorization to lift those.

## §0.A. Prior Cut (already shipped — do not re-do)

Commit `3f0191231` (Kelly, 2026-05-24 10:33 EDT) shipped Phase 1:

- `loadPriorCrossSessionExchanges(userId, currentSessionId, limit=6)` in `lib/maia/memoryLoaders.ts`
- Returns `PriorExchangeSnapshot[]` = `{ session_id, role, created_at }[]` — **shape only, no content**
- Wired at `app/api/oracle/conversation/route.ts:636`
- Feeds `buildMemoryHealth({ conversational: { count: priorCrossSessionExchanges.length } })` at line ~2420
- Substrate row should already be flipping `declared-unfed → observed-runtime` for returning members

Phase 2 builds on this. Do not rewrite Phase 1.

---

## §I. Scope of Phase 2

**Additive:**
1. Extend retriever to include `content` (and optionally `created_at`-derived recency label).
2. Add a prompt block formatter that renders prior cross-session exchanges into a minimal, provenance-grounded block.
3. Wire the block into `finalSystemPrompt` alongside `atomsContextBlock`.
4. Extend observability: distinguish "no prior turns" from "had prior turns, chose not to surface" and from "surfaced N."
5. Verification gate: no functioning-claim until runtime logs prove emission across multiple sessions.

**Non-goals (Phase 2 does NOT do):**
- No relevance scoring / semantic ranking. Provenance remains structural (session boundary + recency).
- No synthesis across exchanges ("you've been working on X").
- No interpretation of prior content ("you seemed to be processing Y").
- No cross-session pattern claims.
- No member-facing UI for the layer (per `project_no_static_ui_claim_without_verified_state`).
- No schema change to `conversation_turns`.
- No new migration.

---

## §II. Doctrinal Questions Requiring Kelly's Answer Before Code

Each of these is load-bearing. None can be silently chosen by Claude.

### §II.A. Consent semantics of `conversation_turns`

`member_memory_atoms` has explicit consent gate via `return_preference IN ('contextual_doorway', 'ritual_review_opt_in')`. The member opts atoms into ambient surfacing.

`conversation_turns` has **no equivalent gate**. Every assistant/user exchange is stored unconditionally (excluding Sanctuary Mode sessions, which structurally never enter the table).

Phase 2 changes the de-facto semantic of stored turns from *"session continuity buffer"* to *"ambient cross-session prompt material."* The member never explicitly consented to this re-use when the turns were written.

**Three resolutions, none silently selectable:**

1. **Implicit consent by storage.** All non-Sanctuary turns are eligible for cross-session ambient surfacing. Rationale: Sanctuary is the explicit refusal channel; absence of Sanctuary = implicit consent to continuity. Risk: stretches the member's original act of speaking into a permission they did not explicitly grant.

2. **Explicit opt-in per member.** Add a member-level preference (`members.conversational_recall_enabled` default `false`). Surface only when member has opted in. Rationale: matches atoms consent discipline. Cost: adds onboarding step OR leaves the layer silent for all existing members until they discover the setting.

3. **Default-on with explicit opt-out + visible disclosure.** Default-on for new sessions going forward, with visible disclosure ("MAIA may reference our prior exchanges") and a Settings toggle. Rationale: matches the `0fa544bc4` default-flip pattern (Keep = contextual return by default) Kelly chose for atoms.

**Kelly: which?** (Default recommendation: 3, matching the atoms default-flip — but only Kelly's explicit answer authorizes.)

### §II.B. Prompt block format

The block must contain no synthesis. Two candidate formats:

**Candidate A (literal recall):**
```
PRIOR EXCHANGES (this member, other sessions, structural recall only):
- 3 days ago, member said: "[content excerpt]"
- 3 days ago, MAIA said: "[content excerpt]"
- 6 days ago, member said: "[content excerpt]"
(System has not interpreted these. Reference only if directly relevant.)
```

**Candidate B (minimal pointer):**
```
PRIOR CONTINUITY: This member has 6 prior exchanges across 3 sessions over the
last week. Content available on request. (System has not synthesized.)
```

A surfaces content; B surfaces only structural fact. A is what the memory entry
called "minimal/provenance-grounded prompt influence." B is even more minimal
and arguably closer to the freeze doctrine's spirit (observability extended,
not interpretation granted). **Kelly: which?**

### §II.C. Suppression rules

Even when `count > 0`, when should the block NOT emit?

Proposed suppression rules (all OR-combined):
- Member has opted out (per §II.A resolution)
- Current session is `mode = 'Sanctuary'` (already enforced upstream — Sanctuary sessions don't reach this code path, but defense-in-depth check)
- Block character budget exceeded by higher-priority blocks (atoms + anchor + forward-readiness)
- Member's session is fewer than N turns old AND prior session was within last M minutes (treat as session resumption, not cross-session continuity — `recentTurns` already covers this)

**Kelly: are these the right suppression rules? What N, M?**

### §II.D. Observability extension

`memoryHealth.conversational` is currently `LayerStatus` (`empty | ok | error`). Phase 2 introduces a distinction not currently expressible:

- `empty` → member has no prior cross-session turns
- `ok-suppressed` → prior turns exist but block did not emit (suppression rule fired)
- `ok-surfaced` → prior turns exist and block emitted

Two options:
1. Extend `LayerStatus` type (cross-cutting change, affects substrate monitor)
2. Add a sibling log line `[Oracle] conversational-block` separate from `memoryHealth`, similar to existing `[Oracle] atoms-block emitted`

**Recommendation:** Option 2, no type changes. Substrate row stays at `ok` whenever count > 0; emission detail lives in dedicated log line. Less coupling, easier to verify in production.

---

## §III. Implementation Plan (after §II answered)

1. **Retriever extension.** Add `content` (and `created_at` already present) to `PriorExchangeSnapshot` and the SELECT. Bound `content` length per row at retrieval (`LEFT(content, 600)`) to avoid loading multi-KB turns.

2. **Block formatter.** New function in `lib/maia/memoryLoaders.ts` (or new `lib/maia/conversationalRecallBlock.ts` — TBD per §II): `formatPriorExchangesForPrompt(exchanges: PriorExchangeSnapshot[], opts: SuppressionContext): { block: string | ''; emitted: boolean; suppressedReason?: string }`.

3. **Wire point.** In `app/api/oracle/conversation/route.ts`, after `atomsContextBlock` (line ~2400), build `conversationalBlock`. Concatenate into `finalSystemPrompt` after `atomsContextBlock`. Log `[Oracle] conversational-block` with `{ emitted, count, suppressedReason }`.

4. **Substrate map update.** `lib/maia/substrateMap.ts` row for `conversational` — update `note` from `"Prior related exchanges across sessions."` to `"Prior cross-session exchanges. Phase 2 — content surfacing per consent gate."`. Modules and consumers unchanged.

5. **Doctrine in code.** Inline comment at wire point referencing this spec + lift declaration + suppression rules.

---

## §IV. Verification Gate (per `project_no_static_ui_claim_without_verified_state`)

Phase 2 is **not** "functioning" when code lands. It is "wired and awaiting runtime evidence." The substrate row may move from `wired-unobserved` to `observed-runtime` for the count, but **emission** must be verified separately.

Required to call Phase 2 functioning:
1. Production logs show `[Oracle] conversational-block { emitted: true, ... }` across at least 3 distinct members in real (not Kelly-test) traffic
2. Production logs show suppression rules firing where expected
3. No `[Oracle] conversational-block { error: ... }` entries
4. Kelly observes (over days of real use) whether MAIA's responses feel more continuous — and the answer is recorded honestly, including if "no felt difference yet"

Until all four, the CLAUDE.md priority thread describes Phase 2 as *"shipped and observed; felt-continuity not yet evaluated"* — not *"functioning."*

---

## §V. Drift Canaries

If any of the following appears post-ship, the spec was violated:

1. The block formatter computes "themes" or "patterns" across exchanges → synthesis drift.
2. MAIA's response references prior turns by interpretation rather than direct reference ("I remember you were working on X" when no atom or anchor said so) → interpretive displacement (§V of Canon).
3. The substrate row reports `ok` while emission is silently suppressed → observability lying (sibling of `project_substrate_label_split_declared_unfed`).
4. A "Conversational Recall" tab appears on `/maia/substrate` without verified emission → static UI claim without verified state.
5. A future cut adds relevance scoring / semantic ranking to the retriever → Phase 2 was supposed to be *structural* recall; relevance scoring is Phase 3 (not authorized).
6. The block influences the prompt without the member ever having a way to know or opt out → consent decoupled from surfacing.

---

## §VI. Non-Goals (re-statement for clarity)

- This spec does not lift the freeze on episodic, somatic, field, or meta layers.
- This spec does not authorize cross-atom synthesis.
- This spec does not authorize member-facing UI for the layer.
- This spec does not authorize semantic/vector ranking.
- This spec does not modify Sanctuary Mode invariants.

---

## §VII. Resolved Answers (locked by Kelly directive 2026-05-24)

| # | Question | Locked Answer |
|---|----------|---------------|
| 1 | §II.A consent resolution? | **Option 3** — default-on (`members.conversational_recall_enabled DEFAULT TRUE`) with opt-out + disclosure. Migration `20260524000001_member_conversational_recall.sql`. UI toggle pending. |
| 2 | §II.B block format? | **Candidate A** — literal recall with content excerpts, recency labels, Member/MAIA speaker tags. Implemented in `lib/maia/conversationalRecallBlock.ts:formatPriorExchangesForPrompt`. |
| 3 | §II.C suppression rules? | **All four** — opt-out, Sanctuary (defense-in-depth), empty, session-resumption (window 30 min + threshold 3 turns). |
| 4 | §II.D observability extension? | **Option 2** — separate `[Oracle] conversational-block` log line with `{ emitted, surfacedCount, suppressedReason }`. `memoryHealth.conversational` unchanged in shape. |
| 5 | §III.2 file location? | **New file** `lib/maia/conversationalRecallBlock.ts` (memoryLoaders.ts stays query-only). |
| 6 | §IV runtime-evidence threshold? | **3 distinct members in real (non-test) traffic** with `emitted: true` log lines across multiple sessions before Phase 2 is declared functioning. |

---

## §VIII. CLAUDE.md Priority Thread Update (proposed, not yet applied)

After Kelly answers §VII and Phase 2 ships, the priority thread should be updated to record:

```
- Conversational layer Phase 2 lifted (date), shipped (commit), observed (runtime).
- Phase 2 = prompt influence with structural provenance, member consent gate per
  §II.A resolution, suppression per §II.C, observability per §II.D.
- Phases 3+ (relevance ranking, episodic, somatic, field, meta) remain frozen.
- Next action: observe felt-continuity under real cross-session traffic; revisit
  spec §IV verification after 7 days of production.
```

Kelly authors the actual update. Claude does not edit the priority thread
without explicit instruction (per established practice).
