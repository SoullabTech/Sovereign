# Developmental Layer — 0/100/0 Audit (2026-05-26)

**Purpose.** Verify whether `developmental — Wired, unobserved — 0 / 100 / 0 — Recurring themes, growth arcs` is accurate or inherited from older language. **Audit before drafting any Cat 4→6 path doc** (Kelly directive 2026-05-26).

**Key question:** *Does Developmental have a live caller into the MAIA runtime path, or only dormant service code?*

---

## I. Four-file picture (the matrix entry covers only one)

| File | LOC | Callers (main repo, exc. worktrees) | Status |
|---|---|---|---|
| `lib/memory/DevelopmentalMemory.ts` | 415 | `app/api/between/chat/route.ts:50`, `lib/memory/ConsciousnessMemoryLattice.ts:32` | **Live writer** for `developmental_memories` table |
| `lib/consciousness/memory/ConsciousnessEvolutionService.ts` | 448 | `lib/consciousness/memory/MemoryPalaceOrchestrator.ts:13` (which is called only by `app/api/oracle/conversation/route.ts:46` — low-traffic per anchor) | **Cat 4 rename target** in matrix (file row L38) |
| `lib/ain/ConsciousnessEvolutionSystem.ts` | 570 | not yet traced | Out of audit scope (separate from `developmental_memories` track) |
| `lib/services/ConsciousnessEvolutionOrchestrator.ts` | 442 | not yet traced | Out of audit scope |

**Finding:** the status-matrix entry (`MEMORY_SERVICE_STATUS_MATRIX_2026-05-24.md` L38) refers to `ConsciousnessEvolutionService.ts` only — a *different* file from the active developmental track. Matrix language ≠ layer-level status.

---

## II. Live caller into MAIA runtime path — YES

`loadRecentDevelopmentalMemories` imports and calls, traced across all routes:

| File | Line | Notes |
|---|---|---|
| `app/api/sovereign/app/maia/list/route.ts` | 106 (import), 682 (call) | **LIVE FAST/CORE/DEEP route per anchor** |
| `app/api/sovereign/app/maia/route.ts` | 39, 225 | sibling route |
| `app/api/oracle/conversation/route.ts` | 127, 630 | low-traffic per anchor (wire-site audit) |
| `app/api/between/chat/route.ts` | 49, 1867 | separate endpoint |
| `lib/maia/memoryLoaders.ts` | 87 | function definition |

**The live MAIA list route calls `loadRecentDevelopmentalMemories(userId, 3)` every turn.** This is not "0 callers" / dormant — this is wired into the main FAST/CORE/DEEP conversation path.

---

## III. What the data does after loading (the critical seam)

From `app/api/sovereign/app/maia/list/route.ts` lines 690–740:

```ts
// recentDevelopmentalMemories is passed into the memoryPlan orchestrator
// (alongside recentThemeSignals) — but only the recentThemeSignals appears
// as a direct memoryPlan input in the visible block.
// Count surfaces in the inactive-branch log:
console.log('[MAIA/sovereign] memory-plan inactive', {
  userId: userId.slice(0, 8) + '...',
  developmentalCount: recentDevelopmentalMemories.length,
  themeCount: recentThemeSignals.length,
  msgLen: message.length,
});
memoryInfluenceAddendum = memoryPlan.promptBlock || undefined;
```

**Three observability paths exist:**

1. **`memoryHealth.developmental`** — typed field at `lib/maia/memoryHealth.ts:67,181` (LayerStatus). Count reaches the health object.
2. **Log line** — `[MAIA/sovereign] memory-plan inactive { developmentalCount: N }`. Fires in the "inactive" branch only.
3. **`memoryInfluenceAddendum`** (potential prompt) — if `memoryPlan.shouldUseMemory || semanticCandidate || somaticCandidate || morphicCandidate || contradictionDetected || reinforcementCandidate`, an addendum is built. Whether developmental data is actually *in* that addendum depends on the orchestrator's planning logic (not yet traced).

**Critical gap (line 825–846 addenda dict):**

```ts
forwardReadiness: ...,
atoms: atomsAddendum,
memberWeb: ...,
astrology: ...,
studio: ...,
knowledgeGate: ...,
wuxing: ...,
conversational: conversationalRecallAddendum,
// NO `developmental:` field
```

There is **no dedicated `developmental` addenda channel** at the MaiaContext layer. Developmental data, if it reaches the prompt at all, goes through `memoryInfluenceAddendum` (the memory-plan synthesis path) — *not* the per-layer addenda channel the conversational/atoms layers use.

---

