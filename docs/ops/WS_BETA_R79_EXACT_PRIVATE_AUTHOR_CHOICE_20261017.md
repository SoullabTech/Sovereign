# R79 — Exact encrypted pending suggestion → writer-authorized Apply and Undo

**October 17, 2026 · isolated Mac Studio / disposable WebKit + PostgreSQL16 / five-writer production beta HOLD**

## Convergence, not another competing editorial path

R79 combines two clean, separate sources in one conflict-free, two-parent merge `e6818c7502eadc38750a2cd7b981bdd5b18585bd`:

- R77P `ae697a7b22022942345e1f148e1e9f4079cfdadf` already proved real Next.js authenticated private-pending AES-GCM read in the actual Writer's Studio, without making a false production MAIA claim.
- R78 shipping `5f3669078d45f944363d55613fa6fd55be88b3fe` carries the parallel accepted owned Scribe/report-export security and shipping changes.

The earlier Writer's Studio R70–R77P lineage, original Source, manuscript history and explicit R71 one-use approval service are reused. No new general editorial or provider stack was created.

## Smallest new boundary: exact Unicode locus of encrypted pending suggestion

R76's private pending candidate was already member/Work/draft/section/generation scoped, but had no independent record of the **exact author-selected text and position** it could replace. Author choice requires that finer-grained identity; otherwise a valid candidate could target the wrong passage in the same section.

The new `r79PrivateChoice.ts` and **test-only** `scripts/ops/fixtures/wsR79PrivatePassageBinding.sql` bind each pending candidate to the current, exact codepoint start/end, SHA-256 of the selected original words, and SHA-256 of the entire editable section body. The row contains no original or proposed words, forbids UPDATE and DELETE, and joins the exact R76 owner, draft, section and base version. It is NOT in `database/migrations` and is not a production publication scheme.

Staging is a separate explicit writer gesture; a pending candidate without a valid exact binding remains **unusable**, never automatically repaired or promoted. Both the initial publisher and the authorization reader independently recheck actual current section wording and version, along with current owner and consent. No browser-supplied provider name, key, proposal wording, account authority or plaintext published MAIA version can pass the closed input vocabulary.

## Existing one-use Apply / separate Undo, not a new writer

The formerly held R71 author service is conditionally bridged **only under complete fictional localhost flags**. For an exact owned pending candidate, it reopens R76's authenticated AES-256-GCM ciphertext and verifies R75's synthetic Ed25519 **server-observed** provider/model signature and secret-keyed content commitment within the **same caller-supplied PostgreSQL transaction** that holds the canonical draft row lock. A one-use opaque R71 review token is minted only after all checks; the browser sees comparison, never the Work key.

The writer must separately click **Review this exact private suggestion**, see both original and suggested text, then click **Apply this reviewed private suggestion**. The existing `saveSectionInTransaction` is the sole section mutation. It writes a pre-Apply checkpoint and post-Apply immutable revision, consumes the reviewed token in the same SQL transaction, and verifies a fresh server reopen before refreshing the real Studio.

**Undo remains a different author gesture**, with a second server-issued one-use token and a new append-only restored manuscript revision. The immutable original Source is not rewritten. No `proposal_versions` row is created for the fictional pending candidate. The browser and documentation never call it a published MAIA proposal.

The R71 R54 author panel also learned to offer a separately reviewed Undo when a private pending Apply has produced a verified applied generation even though there are zero `proposal_versions` alternatives. This change is used only in the fictional-held lane.

## Provider-signature canonicalization

The inherited R75 signature verifier was strengthened to reject **noncanonical base64url signatures** (decoded 64-byte Ed25519 signature must encode back to exactly the supplied text). This closes text-aliasing through unused trailing base64url bits and makes tamper verification deterministic. The R75 test now changes a guaranteed significant signature byte and independently tests a deliberately constructed alternate text representation of identical decoded signed bytes. Both are refused. No provider network calls are used.

## Physical acceptance

Unique earlier test runs are preserved. **R79 precommit v2 PASS:**

- **96/96** actual WebKit browser assertions with the real Next.js/PC3 UI and actual PG16. The browser performed one-only Press import/retry, real Write, Review, History/restore, two member-authored alternatives → explicit Apply → independent Undo; then reselected exact original words at the *new* current version, sealed a separate private fictional provider candidate, previewed it, explicitly reviewed exact wording, separately Applied it, and independently confirmed Undo.
- **71/71** SQL/integration/privacy/cleanup checks, including 10 immutable revisions, final working version 9/revision count 10, two independently consumed-and-undone Apply authorizations, four total approval rows, two different sealed and **unpublished** private candidate identities, two exact hashed passage binding rows, no new plaintext proposal schema, and no published MAIA version.
- Real PostgreSQL refused an attempted UPDATE and DELETE of the exact pending passage binding; both rows remained immutable. Spent private Apply/Undo tokens each returned **409** on replay. Cross-site Origin and foreign-member access remained denied, and later member consent revoke prevented further reads.
- The existing source text remained exactly unchanged and both separate Undo sequences restored the exact original writing. The 390px WebKit mobile Press and Review layout remained usable. No external provider calls, paid signing service or off-host browser requests; disposable SQL and Next/WebKit test services cleaned.

Selected regression after including both R77/Scribe shipping suites and the new R79 law: **115 suites, 1,202 tests PASS**. R79 law specifically exercises wrong codepoint offsets, wrong original passage hashes, altered section body, foreign member and metadata-only SQL before decryption. Strict R79 TypeScript PASS.

The unsuppressed whole-app shipping TypeScript audit still fails with **103 diagnostics**. This is **exactly the same set as the accepted R78 shipping baseline** after normalizing its worktree prefix: **0 newly introduced diagnostics**, 0 removed. R78's shipping improvements had already reduced the old R77P 113-error count to 103; R79 does not misattribute that improvement to the new private-choice service. The clean production build remains a release HOLD.

**Precommit evidence:** `/Volumes/T7 Shield/ws-beta-r79-private-choice-precommit-v2-20261017/` and `/Volumes/T7 Shield/ws-beta-r79-regression-precommit.log`.

## Hard, honest release limits

Everything above is a **fictional** approval rehearsal. R79 uses a hardcoded synthetic model-response object and synthetic signer/keys. It has **no actual authorized MAIA inference, no real provider success receipt, and no production signer**. It is not evidence of confidential publication in production; existing legacy `proposal_versions.formulation` and other plaintext Source/Draft/history fields, PG/WAL/backup history and member data are not migrated. The fictional candidate can be expressly Applied to a fictional test draft without declaring itself a published proposal; this is not approval to bypass a real production proposal ontology.

The consent/read/apply sequence is verified against real **local** PostgreSQL, but cross-process current-consent revocation-vs-commit serialization still needs separate release qualification. It cannot be claimed production-safe without operational testing and key/account authority.

Production beta remains blocked by real consented MAIA provider handoff, a confidential and provenance-attributed production publication/read model, conventional protected SQL/WAL/legacy Source/Draft/vault and encrypted local/NAS/offsite backups with cold restore, all remaining whole-app TypeScript diagnostics, a clean signed/reversible release image, DOCX/PDF/TXT/MD import/export, real Mac Safari and physical iPhone acceptance, and founder-approved actual notice/canary admission.

No real members, manuscripts, credentials, paid model/KMS calls, GitHub writes, PRs, merges to protected branches, deployments or invitations are authorized or performed. Optional independent sovereign KMS remains a later non-downgrading upgrade; verified conventional managed security is the beta target.

**Disposition: isolated R79 acceptance candidate; production and member beta HOLD.**
