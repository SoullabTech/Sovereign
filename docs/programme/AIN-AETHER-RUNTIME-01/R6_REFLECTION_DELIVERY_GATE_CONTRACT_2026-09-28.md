# AIN-AETHER-RUNTIME-01R6 — Reflection Delivery Gate Contract

Date: 2026-09-28

Parent runtime R5: `9aedafed3762e98b12f48b811cb37beb12cfb793`

## Purpose

R6 separates reflection quality from delivery authority.

> **Evidence quality, semantic fidelity, and dialogue quality can never self-authorize delivery.**

## Human-authorization law

A valid R5 reflection candidate cannot pass the R6 gate without an explicit human authorization record.

The authorization must:

- name the exact candidate;
- be issued by a human;
- explicitly grant authorization;
- use the scope `synthetic_handoff_only`;
- carry an authorization reference and note.

## Handoff-token law

A successful R6 gate creates only a synthetic handoff token.

The token means:

> this exact candidate may proceed to the next synthetic delivery-design stage.

It does not mean:

> deliver this to a member.

## Non-delivery law

Even after human authorization:

- member-facing delivery authorized: false;
- delivery executed: false;
- persistence authorized: false;
- MAIA prompt mutated: false;
- production authority: false.

## Candidate-validity law

The gate records:

> `candidateValiditySelfAuthorized: false`

A candidate can never use its own benchmark quality as delivery permission.

## Mismatch law

Authorization for one candidate cannot authorize another.

Candidate-reference mismatch is refused.

## Human refusal law

A human authorization record with `authorized: false` keeps the gate closed.

## No-live-delivery boundary

R6 remains synthetic.

No real member delivery.
No notification.
No persistence.
No production route.
No MAIA prompt binding.

## Next boundary

> **AIN-AETHER-RUNTIME-01R7 — SYNTHETIC DELIVERY SIMULATION · TOKEN-CONSUMING NO-OP SINK + AUDITABLE NON-DELIVERY ONLY**

R7 should consume an R6 synthetic handoff token into a no-op delivery simulator that proves the orchestration path can advance without sending anything to a member, writing anything, or opening production authority.