## IV. Cut 2 Spiral Orientation block is PARKED

Lines 838–860 (the "🌀 Cut 2 — read-only developmental context" block):

```ts
// PARKED: orientation thread is design-only until spine is verified.
// Do not re-enable without:
//   1. explicit Cut 2 authorization,
//   2. reconciliation of import path (lib/maia vs lib/orientation),
//   3. reconciliation of return shape ...
// let spiralOrientation: SpiralOrientationResult | undefined;
// (entire block commented out)
```

The Cut 2 path is **architecturally present but commented out**. Spiral Orientation is *not* feeding developmental context to the prompt today.

---

## V. Operational discoverability — FAIL

Standard Ops diagnostic (CLAUDE.md anchor): `grep -E "MAIA/runtime|atoms loaded|MEMORY_HEALTH|conversational-block"`.

The developmental log marker is `[MAIA/sovereign] memory-plan inactive { developmentalCount }`. **This does not match the operational grep contract.** Per [[project_observability_emission_plus_discoverability]]: emission without grep-match = silent under normal ops.

**Status:** signal *emitted* (axis 1) but **not discoverable** (axis 2) via the existing ops vocabulary.

---

## VI. Audit answer to Kelly's classification rule

| Kelly's rule | Verdict |
|---|---|
| If no live caller → `Cat 3/4 dormant, not wired-unobserved` | ❌ does not apply — live callers exist |
| If live caller but no emitted rows → `wired-unobserved` | ⚠️ partial — caller exists, emission exists at `memory-plan inactive` log, **but rows-in-DB unverified** |
| If emitted rows but no auth pattern → `observed-runtime, not live-member-use` | ⚠️ cannot evaluate yet — need DB query |

**Conclusion:** the "0/100/0 Wired, unobserved" label is **partially inherited and partially still accurate**:

- **Inherited from the matrix entry** that referred to `ConsciousnessEvolutionService.ts` (Cat 4 rename target with 0 callers) — that file genuinely is dormant.
- **Still accurate** for the developmental *layer* on three axes: (a) no dedicated addenda channel into prompt, (b) Cut 2 Spiral Orientation block is parked, (c) marker not on the operational grep contract.
- **No longer accurate** as a "0 callers" claim — `loadRecentDevelopmentalMemories` runs every turn on the live MAIA list route, and `developmentalCount` flows to `memoryHealth.developmental`.

---

## VII. Remaining unknowns before classification can finalize

1. **DB rows** — `SELECT count(*) FROM developmental_memories WHERE user_id IS NOT NULL` (production). Without this, cannot confirm whether the layer has substrate to surface.
2. **Trace `recentDevelopmentalMemories` into `memoryPlan`** — does it influence the synthesized prompt block, or is it purely log-only?
3. **Production log presence** — does `[MAIA/sovereign] memory-plan inactive` actually fire, and at what rate? (Requires `ssh minisforum` grep beyond standard contract.)
4. **Write-path frequency** — `between/chat` route activity vs. main `sovereign/maia/list` activity. If writes only happen on a side endpoint, the read path has nothing to surface.

---

## VIII. Hold — do not draft path doc yet

Per Kelly's ordering: audit → classify → only then path. Classification (task #2) is now unblocked but needs answers to §VII before it can be sharper than "hybrid Cat 3 (write-path side-channel) + Cat 6-adjacent observability (read-path live, prompt-path absent)."

**Drift canary observed during audit:** the matrix-row-as-layer-status conflation is exactly the [[project_substrate_crossing_scaffold]] axis 1 vs axis 5 confusion — *file-level* dormancy (Cat 4 rename target) was being read as *layer-level* dormancy. They are not the same.

**Sibling:** [[project_observability_emission_plus_discoverability]] (marker not on ops grep), [[project_latent_vs_reachable_structure]] (developmental is partly latent, partly reachable along different axes), [[project_six_category_artifact_typology]] (one substrate can sit in multiple categories along different operational axes).

---

## IX. Production checks (2026-05-26 run)

Four checks run sequentially per Kelly's instruction. Results invalidate two parts of §III–§VII.

### Check 1 — Row count

```sql
SELECT count(*) FROM developmental_memories;  -- 675
```

### Check 2 — Distribution by member

```
ce284751  475   ← Kelly (primary tester)
bce7a472   72
3946706a   50
3e265a4f   30
2cea65b7   22
17a14614   10
+ 4 more (≤7 each)
```
**10 distinct members have developmental memories.** Substrate is populated.

### Check 3 — runtime_events.memory_layers.developmental (last 24h)

