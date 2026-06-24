# Memory Subsystem Reconciliation — 2026-06-22

**Type:** implementation-archaeology / verification pass (NOT design). Read-only.
**Method:** grep over `database/migrations/`, `lib/consciousness/memory/`, `lib/memory/`,
`app/api/oracle/*`, `app/api/sovereign/*`, `lib/maia/*`, `lib/sovereign/*`; git branch
inspection; one read-only production log probe. No code wired, activated, or deployed.

**Scope guard:** the activation model
(`MEMORY_ACTIVATION_MODEL_CANDIDATE_2026-06-22.md`) is settled. Its **framework and
invariant do not change.** This pass corrects **factual cells** in the per-layer table
and in the two source docs it cites. The task anticipated *one* cell (somatic); this
pass found a **second** (conversational) and several stale cells in the matrix/plan.

---

## 0. Seed discrepancy — RESOLVED: `somatic_memories`

- **The table exists.** `database/migrations/20260115000011_somatic_memories.sql:5`
  — `CREATE TABLE IF NOT EXISTS somatic_memories (...)`, commented *"Body wisdom pattern
  tracking (MAIA Memory Palace Layer 3)."* Indexed on user_id / body_region / status / last_updated.
- `lib/consciousness/memory/SomaticMemoryService.ts` carries **full CRUD** against it
  (INSERT @91; SELECT @133/155/230/249; UPDATE @187/209/280).
- **No live writer/reader anywhere else.** The only file referencing `somatic_memories`
  outside the migration is `SomaticMemoryService.ts` itself, and that service is imported
  **only** by `lib/maia/substrateMap.ts` (observability) → **0 runtime consumers.**

**Verdict:**
- `MEMORY_SERVICE_STATUS_MATRIX` (`somatic_memories ✓`) is **correct**.
- `MEMORY_EXPANSION_PLAN` ("*no schema for somatic capture yet defined*") is **wrong** —
  schema + service CRUD both exist.
- The precise gap is **input source / capture pathway**, not schema. The table is
  unreachable because nothing invokes the service.

---

## 1. State ontology — three projections (revised per review, 2026-06-22)

The single-axis "active/dormant" question was overloaded. The cleaner frame is **not new
axes — it is the activation model's *existing* three axes (Architecture ⟂ Implementation ⟂
Authorization) reported in observable form**, plus one judgment:

- **Runtime participation** *(observed — projection of the Implementation axis).* Uses the
  ladder **already defined in `lib/maia/substrateMap.ts`** as `CapabilityStatus`:
  `not-built → built-unwired → wired-unobserved → observed-runtime → live-member-use`.
  This is what archaeology *measures*.
- **Authorized role** *(granted — Architecture × Authorization).* The activation ladder:
  **None → Observation → Influence → Spine.** "Spine" is reserved for the Meta/Provenance
  governance plane; it is **not** the top rung of an influence scale — so Semantic atoms are
  *Influence*, not Spine.
- **Governance status** *(the decision-state of the Authorization axis)* —
  **Ungoverned (never evaluated) / Permitted / Withheld (evaluated & frozen).** This is a
  *judgment about the gap* between the first two columns, **not** a participation level.

The audit's real product is locating **divergence**: where runtime participation has outrun
any authorization decision. Episodic is the live instance.

