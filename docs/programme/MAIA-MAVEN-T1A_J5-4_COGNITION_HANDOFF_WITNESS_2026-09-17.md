# MAIA-MAVEN-T1A — J5-4 COGNITION PROJECTION + TRUE HANDOFF WITNESS

**Status:** J5-4 COMPLETE · **J5-5 NOT OPENED** · ⛔ LIVE `/maia` ROUTE STILL UNWIRED
**Date:** 2026-09-17
**Authority act:** founder instruction “lets continue” after J5-4 was named as the next exact act
**Base:** `64234be42d973a14ab9d4085ff8cd81db027f26a` — `feat(maven): close T1-A J5-3 request authority`
**Specification:** `MAIA-MAVEN-T1A_J5_IMPLEMENTATION_SPEC_2026-09-17.md`

---

## 1. Authorized cut

J5-4 was authorized to build and prove the cognition crossing only:

```text
receipt-backed Keep identities from J5-3
        ↓
re-resolve each identity under the canonical Personal Keep guards
        ↓
build bounded inventory projection
        ↓
carry projection in a typed server-only MAIA request field
        ↓
FAST / CORE response-producing model invocation
        ↓
TRUE HANDOFF
        ↓
confirm exactly the receipts whose projection crossed
        ↓
STOP
```

J5-4 does not detect the live member request, call J5-3 from `/maia`, render a new member-facing surface, add navigation, implement continuation, or deepen sourced Keep content.

---

## 2. RED witness existed before implementation

The J5-4 falsifiers were present before the implementation seam.

Initial run:

```text
2 suites failed
7 structural tests failed
1 structural test passed
personalKeepsReadCognition.ts did not exist
```

The functional suite failed to load with:

```text
Cannot find module '../personalKeepsReadCognition'
```

The structural suite independently proved the service had no:

```text
trusted personalKeepsRead request input
FAST handoff helper
CORE handoff helper
CORE one-crossing regeneration guard
DEEP fail-closed guard
RCN exclusion
post-generation rewrite guard
```

This was a genuine RED state, not a retrospective test.

---

## 3. New governed cognition module

New module:

```text
lib/disclosure/personalKeepsReadCognition.ts
```

It begins only after J5-3 has returned receipt-backed object identities.

The module does not mint receipts and does not infer request authority.

### Input custody

```text
memberId
TurnPosture
authorized[]:
  keepRef
  disclosureId
  receiptId
```

No Keep projection is trusted from the client or from `meta`.

---

## 4. Projection is re-resolved after authority

For each authorized `keepRef`, J5-4 calls the canonical:

```text
resolvePersonalKeep({ memberId, keepId })
```

That means the object must still satisfy the J5-1 Personal Keep predicate at crossing time.

If any authorized object no longer resolves:

```text
result = projection_refused
failedKeepRef = exact failed identity
cognition = not invoked
receipts = remain attempted
```

There is no partial projection crossing after one object drops out.

---

## 5. Bounded truthful projection

The cognition projection contains only:

```text
id                 internal custody only
title
sourceType
status
keptAt
bodySnippet?       spontaneous Keeps only, max 140 chars
```

The `id` is retained inside the server projection so custody can remain object-exact, but the renderer never emits it into MAIA's prompt.

For sourced Keeps such as:

```text
idea
idea_block
capsule-backed or other source-native objects
```

J5-4 does **not** treat the atom body as source content.

Only `source_type === 'spontaneous'` may contribute an atom-body snippet, capped at 140 characters.

This preserves the J3 finding that sourced Keep detail requires a later source-native resolver rather than reconstruction from the continuity atom.

---

## 6. Deterministic cognition block

`renderPersonalKeepsReadBlock(...)` produces a response-scoped prompt block that states:

```text
PERSONAL KEEPS — MEMBER-INVOKED, RESPONSE-SCOPED
Use only this Personal Keeps projection for this response.
Do not infer missing source content or treat this as standing memory permission.
```

The block may include the inventory truth above.

It does not include:

```text
keepRef / atom id
disclosureId
receiptId
member id
request id
source locator beyond the admitted inventory type
sourced atom body presented as native content
```