```
member_id_prefix | developmental | count
ce284751         | empty         | 9
7ce3b84c         | empty         | 1
```

**Contradiction.** Member `ce284751` has **475 rows** in `developmental_memories` but `runtime_events.memory_layers.developmental = 'empty'` across 9 turns in the last 24h. Per Kelly's matrix: **"Rows exist + health says empty = loader/filter/user binding problem."**

### Check 4 — Production logs (last 24h)

```
• [developmental] clarity emerging; moving from de...
[MAIA/sovereign] memory-plan {
  sources: [ 'developmental_memory', 'theme_signals' ],
✅ [MemoryWriteback] Promoted to developmental_memories: 044b1ebb-...
```

**Three things this proves my audit got wrong:**

1. **Prompt-influence is NOT absent.** The `• [developmental] clarity emerging; moving from de...` line is a formatter output — the layer IS being rendered into something the prompt consumes. My §III conclusion ("no dedicated `developmental` addenda channel") was correct at the MaiaContext layer but missed that `memoryInfluenceAddendum` (memory-plan synthesis) is itself the developmental conveyor when sources includes `developmental_memory`.
2. **`memory-plan` sources actively includes `developmental_memory`.** Not occasional — recurring across many turns in the 24h window.
3. **Writeback is active.** `MemoryWriteback` is promoting raw memories into `developmental_memories` table — write path is not just `between/chat`, there's an internal promotion service.

---

## X. Classification (task #2 verdict)

**Developmental layer is functionally Cat 6 along four axes, but observability-bugged on the fifth.**

| Five-axis scaffold ([[project_substrate_crossing_scaffold]]) | Status |
|---|---|
| 1. Latent ↔ reachable | ✅ reachable — loader called every turn |
| 2. Emitted ↔ discoverable | ⚠️ partial — `[MAIA/sovereign] memory-plan` emits but **not on canonical ops grep** (`MAIA/runtime|atoms loaded|MEMORY_HEALTH|conversational-block`) |
| 3. Verified ↔ sustained | ❌ cannot evaluate — runtime_events says `empty`, blocking the observability chain that would prove sustained surfacing |
| 4. Empty ↔ failure-empty | ❌ **failure-empty masquerading as empty** — same pattern as the semantic atoms bug just fixed |
| 5. Architectural presence ↔ measurable persistence | ⚠️ architectural use is measurable in logs (memory-plan sources); persistence claim via runtime_events is broken |

**Verdict:** *Developmental is more wired than the matrix suggested AND more broken in its observability than my audit suggested.* It is **NOT** Cat 4 dormant. It is **NOT** Cat 6 Live-Under-Member-Use either — because the `memoryHealth.developmental → runtime_events` binding is reporting `empty` despite active use, which means the sustained-pattern evidence we'd need cannot be confirmed.

**Position in the typology:** functionally Cat 6 with a failure-empty observability bug. Same shape as the atoms loader bug that closed yesterday — and the same fix archetype applies.

**Historical-accuracy note** (per [[project_substrate_crossing_scaffold]] — *the substrate existed before it became observable*): the matrix language "Wired, unobserved" was *directionally honest* about the layer (live underneath, invisible to observability), but the "0 callers" implication was inherited from the file-row entry for a different file. Do not retroactively rewrite this as "developmental was never wired" once the observability fix lands — the substrate has been live; we just couldn't see it.

---

## XI. Fix archetype (same shape as atoms)

To make Developmental verifiable as Cat 6 live-under-member-use, the same five-step pattern as the atoms loader fix:

1. **Diagnose the empty contradiction** — trace `buildMemoryHealth` call site in `app/api/sovereign/app/maia/list/route.ts` for the `developmental` input. Likely: filter mismatch (e.g. `valid_to IS NULL` filter in loader vs. schema with no `valid_to` column populated for promoted rows) OR the developmental input is being passed as empty array to `buildMemoryHealth` despite the loader returning rows.
2. **Align log marker to ops grep contract** — current `[MAIA/sovereign] memory-plan { sources: [...] }` is informative but porous; add or rename to `[MAIA/sovereign] developmental-block { emitted, surfacedCount, ... }` matching the conversational-block / atoms-loader pattern.
3. **Verify runtime_events.memory_layers.developmental transitions from `empty` → `ok`** under authenticated member load (ce284751 has 475 rows, will trigger on first turn after fix).
4. **Sustain across non-trivial window** (per scaffold axis 3 — not single OK row).
5. **Then** Cat 6 Live-Under-Member-Use crossing is real, and the 0/100/0 matrix label can be retired without retroactive erasure of the live-but-invisible prior period.