| Layer | Schema/impl | Runtime participation (observed) | Authorized role (granted) | Governance status |
|---|---|---|---|---|
| Semantic (atoms) | table + loader ✓ | live-member-use | Influence | Permitted (Cut 1) |
| Relational | tables ✓ | observed-runtime | Influence (limited) | Permitted (limited) |
| Conversational | table + block ✓ | **wired-unobserved** (deployed 17:46Z, 0 emissions/6h) | Influence (FAST/CORE) | Permitted, **verification pending**; DEEP withheld |
| Developmental | `consciousness_evolution` ✓ | observed-runtime (count) | Observation | Permitted (observe only) |
| Symbolic | `member_theme_signals` ✓ | observed-runtime (count) | Observation | Permitted (observe); influence withheld pending member-confirmation |
| **Episodic — service** | `episodic_memories` ✓ | built-unwired | None | n/a (no path) |
| **Episodic — raw-SQL path** | same table | **observed-runtime** (sessionProcessor, episodes/mark, ingest, resonance, journal) | **None** | **⚠ Ungoverned — never evaluated** |
| Somatic | table + service ✓ | built-unwired | None | no path to govern yet |
| Field / Coherence | `coherence_field_readings` ✓ | built-unwired | None | **Withheld — evaluated & frozen** (lift = Kelly directive) |
| _QuantumFieldMemory_ | none (0 persistence) | built-unwired (labtool only) | None | Barred (slated for demolition) |
| Meta / Provenance | n/a | live-member-use | **Spine** (governance plane) | Infrastructural |

**The decisive contrast:** the Episodic raw-SQL path and Field/Coherence are *both*
Authorized-role **None** — but Field is **Withheld** (a deliberate, evaluated freeze) while
the Episodic path is **Ungoverned** (it executes in production having never been evaluated).
Same authority value, opposite governance status. That is exactly why "governance" cannot be
a participation level: it is the *status of the authorization decision*, and it is where the
only real flag lives.

**Methodological consequence:** the matrix missed the Episodic path because its caller-grep
was **service-centric** ("who imports the class") — and raw SQL has no import to find. The
unit of analysis must shift to the **execution pathway**: *what paths can move information
from storage → influence?* (services, direct SQL, routes, orchestration, prompt builders,
observability), not *which class is instantiated*. A future pass should trace pathways, not classes.

---

## 1a. Per-layer reconciliation table (doc-claim mapping — what each doc states vs reality)

| # | Layer | Table exists? | Live callers (sovereign prompt path) | Dormant (0 live consumers)? | Doc says | Match? |
|---|-------|---------------|--------------------------------------|------------------------------|----------|--------|
| 1 | **Semantic (atoms)** | `member_memory_atoms` ✓ | **Yes** — `sovereign/app/maia/list/route.ts` + `atoms/[id]/breakthrough` | No — Active | Active | ✅ |
| 2 | **Relational** | `member_relationships` / members ✓ | **Yes** — `MemberLiveContext` in `sovereign/app/maia/list` + `lib/sovereign/maiaService` | No — Active (limited) | Active (limited) | ✅ |
| 3 | **Conversational** | conversation_* ✓ | **Wired on `clean-main-no-secrets`** — `list/route.ts:116` import, `:814` `[MAIA] conversational-block`. Prod container fresh (2026-06-22T17:46Z). **0 emissions / 6h.** | Not dormant — merged + wired; **unverified** | "branch-only … pending deploy + verify" | ❌ **stale** |
| 4 | **Developmental** | `consciousness_evolution` ✓ | Observation only — count → `memoryHealth.developmental` | No (observation tier) | Observing (count only) | ✅ |
| 5 | **Symbolic** | `member_theme_signals` ✓ | Observation only — `loadRecentThemeSignals` → `memoryHealth.pattern` | No (observation tier) | Observing (count only) | ✅ |
| 6 | **Episodic** | `episodic_memories` ✓ (`20260115000010`) | **Service: 0** (substrateMap only). **Table: LIVE** — `INSERT`/`SELECT` via `lib/maia/sessionProcessor.ts` (@614/@674), `sovereign/episodes/mark` (POST, @157), `maia/memory/ingest`, `maia/memory/resonance`, `journal/quick/list` | Service dormant; **table NOT inert** | "dormant; 0 callers; feeders never landed" | ❌ **incomplete** |
| 7 | **Somatic** | `somatic_memories` ✓ (`20260115000011`) | **0** — only `SomaticMemoryService.ts` (itself dormant) | **Yes** — dormant; no input source | Plan: "no schema" ✗ · Matrix: table ✓ · Model: "reconcile" | ⚠️ **resolve** |
| 8 | **Field / Coherence** | `coherence_field_readings` ✓ (`20260115000005`) | **0** — `CoherenceFieldService` imported only by substrateMap | Yes — dormant (constitutionally gated) | Constitutionally gated | ✅ |
| — | _QuantumFieldMemory_ (service) | none | labtool/metrics only — `maia/enhanced-consciousness`, `consciousness/spiral-aware`, `core-member-profile`→`personal-metrics`, substrateMap. **0 on sovereign path.** | Yes (legacy, 0 persistence) | Legacy under redesign | ✅ (count stale) |
| 9 | **Meta / Provenance** | n/a | **Yes** — `buildMemoryHealth` in live route + `admin/maia/substrate` monitor | No — Active spine | Active (spine) | ✅ |