---

## 7. Typed server-only MAIA input

`MaiaRequest` now has a top-level field:

```text
personalKeepsRead?: PersonalKeepsReadCognitionInput | null
```

It is deliberately not carried in `meta`.

The structural falsifier rejects any future form such as:

```text
meta.personalKeepsRead
(meta as any)?.personalKeepsRead
```

because `meta` is downstream of client request-body material on the live route.

Writer canonical participation and Personal Keeps participation are mutually exclusive:

```text
writerStudio && personalKeepsRead
    → refuse before cognition
```

No turn can combine two independently governed participation contracts.

---

## 8. One privacy posture per turn

The existing Writer posture law remains intact:

```text
const turnPosture = writerStudio?.posture ?? TurnPosture.resolve(meta)
```

J5-4 adds:

```text
const governedTurnPosture = personalKeepsRead?.posture ?? turnPosture
```

Because Writer and Personal Keeps participation are mutually exclusive:

```text
Writer turn        → governedTurnPosture is the exact Writer-carried posture
Personal Keeps turn→ governedTurnPosture is the exact Keeps-carried posture
ordinary turn      → governedTurnPosture is the ordinary resolved posture
```

The legacy `meta.sanctuary` field is synchronized from the trusted carried posture for governed lanes so downstream legacy checks cannot observe a conflicting privacy state.

---

## 9. FAST true handoff

FAST receives the bounded projection as a typed function argument.

Immediately before its response-producing model call it appends the deterministic Keep block to the FAST system prompt.

The handoff order is:

```text
invoke generateText(...)
        ↓
call / await personalKeepsRead.onHandoff()
        ↓
await generation result
```

The receipt is therefore not confirmed merely because `getMaiaResponse(...)` was entered.

Field safety, routing and other pre-model work can still refuse or divert before handoff, in which case the receipt remains `attempted`.

---

## 10. CORE true handoff

CORE uses the same governed ordering around its response-producing `generateText(...)` call.

The Personal Keeps projection is appended to the CORE prompt only after the tier has completed its ordinary prompt assembly.

Tier changes strategy; it does not alter which authorized Keep objects participate.

---

## 11. One receipt cannot authorize a second model crossing

CORE normally gives the Socratic validator a model regeneration callback.

On a Personal Keeps turn:

```text
personalKeepsRead ? undefined : async (repairPrompt) => ...
```

so validator repair cannot send the same Keep projection to a second model under the same disclosure receipts.

Likewise the post-generation AIN shape rewrite now requires:

```text
rewriteEnabled && !personalKeepsRead
```

A Keep-derived answer may still be assessed structurally, but it is not handed to another model for rewrite under the already-spent crossing authority.

---

## 12. RCN is excluded

RCN can normally answer before FAST / CORE / DEEP.

For Personal Keeps:

```text
RCN → PersonalKeepsReadTierUnsupported('RCN')
```

and ordinary tier routing continues.

This prevents an RCN-produced answer from being returned while the governed Keep projection never reached the response-producing model named by the receipt chain.

---

## 13. DEEP fails closed

DEEP does not currently expose a native generic prompt-participation seam equivalent to FAST / CORE.

J5-4 therefore does not fake parity by pushing Keeps through a convenient wrapper.

At the DEEP case:

```text
personalKeepsRead
    → throw PersonalKeepsReadTierUnsupported('DEEP')
```

No Keep block reaches DEEP cognition and no Keep receipt is confirmed.

A live-serving decision about whether an explicit Personal Keeps request should be constrained to FAST / CORE belongs to J5-5. J5-4 only proves the truthful tier boundary.

---

## 14. Confirmation custody

`performPersonalKeepsReadCognition(...)` creates the `onHandoff` callback that owns receipt confirmation.

Confirmation is idempotent within the in-memory crossing orchestration: repeated handoff calls reuse one confirmation promise rather than confirming twice.

For an N-object projection, the callback attempts exactly N disclosure confirmations using each object's `disclosureId`.

Outcomes:

```text
no handoff callback        → no_handoff
all confirmations succeed → crossed
one or more fail           → confirmation_failed + failed disclosure ids
```

