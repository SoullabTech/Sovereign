# SOULLAB-WHOLE-ORGANISM-ORCHESTRATION-01 / O8R4

## POST-F1 PRE-F2 TEXT-ONLY DESCRIPTION INTERCEPT CANDIDATE IMPLEMENTATION ONLY

**Status:** CANDIDATE IMPLEMENTED IN WORKING TREE · ROUTE CONTRACT PASS · NO COMMIT / MERGE / DEPLOYMENT · AWAITING FOUNDER ADJUDICATION

## Authorized boundary

O8R4 changed only:
- the active MAIA `/list` route import surface;
- the exact post-F1 / pre-F2 candidate branch;
- one route-level structural/conformance test;
- documentary evidence.

O8R4 did not change:
- the three-capability resolver/composer behavior;
- `platformKnowledge.ts`;
- House;
- access rules;
- voice/TTS;
- client/UI;
- `TurnsStore` implementation;
- capability presentation copy;
- deployment state.

## Candidate route mutation

Active route:
`app/api/sovereign/app/maia/list/route.ts`

Pre-O8R4 witness SHA-256:
`3f3ba6ec7491aa627a31728b14d9677b20e0d73f340acefe214914da654491ab`

O8R4 candidate SHA-256:
`c51ce17e63eae4177bbc24a145030c553459df97c311c34725655e3e741f7906`

The diff is constrained to:
1. one import from `@/lib/maia/explicitCapabilityInquiry`;
2. one branch between the existing F1 member-turn durability block and the existing F2 identity-inquiry classifier.

No existing route block was moved or deleted.

## Candidate control flow

```text
existing validation
→ F1 member-turn acceptance / durability
→ if includeAudio === true: bypass O8
→ pure explicit-capability resolver
   ├─ ABSTAIN / failure: fall through to existing F2 unchanged
   └─ DESCRIBE:
        initializeSessionTable
        ensureSession
        exact deterministic compose/render
        conditional same-exchange assistant durability
        direct Canon provenance
        minimal deterministic response
        EARLY RETURN
→ existing F2 / cognition only when O8 did not return
```

## Implemented invariants

The candidate implements:
- post-F1 placement;
- pre-F2 placement;
- text-only pilot (`includeAudio !== true`);
- ABSTAIN fall-through;
- resolver/composer failure fall-through;
- session-infrastructure failure remains outside the fail-open catch and uses existing route error handling;
- same `exchangeId` for durable assistant half;
- no assistant write without durable recognized non-Sanctuary member half;
- Sanctuary and guest persistence refusal by construction;
- assistant durability failure logs/degrades but does not fall into model generation;
- minimal deterministic response;
- Canon `pipeline: direct`, `source: direct`;
- `SANCTUARY` provenance mode when applicable;
- no provider/model/cognition fields in deterministic response;
- early return before F2/cognition/memory/observer/signal/shadow/offer/audio paths.

## Production-source consumer custody

Canonical inert source:
`lib/maia/explicitCapabilityInquiry.ts`

SHA-256:
`1629b7f1f79a068e741fa390befc9199c770dec1e9a1bd1c8bc8c34a2a777b27`

Non-test production import census after O8R4:

`1`

That consumer is exactly:
`app/api/sovereign/app/maia/list/route.ts`

No House, UI, platformKnowledge, voice, middleware, or other production consumer imports the module.

## Route-level candidate test

Test:
`app/api/sovereign/app/maia/list/__tests__/explicitCapabilityDescriptionIntercept.test.ts`

SHA-256:
`17e3a353f9620f511ca9c02e237bf29c5010fd756ddaaaa5bd85fa3d6f691893`

Result:
`8/8 PASS`

The test proves:
- source import is from the inert production module, never tests;
- O8 is strictly after F1 and before F2;
- text-only guard exists;
- resolver → compose → render ordering exists;
- ABSTAIN has no O8-specific fallback;
- session infrastructure is the only pre-response route work in the branch;
- same-exchange assistant durability guard is present;
- durability failure does not call cognition;
- deterministic response has direct Canon provenance;
- fabricated provider/model/cognition fields are absent;
- production resolver source remains zero-import and route-independent.

## Source-equivalence and upstream evidence

O8R3 behavioral equivalence:
`41/41 PASS`

O8R1 explicit-inquiry matrix:
- fixture 4/4 PASS;
- accepted queries 7/7 PASS;
- refusals 20/20 PASS;
- falsifiers 15/15 DEAD;
- LETHAL + DISCRIMINATING.

