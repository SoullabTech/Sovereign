# Writer's Studio R24 — Real session and consent through encrypted file-vault history, then cold reopen

Date: October 16, 2026. Proposed member-facing destination: `https://soullab.life`, exactly five individually verified invited testers.
Parent: canonical vault-history R23 source `a32bb68da353533a5b30e120992cc93e85c0acb5` on `fix/ws-beta-r23-vault-history-20261016`.
Classification: **fictional-only integrated PG16 rehearsal**. Neither authentication endpoint nor live writer data has been migrated, and no production route is mounted.

## Why this follows R23 instead of another independent storage version

R21 had two separately qualified encrypted revision stores: a PostgreSQL JSONB cipher store and an fsync/readback file-vault cipher store. The canonical R23 `heldVaultHistoryR23` plus `reviewVaultHistoryServiceR23` converged on **ciphertext stored exclusively in immutable file vault and owner/version/digest references stored in PostgreSQL**. It also qualified physical restart and fail-closed lineage with fabricated member assertions. Another R23 `c5ccf766...` independently qualified the actual session/consent/PG16 **JSONB-history** implementation. R24 joins the stronger two sides without overwriting either branch.

The existing separate R24 `fix/ws-beta-r24-auth-recovery-reconcile-20261016` branch is unmodified; it contains distinct invitation/login repairs and is **not** silently merged into this fixture. Both sets of source require a single source-authority review before any release.

## Real application modules used together

The new R24 driver prepares a fresh disposable `postgres:16.13` Docker database on a randomly selected **Mac loopback-only** port and an isolated immutable vault outside the source tree. Only fictional identities and writing are used.

An initial fresh Node/Jest process uses:
- The existing `getMemberIdFromRequest` **real database-backed** `auth_sessions` verification, through its `x-session-token` fallback.
- The real `writersStudioBetaAccess` membership and server-only allowlist check, reading an actual fictional `ops_contacts` and latest append-only consent ledger.
- `reviewHeldWriterRequestR17` exact `soullab.life` request and origin admission.
- The canonical R23 `saveHeldWriterRevisionR23`/`reopenHeldWriterRevisionR23` session composer and the real `heldVaultHistoryR23` AES-256-GCM Work snapshot, dual Work ownership checks, PostgreSQL generation/predecessor chain, and immutable fsync/file-vault readback.

It saves and reopens two byte-exact fictional versions for writer A; writer B can save their own Work but not read/write A's Work. It checks forged/missing/expired/revoked sessions, mismatching claimed IDs, founder-only status, invalid host/origin, missing key/deletion proof, consent withdrawal and exact invitation removal. The complete *fictional* PG16 logical dump and all saved ciphertext objects lack the synthetic prose sentinels. **11/11 integrated functional/negative tests PASS**.

## Durable restart with a new process

The first process writes **fictional ephemeral key bytes and signing key** to a mode-0600 file in a separate temporary directory that is neither the PostgreSQL volume nor the file vault nor the source tree. This is ONLY a test stand-in, **not independently governed key custody**.

The runner force-stops the disposable PostgreSQL server (SIGKILL), restarts the same disposable volume, and invokes a **separate fresh Jest/Node process**. That process reloads the fictional key and signs a fresh checkpoint, resolves writer B's real synthetic PostgreSQL-backed session and active consent, opens the exact persisted encrypted vault Work, checks SHA-256 integrity and byte-exact content, and refuses A whose consent/session were already revoked. It also refuses B accessing A's Work. **4/4 cold-reopen tests PASS**.

Driver cleanup requires exact disposable container name and marker-identified private vault and fictional key folder; all temporary containers, volumes, vault files and the fictional escrow file were checked absent afterward.

## Test receipts and contract

- Integration phase **11/11 PASS**.
- Cold-reopen after real PG16 process kill/restart **4/4 PASS**.
- Carried-forward selected Studio, session, custody and editing tests **39/39 suites, 461/461 PASS**.
- Scoped strict TypeScript `tsconfig.r24-session-vault.json`: PASS.
- PG16, loopback-only network, plain-text absence in fictional SQL dump and vault, cold database restart and test fixture cleanup: PASS.
- Mac evidence: `/Volumes/T7 Shield/ws-beta-release-r9-build-20261015/R24_SESSION_VAULT_PG16_PHYSICAL_20261016.json`, `R24_SESSION_VAULT_PG16_JEST_20261016.log`, `R24_SESSION_VAULT_PG16_COLD_JEST_20261016.log`, `R24_SELECTED_REGRESSION_20261016.log`, `R24_STRICT_TYPES_20261016.log` (all private founder-owned evidence).
- No real member or manuscript used; zero paid model/mail calls, no change to production Caddy, Docker objects, DNS, keys, Source or invitation status.

## Nonnegotiable remaining gates — not accomplished by this fixture

1. **Independently governed, nonexportable or tightly scoped operational Work-key service with operator-pinned trust**, and separately witnessed **nonrollbackable** deletion highwater/revocation history. A test-only file on the same Mac does not provide this property; the test process could replay a previous signer and generation if its private escrow were rolled back.
2. Certified migration for existing real Source, current chapters, drafts, revision/history, kept passages, expected-text authorization, proposed edits, editorial JSON, names, derived context, exports and old SQL/WAL/offsite backups. No real data is protected by a fixture-only vault table; mandatory fail-closed old-reader rollback and deletion non-resurrection remain unproved.
3. Real schema migrations and least-privilege writer role; actual independent full DB+vault+key **cold restore** across failure of the member production host. This fixture restarts PG within one Mac and does not demonstrate independent KMS/offsite backup recovery, original Source rehydration, upload streaming or orphan reconciliation.
4. Full actual authenticated Next.js cookie/browser network behavior on Mac+iPhone Safari, Chrome, MAIA paid-provider editing (consent-gated), Develop/Write/Review, Apply/Undo, reopen/download/export, Personal Portal and adjustable column UX. The R24 fixture mocks Next request-context `cookies()` only, and uses the real `x-session-token` DB verification fallback.
5. Founder-approved exact participation notice and individually verified member ownership; reliable **approved non-Resend** invitation mail; integrated exact signed release source/image, rollback rehearsal and explicit founder Class A cutover authorization.
6. Linux storage gate was **newly observed PASS**, approximately **72.08 GiB available** (>60 GiB) after specifically authorized BuildKit retirements; revalidate immediately before any build.

**Disposition: R24 isolated actual-session + PG16 + file-vault cold-reopen functional test PASS. Operational independent key authority, real production application and five-member beta: HOLD.** No implicit approval to deploy, spend, activate real writing, delete artifacts or change production.
