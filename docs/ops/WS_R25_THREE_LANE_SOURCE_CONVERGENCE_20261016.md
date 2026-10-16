# Writer's Studio R25 — Protected invitation + verified encrypted vault + external custody contract integration

**Date:** 2026-10-16
**Scope:** exactly five individually approved, invitation-only writers, using existing `soullab.life` identity.
**Disposition:** clean three-lane *source/isolated-fixture* integration candidate. **Real-member source import / production launch remains HOLD.**

## Source custody

R25 is a **new, isolated** Mac Studio worktree `/Volumes/T7 Shield/ws-beta-r25-three-lane-integration-20261016` based on:
1. **R23 canonical encrypted file-vault history** (`a32bb68da353533a5b30e120992cc93e85c0acb5`): immutable encrypted file-vault bytes with PG16 owner/generation/previous-digest metadata.
2. **R24 independent lease/deletion authority review** (`18ec7762bb5c712520ae2f12f2ff4a679179cf4a`): externally signed writer/Work/key-hash/operation/epoch/nonce lease with out-of-band pinned signer contracts; separate test sidecar persists nonce/high-water state.
3. **R24 real synthetic session + PG16 vault cold reopen** (`aff2705522ca3953e6cf22994969ab5a5d746c04`): actual auth_sessions-backed member lookup, beta allowlist/consent, vault writing, database process SIGKILL and fresh-process ciphertext reopen with fictional accounts.
4. **R24 protected invitation and withdrawal reconciliation** (`b21b9cd424cd1287f4f1dfc0b975bf29b843a80d`): password-first sign-in/invitation entry and post-withdrawal self-custody that would otherwise be absent.

Both R24 source branches were integrated into a new R25 descendant of the R24 external lease branch using two explicit Git merges, **without conflicts**. Original worktrees and branches remain unchanged; no live `soullab.life`, hosted Caddy, member database, real enrollment roster, email sender, key authority, provider or manuscript was accessed for mutation. Nothing was pushed or merged to production.

## Merged-code qualification

- **42/42 selected source/security/onboarding/manuscript/recovery suites PASS, 491/491 tests PASS.** These are the union of the accepted R23/R24 external custody selection and current invitation/signin/consent entry tests.
- **Three separate scoped strict TypeScript builds PASS with zero diagnostics**: `tsconfig.r24-external-custody.json`, `tsconfig.r24-session-vault.json`, and `tsconfig.r23-converged.json`.
- The R24 real-session→vault PG16 fixture was run on the **exact merged R25 source**, with a fresh disposable `postgres:16.13` instance, fictional member sessions/consent/invitations, sealed writing and fresh-process post-restart readback. All recorded fixture checks PASS including SQL-dump and vault non-plaintext, clean source isolation and cleanup; integrated member journey 11/11, cold reopen 4/4.
- The R24 separate-process synthetic Work-key/deletion lease authority also passed again on this merged source: 11/11 checks, 4 replay/rollback/unavailable-process negative controls, cleanup PASS.
- The physical driver now records the exact `testedGitHead` in each private receipt. Original R24 source parent SHA remains part of provenance but must not be confused with the tested R25 combined revision.
- Private evidence directory: `/Volumes/T7 Shield/ws-beta-release-r9-build-20261015/` (`R25_THREE_LANE_SELECTED_REGRESSION_20261016.log`, `R24_SESSION_VAULT_PG16_PHYSICAL_20261016.json`, `R24_EXTERNAL_PROCESS_CUSTODY_20261016.json`). The private roster, personal writing and credentials are never placed in public GitHub or source files.

## What must not be inferred

1. The real production key/deletion custodian **is still absent**: the R24 sidecar runs locally with disposable private test keys and can be freely destroyed by the fixture. Production trust roots, workload authentication, independent antirollback, key escrow/rotation/revocation and cost/governance still require deliberate approval and installation. `R24_REAL_EXTERNAL_CUSTODY_ENABLED=false`; R23/24 real-member writing also remains hard-disabled.
2. Session+PG16 vault testing uses **fictional database sessions and Next.js request-context mocks**, not a full authenticated network/browser login through `soullab.life`. Its source code can be reached only from disposable fixtures, not any live Next.js writing route.
3. Legacy Writer's Studio still persists text in Source/chapters/drafts/history/revision auth/derived editorial fields and old backups/SQL/WAL/JSONB/exports. All eleven direct and eight derived-content R20 identified fields, unclassified remainder, and independently retained historical copies need reviewed encryption/retention recovery. No live migration or real import/storage write is authorized.
4. The original Source/deletion lifecycle needs durable DB/file-vault/orphan-reconciliation plus independent old-backup non-resurrection and **old-image reader rollback**, preserving earlier writer documents and precise author-controlled withdrawal/export. A same-Mac fictional DB restart does not qualify independent offsite DB+vault+KMS disaster recovery.
5. Actual Safari on Mac and iPhone (and Chrome), exact complete Studio+Personal Portal+MAIA Develop/Write/Review, Apply/Undo, import/save/reopen/export, member invitation emails through the approved non-Resend transport, and founder exact-source/exact-image authorization remain separate release gates. UI adjustable-three-column canonical source must be reconciled before day-one acceptance.
6. The most recent Linux server read-only disk census was **~72 GiB free**, above the governed 60 GiB prepare floor, but exact headroom and rollback assets must be reverified immediately before building. Storage capacity alone never grants deployment.

## Next acceptance order

**Next source slice:** combine external-workload authenticated independent key service with the verified-session vault adapter, then a complete PG16/Source/derived-historical-data migration with independent backup and old-reader rollback tests. Only after frozen source and actual-image security + Mac/iPhone browser workflows PASS should the founder approve a protected `soullab.life` cutover. Founder reviews first; admit at most two verified consenting writers, then the remaining three individually approved within the same restricted cohort.

**R25 is an integrated candidate, not a production release or invitation approval.**

## Global shipping TypeScript comparison — truthful release gate

The merged R25 source was checked with the full `tsconfig.ship.json` configuration, **without suppressing TypeScript errors**. The command exited **2** with **193 diagnostics**. An independent comparison with the accepted R24 pre-integration shipping-type baseline (`R24_R24_SHIP_TYPES_20261016.log`) found the same **193 file + TS code + diagnostic-message records**, ignoring only shifting source line/column positions. There were **zero new or missing diagnostic records** in R25.

This is **not a clean global typecheck and not an enforced production Next.js build PASS**. The three scoped security/Studio TypeScript configurations remain clean. The real-member production hold must not be released on the strength of a zero-delta diagnostic comparison. Private log: `/Volumes/T7 Shield/ws-beta-release-r9-build-20261015/R25_THREE_LANE_SHIP_TYPES_20261016.log`.
