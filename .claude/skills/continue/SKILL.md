---
name: continue
description: Close a bounded work episode by writing a continuation packet — the minimum a fresh session needs to carry the work forward without inheriting stale state. Use when ending a session with unfinished work, when handing a task to a future session, or when the user asks to wrap up, hand off, or record where things stand.
---

# /continue — hand forward continuity, not history

Closed Loop 1, second cross-session command. Design:
`docs/architecture/CLOSED_LOOP_1_DESIGN_AND_PROOF_2026-08-09.md`.

**`/continue` carries intention. `/orient` restores contact with reality.**

## What a packet is — and is not

A packet is a witness of **what this session encoded** (implementation-class) and **what governance
was established** (governance-class).

⛔⛔ **It is never a witness of what will still be true when the next session begins.** Every
measurement-class fact — branch, HEAD, dirty, ahead/behind, cache, deployed SHA, migrations,
production readings — appears **only** under `DRIFT PROBES`, whose job is to be *confirmed or
contradicted* by the next `/orient`. Never under a heading that implies frozen present state.

## Write

```bash
node scripts/builder/continue.mjs --init > docs/handoffs/<branch>_<YYYY-MM-DD>_<slug>.md
# fill the sections in, then:
node scripts/builder/continue.mjs --validate docs/handoffs/<file>.md
```

`--init` measures the drift probes live. Fill the authored sections yourself — they are judgement,
not measurement. Validate before finishing; the validator fails the packet rather than warning.

**Create `docs/handoffs/` only when writing a real packet.** ⛔ No templates-as-history, no
reconstructed prior sessions, no fictional examples. Every file there must correspond to an actual
work cycle.

## The grammar the validator enforces

- **Budget ≤ 3,000 tokens** (≈4 chars/token). Over budget is an error: split it, write detail to a
  normal doc, cite the path.
- **`VERIFIED` requires five fields** — `claim | jurisdiction | witness | referent | provenance`.
  `jurisdiction` ∈ {measurement, implementation, governance}. This makes
  `verified: typecheck passes` **impossible to encode** — which is the point.
- **`INSTRUMENTS USED` requires `boundary:` and `provenance:`** — a successor must know whether a
  cited proof came from a bound instrument, and against what.
- **`ESTABLISHED` requires `evidence:`** — no evidence means it is a hypothesis; it belongs in `OPEN`.
- **`GOVERNING DECISIONS` cite, never restate.**
- **`NEXT COHERENT ACTION` is singular.** A list means the episode did not close.
- **Measurement fields outside `DRIFT PROBES` are an error.**
- **Named drift semantics**: carry `ahead_of_trunk:` and `behind_trunk:`, ⛔ never raw
  `--left-right` output. Machine evidence becomes *semantically named* evidence — without becoming
  authority. (A reversed reading of `0 10` is exactly the error this rule prevents; it has already
  happened once here.)

## UNKNOWN is load-bearing

Carry every unmeasured fact as `∅ <fact> — not measured` under `OPEN`, distinct from `?` questions.

⛔⛔ **Absence must never silently become false, complete, clean, deployed, or verified.** An
UNKNOWN must survive `write → parse → /orient <packet> → classification`. A dropped `∅` turns the
successor into an inference engine — this has already been caught once by proof, and the round-trip
regression exists to keep it caught.

## DO NOT REDISCOVER — bounded

Protects **settled evidence and falsified hypotheses** from pointless re-derivation. ⛔ It may
**never** prohibit remeasuring anything whose truth depends on present repository or runtime state.
Falsified hypotheses are the most expensive thing to re-derive and the cheapest to record.

## Known limitation — do not report as solved

Prose-memory staleness is **not structurally computable**. Citations and source rereads are
mitigation only. A packet may not emit a green state for falsification case #6.

## Proof

`node scripts/builder/__tests__/continue-proof.mjs` — grammar, budget, UNKNOWN round-trip through
`/orient`, and mutation controls proving each rule can actually fail.
