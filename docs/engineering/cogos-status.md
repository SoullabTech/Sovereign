# Cognitive OS — Implementation Status

Last updated: 2026-03-11 (annotation API)

---

## What it is

The Cognitive OS is the layer that sits between model output and durable interpretive memory. It intercepts each oracle turn, runs OS-native (deterministic, no LLM calls) signal extraction to produce observations, holds those observations in a typed hypothesis buffer, and applies a multi-criteria gate before any interpretation is allowed to reach the persistent ledger. Nothing is promoted to long-term memory on a single observation — the gate requires recurrence, cross-context presence, and composite score threshold before an interpretation becomes durable. The member owns the ledger and can inspect it at any time.

---

## Implemented

- **Canonical types** — `CogosObservation`, `CogosHypothesis`, `CogosEvidenceEvent`, `CogosLedgerEntry`, `CogosGateResult`, `CogosObservationType`, `CogosHypothesisStatus` in `lib/consciousness/cogos/types.ts`
- **Gate evaluator** — `evaluateGate()` + `computeComposite()` in `lib/consciousness/cogos/gateEvaluator.ts`; verdicts: hold / promote / expire
- **Hypothesis buffer** — in-memory per-member buffer with `createHypothesis`, `updateHypothesisEvidence`, `shouldExpire`, `getDefaultFalsifiabilityAnchors` in `lib/consciousness/cogos/hypothesisBuffer.ts`
- **Interpretive ledger** — PostgreSQL persistence via `loadLedger`, `promoteLedgerEntry`, `appendEvidenceEvent`, `applyDecay` in `lib/consciousness/cogos/interpretiveLedger.ts`
- **Observation extractor** — OS-native deterministic extraction, no LLM calls, in `lib/consciousness/cogos/observationExtractor.ts`
- **Oracle route wiring** — ledger load in Promise.all startup block; 5-step post-turn pipeline; Sanctuary guard in `app/api/oracle/conversation/route.ts`
- **DB migrations applied** — `20260311000001_cogos_types.sql` (enum types) and `20260311000002_cogos_tables.sql` (four tables) applied local and production-ready
- **Smoke test passing** — observation extracted, hypothesis created, gate returns hold with correct pending criteria, composite 0.45 in [0,1], evidence event written
- **`/api/members/ledger` GET endpoint** — `app/api/members/ledger/route.ts`; returns `ledger`, `buffer`, `calibration`, `summary`, `_meta.sovereignty_note`; auth via session cookie; integration-tested against live DB
- **Production migrations confirmed** — both tables present in the Docker PostgreSQL container; local psql and Docker share the same instance
- **Decay sweeper** — `runCogosDecay()` added to `scripts/sweep-stale-sessions.ts`; applies `applyDecay()` to ledger entries and expires stale buffer hypotheses using actual completed session counts; dry-run verified; runs after every session sweep pass
- **Member annotation API** — `POST /api/members/ledger/annotate` in `app/api/members/ledger/annotate/route.ts`; five annotation types (`resonates`, `does_not_resonate`, `not_now`, `add_context`, `clear_influence`) with distinct side effects; ownership check prevents cross-member access; annotation is a response layer (not a correction layer) — the system's evidence record is never mutated; migration `20260311000003_ledger_annotation_types.sql` applied; GET ledger `a.content` bug fixed

---

## The key invariant

> "A single-session, single-context observation legitimately holds until it recurs and crosses contexts."

This means no interpretation reaches the member's ledger from a single data point. The gate exists not to slow things down but to ensure that what MAIA holds about a member has earned the right to be held — through recurrence that the member themselves produced, not inference from one turn.

---

## Active (next to build)

Consent surfacing flow — how and when MAIA offers interpretations to the member; requires sovereignty invariant design pass (timing, framing, member's ability to accept or defer).

---

## Pending

- Consent surfacing flow (how/when MAIA offers interpretations to the member; requires sovereignty invariant design pass)
- Ledger member UI (inspectable + annotatable; after consent surfacing design is settled)

---

## Not yet built

- Model-proposed hypotheses — LLM suggests candidate interpretations, OS decides whether to buffer them (the richer path; requires careful gate design to avoid LLM confirmation bias)
- Interpretive lineage tracking — `parent_hypothesis_id` chains showing how interpretations evolved or were revised
- Cross-member pattern anonymization — AIN collective layer (aggregate signal detection without individual exposure)
- Relational trust phase transitions tied to ledger entries — ledger depth as input to relational phase advancement logic

---

## Architecture notes

- All writes are fire-and-forget (`.catch` swallows; never block oracle response)
- Sanctuary sessions are completely excluded — Sanctuary guard wraps the entire pipeline (sovereignty invariant)
- Observation extraction is OS-native and deterministic (no LLM calls — repeatable, auditable)
- Evidence events are insert-only and immutable — "you can revise the hypothesis, not what was observed"
- Default falsifiability anchors are type-based via `getDefaultFalsifiabilityAnchors(type)` — no observation enters the buffer anchor-free
- `cogos_` enum prefix used throughout to avoid collision with the existing `hypothesis_status` type in the schema
