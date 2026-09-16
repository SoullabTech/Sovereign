# TURN-03 A3 — Synthetic control benchmark

**Date:** 2026-09-16
**State:** FALSIFIER / CONTROL EVIDENCE · A3 NOT COMPLETE · SHADOW ONLY
**A2 subject:** `780a3c46436bb6be21c606de61f56aa135a55c7d`

## Purpose

A3-SYNTH-01 asks whether the selected acoustic candidate adds decision value on controlled pause/continuation cases before any consented human walk. The corpus is synthetic speech generated locally with macOS `say` and converted to mono PCM16 16 kHz. It contains no member data and no raw audio is committed.

Ten cases cover ordinary pause, word search, hesitation, emotional pause, breath, unfinished syntax at 4 s and 6 s, re-entry, explicit yield, and question yield. Natural Conversational Space is held at 3500 ms.

## Policy comparison

| Policy | False floor seizures | False-seizure rate | Yield recall | Median yield latency |
| --- | ---: | ---: | ---: | ---: |
| TURN-01 silence baseline | 6 / 8 | 75% | 100% | 3500 ms |
| conservative arbiter, no predictor | 0 / 8 | 0% | 0% | — |
| DualTurn acoustic only | 0 / 8 | 0% | 0% | — |
| semantic only | 0 / 8 | 0% | 100% | 3529.875 ms |
| DualTurn + semantic | 0 / 8 | 0% | 100% | 3529.875 ms |

The acoustic-only policy exactly matches the no-predictor conservative control on this corpus. The fused policy exactly matches semantic-only. Therefore this population does **not** demonstrate incremental decision value from DualTurn.

## Acoustic falsifier

DualTurn EOT peaks strongly during silence in both continuation and true-yield cases, typically around 1.3–2.3 s after speech stops. Representative peak EOT values are approximately 0.98. By the 3.5 s Natural floor, EOT has decayed to approximately zero on the long-pause cases.

This creates a bad tradeoff for MAIA:

- carry the early EOT peak forward → risk recreating false floor seizures;
- respect the member-space floor and use only contemporaneous evidence → DualTurn supplies essentially no yield evidence at the lawful decision point.

The current conservative arbiter chooses the second behavior. That is why acoustic-only is safe here, but also why its yield recall is zero.

## What the population does support

The high-precision semantic cues materially help this synthetic control set: dangling syntax / fillers preserve the floor on several continuation cases, while explicit completion language recovers both true yields. Emotional pause and re-entry remain `insufficient_evidence`, which is preferable to a false seizure but is not positive understanding.

## Ruling

DualTurn remains admissible as shadow acoustic evidence, but **does not earn promotion** from A3-SYNTH-01. Its early EOT peak must not be latched across the member-selected Conversational Space threshold.

A3 remains OPEN. The next act is the A1-approved Smart Turn v3.2 comparator on the same synthetic fixture classes. Synthetic speech can falsify unsafe behavior; it cannot substitute for the later consented human/member shadow population.

## Evidence custody

Load-bearing evidence:
`docs/programme/VOICE-2026/evidence/TURN-03-A3-SYNTH-01-20260916/A3_SYNTH_CONTROL_EVIDENCE.json`

Original evidence SHA-256:
`9cc22bea45da34e9ada85504dcd2e76b986fc411155c7c731c7fa043c1588dbf`

No TURN-03 evidence in this act may commit a transcript, dispatch cognition, start TTS, or alter live endpointing.
