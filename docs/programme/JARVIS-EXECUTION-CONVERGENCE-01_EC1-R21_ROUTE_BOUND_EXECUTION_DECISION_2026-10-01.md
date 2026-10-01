# JARVIS-EXECUTION-CONVERGENCE-01 / EC1-R21 — Route-Bound Execution Decision

**Date:** 2026-10-01  
**Parent:** EC1-R20 route provenance `593cc42d1580`  
**Class:** bounded host-decision/lifecycle integration  
**W4 projection:** NOT YET WIRED

## Change

The local-candidate host execution decision now binds:

- repository root;
- Path A run id;
- Work id;
- exact packet digest;
- W2 authorized-core digest;
- W3 route digest;
- the complete active READY Qwen W3T transport binding.

The decision version advances to `EC1-R21.v1`.

## Host flow

Local-candidate execution now requires the canonical Work to already be `ROUTED` with the exact Qwen primary route and READY governed transport.

After native confirmation:

1. MAIN re-reads the current ROUTED Work;
2. re-projects the packet from the same frozen W2 authority;
3. re-checks packet, authorized core, verifier plan, route digest, and Qwen transport binding;
4. constitutes one route-bound host decision;
5. transitions W2 `ROUTED → EXECUTING`;
6. only then calls the Path A mechanism.

If the W2 transition refuses, Path A is never called.

## Lower seam

`builder-mechanism.runWorkUnit()` independently re-verifies the constituted decision against the same route digest and Qwen binding before any run record is persisted.

A decision from another route, another Qwen binding, another packet, another run, another root, or another authorized core returns `EXECUTION_DECISION_REQUIRED` / binding mismatch before persistence.

The packet projector now admits both `AUTHORIZED` and `ROUTED`, with a proof that routing does not alter the projected packet or authorized-core digest.

## Proof

- decision custody: **11/11 PASS**;
- host decision flow: **9/9 PASS**;
- mechanism boundary: **3/3 PASS**;
- packet projection: **10/10 PASS**;
- R20 routing: **6/6 PASS**;
- MAIN composition: **8/8 PASS**;
- W2 lifecycle: **13/13 PASS**.

Explicit route defeats:

- route-digest drift while confirmation is open → refused before EXECUTING;
- active Qwen transport drift while confirmation is open → refused before EXECUTING.

Approval witness proves W2 is `EXECUTING` before the mechanism call.

## Standing

```text
W3 route provenance:             BOUND INTO DECISION
Qwen W3T binding:                BOUND INTO DECISION
host decision:                   ONE-SHOT / ROUTE-BOUND
W2 ROUTED → EXECUTING:           AFTER DECISION ONLY
Path A mechanism:                AFTER W2 EXECUTING ONLY
canonical provider grant:        NONE / FORBIDDEN FOR THIS PATH
W4 projection:                   NEXT BOUNDARY
```

The next act may adapt EC1-R4 projection to accept the constituted EC1-R21 host decision as the effect-authority witness, while retaining W3/W3T as model provenance and refusing any fabricated canonical provider grant.
