# Writer's Studio R44 — Accepted Source key domains + exact canonical passage into encrypted editing

**October 16, 2026 · ISOLATED SOURCE/PHYSICAL TEST PASS · REAL-MEMBER RELEASE HOLD**

## Fixed, noninterfering source authority

R43's committed merge `ee47a82eabf0f253a303c4b7740025426d7eb862` contains the accepted ordered R36 encrypted original Source composer, R42 Source-to-encrypted-first-Draft, R37 passage Apply/Undo and the actual canonical Writer's Studio R41 selection/three-panel Shell. **Its working directory also held independent uncommitted changes**, so this qualification was made from an immutable R43 commit in a separate worktree, without touching that operator's edits.

- Isolated worktree: `/Volumes/T7 Shield/ws-beta-r44-canonical-source-writer-qualification-20261016`.
- Branch: `fix/ws-beta-r44-canonical-source-writer-qualification-20261016`.
- R43 committed R42 key-domain check refused Source/Draft key reuse but omitted the **pending import vs Draft key** comparison. R44 imports the already tested separate R42 review's exact `distinctKeys` logic, requiring Draft key ID and 32-byte key material to differ from **both** pending and immutable original. Existing pending-to-original rewrap in R33/R34 already enforces separation of its own two domains.
- The only changed runtime code is the narrow key-domain check in `lib/writersStudio/recovery/heldSourceDraftBridgeR42.ts`. Actual Writer's Studio and R39 signature/session/choice source remain unchanged. This is intentionally *not a new browser route*, a real KMS adapter, a plaintext migration or a deployment.

## New physical integration test: the second repeated passage, not the first

The held `scripts/ops/__tests__/r42PG16SourceDraft.test.ts` now uses the **exact production-imported R41 Write component helper** `exactTextareaPassageR41` to establish Unicode-codepoint offsets in a fabricated Source-derived two-section chapter with *two occurrences* of “lantern glows.”

1. The accepted pending manuscript claim publishes encrypted original bytes/extracted text/private filename through R36 before any mutable Draft publication.
2. R42 makes an immutable first-Draft intention and independently encrypts a section-ordered mutable Work with a separate fake Draft key, linking only Source/Draft ciphertext digests.
3. The R41 helper chooses the **second** duplicate phrase using the original text's exact UTF-16 positions; R37 uses that exact codepoint anchor and the author's fictional chosen MAIA-labeled alternative.
4. Actual PostgreSQL16 + R35 immutable encrypted vault commits a new generation changing only the **second** phrase to “lantern shimmers”; the first “lantern glows,” section two, section IDs and Source original remain exact.
5. Retrying Apply returns the previously committed structural idempotency receipt. Undo appends another encrypted generation restoring exact original text and both original section identities. The fresh Node process after forced PostgreSQL SIGKILL/restart reopens Source, Draft and the Apply/Undo history from ciphertext.
6. Added adversarial cases try making the editable Draft key equal the pending-import key by ID, reusing the same raw key under a **new UUID**, or reusing only its identifier with different bytes. Every attempt refuses before creating a Source publication, R42 first-Draft intention or Draft version.

These tests use **invented** Source/document bytes, not a genuine parsed .docx file, actual member, current browser login, real approved notice, MAIA inference or externally managed encryption key.

## Exact bounded acceptance

- R44 held-only physical driver: `scripts/ops/wsBetaR44CanonicalSourceSelectionPG16.py`, copied from the accepted R42 runner with **separate R44 receipt, logs, randomized PostgreSQL container, vault and fictional key directories**. It never touches or overwrites R42's source receipts.
- First exact-source isolated PostgreSQL 16 physical run: **12/12 Phase 1 tests PASS**, including changed duplicate passage and pending-key attacks. **5/5** fresh-process recovery tests PASS after forced database SIGKILL/restart. **13/13** physical infrastructure/ciphertext/privacy and cleanup gates PASS.
- Local source regression selecting accepted R42 + R41 actual Write/Shell suites: **66/66 suites, 695/695 PASS**.
- Scoped strict TypeScript `tsconfig.r44-canonical-selection.json`: **zero diagnostics** across the R42 bridge, actual physical test, actual PC3 Write and Shell, R41 helper and React Shell/selection tests.
- Initial precommit physical receipt: `/Volumes/T7 Shield/ws-beta-release-r11-build-20261016/R44_CANONICAL_SOURCE_SELECTED_APPLY_PG16_20261016.json` (mode 0600), SHA256 `8be23dafec7b95d9104f533db44a08ac8ec1e2fe90446976c44f84369c065feb`. Tested Git parent `ee47a82...` plus isolated R44 worktree changes; the exact final commit **must be rerun** before calling the frozen R44 candidate qualified.
- The full repository `tsconfig.ship.json` is run separately. Prior R41 and R42 releases reported 193 inherited errors, not clean production builds. Treat source and full-build outcomes separately.
- The test's temporary PG16 had a Mac localhost-only host port but is not claimed fully networkless. No database production mount, real user, MAIA calls, paid inference, SMTP, cloud KMS key, secret-provider provisioning or live source migration was performed. All temporary PG, encrypted vault and key folders were cleaned.

## Unwaived stop conditions

1. **R42 bridge remains fixture-only:** R17 current member session/consent, R29 signed Work consent/selection lease and a genuine server-minted *single-use* author choice must be bound on one actual Next.js browser request before real encrypted Source → Draft → Apply/Undo can be authorized. The current R37 gesture is invented.
2. **No independent operational custody:** three signing/checkpoint roles, current monotonic deletion witness, distributed Work revoke/commit fence, owned KMS operator and actual external key retirement are not in service. Old copied raw Work keys can still decrypt old ciphertext offline.
3. **Live SQL migration incomplete:** actual Source arrivals, drafts, revision histories, keeps, editorial JSON, WAL, legacy reader images, backups and exports still contain unresolved plaintext-capable routes. Earlier lexical inventory: 51 legacy SQL write candidates (30 drafts/revisions) across 19 files. Passing fictional end-to-end ciphertext does not close real data exfiltration/custody gaps.
4. **No real UI/backend fusion:** R41 genuine Write components are present in source and their exact selection helper drives this physical test, but no authenticated **actual Next.js** Writer's Studio Safari + physical iPhone event has passed against this protected backend. The R40 browser preview is still a detached fictional fixture.
5. **Real launch approvals absent:** final member notice, actual governed provider data terms, Proton SMTP first invite, offsite original+PG/vault/key restore, exact-image enforced production build and rollback and explicit founder Class A admission/deployment remain held.

**R44 scope verdict: exact-canonical-selected Source-to-encrypted Apply/Undo with pending/source/draft key separation PASS in fictional PG16; real writing, key service and public cutover HOLD.**