**Migration table inventory (`*_memories` / `*_readings`, grep-confirmed):**
`episodic_memories` ✓, `somatic_memories` ✓, `morphic_pattern_memories` ✓,
`coherence_field_readings` ✓, `case_memories` ✓ (practitioner caseload — not a core layer),
plus divination_*_readings (not memory layers). Six of the nine consciousness/memory
services have tables; the feeders did *not* all stay unwired (see Episodic).

---

## 2. Service-level caller audit (the nine `lib/consciousness/memory/*`)

The matrix's central claim — *"zero direct imports from `app/api/oracle/*`,
`app/api/sovereign/*`, `lib/maia/*`, or `lib/memory/*`"* — is **now stale**:

- **`lib/maia/substrateMap.ts` imports all nine.** It is the *static observability
  plane* ("static encoding of memory substrate inventory" for the admin monitor),
  consumed **only** by `app/api/admin/maia/substrate/route.ts`. It **introspects, it does
  not consume into the prompt.** So the underlying conclusion ("0 live-path consumers")
  survives; the literal "zero imports" does not.
- Other importers, all **off the sovereign live path** (labtool / near-dead / backup):
  - `QuantumFieldMemory` ← `maia/enhanced-consciousness` (labtool), `consciousness/spiral-aware` route, `core-member-profile`→`personal-metrics`  *(matrix said "1 labtool only" — count stale, conclusion intact)*
  - `MemoryPalaceOrchestrator`, `MemberLiveContext` (relational, live) ← `oracle/conversation/route.ts` *(per CLAUDE.md, ~zero live traffic)*
  - `EnhancedMAIAFieldIntegration` ← `between/chat/route.enhanced.backup.ts` (dead), `enhanced-consciousness`
  - `SessionMemoryService` ← `maia/memory-enhanced-response`
  - `consciousness/memory/SemanticMemoryService` ← substrateMap only (dormant). The **live**
    sibling is `lib/memory/SemanticMemoryService.ts` (← `MAIAUnifiedConsciousness`,
    `PersonalOracleAgent`). Two different classes — reconcile-before-wiring still stands.

**Truly dormant (0 live consumers, service-level):** EpisodicMemoryService,
CoherenceFieldService, SomaticMemoryService, MorphicPatternService, AchievementService,
ConsciousnessEvolutionService, `consciousness/memory/SemanticMemoryService`,
MAIAMemoryArchitecture, QuantumFieldMemory. ✅ matches the matrix's "0 live-path callers"
column — the *prose* around it is what drifted.

---

## 3. Deploy readiness

### Conversational Phase 2 — **further along than docs claim, but unverified**
- **Merged + wired on the deploy branch** `clean-main-no-secrets`: `conversationalRecallBlock.ts`
  present; live route `sovereign/app/maia/list/route.ts` imports it (`:116`) and emits
  `[MAIA] conversational-block` (`:814`). Commit `987b3ff28` introduced the block file.
