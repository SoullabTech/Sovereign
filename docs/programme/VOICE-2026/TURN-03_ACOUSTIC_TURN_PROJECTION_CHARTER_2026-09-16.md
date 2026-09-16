# TURN-03 — Acoustic Turn Projection · Charter

**Date:** 2026-09-16
**State:** OPEN · SHADOW ONLY · NO LIVE TURN AUTHORITY
**Branch:** `feature/voice-acoustic-turn-projection-20260916`
**Base:** TURN-02 closure `4f212acac07d8a9170627be290e9af2e24c910c1`

## Founding question

> Can a sovereign, commercially lawful acoustic model predict that a MAIA member intends to continue speaking well enough to materially reduce false floor seizures?

This lane does **not** ask whether a model should decide when the member is finished. That authority remains closed.

## Entry conditions

TURN-03 opens only because the following are already durable:

- TURN-01 member sovereignty
- TURN-02 shadow arbiter and evidence vocabulary
- `MAIA-TURN-BENCH-01`
- model-neutral predictor ports
- source/weight custody law
- fail-closed sidecar protocol
- raw-audio integration boundary

No previous research candidate is automatically selected by this charter.
## Initial signal contract

TURN-03 begins with a strict model-ingress rule:

- mono PCM16
- 16 kHz
- no second microphone
- no hidden sample-rate change inside a model adapter
- no network model resolution or auto-download

The existing TURN-02 protocol can technically declare 24 kHz, but that capability is **not** TURN-03 permission. A candidate that requires another rate must be explicitly dispositioned in A1 before it can enter this lane.

A predictor may emit only evidence equivalent to:

- `p_now` → repository field `pNow`
- `p_future` → repository field `pFuture`
- `vad`
- exact model provenance
- timestamp → repository field `atMs`

Adapters may normalize raw model outputs into the existing predictor ports. They may not decide `WAIT`, `BACKCHANNEL`, or `YIELD`.

The TURN-02 arbiter remains the only consumer allowed to form a shadow recommendation.
## A1 — Model census

Compare admissible candidates, including MaAI/VAP, Kyutai where applicable, direct VAP implementations, and any carried TURN-02 research candidate.

Every candidate record must include:

- exact repository and revision
- exact model / weight identifier
- exact source-code license
- exact weight license
- commercial use status
- derivative / redistribution restrictions
- encoder / upstream model license obligations
- exact SHA-256 of every runtime weight artifact
- local weight path
- network auto-download = OFF
- CPU / MPS viability
- memory footprint
- prediction cadence / horizon
- streaming behavior and required sample rate

A code repository license never substitutes for a weight license.

A1 chooses a **candidate for experiment**, not a permanent winner.
## A2 — Local shadow runtime

Run the selected A1 candidate on the Mac Studio before any MAIA integration.

Feed known audio and prove:

- PCM custody and exact sample-rate contract
- stream continuity
- exact local model load
- prediction cadence
- median / p95 / max inference latency
- CPU and RAM use
- deterministic startup identity
- no network dependency after startup

A2 may expose model weakness. It may not compensate for weakness by widening authority.

## A3 — MAIA-TURN-BENCH

Evaluate whether acoustic projection materially improves the existing benchmark.

Required cases include word search, unfinished sentence, 2 s / 4 s / 6 s pauses, emotional pause, breath, explicit yield, question yield, and re-entry.
Primary outcome:

> Does false-floor-seizure rate go down?

Secondary outcome:

> Does legitimate response latency become intolerable?

The benchmark must preserve per-case failures, not only aggregate averages.

## A4 — Shadow member walk

Only after A3 earns it, run during consented real MAIA conversations with predictor outputs logged as shadow evidence and ignored by live endpointing.

Compare:

- what TURN-01 actually did
- what TURN-03 would have projected
- what the member actually did next

No A4 observation may silently tune live timing. Any later promotion requires a separate authority lane.
## Authority exclusions

Nothing in TURN-03 may:

- cause MAIA to speak
- commit a transcript
- dispatch cognition
- start TTS
- alter live endpointing thresholds
- override explicit hold
- override ongoing member speech
- infer that silence means consent to yield
- install a second microphone path
- treat a model score as member intention

`EXPLICIT HOLD`, `MEMBER SPEECH`, explicit completion language, and the member's selected Conversational Space remain outside model sovereignty.

## Successor boundary

If TURN-03 produces sufficiently strong evidence, a later `TURN-04 — Conversational Turn Authority` may be opened to decide whether predictive evidence can influence timing.

TURN-03 itself cannot cross that boundary.

A later `TURN-05 — Responsive Presence` may separately study backchannels. Acknowledging a member without taking the floor is a distinct power and is not folded into acoustic endpointing here.

## Opening standing

TURN-03 is **OPEN at charter only**. A1 has not yet been executed. No model is selected, installed, promoted, or granted live influence by this opening act.
