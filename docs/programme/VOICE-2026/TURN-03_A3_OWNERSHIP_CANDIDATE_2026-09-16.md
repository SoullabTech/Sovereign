# TURN-03 A3 — Asymmetric Floor-Ownership Candidate

**Date:** 2026-09-16
**State:** SHADOW CANDIDATE · OBSERVED-CORPUS PASS · NOT LIVE AUTHORITY

## Candidate law

TURN-01 remains sovereign. For each selected Conversational Space:

- selected silence threshold = earliest consideration point;
- existing `adaptiveCeilingMs` = generic ambiguity handoff point;
- explicit floor ownership and active member speech always mean WAIT;
- strong semantic continuation may hold beyond the generic ceiling;
- explicit semantic yield may hand off at the member floor;
- acoustic/model "complete" evidence may not shorten the ambiguity window;
- if member speech resumes exactly when the generic timer fires, speech onset wins.

Natural therefore behaves as: 0–3.5 s member-owned; 3.5–6.0 s ambiguity window; generic implicit handoff at 6.0 s. Responsive uses 1.8–3.5 s, Spacious 6–9 s, Contemplative 10–15 s. Explicit `I'm Done` mode remains outside silence authority entirely.

## Sealed observed-corpus result

Across the two already-sealed A3 populations:

- 22 cases total;
- 15 continuation cases;
- 7 yield cases;
- false floor seizures: **0 / 15**;
- yield recall: **7 / 7**;
- median yield latency: **6000 ms**.

Explicit semantic yields hand off at 3500 ms. Implicit yields reach the Natural ambiguity ceiling at 6000 ms.

## Limitation / falsifier

This is not a universal zero-interruption claim. Boundary stress proves that an ambiguous Natural-mode continuation with no recognized continuation cue that extends beyond 6000 ms would receive a generic yield candidate. The corresponding boundaries are 3500 ms Responsive, 6000 ms Natural, 9000 ms Spacious, and 15000 ms Contemplative.

Therefore member preference and explicit floor control remain essential. A4 must test real human timing distributions and re-entry behavior before any TURN-04 live influence can be considered.

## Authority

This record grants no transcript commit, cognition dispatch, TTS start, endpointing change, deployment, or TURN-04 authority.
