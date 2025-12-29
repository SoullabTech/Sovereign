# Forensic Audit Pack — Memory Pipeline Observability System
**Date:** December 29, 2025
**Status:** COMPLETE
**Branch of record:** `clean-main-no-secrets`
**Impact:** Infrastructure / Observability / Debuggability (content-free metrics)

---

## What shipped
A **forensic-grade, content-free audit layer** for the memory pipeline — designed to answer, quickly and reliably:

- *Did memory retrieval run?*
- *Was recall injected?*
- *Was recall quality acceptable?*
- *Is the bundle getting bloated / noisy?*
- *Are we accidentally "recalling" from only cross-session?*
- *Can we deterministically trigger failure modes in dev without touching content?*

This pack introduces:
- **Structured audit log:** `[Audit:MemoryPipeline]` with stable fields
- **healthFlags taxonomy**: grep-able signals for pipeline health + debugging
- **Simulation headers** (dev-only) behind a **double gate**
- **SIM_IGNORED breadcrumb** when someone tries sim headers without the gate
- **Integration tests** covering sim behavior (gate ON/OFF)

---

## Design principles
### 1) Content-free observability
Everything here is **counts + scalars**, not user text. The audit stream is safe to grep and safe to store.

### 2) Deterministic calibration
Hard-to-trigger conditions are made testable via **dev-only simulation headers**, with explicit gating.

### 3) Production safety
Simulation headers are **inert** unless:
- `NODE_ENV !== 'production'`
- `MAIA_MEMORY_SIM_HEADERS=1`

---

## healthFlags (canonical taxonomy)
These flags are designed to be:
- **grep-able**
- **stable**
- **meaningful**
- **content-free**

| Flag | Trigger | Meaning |
|---|---|---|
| `pipeline_missing` | `!memPipeline` | Orchestrator didn't return pipeline metadata (or simulated missing) |
| `retrieval_zero` | `turnsRetrieved === 0 && bundleChars === 0` | Pipeline ran but retrieved nothing and injected nothing |
| `bloat_high_recall_low` | `bloatRisk > WARN_BLOAT && recallQuality < WARN_RECALL` | We may be injecting noisy recall / degraded relevance |
| `big_bundle_zero_semantic` | `bundleChars > 1800 && semanticHits === 0` | Big bundle assembled without semantic hits (suspicious) |
| `all_cross_session` | `turnsCrossSession > 0 && turnsSameSession === 0 && turnsRetrieved >= 8 && bulletsInjected > 0` | Meaningful recall came only from prior sessions |

---

## Simulation headers (double-gated)
These headers exist purely for **calibration / deterministic testing**.

**Gate required:**
- `NODE_ENV !== 'production'`
- `MAIA_MEMORY_SIM_HEADERS=1`

### Supported sim headers
| Header | Effect |
|---|---|
| `x-maia-simulate-pipeline-missing: 1` | Forces `memPipeline = null` → triggers `pipeline_missing` |
| `x-maia-simulate-zero-semantic: 1` | Forces `semanticHits = 0` |
| `x-maia-simulate-big-bundle: 1` | Forces `bundleChars >= 2000` |
| `x-maia-simulate-low-thresholds: 1` | Forces `WARN_BLOAT=0`, `WARN_RECALL=100` → guarantees `bloat_high_recall_low` when real metrics exist |

---

## SIM_IGNORED breadcrumb (self-documenting)
If someone attempts sim headers **without the gate**, we emit:

`[Audit:MemoryPipeline:SIM_IGNORED]`

Example:
```js
[Audit:MemoryPipeline:SIM_IGNORED] {
  reqId: 'req_...',
  headers: [ 'x-maia-simulate-low-thresholds' ],
  reason: 'gate_disabled',
  gate: { nonProd: true, simEnvEnabled: false }
}
```

This makes diagnosis instant:

* `nonProd: true` → non-production check passed
* `simEnvEnabled: false` → env gate blocked it

---

## Calibration pack (deterministic smoke)

**Gate ON**:

1. Start dev with gate enabled

```bash
pkill -f "next dev" 2>/dev/null
rm -rf .next/cache
MAIA_MEMORY_SIM_HEADERS=1 npm run dev > /tmp/maia-dev.log 2>&1 &
```

2. Run the 4 deterministic checks:

```bash
PORT=3000

# 1) pipeline_missing
curl -s "http://localhost:$PORT/api/between/chat" -X POST \
  -H 'content-type: application/json' \
  -H 'x-maia-simulate-pipeline-missing: 1' \
  -d '{"userId":"cal-1","message":"ping"}'

# 2) retrieval_zero (fresh user)
curl -s "http://localhost:$PORT/api/between/chat" -X POST \
  -H 'content-type: application/json' \
  -d '{"userId":"cal-fresh-xyz","message":"ping"}'

# 3) big_bundle_zero_semantic
curl -s "http://localhost:$PORT/api/between/chat" -X POST \
  -H 'content-type: application/json' \
  -H 'x-maia-simulate-big-bundle: 1' \
  -H 'x-maia-simulate-zero-semantic: 1' \
  -d '{"userId":"cal-3","message":"ping"}'

# 4) bloat_high_recall_low (forced thresholds)
curl -s "http://localhost:$PORT/api/between/chat" -X POST \
  -H 'content-type: application/json' \
  -H 'x-maia-simulate-low-thresholds: 1' \
  -d '{"userId":"kelly-nezat","message":"ping"}'

# Inspect latest flags
grep "healthFlags" /tmp/maia-dev.log | tail -10
```

**Gate OFF**:

```bash
pkill -f "next dev" 2>/dev/null
rm -rf .next/cache
npm run dev > /tmp/maia-dev-no-sim.log 2>&1 &
```

Then send any sim header → expect:

* sim effects **blocked**
* SIM_IGNORED **logged** with gate diagnostics

---

## Operational notes

* This system is meant to be **boringly reliable**:
  * Low overhead
  * Content-free
  * Highly grep-able
  * Safe in production
* Simulation headers are **debug utilities**, not "features." Keep them gated and out of user-facing surfaces.

---

## Commit chain (for provenance)

| Hash | Description |
|------|-------------|
| `78e9dc3a8` | Rename `gate.nodeEnv` to `gate.nonProd` for clarity |
| `82a52cc02` | Add gate diagnostics to SIM_IGNORED log |
| `7cd2ab941` | Add SIM_IGNORED breadcrumb + low-thresholds header |
| `e82a9fc71` | Double-gate integration tests + boot warning |
| `d0fad3475` | Simulation headers for big_bundle_zero_semantic |
| `5a12fd6d1` | Double-gate simulation header |

---

## Next optional evolutions

* Add a tiny "audit dashboard" view (counts over time per user/session)
* Promote `healthFlags` into CI smoke tests (non-prod only)
* Add a "warn" gate to emit warnings only when certain flags recur
