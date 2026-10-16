# Writer's Studio R27 — Consent/revocation-safe commit fence (isolated contract)

**2026-10-16 · Soullab invitation-only five-writer beta · target `soullab.life`**

**Status:** selected **test-source** integration PASS; **real/member admission and production release HOLD**.

## Why this R27 lane exists

The source was already split between two bounded R26 security developments:
- **R26 real-session/custody launch prototype** `5b1666983df84a099bf45bd32bdf1ad8a1ea8df8` descended from integrated R25, with all three protected invitation, encrypted Work, and fictional custody lines. It demonstrated current deletion-highwater refusal against an older *fictional* encrypted backup copy, while explicitly proving that a retained old raw key would still decrypt offline. It did NOT certify irreversible erasure.
- **R26 externally signed grant contract** `80ca198ab807a124ff37bcc7db86aa46f63dd511` used three **distinct** Ed25519 public trust roots: key-lease issuer, deletion-checkpoint signer, and fresh minimum-epoch witness. It binds member/Work/generation/purpose, SHA-256 of key bytes and deletion checkpoint, short lifetime, and an independently server-generated 256-bit challenge. The previous R24 two-signer/nonce contract remains a separately tested historical candidate and is not promoted by this copy.

R27 is a separate worktree based on the exact R26 old-backup descendant. The two committed R26 contract modules and four associated test files were copied byte-for-byte from exact `80ca198ab...` source into a new isolated candidate **without cherry-picking unrelated R25 ancestry or modifying either original branch**. Their behavior is tested alongside the existing protected Writer's Studio source. This is a limited **test protocol candidate** for review, not final founder selection of an operator, KMS, signing standard or external service.

## What R27 actually adds

`lib/writersStudio/recovery/heldCommitFenceR27.ts` introduces a deliberately unmounted, **fixture-only** save guard:

1. Enforce all of `R27_COMMIT_FENCE_FIXTURE`, `R26_EXTERNAL_CUSTODY_FIXTURE`, and `R23_VAULT_HISTORY_FIXTURE` set to exact `fictional-only`. The exported `R27_REAL_COMMIT_FENCE_ENABLED=false` never becomes a live switch. No API route, DB migration or deployment imports this service.
2. Derive the member only from R17's actual source code for authenticated member session, active tester invitation, current consent, exact production HTTPS host and same-origin POST. No caller-supplied member ID or browser key is trusted.
3. Ask the imported R26 held-custodian contract for a fresh external-key proof, server challenge and signed Work/epoch scope. This is itself a synthetic external collaborator; a **real independent provider does not yet exist**.
4. Require a separate `withWorkFence` coordinator (test-only interface) for the same member/Work/version. **Inside** that Work-level fence, revalidate R17 session, invitation and current consent *after the key grant*. Reject a changed member or refusal.
5. Compare the externally signed lease's independently witnessed deletion generation with the fence's current epoch. Refuse if the Work was revoked or the epoch changed while KMS was authorizing the key.
6. Only after all preceding checks, call the held R23 immutable fsync-vault encrypt/save within the same fence callback. Backend/storage errors yield a generic refusal rather than secrets, SQL or member words.

**Essential condition:** the meaning of this contract depends on a real, separately administered, durable distributed Work-level lock that ALL write commits AND withdrawals/revocations use. The synthetic `withWorkFence` callback is **not evidence of that service's existence or real atomicity across app nodes**. A second, out-of-band consent change after the final check could still win without genuine serialization. A real provider/Coordinator must prove delayed unwrap, withdrawal during pending commit, node crash and multi-node race failures on an actual deployed system.

## Evidence

- New R27 focused request-order tests: **10/10 PASS**. They prove exact sequence initial permission → key grant → Work fence → second permission check → backend write; rejection for withdrawal after granting key, changed member, higher deletion epoch, revoked Work, missing/failed coordinator and key-authority outage. These tests use dependency mocks.
- Inherited exact R26 signed-grant test suites re-run against copied R26 source. Combined R26+R27 focused suites: **5 suites / 42 tests PASS**.
- Full carried selected Studio/auth/invitation/consent/original-Source/custody/recovery security: **48 suites / 538 tests PASS**.
- R27 scoped strict TypeScript: **PASS**.
- The prior physical PG16 member-session → consent → encrypted file-vault cold-reopen fixture and the prior fictional old-backup revocation fixture were each run independently again against R27's source and passed with all temporary resources removed. **They did not jointly exercise the new R27 coordinator with a real PG16/browser transaction.**
- Private logs and receipts under `/Volumes/T7 Shield/ws-beta-release-r9-build-20261015/`: `R27_FENCED_AUTHORING_SELECTED_REGRESSION_20261016.log`, `R24_SESSION_VAULT_PG16_PHYSICAL_20261016.json`, `R26_OLD_BACKUP_REVOCATION_20261016.json`.
- No production server mutation, public route, real Work key, real member content, KMS provisioning/cost, mail or guest invitation.

## Required operational proof before real writer admission

1. Founder/operator separately selects a genuinely independent Work-key signer and deletion/antirollback authority with pinned roots established *out of band*, authenticated workload identity, nonce/replay protection, key-retirement procedures and adversarial older-backup test. R27's concurrent `fix/ws-beta-r27-managed-kms-plan-gate-20261016` branch is only a **proposal/preflight** (AWS managed KMS is one option); no AWS account, price or key permission is authorized by this source.
2. Implement a real external Work-level transactional coordinator shared by all writers and all revocation/consent-change paths; demonstrate no stale-key commit after withdrawal or key retirement across multiple processes, timeouts, delayed KMS and crash recovery. Fixture callbacks are not a proof.
3. Migrate ALL actual Source/draft/history/revision/derived editorial, SQL/WAL/backup/export/old image sources to governed encrypted, author-controlled custody, without plaintext fallback. Protect original artifacts, historical revisions, download/withdrawal, and old backup nonresurrection; document the old-key retention impossibility case.
4. Independently cold-restore actual PG16 + ciphertext vault + real external currently governed keys, verify both historical-surviving manuscripts and refusal of deleted Works, then prove rollback to prior image/reader without silently losing new manuscript versions.
5. Qualify exact release image, complete Browser/Mac Safari/physical iPhone Safari Studio+Portal+MAIA Develop/Write/Review/Apply/Undo/import/save/reopen/export, approved participation notice and verified non-Resend invitation email. Full shipping TypeScript has historically reported 193 existing errors, not a clean enforced production build; do not claim resolved without fresh evidence.
6. Recheck Linux disk, protect production/rollback images, and require explicit founder exact SHA/image Class A deployment GO before any five individually verified writers are admitted.

**Verdict:** isolated R27 consent-after-lease fencing **source contract passed**. A real external atomic coordinator, real managed KMS, full privacy migration, verified erasure, production rollout and real member admission remain **HOLD**.
