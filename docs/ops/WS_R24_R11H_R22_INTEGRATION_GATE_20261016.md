# Writer’s Studio R24 — R11H / R22 authenticated history reconciliation

**October 16, 2026 · Local isolated candidate.**
**Disposition:** SOURCE/UNIT/TYPECHECK NO-REGRESSION PASS; real-member writing and public release **HOLD**.

## Sources and exact authority

- Integration base: R22 verified-session/history `31346f4a2a0064420ca28651eccc5b651374e796`. This inherited R17 session preflight, R20 historical-content inventory/deny-role and R21 encrypted PostgreSQL history. A distinct R21 file-vault history variant remains outside this branch.
- Protected onboarding authority: R11H/R16 `ab922fd931d9b7a26cc489360db098dd3abc5ba6`, itself based on R11H `463530dd4c7faeb08ccbc7187278e50af97e0aaf`. It preserves password-before-consent invitation acceptance and separately authenticated post-withdrawal writing custody.
- **Thirteen exact files** restored from R16 and byte-compared against that revision: invitation setup route/test, invitation screen/test, signin route/test, beta consent route/test, protected proxy plus test, UnifiedAuth plus test, and invitation design contract.
- **Five critical R17–R22 recovery/session files** were byte-compared to original R22 and remain unchanged. R16 atomic `claimArrival()` source was already **byte-identical** in the R22 ancestry and required no second cherry-pick.
- This is a restricted local source reconciliation; **no R21 file-vault branch substitution**, cloud merge, public migration, Caddy change, paid provider, real writer record, or invitation.

## Passed verification

- Combined focused invitation / consent / custody / R21–R22 history security: **10 suites, 125/125 PASS**.
- Broader R22 selected security, original Source, export/withdraw, R19/R20 policy, R21 encrypted history, R22 session and newly restored invitation/UI tests: **40 distinct suites, 463/463 PASS**.
- Inherited R22 strict history TypeScript configuration: **PASS with zero diagnostics**.
- Full `tsconfig.ship.json` run on original R22 and R24: both **193 existing diagnostics** and exit code 2, not a clean build. Some signin line positions shifted; after normalizing worktree roots and line/column positions, **all ordered 193 code/message/file diagnostic records are identical**. Canonical sequence SHA256: `695ea8f398339d681a7882328449e6af9c8f168fa483839911780d6951566908`. Thus **no newly introduced type diagnostic**.
- R15 transfer, R21 real-member encrypted history, and R22 real-member history enablement are all hard-coded **false**. No production author-ingest route calls held-history code.

## Remaining release blockers

1. R22 verified-session service is still fixture-composed, not a live end-to-end real-user browser → encrypted PG16 + Source vault service. Test keys and Ed25519 deletion witnesses are fictional, not independent custody or remotely escrowed durable keys.
2. R20 still identifies **11 direct writing/history/provenance fields**, **8 contextual/editorial fields** and **29 additional prioritized unclassified fields**, against a larger **918 potential text/JSON/binary-field inventory**. Existing plaintext Source, chapter, drafts, keeps, revision authorization, editorial JSON and historic WAL/exports/backups remain outside the closed encrypted writer perimeter. Do not label as fully encrypted or erase-safe.
3. The R21 alternate fsync-backed file-vault history version conflicts at module/API level with the R21 PG16 JSONB version. It remains a separately qualified, **unmerged** sibling requiring explicit author/Source restore, rollback and trust contract.
4. Earlier real first-time invitation fixture and public Caddy cutover were blocked by execution safety controls. This branch does **not** bypass those holds. Actual first-time invited writer → password → sign-in → member consent → Studio → MAIA/Apply/Undo/withdrawal requires permitted exact-image acceptance.
5. Founder-approved exact notice, verified provider terms, independent offsite encrypted DB+vault restore and key/antirollback authority, physical iPhone Safari, reviewed Proton SMTP PR #1830, Linux-host capacity and actual narrow reversible deployment are still mandatory.
6. Public R9 fictional beta stays active; no real beta member admission. A clean R24 source test is not authorization to deploy or claim regulatory compliance.

**Next legitimate engineering step:** establish **one independently trusted key/deletion authority and one reconciled R21 PostgreSQL-history + Source-vault contract**, then demonstrate real-session-bound ciphertext-only writes with full history/source/derived-content coverage on isolated PG16. Keep all real-member feature gates disabled while privacy review and enrollment authorization remain open.

## Local evidence

- Branch: `fix/ws-beta-r24-auth-recovery-reconcile-20261016`
- Worktree: `/Volumes/T7 Shield/ws-beta-r24-auth-recovery-reconcile-20261016`
- Test logs (local, ignored): `R24_FOCUSED_RECONCILIATION_JEST_20261016.log`, `R24_BROAD_SECURITY_JEST_20261016.log`, `R24_R22_SHIP_TYPES_20261016.log`, `R24_R24_SHIP_TYPES_20261016.log`, `R24_R22_STRICT_TYPES_20261016.log`.
- No remote PR to divergent `main`; qualified source only.
