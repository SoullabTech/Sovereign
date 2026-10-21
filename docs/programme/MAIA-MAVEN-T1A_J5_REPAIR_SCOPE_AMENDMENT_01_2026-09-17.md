# MAIA-MAVEN-T1A — J5 REPAIR SCOPE AMENDMENT 01

**Status:** OPEN · same-defect seam admitted  
**Date:** 2026-09-17  
**Parent charter:** `MAIA-MAVEN-T1A_J5_REPAIR_CHARTER_2026-09-17.md`

## Discovery

During the R9 repair census, a second feature-flagged conversational Keep seam was found in
`lib/psyche/conversational-keep.ts` and its route consumers.

Its filing grammar classifies bare deictic commands such as `keep this` as high-confidence while
its persistence bridge has no referent resolver: the stored excerpt is the utterance itself.
That is the same NC-6 defect as the Reflection Capsule substitution — an unresolved `this` is
being treated as material.

The same seam also contains salience-triggered Keep offers. J4 permits candidate generation only
when the member explicitly asks MAIA to help identify possible material. A proactive salience
offer therefore cannot carry Keep-selection standing merely because a feature flag is enabled.

## Amendment

The repair surface is extended to the **smallest fail-closed change** in
`lib/psyche/conversational-keep.ts` and directly affected tests/comments:

1. unresolved deictic filing commands do not execute or confirm as a Keep;
2. salience-based candidate generation requires an explicit member request for candidate help;
3. current callers provide no such request, so proactive Keep offers remain withheld;
4. no referent resolver, candidate recommender, or new capability is built here.

The server route structure is otherwise unchanged. This amendment does not open any new product
capability and does not alter R11 T1-A scope.

## Corrected negative-control standing

NC-7's original source-attested PASS is superseded for this latent sidecar: **GAP/FAIL WHEN
ENABLED** until the fail-closed guard above is in place and tested.

J6 remains closed.
