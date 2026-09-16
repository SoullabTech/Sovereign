# TURN-03 A1 — Acoustic model census

**Date:** 2026-09-16
**Charter:** `f5c02193c5ebee4f51b6c4b769ad6a8166b2a80f`
**Standing:** A1 COMPLETE CANDIDATE RECORD · NO MODEL DOWNLOAD · NO LIVE AUTHORITY

## Ruling

A1 selects `dualturn-endpointing-c3860ed` as the **A2 baseline experiment candidate only**. Selection does not mean winner, production dependency, or turn authority. The reason is practical: it is the only current projector with commercial custody closed, a pinned local runtime artifact, continuous future-speech evidence, and a known reflective-pause falsifier that A3 can measure.

The exact machine-readable census is `TURN-03_A1_MODEL_CENSUS_2026-09-16.json`.

## Candidate dispositions

| Candidate | Commercial custody | TURN-03 signal fit | A1 disposition |
| --- | --- | --- | --- |
| DualTurn Endpointing `c3860ed` | closed: Apache-2.0 + Mimi CC-BY-4.0 attribution | continuous EOT/VAD/FVAD | **ADMIT A2 BASELINE** |
| Smart Turn v3.2 CPU | closed: BSD-2-Clause | endpoint classifier, no future projection | **A3 COMPARATOR ONLY** |
| MaAI VAP mono English | blocked: CC-BY-NC-ND-4.0 weights | excellent mono VAP fit | **BLOCKED LICENSE** |
| MaAI VAP English Kyoto | VAP weights MIT; complete encoder custody unresolved | VAP fit, but no dedicated commercial-safe mono checkpoint | **DEFER** |
| Direct VoiceActivityProjection | code MIT; trained-weight/CPC commercial custody unresolved | VAP fit | **BLOCKED CUSTODY** |
| Kyutai STT 1B | CC-BY-4.0 weights | semantic VAD, not future-speech projection | **DEFER SEMANTIC LANE** |

## DualTurn ingress disposition

DualTurn requires 24 kHz. Under the charter clause requiring A1 disposition for non-16-kHz candidates, A2 may use one explicit research-only preprocessing step: deterministic 16 kHz → 24 kHz resampling **outside** the model adapter. The model receives CH0=user and CH1=synthetic zeros. No second microphone is authorized. The existing product ingress remains unchanged.

The selected local artifact remains `/private/tmp/dualturn-shadow-candidate/stream_tick.onnx`, SHA-256 `6700ea2f919b4c66355b3dafb4f91f2db9dae9e18a302b812730c04340bf819f`. Network auto-download remains forbidden.

## Why Smart Turn is not being forced into the port

Smart Turn v3.2 is unusually attractive for MAIA operationally: 16 kHz mono PCM, a small quantized CPU ONNX artifact, permissive BSD-2-Clause licensing, and acoustic/prosodic turn classification. But it runs as a silence-triggered complete/incomplete verifier over the current turn, not as a continuous future-speech projector. A1 preserves it as an A3 comparator rather than relabeling its endpoint probability as `pFuture`.

## Research context

Current controlled 2026 evidence strengthens the lane premise: acoustic + prosodic features can outperform adding text for streaming end-of-turn detection, while natural/noisy settings still degrade predictive turn-taking performance. That makes MAIA-TURN-BENCH and the reflective-pause class load-bearing; generic benchmark strength cannot substitute for Soullab pause behavior.

## Exclusions preserved

A1 authorizes no weight download, package installation, product integration, live threshold change, transcript commit, cognition dispatch, TTS start, or turn authority. A2 must freshly prove local artifact custody, deterministic preprocessing, runtime latency/resource use, and network independence before A3.