A post-handoff confirmation failure cannot unmake the crossing; it is surfaced as an unresolved accountability condition rather than swallowed.

---

## 15. Live route remains unopened

The live route:

```text
app/api/sovereign/app/maia/list/route.ts
```

still imports neither:

```text
personalKeepsReadAuthority
personalKeepsReadCognition
```

Therefore J5-4 cannot be activated by a real member request yet.

This is deliberate. J5-5 owns the five-item serving integration and must decide how an explicit member request becomes a bounded governed turn.

No sacred `/maia` UI surface changed.

---

## 16. Writer ancestor regression and explicit falsifier amendment

J5-4 touches `maiaService.ts`, which is also the Writer canonical cognition boundary.

The existing Writer falsifier initially went RED for a structural reason: it assumed Writer was the only top-level lane allowed to carry a trusted `TurnPosture`, and it looked for the old persistence variable name literally.

The product behavior was not weakened.

The falsifier was amended explicitly to prove the stronger current law:

```text
Writer posture resolution remains unchanged
Personal Keeps may carry a second trusted posture
Writer + Personal Keeps cannot coexist in one turn
therefore governedTurnPosture === Writer posture on every Writer turn
persistence remains after the canonical crossing branch
```

Writer regression after the amendment:

```text
focusHandoff.test.ts
focusDisclosureSurface.test.ts
J5-4 cognition suites

4 suites passed
71 tests passed
0 failed
```

No Writer route, canonical turn, Focus renderer, or Writer handoff implementation was changed.

---

## 17. J5 proof evidence

J5-4 focused suites:

```text
personalKeepsReadCognition.test.ts
personalKeepsReadHandoff.test.ts

2 suites passed
16 tests passed
0 failed
```

Full J5 chain:

```text
personalKeepsReadIntent.test.ts
personalKeepsRead.test.ts
personalKeepsDisclosureVocabulary.test.ts
disclosurePolicyVersion.test.ts
personalKeepsReadAuthority.test.ts
personalKeepsReadCognition.test.ts
personalKeepsReadHandoff.test.ts

7 suites passed
106 tests passed
0 failed
```

Final combined J5 + Writer canonical gate:

```text
9 suites passed
161 tests passed
0 failed
```

Type-health final witness:

```text
program files : 4374
errors        : 229
baseline      : 239
regressions   : 0
PASS
```

Governance gates:

```text
check:no-supabase   PASS
check:no-openai     PASS — no new OpenAI surface
check:design-canon  PASS — no member-facing UI surfaces changed
```

---

## 18. Containment

J5-4 changes are bounded to:

```text
NEW  lib/disclosure/personalKeepsReadCognition.ts
NEW  lib/disclosure/__tests__/personalKeepsReadCognition.test.ts
MOD  lib/sovereign/maiaService.ts
NEW  lib/sovereign/__tests__/personalKeepsReadHandoff.test.ts
MOD  lib/writers-studio/__tests__/focusHandoff.test.ts
NEW  this witness record
```

J5-4 does not change:

```text
app/api/sovereign/app/maia/list/route.ts
any member-facing component
/maia visual design
/maia/keep-capture
Keep creation semantics
J5-3 receipt minting
context_disclosure_receipts schema
any migration
Personal Keep eligibility predicate
Press Keeps
Marked Moments
Reflection Capsules
capability registry
production database
```

---

## 19. Standing

```text
J5-0 invocation contract                 ✅ COMPLETE
J5-1 canonical Personal Keep selector   ✅ COMPLETE
J5-2 disclosure vocabulary              ✅ COMPLETE
PV-1 disclosure policy version v2       ✅ RATIFIED
J5-3 request authority + receipts       ✅ COMPLETE
J5-4 cognition projection + handoff     ✅ COMPLETE

J5-5 live five-item experience          ⛔ NOT OPENED
J5-6 continuation                       ⛔ NOT OPENED
```

**Next legitimate act:** J5-5 only — integrate the already-proven invocation, authority, projection and handoff seams into the live server request as the bounded five-item Personal Keeps experience, while preserving `/maia` itself and keeping navigation distinct from cognition authority.
