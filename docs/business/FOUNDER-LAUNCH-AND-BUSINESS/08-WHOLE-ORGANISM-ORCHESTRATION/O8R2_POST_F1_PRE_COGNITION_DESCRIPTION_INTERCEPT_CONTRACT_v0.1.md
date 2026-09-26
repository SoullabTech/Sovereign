# SOULLAB-WHOLE-ORGANISM-ORCHESTRATION-01 / O8R2

## POST-F1 PRE-COGNITION DESCRIPTION INTERCEPT CONTRACT DESIGN ONLY

**Status:** DESIGN ONLY · ACTIVE ROUTE IDENTIFIED · NO ROUTE EDIT · NO RUNTIME RESOLVER IMPORT · NO MEMBER-VISIBLE CHANGE

## Governing purpose

Define the exact future insertion seam for the already-conformed O8 explicit-capability-inquiry resolver without allowing that resolver to become intent routing, availability logic, cognition, or a second MAIA pipeline.

> **DESCRIBE must be a deterministic early response from an already-accepted utterance. ABSTAIN must leave existing MAIA unchanged.**

## Active route custody

Authoritative serving route:
`app/api/sovereign/app/maia/list/route.ts`

O8R2 witness SHA-256:
`3f3ba6ec7491aa627a31728b14d9677b20e0d73f340acefe214914da654491ab`

Invalid targets:
- `app/api/oracle/conversation/route.ts` — hard-disabled with HTTP 410;
- `app/api/sovereign/app/maia/route.ts` — explicitly dormant and superseded by `/list`.

Any future implementation must re-witness the active route hash and reconcile drift before changing the seam.

## Existing load-bearing boundaries preserved

Before O8 may inspect a message, the existing route retains:
1. static-export stub behavior;
2. schema readiness gate;
3. request-body parsing;
4. verified member-identity resolution;
5. DEMO_MODE behavior;
6. message validation;
7. F1 TURN ACCEPTANCE BOUNDARY;
8. Sanctuary posture resolution;
9. recognized-user determination;
10. canonical `turnPosture`;
11. canonical `exchangeId`;
12. canonical `acceptedSessionId`;
13. existing durable member-turn attempt.

> **Nothing may be inserted above F1.**

The O8 resolver sees only the already-validated `message` string.

## Exact future insertion locus

The future O8 intercept belongs immediately **after the existing F1 member-turn durability block and before the existing F2 identity-inquiry classifier**.

Current anchor above the seam:
`memberTurnDurable = await TurnsStore.addExchangeTurn(...)` and its existing failure handling.

Current anchor below the seam:
`const explicitIdentityInquiryClassification = classifyExplicitIdentityInquiry(message);`

Therefore O8 does not enter:
- F2 classification;
- session cognitive-profile work;
- name-change detection;
- field-safety computation;
- memory or retrieval;
- prompt composition;
- model selection or generation;
- capability-offer cognition.

unless it ABSTAINS.

## Request-channel eligibility

The initial pilot is **text-response only**.

Future intercept eligibility requires:
`includeAudio !== true`

If audio is requested:
> **O8 does not resolve; the existing MAIA/voice path proceeds unchanged.**

Reason:
- the current route has an established audio path;
- O8 has no TTS authority;
- returning deterministic text without the expected audio contract would degrade voice behavior;
- adding deterministic TTS is a separate future act.

## Future control flow

```text
existing validation + F1 acceptance
        ↓
if includeAudio === true
        └── normal MAIA path unchanged
        ↓
O8 pure resolver(message)
        │
        ├── ABSTAIN
        │     └── continue at existing F2 classifier
        │         and the current route proceeds unchanged
        │
        └── DESCRIBE
              ↓
           initialize session infrastructure only
              ↓
           deterministic composer
              ↓
           conditional assistant durability
              ↓
           minimal client-compatible response
              ↓
           EARLY RETURN
```

## ABSTAIN law

ABSTAIN has exactly one effect:
> **none.**

