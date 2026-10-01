# SAFETY-DELIVERY-01 — Canonical Live Wiring

**Date:** 2026-10-01
**Parent:** `SAFETY-DELIVERY-01_MINIMAL_LIVE_CRISIS_CONTRACT_2026-10-01.md`
**Parent commit:** commit:`de12b3497ce55673e06c63c27c4bdda4f716f45c`
**Ingress:** `/api/sovereign/app/maia/list`
**Authority:** member-facing deterministic safety response only; no third-party disclosure

## Runtime order

For a valid member utterance, the canonical route now preserves this order:

1. resolve authenticated member identity;
2. validate the message;
3. perform F1 durable member-turn acceptance when persistence is lawful;
4. run deterministic crisis recognition;
5. for `active`, `nssi`, or `imminent`, build and return the deterministic safety response;
6. preserve the assistant half under the same exchange identity when persistence is lawful;
7. return **before** command handling, cognitive-profile field routing, knowledge assembly, or model cognition.

The safety seam therefore cannot become a symbolic, teaching, astrological, memory, or model-generated interpretation before the member receives the deterministic safety floor.

## Member-facing behavior

Hard safety overrides are self-contained.

They do not ask a yes/no follow-up whose meaning requires hidden server state on the next request.

They direct the member toward immediate real-world support, moving away from means where applicable, and getting another person physically present when possible.

For the U.S. and its territories, the deterministic copy names 988 by call or text. Outside that jurisdiction it directs the member to local crisis or emergency services.

For imminent language, the copy also directs the member to the local emergency number if they may act immediately or have already harmed themselves.

## Why there is no persisted crisis mode

The existing canonical session substrates do not provide a reliable, privacy-neutral ephemeral safety-state channel:

- in-memory Maps are process-local and not reliable across instances/restarts;
- DB-backed session state would persist sensitive risk/mental-health information and widen the privacy contract.

This unit therefore does not create a `safety_posture` column, crisis ledger, risk score, or hidden member state.

A future multi-turn safety posture requires a separate privacy/retention design.

## Disclosure boundary

The response metadata includes:

`disclosureAuthorized: false`

No alert sender, Resend call, SMTP call, webhook, therapist lookup, guardian lookup, practitioner lookup, Soullab-team notification, or emergency-service dispatch is introduced.

The recognizer and member-facing response are not treated as consent or authority to disclose.

## Durability

The member half is accepted under the pre-existing F1 boundary before recognition.

When the member half is durable and the turn is not Sanctuary, the deterministic assistant safety response is written through `TurnsStore.addExchangeTurn` with:

- the same `exchangeId`;
- role `assistant`;
- the exact deterministic safety text.

If assistant persistence fails, the route logs the durability failure but does not reopen ordinary model cognition. The safety response is still served.

Sanctuary's existing non-persistence law remains unchanged.

## False-positive law

The server detector does not inherit known broad voice stopgap patterns.

Examples that remain ordinary:

- "I'm done"
- "this is goodbye"
- "I wrote letters"
- "I've just taken my medication"
- "I have pills for my headache"
- third-person or educational discussion of suicide/self-harm

Ambiguous distress such as "what's the point" or "nothing matters" is classified `check_in`, not hard override.

## Tests

`lib/safety/__tests__/crisisRecognition.test.ts`

proves recognition tiers, negative examples, deterministic member responses, resource presence, no disclosure authority, and no transport/persistence inside the recognition module.

`app/api/sovereign/app/maia/list/__tests__/crisisSafetyOverride.test.ts`

proves:

- recognition is after durable acceptance;
- recognition is before command/profile/model cognition;
- hard override returns before `getMaiaResponse`;
- the assistant safety half reuses the exchange identity;
- the override block contains no human-notification transport.

## Explicit non-claims

This does not diagnose suicidality.

This does not claim perfect natural-language crisis detection.

This does not establish a multi-turn crisis state.

This does not notify another human.

This does not close S1, S2, S3, or S4 in the non-delivery register.

## Standing

**Canonical hard safety override implemented on the stacked branch; admission requires review, CI, and merge of its parent recognition contract first.**
