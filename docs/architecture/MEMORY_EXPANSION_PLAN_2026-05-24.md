# Memory Expansion Plan — 2026-05-24

**Date:** 2026-05-24
**Status:** Planning artifact. No runtime impact from this document.
**Authority chain:**
- Kelly directive 2026-05-24: *"yes I want full memory in all arenas in a safe but functional way. No more hardened rules against providing the one thing that makes soulful engagement possible and makes this platform more than a chat bot."*
- `docs/canon/MAIA_CANON_v1.1.md`
- `docs/canon/MAIA_OATH.md`
- `docs/canon/MAIA_SOVEREIGNTY_INVARIANTS.md`
- `docs/canon/SPIRAL_CONTINUITY_ENGINE.md`
- `docs/specs/CONVERSATIONAL_LAYER_PHASE_2_SPEC_2026-05-24.md`

## §0. Operating Doctrine

> **Safety serves memory. It does not replace it.**

Memory ships, with bounded provenance, corrigibility, and member-service as the safeguards — not as the blockers. The plan below maps every layer against the same dimensions so that future activation decisions land on shared structure, not on ad-hoc framing.

**Four invariant safeguards apply to every layer** (do not relax without explicit Kelly directive):

1. **Sanctuary Mode** — Sanctuary sessions structurally do not feed any retrieval. Defense-in-depth at the formatter level for each block.
2. **Provenance-grounded surfacing** — actual stored content / member-declared state, never synthesized summaries or system-inferred patterns.
3. **Member-marked salience only** — the system does not classify "what mattered." The member places; the system honors. (Pattern: `member_memory_atoms.is_breakthrough` only ever set by member action.)
4. **No identity synthesis** — no diagnosis, destiny arc, archetype stabilization, or "you always" phrasing. Bounded recall, structural framing, no cross-exchange theme claims unless the member names them first.

## §1. Activation Phase Vocabulary

Each layer is at one of these phases:

- **dormant** — service or table may exist; zero live consumers; not in substrate map's consumed claims.
- **observed-only (Phase 1)** — count or presence flag feeds `memoryHealth`; content does not influence prompt.
- **prompt-influencing (Phase 2)** — bounded content surfaces in the prompt with provenance + suppression rules.
- **member-marked salience (Phase 3)** — member can mark items as salient; marked items get preferential surfacing.
- **observed-runtime** — substrate monitor confirms okCount > 0 in production traffic across multiple members.

Activation transitions require: implementation + production deploy + runtime evidence (per `project_no_static_ui_claim_without_verified_state`) + explicit Kelly directive when crossing into prompt influence.

---

## §2. Layer-by-Layer Plan

### Conversational

| Dimension | State |
|---|---|
| Current state | **Phase 2 just shipped** (commit `987b3ff28`). Phase 1 = `3f0191231`. |
| Storage substrate | `conversation_turns` (existing) + `members.conversational_recall_enabled` (migration `20260524000001`) |
| Runtime consumer | `app/api/oracle/conversation/route.ts` — loads count + bounded content via `loadPriorCrossSessionExchanges` |
| Retrieval model | Structural: same member, different session, recency-ordered, `LEFT(content, 600)` per row, hard limit 6 |
| Prompt influence model | `lib/maia/conversationalRecallBlock.ts:formatPriorExchangesForPrompt` — Member/MAIA speaker tags, recency labels, explicit no-synthesis instruction |
| Provenance boundary | `session_id` + `created_at` internal; speaker tag visible; no thematic clustering |
| Consent semantics | Default-on opt-out (`conversational_recall_enabled DEFAULT TRUE`), Option 3 per spec §VII; matches `0fa544bc4` atoms default-flip pattern |
| Suppression rules | 4 rules: opt-out / Sanctuary (defense-in-depth) / empty / session-resumption (30min + <3 turns) |
| Member-visible value | Returning members don't re-explain context; threads from prior sessions pick up; felt continuity |
| Observability / logging | `[Oracle] conversational-block` log line with `{ emitted, surfacedCount, suppressedReason }`; `memoryHealth.conversational` count unchanged in shape |
| Next activation threshold | 3 distinct members in real (non-test) traffic with `emitted: true` across multiple sessions, per spec §VII row 6 |

