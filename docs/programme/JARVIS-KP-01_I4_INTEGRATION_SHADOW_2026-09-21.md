# JARVIS-KP-01 · I4 — INTEGRATION SHADOW

**Date:** 2026-09-21
**Exact canonical base:** `20c8764b516e042f38e33800f71b2bb040025665`
**Status:** IMPLEMENTATION CANDIDATE · DEFAULT OFF · NO BEHAVIORAL AUTHORITY
**Upstream:** ACT 10 → ACT 11 → ACT 12 → ACT 11A → ACT 12A → I1 → I2 → I3

> **NO SEMANTIC JOIN WITHOUT A WARRANT.**

## Purpose

I4 connects one real, already-governed MAIA proposal path to the canonical I2
evaluator in shadow only.

The selected ingress is the existing relational-field generative shadow, after
its structured synthesis has already passed the standing-envelope renderer.

I4 does not create a new model call, prompt, parser, relation classifier or
proposal generator.

## Runtime order

The existing serving path remains authoritative:

`live response exists → setImmediate relational shadow → structured plan → standing-envelope render`

Only after that render succeeds may I4 run:

`multi-evidence provisional synthesis → I2 candidate evaluation → structural telemetry`

The result does not flow back into the live response.
## Epistemic mapping

An I4 candidate is admitted to shadow evaluation only where a synthesis names
at least two distinct member-authored basis evidence objects.

It is represented to I2 as:

- `HYPOTHESIZE`;
- `CANDIDATE_UNESTABLISHED`;
- `MAIA_PROPOSED`;
- `maia_conversational_inquiry`;
- no claimed relation semantics;
- no offered warrant;
- a live `lineage-not-entailment` boundary;
- uncertainty that blocks stronger standing.

I4 never interprets a single-source synthesis as a join.

I4 never derives authorship, jurisdiction, warrant or relation semantics from
free text.

## Double gate

The existing relational-field shadow retains its own gate and explicit member
allowlist.

I4 adds an inner literal-1 gate:

`MAIA_EPISTEMIC_JOIN_INTEGRATION_SHADOW`

Missing, empty, `0`, and `true` are OFF.

No deployment/configuration surface sets this flag in the candidate.
## Telemetry boundary

I4 does not call the I3 semantic persistence writer.

Instead, it writes structural research telemetry to:

`maia_epistemic_join_integration_shadow_runs`

The table stores only:

- parent shadow identity (`turn_id`, model, architecture);
- status;
- proposal/evaluated/error counts;
- admitted-standing counts;
- refusal-code counts;
- representation-closure state.

It stores no member id, evidence id, join id, proposition, evidence text,
response text or semantic payload.

The two count maps are database-constrained to the closed I2 standing/refusal
vocabularies, and their values must be non-negative numeric integers.

The telemetry row cannot exist without the ordinary relational-shadow parent.

The existing relational-shadow evidence writer and its row type remain
byte-identical to canonical. Therefore I4 OFF leaves that write path unchanged.

## Failure isolation

If the ordinary shadow evidence row fails to persist, no I4 telemetry is
attempted.

If I4 telemetry persistence fails, the ordinary shadow evidence row remains
written and the background runner only emits a structural warning.

No I4 failure reaches the serving response.
## Evidence

Local candidate evidence:

- `npm run matrix:epistemic-join-i4` → **22/22 PASS**;
- `npm run test:epistemic-join -- --runInBand --no-cache` → **110/110 PASS**;
- relational-field runner containment suite → **8/8 PASS**;
- `npm run typecheck:epistemic-join` → **EXIT 0**;
- `npm run witness:epistemic-join-i4-db` → **PASS**;
- legacy relational-shadow evidence writer/type → **byte-identical**;
- `git diff --check` → **PASS**.

The repository-wide no-regression typecheck was **not locally adjudicable** from
the sparse worktree: the baseline correctly refused a ship program narrowed to
9 files and reported missing directories/coverage. Those diagnostics are not
claimed as candidate evidence in either direction.

A full repository typecheck and empty-database reconstruction are therefore
required hosted-PR evidence before any I4 canonicalization.

## Canonical freshness at candidate freeze

After I4 opened from the authorized base, `origin/clean-main-no-secrets` advanced to
`0319940f9dc94a637e6f1b0e9f843c971f6fb0c2`.

Mechanical comparison at freeze time showed:

- authorized base is 0 commits ahead / origin is 22 commits ahead;
- the origin delta changes 35 files;
- zero file overlap with the I4 candidate scope;
- zero changes under `lib/ain/epistemic-join/**` or `lib/maia/relational-field-shadow/**`.

No rebase or replay was performed under the I4 act. Freshness reconciliation
remains a separate Founder adjudication before PR/canonicalization.

## Explicit non-authority

I4 does not authorize:

- I3 semantic persistence from the runtime path;
- feature activation;
- Founder production shadow;
- member-wide production observation;
- standing promotion;
- representation/projection;
- prompt/context injection;
- memory mutation;
- routing/model/provider changes;
- Wisdom Graph edges;
- Living Constellation semantic lines;
- deployment;
- I5.
## Disposition

> **I4 INTEGRATION SHADOW CANDIDATE · REAL PROPOSAL PATH WIRED · DEFAULT OFF · STRUCTURAL TELEMETRY ONLY**

The next gate is separate Founder adjudication of the exact I4 candidate before
PR/CI canonicalization.
