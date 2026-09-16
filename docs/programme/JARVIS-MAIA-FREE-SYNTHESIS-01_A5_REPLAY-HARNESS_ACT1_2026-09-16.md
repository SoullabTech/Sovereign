# JARVIS-MAIA-FREE-SYNTHESIS-01 · A5 — Same-Model Replay · ACT 1

**Date:** 2026-09-16  
**Mode:** OFFLINE R&D ONLY  
**Production authority:** NONE

## Ruling

A5 is now open with a bounded four-condition replay contract. No real model replay has yet been admitted as evidence.

The experimental question is not “which prompt sounds best?” It is whether distinct, causally legible context assemblies change MAIA's ability to maintain living continuity while the incoming member turn and model remain fixed.

## Four replay conditions

The first frozen replay uses the Silver Cedar benchmark and separates three causal contrasts:

| Contrast | Conditions | Intended cause |
| --- | --- | --- |
| A ↔ B | `current_context` ↔ `reduced_direction` | standing instruction pressure, with the same immediate four-exchange context |
| B ↔ C | `reduced_direction` ↔ `compact_narrative_gestalt` | availability of admitted historical Silver Cedar evidence in compact derived form |
| C ↔ D | `compact_narrative_gestalt` ↔ `relational_structure_gestalt` | representation organization only; primary evidence membership and ledger are identical |

A5 must not collapse those contrasts into a single causal story.

## Harness law

`scripts/research/free-synthesis/a5-replay-harness.ts` is provider-agnostic and deliberately unable to execute by itself.

It contains:

- no model-provider import;
- no database import;
- no MAIA serving import;
- no telemetry import;
- no provider fallback;
- no default execution path.

A caller must be injected explicitly.

Before any caller is invoked, the harness requires:

1. exactly four named conditions;
2. one identical incoming member turn;
3. one identical provider/model/temperature/max-token specification;
4. four distinct context digests;
5. byte-identical primary-evidence ledger and identical evidence-root membership for C/D;
6. one execution order containing each condition exactly once.

After a call, the harness refuses a provider or model identity different from the pinned specification.

## Mechanical proof

`scripts/research/free-synthesis/a5-replay-harness-proof.ts` was executed locally against the canonical A4 Silver Cedar field.

Result:

```text
A5 replay harness                         PASS
four conditions                           PASS
same incoming turn                        PASS
same model specification                  PASS
C/D primary evidence identical            PASS
C/D primary evidence roots                14
model/provider fallback                   REFUSED
DB imports                                0
serving imports                           0
real model calls                          0
```

The proof uses synthetic direction/recent-context placeholders. It proves the harness contract only. It is not an A5 replay result.

## Private recent-context binding

The frozen session was re-read read-only to establish the exact current CORE aperture immediately before the Silver Cedar probe.

The private replay snapshot contains four complete exchanges:

```text
exchange range      35–38
exchange count      4
bytes               3734
sha256              91833a8ba99e5827125010370e728d7a7687cb3dcd911c0e4d4ff10a1f72781e
repository status   NOT COMMITTED
local custody       /private/tmp only
```

The raw four-exchange window contains personal material not necessary to the research record. It therefore remains local and is represented in programme evidence only by range, size and digest.

The binder refuses execution if the local file digest differs.

## CORE aperture fidelity

The local binder renders the four-exchange window using the current CORE information form:

```text
User: full user message
MAIA: first 120 characters of MAIA response + ellipsis when longer
```

The same rendered recent window is supplied to all four A5 conditions.

The historical Silver Cedar material itself is outside this four-exchange window. Conditions C/D add the admitted A4 Silver Cedar evidence explicitly; A/B do not.

## Current-direction condition

`scripts/research/free-synthesis/a5-silver-cedar-replay.ts` builds condition A's standing direction from the current source `buildMaiaWisePrompt` with **no conversationHistory passed to that builder**.

This is intentional: the private four-exchange window is composed separately by the A5 harness so A/B/C/D receive exactly the same immediate conversational evidence.

Therefore condition A is a **current-source standing-direction replay**, not a claim to byte-reconstruct the historical production prompt from 2026-09-15.

That distinction must remain explicit in any A5 result.

## Reduced-direction condition

Condition B uses a research rendering of the A3 candidate minimum semantic set. It carries the constitutional obligations around:

- source standing;
- derived-vs-primary distinction;
- present member correction/adoption/withdrawal;
- provisional interpretation and non-collapse;
- truthful absence / known incompleteness;
- Gestalt revisability;
- capability truth;
- governed MAIA identity;
- consent / room scope.

It contains no required sentence count, mandatory question, required next step, therapeutic choreography or framework menu.

This wording is an A5 experimental carrier. It is not production prompt authority and does not claim to be the final minimum token floor.

## C/D representation identity

Conditions C and D use the real-source A4 Silver Cedar positive-arc field.

A4 already proved:

```text
primary roots                           14
member-authored roots                   11
MAIA-authored roots                      3
primary-evidence membership C == D      TRUE
primary-evidence ledger digest C == D   TRUE
hidden evidence-selection difference    FALSE
```

Therefore any C/D difference in the first replay is attributable to representation organization plus normal model nondeterminism, not a hidden evidence-selection difference.

## First replay model specification

The executable binder is pinned to:

```text
provider       anthropic
model          claude-sonnet-4-6
temperature    0
max_tokens     700
fallback       NONE
```

Temperature 0 is used for the first causal replay to reduce sampling variance. It is not a claim that production should use temperature 0. A later replication may deliberately test production-like stochastic settings after the causal pass is adjudicated.

## Execution boundary

The executable binder:

- imports Anthropic directly;
- does not call `modelService`, `maiaService`, telemetry, persistence or a serving route;
- requires `A5_REPLAY_EXECUTE=1` before any model call;
- requires `ANTHROPIC_API_KEY` only at execution time;
- writes full prompts and raw outputs only to a caller-selected local packet with mode `0600`;
- prints only hashes/counts/usage metadata in its completion summary;
- has no fallback provider.

A failed preflight means **no model call**.

## What ACT 1 proves

It proves that A5 now has a mechanically bounded replay apparatus capable of distinguishing:

- instruction pressure;
- historical evidence availability;
- representation organization;
- model identity drift;
- hidden C/D evidence drift.

## What ACT 1 does not prove

It does not yet prove:

- that reduced direction improves MAIA;
- that historical Gestalt context improves MAIA;
- that relational structure beats compact narrative;
- that the first replay reproduces historical production behavior;
- that one deterministic sample is sufficient;
- that any A5 condition may enter production.

## Standing

```text
A5 harness contract                ✅
A5 mechanical proof                ✅ PASS
private Silver Cedar window        ✅ bound by digest · not committed
A5 real-source C/D identity        ✅ inherited from A4
first replay model spec            ✅ pinned
real Claude replay                 ⛔ UNSPENT
blind human adjudication           ⛔ UNSPENT · A7
production wiring                  ⛔ NONE
```

**Next A5 act:** after source/CI preflight is green, execute exactly one four-condition Silver Cedar replay packet locally. Preserve raw outputs privately, expose only condition hashes/cost metadata for custody, then pass blind-coded outputs to A7 rather than self-declaring which response is “more alive.”