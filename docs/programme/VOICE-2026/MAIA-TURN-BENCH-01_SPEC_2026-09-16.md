# MAIA-TURN-BENCH-01 — Turn-Taking Benchmark Spec

**Status:** OPEN · instrumentation only · no member corpus committed

## Primary question

Does a candidate turn predictor reduce **false floor seizures** without making legitimate yields unusably slow?

## Required classes

`ordinary_pause` · `word_search` · `hesitation` · `emotional_pause` · `breath` · `unfinished_syntax` · `explicit_yield` · `question_yield` · `reentry`

The labels describe observable turn events, not traits of the speaker.

## Repo-safe case format

JSONL cases contain only: case id, pause class, ground-truth continue/yield label, numeric/boolean TurnEvidence, and optional reference latency. The parser rejects transcript, text, utterance, words, audio, audioPath, and audioUrl fields.

Consented audio/transcript source material, if later collected, is **outside git** under separate custody. A repo benchmark may contain derived predictor scores only.

## Metrics

1. False floor seizure rate — yield predicted on a CONTINUE case. **Primary harm metric.**
2. Yield recall — legitimate YIELD cases recognized.
3. Median latency on correctly recognized yields.
4. The same metrics sliced by pause class; aggregate numbers may not hide a bad word-search or emotional-pause failure mode.

## Promotion law

No model is promoted from shadow to live authority merely because aggregate accuracy is high. Promotion requires a separately ruled threshold for false floor seizures, yield recall, and latency, plus class-level review. Explicit floor ownership remains absolute after any promotion.

## Runner

`npx tsx scripts/voice/run-turn-bench.ts <cases.jsonl>`

The runner uses the exact TURN-02 arbiter and emits overall + per-class metrics. It does not load member content or call a network service.