On ABSTAIN:
- no response object is created by O8;
- no metadata is added by O8;
- no log/event is required by O8;
- no route state is mutated by O8;
- existing F2 classification and every later MAIA path continue as before.

O8 ABSTAIN must therefore be observationally equivalent to the route with O8 absent.

## DESCRIBE session-infrastructure law

A DESCRIBE response must satisfy the existing client response contract without entering cognition.

After DESCRIBE and before response, the future branch may execute only the existing session infrastructure needed to provide stable session identity:

```text
initializeSessionTable()
ensureSession(sessionId)
```

It may not execute cognitive profile or name-change detection merely to obtain the session.

This means the DESCRIBE branch uses session infrastructure, not cognition.

## Deterministic description law

The future branch consumes the existing O8 resolver/composer output only.

Rendered assistant text remains exactly:
`<APPROVED_NAME> — <APPROVED_PURPOSE>`

No model is called.
No prompt is built.
No output repair or paraphrase is permitted.
No closing anchor is added.
No platform-orientation copy is appended.
No offer is appended.

## Durability matrix

#

## Recognized member · non-Sanctuary · member half durable

If `memberTurnDurable === true`, DESCRIBE must attempt the assistant half using the existing F1 discipline:
- same verified `userId`;
- same `acceptedSessionId`;
- role `assistant`;
- exact deterministic description as content;
- same `exchangeId`;
- same `turnPosture`.

> **A description is the assistant half of the accepted exchange, not a side artifact.**

### Recognized member · non-Sanctuary · member durability failed

If the existing F1 member-turn write failed and `memberTurnDurable === false`:
- O8 must not write an orphan assistant half;
- the deterministic description may still be returned, matching current route degradation behavior;
- no model fallback is permitted;
- the durability failure remains an infrastructure degradation, not a reason to invent another response.

#

## Sanctuary

Sanctuary resolves normally for description but remains fully non-persistent:
- no member-turn write;
- no assistant-turn write;
- no memory/retrieval;
- no observer/signal/shadow path;
- Canon mode `SANCTUARY`.

#

## Guest / unrecognized user

Guest description is likewise ephemeral:
- no member-attributed turn write;
- no assistant durability write;
- no account-state claim;
- same approved copy as any other caller.

## Assistant-durability failure law

If the member half is durable and the deterministic assistant write throws or times out:
- log the existing durability error posture;
- do not erase the member turn;
- do not invoke a model to replace the description;
- do not retry through capability-offer or general routing;
- return the deterministic description to the client.

This mirrors the live F1 asymmetry:
> **a durability failure degrades the record; it does not change the words served.**

## Minimal response envelope

The future DESCRIBE branch should return only the fields required for current client compatibility and truthful processing metadata:

```ts
{
  message: exactDescription,
  route: {
    endpoint: '/api/sovereign/app/maia',
    type: 'Sovereign Consciousness Interface',
    operational: true,
    mode: 'capability-description',
    safeMode: SAFE_MODE,
    voiceEnabled: false,
  },
  session: {
    id: session.id,
    turns: session.turn_count,
  },
  metadata: {
    processingProfile: 'DETERMINISTIC_DESCRIPTION',
    processingTimeMs: Date.now() - start,
    tierProcessing: false,
    voiceRequested: false,
  },
}
```

## Fields deliberately absent from DESCRIBE response

The branch must not fabricate:
- stateVector;
- practiceRecommendation;
- AIN state;
- memoryHealth;
- runtimeContext derived from cognition;
- servingTruth from a model path;
- providerUsed;
- model;
- model mode;
- turnId / decisionId / deliberationId;
- audio;
- capability offers;
- navigation actions.

Current client handling accepts `message` as the assistant text, while existing beta contracts require route metadata, session identity, and numeric `processingTimeMs`.

The response therefore remains client-compatible without pretending model work occurred.

## Canon provenance law

Canon v1.1 requires provenance headers on every assistant-text response.

Current `canonHeaders.ts` witness SHA-256:
`38e3178c97286915498281d178d06621cc641cf43a1e33f7fd573618557b1d8a`

