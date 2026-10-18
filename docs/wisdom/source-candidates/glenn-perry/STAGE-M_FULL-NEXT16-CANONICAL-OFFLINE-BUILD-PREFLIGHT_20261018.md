---
tier: 4
authority: derivative
source_type: research
title: "Stage M — full current protected Next.js 16 build attempt, safely isolated"
author: "Soullab engineering verification for founder review"
version: "0.1"
date_added: "2026-10-18"
status: review
safe_for_retrieval: false
---

# Stage M — Full current Next.js 16 build: OFFLINE PREFLIGHT, HOLD

**Date:** 2026-10-18 EDT  
**Source repository:** `SoullabTech/Sovereign`  
**Protected GitHub commit archived:** `6a144edabc686afc9b99828726c214dc7800158f` (`clean-main-no-secrets` as read during the test)  
**Gather Together source pin:** `b316e70627d03ca79ed3eebbbafcf9073961f41e` (research branch)  
**Disposition:** **Pre-build guards passed; Webpack source compilation reached warnings; full build FAILED at page-data collection.** No full-product acceptance or release granted.

## Why this independent attempt matters

Stage L had already passed actual Next.js 16 proxy/session/founder authorization and WebKit requests in a *reduced* fixture with a fictional, non-network database. Stage M attempted the much wider goal: a build of the **entire current protected application tree**, with the three staged Gather Together source files added to a disposable snapshot. This tests significantly more imports and pre-render behavior. It is neither production nor a staging deployment.

### Custody and isolation

- The authorized Mac Studio already held the exact protected Git commit. We created a **`git archive`** from that SHA to `/tmp/soullab-gather-full-next16-canonical-20261018-r1`, rather than rebasing, modifying or checking out the operator's active production worktree. The archive contains about **13,330 tracked source paths** and measured about 547 MB before generated build output.
- Only these three Stage H/J modules were added from the exact research commit: `app/wisdom-keepers/wisdom/gather-preview/page.tsx`, `components/wisdom/WisdomGatherFounderPreview.tsx`, and `lib/wisdom/wisdomGatherPreview.ts`. The ordinary Wisdom page, the Circle API and the protected `proxy.ts`, access matrix, account/session handling, and protected deployment files were not edited.
- The snapshot has **no actual `.env` secrets** and did not receive database credentials, a live PostgreSQL adapter, MAIA provider keys, a keeper licence, a login session, a payment account, or member files.
- Build commands ran through macOS `sandbox-exec` with **`deny network*`**, including loopback. An explicit local request confirmed the sandbox blocked connections. The Node process environment was built using **`env -i`**, with only known build variables and a local sandbox home. No production shell credentials were inherited.
- A symlink supplied the existing Next.js 16.3.8 dependency tree without re-installing or mutating the shared package directories.
- Every stage ran on temporary source/build files. **No protected branch, production service, actual database, domain, member account, Circle role or video meeting was modified.**

## Evidence: the build advanced and stopped for known reasons

**Canonical pre-build checks, run in the network-denied snapshot: PASS**
1. `scripts/verify-aetheric-consciousness.js`
2. `scripts/validate-critical-files.js`
3. `scripts/check-internal-imports.js` — the existing checker emitted its normal report and completed successfully.

**First attempt:** `next build --webpack`, using the exact archived sources plus Gather Together. The compiler tried to retrieve several declared `next/font/google` fonts (Inter, Newsreader, Cinzel, Quicksand) from `fonts.googleapis.com`. The intentional no-network sandbox blocked that lookup; the attempt failed at Webpack compilation. This is a **network-isolation/build-artifact issue**, not an authentication bypass.

**Second attempt:** An **offline-only Next font fixture** was added in the disposable checkout via Next's supported test-only `NEXT_FONT_GOOGLE_MOCKED_RESPONSES` environment hook. The mocked assets are **invalid as real fonts and must never be deployed or distributed as product font files**. The protected font import source remained unchanged. The full Webpack build then reported:

- `⚠ Compiled with warnings in 115s`. There were warnings in `lib/contacts/DeviceContactsService.ts`, imported by `app/studio/clients/import/page.tsx`, for a missing `@capacitor-community/contacts` module in the reused dependency tree. This is an unrelated optional/native dependency warning and was not corrected or silenced in production code.
- `Skipping validation of types` (the repository's configuration controls this). **A passing full-app TypeScript check was not established.**
- At `Collecting page data using 15 workers`, build failed for `/api/analytics/consciousness-correlations`: the reused `@prisma/client` package lacked its generated `.prisma/client/default` module. Build output contained `Cannot find module '.prisma/client/default'`. This failure is **not proof** of a production outage or defect in the running application; it is an exact, reproducible **isolated build-artifact dependency**.
- A separate offline `prisma generate --help` probe attempted to fetch a Darwin ARM64 Prisma engine checksum from `binaries.prisma.sh` and was refused by the sandbox. **We did not remove that safety boundary or allow Prisma to write to the shared dependency tree** merely to force a green build.

**Final result:** Stage M did **not** produce a complete `.next/BUILD_ID` or an independently runnable full-application bundle. Do not cite it as full product acceptance. The Stage L reduced integration and WebKit proofs remain separate and valid.

### Storage and cleanup

The large full-compilation pass temporarily generated a `.next` build directory of about **4.9 GB** (including a multi-gigabyte cache), with momentary Mac Studio disk pressure. After the build had failed and exited, only **that disposable `.next` output** was deleted. The source archive, offline build mock and diagnostic log files remain for a bounded follow-up. Final available disk space was approximately **34 GiB** when last checked. The live founder-review preview at `http://127.0.0.1:3817/fixture` continued returning HTTP 200. The active Mac Studio project worktree was verified clean.

## Exact next engineering gate — still isolated

1. Prepare an **independent generated Prisma client** from the pinned schema and correct Prisma version in a disposable dependency tree with pre-approved **offline artifacts**; never write to the shared `node_modules` or access the real database. If offline engine artifacts cannot be obtained, STOP rather than disabling the sandbox.
2. Reconcile the undeclared/optional Capacitor Contacts import warning without broad production dependencies; this may remain a warning if the native-only path is appropriately gated.
3. Repeat the protected full-app build with a **disk budget and explicit stop threshold**, offline test font fixtures and network denial. Observe genuine page-data collection and the true TypeScript status. Avoid masking non-Wisdom route failures with fake `BUILD_ID` claims.
4. Once a safe full build exists, run browser-to-application requests on the exact compiled product against a **disposable** account/session database. Require founder, nonfounder, revoked, expired, forged-header, disabled-flag, native-build, signed-cookie, member-intent and privacy acceptance.
5. Only **after** independent review may the founder separately authorize genuine staging sign-in using Soullab's existing authenticated account. Production and beta remain unchanged; opening a Wisdom Circle or Keeper Field requires further consent and media/role gates.

**Standing:** Valid network-isolated preflight, meaningful full-compilation evidence, and a clearly identified dependency blocker. **Full Next.js application build: HOLD. Genuine founder staging sign-in: HOLD.**
