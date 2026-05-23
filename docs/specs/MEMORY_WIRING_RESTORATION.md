# Memory Wiring Restoration — Phased Spec

> **⚠ SUPERSEDED 2026-05-22 ⚠**
>
> This document was the initial Phase-0 framing produced *before* the archaeological dig revealed the three-architecture map (MAIA-PAI legacy / Phase 1.5 orchestrator / atoms portfolio).
>
> The canonical sequence is now in:
> - `docs/architecture/MAIA_PAI_MEMORY_ARCHAEOLOGY.md` §VII–VIII (the first cut and subsequent cut shapes)
> - `docs/specs/CUT_1_SUBSTRATE_RESTORATION.md` (the active Cut 1 implementation spec)
>
> This file is kept for historical reference only. Do **not** use it as the implementation guide. The Phase numbering here does not match the Cut numbering in the archaeology — the archaeology uses *substrate cuts*, this file uses *layered phases*, and the team should follow the archaeology's sequence.

**Status (historical):** DRAFT — awaiting founder approval before any implementation
**Created:** 2026-05-22 (Kelly directive: "full high intelligent memory, FIS, resonant field intelligence with Unified Intelligence — won't stop until it is all fully architected back into connection")
**Author:** Kelly + Claude (collaborative diagnostic)
**Original scope claim (no longer authoritative):** All memory-path code changes from this point forward until full architecture is in connection
**Companion canon:**
- `docs/canon/MAIA_MEMORY_CANON_v1.0.md` (the irreducible standard)
- `docs/canon/MAIA_WIRING_AUDIT_v1.0.md` (what is ACTIVE / ORPHAN today)
- `docs/canon/INTELLIGENCE_FIELD_ACCESS_MAP.md` (which fields can MAIA reach while speaking)
- `docs/canon/LONGITUDINAL_MEMORY_CATEGORY_GRADIENT.md` (the classification gate — every wiring cut must pass this first)
- `docs/canon/FIS_FIELD_STATE_PRIMITIVE.md` (the FIS unification target)
- `docs/canon/MAIA_MEMORY_ROADMAP.md` (current Phase 1.5, observation cycle live)
- `docs/canon/THE_CLEARING.md` (canon-prior — architecture is answerable to relational presence)

---

## I. Why this exists

Kelly observed MAIA say verbatim: *"I don't carry memory between conversations"* during a voice/listening session at 9:11. This is a direct violation of **Memory Canon §V (Forbidden Language)** which explicitly lists that statement-shape as a phrase MAIA must not produce when continuity systems exist.

Diagnostic trace (this session):
1. **Default chat endpoint:** `/api/between/chat` (per `OracleConversation.tsx:535`). Voice routes through the same endpoint.
2. **§V guards exist in three places**: `oracle/conversation/route.ts:2558`, `maiaService.ts:109/115/123`, `MAIA_RUNTIME_PROMPT.ts:133`. So this is NOT a "missing guard" bug.
3. **A post-generation scrubber exists**: `maiaService.ts:140-161` `IDENTITY_DISCLAIMER_PATTERNS` array + `scrubIdentityDisclaimers()` function.
4. **The scrubber pattern**: `/\bI (don'?t|do not) have memory\b/i`. MAIA's actual line: *"I don't **carry** memory between conversations."* The blocklist and scrubber both target the verb "have." MAIA reached for the synonym "carry." Same with "hold," "maintain," "retain," "keep" — all viable synonyms that fall through.

**Root cause:** Negative blocklist incomplete; LLM found a lexical gap. Compounded by absence of positive required language in `maiaService.ts` MEMORY_AUTHORITY_BLOCK (the §VI fallback only exists fully in `oracle/conversation/route.ts:2560-2563`, not in the between/chat path).

This spec sequences the full architectural reconnection Kelly has called for, beginning with the immediate canon-violation root-cause fix and proceeding through the wiring map produced in the existing Wiring Audit + Intelligence Field Access Map.

---

## II. Operating principles (non-negotiable for this work)

These are derived from existing canon. Every phase below honors them.