Future DESCRIBE headers must be truthful:

```ts
makeCanonHeaders({
  requestId,
  pipeline: 'direct',
  source: 'direct',
  mode: isSanctuary ? 'SANCTUARY' : 'STANDARD',
  validation: null,
  repaired: false,
})
```

No provider, model, or fallback headers are emitted because no model handled the response.

## Side-effect exclusion law

A successful DESCRIBE early return must occur before and therefore exclude:
- `classifyExplicitIdentityInquiry`;
- cognitive-profile loading;
- name-change detection;
- field-safety computation;
- MemoryBundle / cross-session recall;
- member-web loading;
- astrology context loading;
- Wu Xing / symbolic context computation;
- AIN knowledge-gate scoring;
- governed knowledge retrieval;
- teaching-intelligence construction;
- memory orchestrator / atoms / episodic / divination recall;
- `getMaiaResponse`;
- provider availability checks;
- Socratic/model validation;
- closing-anchor repair;
- relational observation;
- relational signal detection/persistence;
- conversation-started signal emission;
- Relational Field Shadow launch;
- capability-offer/capability-available surfaces;
- audio synthesis.

> **DESCRIBE is a terminal pre-cognition branch.**

## Failure containment

#

## Resolver internal failure
If the pure O8 resolver unexpectedly throws:
> **treat the intercept as absent and continue the existing MAIA path.**

O8 must not construct a partial response.

#

## Composer internal failure
If deterministic composition unexpectedly fails before assistant text exists:
> **treat the intercept as absent and continue the existing MAIA path.**

The general route may answer under its existing authorities, but O8 contributes no presentation text.

#

## Session-infrastructure failure on DESCRIBE
If `initializeSessionTable()` or `ensureSession()` fails:
- use the route's existing infrastructure error channel;
- do not bypass session integrity with an ad-hoc response;
- do not call the model merely to avoid the infrastructure error.

## Maintenance / usage posture

No separate usage or maintenance gate was found in the current active `/list` route before the O8 seam beyond the existing schema/DEMO/message/identity posture.

O8 does not create an access exemption:
- it makes no current-member availability claim;
- it creates no entitlement;
- it does not change any future route-level gate ordering.

If a future global gate is added above F1, that gate remains dominant and O8 must remain below it.

## O8R2 invariants

1. `F1_BEFORE_O8` — member acceptance/durability remains above resolver.
2. `O8_BEFORE_F2` — DESCRIBE/ABSTAIN decision occurs before F2 and cognition.
3. `TEXT_ONLY_PILOT` — audio requests bypass O8.
4. `ABSTAIN_IS_IDENTITY` — ABSTAIN leaves normal route behavior unchanged.
5. `DESCRIBE_PRE_COGNITION_TERMINAL` — DESCRIBE returns before cognition/model/memory paths.
6. `SESSION_INFRA_ONLY` — DESCRIBE may initialize/ensure session but no profile/intent work.
7. `EXACT_COPY` — assistant text is exact approved description.
8. `SAME_EXCHANGE_DURABILITY` — durable assistant half uses same exchange identity.
9. `NO_ORPHAN_ASSISTANT` — assistant write requires durable member half.
10. `SANCTUARY_EPHEMERAL` — Sanctuary produces no persistence.
11. `GUEST_EPHEMERAL` — guest description produces no member-attributed persistence.
12. `DURABILITY_FAILURE_NOT_MODEL_FALLBACK` — write failure never invokes cognition.
13. `MINIMAL_RESPONSE_TRUTH` — no fabricated model/cognition fields.
14. `CANON_DIRECT_PROVENANCE` — direct deterministic assistant text retains Canon headers.
15. `NO_SIDE_EFFECT_TAIL` — observers/signals/shadow/audio/offer paths do not run.
16. `ROUTE_WITNESS_CUSTODY` — implementation requires current route reconciliation.

## O8R2 falsifier design

