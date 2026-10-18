# R70.19D — Additional real mutation fences and atomic legacy revision restore (HELD)

**2026-10-18 · Mac Studio · isolated branch and fictional PostgreSQL16 + vault only · five-person Writer's Studio beta HOLD.**

## Exact source authority

- Parent: `d3aeaa690dae12125269b613b5f8ca9f27b9bdbd` (R70.19C exact-commit coherent fictional SQL+vault capture/restore, 42/42).
- Isolated branch: `feature/ws-r70-19d-remaining-mutation-held-20261018` at `/Volumes/T7 Shield/ws-beta-r70-19d-mutation-fence-20261018`.
- Existing R70.19C's shared PostgreSQL session advisory writer/capture lease is reused; its Source/Draft, R65 paste, file upload, Keep/Unkeep and selected Apply/Undo/erasure code remains separate from production. New wrappers are default-OFF unless the existing exact one-member fictional localhost PostgreSQL16/vault identity is independently established.
- No protected branch, public production image, real member, original manuscript, production cron job, backup archive, NAS, key or invitation was changed.

## Four additional route boundary classes

1. `PATCH /api/studio/files/[fileId]`: member/practitioner authorization is resolved first; then **one held lease encloses scope validation, the file metadata UPDATE and the response**. A foreign Co-Lab scope and a soft-deleted file cannot be promoted by this fixture.
2. `POST /api/studio/files/[fileId]`: **one held lease encloses exact owned-file lookup, share INSERT and access-log receipt**. This test certifies temporal consistency, **not** recipient relationship consent or real link authorization.
3. `DELETE /api/studio/files`: one held lease covers the existing file soft-delete OR empty-folder deletion. Its permanent-erasure request remains a truthful **HTTP 503 refusal**; original file bytes are retained even when status becomes `deleted`.
4. `POST /api/sovereign/manuscripts/[id]/draft/revisions`: one held lease surrounds the real legacy revision-restore workflow, from first owner-Draft read to final receipt, including the unconverted and section-addressable branches. This does not authorize any unauthenticated use of legacy writer routes.

## Confirmed data integrity defect and targeted repair

The unconverted legacy Draft restore formerly performed `UPDATE manuscript_working_drafts` and `INSERT INTO working_draft_revisions` as **two autocommit pooled database calls**. A deliberately failed history INSERT in disposable PostgreSQL16 showed that the Draft/version could advance while the immutable revision record did not, even though HTTP reported an error. That torn state would be unsafe to certify as a complete backup.

In this isolated R70.19D candidate, the unconverted restore now places the UPDATE, optimistic version/no-row validation, and append-only INSERT in **one real PostgreSQL transaction on a single client**. This transactional repair applies to that existing code path even without the test fixture flag; it therefore requires independent release review before any integration.

- A genuine fictional failure injection rejects the history INSERT and witnesses **rollback of Draft text, version, revision count and idempotency metadata**. There is no test-only SQL repair hiding a partial success.
- The joined R70.18 Draft validator now explicitly refuses when stored `revision_count` does not match exact append-only sequential revision rows, adding a fail-closed safeguard against any other partially recorded author action.
- The new guards do not imply all protected proposal/undo authorship, key custody, file scope, or deletions are resolved.

## Isolated actual-route acceptance

- Test fixture: real canonical migrations, a fresh disposable PostgreSQL16 container and marked private vault; member authentication and Co-Lab membership are **fictional Jest stubs**, not genuine member admission.
- Studio mutation route suite: **7/7 pass** on real PATCH/share/soft-delete handlers, including held snapshot/released write order, foreign scope denial, verified original-byte retention, permanent erasure refusal and no resurrection by metadata UPDATE.
- Legacy revision route suite: **4/4 pass**, including rollback of the deliberately failed history receipt and snapshot-verifiable unchanged Draft.
- Full source/vault coherent SQL snapshot, separate GPG encrypted PostgreSQL and vault archives, destroyed original test source and fresh-container restoration: **44/44 physical checks PASS** on the precommit candidate, with no live data.
- The R70.19C archived-generation negative suite: **7/7 PASS** against a new fictional encrypted generation.
- Frozen R70.19/R70.19C source SHA manifests are not silently rewritten: their source drift is expected and remains HELD. The new R70.19D 13-entry mutation delta ledger pins updated source, classifies six separately unqualified mutation paths and **always returns nonzero HOLD (exit 78)**.
- A full shipping TypeScript/build and post-commit exact-source rerun are separate acceptance requirements before calling this a committed isolated candidate.

## Remaining mandatory holds

- **Incomplete writer inventory:** proposal/authorization generation, asynchronous vault erasure and background jobs, account deletion, file folder creation and sharing revocation, non-participating private/Keep/Source history and other vault namespaces still lack complete observed capture contracts. A fixture-only lock on selected routes is not an installed global interlock.
- **No nonrollbackable deletion high-water:** an old valid encrypted point can still reintroduce source/attachment bytes after member deletion, without a current independently anchored erasure/retention authority.
- **Not independent disaster recovery:** keypairs and fresh PG containers are temporary on the Mac Studio. Missing real off-server/private key escrow, independent-host cold restore, WAL/PITR and filesystem at-rest encryption evidence.
- **Live root/user gzip backup jobs and historical NAS copies:** no authorized replacement or historical retention change performed.
- **Release gates:** no reviewed exact signed production image, authenticated Mac Safari/real consented MAIA editorial journey, independent tenant/security review, rollback witness, or founder real-writing beta GO.

**Disposition: isolated R70.19D real mutation and legacy atomicity acceptance only; full production backup and five-person real-manuscript Writer's Studio beta remain HOLD.**

## Verified precommit evidence

- R70.19D physical test suite with real fictional handlers and PostgreSQL16: **44/44 checks PASS**. Studio metadata/share/soft-delete route tests **7/7**, legacy revision-restore route tests **4/4** (including deliberate history-INSERT failure proving atomic rollback). Original database, vault, fixture key material and containers were cleaned.
- Selected actual application regression: **112/112 tests PASS** across 11 Jest suites, including the revisions route, privacy, consent, manuscript revision authority, sections and Source.
- Source custody plus release-HOLD tests: **20/20 PASS**. R70.19C and R70.19 historical source manifests intentionally report drift rather than automatically inheriting approval. The new R70.19D delta ledger has 13 pinned entries and **six explicitly unqualified** mutation classes.
- Exact encrypted-generation corruption, weak permissions, forged GO, symlink and partial-generation refusal suite: **7/7 PASS**.
- Strict shipping TypeScript `tsc -p tsconfig.ship.json --noEmit --incremental false`: **PASS**, exit 0. Full `npm run build` and exact-commit reruns remain independent acceptance steps.
- **No production admission** is inferred from these passing isolated tests. The real private-writing beta and existing backup cutover remain HOLD.
