# R36 — Single held-only Source intention → sealed Work → verified custody

**October 16, 2026** · Parent R35 `e4f9f267c56662ed0816a95da8149e96f9c98fdc`
**Intended release:** five individually invited writers on `soullab.life`
**Classification:** **fictional-only local Source composer qualified; real member beta HOLD.**

## Actual implementation

The new `lib/writersStudio/recovery/heldSourceComposerR36.ts` combines the already qualified R33 encrypted pending Source claim, R35 immutable prewrite intention, R32 AES-256-GCM original file and extracted text custody, R34 encrypted Work recovery and R35 immutable observation **inside one deliberately unmounted, default-off service call**. Only fabricated identities, writing and test keys were used.

The composer requires every R32/R33/R34/R35/R36 fictional-only flag; `R36_REAL_SOURCE_COMPOSER_ENABLED=false` is compiled in. It accepts only the R34 synthetic server-asserted member subject plus the currently signed exact claim, pending/Work key and witnessed deletion highwater. It is **not a production HTTP/session verifier**: a structurally typed `server_verified_member_session` label can be forged without a separately connected real auth service, so this fixture must not be routed to members.

Its sequence is:

1. Derive the exact member/arrival/Work/version and reject a Work already published without a matching **previous** R35 intention. This rules out silently creating an after-the-fact journal for a legacy R32 Work.
2. Acquire a **PostgreSQL transaction-scoped advisory lock per exact member+Work+arrival**, BEFORE entering R35, R32 or R34. This serializes parallel composer calls without holding a Work, pending or intention table row while the nested R32 file vault and owner transaction operate.
3. Reverify the exact R33 postcommit claim and signed pending Source; commit/reuse an immutable R35 intention with opaque claim ID, Work/version/keys and keyed Source/provenance HMAC **before this composer publishes ciphertext**.
4. Check the exact member-owned R32 immutable Work manifest. If it already exists, do **not** publish new ciphertext; any different arrival or Work key refuses. If absent, read the protected pending original and recheck the signed claim identity/version, then invoke R32 to seal two durable AES-GCM objects (original bytes + extracted writing; independently encrypted private filename/MIME/extractor) and insert an owner-locked ciphertext manifest. Neither path writes author content to ordinary SQL.
5. Ask R35 to observe only the existing authenticated R32 Work by reconciling R33 via R34. The observation requires exact Source/byte/provenance equality, signed claim ID, owner, version and both ciphertext hashes. Missing or changed existing Work does not turn into a "success" and is not recreated from an unregistered vault file.
6. Return `HELD_SOURCE_WRITTEN_AND_OBSERVED` or `HELD_EXISTING_SOURCE_RECONCILED`, always `pendingRetirement:NOT_PERFORMED`, `releaseApproved:false`.

Synthetic fault probes simulate interruption immediately after intention, after R32 Work ciphertext+manifest persistence, and after release of the protected write stage but before observation. Retries preserve the exact intent, Work generation and ciphertext; they do **not** write a duplicate Work.

## Concurrency defect found and corrected during qualification

The first attempted R36 implementation locked an **intention table row while invoking the separate R32 Work transaction**. A competing R35 intention first locked the destination Work and then waited for the intention row, inverting the established lock order. The physical concurrent-write suite timed out and the test-only Docker and vault fixtures were removed. **This failed run is retained as evidence and is not a PASS.**

The candidate was corrected to acquire only a PostgreSQL **transaction-scoped advisory lock before all nested services**. No R35 intention, pending Source or destination Work table row is held by the wrapper while nested R32 and R35 operate. The lock is released automatically after all operations or on failure. The next physical test confirmed two concurrent composer calls yield **one writer of the Work ciphertext, one existing-Work reuse, and exactly one immutable custody observation**, without deadlock. A later assertion expected a deeper forged-claim failure; the actual earlier refusal `r36_published_work_without_prior_intent` is stronger. This expectation was corrected and the final run passed. Earlier HOLD receipts remain preserved.

This **single-database** advisory lock is not an independently governed key-service/withdrawal fence. Other legacy R32 call sites are not technically forced to use R36 yet. A real admission path would need enforceable *global* single-service ownership, real session+current consent and an independently governed monotonic revocation decision.

## Physical acceptance

`scripts/ops/wsBetaR36PG16SourceComposer.py` creates a randomly named disposable `postgres:16.13` container on the Mac `127.0.0.1` loopback only, applies **review-only** R32, R33 and R35 fictional schemas (no production migration), and uses the existing fsync-protected encrypted file vault.

