# JARVIS-ORCHESTRATION-OPERATOR-01 / O1 — Intent Contract

Opening canonical: `65bcb76bb38d4f57e816253fdbec0ea036d6c166`

## Purpose

O1 converts explicit operator language into a bounded governed intent record.

It answers:

> **What outcome is the operator asking JARVIS to pursue?**

O1 does not answer:

> **What is JARVIS authorized to do?**

O0 remains the sole constitutional authority boundary.

## Operator levels

O1 may identify one of four requested outcome levels:

- `UNDERSTAND` — inspect, investigate, diagnose, explain;
- `PREPARE` — plan, design, draft, propose;
- `CHANGE` — fix, repair, implement, build, edit;
- `RELEASE` — ship, release, deploy, publish, merge.

These are descriptions of requested outcome, not permissions.

## Governing laws

1. Natural-language intent grants **zero authority**.
2. O1 must preserve the operator’s words rather than silently enlarge the objective.
3. Explicit release language may name a desired endpoint but cannot open PR, merge, deploy, or production authority.
4. Ambiguous language remains `AMBIGUOUS`; O1 must not guess a stronger intent.
5. Empty language is `INVALID`.
6. `Continue` requires a prior clear governed intent and inherits only that intent, never its imagined authority.
7. Authority-sensitive language is surfaced as a mention, never converted into a grant.
8. Routing, work-graph construction, execution, integration, deployment, and production remain outside O1.

## Machine-readable contract

`jarvis-desktop/src/operator-intent-contract.js` produces an `o1.intent.v1` record with:

- `standing`: `CLEAR | AMBIGUOUS | INVALID`;
- `raw_utterance`;
- `objective`;
- `requested_level`;
- `level_signals`;
- continuation provenance;
- authority mentions;
- an always-empty authority grant set;
- fixed constitutional constraints;
- explicit ambiguity reasons.

The first implementation is deliberately conservative.

It recognizes only explicit operator-level language. It does not use a model to infer hidden intention, because O1 must prove the intent/authority separation before later orchestration consumes it.

## Continuation

A bare `continue` is not evergreen authority.

Without a prior clear intent:

`continue → AMBIGUOUS`

With a prior clear intent:

`continue + prior intent → inherited objective and level`

If the operator explicitly adds a later release endpoint, O1 may record that desired endpoint while still granting no authority.

## Falsifier matrix

The O1 witness must prove at minimum:

- F1 explicit `UNDERSTAND`;
- F2 explicit `PREPARE`;
- F3 explicit `CHANGE`;
- F4 explicit `RELEASE`;
- F5 chained release remains intent only;
- F6 negated release does not escalate the requested level;
- F7 authority-sensitive language never becomes a grant;
- F8 bare continuation without prior intent remains ambiguous;
- F9 continuation inherits prior intent without authority;
- F10 continuation plus explicit release changes destination, not authority;
- F11 unclassified language remains ambiguous;
- F12 empty intent is invalid;
- F13 courtesy language does not change intent class;
- F14 objective text is preserved rather than enlarged;
- F15 sweeping permission-like language still grants no authority.

## Closure condition

O1 may close only when evidence establishes that natural language can produce a bounded explicit intent record while:

- preserving ambiguity;
- preserving continuation provenance;
- preserving operator wording;
- producing no authority;
- performing no routing;
- creating no Work Units;
- performing no execution;
- opening no integration or release authority.

Canonical closure sentence:

> **Intent may name the desired outcome. Intent may not manufacture the authority required to produce it.**

## Programme standing

This artifact is an **O1 implementation candidate** until Founder adjudication and canonical admission.

- O0 Operator Constitution — CLOSED · CANONICAL
- O1 Intent Contract — candidate under witness
- O2 Work Graph — NOT OPEN
- O3 Authority Planner — NOT OPEN
- O4 Capability Router — NOT OPEN
- O5 Execution Supervisor — NOT OPEN
- O6 Verification Supervisor — NOT OPEN
- O7 Operator Decision Surface — NOT OPEN
- O8 Integration Supervisor — NOT OPEN
- O9 Programme Closure — NOT OPEN
- O10 Desktop Operator Witness — NOT OPEN
- O11 Mobile Operator Witness — NOT OPEN

## Candidate witness

Witnessed from exact reconciled O1 opening canonical
`65bcb76bb38d4f57e816253fdbec0ea036d6c166`.

O1 was first drafted from closed O0 canonical `505ee71da83139de7d2441e6693574f3b1a68c97`.
Canonical then advanced by one disjoint model-transport commit. The delta touched no O0/O1/operator-intent seam; O1 was replayed onto `65bcb76bb38d4f57e816253fdbec0ea036d6c166` and the full witness re-passed.

Commands:

```text
node --test jarvis-desktop/test/operator-intent-contract.test.mjs
node --test jarvis-desktop/test/operator-constitution.test.mjs
node --test jarvis-desktop/test/operator-flow.test.mjs jarvis-desktop/test/operator-work-unit.test.mjs
node --check jarvis-desktop/src/operator-intent-contract.js
git diff --check
```

Observed:

- O1 intent/falsifier suite: **16 passed · 0 failed**;
- O0 constitutional regression: **14 passed · 0 failed**;
- existing operator-flow/work-unit regression: **15 passed · 0 failed**;
- syntax and whitespace checks: **PASS**;
- no existing source file modified;
- no routing, provider invocation, Work Unit creation, integration, deployment, or production mutation;
- O2 remains unopened.

This establishes an O1 implementation candidate only.
Canonical closure still requires Founder adjudication of the exact candidate and a fresh canonical admission.
