---
tier: 4
authority: derivative
source_type: research
title: "Stage N — offline Prisma recovery and complete current Next.js 16 build witness"
author: "Soullab engineering verification for founder review"
version: "0.1"
date_added: "2026-10-18"
status: review
safe_for_retrieval: false
---

# Stage N — Offline Prisma recovery and full Next.js 16 build verified

**Date:** 2026-10-18 EDT  
**Repository:** `SoullabTech/Sovereign`  
**Current protected source:** `6a144edabc686afc9b99828726c214dc7800158f`  
**Three added Gather Together files:** research commit `b316e70627d03ca79ed3eebbbafcf9073961f41e`  
**Environment:** authorized Mac Studio, isolated disposable checkout, macOS arm64, Node 22.22.3, Next.js **16.3.8**, Prisma **5.22.0**  
**Outcome:** **FULL OFFLINE APP BUILD PASS**, **CANONICAL TYPESCRIPT NO-REGRESSION GATE PASS**, **NO REAL ACCOUNT/PRODUCTION RELIANCE**. Release remains **HOLD**.

## What was actually authorized and executed

The founder confirmed readiness to continue from Stage M's full-build dependency blocker. The work was scoped to:

1. Identify compatible Prisma artifacts already present locally; avoid downloads and production connections.
2. Generate `@prisma/client` in an isolated dependency copy using the *pinned protected* `prisma/schema.prisma`.
3. Retry the complete Next.js 16 Webpack application build under a network-denying sandbox, with disk safeguards.
4. Verify resulting route compilation, run Soullab's existing type-health gate without updating its baseline, record exact custody and clean large generated caches.

No merge, source promotion, production database, member login, third-party contact, Circle access expansion, source admission, model inference, real video service or deployment was authorized or attempted.

## 1. Exact-source and dependency custody

The prior protected-source archive remained at:

`/tmp/soullab-gather-full-next16-canonical-20261018-r1`

It was originally made using `git archive` for the protected SHA, rather than modifying the Mac Studio's active worktree. Three exact research files were added:

- `app/wisdom-keepers/wisdom/gather-preview/page.tsx`
- `components/wisdom/WisdomGatherFounderPreview.tsx`
- `lib/wisdom/wisdomGatherPreview.ts`

**After building**, each of these three files was SHA-256 compared with its exact pinned research revision, and **all matched**. Selected protected files—`proxy.ts`, `config/accessMatrix.ts`, `lib/auth/serverSessions.ts`, `lib/founder/founderAuth.ts`, `prisma/schema.prisma`, `app/wisdom-keepers/wisdom/page.tsx`, and `typecheck-baseline.json`—were byte-for-byte hash-compared to the protected Git commit, and **all matched**.

The active `/Users/soullab/MAIA-SERVICE-FIRST-20261013` worktree was **clean**. The ordinary Wisdom route, its public access matrix, founder authentication and Circle role rules were **not modified** in the protected repository.

## 2. Prisma engine and client recovery without network

The Mac Studio's local Prisma cache contained engine artifacts for Prisma **5.22.0**, engine commit:

`605197351a3c8bdd595af2d2a9bc3025bca48ea2`

The Darwin-arm64 query-engine library and schema-engine executable were checked against their local **SHA-256 checksum files**, then copied into the isolated snapshot for use. No binary was downloaded; the macOS sandbox denied **all network access**, including loopback.

The original dependency tree had been mounted into the temporary snapshot by symlink. To prevent write-through into the shared dependencies, the test replaced **only that disposable symlink** with a local symlink farm. The `@prisma/client` package and generated `node_modules/.prisma/client` were real, private copies inside the snapshot; all unrelated packages remained links to their shared *read-only source*. Neither the shared `@prisma/client` nor the shared `.prisma` tree was generated or overwritten.

`prisma generate --schema prisma/schema.prisma` then completed successfully with these explicit, locally copied native engine paths and an intentionally fictional database URL. The generated client reported **v5.22.0**, resolved and imported under a network-denying smoke test, and required no real PostgreSQL connection.

**Schema provenance clarification:** the byte hash of Prisma's generated `schema.prisma` differs from the protected source because Prisma reformatted whitespace/alignment. A separate *disposable copy* of the protected schema was run through `prisma format`, without writing the protected source. **That formatted copy matched Prisma's generated schema byte-for-byte.** The original protected schema retained its SHA-256:

`28a4e2c314ed7b6848561cd050362e1877e70e97938b68dfc29e2272386a2672`

## 3. Full application build — PASS

The same complete protected Next.js application (not the earlier reduced auth fixture) was built using:

- `next build --webpack`, Next **16.3.8**
- `env -i`: only explicitly declared test build settings; no inherited production credentials
- `sandbox-exec` policy **`(deny network*)`**
- An **offline-only** Next Google Fonts mock to avoid production Google Fonts network fetches
- The newly generated **isolated** Prisma Client 5.22.0
- An intentionally fictional, unreachable database URL, never connected to
- A monitoring threshold of at least **22 GiB free disk** and at most **12 GiB generated build output**