- **Production container is fresh** (Created `2026-06-22T17:46:18Z`).
- **But 0 `conversational-block` emissions in the last 6h.** Cannot disambiguate from logs
  alone whether (a) the deployed image predates the wire, or (b) it is wired but no
  qualifying traffic occurred (emission requires a **returning** member with prior
  exchanges on a **FAST/CORE** turn). **Verification (runtime evidence) is NOT satisfied.**
- DEEP-tier block reference is **structurally valid**: `buildComprehensiveVoicePrompt`
  exists (`lib/sovereign/intelligentVoiceAdaptation.ts`) and
  `ADDENDA_CHANNEL_DIVERGENCE_2026-05-24.md` exists. *Not re-verified at line level whether
  DEEP now extracts the addendum.*
- **Next step (read-only):** confirm deployed commit == `clean-main` HEAD, then run the
  CLAUDE.md ops diagnostic during known returning-member FAST/CORE traffic.

### Episodic — **service wireable, but the table is already live via an ungoverned path**
- The governed `EpisodicMemoryService` is unwired (0 consumers) ✓.
- **However** `episodic_memories` is actively `INSERT`/`SELECT`-ed by `sessionProcessor`
  (called from `maia/session/process`), `sovereign/episodes/mark` (live POST),
  `maia/memory/ingest` (with embeddings), `maia/memory/resonance` (reads), and
  `journal/quick/list`. "Activate Episodic" is therefore **not a clean wire of a dormant
  service** — it must reconcile with this existing raw-SQL pathway (provenance/consent of
  those writes is unaudited here). **Flag for design; not resolved in this pass.**

---

## 4. Doc cells to correct (short list)

1. **EXPANSION_PLAN → Somatic → Storage substrate** — "*no schema for somatic capture yet
   defined*" is **false**. → "Table `somatic_memories` (`20260115000011`) + `SomaticMemoryService`
   CRUD exist; **no capture input source / live writer** wired (service dormant)."
2. **ACTIVATION_MODEL → Somatic cell** *(the anticipated one)* — drop "no capture schema …
   (matrix lists a `somatic_memories` table — reconcile)". → "service + table ✓ exist;
   service dormant — **missing input source**, not schema."
3. **ACTIVATION_MODEL → Conversational cell** *(second cell — beyond anticipated)* —
   "not yet — branch-only" is **stale**. → "merged + wired on `clean-main-no-secrets` (live
   route); prod deployed 2026-06-22T17:46Z; **runtime verification pending — 0 emissions / 6h.**"
   (DEEP-block clause stays — artifacts exist.)
4. **STATUS_MATRIX → Framing correction** — "zero direct imports from … `lib/maia/*` …" is
   **stale**. → "sole importer is `lib/maia/substrateMap.ts` (observability, consumed only by
   admin monitor) + off-live-path labtool routes; **0 live-path consumers** stands."
5. **STATUS_MATRIX + EXPANSION_PLAN → Episodic** — "Runtime consumer: none / feeders never
   landed" is **incomplete**. → distinguish: **service** dormant (0 consumers) vs **table**
   live (`sessionProcessor`, `sovereign/episodes/mark`, `maia/memory/ingest|resonance`,
   `journal/quick/list`).
6. *(minor)* **STATUS_MATRIX → QuantumFieldMemory** — "1 (labtool only)" → 3 functional
   importers + substrateMap; still **0 on sovereign path** (conclusion unchanged).

---

## 5. What this pass does NOT change

- The activation model's **invariant** (§1), **three-axis model** (§2), and **narrow
  "dormant" definition** (§3) are intact and confirmed by the evidence.
- The matrix's **"0 live-path callers"** numeric column is accurate; only surrounding prose drifted.
- Items 4.1–4.2 are the same underlying fact (somatic) surfacing in two docs.
- No recommendation to wire, activate, or deploy anything. Episodic table-liveness (3.2)
  and the unverified conversational deploy (3.1) are flagged for a **future** governed pass.

---

## 6. Episodic pathway trace (storage → influence) — 2026-06-22

