# AIN Capability Foundry — Member Home Reading Room Candidate

**Date:** 2026-10-12 (New York)
**Exact parent source:** ed890e427c9c8110f48ad95599f8ddddc0896219
**Previously founder-accepted research catalogue:** 45ac2a182a7687062704e28f0dc0e3d5e0c5ce4d
**Source catalogue SHA-256:** 9037d3f9695a72cfa70b01a9eb8eba58027f8f2134e3458e6e6dd32a02e6f54b
**Standing:** MEMBER-FACING IMPLEMENTATION CANDIDATE · ISOLATED / NOT INSTALLED · INDEPENDENT REVIEW PENDING
**Authority:** No merge, production deployment, model/skill installation or provider spend. No MAIA, research experiment, member-content or JARVIS Work Unit change.

## 1. The user-directed product difference

The member should be able to **review The Foundry from their existing /home** rather than being asked to access a founder's private JARVIS/Kelly's World workspace.

The existing /home route has two deliberately separate user states:
- signed out: HomeThreshold, preserved unchanged;
- signed in: existing HouseExperience current=home.

This candidate adds a research invitation **only when current=home**, immediately after the main House spaces, without converting the Foundry into a paid feature, House preference, active facet, or MAIA dialogue. The invitation points to **/home/foundry**.

The dedicated reading room requires the established server-side requireMemberId session check. Missing/invalid session receives a Next.js redirect to /signin?next=%2Fhome%2Ffoundry. In a local Next dev test, streamed HTML initially reported HTTP 200 while carrying the NEXT_REDIRECT(...307...) instruction, as Next sometimes streams before redirect. The browser correctly navigated to /signin; the signed-out response **contained no source titles or source cards**. Signed-out /home still showed the original House threshold.

**No authenticated real-member session was used to test this.** The visual and interaction test was run through a temporary, loopback-only public-data visualization route, deleted before staging or commit. It does not bypass the real /home/foundry authentication gate.

## 2. Public source data boundary

Member information is compiled from a **separate sanitized snapshot**:
lib/foundry/memberResearchSnapshot.json

A read-only source comparison confirms every one of the 26 entries agrees with the exact accepted Foundry source record. The member bundle includes only: research ID, source title, source area, proposed usefulness, critical caution, potential product/research lanes, public HTTPS URL, source-review standing and explicit RESEARCH_ONLY_NOT_ENABLED status.

It deliberately excludes private local paths, canonical founder decision JSON, executable tools, model routing, permission grants, review prompt logs, member/manuscript/clinical data, Work Unit identity or operational monitoring.

Source standing is honest:
- **23** candidates: initial public documentation surveyed; this does not certify an exact upstream source revision or license.
- **3** candidates: source link nominated, independent upstream review still pending.
- **0** candidates licensed or installed through this catalogue.
- Every source opens only by member action in a new tab with noopener noreferrer.
- Every entry says its suitability/license/safety remain to be checked.

No third-party library code or models are imported, run, downloaded or installed by this member page.

## 3. Member experience

- From authenticated /home, members see one approachable invitation: **"See what we're exploring"**.
- /home/foundry opens with the purpose of the research, why it matters, and how research differs from a promised product.
- Four optional directions connect the research to Writer's Studio, Pro Studio, Astrology Pro and sovereign MAIA/AIN infrastructure without asserting that a feature exists.
- Source browser: 26 cards, text search, filters by research area and possible Soullab use, explanatory safety details, source links.
- Clear boundary: neither the reading room nor research sources can automatically access writing, clinical data, MAIA conversations or operational permissions.
- The member view has no internal five-room JARVIS controls, no "Needs Kelly", no operational graphs, founder decision metadata, runtime model-switch menus or authorization buttons.

This is *a member research library*, not the standalone founder-operations dashboard, and not a new MAIA voice.

## 4. Security and access

- /home's original signed-in/signed-out split is unchanged.
- /home/foundry requires requireMemberId on the server on every request. No use of a raw x-member-id header or client-only fake gate.
- An unauthenticated route request rendered no research content. Browser sign-in redirect passed without any external network request.
- The initial member snapshot is static and checked against the exact source SHA, so no member database or founder-private path needs to be queried to show public candidate metadata.
- All member-explorer filters run locally in the browser; no fetch, model request, analytics hook or tool action is wired.
- Existing House places/personal preferences are untouched; no active new feature grant.
- Production installation and release remain separately held.

## 5. Builder evidence

**12/12 dedicated member-home/source/permission checks PASS**, including exact source comparison, nine-field public whitelist, no leaks of internal founder/file metadata, HTTPS URL allowlist, default /home route custody, signed-in route authentication and redirect, honest product/scientific claims, and no new execution control.

**3/3 existing /home route-contract Jest tests PASS.**

**Focused TypeScript check PASS**, using the project's core TS configuration extended only to the new page and its imported dependencies.

**Local Next.js development compilation PASS**, without modifying production or deploying the app. Pre-existing warnings in the local dependency stack: Next.js/SWC version mismatch and unknown experimental config flag. Next generated a local next-env.d.ts diff, which was verified as machine-generated and restored after testing.

**Signed-out browser witness PASS:** no research cards or source names in the unauthenticated response, navigation to the sign-in page with /home/foundry continuation, and unchanged signed-out /home threshold.

**Desktop (1440px) and mobile (390px) browser interaction PASS:** a disposable loopback-only visual-probe route rendered the *same committed member source snapshot, actual FoundryMemberExplorer React component and actual member CSS*. Both tests displayed 26 cards and confirmed:
- search "Inspect AI" reduces to one result;
- area filter works; clear filters returns 26;
- "Agent Skills" safety details expand;
- 26 public links are explicit click-only actions;
- zero automatic external requests and zero page errors.