### Episodic

| Dimension | State |
|---|---|
| Current state | **dormant** (built-unwired per substrate map; `EpisodicMemoryService.ts` exists, `consumers: []`) |
| Storage substrate | `episodic_memories` table exists; service preserved |
| Runtime consumer | none |
| Retrieval model | TBD — candidate: event-keyed by member-marked significant events; recency window; no automatic salience inference |
| Prompt influence model | TBD — should follow conversational Phase 2 shape (bounded block, provenance, no synthesis) when activated |
| Provenance boundary | `event_id` + `timestamp` + session_id; member-marked salience flag required (sibling of `is_breakthrough`) |
| Consent semantics | Default-on opt-out per conversational pattern; explicit `episodic_recall_enabled` column |
| Suppression rules | Sanctuary defense-in-depth; opt-out; empty; session-resumption; non-recent threshold (events older than configurable cutoff suppressed unless member-marked) |
| Member-visible value | Meaningful events recoverable without re-narration ("you mentioned the funeral was last week"); event-anchored continuity |
| Observability / logging | future `[Oracle] episodic-block` log line; `memoryHealth.episodic` count |
| Next activation threshold | Wait for conversational Phase 2 production verification (3 members threshold). Then Phase 1 (count-only) → observe → Phase 2 (prompt influence) → observe. Two-step, not one-step. |

### Semantic (atoms)

| Dimension | State |
|---|---|
| Current state | **prompt-influencing + member-marked salience** (Cut 1 live; breakthrough flag = commit `58d374334`; contextual_doorway default = `0fa544bc4`) |
| Storage substrate | `member_memory_atoms` (schema-enforced sovereignty: `CONSTRAINT crossing_must_be_false`, `CONSTRAINT breakthrough_flag_timestamp_coherent`) |
| Runtime consumer | `app/api/oracle/conversation/route.ts` (via `memoryAtomsLoader`) + `app/api/sovereign/atoms/[id]/breakthrough/route.ts` |
| Retrieval model | `return_preference IN (contextual_doorway, ritual_review_opt_in)`; ordered `is_breakthrough DESC, kept_at DESC`; bounded |
| Prompt influence model | `atomsContextBlock` injected into `finalSystemPrompt` (Cut 1); rendered with member's framing, no celebratory tone for breakthrough |
| Provenance boundary | `atom_id` + `kept_at` + `is_breakthrough` (member-marked only); rendered as *"marked as a breakthrough by the member"* |
| Consent semantics | Per-atom — `return_preference` enum, member can reseal anytime; default keeps atoms contextually returnable |
| Suppression rules | Sanctuary (atoms not loaded); `return_preference = sealed` suppressed; member can reseal mid-session |
| Member-visible value | "What mattered" surfaces without re-explaining; member-marked breakthroughs carry forward; coherence across sessions |
| Observability / logging | `[Oracle] atoms-block emitted` log line; `memoryHealth.semantic` count; `memoryHealth.breakthrough` flag |
| Next activation threshold | Cut 1 is observed-runtime. Cut 2 (cross-atom synthesis) is **explicitly refused** — violates `crossing_must_be_false`. Refinements only on retrieval ordering / saliency. |

### Developmental

