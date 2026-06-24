# Spiral Process Intelligence — Architectural Discovery (Archaeology)

**2026-06-22 · verification, not design · read-only.** Method: grep + runtime-pathway
tracing across `database/migrations/`, `lib/`, `app/api/`. Each primitive classified by the
**storage / observation / influence / governance** ontology and by **runtime status**
(live route vs dead route vs orphaned vs dormant). Nothing wired, activated, or deployed.

**Central question:** *Can MAIA represent multiple simultaneous Spiralogic processes, each
progressing independently through phases, while maintaining coherent governance?*

**Headline:** ~75% of the *primitives* already exist — but they are **scattered across
live / dead-route / orphaned / dormant**, **split between inferred and member-declared**, and
**none are joined** into a persisted per-(member, domain) process. The architecture has
independently grown every *limb* of a process engine and never assembled the *spine*. And the
**polarity is inverted vs the sovereignty ideal**: the *inferred, global* phase is the one
that's live and influencing the prompt; the *member-declared, plural* primitives sit orphaned.

---

## 1. Existing Spiral-compatible primitives (verified)

| Primitive | Holds | Runtime status | S/O/I/G | Models | Domain-keyed? | Over time? |
|---|---|---|---|---|---|---|
| `analyzeFieldIntelligence` + MythicAtlas (`atlasResult`) | element + **phase** + userState + **spiralScale** (micro/meso/macro/collective) + facet | **LIVE** on sovereign (`maiaService.ts:880,893`) — injects *"Phase detected: X (theme)"* into prompt | **Influence (inferred)** | state (ephemeral) | **No — global** | No (per-turn) |
| `spiralOrientation` / `DomainOrientation` | **6 life domains** (identity, body, relationship, work, creativity, spirituality); member-placed evidence (missions/atoms); uncertainty | **LIVE** on `sovereign/app/maia/list` + `psyche/orientation` | **Observation (governance-disciplined)** — header: *"Does NOT infer phase/stage… no cross-domain synthesis"* | relationships (domain↔evidence) | **Yes (6)** | partial (evidence accretes) |
| `member_spiral_state` | element + **phase (1–12)** + **motion** (ascending/stuck/breakthrough) + intensity + relational_phase + autonomy_streak + return_count | **DEAD ROUTE** — written/read only by `oracle/conversation` (≈0 traffic) + admin analytics | Influence (dead) / Observation (admin) | **process** (single spiral w/ phase+motion+history) | **No — `PK(member_id)`** | **Yes** |
| `trajectory_focus` | per-(member, domain) **intention** + **element_tone** | **ORPHANED** — member-writable (`maia/trajectory/focus` POST, `ON CONFLICT (member_id,domain)`); **no reader on any prompt path; no caller found** | storage + member-declared | state per domain | **Yes — `UNIQUE(member_id, domain)`** | upsert (current only) |
| `member_memory_atoms` (`is_breakthrough`, `return_preference`, `registers`) | member-marked salience | **LIVE** | Influence (consent-gated) | events / salience | no | yes |
| `coherence_captures` | capture inbox (`today/later/time_sensitive/ongoing`, held/released) — *"loose ends safely held"* | **LIVE** (`maia/coherence/captures`) | storage + member-declared | events (open loops) | no | yes (held→released) |
| `relational_phase` | the **relationship's own** 4-stage maturation (orientation→capacity→autonomy→seasonal return) | persisted via `oracle/conversation` (dead route) | Influence (dead) | **process** (the relationship itself) | no | yes |
| `SpiralConstellation` / `activeSpirals` + `secondarySpirals` | the **multi-spiral object** | **DORMANT** — `consciousness/spiral-aware` + `spirals/constellation` labtool routes; `ios-adapter.ts` stubs (`return []`, `activeSpirals: []`) | n/a (stub) | processes (plural) | yes (conceptual) | no |

**Prompt-protocol readiness:** `sacredMirrorProtocol.ts:7` — *"name active spiral(s) +
element/phase/facet ONLY if present in SPIRAL STATE / **MULTI-SPIRAL STATE** blocks."*
The live prompt protocol **already has a slot for multiple simultaneous spirals.** Nothing on
the live path **populates** it (the only multi-spiral constructors are the dormant
constellation routes + iOS stubs).

**Dormant vocabulary zoo (0 live consumers, substrateMap-only):** `SpiralogicProcessTracker`,
`SpiralogicCore/Orchestrator`, `EvolutionEngine`, `BreakthroughTrajectoryEngine`,
`CeremonialTransition`, `LayerTransition`, `FieldCoherenceEngine`, `CoherenceFieldService`
(+`coherence_field_readings`), `MorphicPatternService`, `spiral_stage_transitions`
(migrate-data only), `spiralogic_reports` (practitioner/_backend/astrology). The Spiralogic
*words* are everywhere; the live *substrate* is the small set above.