**This means developmental is closer to verifiable Cat 6 than episodic.** Episodic was the planned next-substrate per anchor §next-actions step 5. But developmental has the substrate populated, the loader live, the orchestrator using it, and the writeback active — it's just observability-bugged. *This may invert the sequence.*

---

## XII. Root cause confirmed (2026-05-26)

**Single-line call-site omission.** Not a loader bug, not a filter mismatch, not a user-binding problem. The `developmental` input is simply not passed to `buildMemoryHealth`.

### The contract

From [lib/maia/memoryHealth.ts:113-128](lib/maia/memoryHealth.ts:113):

```ts
function layerStatus(input?: { count?: number; present?: boolean; error?: boolean }): LayerStatus {
  if (!input) return 'empty';     // ← undefined input → 'empty'
  if (input.error) return 'error';
  if (typeof input.count === 'number') {
    return input.count > 0 ? 'ok' : 'empty';
  }
  ...
}
```

And the interface explicitly documents the contract ([memoryHealth.ts:91-104](lib/maia/memoryHealth.ts:91)):

> *undefined or null inputs are treated as 'empty' (loader didn't run, or layer not wired in this cut)*

### The omission

[app/api/sovereign/app/maia/list/route.ts](app/api/sovereign/app/maia/list/route.ts) — `buildMemoryHealth` call site:

```ts
const memoryHealth: MemoryHealth = buildMemoryHealth({
  recentTurns: { count: session.turn_count ?? 0 },
  session: { present: !!session },
  relational: { present: !!(memoryBundle as any)?.recentTurns?.length || !!memoryBundle },
  semantic: { count: atomsResult.length, error: atomsError },
  conversational: { count: priorExchangesCount },
  // ❌ developmental: NOT PASSED — despite recentDevelopmentalMemories existing
});
```

`recentDevelopmentalMemories` is loaded at line 682 of the same file and used by the `memoryPlan` orchestrator immediately after — but never piped into `buildMemoryHealth`. The contract honors what it's told: `inputs.developmental === undefined` → `layerStatus(undefined)` → returns `'empty'` → written to `runtime_events.memory_layers.developmental = 'empty'`.

### Why this is the entire bug

- Loader works: 675 rows in `developmental_memories`, returns to caller every turn (confirmed by §IX check 4: `memory-plan { sources: [developmental_memory, ...] }`)
- Memory-plan orchestrator uses it: prompt-influence is real (confirmed by `• [developmental] clarity emerging` formatter line)
- `buildMemoryHealth` simply isn't told. Period.

### Fix shape

One line added to the `buildMemoryHealth` call:

```ts
developmental: { count: recentDevelopmentalMemories.length },
```

That's the entire fix. Same archetype as the FAST tier conversational wire-site fix in commit `f74ab4204` — call-site omission, not deeper architecture problem.

### Pattern this fits

- [[project_observability_emission_plus_discoverability]] — substrate emits (memory-plan log + writeback log + formatter line), but `runtime_events.memory_layers.developmental` was never wired into the discoverability surface
- [[project_latent_vs_reachable_structure]] — developmental is reachable via the prompt path (orchestrator uses it), but unreachable via the health path (call site never passed it)
- [[project_successive_collapse_of_possibility_space]] — the four production checks eliminated three entire classes (no rows / loader broken / orchestrator not consuming) in one pass; the remaining class was call-site omission, which became obvious once the alternatives were ruled out

### What's NOT yet verified

Even after the one-line fix and deploy:

- **Stage 5 sustained pattern** under authenticated load (per [[project_substrate_crossing_scaffold]] axis 3) — requires repeated `developmental: ok` rows in `runtime_events` across a non-trivial window for the 10 members with rows
- **Ops grep contract** — the developmental signal still needs a discoverable marker matching the canonical grep (`MAIA/runtime|atoms loaded|MEMORY_HEALTH|conversational-block`). Adding `developmental` to the regex is part of the fix
- **Prompt-influence verification** — the `• [developmental] clarity emerging` line is suggestive, but should be traced to confirm the developmental block actually reaches the model (vs. being constructed and then discarded somewhere)

### Sequence implication (hold per Kelly directive)

Anchor next-actions §5 (Episodic Phase 2 spec) and §6 (dormant cleanup including the `ConsciousnessEvolutionService` rename) may both be displaced — not because developmental "leapfrogs," but because **developmental is already wired and just needs the observability binding completed**. The Cat 6 crossing candidate that's closest to verifiable is developmental, not episodic. *Anchor update held until the fix lands and is verified — direction from Kelly.*
