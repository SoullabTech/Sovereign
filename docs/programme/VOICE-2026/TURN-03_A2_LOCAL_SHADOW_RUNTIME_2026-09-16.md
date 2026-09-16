# TURN-03 A2 — Local Shadow Runtime

**Date:** 2026-09-16
**State:** PASS AS SHADOW RUNTIME · NO LIVE TURN AUTHORITY
**Candidate:** DualTurn Endpointing `stream_tick.onnx`
**A1 selection:** `7ac17a0abf50f3382c9c2c84c9b5ed93630779e3`

## Exact custody

- Model repository: `anyreach-ai/dualturn-endpointing`
- Model revision: `c3860ed71210fe0144af35af340fd7a4dec3d2d3`
- Runtime graph: `/private/tmp/dualturn-shadow-candidate/stream_tick.onnx`
- Runtime graph SHA-256: `6700ea2f919b4c66355b3dafb4f91f2db9dae9e18a302b812730c04340bf819f`
- Sidecar SHA-256: `7cbbfb56de18721449e95ef7bd5a9ba51343e7e676ce74ed6567853c22282193`
- Resampler SHA-256: `e97e7e12c966efa6e2a7df2bebe29263a2d589ddc319ece0da98d3cc2fe4f742`
- Model license: Apache-2.0; base Mimi attribution obligation CC-BY-4.0
- Runtime: Python 3.11.14; NumPy 2.4.6; ONNX Runtime 1.30.0; CPUExecutionProvider; 4 intra-op threads
- Network model resolution: OFF

## Ingress law

TURN-03 keeps the product-facing ingress at mono PCM16 16 kHz. DualTurn requires 24 kHz. A2 therefore applies one explicit research-only conversion outside the model adapter using `StreamingPcm16Resampler(16000, 24000)`. The model receives CH0 = member fixture and CH1 = synthetic zeros inside the sidecar. No second microphone exists.

The 32.0000625 s witness produced 768000 24 kHz samples in both one-shot and chunked conversion. Their SHA-256 values are identical: `8cc6d265f6e390500232bb188e58182ae4fb59154f7117ceffce5d36bcb6935f`. Sequence continuity was 400/400 frames with zero buffered tail.

## Real-time runtime witness

The load-bearing evidence is `evidence/TURN-03-A2-DUALTURN-LOCAL-RUNTIME-20260916/A2_LONG_PACED_EVIDENCE.json`, preserved verbatim from the local run.

- 400 predictions / 400 declared frames
- model cadence: 80 ms
- median send interval: 80.013 ms
- p95 send interval: 81.047 ms
- median model round-trip: 23.343 ms
- p95 model round-trip: 25.164 ms
- maximum model round-trip: 32.637 ms
- model startup-to-hello: 384.046 ms
- no open network sockets after hello or after population
- median sampled CPU in the paced run: approximately 139.4%, i.e. about 1.39 CPU cores on this Mac Studio
- maximum observed RSS: 579792 KiB; the final sampled plateau is approximately 566.2 MiB
- prediction digest: `0de21eee81f43a2cb55a96a049a07369b027da8e1479496f177f2fe67a8d7ac2`

The graph therefore runs inside its 80 ms streaming budget on this machine with substantial latency margin. A2 does not make a production-capacity claim and does not authorize device/on-phone inference.

## Repeatability

Three shorter runs preceded the long witness. The two 12.16 s repeat runs produced the identical prediction digest `1898c36601473abc40cc8834423c242c220177c01c97e490a890ae28e2d1ac6b`.

| Run | Evidence SHA-256 | Pacing | Median RTT | p95 RTT | Network sockets | Prediction digest |
| --- | --- | --- | ---: | ---: | --- | --- |
| initial | `edb493a8aab445c41a12416a638a3e5b5f51d3526f65d3df0f1554440e427584` | burst | 23.367 ms | 27.336 ms | 0 | `1898c36601473abc40cc8834423c242c220177c01c97e490a890ae28e2d1ac6b` |
| repeat | `22590b48eddaa4aee50c13b1a2baf49ac3dd984b736894ec642ee3868f5d2f50` | burst | 22.494 ms | 24.571 ms | 0 | `1898c36601473abc40cc8834423c242c220177c01c97e490a890ae28e2d1ac6b` |
| paced | `31d9d6f51cfbcd6814eccda1365aa7717d7d226f58d0a2b7c1f04773058f99a1` | realtime | 23.232 ms | 26.349 ms | 0 | `1898c36601473abc40cc8834423c242c220177c01c97e490a890ae28e2d1ac6b` |
| long paced | `fed31e4464f8bb0ea6d659bf3bcd4a27316c889b78f6d7c5cea2ce1b95de664d` | realtime | 23.343 ms | 25.164 ms | 0 | `0de21eee81f43a2cb55a96a049a07369b027da8e1479496f177f2fe67a8d7ac2` |

The burst CPU readings are throughput stress, not real-time duty-cycle evidence. The paced run is the relevant A2 resource witness.

## Authority boundary

A2 proves runtime feasibility only. It does not prove turn-taking quality. The evidence explicitly carries `canCommitTranscript=false`, `canDispatchCognition=false`, `canStartTts=false`, and `canAlterEndpointing=false`.

A2 therefore advances to A3 only: MAIA-TURN-BENCH. DualTurn remains shadow evidence and retains its known reflective-pause falsifier.
