# Writer’s Studio R50 — Durable Apply, independent Undo, and read-only recovery

**October 16, 2026 | Local fictional Mac Studio integration | Five-tester Soullab release HOLD**

## Scope and preserved histories

This integration preserves two independent committed development lines, without changing either parent worktree or the separate R49 encrypted-vault orphan inventory lane:

- R47 durable author-approved Undo and encrypted last-Apply provenance: 8f7381d7a61524482a53eda9f2ce0bf2aacf9923.
- R48 read-only classification of spent Apply approvals against actual R35 encrypted version/receipt evidence: f2d71fe6d67747cd49d8b3be9311010cada043a0.
- Common protected predecessor: R46 durable one-use approved Apply, 796812141da1a3cc6bcb068c5d51c5891ce56b6d.

A three-way merge initially conflicted in exactly one common **fictional Jest driver** at scripts/ops/__tests__/r39ActualSignedSectionPG16.test.ts. The two additions were reconciled without dropping, replacing or weakening either feature’s test cases. R48 captures the completed/denied Apply evidence **before** R47 Undo advances the first Work to generation 3, so its authorized recovery authority can still reopen the earlier generation 2. R47 retains four distinct durable Undo application cases: bounded consent, one-use concurrency, unavailable consent/key issuer and interrupted postclaim write.

Other R47 commits also contribute the accepted R43 canonical Writer projection, WebKit/browser review harness, exact R41 selection, and hardened R42 first-Draft key separation. Their code is preserved; the merger did not retrofit a production Next.js route or bypass existing privacy gates.

Integration branch: fix/ws-beta-r50-apply-undo-convergence-20261016.
Isolated worktree: /Volumes/T7 Shield/ws-beta-r50-apply-undo-convergence-20261016.

## Unified behavior verified on disposable real encryption and PostgreSQL

Within one invented writer/Work scenario, the exact server-side author-selected R37 change is durably approved by R44, atomically spent in PostgreSQL, fenced and signed by R39/R29, and committed as immutable R35 AES-GCM version 2. A concurrent duplicate claimant is refused. Separately, an R48 read-only evidence custodian verifies the original Apply’s approval HMAC, R35 Work-keyed idempotency receipt and save payload HMAC, encrypted editorial provenance, prior generation, and unchanged section identities; a different spent token whose signed key grant was revoked remains unresolved and cannot retry.

Only after that independent Apply observation does R47 permit a separate, explicit author Undo token. It authenticates the latest applied encrypted version, its immediately preceding section partition and encrypted R37 last-Apply note. Exactly one of two concurrent claimants consumes the Undo approval and R39 creates a new protected Restore generation 3 that matches version 1 precisely. A second Undo or smuggled browser section/Work field is refused; consent withdrawal and an injected postclaim interruption leave durable Undo attempts spent but uncommitted. No history is overwritten or deleted.

The combined runner uses a disposable localhost-only PostgreSQL 16 Docker instance, review-only R44/R47 SQL outside production migrations, a genuine R35 fsync AES-GCM vault, fabricated consent and signed Work grants, and a private invented-only token/Work-key receipt. A forced PostgreSQL SIGKILL plus restart and a fresh Node process prove both durable Undo SQL state and R48’s encrypted evidence classification after Undo. The previously applied version remains independently provable in history despite the later Restore. The separately denied Apply remains HELD, not falsely restored or retried. The fresh process writes no manuscript revisions.

R50 integration driver: scripts/ops/wsBetaR50ApplyUndoConvergedPG16.ts.
Strict TypeScript: tsconfig.r50-apply-undo-convergence.json.
Inherited R47 cold-state witness: scripts/ops/__tests__/r47ColdPG16UndoState.test.ts.
Inherited R48 independently decrypted cold-process witness: scripts/ops/wsBetaR48ColdSpentApply.ts.
Shared R39/R43/R46/R47/R48 conditional application tests: scripts/ops/__tests__/r39ActualSignedSectionPG16.test.ts.

## Local qualification prior to final freeze

- R46/R47/R48/R44 service-focused regressions: **34/34 tests PASS**, strict scoped TypeScript PASS.
- Unified physical application tests: **30/30 PASS**.
- Fresh-process R47 postrestart SQL/custody tests: **6/6 PASS**.
- Combined physical infrastructure, privacy, ciphertext scans, restart and disposal: **25/25 PASS**.
- Expanded selected inherited Studio, Source, security, consent, custody, canonical UI and R47/R48 regressions: **73/73 suites, 757/757 tests PASS**.
- Accepted R44 fictional canonical Source/section-2 Apply/Undo and PostgreSQL crash/reopen fixture also PASS with all its 13 infrastructure and cleanup checks. This runs as an independent fixture, not through the real authenticated Studio.
- The R44 canonical Chrome/WebKit fixture additionally requires the exact protected canonical UI source commit to be in HEAD’s ancestry. Running it on the in-progress uncommitted merge was correctly HELD by that ancestry guard. It must be rerun **after the merge commit**; do not relax the guard or claim a browser pass from that precommit run.
- Default-off actual-member constants remain false; no active Next API route imports R47/R48/R50, and the corresponding temporary database, vault, signed-claim secrets and containers were deleted.

Precommit evidence root: /Volumes/T7 Shield/ws-beta-r50-apply-undo-evidence-20261016. This is a test witness, not a real-author release gate. After committing, re-run physical, source, browser, focused and broad regression tests on the exact SHA with new append-only evidence.

## Important unresolved boundaries

1. **Two committed author actions, not operational remote atomicity.** Approval/Undo SQL and R35 encrypted Save/Restore are separate transactions; R48 only *observes* a completed Apply where token/root/key and cipher receipt survive. Neither classifier automatically compensates, retries or deletes orphan vault files. A matching Undo receipt after cross-process failure also needs its own separately governed encrypted reconciliation.
2. **Private recovery custody:** R48 requires the raw opaque token, issuer root and exact R35 Work key supplied by an explicitly fictional custodian fixture. This is not an independently managed recovery agent, KMS or current member consent grant. R47’s cold checks examine SQL and manifest after restart but are not offsite autonomous Work-key/Source recovery.
3. **Real writer intent:** a checked same-origin test POST does not prove a human click. Genuine member cookies, up-to-date consent, MAIA provider provenance, section-authorized editorial proposal, independent current Work-key issuer and cross-node write/revoke fence remain outside this lane. R47/R48 do not have production routes.
4. **Historical private writing:** real Source import, draft/version/proposal/keep tables, MAIA payloads, plaintext SQL/WAL, backups, retained reader images, exports and old keys remain unresolved. No fallback to plaintext is permitted.
5. **Actual author-facing experience:** full authenticated PC3/Writer Studio Develop/Write/Review, draggable three-column workspace, semantic zoom, approved author edits, Undo, Save a Copy, Listen, DOCX/PDF/TXT/MD and physical Mac/iPhone Safari must be qualified on one production-equivalent source/image. The R44 WebKit browser harness is read-only and cannot be used as evidence that production R47/48 is available.
6. **Build/cutover:** the inherited full shipping TypeScript baseline had 193 errors. A complete production image build, independent Class A custody/security witness, offsite restore/rollback, approved notice and founder exact-candidate deployment/participant authorization remain mandatory. No DNS, SMTP, AWS KMS, production database, MAIA provider, GitHub push or member admission occurred.

**Disposition: local fictional Apply/Undo/restart convergence advanced for frozen exact-commit requalification; Soullab.life five-tester production beta remains HOLD.**
