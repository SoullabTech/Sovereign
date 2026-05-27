# Admin Substrate Observability — Spec v0.2 (2026-05-27)

**Status:** Spec — not yet implemented. Parent surface for `FRAMEWORK_REGISTRY_MONITOR_2026-05-27.md` and future panels.
**Route:** `/admin/maia/observability` (primary) | `/admin/maia/substrate` (alternative — Kelly to choose §VII.1).
**Branch target:** new branch `feature/admin-substrate-observability` (do NOT bundle with `feature/conversational-memory-phase2`).
**Phase:** Phase 1 observability — read-only, additive. No runtime behavior changes.
**Audience:** Kelly only initially. **NOT member-facing.**

---

## 0. Frame & purpose

Kelly 2026-05-27 directive (sharpened, second pass):

> *"Build one admin substrate observability surface where each arena uses the same four/five-axis logic. Don't build separate monitors that each invent their own grammar."*

> *"It should be in admin where I can monitor everything including the multi-engine architecture and memory functionality."*

The framework monitor (spec'd at `FRAMEWORK_REGISTRY_MONITOR_2026-05-27.md`) is scoped as a single observability primitive. Kelly's directive widens scope: the architecture already has multiple cat-6 substrates emitting telemetry (atoms, breakthrough, semantic, conversational Phase 2, Corpus Callosum, frameworks) but **no unified surface** that reads them together with **shared grammar**.

This spec defines that unified surface — a single admin page that:
- Reads from **existing telemetry sources only** (no new collection layers)
- Renders **what is actually runtime-verifiable**, not what is architecturally aspirational
- Applies the **five-axis discipline** (exists → reachable → participates → observable → influences) consistently across **every panel**
- Surfaces the **gap between built / wired / surfacing / verified** for every observed domain
- Is the **single place** Kelly checks to know "what is actually live in MAIA right now"
- **Shares grammar across arenas** — refuses per-panel ontology drift

### Non-goals

- No new telemetry collection (every panel reads existing sources)
- No member-facing exposure — this is admin only
- No write actions (read-only surface; toggles deferred to Stage 5)
- No "MAIA system status" claims that exceed what panels actually measure
- No aesthetic polish in v0.1 — function over form
- No mobile/Capacitor support — desktop-only initially
- **No member-facing claims derived from this dashboard.** No "MAIA has 27 frameworks" copy, no "multi-engine architecture" marketing language, no "live observability" assertions in member-visible surfaces. This dashboard is for **internal substrate observation only**. Anything seen here that hasn't been independently re-verified for member-facing language stays internal.
- **No per-panel ontology** — every panel uses the same five-axis grammar. A panel that invents its own status vocabulary is rejected at review.

---

## I. Panels (full v1.0 scope — six panels)

Per Kelly 2026-05-27 sharpening, the surface covers **six arenas under shared grammar**, not three:

| Panel | What it monitors |
|---|---|
| **A — Memory Functionality** | loaders, sources, recall, forward-readiness, failures |
| **B — Multi-Engine Architecture** | provider, model, role, fallback, influence |
| **C — Framework Registry** | exists / reachable / participates / observable / influences |
| **D — Corpus Callosum / Voices** | elemental agents, distinction score, silent convergence |
| **E — Routing / Tiers** | FAST / CORE / DEEP / BETWEEN behavior |
| **F — Telemetry Health** | missing fields, stale traces, dormant-but-claimed systems |

**Each panel is independently degradable** — if one data source is unavailable, that panel shows `unavailable` without breaking the page.

**Each panel uses the same five-axis grammar** (Kelly 2026-05-27, load-bearing):

```text
exists → reachable → participates → observable → influences
```

Where:
- **exists** = filesystem / DB / service presence
- **reachable** = code path can invoke it
- **participates** = runtime turn actually invokes it
- **observable** = the invocation emits telemetry that this dashboard can see
- **influences** = the output substantively reflects the participation (Phase 2-equivalent verification — usually marked `not measured` in v0.1)

A panel that uses different vocabulary for these axes is rejected. The grammar is the discipline.

### Panel A — Memory Functionality

**Reads from:**
- `memoryHealth` JSON (already populated in `app/api/sovereign/app/maia/list/route.ts`)
- `agent_runs` table (Corpus Callosum substrate)
- Atoms table (with `is_breakthrough` flag)
- Semantic memory service state

**Renders per session-or-aggregate window:**
- Atoms loaded count (already exists: `atoms loaded: 8` log line)
- Breakthrough-marked atoms count + last surfaced timestamp
- Semantic memory state (`sem: ok` / count / last query)
- Episodic memory: **explicitly "not yet wired" status** (no fake ok)
- Conversational Phase 2 status: per-tier (FAST/CORE/DEEP) emission count + `reachedPrompt` breakdown
- Sanctuary mode count (non-content metadata only)
- Sovereign signals: contextual return default, daily anchor state

**Five-axis discipline per row:** exists / reachable / participates / observable / influences (influence marked `not measured` for v0.1 — Phase 2-equivalent work).

### Panel B — Multi-Engine Architecture

**Per `AI_ENGINE_PARTICIPATION_AUDIT_2026-05-26.md` + `project_two_layer_sovereignty_doctrine`:**

Two orthogonal sub-axes (load-bearing — do not collapse):

**B.1 — Cognitive-mode participation** (active per memory):
- Fire / Water / Earth / Air / Aether elemental voice firing counts (from `agent_runs`)
- Shadow voice firing count
- MythicAtlas + MaiaVoice firing counts
- WisdomRouter integration rate (~49% currently observed)
- BETWEEN path zero-row anomaly explicitly surfaced
- DEEP zero-row anomaly explicitly surfaced
- `logIntegrationPass` gating threshold (≥2)

**B.2 — Inference-engine participation** (partially active per memory):
- Claude primary count
- Qwen fallback count + activation conditions
- Kimi specialist count + activation conditions
- Local Ollama (DeepSeek) fallback state
- **Engine provider/model per agent_run** (requires additive `engine_provider` / `engine_model` columns per memory `project_two_layer_sovereignty_doctrine` — flagged as "schema gap" in panel)

**Critical display rule:** the panel renders B.1 and B.2 as **separate axes**, not a unified "engine table." Collapsing them is the category error the doctrine refuses. The N:M orthogonality note ("one engine may serve multiple modes; multiple engines may serve one mode") appears as a panel header annotation.

**Five-state ladder per row** (Built / Reachable / Participating / Observable / Sovereign) — per `project_governed_participation_doctrine`. The five-state ladder and the five-axis grammar are **complementary** — the ladder is the stage of maturity; the axis grammar is the row-level state in this dashboard. They are NOT the same thing and should not be conflated.

### Panel C — Framework Registry

**Per `FRAMEWORK_REGISTRY_MONITOR_2026-05-27.md`:**

- Live 13 therapeutic + 5 reflection from `lib/consciousness/therapeuticFrameworks.ts`
- Per-tier reachability (FAST / CORE / DEEP) with DEEP marked blocked
- Per-turn `[MAIA] framework-fired` aggregate (when Layer B telemetry ships)
- Dormant cat-3/4 inventory count
- Obsidian vault framework count (read-only filesystem scan, no bridge promotion)
- Empty "Canonical 27 list" column until Kelly provides it
- Five-axis state per framework (the same grammar as every other panel)

### Panel D — Corpus Callosum / Voices

**Reads from:** `agent_runs` table + `integration_passes` table + `VoiceDistinctionScorer` traces (per `lib/spiralogic/VoiceDistinctionScorer.ts`).

**Renders:**
- Per-voice firing count (Fire / Water / Earth / Air / Aether / Shadow / MythicAtlas / MaiaVoice)
- Voice differentiation score (load-bearing per `project_two_layer_sovereignty_doctrine` — Spiralogic ↔ cognitive-mode mapping)
- Silent convergence detection — turns where multiple voices fired but distinction score collapsed (homogenization warning)
- WisdomRouter selective integration rate (~49% currently)
- `logIntegrationPass` gating threshold (≥2)
- BETWEEN path row count (currently zero — anomaly explicitly displayed)
- DEEP path row count (currently zero — anomaly explicitly displayed)

**Five-axis state per voice.** The "influences" axis is the McGilchristian discipline made operational: did the differentiated voices actually shape the final output, or did they collapse into a single dominant signal? Currently `not measured` until `influence_score` migration ships.

### Panel E — Routing / Tiers

**Reads from:** Per-tier log markers — `[MAIA] conversational-block`, `[MAIA] framework-fired`, `[FAST]`, `[CORE]`, `[DEEP]`, `[BETWEEN]` aggregated counters (via `agent_runs.processing_profile` column).

**Renders:**
- Per-tier turn count (FAST / CORE / DEEP / BETWEEN)
- Per-tier addenda reach (conversational, framework, future arenas) — `reachedPrompt: true/false`
- Tier selection signal source (auto-router vs explicit member-depth request)
- DEEP-tier divergence-debt rows surfaced explicitly per `ADDENDA_CHANNEL_DIVERGENCE_2026-05-24.md`
- BETWEEN tier behavior — currently treated as anomaly per Corpus Callosum substrate audit

**Five-axis state per tier.** This panel is the single most useful for catching attribution drift — when frameworks/memory/voices show up in one tier but not another, this panel surfaces the divergence.

### Panel F — Telemetry Health

**Reads from:** All other panels' source queries + schema introspection.

**Renders (meta-observability — this panel watches the panels):**
- Missing fields: which log markers/columns expected by other panels are absent (e.g., `engine_provider`, `influence_score` schema gaps)
- Stale traces: telemetry rows older than threshold without refresh
- Dormant-but-claimed systems: any service mentioned as "live" in documentation/canon but emitting zero rows
- Inflation drift signals: status columns reading "ok" without underlying evidence
- Inverse drift signals: cat-6 substrates emitting rows but not surfaced in any panel (under-reporting per `project_corpus_callosum_substrate_cat6` doctrine)

**This panel is the load-bearing anti-drift instrument.** Without it, the dashboard itself can drift into inflation. Panel F asks: *is the dashboard telling the truth about itself?*

**Five-axis state of the dashboard.** Self-referential — the dashboard observes its own observability.

---

## II. Architecture

### Route

`/admin/maia/observability` (primary) or `/admin/maia/substrate` (alternative — Kelly to choose §VII.1).

**Why `/admin/maia/*` not `/labtools/*`:** Kelly directive 2026-05-27. The labtools convention is reflection/experimental; the admin convention is monitoring/governance. These are different surfaces with different audiences (testers vs Kelly). Refusing namespace conflation.

### Data layer

**Strict rule: no new tables, no new collection points, no new background workers.** This spec is read-only over existing sources.

Server component reads:
- `memoryHealth` via existing internal call path
- `agent_runs` via `lib/db/postgres.ts` query (read-only)
- Atoms table via existing service
- Framework inventory JSON (when `framework-inventory.json` exists from sibling spec)
- Log marker aggregation: deferred — see §IV

### Auth gate

**Kelly-only by member-id match** for v0.1 — tighter than tester gate. Logged-out / non-Kelly users: 404, not 401 — surface should not advertise its existence. Tester gate access can be opened at Stage 5 if operationally warranted; v0.1 is Kelly-only.

### Render mode

Server-rendered React Server Component. No client-side polling, no websockets, no live updates. Manual refresh model — Kelly hits reload to get fresh state. **This is intentional.** Live updates create their own observability complexity ("is the websocket alive?") that defeats the purpose.

### Format

Single page, three panel sections stacked vertically. Each panel:
- Section header with last-updated timestamp from query
- Four-axis state table (or two-axis for engine panel)
- Anomalies / refused / known-gaps callout box
- "What this panel does NOT show" footer — the discipline of explicit omission

---

## III. Stage-language progression (per Kelly directive 2026-05-26)

Following `is_breakthrough` pattern, **the surface itself** has stage progression:

- **Stage 3 — Reachable**: page renders at `/labtools/diagnostics`, all three panels return non-null data, gracefully degrades when sources unavailable
- **Stage 4 — Verified**: Kelly uses the page to catch at least one operational reality (e.g., spots that DEEP frameworks aren't firing, or that a new dormant service has appeared) under authenticated production load
- **Stage 5 — Live**: page becomes the default first-check during incidents, framework decisions, or roadmap evaluation. Sustained operational use.

**Anti-inflation guard:** Stage 3 is NOT "MAIA has full observability." Stage 3 is "the page exists and renders." The wording in commit messages and PRs must reflect this.

---

## IV. Out of scope for v0.1 (explicit deferral list)

These are tempting and **refused** in v0.1:

- **Log marker aggregation** (`[MAIA] framework-fired`, `[MAIA] conversational-block`, etc.) — would require a log-tail or structured log store. v0.1 reads from DB tables and JSON only. Log aggregation = v0.2.
- **Time-series charts** — single point-in-time snapshot only. Trend lines = v0.2.
- **Member-level filters** — aggregate-only in v0.1. Per-member drill-down has consent implications.
- **Toggle actions** — no buttons that change runtime state. Read-only.
- **Multi-engine influence scoring** — the additive `engine_provider` / `engine_model` / `influence_score` columns from `project_two_layer_sovereignty_doctrine` are a separate migration. Panel surfaces what's already in `agent_runs.source`; flags the schema gap.
- **Corpus Callosum BETWEEN path investigation** — panel surfaces the zero-row anomaly; does NOT investigate or attempt fix
- **Mobile-friendly layout** — desktop browser only
- **Export to PDF / CSV** — copy/paste from page works

---

## V. Anti-drift safeguards (load-bearing)

The diagnostic surface is itself susceptible to drift. Specific refusals built into v0.1:

### V.0 — Constitutional vs decorative (umbrella principle, Kelly 2026-05-27)

> *"The admin surface should not say 'this works.' It should show: what exists, what can be reached, what participated, what was observed, what influenced output. That keeps the monitor constitutional rather than decorative."*

**This is the discipline the other six rules instantiate.** A constitutional dashboard shows **evidence** (rows fired, addenda emitted, columns present, telemetry observed). A decorative dashboard shows **status** ("healthy", "ok", "green", "all systems operational"). The latter is comfortable; the former is honest.

**Operational test at review time:** for every cell on every panel, can the reader trace it to a specific row, log line, column, or absence? If yes → constitutional. If the cell summarizes a judgment without evidence trail → decorative. Reject decorative cells at review, even when they would feel reassuring.

### V.1 — Specific refusals

1. **No "MAIA Status: Healthy" green light.** Composite status assertions are inflation. Each panel reports its own facts; the page does not produce a synthesizing claim.

2. **No "Last verified live" timestamps without verification.** A panel saying "framework X — last fired 2 minutes ago" is acceptable. A panel saying "framework X — live" is not.

3. **Empty / zero-row states must be visible.** If Corpus Callosum BETWEEN path has zero rows, the panel renders that explicitly with the row count `0`, not hidden / omitted. Empty signal is signal.

4. **Schema gaps must be visible.** If `engine_provider` column doesn't exist yet, the panel says "schema gap: column not yet migrated" — does not hide the absence.

5. **Refused-by-design rows must be visible.** Dormant cat-4 services (QuantumFieldMemory, etc.) appear in their relevant panel with status `dormant by design — not in this sequence`. The page is a map, not a sales pitch.

6. **Each panel's "what this does NOT show" footer is mandatory.** Forces explicit omission discipline.

---

## VI. Why this sequencing is correct

This surface is **higher-leverage than building the framework monitor in isolation** because:

1. The framework monitor needs *somewhere* to be visible. Logs + `memoryHealth` JSON are not sufficient surfaces for sustained operational use.

2. The multi-engine architecture is already emitting telemetry (`agent_runs`, integration_passes) but **lacks a surface** — Kelly's framing in `project_two_layer_sovereignty_doctrine` ("under-instrumented") is partially a surfacing problem, not a collection problem.

3. The memory substrate is similarly emitting (`atoms loaded`, `sem: ok`, `MEMORY_HEALTH`) but visible only via SSH log-grep. Concentrating these in one page is force-multiplier observability.

4. **The four-axis discipline applies cross-domain.** Having one surface that applies the discipline consistently teaches the discipline operationally — each panel reinforces the others.

5. Kelly's directive *"I want to monitor everything"* names the right unit of analysis. Per-domain monitors fragment attention; unified surface concentrates it.

The framework monitor sub-spec narrows; this parent spec is the **right scope** for the operational intent.

---

## VII. Decision points (Kelly)

Before scaffold:

1. **Route: `/admin/maia/observability` or `/admin/maia/substrate`?**
   - *observability* emphasizes the function (watching)
   - *substrate* emphasizes the object of watching (what's running)
   - *Recommendation*: `/admin/maia/observability`. The function-name is more durable as the dashboard's scope evolves; "substrate" is one of the things observed, not the surface itself.

2. **Panel order on the page?**
   - *Recommendation*: Memory → Engine → Framework → Corpus Callosum → Routing → Telemetry Health. Memory first (highest operational criticality + most stable telemetry). Telemetry Health last (it's the meta-panel that watches the rest). Corpus Callosum after Engine because it's a refinement of the engine view.

3. **Refresh model: pure manual reload, or auto-refresh every N seconds?**
   - *Recommendation*: pure manual. Auto-refresh creates its own observability problem and burns DB cycles. Add a refresh button rather than auto-poll.

4. **Sanctuary visibility — row in Panel A, or refused entirely?**
   - Sanctuary's invariant is *minimal metadata* — even a count surface risks scope creep.
   - *Recommendation*: include as a single row in Panel A (Memory) showing only count + last-occurred. NO content. NO breakdown. NO per-member view. Just count+timestamp. If even that feels like creep, refuse entirely.

5. **Influence axis — how to display `not measured`?**
   - The influence axis will be `not measured` across most rows in v0.1
   - Option: gray dash `—`, or explicit text `not measured`, or omit column until measured
   - *Recommendation*: explicit text `not measured`. Omission risks reading as "measured: ok". The discipline is that absence must be visible.

6. **Influence axis migration order** — when influence eventually gets measured (Phase 2-equivalent), which arena first?
   - *Recommendation*: framework arena first (smallest scope, already has the addendum-reaches-prompt mechanism). Then engine arena (requires `influence_score` schema migration per `project_two_layer_sovereignty_doctrine`). Memory arena last (most architecturally complex).

---

## VIII. Relationship to existing specs

- **Parent of**: `FRAMEWORK_REGISTRY_MONITOR_2026-05-27.md` — framework monitor is now Panel C
- **Renders telemetry from**: `AI_ENGINE_PARTICIPATION_AUDIT_2026-05-26.md` (Panel B), `MEMORY_SERVICE_STATUS_MATRIX_2026-05-24.md` (Panel A)
- **Does NOT supersede**: any existing monitoring. SSH log markers, `memoryHealth` JSON, and `agent_runs` table queries continue to exist as ground truth. This surface is a *view* over them.
- **Adjacent but separate**:
  - `/maia/orientation` (member-facing; this is admin-facing)
  - `/labtools/reflections` (different concern; same namespace)
  - Future: `/labtools/field-lab` consent surfaces

---

## IX. Implementation sequence (Kelly 2026-05-27, load-bearing)

**This dashboard is NOT the next step.** It is step 3 of a five-step sequence. Building the unified surface before the underlying telemetry exists creates an empty shell that drifts into aspirational claims. The correct order:

```text
Step 1 — Framework monitor emits telemetry           (sibling spec: FRAMEWORK_REGISTRY_MONITOR)
Step 2 — Store/surface in memoryHealth.frameworks    (sibling spec)
Step 3 — Add admin panel card (Framework only)       (this spec, narrow scope)
Step 4 — Add adjacent cards (Engine, Memory, etc.)   (this spec, expansion)
Step 5 — Unified /admin/maia/observability dashboard (this spec, final form)
```

Steps 1–2 land first via `FRAMEWORK_REGISTRY_MONITOR_2026-05-27.md`. Only then does step 3 begin.

### Commit sequence (steps 3-5 of the above)

**Commit 1** (step 3) — `feat(observability): scaffold /admin/maia/observability route + Framework panel (Stage 3 — reachable)`
- New admin route, Kelly-gated by member-id, server-rendered, 404 on unauthorized
- Framework panel only — reads `memoryHealth.frameworks` already emitted in steps 1-2
- All five other panels stubbed as `not yet wired` placeholders (visible, honest, not hidden)
- Five-axis grammar baked in from start (impossible to add a panel that violates it)
- Anti-drift safeguards (§V) enforced in code, not just spec

**Commit 2** (step 4a) — `feat(observability): wire Memory panel (atoms / breakthrough / semantic / Phase 2 / sanctuary count)`
- Reads from existing `memoryHealth` JSON + `agent_runs` queries
- Episodic row marked `not yet wired` explicitly — NO fake `ok`

**Commit 3** (step 4b) — `feat(observability): wire Engine panel (cognitive-mode + inference-engine two-axis)`
- Reads `agent_runs.element` + `agent_runs.source`
- Flags schema gap for `engine_provider` / `engine_model` / `influence_score` (additive migration is a separate spec)
- WisdomRouter integration rate + BETWEEN/DEEP zero-row anomalies surfaced

**Commit 4** (step 4c) — `feat(observability): wire Corpus Callosum / Voices panel`
- Per-voice firing count from `agent_runs.agent_name`
- VoiceDistinctionScorer trace integration if available
- Silent convergence detection (homogenization warning)

**Commit 5** (step 4d) — `feat(observability): wire Routing / Tiers panel`
- Per-tier turn count + addenda-reach state
- DEEP-tier divergence-debt surfaced explicitly

**Commit 6** (step 5) — `feat(observability): wire Telemetry Health (meta-observability) — Stage 3 complete`
- Self-referential — watches the watchers
- Surfaces missing fields, stale traces, dormant-but-claimed systems
- This is the *load-bearing anti-drift instrument*; without it the dashboard itself drifts

No member-facing changes. No registry changes. No write actions. No new telemetry collection at any commit. Each commit is reversible by revert without affecting runtime.
