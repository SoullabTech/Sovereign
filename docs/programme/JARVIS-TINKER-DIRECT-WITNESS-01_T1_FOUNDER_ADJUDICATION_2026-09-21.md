# JARVIS-TINKER-DIRECT-WITNESS-01 / T1 — Founder Adjudication

**Date:** 2026-09-21  
**Class:** documentary adjudication only  
**Exact substrate:** `b40558cdac92258472053cdfdf11f4846431bb1d`

## Founder adjudication

The Founder accepts the completed T1 direct-Tinker witness and the recorded mechanical evidence.

Accepted supporting evidence:

- direct Tinker transport: `12/12 PASS`;
- canonical child credential custody: `4/4 PASS`;
- external evidence membrane: `9/9 PASS`;
- provider/routing governance: `44/44 PASS`;
- repository remained clean;
- production remained untouched;
- no retry was performed;
- no credential value was printed, persisted, or copied into evidence;
- provider output created evidence only and did not create authority or canonical standing.

No provider call is performed by this adjudication record.

## Adjudicated model standings

### 1. thinkingmachines/Inkling-Small

- exact requested/provider model identity witnessed;
- direct Tinker transport witnessed;
- Keychain credential custody witnessed;
- structured text response received;
- no tool-use anomaly observed.

**Standing:** `LIVE_TRANSPORT_WITNESSED`

### 2. thinkingmachines/Inkling

- exact requested/provider model identity witnessed;
- direct Tinker transport witnessed;
- Keychain credential custody witnessed;
- structured text response received;
- no tool-use anomaly observed.

**Standing:** `LIVE_TRANSPORT_WITNESSED`

### 3. nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16

- one authorized live request was performed;
- direct Tinker adapter failed closed with `EMPTY_PROVIDER_RESPONSE`;
- no fallback occurred;
- no retry occurred;
- no authority expansion occurred.

**Standing:** `LIVE_WITNESS_FAILED · HOLD`

Lightning remains held pending a separately authorized diagnostic act.

### 4. nvidia/NVIDIA-Nemotron-3-Ultra-550B-A55B-BF16

- exact requested/provider model identity witnessed;
- direct Tinker transport witnessed;
- Keychain credential custody witnessed;
- exact witness response returned;
- `stop_reason=end_turn`;
- no tool-use anomaly observed.

**Standing:** `LIVE_TRANSPORT_WITNESSED · CLEAN PASS`

## Boundaries preserved

This adjudication accepts witness evidence only.

It does not:

- authorize unrestricted or routine Tinker use;
- promote any model beyond the standing explicitly adjudicated here;
- repair or alter `frontier-worker.js`;
- repair or alter `scripts/ain-delegate.sh`;
- open NVIDIA/OpenCode credential custody;
- alter the OpenCode D2 containment lane;
- authorize merge;
- authorize deployment;
- mutate production.

## Post-adjudication lane state

The direct-Tinker witness lane is adjudicated at T1.

Separate outstanding lanes remain:

1. **Global OpenCode F1 debt** — `frontier-worker.js` and the AIN OpenCode delegate still contain obsolete `--pure`. This requires a separately authored repair act because those lanes have materially different execution contracts.
2. **Nemotron 3.5 Lightning diagnosis** — `EMPTY_PROVIDER_RESPONSE` remains held for a separately authorized diagnostic act. No retry is implied by this record.
3. **NVIDIA/OpenCode credential custody** — remains unopened. Ambient `NVIDIA_API_KEY` must not be reintroduced into the canonical OpenCode allowlist as a shortcut.

## Closure

`T1 FOUNDER ADJUDICATED`

The accepted evidence changes documentary standing only. No provider execution, model promotion, merge, deployment, or production mutation occurs under this record.
