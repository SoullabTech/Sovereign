# LISTEN-06: source-derived browser encryption and shared-auth admission gate

**2026-10-24 · EVIDENCE ONLY · PRODUCTION/BETA HOLD**

## Reviewed source identities

- Before this evidence amendment, Listening Room review head: `438184df1c66ba5479782df6ce9eaf50e122ac04`.
- `lib/listening/privateBackup.ts` SHA256: `74056afdf14d7146e2cff48ce7037e1ef3e6e3d404445e55e7b426db89bc61b1`.
- `lib/listening/portableCollections.ts` SHA256: `e9f0b934b71c38c89b00df61326573c33ae39bf6318c00aa2a3305bf16742c86`.
- Shared `clean-main-no-secrets/lib/auth/session.ts` SHA256: `6e37552f56410dd1e045d570d93b0421aa29a62bf79024b947fc4ac7ee7a20d4`.

## Headless system Chrome on founder Mac Studio: 8/8 PASS

Original two TS source modules downloaded into a temporary `/private/tmp/soullab-listen06-*` test directory, stripped with Node 22's TypeScript syntax stripping, run together without changing logic. A temporary `file://` secure context in real headless Google Chrome performed browser WebCrypto, with Puppeteer managing completion. No real members, cloud tokens, provider audio, external network requests, server or database.

Eight PASS checks: secure context and `crypto.subtle`; no plaintext note/playlist in encrypted envelope; fresh salt and IV; encrypted backup round-trip; incorrect passphrase refused; tampered ciphertext refused; short passphrase refused; malicious provider-link metadata refused. Instrumented browser network: **zero nonlocal requests**. Tiny fictional fixture took approximately **215 ms** across test actions on this Mac; not a playback performance or encryption benchmark.

**Does not qualify** React component UI, HTTPS deployed origin, iOS Safari, assistive accessibility, crypto audit, cross-device synchronicity, KDF brute-force economics, deletion/recovery or restored private member records.

## Live shared source authentication contract: 5/8 PASS — THREE BLOCKERS

Repeatable isolated executable: `node tests/listening/shared_auth_concordance_witness.cjs` (Node >=22). Reads the actual shared session source with fictional token and database-response stubs, without using actual sessions. Current `clean-main-no-secrets` source results:

| Fictional request | Expected | Actual | Result |
|---|---|---|---|
| Cookie A only | A | A | PASS |
| Header B only | B | B | PASS |
| Cookie A + header A | A | A | PASS |
| Cookie A + header B | AUTH_REQUIRED | A | **BLOCK** |
| Invalid cookie + header B | AUTH_REQUIRED | B | **BLOCK** |
| Cookie A + invalid header | AUTH_REQUIRED | A | **BLOCK** |
| Both invalid | AUTH_REQUIRED | AUTH_REQUIRED | PASS |
| Neither present | AUTH_REQUIRED | AUTH_REQUIRED | PASS |

Founder's approved policy is consistent fail-closed identity when **both** credentials are supplied; do not substitute first-valid precedence. The LISTEN page currently delegates to `requireMemberId`, so it inherits that unresolved Class A exposure if enabled. This workstream **must not patch shared auth independently**; existing platform source owner must accept/verify a shared correction. Related: [#1877](https://github.com/SoullabTech/Sovereign/issues/1877), [#1800](https://github.com/SoullabTech/Sovereign/issues/1800).

## Repeated isolated contract tests

- `node --experimental-strip-types --experimental-loader ./tests/listening/ts_resolution_loader.mjs --test tests/listening/contracts.test.mjs tests/listening/private_backup.test.mjs`: **35/35 PASS**.
- `node --test tests/listening/page_authentication.test.cjs` with test-time TypeScript resolution: **3/3 PASS** (mocked Next route; not real PostgreSQL).
- `node tests/listening/source_integrity.cjs`: **25/25 PASS**.
- Bare Node ESM without the **test-only** TypeScript resolution loader fails extensionless imports; the configured test invocation is the passing witness. No production loader modification.

## Acceptance and limits

Only new **review-only documentation and a read-only regression witness** are added to this branch. No existing protected shared runtime code modified; no source merge, deployment, admission flag, CI promotion, user/partner contact, schema migration, expenditure or enrollment.

Before member access: accepted shared cookie/header concordance fix (all eight plus actual Postgres and Safari), explicit Capacitor route decision, actual Next authenticated route with fictional accounts, independently reviewed private storage/deletion/restore and signed music rights, full encrypted-backup UI / mobile / VoiceOver tests, real long-form licensed audio and founder approval. Keep `SOULLAB_LISTEN_REVIEW_ENABLED` disabled.