| Dimension | State |
|---|---|
| Current state | **observed-only (Phase 1)** — `loadRecentDevelopmentalMemories` feeds count to `memoryHealth.developmental`; no prompt block |
| Storage substrate | Thematic memory tables (loader queries `directional_cue`, `facet_code`, `significance`, `formed_at`) |
| Runtime consumer | `app/api/oracle/conversation/route.ts` — count only |
| Retrieval model | Structural — recent thematic snapshots, bounded |
| Prompt influence model | Not yet built. If/when activated, must follow Spiral Continuity Engine canon (member-declared/confirmed only; cross-domain synthesis refused) |
| Provenance boundary | `formed_at` + `facet_code` + `directional_cue` + member-confirmation flag (must add before prompt influence) |
| Consent semantics | TBD — should mirror conversational consent gate; Spiral Continuity Engine requires member-confirmation as elevation gate, not just opt-out |
| Suppression rules | Sanctuary; opt-out; non-elevated themes (per SCE §II.B "non-formation register"); "you always" structurally forbidden |
| Member-visible value | Thematic continuity without prescription — recognition of what the member has been working with, surfaced as the member's words not as a developmental claim |
| Observability / logging | `memoryHealth.developmental` count; future `[Oracle] developmental-block` if/when Phase 2 |
| Next activation threshold | Conversational Phase 2 must stabilize first (proves prompt-influence pattern is sound). Then Spiral Continuity Engine elevation gate must be reviewed before any developmental block ships. High interpretive risk → highest care. |

### Relational

| Dimension | State |
|---|---|
| Current state | **prompt-influencing (limited)** — `MemberLiveContext.ts` wired; member-declared relationships available in context |
| Storage substrate | Relationships data (members + relationships tables) |
| Runtime consumer | `app/api/oracle/conversation/route.ts` |
| Retrieval model | Structural — member-declared relationships only |
| Prompt influence model | Already provides context (who's in member's life); not as separate block, integrated into runtime context |
| Provenance boundary | Member-declared only (relationship + role + name); system never infers relationships from conversation content |
| Consent semantics | Declaration IS consent; member can remove or rename |
| Suppression rules | Sanctuary; member-removed relationships suppressed; no inference from text |
| Member-visible value | MAIA knows who member means when they say "my partner" / "my mom" — continuity of relational context |
| Observability / logging | `memoryHealth.relational` (present/absent boolean) |
| Next activation threshold | Stable. Refinements only on shape of context surfacing — not on what gets stored. Schema-level: no system-inferred relationships ever. |

### Symbolic

| Dimension | State |
|---|---|
| Current state | **observed-only (Phase 1)** — `loadRecentThemeSignals` feeds count to `memoryHealth.pattern`; no symbolic block in prompt |
| Storage substrate | `member_theme_signals` (theme, signal_type, resonance_strength, element, detected_at) |
| Runtime consumer | `app/api/oracle/conversation/route.ts` — count only |
| Retrieval model | Structural — recent symbolic signal detections, recency-ordered |
| Prompt influence model | **Not yet built — highest interpretive risk among unactivated layers.** Spiral Continuity Engine §II.B "non-formation register" + archetypal stabilization refusal apply directly. Any future block must require member-confirmation gate before surfacing. |
| Provenance boundary | `theme_signal_id` + `detected_at` + element; **critical distinction**: system-detected vs member-evident must be tracked separately for surfacing eligibility |
| Consent semantics | TBD — likely Spiral State Object pattern (member-correctable, member-sealable, explicit confidence) rather than simple opt-out |
| Suppression rules | Archetypal stabilization refused; "you always" forbidden; cross-domain symbolic synthesis refused (per SCE); Sanctuary; member-sealed themes suppressed |
| Member-visible value | Recognition of recurring images/themes the member is *actually* working with — without the system claiming meaning over them |
| Observability / logging | `memoryHealth.pattern` count; future symbolic block log line |
| Next activation threshold | After conversational Phase 2 stabilizes AND developmental Phase 2 ships (proves the Spiral Continuity Engine elevation gate works in code). Symbolic ships LAST among interpretive layers, not first. |

### Somatic

| Dimension | State |
|---|---|
| Current state | **dormant** (`SomaticMemoryService.ts` exists, `consumers: []`) |
| Storage substrate | Service preserved; no schema for somatic capture yet defined |
| Runtime consumer | none |
| Retrieval model | TBD — must be member-articulated only; system NEVER infers somatic state from voice tone, text, or response patterns |
| Prompt influence model | Deferred — requires explicit somatic input mechanism before retrieval has any meaning |
| Provenance boundary | Member-stated, explicitly tagged as somatic; timestamp; no derivation chain from non-somatic data |
| Consent semantics | Required explicit per-entry opt-in; default-off (inverse of conversational); somatic data is highest-sensitivity tier |
| Suppression rules | Very strong — no inference allowed; no surfacing without explicit per-session permission; Sanctuary structurally excludes; no aggregation across entries unless member explicitly groups |
| Member-visible value | Body-felt patterns the member chooses to track over time — never imposed, never inferred |
| Observability / logging | `memoryHealth.somatic` only when explicit somatic capture mechanism exists; substrate row stays `dormant` until then |
| Next activation threshold | Deferred until explicit somatic input UI/mechanism is designed AND member-input is the only legitimate source. Not prompt-influence first — input mechanism first. |