---

## 2. The chain (Domain → Phase → State → Coherence → Practices → Transition → Emerging)

Every link exists somewhere — none are connected, and they straddle the inferred/declared line:

| Link | Where it lives | Status |
|---|---|---|
| **Domain** | `spiralOrientation` (live, member-placed) · `trajectory_focus` (orphaned, per-domain) | present, governed |
| **Phase** | `fieldIntelligence`/`atlas` (live, **inferred**, global) · `member_spiral_state.phase` (dead route, persisted) | present but inferred-or-dead |
| **State / element** | `fieldIntelligence.element` (inferred) · `trajectory_focus.element_tone` (member-set, orphaned) · `member_spiral_state.dominant_element` (dead) | present, scattered |
| **Coherence** | `coherence_captures` (live, but a *capture inbox*, not phase-coherence) · `member_spiral_state.motion` (dead) · `coherence_field_readings` (dormant) | **weakest link** — no coherence-*within-phase* representation |
| **Practices** | `practice_worlds/sessions/insights`, `ea_practice_completions` (exist; liveness not traced here) | present (untraced residual) |
| **Transition** | `member_spiral_state.motion` (breakthrough/stuck, dead) · `spiral_stage_transitions` (dormant) · `CeremonialTransition` (dormant) | present but dormant/dead |
| **Emerging phase** | — | **absent** (would derive from transition signals) |
| **Relations between processes** | `episode_links` (for episodes, not spirals) · constellation `secondarySpirals` (dormant) | mostly absent |

---

## 3. Missing primitives (truly absent, minimum set)

1. A **persisted, plural, per-(member, domain) process row** carrying phase + motion +
   history *together*. `member_spiral_state` has phase+motion+history but is **singular**;
   `trajectory_focus` is **plural per-domain** but lacks phase+motion+history. Neither is whole.
