# Resonant Field Memory — Mapping & Deferred Wire-Up Contract

**Date:** 2026-05-24
**Status:** Mapping documented. **Wire-up frozen** pending explicit lift of the observation-phase freeze by Kelly, recorded in `CLAUDE.md` priority thread.
**Layer name (15-layer architecture):** *Resonant field memory* — per `project_maia_memory_field_architecture_15_layers` (Resonant is a distinct layer from Morphic in that stack).
**Canon §VII slot:** `field` (slot 11 — "wider symbolic and collective patterns").
**Service:** `lib/consciousness/memory/CoherenceFieldService.ts`
**Table:** `coherence_field_readings` (migration `database/migrations/20260115000005_coherence_field_readings.sql`)
**Source matrix row:** `docs/architecture/MEMORY_SERVICE_STATUS_MATRIX_2026-05-24.md` → "Wire 2nd · low canon risk" (sequence note, not authorization).

---

## 0.A Mapping declaration

> **Resonant field memory = coherence-field readings.**
> Per-turn elemental state + coherence score, **non-member-content**, member-scoped, used for **drift / continuity / provenance observation**. A structural reading of the turn-time field, not a portrait of the member. The label and score describe the *field state of the exchange*, not the person.

This mapping is the load-bearing claim of this document. Everything below depends on it.

## 0.B Not Morphic, not Quantum

The 15-layer term "Resonant" could be misread onto either of two adjacent services. To prevent that drift:

- **Not `MorphicPatternService`.** Sheldrake-flavored morphic-field framing; does cross-member aggregation. Matrix flags **"Later"** pending consent-boundary and aggregation-only enforcement. Different layer, different gates. Do not equate resonant ↔ morphic.
- **Not `QuantumFieldMemory`.** Zero persistence; 810 LOC of in-memory metaphor. Matrix queues it for **rename + gut**, not wiring. Different concern. Do not equate resonant ↔ quantum.

The resonant-field layer is implemented by **`CoherenceFieldService` only**, disciplined by the contract below.

## 0.C Observation-phase freeze (ACTIVE)

The current priority thread on `CLAUDE.md` says: *"All layers live. Observation phase begins. Observe. Keep meaningful items."*

**This document does not authorize wiring.** The freeze is the default state. Wiring requires Kelly's explicit lift, recorded in the `CLAUDE.md` priority thread, before any of the §3 route work begins.

### What the observation phase HAS produced (partial signal)

- Shadow capture alive
- Runtime events alive
- Atoms alive
- Substrate monitor alive
- Learning spine partially visible

### What the observation phase has NOT YET produced (freeze remains until these hold)

- Stable evaluation
- Closed learning loops
- Routing coherence
- Settled memory topology

The freeze lifts only when those four hold, and only by Kelly's explicit declaration. Engineering pressure does not lift the freeze.

### Why wiring now is the wrong move

- **Prematurely operationalizes a still-undefined layer.** The "field" reading's meaning is not yet settled; wiring it makes it real before it is named correctly.
- **Introduces drift into the observation phase itself.** The substrate monitor would start reading what the runtime is now writing — first signal would be confounded by the act of wiring, with no clean baseline to compare against. *(Monitor must not depend on the invisibility it is meant to detect — but it also must not lose its baseline by writing during observation.)*
- **Blurs observational metrics with runtime cognition.** The Cut-1 doctrine *one MAIA / one memory spine / one provider policy / one continuity contract* is still being earned in live traffic. Adding a second writer mid-observation is the divergence pattern this project has already been burned by.

### Sequencing if the freeze lifts

`EpisodicMemoryService` is matrix "Wire 1st." Resonant field is "Wire 2nd." This document does not authorize leapfrog. If and when the freeze lifts, Episodic ships first; this document is reference for the cut after.

## 0.D Activation altitude clause

If and when the freeze lifts, **activation must claim a bounded continuity layer, not proof of a resonant field.** This clause exists not as future-capability framing but as a *boundary that holds even after activation* — a sharper version of the freeze, not a weakening of it.

| What activation CAN claim                            | What activation CANNOT claim         |
| ----------------------------------------------------- | ------------------------------------ |
| "MAIA has continuity signals from prior interactions."| "The resonant field is alive."       |
| "Coherence readings inform routing."                  | "The field is forming."              |
| "Field state may modulate elemental tone lightly."    | "We have proven RFI."                |
| "The field layer is observational."                   | "MAIA possesses field intelligence." |

