# R7 — toolbar correction compiled; physical retest not yet run

Date: 14 October 2026. Scope: the existing small approved Writer’s Studio test group, fictional-data qualification only. No production changes or invitations.

## Exact correction and build

Parent application: draft PR #1820, revision `35440fb3b93b5b49031421e04121bb747cb9f7df`.
Isolated checkout: `/Volumes/T7 Shield/ws-iphone-https-r6-20261014`.
The only changed application component is `app/dev/writers-studio-p4r1/P4R1ThemeMenu.tsx`: 10 additions / 2 removals. The existing toolbar-host hook and React portal put Theme into the real toolbar layout alongside Save a copy, retaining the old loading/error fallback when no toolbar exists.
Component SHA-256: `7b699521a1a5b5b71050462e189afb323544f27c1cd6deeef52b8f77ac3bcea7`.

After the founder requested continuation of this exact build-and-tap task, the separate bounded `npm run build` invocation completed with exit 0. It used production-mode Next.js 16.3.8, a private HTTPS API target, dummy build credentials and an unreachable dummy database. The static/public assets were copied by contents into the standalone package.

Build ID: `SpeenJyrE-j6Keda9pGAk`.
Standalone server.js SHA-256: `b377f252ac2e3c4865db58d1da540c94c5af7856ae05d9fcc6a7b1110d9afb8a` (this identifies that file, not the entire image).
The successful build retained the existing `ignoreBuildErrors` setting. It does NOT establish zero TypeScript diagnostics, a qualified Linux Docker image, or release acceptance.

## Targeted tests

**18/18 passed, four suites:** Theme toolbar portal, Save a copy interactions, copy wiring, and appearance continuity.
The new portal tests verify loading/error fallback, relative placement in the actual toolbar slot without duplicate controls, relocation when a room replaces its toolbar, and preservation of all seven theme choices with deliberate selection.

The older appearance test incorrectly sliced from a comment to the end of the entire stylesheet, thereby including unrelated later controls. It now parses the complete stylesheet and checks the six actual appearance-chooser selector families, not manuscript-theme editing controls. A mutation test proves that a forbidden chooser override appended later is still detected. No CSS palette or declaration was changed. JSDOM drops positional `auto` values, so the new DOM test verifies parent/position/state; actual pixel/tap geometry still requires a browser test.

**11/11 local gateway boundary checks passed**, with zero requests forwarded upstream. These use only invented credentials and refuse unknown sections, account deletion, provider routes and foreign origins. The gateway was closed after the test.

## Explicit execution boundary

The subsequent attempt to start the newly built isolated standalone server was blocked by OpenAI’s tool safety checks before execution. It was NOT retried through a different command form, tool, proxy, or process-launch mechanism. There is no accepted new app runtime, phone session, hit-test, tap, download, reopening or account-switch result for this correction.

The preceding R6 evidence remains precisely scoped: actual iPhone HTTPS Studio load and scripted input persistence passed, while native keyboard automation and completed device-file verification did not. The earlier Save a copy tap was intercepted by Theme. R7 compilation alone does not close that defect’s physical acceptance requirement.

## Cleanup and remaining task

No new application or SafariDriver was started. Ports 3779, 3787 and 3893 were checked for new listeners. The ephemeral test certificate used for local boundary checks is retired without trust-store/profile changes. Exact fictional member/session/contact counts are independently checked at closeout; no real member content is used.

Next bounded verification: run this compiled toolbar candidate in an authorized isolated runtime; confirm the actual iPhone hit target and tap; then verify download initiation and actual file presence separately, reopening, account switching and native hands-on typing. Do not simulate a tap and label it native acceptance.

The existing MAIA consent, manuscript Source plus PostgreSQL recovery/deletion, exact Linux-image and release-approval requirements remain separate and unmodified. Real beta invitations and deployment remain HOLD.

## Logs retained on Mac Studio

- `/tmp/ws-r7-toolbar-production-build-20261014.log` — BUILD_EXIT:0.
- `/tmp/ws-r7-toolbar-complete-targeted-final-20261014.log` — 18/18, TARGETED_EXIT:0.
- `/tmp/ws-r7-gateway-negatives-20261014.log` — 11 boundary checks, forwarded:0.
- `/tmp/ws-r7-existing-appearance-check-20261014.log` — inherited over-broad test failure before test-scope correction.
