# Writer's Studio Materials and Sanctuary — local browser evidence

**Date:** 2026-10-08. **Environment:** Mac Studio; isolated candidate checkout `fix/materials-beta-server-gate-20261008`, HEAD `da988af9e`; Next development server bound only to `127.0.0.1:3117`; database `maia_consciousness_test`. **Never production evidence.** No production migration, merge, push, or cutover.

## Test identity and Work

A **new, disposable** local member `qa_sanctuary_local_beta_20261008` and associated `ops_contacts` row (`beta_tester`, `active`) were inserted only into the local test database. No actual member identity, password, email delivery, or production data was reused. The account has a deliberately unusable password hash. The local dev-login endpoint was accessed on loopback only and never surfaced a session token in logs. This was suitable for exercising the existing server-side Studio beta gate, **not equivalent to testing normal member sign-in**.

A disposable empty Work, `Local QA Sanctuary Materials Work`, was created through Studio's `Begin a new Work` interface, then opened in Develop. Keep this fixture until completion of the remaining QA or explicitly clean it up with its associated sessions, materials, contacts and Work. Do not repurpose it as a real member account.

## Results actually witnessed

- Development login: final authenticated browser route `/writers-studio`, after consistently using `localhost` instead of mixing `127.0.0.1` and `localhost` cookie domains.
- `GET /api/sovereign/writers-studio/beta-access`: `200`, `{ eligible: true, basis: 'active_beta_tester' }`.
- `GET /api/writers-studio/sources`: `200`.
- `Develop` of the empty Work: `Bring in material` is present; expandable on **1440×900 desktop** and **390×844 mobile**, including paste/note/reference fields. The mobile navigation `Develop` button did not accept a click in one traversal; direct navigation to the valid mode URL exposed the door. This is a **mobile navigation finding**, not a tested mode-switch success.
- From the **actual desktop UI**, clicking `Keep with this Work` for a disposable text note yielded `POST /api/writers-studio/sources` **HTTP 423**. The component showed the specific temporary Sanctuary refusal. The test database source count remained **0 → 0**, and source-to-Work belonging count remained **0 → 0** for the fixture. No source was attached or copied into the Work.
- Authenticated source-posture API: `GET` **503** (expected while the pending source-posture migration is *not* applied to this shared test DB); `POST ordinary` **423** (intentional hold); `POST sanctuary` **503** (missing schema). **Do not claim successful server synchronization**.
- MAIA Encounter authenticated browser test: blocked. Development login did not populate the legacy local browser state required by MAIA's own `checkAndMigrateSession`, and the client navigated away to `/signin` or `/home`. `/api/members/me` returned 401 during those attempted boots, although a later direct authenticated request returned 200. The normal password-login fixture attempt was blocked by tool safety before execution. **Do not label either MAIA capture as a successful Sanctuary-control witness.**

## Screenshot index

- `materials-desktop-expanded.png` — real authenticated Develop panel with Materials door opened, 1440×900.
- `materials-desktop-denied.png` — real authenticated UI after the rejected save, 1440×900.
- `materials-mobile-arrival.png` — empty Work's Develop page at 390×844.
- `materials-mobile-expanded.png` — real mobile-width Materials door expanded, 390×844; temporary audio toast and theme control overlap some content in this full-page image. Do not silently infer a perfect mobile experience.
- `maia-desktop-arrival.png` — redirected sign-in, **negative witness**.
- `maia-mobile-arrival.png` — Home after the attempted MAIA entry, **negative witness**.

## Remaining gates

1. The source posture table migration and old-version compatibility must be reviewed; do **not** apply it to production or shared test data merely to force a green test.
2. MAIA privacy settings, Voice HUD, and conversation commands still need a single server-acknowledged state shown honestly to the member, with successful authenticated desktop/mobile evidence.
3. Source POST/PATCH remain intentionally HTTP 423. A normal successful Bring → Keep → Explore → Place interaction is **not** witnessed and must not be claimed.
4. The file-store and database write lifecycle needs crash cleanup and concurrent Sanctuary transition tests before writes can be reopened.
5. The temporary local fixture and disposable Work need a deliberate cleanup after the final browser tests.

**Release disposition: HOLD.**

## Subsequent MAIA arrival correction (same local engineering lane)

The MAIA-specific browser-authentication gap was corrected by
`lib/auth/maiaVerifiedBrowserSession.ts` and its MAIA-page integration. The
restoration reads the canonical `/api/members/me` server response and refuses
unverified IDs, prior sign-outs and conflicting identities. Five isolated tests
pass for those cases.

The corrected isolated branch was then loaded in headless Chrome. Both desktop
(1440×900) and mobile (390×844) remained at `/maia/encounter`; both restored
`maia_session_version=2`, showing the fixture member's greeting and conversation
entry. Actual screenshot evidence:

- `maia-desktop-recovered.png` — **positive witness for authenticated arrival**.
- `maia-mobile-recovered.png` — **positive witness for authenticated arrival**.

The earlier `maia-*-arrival.png` images remain accurately labeled **negative
witnesses before the correction**. Neither version proves the Sanctuary toggle
itself is server-acknowledged or that source saving is permitted. The active
conversation code presently comments out the VoiceHUD rendering and uses
QuickSettingsSheet for actual member settings.
