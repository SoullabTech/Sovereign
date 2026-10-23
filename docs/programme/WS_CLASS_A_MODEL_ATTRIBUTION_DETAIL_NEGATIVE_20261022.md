# Class A — model identity refusal detail privacy, negative evidence only

**DRAFT / EXPECT RED / NO MERGE / NO REAL AUTHOR OR MODEL.**

This is an intentionally-red source-level privacy review on **combined fictional source candidate #1942**, head `deea701b9528ddfe0f8827682f5256b3cb1ec852`, with all previously approved/proposed source bytes and historical byte pins UNCHANGED.

## Source-specific possible echo boundary
- `lib/manuscript/editorialRuntime/turn.ts` source blob `026ac3722bc185d0e8fddeeb613e3506489bbadf`, around line 459–464, constructs a `model_unattributable` refusal detail by interpolating `structured.result.provenance.model` and `reportedModel` when attribution fails.
- `app/api/writers-studio/editorial/turn/route.ts` source blob `e1ded9f67625f2740006058a732b026f0f753db9`, around lines 328–334 and 363, logs and returns `turn.detail` without imposing a content-free vocabulary.
- The provider-reported model identifier may be malformed/untrusted if the provider or adapter returns surprising metadata. Source evidence identifies a **possible error disclosure boundary, not a real vendor event, real manuscript incident, or known malicious SDK behavior**.

## Executable negative source test
The real Next.js HTTP POST handler is invoked after mocking internal verified identity, member-act persistence and editorial-runtime return. Two negative assertions demand that the invented `FICTIONAL_PRIVATE_WRITER_MODEL_METADATA_NEVER_ECHO_716` be present in NEITHER HTTP refusal body NOR server diagnostic log. On the unchanged route these are **expected to FAIL**. Two positive controls ensure `structured_refused` still reports a safe fixed reason and `sequence_discussion_first` remains a 409 with no erroneous server fault log. Existing A2 carry route tests are included.

**No actual provider call, SQL, member account, manuscript, Source, keys, costs, images, production or paid entitlement.** The test's fabricated `runEditorialTurn` return shape isolates this route crossing only; a separate source-exact runtime test must independently prove the provider metadata provenance path before accepting a fix. Do not confuse this with proof of real vendor malicious model strings.

## Independent Class A review requirements
- [ ] Exact source HEAD negative test results, preserving unchanged expectations.
- [ ] Design a fixed, content-free `model_unattributable` refusal; log only safe enum classification and no raw provider-reported/requested model strings. Keep honest model requested-vs-reported accounting on separate protected typed receipt.
- [ ] Preserve `structured_refused` fixed reason details, scope/sequence writer-facing count messages, and explicit disclosure delivery truth.
- [ ] Obtain independent Writer editorial privacy/governance review and Founder acceptance of any historically governed source/response contract changes.
- [ ] Confirm no stored success/proposal from model-identity disagreement; author consent, retention, reported-model receipt and genuine SDK behavior independently.
- [ ] Do not merge into current Writer R87/source, lift R20 / Source HTTP423, or enable live provider/beta accounts until release gate separately accepted.

Related [#1917](https://github.com/SoullabTech/Sovereign/issues/1917), [#1942](https://github.com/SoullabTech/Sovereign/pull/1942), [#1800](https://github.com/SoullabTech/Sovereign/issues/1800).


### Additional actual-runtime source-specific falsifier

A second completely fictional Jest suite `lib/manuscript/editorialRuntime/__tests__/modelAttributionRuntimePrivacyHold.test.ts` now runs the **real** `runEditorialTurn` method, with only its database, consent/disclosure, provider, canonical renderer, assembly and persistence dependencies injected. It returns a fake successful structured-provider result carrying an invented, mismatched `reportedModel` and expects the refusal detail NOT to echo that arbitrary text. The unchanged source is **expected RED** on that assertion; separate positive controls require truthful `model_unattributable`, no persisted MAIA turn, and unresolved model identity refusal. This closes the original review limitation that the route-only fixture mocked the entire editorial runtime.

The source modules, historic pins, route runtime, router, database and user data remain untouched. New exact-head CI must be inspected before claiming an outcome; this supplements, not replaces, the original two negative HTTP/log assertions.