**Build exit code: 0.** The disk guard **did not activate**. The compiler reported `Compiled with warnings in 2.0min`, generated all **823/823** static pages, finalized the route manifest, and emitted:

- `ƒ /wisdom-keepers/wisdom/gather-preview`
- `ƒ Proxy (Middleware)`
- A generated Next build ID (local, **not a release artifact**): `8qwSFi1YiAYozRHkLdsyV`

The isolated Webpack build still reported the previously known optional native import warnings for `@capacitor-community/contacts` in `lib/contacts/DeviceContactsService.ts`, imported from Studio client-import UI. Those warnings were **not** treated as successful native Contacts integration and were **not repaired** by editing canonical code.

**Safety caution:** the offline font fixture intentionally emits **nonproduction font assets**. The compiled bundle should never be deployed or published as-is; it exists only to prove dependency resolution, route integration, page-data collection and Next.js build completion in isolation. The full Next build says **`Skipping validation of types`**; it is not a substitute for the independent TypeScript gates below.

## 4. TypeScript: two different truths, reconciled

**Independent broad check, `tsconfig.core.json`:** A separate `tsc --noEmit` run reported **516 TypeScript diagnostics**, distributed across existing application areas. **None was reported in** the three added Gather Together files. This configuration is **not** Soullab's governed no-regression gate, so it remains a red broad inventory rather than a claim that the entire repository is type-error-free.

**First governed gate attempt:** `scripts/check-typehealth-baseline.js` correctly refused to pass, reporting **0 programme files**, not because source was deleted or the config intentionally narrowed, but because the temporary dependency symlink farm initially omitted the hidden `node_modules/.bin` directory. The script's `npx tsc` subprocess therefore could not produce a valid file list. This was a **fixture harness defect**, not a protected source change; no baseline update was made.

**Corrected governed gate:** The snapshot received a symlink to the original shared **`.bin` directory only**. Offline `npx --no-install tsc --version` then returned **TypeScript 5.9.3** under network denial. The **unchanged canonical** no-regression checker was rerun in read-only mode:

| Canonical `tsconfig.ship.json` gate | Verified result |
| --- | --- |
| Gate execution | **PASS, exit 0** |
| Current program files | **4,722**, baseline 3,965 |
| Current TypeScript diagnostics | **222**, baseline 239 |
| Changes from baseline | **17 fewer errors**, no new diagnostic identities/count increases |
| Additional source files in program | **765** |
| Deleted baselined paths | 8 (reported by gate; not hidden by narrowing) |
| Baseline mutation | **None** |
| Result wording | **“No TypeScript regressions.”** |

The protected baseline SHA-256 stayed unchanged:

`aeb69e1691889f2aca4add80471e95361d9612cdbf28da894265c524cb6c9666`

These numbers do **not** mean all TypeScript errors have been fixed: the repository still carries tracked baseline debt. They establish that the governed ship gate did not regress.

## 5. Cleanup and remaining local evidence

The full build produced a generated `.next` directory of approximately **4.6 GB**, including **3.8 GB build cache**. Only the generated `.next/cache` was deleted *after* build and typecheck completion, leaving the build ID, compiled manifests, server output and diagnostic logs in the isolated temporary tree for forensic/review use. A clearly named private warning file—`ISOLATED_RESEARCH_BUILD_DO_NOT_DEPLOY.txt`—was added locally.

After cleanup, approximately **40 GiB** was free. The original, separate founder-only local visual review still returned HTTP 200 at:

`http://127.0.0.1:3817/fixture` (**Mac Studio loopback only**).

No staging/full-product server was launched from the test-font build. No real member database, auth cookie or commercial API key was read. The protected operator worktree remained clean.

## 6. What the success does and does not authorize

**Established:** exact protected full-app Next16 production-mode *build integration*, exact-source custody, offline Prisma client generation, 823 static-page generation, bound Gather Together route and proxy, and passing governed **no-TypeScript-regression gate**.

**Not established:** a working full-product login session, real database migrations/session persistence, member invite/revocation in Commons Circle APIs, video or hybrid admission/recording privacy, permission from Glenn Perry or any other keeper, copyright source ingestion, whole-product API/security review, actual founder staging identity, or a beta/production release.

The earlier Stage L reduced Next.js 16 browser/HTTP authorization tests using a fictional non-network database remain relevant, but they do **not** substitute for a full application running against a disposable PostgreSQL backend. Stage N was a compile/build-and-type-health milestone, **not** that runtime acceptance.

### Suggested next bounded milestone (requires independent authorization)

Create a **separate, isolated full-product runtime acceptance lane** using a disposable PostgreSQL instance with fictional accounts and real current sign-in/session revocation semantics, explicit no-production endpoint configuration, and network/host boundaries. Verify the actual founder gate and client/browser behavior without disabling the outer access matrix or granting Circle roles. Replace mock font assets with lawful, verified build dependencies before any actual review deployment. Then obtain independent privacy/security acceptance before authorizing the founder's genuine staging login.

**Disposition: Stage N full-build and governed type-health ACCEPTED AS ISOLATED TEST EVIDENCE; actual member/founder runtime release HOLD.**
