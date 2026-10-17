# Writer’s Studio — One-source beta launch integration corridor

**October 16, 2026 | Founder Mac Studio | LOCAL ONLY | Real five-person beta HOLD**

## Why this branch exists

The engineering work from R36–R51 had produced multiple valid, disconnected **fictional** source-custody, signed editor, encrypted author choice, Undo, restore and orphan inventories while the canonical Writer’s Studio lived on another acceptance branch. They were not yet a single candidate for honest launch qualification. Successive local unit suites were measuring individual components, not the real site.

**This isolated candidate is the source-convergence step, not the site cutover.** Branch:
`fix/ws-beta-launch-one-source-20261016-chatgpt`
Worktree:
`/Volumes/T7 Shield/ws-beta-launch-one-source-chatgpt-20261016`

Its source ancestry includes:
- R49 single invented Work: encrypted pending DOCX → immutable Source → Draft → canonical R41 exact passage → separately encrypted private proposal → R44 one-use approval → R39 signed encrypted Apply → R48 read-only receipt evidence → separately approved R47 encrypted Undo → forced PostgreSQL restart and fresh-process reopen (`bf57c6e0a749b6948c5ae7d6bb40feebec559719`).
- R48 stronger internal complete-review-HMAC and private proposal/Apply evidence reconciliation (`a2ea10c5a0ff2decbb02e5f9c405a73facf26209`). Two add/add merge conflicts were resolved in favor of that stronger R48 internal evidence and its existing 31-case physical test runner; the R49 whole Work runner remains intact.
- R44 actual canonical React Shell desktop/mobile Chrome/WebKit fixture (`d0e5e52eb922a702ffab0aee06d3c432173af3d4`), already an **ancestor** of R49, not an extra duplicate fork. Home, Develop, Write, Review, Listen and manuscript-first three-column controls exist in the actual canonical UI source.
- R47 bounded Writer legacy-writer route inventory and nonzero release HOLD gate (`ddaa5fb53f181e8e487b256cf3d786c56425ad40`). No existing member drafts altered.
- R51 bounded encrypted orphan inventory, separate durable Undo/read-only Apply status and non-authorizing recovery verdict (`12aa14a563362755a803774050a738745a9265e0`). The lone overlapping physical test file was resolved by keeping the newer R48 physical review + R47 Undo cases, with duplicated imports and flags removed. No security refusal or immutable Source law was relaxed.

No accepted parent branch, owner worktree, live member account, production DB, DNS, KMS, SMTP, provider or public deployment was changed.

## Actual application boundary (the bottleneck)

Current canonical `app/writers-studio/page.tsx` mounts `P4R1StudioHost` and the real `P4R1WriteEditController`. However:
- **Write first-Draft/return** still calls `/api/sovereign/manuscripts`, `/api/sovereign/manuscripts/[id]/draft` and `/api/writers-studio/rebuild/context`.
- **Apply/Undo** still delegates through the legacy `adoptBoundEditorialVersion` and `/api/writers-studio/editorial/undo`; the server adoption and Undo routes use the old `WRITERS_STUDIO_EDITORIAL_ENABLED` switch and legacy editorial services.
- The scan finds **12 known historical manuscript/revision/Keep/editorial write/delegation routes** plus **two** related sensitive custody and rendering routes. This is a bounded code inventory, not a proof of the complete call graph, deployed state or exact plaintext data resident in real production.
- None of the protected R42/R46/R47/R48 implementation modules is **directly** imported in the current active `app/api` route files. A synthetic approved click cannot be interpreted as real browser authorization.

**STOP: do not turn on protected-beta editing or lift editorial/import flags until a real server-owned member/session/current-consent and Work-specific custody/fence can direct every protected writer act to the independently controlled encrypted service without any old plaintext fallback. Do not disable historical authors or migrate their data implicitly.**

## One-source launch audit

New purely static, read-only `scripts/ops/wsBetaLaunchCorridorGate.mjs` provides:
- `node scripts/ops/wsBetaLaunchCorridorGate.mjs --audit` — 13 canonical real UI+protected implementation markers; expected `SOURCE_CONVERGED_HOLD` and exit **0** when this specific source contract has not drifted. Even an intact source is **NOT an approved release**.
- `node scripts/ops/wsBetaLaunchCorridorGate.mjs --release-gate` — deliberately exits **2** while the known legacy pathways or actual end-to-end release authorities remain unqualified; exits **3** if source route inventory/critical identity has drifted, exits **64** for unsupported modes. No option to turn HOLD into GO through CLI argument or environment override.
- `node --test scripts/ops/__tests__/wsBetaLaunchCorridorGate.test.mjs` — 5/5 source/route/drift/non-bypass controls PASS. Existing bounded legacy scanner negative assertions 6/6 PASS. This is not a replacement for Class A independent inspection of actual deployment.

## Candidate-local acceptance (not real beta)

- On the exact merge-source revision **before this release-audit documentation commit**, one disposable localhost PostgreSQL 16 + AES-GCM vault performed the **whole invented manuscript flow through actual signed Apply, distinct Undo and forced restart**, **19/19 physical controls PASS**, and removed its fake keys, Docker volume/container and vault.
- The canonical React Shell and exact passage helper on the same source passed **59/59 desktop/mobile Chrome+WebKit** read-only browser checks with no external calls, browsers closed and test server removed. This is NOT a live authenticated Next.js writer journey.
- Combined integration source/test qualification must be repeated on the **final committed source** to make an exact image or revision claim. A scoped TypeScript pass is not a full enforced production build.
- The gate still emits **HOLD** even when all of those fictional tests pass, by design.

## The only launch-critical remaining sequence

1. **Real identity + protected beta Work.** Establish the actual member/session/cookie, accepted first-writer notice and Work ownership under one server authority, with separately administered Work key/deletion/commit root. Server-mint the explicit author choice and private proposal; never trust a browser-supplied fake gesture or a token alone. No direct member data should be copied into local fixtures.
2. **Fence legacy writes and preserve old Works.** Before touching a protected beta manuscript, enumerate and classify every legacy writer and delegated code path, including Source import, blank Work, draft autosave/checkpoint, sections, Keeps, structure, editorial conversation, Apply/Undo, export and backup. Add a per-Work server-owned fence that fails closed on real key outage, without blocking unrelated historical writers or destroying older drafts. Qualify old/new reader and rollback compatibility.
3. **Real browser experience.** On one isolated Next.js source/image with correctly wired protected backend, execute Home → import or open Work → Develop → selected passage with MAIA → compare options → explicit Apply → Undo → close/reopen → author-owned export. Verify draggable three columns, semantic zoom, responsive mobile manuscript-first and no fake success on interrupted save; independently test ordinary Mac Safari and a physical iPhone across external authenticated access.
4. **Independent recovery and clean ship.** Restore Source, Draft, version receipts, private proposal, DB, vault and keys under a truly independent key/backup authority. Reconcile historical plaintext SQL, WAL, logs, Keeps, editorial proposals, old readers, offsite backups, orphan ciphertext and monotonic deletion/anti-resurrection. Fix the enforced full-image shipping build and establish precise signed image, rollback and external-origin proof.
5. **Governed small canary.** Independent Class A review plus founder exact-source/image GO is required separately from every participant's member-controlled account verification and accepted consent. Admit only the first **two** individually approved writers; observe, then add only the other specifically authorized people in the same group, up to five. No bulk invite, silent first-manuscript conversion or public enrollment.

**Stop rule:** Do not add another generic R-number or experimental lens unless it demonstrably closes one of these active launch gates. Real beta remains HOLD. No deployment or actual writer admission authorized by this document.
