# Stage H — Gather Together, placed under Wisdom Keepers (founder-only preview)

**Date:** 2026-10-18  
**Repository:** `SoullabTech/Sovereign`  
**Isolated review branch:** `research/glenn-perry-wisdom-candidate-20261017`  
**Exact source revision with verified tests:** `e42ba54421df70ac7cd5242c39556c3a14f05767`  
**Standing:** **170/170 isolated tests PASS; the route is DEFAULT-OFF, UNLINKED and UNDEPLOYED.** This is not a live Circle, provider, member interface, keeper partnership or opening of community access.

## Placement decision now embodied in a real UI component

Founder selected the best existing platform home for a future communal Wisdom Keepers offering: **Home → Wisdom Keepers → Gather Together**. The source routes already support this orientation:

- `lib/house/catalog.ts` points the Home Wisdom place to `/wisdom-keepers/wisdom?from=house`, and MAIA also has a Wisdom Keepers doorway.
- `app/wisdom-keepers/wisdom/page.tsx` is the **actual** canonical Wisdom interface for orientations, source pathways and MAIA conversation. **It is not modified.**
- `app/commons/circles/[circleId]/page.tsx` with `lib/circles/*` is the intended future private-group container. Today `app/commons/circles/layout.tsx` requires a founder and `lib/circles/circleAccess.ts` gates the API to authenticated founder allowlist. **No bypass or roster grant was created.**
- `app/studio/groups/*` and meeting adapters are *operator* resources for human scheduling, not the member-facing threshold.
- `/fields/[field]/with-others` can become the separately consenting wisdom keeper's own home, but its group features are still documented “coming soon.”
- The existing Soullab hybrid/video substrate is the **first candidate** for a later real media bridge, conditional on independent consent, group admission and multi-person audio/video acceptance. No external video provider was selected.
- Glenn Perry remains an **unaffiliated reference**. Neither original copyrighted books nor member information became prompt/retrieval material.

## Files created — no existing member UI route was edited

1. `lib/wisdom/wisdomGatherPreview.ts` — four **static fictional waypoints**, source → member-authored intention → private Circle → human meeting; each declares the current state and its consent/rights boundaries. Provisional founder-facilitated first Circle, `Where Symbols Meet Life`, is **not scheduled**, its recording/AI-note policies unverified, its video venue undecided.
2. `components/wisdom/WisdomGatherFounderPreview.tsx` — warm, Wisdom-room-compatible dark/amber responsive UI. Interactive stage selection is *local React state only*. The page contains **no form, member signup, interest tracking, Circle mutation, video join, private data read, model calls, automatic source fetching or paid referral flow**. Two directly user-initiated outbound links to Glenn Perry's verified author website and the Academy have `noopener noreferrer` protections and no chat/member query strings. The page continuously identifies itself as founder-only, fictional and unavailable for real use.
3. `app/wisdom-keepers/wisdom/gather-preview/page.tsx` — actual nested Wisdom route. **Server-only flag** `MAIA_WISDOM_GATHER_PREVIEW_ENABLED === '1'` AND actual `requireFounder()` allowlist/session check are required. Disabled or unauthenticated requests receive `notFound()`. `CAPACITOR_BUILD=1` and `true` explicitly refuse. `runtime='nodejs'`, `dynamic='force-dynamic'`, `revalidate=0`. There is **no link from the ordinary Wisdom page**, so a member does not see an inert or misleading entry.
4. `stage-h-gather-placement-gates.test.mjs` — 11 tests of exact source and server gate with the real `requireFounder` logic and fictional session store: default off, malformed flags, both native build encodings, no session, forged admin/practitioner/founder client labels, empty allowlist, exact founder path, unchanged Wisdom page, unchanged Circle founder-only APIs, no live service calls, and native-patcher compatibility.
5. `stage-h-gather-placement-webkit.test.mjs` — five real WebKit interaction tests on the actual staged React component in a **disposable local test fixture**: responsive desktop/mobile display, four reversible stages, honest current unavailability at each step, unreleased first pilot, official author/Academy links, natural keyboard navigation, no external network requests or browser errors.

## Verification and defense-in-depth

On the authorized Mac Studio, source files were downloaded from the exact pin into a disposable directory. The same complete Stage A–H source/permission/Sanctuary/Next.js 15.5.11 request helper/keeper hosting/online-hybrid/WebKit suite passed:

- **170/170 tests passed; 0 failed; 0 skipped**, exact source revision `e42ba54421df70ac7cd5242c39556c3a14f05767`.
- The Stage H sub-suite itself passed **16/16** tests: 11 actual gate + 5 WebKit.
- Strict TypeScript `noEmit` passed for the new component and fixture data module with the established Soullab alias configuration.
- The existing `scripts/capacitor-patch-routes.sh` executed in a disposable minimal source tree, **excluded** the dynamic founder-only preview page from the native export, and `revert` restored the file **byte-identically**.
- Two intentional **disposable-only** changes were detected and rejected by the real gate fixture: bypassing `MAIA_WISDOM_GATHER_PREVIEW_ENABLED` caused the “default off” test to fail; bypassing `await requireFounder()` caused the “no authenticated session” test to fail. Source was restored inside the disposable fixture. Neither mutation was applied to the GitHub branch or the existing Mac Studio checkout.

## What these tests do NOT establish

- This is **not** a real running Next.js site, deployed founder preview, live browser login using app cookies, real middleware test, end-to-end authenticated member Circle acceptance or a deployed group-video room. The gate checks execute the actual page function with the actual founder auth algorithm and **fake session provider**, while WebKit runs the actual component with local fixtures.
- The broader Sanctuary source-of-truth issue on the existing MAIA conversation path remains separately unresolved. The optional Perry source gate continues to be unapproved and off; no Wisdom Keeper source text permission changes.
- An actual P2P/LiveKit/third-party room for 6–8 people has not passed real audio/video, privacy/recording, guest-denial, mobile or hybrid parity testing.
- Glenn Perry has not consented to participate. No keeper identity, books or original essays were licensed or embedded; no contact or event invitation was sent.
- The Circle UI/API remain founder-only. Do not add test members to `FOUNDER_MEMBER_IDS`; that opens unrelated founder-private tools. A future pilot cohort must have its own scoped authority and independent ownership tests.
- The research branch may diverge from canonical; no merge or protected branch mutation was done as part of Stage H.

## Next founder/engineering decision

**Code placement is ready for a personal review**, but actual access is not enabled. If the founder wants to see the preview on the authorized Mac Studio, next explicitly authorize a bounded, isolated, non-production web service with fictional credentials and a server-side flag, and separately test sign-in and server middleware against that exact build. Do not turn on the feature in the production website.

After that presentation review, a separate, tightly scoped engineering lane can build **cohort Circle admission and an actual Soullab multi-person meeting bridge**, proving privacy and revocation in a disposable environment before any members, real wisdom keepers or online events are invited.

**Disposition: Stage H founder UI/source placement passed in isolation. Live access and public product gates CLOSED.**