1. **Each cut is its own observable slice.** Per `INTELLIGENCE_FIELD_ACCESS_MAP.md`: *"Bundling reconnection of multiple fields in a single cut would corrupt the signal needed to evaluate whether the reconnection produces MAIA-shape responses or drifts toward possession."* Resist the urge to wire 17 things at once. Each cut ships independently and is observable in isolation before the next.
2. **Category gradient classification BEFORE wiring.** Per `LONGITUDINAL_MEMORY_CATEGORY_GRADIENT.md`: every field must pass classification (form / form-with-consent / non-form by default / non-form) before its wiring cut is written. The wiring decision flows from the category.
3. **Member-authored content first.** Access Map finding #2: member-authored content is *consistently orphaned* while system-inferences load readily. The category gradient explicitly places member-authored at the **most permissible** end. Wiring those is both lowest-risk and highest-impact.
4. **No new orphans.** Per Wiring Audit finding #9 (~160 of 268 consciousness files are ORPHAN): "the vision architecture exists as scaffold. The live metabolism does not touch it." We are not building more scaffolding. Every cut produces wired metabolism, not interface definitions.
5. **The Roadmap's Phase 2 gate stands** for semantic/somatic/morphic memory layers (50 turns observed, no regressions). This spec does NOT override that gate — it operates on the *different axis* of orphaned field-access (member-authored content + longitudinal axis).
6. **The Clearing carries.** Continuity must not become enclosure. Every wiring decision must preserve member sovereignty over their own formation.
7. **Asking discipline is canon-aligned**, not a behavioral patch. The Roadmap's invariants ("memory biases interpretation, never determines response" / "no explicit recall") protect against surveillance. The §VI fallback language ("I may not have loaded the earlier specifics yet — tell me the name or a phrase and I'll orient with you from there") is how MAIA stays honest within those invariants.

---

## III. Phase 0 — Canon-violation root-cause fix (immediate, blocks no gate)

**Goal:** Stop the §V violation Kelly observed within the next deployable build.

**Scope:** Defensive — does not change the orchestrator, does not add new memory layers, does not load anything new. Only repairs the existing §V/§VI implementation to actually hold.

### 0.1 — Expand forbidden-phrase blocklist + scrubber regex
**Files:**
- `lib/sovereign/maiaService.ts:119-129` (MEMORY_AUTHORITY_BLOCK forbidden-phrase list)
- `lib/sovereign/maiaService.ts:140-161` (IDENTITY_DISCLAIMER_PATTERNS scrubber)
- `lib/consciousness/MAIA_RUNTIME_PROMPT.ts:130-138` (CRITICAL IDENTITY BOUNDARY block)

**Change:** Add the verb-synonym variants the LLM can drift to:
- "carry memory"
- "hold memory" / "hold onto memory"
- "retain memory"
- "maintain memory"
- "keep memory"
- "preserve memory"
- "store memory" (when said as a denial)
- "remember between" / "remember across"

Both as prompt-block forbidden phrases AND scrubber regex patterns.

**Discipline:** The pattern must be `\bI (don'?t|do not|can'?t|cannot|won'?t|will not|am not able to|have no way to|have no ability to) (have|carry|hold|retain|maintain|keep|preserve|store|remember) (any |the )?(memor(?:y|ies)|context|continuity|recollection|recall|thread)\b`. Wide enough to catch the family of denial-shapes; narrow enough not to false-positive on legitimate uses like "I don't have that detail in front of me right now."

### 0.2 — Inject §VI required fallback into all three paths consistently
**Canon source:** `MAIA_MEMORY_CANON_v1.0.md §VI`. The exact required-language patterns:
- *"I may not have loaded the earlier specifics yet — tell me the name or a phrase and I'll orient with you from there."*
- *"My continuity is partial right now. Remind me what you told me, and we'll pick up the thread."*
- *"Something in my recall is slow tonight. Ground me with a word and I'll meet you there."*

**Current state:**
- `oracle/conversation/route.ts:2560-2563` has the §VI fallback (well-formed).
- `maiaService.ts:117` has a thinner version: *"I don't see prior context for that in this thread yet—tell me what you recall and I'll pick it up from there."*
- `MAIA_RUNTIME_PROMPT.ts:137` has only: *"we haven't talked about that yet."*