| ID | Defect | Required failure |
| --- | --- | --- |
| F-O8R2-01 | resolver placed before F1 | `F1_MUST_PRECEDE_DESCRIPTION_INTERCEPT` |
| F-O8R2-02 | DESCRIBE proceeds into F2/cognitive profile | `DESCRIBE_MUST_RETURN_PRE_COGNITION` |
| F-O8R2-03 | ABSTAIN changes response/meta/state | `ABSTAIN_MUST_FALL_THROUGH_UNCHANGED` |
| F-O8R2-04 | audio request intercepted | `TEXT_ONLY_PILOT` |
| F-O8R2-05 | durable assistant uses new exchangeId | `SAME_EXCHANGE_REQUIRED` |
| F-O8R2-06 | assistant persisted when member half not durable | `NO_ORPHAN_ASSISTANT` |
| F-O8R2-07 | Sanctuary description persisted | `SANCTUARY_NON_PERSISTENCE` |
| F-O8R2-08 | guest description written under member identity | `GUEST_NON_PERSISTENCE` |
| F-O8R2-09 | assistant write failure falls into model | `DURABILITY_FAILURE_NOT_MODEL_FALLBACK` |
| F-O8R2-10 | response claims provider/model | `DETERMINISTIC_RESPONSE_MUST_NOT_FAKE_PROVIDER` |
| F-O8R2-11 | response carries stateVector/AIN/memory result | `PRE_COGNITION_RESPONSE_MINIMALITY` |
| F-O8R2-12 | Canon headers omit direct provenance | `CANON_PROVENANCE_REQUIRED` |
| F-O8R2-13 | DESCRIBE emits observer/signal/shadow event | `DESCRIPTION_SIDE_EFFECT_FORBIDDEN` |
| F-O8R2-14 | DESCRIBE invokes capability-offer surface | `DESCRIPTION_NOT_OFFER` |
| F-O8R2-15 | route witness changes without re-reconciliation | `ACTIVE_ROUTE_WITNESS_DRIFT` |
| F-O8R2-16 | resolver/composer failure fabricates O8 output | `INTERCEPT_FAILURE_MUST_DISAPPEAR` |

## Design conclusion

> **The first lawful runtime seam is a text-only, post-F1, pre-F2/pre-cognition deterministic intercept in the active `/api/sovereign/app/maia/list` route.**

It is structurally additive:
- ABSTAIN leaves the route unchanged;
- DESCRIBE returns exact authored copy without entering MAIA cognition;
- existing durability and Sanctuary laws remain dominant;
- existing response/client contracts remain satisfied;
- no model authority is manufactured.

## Standing

> **O8R2 DESIGN — POST-F1 / PRE-F2 DESCRIPTION INTERCEPT CONTRACT DEFINED · SAME-EXCHANGE DURABILITY · SANCTUARY/GUEST EPHEMERALITY · TEXT-ONLY PILOT · DIRECT CANON PROVENANCE · PRE-COGNITION EARLY RETURN · NO ROUTE MUTATION**

## Exact next boundary

> **SOULLAB-WHOLE-ORGANISM-ORCHESTRATION-01 / O8R2R1 — POST-F1 PRE-COGNITION INTERCEPT SIMULATION + ROUTE-SEAM CONFORMANCE MATRIX ONLY**

O8R2R1 may:
- encode a pure route-seam simulator in test/governance only;
- model member durable / member durability-failed / Sanctuary / guest states;
- model text vs audio requests;
- prove ABSTAIN fall-through and DESCRIBE early return;
- prove same-exchange assistant durability intent;
- prove minimal response and direct Canon provenance;
- prove cognition/model/memory/observer/offer paths remain zero on DESCRIBE;
- bind to the active-route and canon-header witness hashes;
- add defeat candidates and evidence.

O8R2R1 may not:
- edit `/api/sovereign/app/maia/list/route.ts`;
- import the resolver into production;
- modify TurnsStore;
- modify platformKnowledge;
- change client/UI behavior;
- authorize runtime descriptions;
- add telemetry or persistence authority.
