# R49 — One continuous fictional manuscript, Source through Undo and cold recovery

**2026-10-16 · Founder Mac Studio · Held-only engineering, not production or beta approval**

## Scope and lineage

R49 branches from exact clean held R48 commit `b37d689ad40a7277561c4d425d5aae132c83332f`, which preserved the accepted late R36 ordered Source, R42 section Draft, R41 actual selected passage, R43 one-use review, R44 PostgreSQL-durable approval, R46 signed Apply, R47 separately encrypted private editorial review and separate durable Undo, and R48 read-only spent-Apply ciphertext classifier.

The isolated branch is `fix/ws-beta-r49-single-work-journey-chatgpt-20261016`, with source under `/Volumes/T7 Shield/ws-beta-r49-single-work-journey-chatgpt-20261016`.

This R49 test adds **no production API route, security flag activation, live database migration, operational independent KMS, cloud resource, provider request, email/invitation, member writing or deployment**. Both current Soullab.life and beta access remain unchanged.

## Why R49 matters

R48's three witnesses each passed real disposable PostgreSQL 16 and encrypted vault tests, but in separate test runs and Works. R49 creates **one invented Work and a shared physical PostgreSQL 16 database + fileVault** and takes the *same* member/Work/section identity through each accepted service in actual order.

The new test is `scripts/ops/__tests__/r49SingleWorkWholeJourneyPG16.test.ts`, the fresh-process recovery test is `scripts/ops/__tests__/r49WholeWorkColdPG16.test.ts`, and the disposable physical orchestration is `scripts/ops/wsBetaR49WholeWorkPG16.py`.

### Actual sequence on the invented Work

1. R33 accepts invented DOCX bytes and source text under a **pending key**. The artificial member claims one exact Work and receives a signed fake claim receipt. R36 first records Source intent before writing the **immutable encrypted original** under its **different Source key**.
2. R42 verifies Source and writes an independently encrypted, section-addressable first R35 Draft under a third **distinct Draft key**. Section order and text exactly match the accepted Source, including a Unicode character and repeated selected phrase.
3. The R41 exact helper anchors the **second** occurrence of “first fictional.” R47 checks the actual R35 Draft and encrypts the selected phrase, 2 alternatives, proposed wording and exact section identity under a **fourth private-review key**. R47 stores a metadata-only intention first and a verified ciphertext digest afterward. This is still read-only, not edit permission.
4. R47 private review is separately reopened to obtain the server-trusted exact section selection. R46 mints a separate R44 one-use opaque token under the fictional session/current consent; two competing Apply attempts result in **one signed R39/R37/R35 encrypted Save** and one refusal. Draft version 2 preserves the untouched second section.
5. R48 independently classifies that same spent Apply token as an **observed ciphertext commit** only after matching immutable R35 version 2, its idempotency receipt and encrypted R37 provenance. Neither confirmed nor unconfirmed status permits automatic retry.
6. A new and separate R47 Undo token is prepared **from the authenticated latest Apply**, spent once in PostgreSQL before signed encrypted restoration. Two competing Undo requests leave one new R35 version 3 and one refusal. The restored complete section partition equals version 1; Source is unchanged. R48 still proves the older Apply happened even though the current Work has been restored.
7. The test driver **SIGKILLs and restarts actual PostgreSQL** without deleting the anonymous Docker database volume. A fresh Node/Jest process under the same invented, temporary signed fake key authority reopens the immutable original Source, R35 versions 1/2/3, R47 encrypted proposal, R48 token-specific Apply evidence, and both independently spent R44 and R47 approvals. Revocation and wrong owner/changed consent checks refuse. No fourth manuscript revision appears.

No original manuscript text, alternative, original DOCX filename, raw approval secret or key appears in the checked ordinary SQL dump or encrypted fileVault objects. A mode-0600 temporary fictional key/receipt fixture exists only until the Docker, vault and key-fixture cleanup. **This is not independent KMS, an offsite restore, or real member consent.**

## First run and acceptance discipline

The **first physical integration run** executed all **5/5 application tests** and observed the complete single-Work workflow, but its driver incorrectly expected 6 application tests, so it deliberately reported HOLD and did not enter cold recovery. The initial receipt was preserved at `/Volumes/T7 Shield/ws-beta-r49-one-work-evidence-chatgpt-20261016/`.

A separate *precommit* rerun with the corrected exact pass count completed **5/5 first-process application tests, 6/6 fresh-process postrestart tests and 19/19 physical privacy/owner/ciphertext/cleanup gates**. Its distinct private evidence is `/Volumes/T7 Shield/ws-beta-r49-one-work-evidence-chatgpt-20261016-v2/`. The change corrected only the test harness's expected test count; no operation, policy guard or encryption mechanism was relaxed.

**Exact-commit qualification must be run again** after the reviewed R49 source is committed, under a fresh receipt directory. Broader inherited regression, strict TypeScript, whole shipping diagnostics comparison and browser review must be recorded independently.

## Nonwaivable limits before any writer beta

- **Fictional current author:** R38/41/44/46/47 permissions in this test rely on fabricated member sessions, invented acceptance events, local private signers and fake custody. A same-origin opaque-token POST does **not** certify an actual human click or authorization to touch a real Work.
- **Production runtime still legacy:** the actual PC3/V10 `P4R1WriteEditController` / Next writer routes do not yet call this protection stack. No authenticated full Studio Develop/Write/Review/MAIA, Save a Copy, Listen, actual document import, or physical iPhone Safari completion was established by this Node fixture.
- **Not remotely atomic:** although R44 token consumption happens before R46 encrypted Apply and R47's separate Undo token is spent before restore, neither constitutes a cross-operator transaction with an independently operated KMS/deletion authority. Crashes can leave SPENT without confirmed Save. R48 resolves *evidence*, not authorization for an automatic retry. Historical orphan ciphertext still needs independent custody and reconciliation.
- **Recoverability is synthetic:** the cold process recovers from keys held briefly in a fake, mode-0600 file on the same Mac; it is **not** disaster recovery across independent administrators, network trust roots, physical machines or offsite backup/restore.
- **Legacy plaintext inventory:** Source, drafts, revisions, Keeps, editorial JSON, SQL/WAL, logs/provider history, old backup/rollback readers and exports remain outside the migrated production route. There must be **no plaintext fallback** when operational key issuance fails.
- **Shipping/GO:** accepted R48 has 193 inherited TypeScript shipping diagnostics. Zero-diagnostic enforced build, signed/image custody, independent Class A witness, real authenticated Mac + physical iPhone Safari, founder exact-source/image approval, and individually authorized two-writer canary then up to five participants remain hard stops.

**Current disposition: HELD local engineering. No member admitted, contacted or billed; production unchanged.**
