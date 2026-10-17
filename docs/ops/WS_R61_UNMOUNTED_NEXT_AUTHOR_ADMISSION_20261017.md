# Writer's Studio R61 — Unmounted author-admission contract

**17 October 2026 | Mac Studio | Fictional fixture only | Production and five-person beta HOLD**

## Source custody

- Exact clean R60 base: `9540724171d06cec40b4cdbdc754539b828b817f`.
- Isolated worktree: `/Volumes/T7 Shield/ws-beta-r61-held-author-post-chatgpt-20261017`.
- Isolated branch: `fix/ws-beta-r61-held-author-post-chatgpt-20261017`.
- New handler: `lib/writersStudio/recovery/heldNextAuthorAdmissionR61.ts`.
- New refusals: `lib/writersStudio/recovery/__tests__/heldNextAuthorAdmissionR61.test.ts`.
- Scoped compilation: `tsconfig.r61-held-next-author-post.json`.

## Security finding and correction

The first local candidate placed a fictional-only R61 handler under `app/api/writers-studio/held-author-admission/`. Even with real-member access compiled OFF and every response returning HTTP 423, the inherited R56 source-law test rightly refused a direct import of held session/Work authority from any live Next route.

**That rejected candidate was not committed or deployed.** The handler and its tests were relocated to the unmounted `lib/writersStudio/recovery/` layer; the new live route files were deleted from the isolated worktree. R56's original no-route-import assertion remains unchanged. No import hiding, alternate mount, allowance waiver, production flag, or shipped route was added.

## Held-only contract

The handler accepts a NextRequest-shaped synthetic HTTP POST ONLY during explicit nonproduction fictional opt-in, requiring a local `fict` PostgreSQL URL, exact R56 fixture configuration, a marked disposable vault root, and a compiled-FALSE member-action constant. In all other environments, it refuses immediately without reading request content or consulting session/SQL.

In the fictional fixture, only the `review` intent and a strict, small `{kind, manuscriptId, selectedLivingWorkId}` envelope are accepted. Payload length is capped by both declared length and a streaming byte budget. Replacement prose, browser-asserted member identity, Apply/Undo intent, arbitrary fields or malformed identity are refused. R56 verifies the actual-session/consent/exact-manuscript/declared-Living-Work relationship, and the handler asks R56 to revalidate before returning even the fictional marker.

**ALL responses, including successful fictional double-check, are HTTP 423 with no-store headers, no account/Work identifiers, and explicit canSave/canApply/canUndo/writerAuthorized/releaseApproved=false.** No proposal text, operational keys, grants, SQL writes, external calls or legacy writer fallback are provided. A structural R56 witness cannot be used as a signed writer authority.

## Test qualification

- Initial nine focused R61 tests passed, as did strict scoped TypeScript, but the broader R56 no-route-import test REFUSED the first layout. The failed attempt is retained as a safety finding, not a qualified result.
- After removing the live API mount: R56+R61 focused **2/2 suites, 25/25 tests PASS** and strict scoped TypeScript PASS.
- Corrected combined regression: **97/97 selected suites, 1034/1034 tests PASS**. The previous R60 accepted population (96 suites) is preserved and R61 adds one nine-test suite.
- These R61 tests mock the R56 admission boundary. They DO NOT replace R56's independently accepted fictional PostgreSQL tests or demonstrate a genuine authenticated Next.js browser POST.
- Full unmodified `tsconfig.ship.json` TypeScript returned exit **2**, **184 diagnostics**, versus R60's **184**. The ordered diagnostic records were identical (zero added or changed). This is **not a passing shipping build**. Evidence: `/Volumes/T7 Shield/ws-beta-r61-held-author-post-evidence-20261017/R61_FULL_SHIP_TSC.log`.

## Continuing release stop

R61 is a review-only, **UNMOUNTED** server interface, not the desired genuine browser-to-encrypted-author-write path. It must not be promoted until independent operational Work/Proposal KMS, real current consent, durable author-choice fence, revocation/deletion, safe legacy plaintext migration, clean shipping build, authenticated Next.js/browser-to-Apply-and-separately-authorized-Undo proof, cold/offsite restore, real Mac and physical iPhone Safari, independent security review and founder exact-image GO are all established.

No real member data, provider model call, paid KMS, production DB, PR, push, deployment, invitation or beta admission occurred.