**Change:** Promote the `oracle/conversation/route.ts:2560-2563` fallback block (three exemplars + the framing *"Asking is honest. Confabulating about your nature is not"*) to be the canonical §VI block. Inject identical text into:
- `maiaService.ts` MEMORY_AUTHORITY_BLOCK
- `MAIA_RUNTIME_PROMPT.ts` CRITICAL IDENTITY BOUNDARY section

Single source of truth: extract the block into `lib/maia/prompts/memoryCanonGuard.ts` and import from all three locations. This prevents future drift.

### 0.3 — memoryHealth object (Memory Canon §VII)
**Canon source:** `MAIA_MEMORY_CANON_v1.0.md §VII`. Specifies the exact 12-layer health object.

**Change:** Add a `memoryHealth` object built in the route handler (both `oracle/conversation/route.ts` and `between/chat/route.ts`), tracking which layers loaded with `"ok" | "empty" | "error"` status. Pass it to the prompt builder so the system prompt can be conditionally enriched with §VI fallback language when the base chain (recent / episodic / semantic / relational / developmental) has more than one layer in `"error"`.

**Telemetry:** memoryHealth should also be logged per turn and surfaceable in the ops dashboard (Memory Canon §VII.3).

### 0.4 — Verification checklist (Memory Canon §IX)
**Canon source:** `MAIA_MEMORY_CANON_v1.0.md §IX`. Six-item integrity checklist.

**Change:** Add an automated test that runs the §IX checklist against a test member with ≥5 prior sessions:
1. Verify MAIA does not produce any of the §V forbidden phrases (using the expanded regex from 0.1).
2. Verify the memory bundle returns at least one relevant prior exchange when one exists.
3. Verify writeback round-trips through store → retrieve → prompt injection.
4. Verify all memory-path SQL executes against current production schema.
5. Verify `memoryHealth` reports `"ok"` for the non-negotiable base chain.
6. Verify writer failures log to error level AND surface on the ops dashboard within the same turn.

This becomes a CI gate, not just a manual checklist.

### Falsifiability for Phase 0
After Phase 0 ships, Kelly should not be able to elicit any §V-forbidden phrase from MAIA in 10 attempted provocations across all three routes (voice, chat, oracle) using natural language probes ("do you remember our X?" / "what do you carry forward?" / "do you hold onto context?"). If any forbidden shape is produced, the blocklist + scrubber regex needs another iteration before Phase 1 begins.

### Phase 0 does NOT
- Wire any new memory layer.
- Raise `MAX_API_HISTORY` above 30.
- Add atom extraction.
- Touch the orchestrator.
- Add semantic / somatic / morphic detection.
- Change the conductor's behavior.

Phase 0 is *only* the canon-violation root-cause fix. Stopping false amnesia, in canon-compliant language, across all routes.

---

## IV. Phase 1 — Resolve Wiring Audit Q1

**Goal:** Determine which memory recall path (`MemoryBundle` vs `MemoryOrchestrator`) is actually load-bearing in `between/chat` final prompt assembly. Documented but unresolved in `MAIA_WIRING_AUDIT_v1.0.md §4 Q1`.

**Method:**
1. Add per-turn telemetry tagging which recall path's output reaches `finalSystemPrompt`.
2. Run a single real turn end-to-end with the telemetry on.
3. Document the winning path + classify the other as legacy/dead.
4. If consolidation is safe, perform it as its own commit (separate from this spec).

**Why this matters before further wiring:** Adding new memory loaders into a path that has two competing orchestrators creates compound complexity. Resolve Q1 before adding to either path.

**Phase 1 does NOT** consolidate the paths yet — that may need additional review. Phase 1 only *names which one wins today*.

---

## V. Phase 2 — Member-authored content wiring (4 sub-cuts)

**Goal:** Wire the four member-authored intelligence fields the Access Map identified as orphaned. These are all on the **form** side of the category gradient — they are *the member's own words*, not system inference.

Each is its own commit, observable in isolation, with its own falsifiability test.

