# JARVIS-TINKER-DIRECT-WITNESS-01 / T1 — Founder Adjudication

**Date:** 2026-09-21  
**Class:** documentary adjudication only  
**Accepted substrate:** `b40558cdac92258472053cdfdf11f4846431bb1d`

> **T1 WITNESS EVIDENCE ACCEPTED · MODEL STANDINGS ADJUDICATED · NO EXECUTABLE PROMOTION**

## I. Accepted supporting evidence

The Founder accepts the completed T1 direct-Tinker witness and its supporting mechanical evidence:

- direct Tinker transport: `12/12 PASS`;
- canonical child credential custody: `4/4 PASS`;
- external evidence membrane: `9/9 PASS`;
- provider/routing governance: `44/44 PASS`;
- repository remained clean;
- production remained untouched;
- no retry was performed;
- no credential value was printed, persisted, or copied into evidence;
- provider output created evidence only and did not create authority or canonical standing.
## II. Model adjudications

### 1. `thinkingmachines/Inkling-Small`

Accepted evidence:

- exact requested/provider model identity witnessed;
- direct Tinker transport witnessed;
- Keychain credential custody witnessed;
- structured text response received;
- no tool-use anomaly.

**Standing:** `LIVE_TRANSPORT_WITNESSED`

### 2. `thinkingmachines/Inkling`

Accepted evidence:

- exact requested/provider model identity witnessed;
- direct Tinker transport witnessed;
- Keychain credential custody witnessed;
- structured text response received;
- no tool-use anomaly.
**Standing:** `LIVE_TRANSPORT_WITNESSED`

### 3. `nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16`

Accepted evidence:

- exactly one authorized live request was performed;
- direct Tinker adapter failed closed with `EMPTY_PROVIDER_RESPONSE`;
- no fallback was performed;
- no retry was performed.

**Standing:** `LIVE_WITNESS_FAILED · HOLD`

Nemotron 3.5 Lightning remains held pending a separately authorized diagnostic act.

### 4. `nvidia/NVIDIA-Nemotron-3-Ultra-550B-A55B-BF16`

Accepted evidence:

- exact requested/provider model identity witnessed;
- direct Tinker transport witnessed;
- Keychain credential custody witnessed;
- exact witness response returned;
- `stop_reason=end_turn`.

**Standing:** `LIVE_TRANSPORT_WITNESSED · CLEAN PASS`
## III. Explicit non-authorizations

This adjudication accepts witness evidence only.

It does **not**:

- authorize unrestricted or routine Tinker use;
- promote any model beyond the standing explicitly adjudicated here;
- repair or alter `frontier-worker.js`;
- repair or alter `scripts/ain-delegate.sh`;
- open NVIDIA/OpenCode credential custody;
- alter the OpenCode D2 containment lane;
- merge any branch;
- deploy any artifact;
- mutate production.

## IV. Standing of the transport contract

The direct-Tinker transport contract remains unchanged:

- one provider request per witness attempt;
- no tools;
- no filesystem access;
- no repository mutation by the model;
- no retries;
- no production mutation;
- credential value remains in the short-lived provider child;
- no credential value may enter durable evidence;
- provider output is evidence only and cannot mint authority or standing.
## V. Consequence

The accepted T1 evidence establishes differentiated model standing rather than a family-wide promotion:

| Model | Adjudicated standing |
|---|---|
| Inkling-Small | `LIVE_TRANSPORT_WITNESSED` |
| Inkling | `LIVE_TRANSPORT_WITNESSED` |
| Nemotron 3.5 Lightning 30B | `LIVE_WITNESS_FAILED · HOLD` |
| Nemotron 3 Ultra 550B | `LIVE_TRANSPORT_WITNESSED · CLEAN PASS` |

No runtime routing policy is changed by this record.

No provider is made routine, default, canonical, or unrestricted by this record.

## VI. Next boundary

The next act for Nemotron 3.5 Lightning, if desired, is a separately authorized diagnostic witness.

OpenCode sibling debt remains separate: this adjudication does not repair the obsolete `--pure` usage previously observed in the frontier or AIN delegate OpenCode lanes.
