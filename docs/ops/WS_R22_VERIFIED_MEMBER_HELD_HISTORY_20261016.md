# Writer's Studio R22 — reviewed session-to-encrypted-history integration (HELD)

**Date:** 2026-10-16. **Founder scope:** five individually admitted beta writers through `soullab.life`, not a public signup or independent beta-subdomain membership system.

**Parent:** clean R21 `42336d66078e4d7f881da3682a049aa9d160ce0a`.
**Decision:** R22 session-composition source tests PASS. **Real member writes, deployment and invitations = HOLD.**

## What R22 adds

`lib/writersStudio/recovery/reviewHeldHistoryServiceR22.ts` connects the previously separate R17 verified-session gate and R21 encrypted revision history with an isolated, server-only source adapter:

- Authenticates from the existing server `getMemberIdFromRequest` / `auth_sessions` path through R17's `reviewHeldWriterRequestR17`. R17 also calls the established writer-only beta allowlist, active beta contact, and accepted-consent gate. Neither R22 API takes a browser-supplied member ID nor does it promote a founder-only witness role into permission to author privately held writing.
- Requires exact HTTPS `soullab.life` host, dedicated proposed API path and same-origin browser POST, no generic domain proxy override. No endpoint currently calls it.
- For each append/reopen, asks an explicitly **fictional** test key-custodian interface for a scope-bound Work key and signed-deletion trust. Refuses mismatches in member, Work, version or read/write purpose, bad keys, missing checkpoint/signer/independent minimum and custodian failures. Production independent key/KMS/service is NOT installed; typed fixture injection is NOT external custody evidence.
- Passes only the verified preflight subject, accepted Work/generation, signed trust and pre-sealed WorkKey to the existing R21 encrypted revision backend. R21 remains responsible for owner row locks, historical digest chain, ciphertext-only SQL, AEAD, version collision and external deletion-highwater verification.
- Refuses incorrect request method, path, origin, session, invitation, consent and storage failure. Never exposes SQL errors, writer text or key material in its return errors.

`R22_REAL_MEMBER_HISTORY_ENABLED=false` is constant; normal production runtime cannot use this source. R22 additionally requires exact fixture-only environment flags for **both** its own adapter and inherited R21 backend. **No new real writer route, migration, live key-provider request, OAuth privilege, Caddy rule or public feature flag is installed.**

## Checks

- R22 focused integration-security unit tests **17/17 PASS**. These mock external session and custody adapters, but invoke the **real R17 source gate** and verify exact subject/scoping into a mocked R21 backend.
- Inherited selected Studio/access/security/custody/historical regression **38 suites / 450 tests PASS**.
- Scoped strict TypeScript `tsc -p tsconfig.r22-session-history.json` PASS.
- The actual PG16 R21 encrypted save/reopen physical test remains independently verified (14 checks, 10 negative controls, fixture-only) but **R22 was not itself qualified against a real end-to-end authenticated web browser or PG16 database in the same run**.
- A separate sibling R21 branch `4d0a0e102` has an independently exercised fsync/readback file-vault history prototype. It has **not been silently merged** into R22 because both sibling branches implement differing versions of the same `heldEncryptedHistoryR21.ts` API. The alternative must receive explicit interface, migration and rollback reconciliation rather than an arbitrary overwrite.

## Deficiencies which cannot be waved away by green tests

1. Deployed server-session-backed request acquisition and invitation/consent on the exact runtime (existing R17 uses verifiable auth, but R22 has no route and its tests are mock-composed).
2. An actual independently governed and revocable Work key/deletion authority, with nonrollbackable high-water witness, key registration/retirement and offsite recovery. An injected fixture object is neither a trusted KMS nor a substitute.
3. Migration of **all** ordinary Source, draft, section, revision, keep, authorizations and derived editorial JSON/exports/WAL/old backups to governed encrypted custody, with preserved pre-existing writer work, original artifacts and older-reader compatibility. R19/R20 found 11 direct content/history/private-provenance and 8 derived fields, plus additional unclassified candidates. No real writer migration is applied here.
4. Full actual PostgreSQL 16 + file vault + independent key/backup/restore/revocation/anti-resurrection qualification, and safe rollback to prior source and image.
5. Mac + iPhone Safari and Chrome full Writer's Studio + Portal + MAIA Develop–Write–Review/Apply/Undo/import/save/reopen/export review, approved beta consent and individually authenticated five-member roster and invitation transport.
6. Linux production host remains below the governed **60 GiB** prepare floor. No broad Docker/image/volume pruning is authorized.

**R22 advances identity integration but does not authorize uploading any real member manuscript or deploying to `soullab.life`.** Public R9 fictional-only canary and real production are untouched.
