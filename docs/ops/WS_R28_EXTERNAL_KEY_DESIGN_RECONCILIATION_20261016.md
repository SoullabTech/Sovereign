# Writer's Studio R28 — R26 signing contract + R27 managed-key plan reconciliation

**Date:** October 16, 2026. **Scope:** five-person invitation-only Writer's Studio on `soullab.life`.
**Source parents:** R26 `80ca198ab807a124ff37bcc7db86aa46f63dd511` and R27 `844084aa46ca4cdf53db4d3b5db5133e60182dad`, both descended from the same approved local R25 source.
**Release decision:** PREPARE-ONLY source convergence; real-member writing and live AWS key creation HOLD.

## What was reconciled

- **R26** supplies the active *offline test-only* mathematical verifier for three distinct Ed25519 signing roles (Work-key lease, deletion checkpoint, freshness minimum), short-lived server challenge, current Work and generation scope and a fail-closed fixture adapter into the canonical R23 file-vault encrypted revision service. It has no external signer or secure operational key service, and all real-writer flags remain false.
- **R27** supplies a conservative, AWS-specific *topology and governance preflight*: symmetric wrapping key; Ed25519 KMS signers using `ED25519_SHA_512` with raw canonical bytes; proposed separate issuer accounts and administrators; nonsensitive Work digests in symmetric KMS encryption context; strongly consistent monotonic revocation with externally anchored audit, and a post-key-call consent/session recheck. It cannot call AWS, provision accounts, install keys or grant release.
- Their files do not overlap. Both source branches are combined only in a new local integration worktree, preserving each parent SHA and history. This prevents a second parallel rewrite of the external custody contract.

## Still-incompatible operating requirements — explicit STOP

1. **R26 key lease currently signs exact member/Work/key/generation/purpose/challenge, not a separately signed session-binding hash and current notice SHA256.** R17 validates session/consent *before* calling the held adapter, but a real external issuer must additionally establish current session and accepted notice, and their status must be rechecked after the slow KMS call and immediately before the final writing transaction. Otherwise a revoke-during-KMS race survives. R27 design requires this proof before live activation; it does not claim the R26 lease already provides it.
2. **R26 implemented operations are append/read.** Export-specific key grants and revocation semantics are not yet implemented. No export access may be inferred from the R27 proposal.
3. **No KMS IAM, key, DynamoDB record, external tamper-resistant audit, independently governed root, or irreversible key retirement is installed.** Three separate fake signing keys in one synthetic process are not independent trust domains. Any member encrypted writing must remain OFF.
4. **KMS symmetric context is not private.** Its account-specific identifiers must be coarse, nonsecret and opaque, not original filenames, member names, clinical details, raw Work content or secret keys. Ed25519 KMS `Sign` takes RAW canonical bytes; its signing API has no encryption context.
5. **Conditional reads and updates alone are not permanent deletion.** A privileged admin can overwrite/delete/restore the register unless controls and independent immutable attestations prove otherwise. Work revocations must stop any surviving older wrapped DEK and fail closed after app/DB/vault rollback.
6. **Legacy plaintext remains a release STOP**: Source, chapters, drafts, revisions, kept passages, consent/authorization excerpts and editorial JSON, WAL/exports/backup and provider retention require a full guarded migration and independent disaster-recovery proof. The isolated R23 file-vault and R24 restart tests cannot certify it.

## Acceptance order from here

1. Obtain explicit founder/operator selection of the managed vs dedicated sovereign key custodian, separately named/approved administrators, spend ceiling, jurisdiction, recovery, retention and deletion terms.
2. Implement a real external signer-key wrapping and witness service with separately pinned trusted public roots and persistent nonce replay prevention. Add cryptographic session/consent binding and a tested Work-level revocation/write coordination fence; an app-side recheck alone is insufficient.
3. Qualify actual KMS outage, cross-account IAM denial, stale/forged/fresh key leases, after-revoke old-backup unwrap refusal, and a separately governed cold DB+vault+key restore. Do not promote fixture proofs.
4. Migrate all protected content, forbid fallback to ordinary SQL, requalify R25 protected first-invitation and actual Safari/browser+MAIA/Portal journeys, freeze an exact image and rehearse full rollback.
5. Founder separate Class A exact-source and exact-image GO, after capacity/health checks, then only the five individually admitted consenting members.

**R28 is source reconciliation, not operational KMS installation, verified cryptographic deletion, live authoring or production release.** Real cohort remains CLOSED.

Reference planning details: `docs/ops/WS_R27_MANAGED_KMS_PREPARE_ONLY_20261016.md`; independent source notes: `docs/ops/WS_R26_EXTERNAL_KEY_CUSTODY_RELEASE_STOP_20261016.md`.