### Field / Coherence

| Dimension | State |
|---|---|
| Current state | **dormant** + **doctrinally frozen** (per `project_observation_phase_freeze_doctrine`). `CoherenceFieldService.ts` exists; `QuantumFieldMemory.ts` is 0-persistence metaphor queued for rename+gut. |
| Storage substrate | Currently none (QuantumFieldMemory persists nothing); CoherenceFieldService not wired |
| Runtime consumer | none |
| Retrieval model | When activated, must be **operational** (drift detection, continuity weighting, contradiction detection across agents) NOT **mystical** (no "field is conscious" framing per `project_resonance_operational_not_mystical`) |
| Prompt influence model | Very narrow scope only — agent-coordination signals, not meaning generation. Should not surface to MAIA's voice; should influence routing/continuity infrastructure |
| Provenance boundary | Structural — agent signals only, never member content; no interpretive synthesis |
| Consent semantics | Member opt-in for any cross-agent coordination using their data; sub-system consent for routing influence |
| Suppression rules | Forbidden framing register: no "becoming coherent" / "field deepening" / "new phase" (per `project_substrate_monitor_three_layer_architecture` and substrate monitor's forbidden register) |
| Member-visible value | Indirect — routing coherence, reduced contradictions across agents, cross-agent continuity. **Infrastructural, not metaphysical.** |
| Observability / logging | Would need new substrate row with strict "infrastructural observability not metaphysical interpretation" framing; substrate monitor's three-layer architecture (telemetry / reconciliation / cautious insights) applies |
| Next activation threshold | Most-deferred of all layers. Requires: CoherenceFieldService bounded re-spec (currently `COHERENCE_FIELD_WIRE_UP_SPEC_2026-05-24.md` reframed to "mapping & deferred contract"); QuantumFieldMemory rename+gut; explicit Kelly directive lifting the observation-phase freeze. Episodic/somatic ship first; field ships only after the more-grounded layers stabilize. |

### Meta / Provenance

| Dimension | State |
|---|---|
| Current state | **observed-runtime** — `buildMemoryHealth` + substrate monitor live |
| Storage substrate | In-process per-turn aggregation + `runtime_events` table (DB-backed transport per `project_substrate_monitor_three_layer_architecture`) |
| Runtime consumer | `app/api/oracle/conversation/route.ts` via `MaiaRuntimeContext`; `app/api/admin/maia/substrate/route.ts` for read |
| Retrieval model | Per-turn aggregation; no historical replay (observation, not synthesis) |
| Prompt influence model | **Indirect** — degraded continuity changes prompt language per Canon §VI fallback; the system reports honestly, does not narrate over the report |
| Provenance boundary | Turn-bound; `runtime_events` rows include layer-status map per turn |
| Consent semantics | Meta is infrastructural — not subject to per-member opt-out. Monitors *health*, not surfaces member content. Sanctuary turns are flagged as such; member content stays out. |
| Suppression rules | Forbidden register on substrate monitor (no metaphysical interpretation, no "becoming coherent"); first wisdom must be boring; every observation references concrete number/file/absence |
| Member-visible value | Indirect — MAIA's response quality + accurate fallback language when continuity degrades; transparency at `/admin/maia/substrate` |
| Observability / logging | This layer IS the observability spine. `[MAIA/runtime]` log per turn + `runtime_events` DB rows + `/admin/maia/substrate` page |
| Next activation threshold | Stable. Each new layer activation adds a row to substrate map + a key to `MemoryHealthInputs` + a per-turn `memoryHealth.<layer>` write. Substrate monitor expands as new layers come online; no separate activation needed. |

---

## §3. Cross-Layer Principles

1. **Phase ordering is structural, not preferential.**
   Conversational ships first because it has the cleanest provenance (literal text, session boundary, recency). Episodic ships second because events have clear provenance but interpretive risk is higher. Semantic (atoms) is already shipped because the schema enforces member-marked salience. Symbolic and field ship last because interpretive risk is highest.

2. **Prompt influence requires a verification gate before being declared functioning.**
   No layer is "live" because the code shipped. A layer is live when production runtime evidence shows the block emitting under real member traffic, across multiple members and sessions. The conversational Phase 2 threshold (3 distinct members, multiple sessions, `emitted: true`) is the template.

3. **Two-step activation per layer.**
   Every layer should pass through observed-only (Phase 1, count/presence only) before prompt-influencing (Phase 2, content surfacing). Phase 1 verifies the substrate is wired and produces observation rows; Phase 2 introduces interpretive risk and requires the four safeguards. Skipping Phase 1 means activating prompt influence before knowing the layer fires at all in production.

4. **Consent gate pattern is reusable.**
   Conversational established the pattern: `members.<layer>_recall_enabled BOOLEAN DEFAULT TRUE`, default-on with opt-out + disclosure, matching the atoms `0fa544bc4` default-flip. Episodic, developmental, symbolic, and somatic should each add their own column (somatic inverted: `DEFAULT FALSE`).

5. **Suppression rules are layer-specific but share a baseline.**
   Every layer suppresses on: opt-out / Sanctuary defense-in-depth / empty / session-resumption (where applicable). Layer-specific additions reflect interpretive risk profile (e.g., symbolic adds member-confirmation gate; somatic adds per-session permission).

6. **Sanctuary Mode is the absolute boundary.**
   Sanctuary sessions structurally do not feed any retrieval, do not write any layer-relevant rows, do not surface in any block. Defense-in-depth means the formatter for each layer also refuses to emit if Sanctuary mode is asserted, even if upstream filters should have caught it. This is the one safeguard that does NOT relax with the directive's reframe.

7. **Provenance is the design constraint, not the implementation detail.**
   Every prompt block must render the member's words / member's marks / member-declared state. The system reports recency and speaker; the member retains meaning. Anything that synthesizes across exchanges, infers themes the member did not name, or claims continuity the member did not declare is doctrine violation regardless of how useful it might feel.

---

## §4. Verification Cadence

Per spec §IV and `project_no_static_ui_claim_without_verified_state`:

- **Phase 1 verification:** runtime log evidence of count being fed at the call site for ≥1 turn.
- **Phase 2 verification:** runtime log evidence of block emission for ≥3 distinct members in real (non-test) traffic across multiple sessions.
- **Felt-continuity verification:** qualitative — Kelly + members observe whether responses actually carry continuity, whether returning members feel remembered without feeling captured.

Verification gates per layer should be declared in the layer's spec doc BEFORE the layer ships, not after.

---

## §5. What This Plan Does Not Authorize

- It does **not** authorize lifting the freeze on any layer beyond conversational.
- It does **not** authorize cross-layer synthesis (e.g., "this conversational exchange relates to this developmental theme") at this time.
- It does **not** authorize member-facing UI for any layer (each layer's spec must propose UI separately).
- It does **not** authorize relaxing the four invariant safeguards.
- It does **not** authorize semantic/vector ranking on any layer (recency-only ordering remains).

Each subsequent activation requires its own spec doc, locked-answer table (per spec §VII pattern), and explicit Kelly directive.

---

## §6. Closing

The shift from observation-phase freeze to functional memory does not abandon discipline — it relocates it. The discipline is no longer *"refuse to wire memory until evaluation surfaces exist."* It is *"every wire-up ships with provenance, consent, suppression, and observability built in, so the safeguards serve the memory and never block it."*

The plan above maps the path. Activation timing remains a separate decision per layer; Kelly directive is the only lift.

> *Safety serves memory. It does not replace it.*
