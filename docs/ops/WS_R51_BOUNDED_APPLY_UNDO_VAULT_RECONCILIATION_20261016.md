# Writer’s Studio R51 — read-only approval and ciphertext integrity evidence

**October 16, 2026 | Isolated Mac Studio | Fictional only | Five-tester beta HOLD**

## Source and purpose

R51 merges two independent, committed engineering histories without changing their original worktrees:

- R50 durable approved Apply and Undo, immutable encrypted Work versions, R48 read-only interrupted-Apply classification, and restart recovery: fbea22b7c7073369ee25ed1e1c6c748f58255958.
- R49 independent read-only vault/orphan/manifest inventory: b7732c0a7deacf1e1fa42f5471658eb015c7bcac.

The dual-parent source merge is 65849461dfcb2bd9defddfcf8d3bcf458ce32d5a, on isolated branch fix/ws-beta-r51-spent-apply-undo-orphan-join-20261016. No production API, provider, member or deployment was activated.

## Bounded recovery verdict

The new pure service lib/writersStudio/recovery/heldRecoveryVerdictR51.ts combines R48 encrypted Apply evidence with R49 vault-integrity counts. It does not query a real database or change a filesystem. Reports contain no writer identity, original text, private filename, raw approval or key.

- An approved Apply backed by authenticated encrypted R35 history remains a **fictional bounded observation**, not a release authorization.
- A spent approval with no exact matching committed receipt remains unresolved. It never authorizes automatic retry.
- A missing or corrupted referenced ciphertext object takes precedence over orphan and approval observations.
- An unreferenced encrypted object, unsafe file, broken version chain or inconsistent SQL manifest requires custody review. No automatic delete, relink, restore or publishing operation is permitted.

R49 has one additional **R51-only** marked disposable vault-fixture path. It requires the existing R49/R35 fictional gates plus both R48 and R51 isolated-test gates; no general filesystem waiver or production route exists.

The PostgreSQL and filesystem observations are not atomic. Even two agreeing reports cannot prove independent operational key custody, global storage completeness or erasure.

## Physical qualification

A new disposable PostgreSQL 16 / R35 AES-GCM test combines approved Apply, independently approved durable Undo, earlier ciphertext receipts and R49 inventory. A forced PostgreSQL restart and fresh Node process test the same history before any synthetic damage.

The additional R51 test then checks three states:

| Fictional observation | Valid referenced files | Unreferenced | Corrupt referenced |
|---|---:|---:|---:|
| Consistent vault | 27 | 0 | 0 |
| Unreferenced encrypted object | 27 | 1 | 0 |
| Corrupt referenced object | 26 | 1 | 1 |

The extra object and single-byte integrity fault are inserted **only in the disposable synthetic vault**. Their classifications grant no automatic action and add no manuscript version.

Precommit acceptance:

- 30/30 signed Apply/Undo application tests passed.
- 6/6 fresh-process PostgreSQL restart tests passed.
- 32/32 privacy, inventory, recovery and cleanup checks passed.
- 43/43 standalone R49 physical checks, including 15 negative controls, passed.
- 75/75 combined Studio/security/consent/custody suites and 781/781 tests passed.
- Scoped strict TypeScript passed.

Source locations: scripts/ops/wsBetaR51RecoveryJoinPG16.ts, scripts/ops/wsR51ColdEvidence.ts, lib/writersStudio/recovery/heldVaultInventoryR49.ts and tsconfig.r51-recovery-verdict.json.

Precommit evidence: /Volumes/T7 Shield/ws-beta-r51-recovery-join-evidence-20261016/

These results need a separate **exact-commit** run before the R51 source candidate can be accepted.

## Production STOP conditions

Real member/session consent, current author choice, encrypted MAIA editorial proposal provenance, independent external Work-key/deletion/rollback authority, legacy plaintext migration, offsite backup and restoration, and full authenticated Next.js/Safari acceptance remain unqualified. Canonical import, Develop/Write/Review, precise selection, column resizing, semantic zoom, Undo, export and Listen need a production-equivalent integrated image.

A clean full shipping application build, independent Class A security/custody review, founder exact-source deployment approval and individual tester admission authorization are separate gates. No source or receipt here overrides them.

**Disposition:** R51 is read-only fictional recovery engineering. Production and the five-person beta remain HOLD.