- Initial true PG16 transactional tests: **13/13 PASS**. Includes prewrite intention sequencing; interrupts before/after ciphertext; same-claim retry; 2 simultaneous writers; no retroactive intent after unregistered already-published Work; foreign or forged claims; current signed Work revocation; unreferenced encrypted orphan never assigned/deleted; no plaintext Source/provenance in SQL.
- A sixth invented Work is intentionally left with an owner-verified R32 ciphertext and immutable R35 intention but no R33 final state/observation. PostgreSQL container is **restarted in a controlled way**, then a **new Node process** reopens the same fictional AES keys and signed evidence from a separately marked temporary same-Mac test-only key file and completes the existing exact Work. **6/6 PASS** with exact original bytes/text/private provenance and no extra Work copy, even on repeated recovery. Foreign member/wrong Work key and altered claim refuse.
- The entire *fictional* PostgreSQL dump and all **25** encrypted vault objects lacked the invented Source/plain filename markers. A loose fictional orphan remained unclaimed and unremoved **until disposable fixture teardown**, not treated as authenticated custody.
- Final driver checks: PostgreSQL 16, localhost-only network, runtime tests, ciphertext-only checks, controlled restart, fresh-process recovery and exact disposable fixture removal all **PASS**. Temporary Docker test container/anonymous volume, encrypted vault and fictional key material removed. No actual member, real KMS, mail or MAIA provider call.
- New route/default-off unit tests **8/8 PASS**. Selected combined inherited Studio/Source/session/consent/custody/privacy tests **57/57 suites, 610/610 tests PASS** (including those 8 new tests). Strict scoped TypeScript **PASS**.

**Founder-private evidence:** `/Volumes/T7 Shield/ws-beta-release-r9-build-20261015/R36_PG16_HELD_SOURCE_COMPOSER_ACCEPTED_20261016.json`, `R36_PG16_COMPOSER_PHASE1_JEST_20261016.log`, `R36_PG16_COMPOSER_PHASE2_JEST_20261016.log`, `R36_SOURCE_DEFAULT_OFF_20261016.log`, `R36_SOURCE_SELECTED_REGRESSION_20261016.log`, and `R36_SOURCE_STRICT_TYPES_20261016.log`. Earlier R36 HOLD receipts remain for engineering history.

## Nonwaivable launch limitations

- **Not a production route:** no actual browser auth cookie, real consent invitation, submitted original import or online Source claim was exercised. Existing real `recordArtifactArrival` and draft/editorial routes remain unmigrated.
- **Not a global legacy writer fence:** only the R36 held-only composer enforces intention-before-publication; unrelated R32, Source, draft or Apply/Undo call sites must be migrated/blocked, and all prior SQL/JSONB/WAL/export/log/backup/old-reader plaintext must be covered before real writers.
- **No cross-domain atomicity:** PG's advisory lock serializes this one fixture server, not an independently operated KMS/Work key/deletion ledger. An external revocation during a slow vault write is not physically serialized with this PG-only composer.
- **No verified crypto-erasure or unanchored orphan recovery:** pending keys and encrypted ciphertext deliberately remain until independently witnessed retirement. An R32 ciphertext without an SQL owner manifest stays HELD; arbitrary old backups or retained raw key could still decrypt offline.
- **Not independent disaster restoration:** test restart reuses one Mac's Docker volume, ciphertext vault and synthetic temporary signer/key, not another administrative domain, offsite file vault or nonrollbackable highwater. It was a controlled restart, **not** sudden power loss.
- **Not editor/browser acceptance:** genuine DOCX/PDF parsing and large (>8 MiB) chunked imports, R14 independently signed original provenance, exact Studio/Portal/MAIA Develop/Write/Review/Apply/Undo/save/export, physical Mac/iPhone Safari, member notice and approved non-Resend invite delivery remain incomplete. Global enforced production build and exact source/image rollback were not qualified by R36's scoped TypeScript.
- **Still founder authority required:** managed KMS/provider/operator, key and witness administrator separation, region, budget, retention and recovery policies, actual keys and erasure claims and distinct exact-source/image Class A production cutover all require explicit approval. No provisioning or production work follows from this local PASS.

**Next:** reconcile the separately developed R35/R36 editorial Source candidate under one **nonwritable, exact-source** branch with a combined auth/consent/Source/editorial/Portal browser qualification; separately prepare the real KMS and migration operator decision. Keep actual five-member beta CLOSED until the complete release and independent custody gates pass.