> Governing test: *a substrate is not governed by whether it exists, or whether code
> touches it, but by whether its pathway from storage to influence has been authorized.*
> Question asked: **what is the highest verified consequence of data entering `episodic_memories`?**

**Answer: direct, member-confirmed recall surfaced in the live MAIA response** — via
`directRecall`, wired into `app/api/sovereign/app/maia/list/route.ts:142`. This **inverts**
the earlier "ungoverned write path" flag and **relocates** the gap.

- **Retrieval is consent-gated and authorized-by-design.** `list/route.ts:419` runs recall
  only when `isDirectRecallEnabled() && isRecognizedUser && !isSanctuary && userId`. Two-turn
  protocol: detect intent → **offer** (`pendingRecalls`) → member confirms
  (`detectConfirmationIntent`) → `materializeMemoryObject` returns the row to the member with
  provenance ("Here it is — {title} ({sourceKind}, {date})"). Member-initiated, Sanctuary-
  excluded, flag-gated. Not silent prompt injection.
- **The gap is eligibility scope, not the gate.** The episode adapter
  (`lib/memory/directRecall/adapters.ts`) is `eligibility: alwaysEligible`. Atoms use
  `atomEligibility` (gates on `status`, excludes `sacred_protected`, honors `return_preference`).
  The `marked_by_member` column exists (`episodes/mark` sets it `TRUE`) but **directRecall does
  not filter on it.** So **any** episodic row for the member is recall-eligible — including
  `journal/quick/list` writes (journal entries, dreams; `experience_description`, no marked flag).

| Path | Writes? | Reads? | Reaches live MAIA? | Influence type | Authorization state | Action |
|---|---|---|---|---|---|---|
| `episodes/mark` | Yes — `marked_by_member=TRUE`, `source_turn_id` required (400), Sanctuary-aware | No | **Yes** (via directRecall) | Member-confirmed direct recall | **Authorized** (governed end-to-end) | Keep — reference pattern |
| `directRecall` (read, live route) | No | Yes | **Yes** | Offered→confirmed recall (Sanctuary-excluded, flag-gated) | Retrieval **authorized**; **eligibility NOT** | Gate eligibility on `marked_by_member`/sacred — mirror `atomEligibility` |
| `journal/quick/list` | Yes — `experience_description`, embeddings, **no marked flag** | GET lists | **Yes, latently** (`alwaysEligible` ⇒ recall-eligible) | Latent recall of unmarked journal/dreams | **Unevaluated** (no member consent to journal→recall) | **Flag** — decide if journal rows are recall-eligible |
| `memory/ingest` | Yes — embeddings, no marked flag | No | Only if invoked (**no live caller found**) | Latent (orphan writer) | Unevaluated | Confirm caller; same eligibility seam |
| `memory/resonance` | No | Yes — returns JSON | **No live caller found** | Latent / diagnostic retrieval | n/a (orphan endpoint) | Confirm orphan; retire or wire deliberately |
| `sessionProcessor` | Yes — `semantic_vector` | Yes — similarity, LIMIT 5 | No (post-session / facilitator, not live turn) | Analytics / resonance off live path | Unevaluated | Trace `session/process` feedback separately |

**Verdict on the user's escalation ladder:** not *inert*, not *diagnostic-only*, beyond
*latent retrieval* — it is **direct (member-confirmed) response influence**. It is **not** a
clean "unauthorized live influence" breach, because the *mechanism* is consent-gated. The
precise standing is: **authorized retrieval mechanism with an unevaluated, over-broad source-
eligibility boundary.** The breach risk lives at the eligibility seam (unmarked journal/dream
rows recallable), not at the retrieval gate.

**Recommended (not applied — report only):** give the episode adapter a real `eligibility`
predicate that requires `marked_by_member = TRUE` (and honors sacred/Sanctuary at row level),
so episodic recall enforces the same member-marked discipline atoms already do. One column,
already present, currently unenforced.
