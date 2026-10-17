# Glenn Perry × MAIA — Stage B privacy-posture correction witness

**Date:** 2026-10-17  
**Repository:** `SoullabTech/Sovereign`  
**Isolated branch:** `research/glenn-perry-wisdom-candidate-20261017`  
**Exact tested source commit:** `c6ae7761224b5cbde1fff773131e2efadfe8be95`  
**Disposition:** Source-lens posture validation **PASS**. This is **not server-owned current-mode attestation**; release remains **BLOCKED**.

## Important source-of-authority finding

MAIA's current Sanctuary choice is a **per-turn client gesture**, not a standing account default or a trusted server-held session record. Source evidence:
- `lib/sanctuary/currentClientPosture.ts` reads the live `localStorage["maia_settings"].sanctuary` boolean at the moment of a member act; missing or malformed means *unresolved*.
- `lib/sanctuary/turnPosture.ts` resolves `TurnPosture` at the serving boundary, but marks `source: 'request-meta'` and resolves missing signals as ordinary; its class proves that downstream code received a resolved object, not that a trusted server independently knew the user's current privacy choice.
- `docs/programme/SANCTUARY-MANUSCRIPT-KEEP-01_S1_LIVE_POSTURE_CARRIAGE_2026-09-22.md` explicitly says the account's default or any session row must NOT substitute for current posture. The specific Press Keep repair requires an explicit boolean and refuses a missing/malformed value.
- The current MAIA serving route `app/api/sovereign/app/maia/list/route.ts` derives `isSanctuary` from `(meta as any)?.sanctuary === true`. This is an existing general-route assumption, **not repaired globally by this Perry lane**.

This matters because a helper that merely checks `isSanctuary === false` could silently accept a request with **no privacy posture at all**. Neither a forged client boolean nor a source-specific feature flag can establish stronger consent.

## Bounded Stage B change

Only the new optional Perry lens was tightened:

- `lib/maia/knowledge/perrySourceLens.ts`: imports the real `TurnPosture` class; requires an actual `TurnPosture` instance with `sanctuary:false` **and** an explicitly supplied current-turn request boolean `sanctuary:false`. Missing, `null`, strings such as `"false"`, `true`, nested contradiction, malformed nested `meta`, mismatched route posture, or a plain imitation posture all **deny the source lens before authority lookup or file read**. It still requires verified member, explicit per-turn source selection, no same-turn opt-out, feature flag, founder record, exact corpus admission/path/SHA and safe source frontmatter.
- `app/api/sovereign/app/maia/list/route.ts`: provides the **already existing** request-boundary `turnPosture` and the raw request `meta` to the Perry-only helper. Its general Sanctuary resolution and all other route behavior remain unchanged.
- The relevant fictional tests now load the real `TurnPosture` class; the Next.js 15.5.11 handler tests pass the actual server-created request posture. The physical fictional corpus tests verify the new check denies **before** even requesting authorized source keys.

**There is no new persistence, schema, token, status flag, or authority signal.** The optional lens is still unapproved, unadmitted and operationally default-off (`APPROVED_PERRY_EDITORIAL_SOURCE === null`). No change to `lib/sanctuary/turnPosture.ts`, Quick Settings, model prompts, database or protected branches.

## Tests and exact witness

Mac Studio, Node 22, genuine offline Next.js `15.5.11` package for request classes. All route dependencies (DB, sessions, chart/memory services and model) were mocked or blocked; provider dispatch was intercepted before any outbound call.

At `c6ae7761224b5cbde1fff773131e2efadfe8be95`:
- 9/9 original source and rights-custody tests
- 5/5 corpus admission/global retrieval exclusion tests
- 12/12 existing 12-domain knowledge-field rehearsals
- 14/14 direct Perry helper and local HTTP fixture tests
- 11/11 physical fictional corpus authority/SHA/approval tests
- 8/8 real Next.js 15.5.11 serving-handler tests using fictional request data and an intercepted inference seam

**Total: 59/59 passed; 0 failed.** Type-strip syntax and `node --check` passed for the changed source route and helper. A preliminary 58/59 run exposed an over-strict test assertion that expected `undefined` when the existing route passes `null`; that test assertion was corrected and the complete 59-test suite rerun successfully, with no relaxation of source-permission or Sanctuary law.

### Positive scenario (fictional)

A member with a simulated verified session explicitly chooses the Perry lens, and the current-turn body carries the explicit boolean `sanctuary:false`; the server constructs the real `TurnPosture` from that request. The extra privacy gate then permits the separate **source-authority** checks. The real Perry source still does **not** activate, because there is no founder source approval.

### Negative scenarios

All of these deny **before source lookup**:
1. Sanctuary `true`
2. Sanctuary missing
3. `sanctuary:"false"` (string), `null`, malformed shape
4. Top-level `false` contradicted by nested `meta.sanctuary:true` or `"false"`
5. Fake `{sanctuary:false}` object rather than the actual `TurnPosture`
6. A real `TurnPosture` resolving Sanctuary `true` while some other field says false
7. User withdrawal of astrology in the very same turn
8. Guest or forged member ID
9. Missing independent content approval, invalid hash, unlicensed source, or unsatisfied copyright custody

## Known unclosed boundary (routed out — do not overclaim)

The route-wide conversion `isSanctuary = (meta as any)?.sanctuary === true` still defaults an omitted or malformed privacy field to ordinary. Other legacy route behavior may therefore read or write content under an unresolved posture. This is an **existing cross-feature privacy-risk pattern**, not introduced by the Perry change and **not certified as solved by these 59 tests**.

A future, separately reviewed constitutional privacy act should establish an explicit member current-turn posture at every serving entry point, preserving the member's right to change it mid-session and refusing unresolved/contradictory declarations before any memory reads or persistence. A stale account default, per-session value, or post-facto flag is insufficient. Route-wide change needs its own regression and product-compatibility evidence.

## Other outstanding gates

- The source candidate `soullab-original-teaching-candidate.md` remains `status:review` and `safe_for_retrieval:false`. No founder editorial ratification or rights authority has been created.
- Perry's book and author-essay bodies are still excluded from embeddings or full-text MAIA retrieval without a compatible license. Kelly will contact Perry personally; no message was sent.
- No complete Next.js app boot, production request middleware, real PostgreSQL credential checks, browser acceptance, or model quality evaluation has been performed as part of this act.
- No deployment, merge, protected-branch update, live member record, source admission, paid model or production secret was accessed.

**Result: Perry-specific fail-closed posture carriage VERIFIED. General MAIA Sanctuary authority and all release gates remain UNRESOLVED.**