Screenshots:
~/JARVIS-handoffs/AIN_FOUNDRY_MEMBER_HOME_VERIFIED_DESKTOP_2026-10-12.png
~/JARVIS-handoffs/AIN_FOUNDRY_MEMBER_HOME_VERIFIED_MOBILE_2026-10-12.png

The disposable unprotected visual-probe page was **deleted after visual testing** and was never part of the intended committed member route.

**82/82 qualified suite PASS**, combining 70 inherited Founder Workspace checks and 12 new member-home tests. Two previously demonstrated baseline failures remain explicitly excluded/open:
- B3 workstation census ETIMEDOUT;
- B5R3-L1 visibility assertion.
Do NOT present 82/82 as unconditional full legacy acceptance. The original Founder Workspace suite was 70/72 including these historical failures. The isolated candidate does not fix them.

**ESLint static lint check NOT AVAILABLE** due to pre-existing local package mismatch: repository eslint.config.mjs imports eslint/config unavailable from the linked ESLint 8.57.1 package. This is an environment/tool-chain validation gap, not a declaration of lint PASS. TypeScript and relevant Jest/Node/Chrome checks did pass.

All tests are builder-run, not independent model or human acceptance. No real authenticated member was used and no production environment or external source installation was tested.

## 6. Separate next gate

1. Commit exactly the intended member-facing source/data/tests in an isolated feature branch with the existing normal sovereignty/PHI/design-canon hooks.
2. Independent read-only source review of that exact commit: confirm authentication, public-data allowlist, disclosure honesty, Next.js route semantics, styling/accessibility, and preservation of the old /home and House behavior.
3. Reproduce a genuine authorized-member read-only session in isolated staging, with explicit privacy-safe permission, before any deployment claim.
4. Obtain explicit Founder adjudication of the **member-visible /home release**. Catalogue research acceptance is not automatic authorization to change live member Home.
5. Only then consider a separately governed merge/build/deployment. Never auto-activate external GitHub/HF skills, MAIA model changes or RGR experiments.

The existing founder-accepted Foundry catalogue and offline prototype branches are preserved and remain clean; the new member candidate does not change MAIA, production, JARVIS Work Units or user manuscripts.


## 7. Release ancestry boundary — avoid an omnibus merge

This member-facing candidate is developed as a child of the independently reviewed offline Foundry preview at ed890e427c9c8110f48ad95599f8ddddc0896219. Its parent chain contains the earlier RGR custody/preview and internal Foundry research prototypes, which are **not** automatically authorized for the public Soullab service.

Any future publication must therefore **not merge this entire feature branch into a live deployment by ancestry**. A later separately authorized release candidate must select exactly the approved member-facing change set, reconcile it against the then-current verified production source, rerun Home/auth, design-canon, privacy, beta, and regression tests, and obtain independent review of that exact reconciled release commit.

No member receives access merely because this candidate builds locally or passes an isolated test. The live /home production behavior remains unchanged until the separate release gate.


## October 13 production-baseline reconciliation — release canary, still HELD

- **Actual serving provenance, observed read-only:** public https://soullab.life/api/version returns GIT_COMMIT prefix c9e4f7f7 and build time 2026-10-02T17:38:40Z. The Minisforum Tailscale host's production container maia-sovereign reports GIT_COMMIT=c9e4f7f7e and immutable image sha256:d6bc2e06c01534b5e7792feae3f6d38cedf59f68f34fa60a0d358f27eb574c48. The source prefix resolves in local Git to c9e4f7f7eccb4049bf036d189cac7feb007ef3cc. All observations were read-only.
- **Isolated target branch:** feature/ain-foundry-member-prod-canary-20261013. It was created at that verified production Git commit, never from the unrelated dirty development checkout.
- **Exact transfer scope:** Only the ten changed paths of original isolated member candidate aeb607f8773ac1a5ce7970427736ca9851b7a0f9 were applied with git diff --binary and git apply --3way. No earlier RGR or internal Foundry research commits were merged.
- **Compatibility difference:** The deployed source baseline predates the internal Foundry research catalogue. Accordingly, the member-facing JSON snapshot retains its exact immutable SHA256 90a8a6e31fbbdde63000da8091875a16bfe71b3b5e16f64cc9817d14fbb42197, but the LOCAL read-only verifier inside the ten-file scope now verifies that fixed digest and the complete public nine-field/URL/permission schema *without requiring the private research catalogue on disk*. The source derivation was originally checked against accepted research commit 45ac2a182a7687062704e28f0dc0e3d5e0c5ce4d; test-only source comparison reads that exact Git object, never a production private file.
- **Privacy-safe synthetic session witness:** A temporary Node vm/TypeScript-transpiled copy of the ACTUAL member page module was given only explicitly mocked modules. With a synthetic member ID, the server component rendered 26 synthetic entries and no private record. With AUTH_REQUIRED, the same component threw the expected sign-in redirect. The fixture did not invoke the database or use a genuine authenticated member. It is not equivalent to an installed/staged Next+DB session witness.
- **Existing Home route Jest:** 3/3 PASS on production-based worktree. **Foundry source/auth/permission tests:** 13/13 PASS on the reconciled worktree. **Focused TS:** PASS. **Design-canon:** PASS, three declared experience contracts. These are local builder checks, not independent release approval.
- **DO NOT PUBLISH YET:** Await new exact-commit independent read-only review, dependency/environment compatibility, a genuine isolated authorized-member session witness or founder-approved privacy-safe equivalent, explicit Founder release adjudication, and separately governed merge/build/canary/deployment. The current worktree is NOT installed.
- **No member content, MAIA model state, Work Unit, production data or installed web application has been mutated.**
