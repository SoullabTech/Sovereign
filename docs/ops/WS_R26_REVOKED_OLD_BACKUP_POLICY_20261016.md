# Writer's Studio R26 — Revoked Work vs older ciphertext backup (fictional only)

**Date:** October 16, 2026
**Source base:** clean R25 three-lane invitation/session/vault integration `a5befd4166a6e01c9b47522ab7b6c7635c404b16`
**Product intent:** five explicitly invited writers on `soullab.life`, one verified member identity.
**Disposition:** isolated old-backup *policy refusal* PASS. **Real-world irreversible deletion, independent custody and real-member launch HOLD.**

## Engineering question

R24 demonstrated current signed, scoped Work keys and a synthetic independently stateful monotone deletion register. However, old encrypted copies might outlive the member's request to withdraw. The next truthful test must distinguish *refusal by the current custody service* from a stronger, often unjustified assertion of *cryptographic impossibility*.

## New, complementary R26 test path

- `scripts/ops/wsBetaR26FictionalRevocationCustodian.cjs` copies the R24 synthetic child-process signer design into a dedicated, explicitly `fictional-only` fixture. It records a retired Work and retired Work-key ID in a signed, monotonic deletion checkpoint. Retiring deletes the active key entry and raises the current deletion generation. A restarted child reads the durable register and will not issue another lease for that Work. Signed deletion checkpoint and fresh lease issuer public roots are exercised only in this fixture.
- `scripts/ops/wsBetaR26OldBackupRefusal.ts` obtains a fictional signed scoped Work lease using the existing R24 verified contract, uses the actual repository authenticated AES-256-GCM WorkSnapshot codec and `lib/storage/fileVault.ts` immutable write/read API to persist an encrypted fictional manuscript draft, and creates a **separate prior-copy fixture** comprising ciphertext plus a manifest of owner/Work/generation/digest/key identifier.
- No original author's actual data, live PG16 database, live remote vault, historical provider content, production keys, cloud service, email or member account is touched. The old-copy fixture simulates vault/manifest recovery but is **not** a real PostgreSQL backup and is not an offsite disaster recovery certificate.
- After retirement the fixture kills and restarts its custodian child and independently reads the newer deletion register. It requires no active key record, explicit revoked Work/key IDs, refusal to issue new leases, refusal of a still-unspent pre-deletion lease under the newer epoch, refusal to use the old signed checkpoint, and refusal of the current signed checkpoint for the retired Work.
- In an important **deliberate adversarial positive control**, the fixture retains a temporary copy of the old raw key and demonstrates that the old encrypted ciphertext **can still be decrypted offline** if the old key and old ciphertext both survived outside the authorized custodian. It zeroes its temporary buffers afterward and cleans the marker-bound disposable files. This is why the test status explicitly includes `RAW_KEY_ERASURE_UNPROVEN`. Such a retained key is the adversarial failure mode that production custody must eliminate with genuine independent key lifecycle and containment.
- The synthetic custodian subprocess receives only an allowlisted test PATH and its two R26 fixture variables, **never the Mac's full environment with possible credentials**. Temporary marker-owned custody state and prior-copy bytes are removed after each run. This does not retroactively erase storage blocks or independently certify hardware secure deletion.

## Evidence

- Three repeated physical runs with the original prototype each passed **13 checks, 4 negative categories**, verifying revocation after restart and the retained-key offline-decrypt limitation. Subsequent stricter subprocess environment tests also passed.
- New source-isolation Jest suite **5/5 PASS**, validating all real-member runtime flags remain disabled, no live/public API or network opening exists in this test code, and the explicit failure-mode positive control is not hidden.
- Inherited selected Writer's Studio / invitation / auth / Source / history / security regressions **43/43 suites, 496/496 tests PASS**.
- Strict R26 TypeScript `tsconfig.r26-backup-revocation.json`: PASS.
- Private machine evidence `/Volumes/T7 Shield/ws-beta-release-r9-build-20261015/R26_OLD_BACKUP_REVOCATION_20261016.json`, selected regression log `R26_REVOKED_BACKUP_SELECTED_REGRESSION_20261016.log`. Do not publish secret-bearing fixture dumps or actual member identifiers.

## Scope and independence constraints

This is a **separate, clean local R26 lane**, created to complement rather than overwrite `fix/ws-beta-r26-external-custody-contract-20261016`, a distinct branch already staging stronger domain-separated signed lease/challenge contracts. It does **not** silently combine those two protocol variants or replace R24.

A child process on the same Mac with writable fixture state is not an operator-separated external KMS, nonrollbackable hardware trust root, tamperproof deletion ledger or independent disaster recovery. In particular:
- A compromised process with access to a raw Work key may copy it; old encrypted backups are decryptable with that stolen/retained key. The test explicitly demonstrates this limitation.
- The synthetic custodian's software key state can be copied or restored from an older point in time; this test does not independently prevent restoring old signer/key state. A true antirollback and key-retirement proof requires a separate authority outside the same recoverable storage/disaster domain.
- Fixture `retire` is called over private test IPC without production-grade administrator/workload authentication and must **never** be wired into a live member delete or used as an actual operator endpoint.
- Earlier actual PG16 + vault source, member-authentication and post-restart recovery tests remain valid for their separately declared scopes; this R26 test did not jointly run against an independently restored live PG16/Source/KMS bundle.

## Required production acceptance before the five-member beta

1. Approve and provision a real independent Work-key/deletion custodian: authenticated workload identity, out-of-band pinned signers, durable external high-water, nonce ledger, revocation/retirement, per-Work secret isolation, retention, cost and recoverability. Proof must survive app server and DB/vault snapshot rollback.
2. Reconcile other staged R26 signing/challenge variant with this deletion attack fixture under one protocol and one reviewed key-rotation policy.
3. Enforce member-owned encrypted import/editorial writes throughout all existing Source/chapter/draft/history/keep/proposed edit/authorization/derived JSON/exports without plaintext fallback. Test earlier backups including SQL/WAL/file-vault/logs and actual original-file bytes.
4. Recover an independently backed-up PG16 database, encrypted vault and *current trusted* key service after failure; confirm exact historical read for nondeleted Works **and the refusal to read deleted Works with older backup**, even after signer/epoch rotation. Document explicit limits on independently retained raw keys.
5. Resolve remaining shipping TypeScript baseline/build, exact source/image/rollback review, invitation notice, approved non-Resend mail and complete Studio/Personal Portal/MAIA Chrome/macOS Safari/iPhone Safari workflows. Recheck Linux disk and backup custody before any image build.
6. Obtain separate founder authorization tied to exact SHA and immutable image; founder signs in and experiences full flow first. Only then begin the five-person controlled invite rollout.

**Nothing in this R26 experiment deploys, grants real keys, destroys real data, erases a real member's writing, spends money, sends invitations or authorizes a production cutover.**
