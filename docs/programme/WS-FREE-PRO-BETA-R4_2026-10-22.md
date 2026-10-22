# Writer’s Studio Free + Pro — R4 signed R20 receipt research

**22 October 2026 · exact-source review candidate · DRAFT / HOLD**

## Founder experience preserved

Every individually admitted Writer’s Studio beta member will receive the complete *approved* Pro creative/editorial experience at no charge. Free continues to include inspiration, writing, foundational MAIA/Academy, author ownership, consent, deletion and essential export. Paid Pro is optional depth; it must not become permission to access another writer’s Work or to bypass a held manuscript operation.

R4 does **not** create or enroll a real writer. The public Free/Pro enrollment, payment, R20 source-custody and original-manuscript import/PDF/EPUB approvals remain OFF. Nothing in R4 is a production release permission.

## Exact bounded source

- `lib/writersStudio/pilotR20ReceiptProtocol.ts` — static TypeScript verification of two independent Ed25519 signatures. An ACTIVE decision must have the same verified member/grant, audience, current 32-byte nonce, signer key ID, short lifetime, and a monotonic minimum epoch.
- `lib/writersStudio/__tests__/pilotR20ReceiptProtocol.test.ts` — success and negative controls using only ephemeral in-process Ed25519 keypairs. No real private keys are written, sent or checked in.
- `scripts/writers-studio/r20-fixture/FixtureR20Authority.ts` — **fictional** PostgreSQL-only authority state and in-memory signer; does not have independent WORM or approved recovery custody.
- `scripts/writers-studio/r20-fixture/pilotR20R4Proof.ts` — planned three-independent-database `pg_dump` / `pg_restore` rehearsal; only fixed fictional loopback DB ports may be used.

The existing production-bound `lib/writersStudio/pilotR20Authority.ts` is deliberately unchanged and **always refuses**. A locally valid research receipt cannot unlock any member’s real Writer Pro account.

## Threat model and what is actually proved

The R3 proof demonstrated a real danger: restoring a pre-revocation PostgreSQL snapshot recreates an `accepted` grant. R4 narrows the independent authorization protocol:

1. **No one-vote Pro:** require two distinct pinned issuer identities and two distinct Ed25519 public keys; a reused key/issuer cannot count twice.
2. **No stolen grant handle:** bind both signatures to the same member UUID and immutable grant UUID; reject someone else’s grant.
3. **No replay:** require a fresh random challenge, reject stale, future-dated or expired signed decisions.
4. **No signature substitution:** reject wrong issuer, key ID, audience, altered claims, malformed signatures and unknown fields.
5. **No silent rollback:** require a separately *trusted* revocation high-water epoch from a domain that is not restorable along with either signer.
6. **No duplicate signing identity:** compare normalized Ed25519 SPKI key bytes, not raw PEM text. Differently formatted encodings of the same key cannot masquerade as two independent signers.

### Important negative result

**Two signatures alone are NOT enough.** If *both* signer databases are restored to old pre-revocation state while their signing keys remain valid, they can issue two newly signed ACTIVE receipts for a grant that should remain revoked. The R4 unit tests intentionally reproduce that unsafe acceptance. Supplying a correctly held high-water epoch rejects it.

That trusted high-water floor is an **unimplemented production prerequisite**, not a boolean flag. It must survive rollback of both signer data stores and their application images.

## R4 evidence boundary

**24/24** signed-receipt Jest tests passed, including deliberately negative tests for compromised or restored state and equivalent differently formatted public keys. The proposed three-PostgreSQL replay was prepared but **has not been executed successfully** in this workstream. No claim of real three-database integration or independent signed live custody is made.

The R3 separate-PostgreSQL evidence remains 51/51, R3 focused tests 56/56. R4 combined regression and exact source commit will be recorded after the source is committed; no real account or key is part of these tests.

## Remaining mandatory Class A proof

- Select and independently verify physically separate key custody, rotation and authenticated signer delivery; no process-memory keys or ordinary SQL backup can be the production signing authority.
- Verify the revocation floor against an external sealed/append-only checkpoint. A trusted source must attest the current epoch; a `minimumEpoch` field taken from the restored member DB is not trustworthy.
- Persist revocation and obtain sealed acknowledgement **before** removing the Writer grant; fail closed during partitions or any partial commit.
- Test restore of the member DB, one signer DB, both signer DBs, old application image, and checkpoint credentials across two fictional writers. Prove no third canary seat after deletion.
- Bind independently reviewed online receipt transport to the real Studio operation gates without altering ownership, self-service deletion, or R20 held PDF/EPUB/Source protections.
- Complete the qualified Writer P4R1 integration, real account verification, physical Safari/VoiceOver, independent reviewer, and founder exact-image release go/no-go.

**Disposition: no change to production access, email, payment, beta roster or manuscripts.**