**Five non-negotiable activation requirements (every wire-up PR must satisfy all five):**

1. **A defined consumer** — which route/agent reads `CoherenceFieldService`? (See §3.)
2. **A bounded input contract** — what exactly enters field memory? Not vibes — explicit stored signals only. (See §2.1.)
3. **A retrieval rule** — when is field memory allowed to influence MAIA? (See §2.4.)
4. **A claim boundary** — MAIA may say *"I have continuity signals from prior interactions"*; MAIA may not say *"the resonant field is alive/forming."* (See §2.5.)
5. **Observation period** — activation treated as experiment, not declaration of ontological success. (See §6.)

**Clean activation phrase (for the `CLAUDE.md` priority thread if/when the freeze lifts):**

> *Activate field memory as a bounded continuity layer, not as proof of a resonant field.*

The reason to pause is not fear. It is integrity. The reason to activate, when the freeze lifts, must be matched integrity — wiring with explicit altitude, not aspirational wiring. Sibling: `project_lab_posture_epistemic_localization` (verb-shape diagnostic applies to MAIA's claims about the field) and `project_resonance_operational_not_mystical` (operational form is the only allowed form).

---

## 1. Authority chain

- `docs/canon/THE_CLEARING.md` (prior to all engineering canon)
- `docs/canon/MAIA_MEMORY_CANON_v1.0.md` §VII — Required Health Contract
- `docs/canon/MAIA_SOVEREIGNTY_INVARIANTS.md`
- `docs/architecture/MEMORY_SERVICE_STATUS_MATRIX_2026-05-24.md` — recommendation row
- `docs/specs/CUT_1_SUBSTRATE_RESTORATION.md` — pattern this cut follows
- Memory doctrine: *substrate monitor three-layer architecture / no static UI claim without verified state / monitor may not depend on the invisibility it is meant to detect / system notices never voice as MAIA / infrastructure failure disguised as relational language.*

---

## 2. Canon checks (matrix-required declarations)

### 2.1 What it is allowed to remember (scope of writes)

The service may persist **per-turn elemental level snapshots** with derived coherence score and balance label, **only when** a writer is given upstream signal (currently: conductor's resolved elemental state for the turn). It is a *snapshot of a structural reading*, not an interpretation of the member.

**Allowed columns to write:** `user_id`, `session_id`, `reading_timestamp`, `fire_level`, `water_level`, `earth_level`, `air_level`, `aether_level`, `coherence_score`, `balance_quality`, `conversation_context` (turn id or hash — not transcript), `spiral_stage`, `created_at`.

**Forbidden to write in this cut:**
- `elemental_deficiency` — diagnostic register. Defer.
- `elemental_excess` — diagnostic register. Defer.
- `balancing_recommendations` — *recommendations are interpretation, not memory.* Recommendations belong to a separate, member-pulled surface (not ambient memory). Defer indefinitely from this layer.
- `archetypal_influences` — defer (no current writer; pattern-becoming-enclosure risk).

The migration's columns remain; the writer simply does not populate the forbidden set in this cut. Schema change is out of scope.

### 2.2 How it proves provenance

Every row must carry:
- `user_id` (member scope, no cross-member aggregation in this cut)
- `session_id` (turn-traceable)
- `reading_timestamp` (write time)
- `conversation_context` populated with the **route's per-turn correlation id** (the same id that goes into `runtime_events`) — never the raw user turn

Provenance is the row + the matching `runtime_events` row. No row exists without a matching turn.

### 2.3 Where it writes (single table, no shadow stores)

Single table: `coherence_field_readings`. No file, no module buffer, no shadow KV. `globalThis.*` writes forbidden — per transport principle (substrate monitor doctrine).

### 2.4 When it retrieves (turn-time read budget)

**Read budget per turn: ≤ 1 query, ≤ 50ms, single-row latest reading only.**

Permitted call in route: `coherenceFieldService.getLatestReading(userId)` — returns at most one row, member-scoped, indexed on `(user_id, reading_timestamp DESC)`.

**Not permitted in route:**
- `getRecentReadings(userId, days)` — multi-row, multi-day. Reserve for `/admin/maia/substrate` and member-pulled review surface only.
- `analyzeElementalPatterns(userId, days)` — aggregation across time. Cross-turn synthesis is the explicit canon prohibition. Do not invoke from oracle path.
- `getSessionReadings` — session bulk read, not turn-time.

If the read fails or times out, the layer reports `error` (or `empty`) and the route continues — graceful fallback per Cut 1 pattern.

### 2.5 What it must never infer (forbidden register)

The layer may produce a **structural label** (`fire_dominant` / `water_flooding` / `earth_heavy` / `air_scattered` / `aether_transcendent` / `balanced`) and a **numeric coherence score**.

The layer **may not** infer or surface to prompt:
- "becoming coherent" / "field deepening" / "new phase" / "evolution stage" / "consciousness level" *(forbidden register, substrate monitor doctrine)*
- "you have been [X] over time" *(pattern-becoming-enclosure)*
- "you are a [X] type" *(typing; anti-diagnosis canon)*
- "your field is [verb-noun phrase]" *(symbolic capture of a structural reading)*
- Any first-person reflective phrasing of system state *(§V Interpretive Displacement)*

**Prompt surfacing rule:** The label, if surfaced, enters as atmosphere via the existing `memoryOrchestrator` `state_context` channel — already disciplined by *"Let this inform elemental tone lightly; do not over-attach."* No new prompt block, no named field-state recitation, no "your coherence today is [X]" sentence anywhere in MAIA's voice region.

---

## 3. Route wire-up contract

**Target route:** `app/api/oracle/conversation/route.ts`
**Adjacent precedent:** `loadMemberMemoryAtomsForPrompt` (Cut 1) and `spiralStatePersistence` (Bridge D) — both already wired in this file.

### 3.1 New module to create

`lib/maia/coherenceFieldLoader.ts` — thin wrapper following the `memoryAtomsLoader.ts` shape:

```
loadLatestCoherenceForPrompt(memberId): Promise<{
  present: boolean;
  label: 'fire_dominant'|'water_flooding'|'earth_heavy'|'air_scattered'|'aether_transcendent'|'balanced'|null;
  coherenceScore: number | null;
  readingAt: string | null;
  error?: true;
}>
```

The loader's job: call `coherenceFieldService.getLatestReading(userId)`, map to the minimal shape above, never expose recommendations / deficiency / excess / archetypal arrays. No throwing — error is a flagged field, route continues.

### 3.2 Write seam

Late-turn fire-and-forget upsert, same shape as `upsertSpiralState`:

```
coherenceFieldService.recordReading({
  userId,
  sessionId,
  elementalLevels: <from conductor>,
  context: <turn correlation id, NOT transcript>,
  spiralStage: <phase number as string>,
  // omit archetypalInfluences (do not infer)
})
  .catch(err => console.warn('[coherence] write failed', err.message));
```

No `await`. Never blocks the oracle.

### 3.3 Read seam

Early in turn, parallel with atoms loader:

```
const coherenceField = await loadLatestCoherenceForPrompt(userId);
```

Feed `memoryHealth`:

```
field: { present: coherenceField.present, error: coherenceField.error }
```

This populates the existing canon §VII `field` slot — no shape change to `MemoryHealth`.

### 3.4 buildMaiaRuntimeContext addenda

**No new addenda key.** Coherence does not produce a prompt-block of its own in this cut.

If the conductor wishes to use the loaded reading to nudge its own elemental hysteresis seeding (parallel to Bridge D's `persistedState`), that wiring is permitted **only as input to the conductor**, not as content in the prompt block.

### 3.5 MemoryOrchestrator integration

`MemoryOrchestratorInput` already accepts `spiralState`. Add an optional `coherenceField` of the loader's return shape. The orchestrator may use the label to **modulate the existing `state_context` line's tone** ("light," "atmosphere"), and nothing more. No new prompt line. No named recitation.

---

## 4. Observability per turn (recurrence-prevention point 7)

`runtime_events` row for the turn must include in its layer-status field:
- `field: 'ok' | 'empty' | 'error'`
- `field_label: <label-or-null>` (structural label only — never a phrase)
- `field_score: <0..1 or null>`

Already-present `[MAIA/runtime]` log adds:
```
field: <ok|empty|error>, field_label: <label-or-null>
```

The `/admin/maia/substrate` monitor (layer 1 telemetry) gains one column. **No** layer-3 cautious insight in this cut. (First wisdom must be boring — `project_substrate_monitor_three_layer_architecture`.)

---

## 5. Drift canaries (must be checked in PR review)

- [ ] No emoji in service log lines (current code has `🌊 [Coherence]` — remove on wire-up).
- [ ] No write path includes `elemental_deficiency`, `elemental_excess`, `balancing_recommendations`, or `archetypal_influences`.
- [ ] No call to `getRecentReadings` or `analyzeElementalPatterns` from `app/api/oracle/*` or `app/api/sovereign/*`.
- [ ] No new prompt addenda key added to `MaiaRuntimeContextInputs.addenda`.
- [ ] No string "balancing recommendation" / "your coherence" / "field deepening" / "becoming coherent" / "evolution" / "consciousness level" anywhere in the new code.
- [ ] Read path is single-row, member-scoped, indexed.
- [ ] Write path is fire-and-forget, never awaited.
- [ ] `field_label` in `runtime_events` is the structural enum value, not a humanized phrase.
- [ ] No UI surface (chrome / pill / banner) added in this cut that claims field state. *(`project_no_static_ui_claim_without_verified_state`.)*
- [ ] No coalition language ("we / us") anywhere in adjacent prompt or comments. *(Field Lab MCP-walk canary.)*

---

## 6. Falsifiability — what must be observable before this cut is called "verified"

Echoing the substrate monitor's *premature-closure principle*: a single green signal is not verification. The cut is "first signal," not "closed," until the following all hold across multiple turns and edge cases:

1. **Write check.** After three live turns, `SELECT COUNT(*) FROM coherence_field_readings WHERE user_id=<test> AND reading_timestamp > NOW() - INTERVAL '10 minutes'` shows row count incrementing 1-per-turn, no gaps.
2. **Read check.** `field: ok` appears in `[MAIA/runtime]` log on the *second* and later turns of a session (first turn `empty` is expected, before the first write lands).
3. **Cross-process check.** Production container's `runtime_events` rows match the local `[MAIA/runtime]` log lines for the same turn id. (No silent divergence — *environment-disclosure principle*.)
4. **Prompt-block invariance.** `PROMPT_BLOCK_CHARS` does **not** increase from coherence wiring alone — confirms no new prompt block was added. If it grows, drift; investigate.
5. **Provider-degraded check.** When Claude is unavailable and fallback engages, the field layer continues to report and is not blamed for fallback. The fallback copy remains the published Cut-1 phrasing — no new reflective first-person language. *(`project_infrastructure_failure_disguised_as_relational`.)*
6. **Outside-Life check (post-deploy, days later).** Real members report no felt sense of being "diagnosed" or "tracked." If anyone says "MAIA told me I was [fire-dominant]" or similar — drift; pull the wire.

Until 1–5 all hold, the cut is *under observation*, not *verified*.

---

## 7. Out of scope (explicit non-goals)

- **No `MorphicPatternService` wiring** — that layer requires consent-boundary and aggregation-only enforcement first; gate is separate work.
- **No `QuantumFieldMemory` interaction** — that service has zero persistence and is queued for rename + gut.
- **No `EpisodicMemoryService` wiring** — that's the matrix's "Wire 1st." This cut does not leapfrog it.
- **No member-facing surface** — no chrome, no pill, no `/maia/field`, no admin panel beyond the existing `/admin/maia/substrate` row.
- **No "recommendation" surface** — recommendations are not memory; they belong elsewhere if anywhere.
- **No cross-member reads** — every query is member-scoped.
- **No schema change** — migration stands; writer simply abstains from forbidden columns.

---

## 8. Deploy checklist (if and when authorized)

1. Open PR with `coherenceFieldLoader.ts` + route diff + memoryHealth input wiring + `runtime_events` column additions only.
2. Drift-canary checklist (§5) ticked in PR description.
3. Local smoke: three turns, verify §6.1 and §6.2.
4. Production deploy via `ssh soullab@minisforum ...` per CLAUDE.md (never Mac Studio).
5. Verify production-side: `docker inspect maia-sovereign --format "{{.Created}}"` under one minute, then `runtime_events` row count check (§6.1) against production DB.
6. Cross-process verification per §6.3 — the production log must match the production DB. No "local says yes, prod says nothing."
7. CLAUDE.md priority thread updated to reflect the wire-up *only after* §6.1–§6.5 all hold.
8. Continue observation. Do not write the architecture-cleanup doc until lived signal exists across days, not turns.

---

## 9. Roll-back

Single file revert removes the wire. Service stays, table stays, migrations stay. The wire is the only thing that ships; it is the only thing that rolls back.

---

## 10. Closing posture

*The architecture protects the clearing — it is not the clearing.* This wire connects an existing structural reading to the existing health surface. It does **not** introduce a new way for the system to talk to the member about who they are. If at any point that line blurs during implementation review, the spec has failed and the cut does not ship.
