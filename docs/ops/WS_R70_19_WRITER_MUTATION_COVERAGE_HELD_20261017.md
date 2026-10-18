# R70.19 — Source-bound whole-Writer mutation coverage (HELD)

**2026-10-17 | isolated Mac Studio / T7 checkout | source-only negative qualification | real member beta HOLD**

## Source and isolation
- Baseline exact source: 441616dbf5a597f9ef297ad3dafead3be5f2ceb3, the newer R85 + RF01/R1Q privacy integration, not protected canonical and not the running production image.
- Own branch: feature/ws-r70-19-failclosed-writer-coverage-20261017
- Own checkout: /Volumes/T7 Shield/ws-beta-r70-19-writer-coverage-20261017
- Earlier accepted R70.18 source/Draft checkpoint: 5af9f0bb35d76c55d603d9ad3d7f508f8dd328f5 on **separate** R70 lineage; it is NOT joined to this R1S baseline. Do not infer Source/Draft fences have shipped.
- This stage adds only a machine-readable source map, a read-only negative release gate, tests and this note. No application mutator is modified, no environment switch is enabled, no production key/host/database touched.

## Exact 11 observed write/restore entrypoints
1. `confirmed-paste` — R65 confirmed Source and manuscript transaction; no independently qualified whole-Writer capture lease.
2. `arrival-original` — original file vault write followed by Source SQL relationship.
3. `source-claim` — unclaimed-to-owned Source relationship.
4. `source-discard` — unclaimed original disposal and erasure consequences.
5. `draft-section-save` — public section revision save transaction.
6. `nested-section-save` — direct `saveSectionInTransaction`, which a wrapper-only fence could miss.
7. `draft-revision-restore` — new revision from previously saved content.
8. `studio-file-upload` — practitioner attachment writes file bytes before SQL row; potential orphan/race if SQL commit fails or backup intervenes.
9. `studio-file-delete` — soft-delete metadata and retention/irreversibility.
10. `studio-file-metadata` — owner/Co-Lab file scope metadata changes.
11. `source-erasure` — manuscript/source deletion and anti-resurrection.

For each entry, `scripts/ops/wsBetaR7019WriterMutationInventory.json` pins its **exact R1S source SHA-256** and independent mutation-anchor strings; changes to any source invalidate the attestation rather than silently inheriting a verdict. A matching source hash proves identity only, NOT a cross-session backup fence or recoverability.

## Seven unresolved storage families
- Pending encrypted Source and rewraps.
- Confidential editorial proposals, private versions and author approvals.
- Keeps, journal and historical derived content.
- Background storage writers and job queues.
- Member account erasure and independent deletion authority.
- PostgreSQL WAL/temporary storage and consistent database capture.
- External attachments, historic archives and full file-vault recovery.

This list is a **minimum unresolved inventory**, not proof that all possible writers have been found.

## Exact read-only negative test and result
- Run: `node --test scripts/ops/__tests__/wsBetaR7019WriterCoverageGate.test.mjs`.
- Result: **7/7 PASS**, no fixture server, model call, filesystem write to source, database or Docker.
- Gate: `node scripts/ops/wsBetaR7019WriterCoverageGate.mjs <absolute_worktree_path>`.
- Expected result: exit **78**, `R7019_WHOLE_WRITER_CAPTURE_UNQUALIFIED_HELD`, 11/11 recognized baseline entrypoints, all 11 still unqualified and seven unresolved families. Exit 78 is deliberate: a held safety gate must never appear as a ship success.
- Negative tests cover source mutation and missing source, exact SHA and anchor verification, confirmed paste, direct section-save, Studio upload as explicit blockers, attempted fake signed receipts and environment booleans, and refusal with unknown families.
- The gate can NEVER return `releaseApproved:true`; whole-Writer release requires separately verified real SQL+vault coherence, full encrypted archive, independent recovery keys, erase-highwater and cold-restore evidence. It is not wired into production.

## Next Class A engineering step
Build R70.19B in a separate isolated checkout only after reconciling R70.18's Source/Draft session advisory lock with the R1S RF01/R1Q auth and consent changes. Design actual writer interlocks for the R65 transaction, the **direct** section-save transaction (not only its wrapper), and Studio file-byte-before-SQL uploads. Qualify competing writer vs snapshot, interruption, refusal, owner/Co-Lab boundaries and revision/deletion anti-resurrection on a fresh fictional PostgreSQL16 + vault fixture. Then enumerate remaining Keep/proposal and async writer surfaces before any full-backup claim.

**Production encrypted SQL + file-vault capture, production independent cold restore and real manuscript beta: HOLD.** The approved static fictional desktop demonstration remains independent.
