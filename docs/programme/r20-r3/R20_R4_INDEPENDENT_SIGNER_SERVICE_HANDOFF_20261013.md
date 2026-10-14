# R20-R4 — Independent signer service: executable boundary and provisioning handoff

October 13, 2026 · Founder-led Class A engineering candidate · **NOT INSTALLED / NOT PRODUCTION AUTHORITY**

## The distinction we must keep intact

R20-R4 has a genuinely separate OS process with an authenticated local Unix-domain socket, durable synthetic signatures and a recovery-proof interface. This is useful engineering evidence. It is **not** yet an independent signer in the constitutional sense: the three Ed25519 signing roles, protected fixture files, mock high-water witness and disposable recovery client share the Mac Studio, administrator and storage. The service's own receipts state physicallyIndependentSignerCertified=false and productionPromotionAllowed=false.

Founder direction: continue without appointing a second human reviewer. This changes review staffing, not the requirements for independent verifiable signing custody, rollback resistance, deletion provenance or safe recovery. Do not reinterpret a local fixture PASS as production permission.

## Exact isolated source and tests

Parent: R20-R3J local source commit 45379b80f1610c4480855edebd80881962080427.
Branch: feature/r20-r4-isolated-signer-20261013.

Added:
- lib/recovery/r20-r4/signerProtocol.mjs — narrow canonical Ed25519-signed outbox protocol, nonce, sequence, prior signed HEAD digest, exact capture-graph identities, bounded Work root, no prose.
- lib/recovery/r20-r4/fixtureSignerEngine.mjs — process-owned signer interface; three distinct Ed25519 fixture roles; persistent replay and high-water mismatch refusal, recovery-proof reader authorization, no arbitrary-sign endpoint.
- lib/recovery/r20-r4/fixtureSignerClient.mjs — AF_UNIX-only client rejecting drive and remote host paths.
- lib/recovery/r20-r4/fixtureAuthorityBridge.mjs — obtains fresh signed proofs from the separate process and supplies them to R3I's double-checked synthetic restore-publication fence; independently supplied committed-outbox census still required.
- scripts/ops/r20-r4/fictional-signer-daemon.mjs — ephemeral local child process, fixture-directory and file-mode checks, authenticated input, strict request-size/timeout, serialized operations, no TCP service or daemon installation.
- tests/constitutional/r20-r2/r4-signer-service.test.mjs — focused end-to-end child-process tests and ephemeral keys, complete cleanup.

Test witness: **25/25 new R20-R4 checks PASS; 164/164 aggregate R20 Node checks PASS; zero failures.** Tests include forged/unsigned deletion refusal, unrecognized identity and text-bearing input refusal, repeat nonce and stale-sequence refusal, concurrent same-sequence serialization, authenticated recovery proof verified against signed HEAD+pin and a separate committed-outbox fixture, HEAD/high-water loss refusal on daemon restart, durable state across normal process restart, restore publication refused when a newly signed deletion arrives after initial staging, and zero private-key bytes released over the API.

**Synthetic-only limitations:** The test harness creates an ephemeral keyring in a mode-0600 test file under a mode-0700 temporary directory. This is NOT an HSM/secure enclave/KMS. The high-water witness is on the same physical host. The outbox author's signature is proof of issuer-key possession, not independently proof of authenticated member intent or an actual PostgreSQL committed transaction. The restore lock is injected test code, not a production atomic fence.

## Target deployment trust boundaries — specification, NOT deployment grant

1. **Independent node:** Choose an existing separately administered system outside the Minisforum PostgreSQL, Synology, Mac Studio, Source vault and backup failure domain. The existing VPS, currently shown offline on the secure device network, or another already-owned isolated computer is a candidate ONLY after security/custody qualification. Do not use the Synology backup volume or Mac Studio fixture as an independent signer.
2. **Key custody separation:** Ledger signing, signed HEAD and monotonic pin need independently protected custody and distinct trust anchors, ideally a managed signing device or service with a separately secured append-only high-water witness. No private signer key belongs in app source, the production image, GitHub, a normal SQL backup or on the Lexar. The encrypted LaCie GPG recovery key has a different purpose and must not be repurposed.
3. **Authenticated issuance:** Confirm the member's authorized Delete Work gesture and exact Work ownership server-side; commit a complete, atomic deletion/erasure outbox. Only a separately authenticated issuer, bound to the committed scope and a version-matched capture graph, may request an R20 signing act. Signed caller JSON alone is insufficient.
4. **Network controls:** A dedicated restricted signer identity, hardened distinct host, mutually authenticated encrypted transport, pinned server identity, role-scoped append and recovery clients, audited access, no public unmanaged endpoint. The local AF_UNIX test socket is not a remotely secured service.
5. **Nonrollback custody:** The current signed HEAD/high-water must survive restoration of older SQL, vault, NAS and workstation images. Refuse holes, replay, stale signed heads, unexpected key rotation, escrowed deleted-Work keys, loss of witness and signer failover without authority. No recreation at sequence zero after disaster.
6. **Work-level crypto erasure:** Original file Source, relational source_text, sections/drafts, derived readings, renders, staging, exports, WAL and historical snapshots must be governed by independently erasable Work keys before durable persistence. R20 tombstones do not retroactively erase old plaintext SQL archives. Do not report Delete Work complete until retirement and all replica obligations have been witnessed.
7. **Safe recovery:** Restore a coherent PostgreSQL-plus-Source generation into quarantine, not public services. Check the latest signed external authority and complete committed outbox, verify source hashes and all derived scopes; hold an atomic deletion-versus-publish fence through final visibility. Refuse if signing, key, Source or archive lineage is unknown.

## Held historical SQL and manuscript-vault work

Last authenticated Minisforum/Synology read-only inspection: 32 local and 27 NAS full gzipped SQL archives, the installed root NAS writer hash unchanged, both 02:00 schedulers configured, independent Source Docker volume present. NAS Recycle Bin and possible offsite/Time Machine copies are not fully censused. The old 2/2 original-artifact recovery receipt is NOT complete live Source coverage.

Before operational qualification: prove a separate node's true admin/signing/high-water custody and restart/rollback behavior against fictional data; complete NAS ACL/Recycle/offsite census and safe historical-copy disposition; bind real authenticated outbox, signer and per-Work key revocation; prove deletion-vs-backup/restore in isolated production-shaped PostgreSQL; obtain a **new, separately scoped founder authorization** for one actual encrypted complete database-plus-Source snapshot and isolated restore. Do not destroy currently needed recovery copies before replacement recovery is proven.

**STOP:** No service installation, host/network change, private-key import, member content, production backup, archive deletion/pruning, scheduler/ACL edit, drive content change, migration, merge or beta deployment. Founder-led engineering continues; physical independence remains unverified.
