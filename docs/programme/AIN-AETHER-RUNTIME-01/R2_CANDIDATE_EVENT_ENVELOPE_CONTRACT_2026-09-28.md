# AIN-AETHER-RUNTIME-01R2 — Candidate Event Envelope Contract

Date: 2026-09-28

Parent runtime R1: `34827027cc3db4247eea3be720a48149ac282349`

## Purpose

R2 defines the smallest synthetic observation envelope that may cross the read-only runtime membrane for constitutional evaluation.

> **An event may describe an observation entering the field; it may not smuggle interpretation authority across the membrane.**

## Synthetic-only law

Every R2 candidate event must carry `synthetic: true`.

Any non-synthetic candidate is refused.

R2 does not accept live member data.

## Minimum envelope

A candidate event carries:

- event reference;
- synthetic source standing;
- domain;
- observation;
- temporal standing;
- confidence in the interval 0–1;
- explicit synthetic consent.

## Authority boundary

Every admitted event is normalized to:

- identity authority: false;
- diagnostic authority: false;
- predictive authority: false;
- destiny authority: false;
- Soul-representation authority: false;
- persistence authority: false;
- final meaning authority: member.

A payload may not grant itself any of these powers.

## Consent law

R2 requires `explicit_synthetic_consent`.

Absent consent is refused even though the current programme uses synthetic data only.

This keeps consent structurally present before any live adapter exists.

## Language-smuggling law

The observation text is checked for obvious authority-smuggling forms.

R2 refuses language that declares identity, diagnosis, destiny, inevitability, or Soul wants/needs/decisions.

This is a membrane-level rejection test, not a complete language-safety system.

## Persistence law

No event may authorize its own persistence.

R2 returns:

- `liveMemberDataAuthorized: false`;
- `persistenceAuthorized: false`;
- `productionAuthority: false`.

## No-live-data boundary

R2 remains entirely synthetic.

No member identity.
No live observation source.
No storage.
No runtime route.
No MAIA prompt binding.
No production.

## Next boundary

> **AIN-AETHER-RUNTIME-01R3 — SYNTHETIC EVENT → BENCHMARK OBSERVATION ADAPTER · LOSSLESS CONVERSION + AUTHORITY NON-ESCALATION ONLY**

R3 should convert an admitted synthetic event into the existing benchmark observation shape while proving that no authority, confidence, consent, or temporal standing is silently strengthened in translation.