O7R2R1 presentation reconciliation:
PASS · LETHAL + DISCRIMINATING

O6 topology:
PASS · LETHAL + DISCRIMINATING

O5 awareness:
PASS · LETHAL + DISCRIMINATING

O3/O4 + O8R3:
`64/64 PASS`

PlatformKnowledge + legacy voice-world-navigation:
`117/117 PASS`

## Route security / Sanctuary guards

After the candidate patch:
- `resolveIdentity.test.ts`: PASS;
- `relationalSanctuaryGuard.test.ts`: PASS.

The candidate branch uses already-resolved `userId`, `isRecognizedUser`, `isSanctuary`, `turnPosture`, `exchangeId`, and `acceptedSessionId` from the existing F1 boundary.

It creates no new identity or Sanctuary source of truth.

## Historical O8R2R1 witness behavior

The historical O8R2R1 matrix remains frozen to the pre-mutation route SHA:
`3f3ba6ec7491aa627a31728b14d9677b20e0d73f340acefe214914da654491ab`

After O8R4, it correctly reports:
`ACTIVE_ROUTE_WITNESS_DRIFT`

against candidate route SHA:
`c51ce17e63eae4177bbc24a145030c553459df97c311c34725655e3e741f7906`

Its route-plan laws and 10 reference scenarios still pass, but the matrix refuses final acceptance because the live route is no longer the old witness.

This historical matrix was not rewritten to bless its own successor.

O8R4 route conformance is carried by the new 8/8 candidate test and this adjudication packet.

## Unrelated voice-suite baseline drift

`__tests__/voice-non-degradation.test.ts` currently fails three assertions because canonical `components/OracleConversation.tsx` contains two calls not present in that suite's ratified call list:
- `crisisCheck.responseScript.join`;
- `crisisCheck.responseScript.join(...).trim`.

Neither `components/OracleConversation.tsx` nor `__tests__/voice-non-degradation.test.ts` has a working-tree diff in this lane.

Therefore O8R4 did not repair, suppress, or absorb that unrelated baseline drift.

Legacy `voice-world-navigation.test.ts` remains `47/47 PASS`.

## Source hygiene and custody

`git diff --check` for the O8R4 route/test/source surfaces:
`PASS`

Candidate test/source targeted TypeScript compilation:
`PASS`

Branch:
`chore/a1-ls1r1-packet-transport-20260925`

HEAD remains:
`e886888416062c7fcbcf899040e3827bc8013835`

No O8R4 commit, merge, deployment, or production rollout occurred.

## Concurrent working-tree custody

Unrelated House/access work remains present:
- `app/house/page.tsx` — modified/staged outside this lane;
- `config/accessMatrix.ts` — modified outside this lane;
- `lib/house/catalog.ts` — untracked House work.

O8R4 did not edit, revert, stage, or absorb those surfaces.

The repository as a whole is not claimed clean.

## Acceptance result

> **O8R4 CANDIDATE PASS — ACTIVE `/list` ROUTE IMPORT + POST-F1/PRE-F2 TEXT-ONLY DESCRIPTION BRANCH IMPLEMENTED · ROUTE CONTRACT 8/8 PASS · O8R3 EQUIVALENCE 41/41 PASS · IDENTITY + SANCTUARY GUARDS PASS · APPLICABLE CONSTITUTIONAL STACK GREEN · EXACTLY ONE NON-TEST PRODUCTION CONSUMER · NO COMMIT / MERGE / DEPLOYMENT**

## What O8R4 does not authorize

O8R4 does not authorize:
- deployment;
- merge;
- production rollout;
- widening the pilot allowlist;
- audio/TTS description handling;
- proactive capability suggestion;
- routing or availability claims;
- House/UI changes;
- additional production consumers.

## Standing

> **O8R4 — LIVE-ROUTE CANDIDATE IMPLEMENTATION COMPLETE IN WORKING TREE · POST-F1/PRE-F2 CONTRACT PRESERVED · DEPLOYMENT AUTHORITY CLOSED · AWAITING FOUNDER ADJUDICATION**

## Exact next boundary

> **FOUNDER ADJUDICATION — O8R4 POST-F1 PRE-F2 TEXT-ONLY DESCRIPTION INTERCEPT CANDIDATE IMPLEMENTATION**

Acceptance must still stop before commit/merge/deployment or any claim that the member-facing pilot is live.