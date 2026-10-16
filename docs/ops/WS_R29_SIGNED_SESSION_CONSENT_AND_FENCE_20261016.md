# Writer’s Studio R29 — Signed Current-Session/Consent Lease and Revocation Fence

**October 16, 2026.** Real writing, real KMS, billing, invitations and deployment: **HOLD**.

Parent: clean R28 `8c9a5d125cfa37a0a9e5dc92a152a8e1fba445e5`, exact merged R26 signed Work-key/deletion protocol plus R27 managed-KMS design, preserving both parent sources. Worktree: `fix/ws-beta-r29-session-consent-key-lease-20261016`.

## Why the new contract matters

R26’s signed Work-key lease had Work ID, member ID, key ID, operation, revision generation and a fresh challenge, but **not** the precise authenticated-session binding, current approved notice digest and latest accepted consent event. Valid R17 admission occurred *before* an external key operation. If consent/session is revoked during that operation, an earlier check is stale.

R29 adds a **separate, versioned, domain-separated Ed25519 attestation**, signed by the same operator-pinned key-custodian public key as R26 but cryptographically bound to the exact SHA-256 of the canonical R26 signed lease content (not a replacement or silent change to the R26 format). Its fields include:
- Exact verified member, Work, key, generation and **append-only purpose**. Read and export are not falsely admitted by this new contract.
- Exact R26 server-issued high-entropy challenge.
- An opaque cryptographic binding minted from a server-verified session; never pass or log the bearer token.
- SHA-256 of the current approved participation notice, and the latest independently verified **consent event sequence number**.
- A separately signed time-bounded validity period (no more than 30 seconds), not exceeding the underlying R26 grant expiry.

The R26 Work-key/deletion/freshness signatures and external minimum-generation checks are **still required**. R29 cannot simply substitute its signed session/consent object for the independent current revocation witness.

## Revoke-during-key-call protection in a fictional Work lock

`sessionBoundCustodyR29.ts` introduces a disabled, **fictional-only** rehearsal for a future independently governed per-Work write/revocation coordinator. It requires a specific env gate plus compile-time `R29_REAL_WRITER_AUTHORIZATION_ENABLED=false`.

In the rehearsal, an initial trusted admission exists; the operation obtains a simulated signed external key receipt, verifies both signed protocols, enters a mock single-Work coordinator, **queries current authenticated session and latest consent a second time INSIDE the fence**, checks that the member, session binding, approved notice SHA and consent-event sequence are unchanged, and verifies both leases have not expired before it can call a mock commit. No raw writer content or key is logged or returned by the verifier.

Refusal tests specifically move consent revocation across the key-service delay, change session binding after issuance, change consent event while writer status remains active, withdraw consent just before the Work lock, expire the lease while queued for the fence, and simulate remote key-service outage. In all cases the mock writing callback is never executed. The correctly scoped fictional path executes only under the mock fence.

**This does not prove real distributed commit atomicity.** The injected mock coordinator does not synchronize with a deployed independently run deletion register; an ordinary app-local mutex, post-KMS database lookup or temporary signed receipt alone is not an external nonrollbackable Work write/revocation fence. That authority must still be built and qualified.

## Verification

- New R29 focused negative/cryptographic tests: **16/16 PASS**.
- Inherited, exact-source R9–R28 Writer’s Studio, identity, custody, mail/access and cryptographic selected suites **49 suites / 539 tests PASS**.
- `tsconfig.r29-session-consent.json`: **strict TypeScript zero errors**.
- Fixture signers, Work keys, auth state and revocation controller are synthetic and live only in offline tests; **no AWS SDK calls, real KMS/witness grant, production DB, real Work, paid provider, login credential or live file-vault write**.
- The parent R28 source and entire deployed production reader remain unchanged.

Private test evidence: `/Volumes/T7 Shield/ws-beta-release-r9-build-20261015/R29_INTEGRATED_REGRESSION_20261016.log`, `R29_FOCUSED_JEST_20261016.log`, `R29_STRICT_TYPES_20261016.log`. No personal writing is in these receipts.

## Unwaived release constraints

1. **Operator approval and actual independently run managed key authority + independent monotonic deletion witness**; account separation, region, cost, retention, recovery and precise roles still require explicit Founder approval before any provisioning. Synthetic Ed25519 keys are not independently held.
2. Authenticated current-session and latest-approved-consent **operational** binding must be signed by an actual issuer. The current R29 input admission is supplied by the caller for fictional tests and is not a browser/server route. A persistent one-use nonce consumption ledger must be independently operated and tested against replay.
3. **True fence/atomicity** between Work-level revocation and in-flight KMS unwrap/editorial commit must be coordinated across the independently governed authority and actual Writer’s Studio PostgreSQL+vault writer. R29’s local callback contract does not provide the distributed transaction.
4. Writer withdrawal, old backup anti-resurrection, fully migrated original Source, chapter body/draft/history/keeps/authorizations/editorial JSON, SQL/WAL/offsite backups/provider logs, independent cold DB+vault+keys restore, pending encrypted orphan recovery and old-reader rollback remain unproved.
5. Full exact-source/image build, actual member-account ownership, approved consent and non-Resend mail, browser/Safari on Mac and physical iPhone Studio+Personal Portal+MAIA, adjustable columns, Apply/Undo, reopening/export, rollback and founder Class A exact-image production approval remain separate gates.
6. Linux root disk had fluctuated during separately owned Docker builds; **reconfirm >60 GiB immediately before any release image build and preserve rollback assets**. This R29 lane did not run Docker builds or delete assets.

**Disposition:** R29 cryptographic context plus fictional revoke-during-key-call safety rehearsal PASS; **real KMS, actual writer transactions, independent revocation and five-real-member beta HOLD**. Target remains `soullab.life`, maximum five verified consenting invitees.