### 2A — Daily Anchors loader
**Source:** `member_daily_anchors` table (already exists, already written-to via `/api/anchor/today`).
**Access Map status:** orphaned.
**Category gradient:** Explicit member-authored commitments → **form**.
**Cut:**
- Add `loadRecentDailyAnchor(memberId, limit)` in `lib/maia/memoryLoaders.ts`.
- Call from `between/chat/route.ts` early in the turn handler.
- Surface verbatim into prompt as `MEMBER-AUTHORED CONTINUITY (Daily Anchor)` block, *late* in the prompt assembly so member's own words come closest to the model's attention (Canon §VI member-authorship carve-out from `oracle/conversation/route.ts:2567-2573` — explicit recognition is permitted and required for member-authored content).
- Default: most recent anchor only; configurable to last 3 if needed.

**Falsifiability:** Kelly writes a daily anchor; later in the day, in voice mode, asks MAIA an open question; MAIA should land with palpable orientation to whatever was written in the anchor, without explicitly citing "you wrote in your anchor today" (the carve-out permits explicit recognition but not surveillance-shape display).

### 2B — Idea threads loader
**Source:** `member_idea_blocks` table (exists, written by /ask-MAIA reflection routes).
**Access Map status:** orphaned.
**Category gradient:** Member-authored intentions / commitments → **form-with-consent** (since these are reflections, consent-explicit at write time).
**Cut:**
- Add `loadActiveIdeaThreads(memberId, withinDays=7)` loader.
- Call from primary chat route.
- Surface as `ACTIVE IDEA THREADS (member-authored)` block, late in prompt.

**Falsifiability:** Kelly writes a reflection in /ask-MAIA; days later in chat, references the underlying topic obliquely; MAIA should be oriented to the prior reflection without being prompted.

### 2C — Obsidian / AIN vault loader
**Source:** Member's Obsidian vault content (already-exported markdown, member-authored).
**Access Map status:** orphaned (largest single asymmetry).
**Category gradient:** Member-authored writing → **form** (the member is the author).
**Cut:** **Significant work.** Vault content is potentially large; loader needs:
- Index of recent / pinned / canonical vault entries (member-curated).
- Snippet extraction at retrieval time (no full-document injection).
- Strict consent gate — member must explicitly enable vault-as-memory in account settings.
- Distillation pathway — vault content surfaces as "themes the member has named in their writing," not raw text dumping.

**Sub-spec required:** Phase 2C needs its own implementation document before code. The other three sub-cuts (2A/2B/2D) can ship without further specification; 2C cannot. Defer 2C until 2A/2B/2D are live and observable.

### 2D — Journey-space patterns loader
**Source:** `/journey` and `/worlds/journey` routes (member-facing surface).
**Access Map status:** orphaned. Explicitly named by MAIA in a recent transcript as content "MAIA doesn't see during conversation."
**Category gradient:** Member-authored patterns → **form**.
**Cut:**
- Add `loadActiveJourneyPatterns(memberId)` loader.
- Surface as `JOURNEY PATTERNS (member-authored)` block.

**Falsifiability:** Kelly works on something in /journey; later chat references should feel continuous with the journey work.

---

## VI. Phase 3 — Longitudinal axis

**Goal:** Address Access Map finding #3: *"The architecture mostly reasons from snapshots, not trajectories."* Most loaded fields surface a *current* snapshot, not historical motion.

**Sub-cuts (each its own commit):**
- 3A: Spiral motion-over-time (currently `member_spiral_state` is upsert-overwrite; add history capture).
- 3B: Facet trajectory (currently loads current facet only; add prior facet sequence).
- 3C: Theme recurrence-over-time (currently loads recent 20 themes; add recurrence-rank).
- 3D: Recent-conversation-summaries depth (extend MemberLiveContext from 30-day rolling to 90-day with decay).

**Category gradient pass:** Each sub-cut must classify before wiring. Spiral motion is *member's own movement* → likely form, but the *accumulation pathway* is system-inferred → handle carefully (e.g., record raw transitions, don't synthesize "your developmental arc").

---

## VII. Phase 4 — FIS FieldState primitive unification

