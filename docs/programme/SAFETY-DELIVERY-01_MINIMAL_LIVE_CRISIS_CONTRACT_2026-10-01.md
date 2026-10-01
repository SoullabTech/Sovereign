# SAFETY-DELIVERY-01 — Minimal Live Crisis Contract

**Date:** 2026-10-01
**Evidence base:** commit:`a999932df7aa3d4052ee78f044878026aa4f680b`
**Stage:** pre-wiring recognition seam
**Production behavior changed:** no

## Purpose

Establish the smallest deterministic safety contract that may later sit at the canonical `/api/sovereign/app/maia/list` boundary without importing accidental notification or disclosure authority.

The live-path census established that the canonical route has field-readiness safety but no explicit mechanically witnessed present-utterance crisis contract.

This unit does **not** wire the route. It freezes recognition semantics first.

## Law 1 — Recognition is not disclosure

Crisis recognition does not authorize transmission to a practitioner, guardian, founder, Soullab team, emergency service, or any other third party.

Every recognition result carries:

`disclosureAuthorized: false`

That value is descriptive of this seam's authority: none.

Any future human disclosure mechanism requires a separate governed law covering recipient, basis, scope, delivery, failure semantics, and audit.

## Law 2 — Severity is tiered

The recognition vocabulary is:

- `none` — no crisis signal recognized;
- `check_in` — ambiguous distress; relational check-in may be appropriate, but ordinary flow is not mechanically overridden;
- `active` — explicit first-person suicidal ideation;
- `nssi` — explicit first-person non-suicidal self-injury urge or intent;
- `imminent` — explicit first-person suicidal intent plus immediate action, plan, means linkage, or already-acted language.

Only `active`, `nssi`, and `imminent` set `safetyOverride: true`.

## Law 3 — Ordinary language must survive

The detector must not classify ordinary completion, farewell, medication, academic/topic discussion, or third-person reporting as first-person crisis evidence.

Frozen negative examples include:

- "I'm done"
- "I'm done with this test"
- "this is goodbye"
- "I said goodbye to my mother at the airport"
- "goodbye to that old pattern"
- "I wrote letters"
- "I've just taken my medication"
- "I have pills for my headache"
- "we studied suicide prevention today"
- "my friend told me they want to die"
- "the article discusses self harm"

These defeat the broader voice stopgap patterns that remain intentionally unfixed in the voice detector.

## Law 4 — Explicit first-person safety language must not fall through

Frozen positive examples include:

### Active

- "I want to die"
- "I don't want to live anymore"
- "I wish I were dead"
- "I've been thinking about suicide"
- "I'm thinking about killing myself"

### NSSI

- "I need to hurt myself"
- "I want to cut myself"
- "I'm going to burn myself"

### Imminent

- "I'm going to kill myself"
- "I'm going to end my life"
- "I just took pills to kill myself"
- "I have a gun and I'm going to kill myself"

These must return `safetyOverride: true`.

## Law 5 — Recognition is pure

The recognizer performs no network call, persistence, alert send, recipient lookup, or human-notification operation.

It may be executed before ordinary cognition without creating an external effect.

## Current implementation seam

`lib/safety/crisisRecognition.ts`

The module is intentionally unbound to any route in this unit.

Tests:

`lib/safety/__tests__/crisisRecognition.test.ts`

The tests currently prove:

- negative false-positive set survives;
- ambiguous distress stays `check_in`;
- explicit suicidal ideation becomes `active`;
- explicit self-injury becomes `nssi`;
- explicit imminent language becomes `imminent`;
- disclosure authority is always false;
- the recognition module contains no transport/persistence/recipient mechanism.

## What remains unresolved

This unit does not yet decide the exact member-facing response copy.

It does not decide whether `check_in` should alter prompt posture, only that it must not be treated as a hard crisis override.

It does not decide any human escalation policy.

It does not unify voice and text implementations yet. The voice detector remains a separate older surface with known stopgaps.

## Next lawful wiring step

A later unit may wire this recognizer at the canonical `/list` ingress only if it preserves the following order:

1. accept the member utterance;
2. run deterministic crisis recognition;
3. if `active`, `nssi`, or `imminent`, inhibit ordinary symbolic/teaching elaboration;
4. produce a deterministic member-facing safety posture;
5. continue only within the safety posture;
6. do not disclose to another human merely because recognition fired.

The route wiring must have its own tests proving that a hard safety override cannot fall through into ordinary teaching/symbolic processing.

## Standing

**Recognition semantics implemented and tested. Route authority unchanged. Human disclosure authority unchanged: none.**