2. A **coherence-within-phase representation** — markers/edges as a *landscape*, **not a
   score**. (Per the directive: *"a more coherent way of inhabiting the phase,"* not *"the most
   coherent state."*) Today coherence is either a capture inbox or dormant drift-scoring.
3. An **emerging-next-phase / transition-signal** join (motion + transitions are dead/dormant).
4. A **populated MULTI-SPIRAL STATE block** feeding `sacredMirror` (slot exists, unfilled live).

---

## 4. Architectural gaps (why the limbs don't form a body)

- **The two halves never meet.** The same live route has domain (`spiralOrientation`) and the
  same live service has phase (`fieldIntelligence`) — but they are **never joined into a
  per-domain phase.** Domain is phase-free by doctrine; phase is domain-free by inference.
- **Polarity inversion vs sovereignty.** The **inferred, global** phase is the one that's
  **live and influencing** (*"Phase detected: X"* → prompt). The **member-declared, plural**
  primitives (`trajectory_focus`, `spiralOrientation`'s member-placed evidence) are
  **orphaned or phase-free.** The governed path is unwired; the inferring path is wired. This
  is the **opposite** of *"attune, don't assess."*
- **Consent collected, never used.** `trajectory_focus` takes a member's per-domain intention
  and stores it — and nothing reads it. Same shape as the episodic `resonance`/`ingest`
  orphans: a member act with no consequence.
- **Richest single-process primitive is on the dead route.** `member_spiral_state`
  (phase+motion+history) reaches ≈0 live traffic.

---

## 5. Smallest primitive necessary to hold a living process

**Not a new "Spiral object."** It is the **re-keying + union of two existing tables:**

```
member_spiral_state    PK(member_id)              { element, phase, motion, intensity,
                                                     relational_phase, history }
        ⊕
trajectory_focus       UNIQUE(member_id, domain)  { domain, element_tone, intention }
        ↓
process row            PK(member_id, domain|process_key)
                       { orientation/element, phase, motion/transition, intensity,
                         intention, edge, history }
```

`member_spiral_state` is already the Process primitive **minus {domain key, plurality}**.
`trajectory_focus` already has the **exact cardinality for plurality** (`UNIQUE(member_id,
domain)`). Generalizing `member_spiral_state` from `PK(member_id)` to `PK(member_id, domain)`
and folding in `trajectory_focus` yields *one row per living process*. Marriage, career,
grief, vocation become **instances of the same primitive** — verified as a *generalization of
existing tables*, not an imposed abstraction. **Coherence stays a separate, member-articulated
marker stream** (a landscape to observe, never a score to optimize).

---

## 6. Convergence (the "accidental Spiralogic")

Three independent **live** subsystems — `spiralOrientation` (domains), `fieldIntelligence`/atlas
(phase+scale), `coherence_captures` — plus `trajectory_focus` and `member_spiral_state` were
built at **different times for different reasons** and all model facets of {domain, element,
phase, motion, coherence, history}. The `sacredMirror` prompt protocol already names *"active
spiral(s) + element/phase/facet"* and a *MULTI-SPIRAL STATE* block; the `SpiralConstellation`
object already exists (dormant). The convergence is real and reaches the **prompt protocol
itself**. What is missing is not the limbs and not the vocabulary — it is the **spine** that
joins per-domain identity to phase to history, **grounded in member articulation rather than
inference.**

> The job is not to impose Spiralogic on MAIA. It is to **recognize, refine, and organize**
> what has already emerged — and, specifically, to **invert the current polarity**: promote
> the member-declared, plural primitives into the spine and re-ground "phase" in member
> articulation, consistent with `spiralOrientation`'s own anti-inference doctrine.

**Honest residuals (not closed):** the practice subsystem's liveness; whether
`fieldIntelligence.phase` shares the 1–12 vocabulary of `member_spiral_state.phase`; the exact
dormancy of the constellation routes. Each is a further pathway trace.

---

## 7. MULTI-SPIRAL STATE population trace — verdict (2026-06-22)

> Narrow trace: does anything populate the `MULTI-SPIRAL STATE` block? Trace only.

### Classification of every spiral-phase path

| Path | S/O/I/G | Authorization state |
|---|---|---|
| `MULTI-SPIRAL STATE` block (sacredMirror slot) | governance (prompt protocol) | **unpopulated — socket only** (literal appears once, at `sacredMirrorProtocol.ts:7`, the *consumer*; **no constructor exists**) |
| `spiralSnapshotAddendum` (maiaService FAST, live) | **influence** | **inferred** ("computed member spiral state, Pass 1"; injected when present) |
| `fieldIntelligence` "Phase detected" (maiaService, live) | **influence** | **inferred** (text analysis) |
| `atlasResult` facet/phase (MythicAtlas, live) | **influence** | **inferred** |
| `MemberLiveContext.spiralState` (live read) | observation→influence | **inferred-written + write-starved** — `loadSpiralState` reads `member_spiral_state`, whose **only writer is `oracle/conversation`** (dead route) → `null`/default for live-sovereign members |
| `ClaudeService` `## MEMBER SPIRAL STATE` block | influence (gated on `spiralInjection`) | **off the sovereign/oracle path** (not imported there) |
| `trajectory_focus` | storage (member-declared) | **orphaned** — full API surface (state/focus/thresholds/state-history), **zero callers, no prompt reader** |
| `spiralOrientation` / `DomainOrientation` | observation (member-placed) | **parked** — *commented out* of the live route with documented rationale ("Cut 2 design-only / parked … must not enter the MAIA prompt automatically yet") |
| `members/spiral-state` route | observation (read-only `GET`) | **member-read; no member-write** |
| `member_spiral_state` table | storage | **inferred-written** (`oracle/conversation` upsert); admin-observed |

### Verdict

- **`MULTI-SPIRAL STATE`: UNPOPULATED.** Empty socket — referenced only by the protocol
  consumer; nothing constructs the block. **Clean greenfield.**
- **Does `trajectory_focus` currently influence MAIA? No.** Member-declared, stored, and
  read by nothing on any prompt path.
- **Is live phase influence global + inferred only? Yes.** Every spiral phase reaching the
  live prompt is inferred (`fieldIntelligence` + `atlas` + computed `spiralSnapshotAddendum`).
  Every member-declared/placed source is orphaned (`trajectory_focus`), parked
  (`spiralOrientation`), or write-starved / read-only (`member_spiral_state`,
  `members/spiral-state` `GET`).
- **Greenfield vs partial?** The **plural** socket is *clean greenfield*. The **singular**
  substrate is *partially wired but inferred-fed and fragmented* (live `spiralSnapshotAddendum`;
  off-path `ClaudeService` block; write-starved `MemberLiveContext.spiralState`).

### Minimum join point (if wired — NOT implemented here)

**One formatter + one addendum wire.** Read `trajectory_focus` (existing; member-declared;
`UNIQUE(member_id, domain)`) → format a `MULTI-SPIRAL STATE` block → inject via the **existing
addendum channel** (same pattern as `spiralSnapshotAddendum`) on `maiaService`. **No schema
change, no new abstraction, no new socket** — the socket already exists and is empty; the
member-grounded source already exists and is orphaned. Connecting them *is* the polarity
correction.

**Governance flag (report-only):** wiring `trajectory_focus` → prompt is a governed crossing.
Declaration-is-consent covers *storage*; surfacing it as a reflected "spiral state" is a
*use-consent* question — the same shape as the episodic eligibility seam (§6 of the memory
reconciliation). Decide the consent posture (and whether phase is *reflected back* vs *asserted*)
before wiring. The socket being empty is the good news the trace was looking for: the system
made room for plurality and simply never connected the member-grounded source.