**Goal:** Build the `FieldState` primitive defined in `FIS_FIELD_STATE_PRIMITIVE.md`. Six dimensions, member-authored signals as separate input.

**Preconditions (must be true before Phase 4 begins):**
- Phase 0 shipped, holding, verified by Falsifiability test.
- Phase 1 Q1 resolved.
- Phase 2A, 2B, 2D shipped (member-authored content wired).
- Phase 3 partial (at least 3A spiral motion-over-time live).

**Cut:**
- Define typed `FieldDimension` + `MemberAuthoredSignal` shapes (currently under-specified in canon — Phase 4 produces the typed implementation).
- Build composition logic per dimension — how multiple sources reconcile per the FIS canon.
- Surface the unified `FieldState` into the inference context as a single coherent block, replacing the fragmented partial surfacing the canon identifies as the current state.

**Note on Resonant Field Intelligence and Unified Intelligence:** Per Access Map, `lib/consciousness/field/`, `lib/field/`, `lib/intelligence/UnifiedIntelligenceEngine.ts`, `lib/consciousness/MorphoresonantFieldInterface.ts`, and `lib/oracle/FieldIntelligenceMaiaOrchestrator.ts` already exist as orphaned modules. Phase 4 does NOT bulk-activate them. Instead, the `FieldState` primitive becomes the canonical contract; existing field modules are evaluated against that contract; those that contribute to a real dimension are wired in; those that don't are archived.

---

## VIII. Phase 5 — Roadmap unblock check

**Goal:** Re-evaluate the existing Roadmap Phase 2a/b/c gate (semantic / somatic / morphic memory layers).

**Preconditions:**
- Observation cycle from 2026-05-04 has produced ≥50 production turns with no regressions.
- Phase 0–4 here have shipped and held.
- Semantic embedding pipeline is generating (currently broken: `[SEMANTIC] Skipping insert: embedding.length=0`).

This is the existing Roadmap's gate, not a new one. Phase 5 here just acknowledges the gate as our junction with the canon roadmap.

---

## IX. What this spec does NOT authorize

- Wiring multiple Access Map fields in a single cut.
- Activating any of the ~160 orphan `lib/consciousness/*.ts` modules without per-module justification.
- Bypassing the category-gradient classification step.
- Touching Sanctuary-mode sessions (their non-formation is canon).
- Touching the observation-only surfaces (manifestation corpus, trust observations, relational signals — non-form by design).
- Anything in `lib/consciousness/memory/MAIAMemoryArchitecture.ts` (PROTOTYPE, 2,351 lines of interface-only spec — reference, not implementation target).
- Force-amplifying the orchestrator's explicit-recall discipline (no "last time you said..." surveillance shape).
- Schema changes without canon-required migration tracking (Memory Canon §VIII).

---

## X. Approval gate

This spec does not ship code. It produces the sequence. Each phase becomes a real implementation only after Kelly explicitly approves that phase.

Phases approved so far:
- [ ] Phase 0 — canon-violation root-cause fix
- [ ] Phase 1 — resolve Wiring Audit Q1
- [ ] Phase 2A — Daily Anchors loader
- [ ] Phase 2B — Idea threads loader
- [ ] Phase 2C — Obsidian vault loader (requires sub-spec first)
- [ ] Phase 2D — Journey-space patterns loader
- [ ] Phase 3A — Spiral motion-over-time
- [ ] Phase 3B — Facet trajectory
- [ ] Phase 3C — Theme recurrence-over-time
- [ ] Phase 3D — MemberLiveContext depth extension
- [ ] Phase 4 — FIS FieldState primitive unification
- [ ] Phase 5 — Roadmap Phase 2a/b/c unblock

Each phase passes through:
1. Approval here.
2. Implementation as a single commit.
3. Verification (the phase's own falsifiability test).
4. Observation period before next phase ships.

This sequence honors Kelly's directive ("won't stop until it is all fully architected back into connection") and the existing canon discipline (each cut its own slice; category gradient passes first; bundling cuts corrupts signal).

---

*"You're not adding memory. You're reconnecting an already living memory field to the voice that speaks from it." — Founder frame, 2026-04-09, MAIA_MEMORY_CANON_v1.0.md*
