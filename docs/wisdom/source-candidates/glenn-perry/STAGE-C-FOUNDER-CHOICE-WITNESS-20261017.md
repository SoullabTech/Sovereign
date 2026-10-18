# Glenn Perry × MAIA — Stage C founder-only preview witness

**Date:** 2026-10-17  
**Branch:** `research/glenn-perry-wisdom-candidate-20261017`  
**Exact source revision verified:** `2ad796c89230be32443f1e203779025cbacaaa49`  
**Disposition:** **FOUNDER PREVIEW CODE STAGED, BROWSER-TESTED, AND DISABLED.** No merge, deployment, real access, source admission, member feature rollout, or Glenn Perry contact.

## What was created

- `app/maia/perry-lens-preview/page.tsx`: unlinked, server-gated, dynamic web preview page. It requires **both** an exact server flag `MAIA_PERRY_FOUNDER_PREVIEW_ENABLED=1` and `requireFounder()` (verified server session + `FOUNDER_MEMBER_IDS` allowlist). Unset/off flag, no session, non-founder, unconfigured allowlist, or `CAPACITOR_BUILD=1` / `true` => not found. There is no browser-side founder override and no fallback to admin or practitioner status. Defaults to unavailable.
- `components/maia/knowledge/PerryLensFounderPreview.tsx`: an interactive, readable, desktop/mobile mockup of two **fictional** choices — ordinary MAIA, or an optional Perry-inspired symbolic perspective. The response examples are fixed original Soullab wording, **not MAIA-generated**. An ordinary/Sanctuary/unresolved privacy selector is explicitly labeled *simulated*: changing it changes no member or browser setting. It exercises the already staged pure client-posture helper in an invented source-choice gesture, never transmits a turn, and never reads a personal birth chart.
- `docs/wisdom/source-candidates/glenn-perry/stage-c-founder-preview-gates.test.mjs`: tests the **real** `requireFounder` allowlist algorithm (with fake sessions) and the actual preview page function, including disabled first, nonfounder, missing allowlist, and enabled allowlisted path.
- `docs/wisdom/source-candidates/glenn-perry/stage-c-founder-preview-webkit.test.mjs`: bundles the **actual** TSX component, original source-choice helper and existing current-client Sanctuary reader into a disposable local browser fixture with installed React. Uses genuine Playwright WebKit to exercise the UI.

## Evidence from executable tests

At the exact commit above, on the authorized Mac Studio:

| Verification | Outcome |
| --- | ---: |
| Earlier Stage B source, rights, and Sanctuary/corpus/Next.js 15.5.11 tests | 71 / 71 |
| Real founder-auth function + preview page gate tests | 11 / 11 |
| Real WebKit interactive preview tests | 6 / 6 |
| **Combined, same pinned source revision** | **88 / 88 passed** |

The WebKit tests confirmed: no auto-selection, a clearly labeled preview-only state, usual response without Perry material, explicit Perry selection and reversible withdrawal, simulated Sanctuary refusal, unresolved posture refusal, keyboard activation, desktop layout, 390px mobile layout without horizontal overflow, and **no external browser requests or page errors**.

A separate targeted **strict TypeScript `noEmit`** check passed on the UI component and its existing pure client-posture dependencies. Type-stripped `node --check` passed for the Perry source helper, client gate and active MAIA serving route. This is not a complete app or repository-wide typecheck.

### Negative controls: bypass candidates died

Two intentionally altered **disposable copies** of the server preview page were replayed against the same gate tests:
1. Treating the server flag as always allowed caused the default-off test to fail as expected.
2. Replacing `await requireFounder()` with an always-allowed result caused the unauthenticated-access test to fail as expected.

Neither mutation touched the GitHub branch or local source repository.

### iPhone export compatibility

The repository’s existing `scripts/capacitor-patch-routes.sh` was executed in a separate **disposable minimal tree** containing this exact new route. It excluded the `force-dynamic` founder preview from static native export; `revert` restored the file **byte-identically**. The route’s own guard also recognizes the actual `CAPACITOR_BUILD=1` environment encoding. No TestFlight/Capacitor production build was initiated.

## Deliberate authority boundaries

- No changes to `app/maia/page.tsx`, `components/OracleConversation.tsx`, MAIA main navigation, member settings, birth-chart calculation, `app/api/sovereign/app/maia/list/route.ts` from the new UI work, account schema, or production privacy controls.
- The only thing the founder preview can select is a **sample wording variant in local UI state**. It cannot send an authenticated MAIA request or activate the Perry source.
- Real source gate still declares `APPROVED_PERRY_EDITORIAL_SOURCE: ... = null`; no Perry text, original commentary, or embeddings admitted. Founder editorial approval and specific source/rights evidence remain independently required.
- The preview is not available to any founder today until it is separately enabled and served from an intentionally reviewed isolated web environment. Its code in a Git branch is not a running page.
- The current general conversation route still treats omitted Sanctuary as ordinary; this Stage C UI does not repair or authorize broad runtime change. No change to its existing constitutional boundary was made.
- This HTML/React test does **not** boot the full Next.js app with real middleware, cookies, session store, PostgreSQL, browser-to-live MAIA, or a provider. The founder page gate was invoked with a real founder-auth module and fictional session API. The interactive visual test served only the actual component using a local static fixture.

## Next bounded step

An **isolated founder-accessible web preview** could be enabled behind its server flag with an explicit local non-production test service, with provider/DB access disabled and test authentication verified. That requires separate authorization and a real login/browser witness. Nothing should appear in the ordinary MAIA House or to beta members before founder editorial review, rights/corpus admission, independent current Sanctuary trust, and member UX approval.

**Final: 88/88 tests PASS. Standalone founder preview staged. Feature flag OFF. No live capability claim.**
