# Glenn Perry × MAIA — Next.js 15 serving-handler verification

**Date:** 2026-10-17  
**Authority:** Founder previously approved Stage B isolated code integration, not production source admission, release, deployment, or contacting Glenn Perry.  
**Repository branch:** `research/glenn-perry-wisdom-candidate-20261017`  
**Exact source commit verified:** `3e2828b602136385d1f874eec0181caadd8171cd`  
**Standing:** ISOLATED SERVING-HANDLER REQUEST TESTS PASSED; LIVE RELEASE GATE REMAINS CLOSED.

## Why this additional test was necessary

Previous Stage B checks verified the Perry source-lens helper and a deliberately small loopback-HTTP fixture, but the live MAIA route itself was only reviewed statically. The serving route is `app/api/sovereign/app/maia/list/route.ts`; `/api/oracle/conversation` is retired (410) and the sibling `/api/sovereign/app/maia` is dormant.

This witness now executes the **actual serving route POST implementation** under genuine `NextRequest` and `NextResponse` classes from **Next.js 15.5.11**, as declared by this source's package manifest. This is stronger than the earlier helper-only rehearsal, while remaining narrower than booting a complete Next.js server.

## Isolation and dependencies

- Genuine Next.js 15.5.11 package was loaded from the Mac Studio's existing local npm cache using an explicitly offline tarball reference. No registry request was made to install the framework.
- The exact source route was fetched from the pinned commit into a disposable `/tmp/perry-stageb-combined.*` directory.
- Node 22 + the locally available TypeScript compiler transpiled the actual route and the actual `lib/maia/knowledge/perrySourceLens.ts` helper into temporary CommonJS modules.
- All external route dependencies were intercepted by **fictional, side-effect-free stubs**: session identity, database, memory, clinical/astrology context, source retrieval, canonical shadow, and provider/model services. No real member or clinical record was opened.
- The model-generation dependency was replaced with a stub that captures its input and throws an intentional `FIXTURE_STOP_AT_INFERENCE_SEAM`. This proves the serving handler reached the final model handoff but does **not** run a model.
- Global `fetch` was blocked during each request; the test process carried no `DATABASE_URL`. The actual Perry helper's approval constant remained `null` and its simulated global-library authority stub refused any attempted source read.
- All scratch directories were removed on command exit. No standing project worktree or dependency installation was modified.

## Direct serving-handler request results

Seven tests passed under genuine Next.js 15.5.11 request/response classes:

1. Verified fictional member + explicit Perry selection reaches the actual helper and then the intercepted provider call with **no Perry corpus addendum**.
2. Guest body supplying a fabricated member ID stays unverified; the helper sees `verifiedMemberId:null`, not the body claim.
3. Sanctuary request propagates `isSanctuary:true` to the lens guard and returns no source content.
4. The member's same-turn “I don't want astrology” message is passed as the refusal veto, overriding the selected lens.
5. Normal conversation without a lens choice cannot select Perry material.
6. Operational feature flag off still prevents source selection.
7. Forged client `perrySourceLensAddendum` or `governedKnowledgeAddendum` and a forged body `userId` do not become server-authored source or member authority in the intercepted final request.

These checks used the **real Perry helper**, not merely a mock of the helper. The helper's dependencies and all unrelated MAIA services remained mocked. The real inference service was not called.

## Combined isolated verification

The final run at source commit `3e2828b602136385d1f874eec0181caadd8171cd` ran **56/56 tests, zero failures**:

| Suite | Passed |
| --- | ---: |
| Source and original-commentary contract | 9 |
| Actual corpus admission and global-library rejection preflight | 5 |
| Existing twelve-domain knowledge-field rehearsal | 12 |
| Source-lens guard + fictional loopback request fixture | 13 |
| Physical fictional corpus source and founder-record tests | 10 |
| Genuine Next.js 15.5.11 request objects executing MAIA's serving route through the intercepted final inference seam | 7 |
| **Total** | **56** |

Type-stripped `node --check` passed for both changed TS files. This is syntax verification, **not** a TypeScript project typecheck.

## Remaining gates — not established by these tests

- Not a complete Next.js dev/prod app boot, installed-dependency production build, WebKit browser journey, real server middleware execution, or PostgreSQL integration run.
- The verified member was supplied by a fictional session resolver. This does not re-certify the deployed auth-session store or CORS/CSRF enforcement.
- The serving route currently derives `isSanctuary` from client metadata; **do not activate source-lens retrieval** until trustworthy server-side Sanctuary posture is established or this risk is separately adjudicated and secured.
- These tests do not demonstrate provider behavior, psychological conversational quality, source citation UI, chart factual correctness, third-party rights, founder editorial approval, or safe production operations.
- Full Glenn Perry book/essay bodies remain outside source retrieval and model training; Kelly will contact him personally. No email was sent.
- Original Soullab commentary is still `status: review`, `safe_for_retrieval:false`, and not individually corpus-admitted. A founder-reviewed exact revision/rights record is required before any future promotion.

## Status and next step

**Code route integrated, default-off. Combined 56/56 isolated checks PASS. Release gate CLOSED.**

The next worthwhile act is to (a) obtain founder scholarly/editorial review of the original Soullab teaching candidate and (b) design and test a trustworthy server-owned opt-in/Sanctuary gate in a separate bounded isolated fixture before offering any source retrieval. Full application/beta activation is a later, separate decision. No protected branch changes or deployment are requested by this witness.
