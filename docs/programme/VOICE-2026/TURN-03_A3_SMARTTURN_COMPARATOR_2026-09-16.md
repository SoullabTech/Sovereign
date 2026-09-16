# TURN-03 A3 — Smart Turn comparator adjudication

**Date:** 2026-09-16
**State:** COMPLETE · COMPARATOR NOT PROMOTED · A3 REMAINS OPEN
**Evidence SHA-256:** `2588168fe038cbcab6ac93ff8b7b09f4ad6917a165bc84e17933c5d55f474c42`

## Question

Does Smart Turn v3.2 add useful turn-completion evidence beyond the already-sealed TURN-03 controls without increasing false floor seizures?

## Exact comparator custody

- Model: `smart-turn-v3.2-cpu.onnx`
- Model SHA-256: `2bb026316b14a660486a75b1733cd3fbab8c2fd0314dc9af7be49f8cca967e4f`
- Weight license: BSD-2-Clause
- Input: 16 kHz mono member audio; last 8 seconds with upstream left-pad/truncate behavior
- Upstream completion threshold: `> 0.5`
- Runtime network sockets observed: **0**
- Live endpoint authority: **none**

## Same-corpus result

| policy | false-floor-seizure rate | yield recall | median yield latency |
| --- | ---: | ---: | ---: |
| baseline | 0.750 | 1.000 | 3500.0 ms |
| conservative | 0.000 | 0.000 | — |
| acoustic | 0.000 | 0.000 | — |
| semantic | 0.000 | 1.000 | 3529.9 ms |
| fused | 0.000 | 1.000 | 3529.9 ms |
| smartTurn | 0.625 | 1.000 | 3500.0 ms |
| smartTurnSemantic | 0.250 | 1.000 | 3500.0 ms |

## Adjudication

Raw Smart Turn reduces false seizures relative to the TURN-01 silence baseline, but it still falsely yields on 5 of 8 continuation cases. Adding the existing high-precision semantic layer reduces that to 2 of 8 while preserving both true yields. The remaining false seizures are the **emotional pause** and **re-entry** classes.

On this corpus, semantic-only remains stronger than Smart Turn + semantics: semantic-only is 0/8 false seizures with 2/2 yield recall. Therefore Smart Turn has **not demonstrated incremental decision value sufficient for promotion**. It remains an A3 comparator/evidence source only.

The two residual failures become permanent adversarial cases for the next A3 act. No threshold change, live timing change, transcript commit, cognition dispatch, TTS start, or TURN-04 authority is granted by this result.
