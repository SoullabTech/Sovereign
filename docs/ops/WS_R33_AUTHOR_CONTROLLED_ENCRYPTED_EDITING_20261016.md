# Writer's Studio R33 — Encrypted editorial revisions and author-controlled Undo

**October 16, 2026 · Local fictional-only candidate · real-member release HOLD**

## Source lineage

R33 is based on exact, clean R32 encrypted original-Source candidate `2dd28a2c52da2530a03f172fc3594f34b75ebd53`. R32 includes the earlier merged R31 protected-consent / Work revocation/recovery and legacy SQL-write worklist. Existing R11 work-field registry and R23 immutable vault protocol remain **unchanged**. Separate R32 other-team worktrees remain untouched.

## What R33 now demonstrates

`lib/writersStudio/recovery/heldAuthorEditsR33.ts` is a new **FICTIONAL-ONLY, route-unconnected** service layered on the previously verified R23 encrypted file-vault + PostgreSQL 16 owner/generation/predecessor-digest history.

- **Begin a draft:** create an author-owned first encrypted version with provenance that there is no previous version.
- **Save:** append a version with the author's entire previous content held only inside the authenticated encrypted snapshot, requiring caller-supplied expected generation and SHA-256 plus R23 database owner lock/version CAS.
- **Author-controlled Apply:** a proposed replacement cannot be applied unless the synthetic caller explicitly asserts `authorConfirmed=true`; the previous draft remains individually recoverable. **Important:** a boolean supplied by a test caller is *not* cryptographic evidence of a real writer clicking Apply. An eventual server route must witness the actual member gesture and current R29 consent/ownership.
- **Undo:** only the immediately preceding Apply is reversible by a new immutable version restoring the exact previous text. Undo cannot be repeatedly applied to Undo or unrelated Save, and the original Apply remains available for prior-version inspection.
- **Reopen:** any authorized generation can be decrypted and validated. The encrypted version note includes a distinct versioned protocol, action and prior generation; proposed text digest is authenticated and checked. No new field is added to the historic R11 registry.

Every action uses only these three *existing* R11 classified encrypted fields: `manuscript_working_drafts.content`, `working_draft_revisions.content`, and `working_draft_revisions.note`. Work, author and version identities are authenticated through R23 AES-256-GCM/AAD and owner-specific SQL joins and locks. All actual drafted prose, proposed changes, previous versions and action notes remain inside encrypted immutable file-vault bytes; the database stores only owner/version, opaque cipher reference, key ID and ciphertext hash linkage.

R33 compile-time `R33_REAL_EDITORIAL_WRITES_ENABLED=false` and exact `R33_EDITORIAL_HISTORY_FIXTURE=fictional-only` gate remain in force. R23 additionally requires its own fictional-only source gate. No active import/editorial/revision/MAIA endpoint invokes R33 and no live SQL migration is installed.

## Verification

- Focused R33 source state-machine unit tests **8/8 PASS** (mocked persistence only).
- Inherited selected Studio, protected invitation, consent, Source, revision/history and security regression **55/55 suites, 588/588 tests PASS**.
- Strict scoped TypeScript `tsconfig.r33-physical.json`: PASS.
- Actual disposable local PostgreSQL **16.13** and fsync/readback vault `scripts/ops/wsBetaR33PG16AuthorEdits.ts`: **25/25 checks and 11 negative controls PASS**. Tested exact fictional initial draft → Save → Apply (unconfirmed refusal, then confirmed) → Undo → historical reopen; stale digest, foreign member, duplicate/concurrent save, wrong key, stale/deleted Work, mutated ciphertext and unauthorized SQL delete all refuse.
- **Fresh application process following PG16 SIGKILL/restart** reopens the exact Undo text through real repository PG connection plus vault cipher. The ephemeral test key/checkpoint is passed through private local Node IPC, not via SQL/command-line logs or production credentials.
- Synthetic full database dump does not contain prior manuscript draft, proposed writing or Undo content; tested ciphertext file also lacks those strings.
- Disposable test DB/container/anonymous volume and vault directory cleaned. The first fixture revision hit a legitimate closed-PG-pool test-harness issue; this was repaired by using a separate process rather than claiming a closed pool is reusable. Earlier tests caught a mismatch in exact encrypted action key spelling; repaired and all checks rerun successfully.
- Private receipts: `/Volumes/T7 Shield/ws-beta-release-r9-build-20261015/R33_PG16_AUTHOR_EDITORIAL_20261016.json` and `R33_EDITORIAL_SELECTED_REGRESSION_20261016.log`. No real member content in the receipts.

## Non-negotiable missing production acceptance

1. **Real user route:** R33 is deliberately inactive. The current Studio Draft, Save, Revision, Apply and Undo routes still have legacy ordinary SQL writers. A new unified service must be bound to an actual R17/R29 verified session, a current approved invitation + latest accepted consent, a witnessed author action (not a caller-supplied true boolean), and an independently operated key signer/retirement + Work revocation/commit coordinator. There must be no plaintext fallback.
2. **Real UI semantics:** This fixture uses whole-text replacements to test transaction/custody and does not implement the writer's actual passage selection, 2–4 alternative editor proposals, diff/changed-words view, Write/Develop/Review, contextual selection, three adjustable columns or a macOS/iPhone Safari user journey.
3. **Full migration:** Existing member Source/chapters/drafts/history/kept passages/proposal-chain/revision authorization/editorial JSON, prior SQL/WAL/exports/old backups and provider retention remain unreviewed for actual secure migration and independent disaster restore. R32 Source supports only a bounded fictional synthetic document; large DOCX/PDF original/extraction requires an encrypted chunked upload and separate full-fidelity parsing qualification.
4. **Cross-domain transaction:** R23 append can produce an encrypted orphan when vault fsync precedes a failed SQL insert; this fixture cleans synthetic files but does not prove durable, safe real orphan recovery. A local PG16 lock is not atomic with a separate KMS revocation ledger.
5. **Key/deletion:** No independently operational KMS, authenticated external workload, pinning, nonce register, real irreversible key retirement, or independent off-host backup/old-image restore has been installed. A retained historical raw key can decrypt older ciphertext offline, so do not assert irreversible deletion.
6. **Shipping:** Full enforced Next.js image build/global TypeScript 193 inherited error debt, approved member notice and non-Resend invitation transport, Mac/iPhone Safari Studio+Portal+MAIA end-to-end, exact source/image founder Class A release review and sufficient Linux capacity remain separate hard gates.

**Verdict: R33 fictional encrypted editorial sequence QUALIFIED; five-person real beta at `soullab.life` remains CLOSED. Production and member data unchanged.**
