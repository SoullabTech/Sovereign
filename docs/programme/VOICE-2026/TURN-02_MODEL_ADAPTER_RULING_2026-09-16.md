# TURN-02 — Predictor Adapter / License Boundary

**Date:** 2026-09-16
**State:** research adapter OPEN · live authority CLOSED

## Selection

### Acoustic/prosodic candidate — MaAI / VAP

MaAI is the first acoustic shadow candidate because it is real-time, CPU-capable, supports turn-taking and backchannel prediction, and exposes single-channel VAP output for one 16 kHz microphone stream. The mono output is kept raw as `p_now` (0–600 ms future activity) and `p_future` (600–2000 ms future activity). No weighting from those values into a floor decision is frozen here.

### Semantic candidate — Kyutai STT 1B semantic VAD

Kyutai is the second, semantic lane. Its 1B streaming STT includes semantic end-of-turn prediction and its model weights are CC-BY 4.0. Current Kyutai product documentation says semantic VAD is exposed in the Rust server; the MLX/on-device implementation is not yet the semantic-VAD production path. Therefore TURN-02 does not assume iPhone semantic VAD exists merely because the 1B MLX STT can run on iPhone-class hardware.

## License law

**Source-code license and model-weight license are separate custody facts.**

- MaAI source: MIT — acceptable as code.
- Generic MaAI English VAP weights observed on Hugging Face: CC-BY-NC-ND-4.0 — research reference only; not a Soullab commercial production dependency.
- `vap_mc_en_kyoto`: MIT-labeled weights — eligible for research/benchmark integration, subject to technical fitness.
- Mono-VAP English weight license: not assumed. Until an explicit model-card/license witness says otherwise, status is **UNVERIFIED · NO PRODUCTION USE**.
- Kyutai STT weights: CC-BY 4.0; code paths are MIT/Apache as documented upstream. Attribution obligations travel with any adoption.

No runtime may select a model whose exact weight license has not been recorded.

## Architecture law

Predictors emit raw evidence through `turnPredictorPort.ts`. Adapters may normalize field names and validate ranges; they may not decide WAIT/YIELD. Calibration from raw model output into TURN-02 arbiter probabilities belongs to MAIA-TURN-BENCH and must be benchmarked.

## Next experiment

1. Validate `maai` package import/runtime footprint in an isolated Mac Studio research environment without downloading weights.
2. Establish an MIT-weight experiment if technically suitable.
3. Feed derived scores into MAIA-TURN-BENCH-01.
4. Keep all live Conversation behavior shadow-only until a separate promotion act.
## 2026-09-16 candidate succession

The MaAI mono architecture remains a valid reference, but current English mono weights live in the noncommercial `vap_en` repository. The MIT `vap_en_kyoto` repository does not currently include a mono checkpoint. Therefore MaAI does not advance as the first real English shadow asset.

`anyreach-ai/dualturn-endpointing` succeeds it for the first real shadow benchmark: Apache-2.0 model repository, CC-BY-4.0 Mimi base, self-contained streaming ONNX, documented user-only mono fallback, and no cloud/runtime framework dependency beyond ONNX Runtime + NumPy. This is candidate succession, not a change to the TURN-02 constitutional boundary: predictors remain evidence only.
