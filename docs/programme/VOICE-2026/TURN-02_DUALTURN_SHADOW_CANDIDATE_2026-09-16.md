# TURN-02 DualTurn shadow candidate — 2026-09-16

**Standing:** SHADOW CANDIDATE · NO TURN AUTHORITY

## Exact custody

- Repository: `anyreach-ai/dualturn-endpointing`
- Repository revision: `c3860ed71210fe0144af35af340fd7a4dec3d2d3`
- Runtime artifact: `stream_tick.onnx`
- SHA-256: `6700ea2f919b4c66355b3dafb4f91f2db9dae9e18a302b812730c04340bf819f`
- Local research path: `/private/tmp/dualturn-shadow-candidate/stream_tick.onnx`
- Upstream helper inspected: `onnx_streaming.py`, local SHA-256 `2a6739dae6cc40f75a1c1e6b5751338607e19abe2b76b2a07ae8679533df37a6`
- Model repository license: Apache-2.0
- Base Mimi model license: CC-BY-4.0; attribution remains required
- Runtime activation law: local path + exact SHA only; no network model resolution

## Why admitted to shadow

The streaming ONNX graph is self-contained and causal. It accepts user-only mono
input by supplying a silent agent channel, emits EOT/VAD/FVAD every 80 ms, and
requires only ONNX Runtime + NumPy. It therefore fits the TURN-02 evidence port
without making a framework or cloud service constitutional infrastructure.

## Mac Studio runtime witness

Pinned graph, CPUExecutionProvider, four intra-op threads, locally generated speech:

- 152 × 80 ms ticks over 12.16 s audio
- median inference: **20.48 ms**
- p95: **21.55 ms**
- max: **23.14 ms**

This is comfortably inside the 80 ms streaming interval on this machine.

## Load-bearing falsifier: reflective pause

Synthetic local speech was deliberately composed as:

`"I think what I'm realizing is"` → **3 s silence** → `"that maybe I've been afraid to say this out loud."`

The detector's mid-thought pause looked almost identical to the true ending:

| region | EOT max | EOT median | user VAD median |
| --- | ---: | ---: | ---: |
| mid-thought pause | 0.9861 | 0.9701 | 0.0021 |
| final pause | 0.9861 | 0.9624 | 0.0012 |

Its first sustained `EOT >= 0.5` for three frames occurred during the mid-thought
pause. Therefore acoustic EOT alone would recreate the member complaint.

## Ruling

DualTurn is admitted only as **acoustic evidence**:

- `acousticYield = EOT`
- `acousticContinue = max(user FVAD over 0–2000 ms)`
- TURN-01 Conversational Space remains a hard floor.
- Explicit floor ownership always wins.
- Strong continuation or semantic incompleteness wins any conflict.
- No DualTurn output may directly call transcript commit, cognition, or TTS.

The candidate may advance only through MAIA-TURN-BENCH on consented/evidence-safe
samples. The observed reflective-pause failure becomes a permanent regression case.
