# R82 — Exact source Writer's Studio shipping errors cleared, production hold

**2026-10-17 | isolated Mac Studio | no protected branch, production, real member records, model calls, keys, PR, merge or deployment**

## Authority and source custody

R82 begins at accepted R81 source `e0f8e133495aa089b2aade5bf9a14213158b41ea`: exact protected author Apply/Undo, R79 confidential fictional proposal, R80 real four-file parser/source custody and R81 WebKit import. Both R79 and R80 ancestors remain in the R81 history. A separate **read-only** R78 B1-B9 shipping-correction checkout was examined at its pinned base `5f3669078d45f944363d55613fa6fd55be88b3fe`. Its existing **69-file tracked source diff** was extracted (explicitly excluding auto-generated `next-env.d.ts`) into an independent patch, SHA-256:

`0d14e297faa9df88686daf18af5510b521f78286c1c6fe5a4f7bf80681065185`

The patch applied without conflict in the isolated R82 worktree. Three separate existing fictional-only correction tests were copied unchanged: optional native plugin fail-closed, Nostr v2 multi-filter compatibility and authenticated Team DM owner-scoping. No change was applied back to that checkout or to accepted R81.

## Compiler and security findings

- The previously frozen R81 `tsc -p tsconfig.ship.json --noEmit` had **103 unsuppressed errors** in 69 source files. R82, with the exact 69-file reviewed candidate patch, now passes the same unsuppressed shipping checker with **0 errors**, no warnings from the TypeScript compiler.
- `tsconfig.r79-private-author.json` and `tsconfig.r80-fidelity.json` both PASS, preserving the protected author and file-import type boundaries.
- Selected genuine Writer source + new shipping security corrections: **116/116 Jest suites, 1,193/1,193 tests PASS**. Separate focused security suite 6/6, 38/38 tests.
- Actual Next.js + WebKit + disposable PostgreSQL16 R81 sequence on this patched R82 source: **116/116 browser and 75/75 physical checks PASS**. All four file-backed Sources confirmed; actual DOCX fidelity acknowledgement; member-only original byte SHA-256; private encrypted test candidate; exact passage one-use Apply; separate Undo; 409/409 spent-token refusals; consent revoke; cross-member isolation. Clean disposal and zero off-host browser or model calls.
- Manual bounded review of the high-risk changes: unknown onboarding data cannot assert onboarding complete; biometric/contacts plugins are never fabricated on web or when absent natively; Nostr imports now use the installed root package and preserve all filter subscriptions; existing MAIA SQL uses non-null guarded query, and telemetry arguments reflect the actual sink; Gmail threshold uses the declared `email_send` action and `pause` gate rather than an impossible `hard` string; inaccessible calendar update refuses instead of falsely claiming success. Other changes resolve nullable route hooks, exhaustively map union values and correct typed DTOs. No wildcard CORS, new origin, credential bypass or plaintext member writing store was added.
- Three compiled-only additions are **not** production controls: tests are dev/test code; no new migration or route was introduced by R82.
- **Design governance is enforced, not bypassed.** The original attempted R82 commit was rightly refused by the Experience Contract gate because 40 changed member-facing TSX surfaces lacked coverage. In R82, **15 new explicit room-scoped structural contracts** were authored under `docs/design/contracts/r82-*-type-reconciliation.md`. Each lists the exact surface paths, current human activity, existing visual references and the limited route-null/type-map reason that is not a room redesign. Missing label/type variants still owe a real-device canary walk; these are not approved new experiences. The original design guard code is unchanged, and its staged precommit check now passes with 17 covering contracts.

## Build assessment — not passed

The existing `next.config.js` still uses `tsconfig.core.json` plus `typescript.ignoreBuildErrors=true`. This broader core checker has **291 legacy errors**, predominantly in orphaned/legacy `lib/**` code not in the `tsconfig.ship.json` production-entrypoint graph. The shipping result is a real clean `tsconfig.ship.json` check; it **is not** a claim the separate core checker is clean.

A local build was attempted inside an actual macOS sandbox which provably refused outbound network socket access with `EPERM`. Source validation, critical-file and internal-import checks passed. However, `next build --webpack` **did not pass**: an existing Next font optimizer tries to resolve `fonts.googleapis.com` while outbound access is denied, and the build worker exhausted the deliberately limited 4 GB V8 heap. Neither failure establishes a source error in the shipping corrections. No font, model response or member data was downloaded. This failed build log remains preserved as negative evidence, not counted as acceptance.

**Next build gate:** wire the already green shipping-entrypoint tsconfig into a strict Next build without suppressing reachable errors, qualify the exact designer-approved font assets without unbounded outbound fetches, use the build's documented memory limit rather than the 4 GB experiment, and prove a local **reproducible** build with package/file manifest and rollback. Do not alter visual fonts as a workaround.

## Remaining release requirements

1. Actual member-authorized, consented MAIA provider call and confidential, provenance-bearing published author proposal; the current R79/81 tests use a fictional server-provided model object.
2. Conventional production encryption and access controls for Source/Working Draft, SQL/WAL, vault, logs and original/legacy readers, plus encrypted backups/NAS and independently witnessed cold/offsite restore. Advanced independent sovereign KMS can follow standard beta; do not downgrade stronger existing custody.
3. Strict reproducible web/desktop build and publisher-controlled deployment and rollback; real Mac Safari + physical iPhone Safari file chooser and author workflow.
4. Founder-ratified actual writer/member notice and two-writer canary before expanding the five-person cohort.

**Disposition: shipping-entrypoint TypeScript and isolated Writer functionality PASS. Production build NOT PASSED, beta HOLD.**
