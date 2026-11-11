# LISTEN-05 — private portable backup, shared-auth integration hold

**Date:** October 24, 2026  · **Scope:** REVIEW ONLY. No live permissions, real-member storage, launch, merged source, provider API or artist content authorized.

## What changed since LISTEN-04

- An opt-in, **member-custodied encrypted export and restore**, stored as a JSON envelope on the user's device; it contains only the Listening Room playlist references and voluntarily written reflection, NOT commercial media, local audio file contents, streaming-service passwords or third-party OAuth tokens.
- WebCrypto PBKDF2-SHA256 with 600,000 iterations, fresh 16-byte salt, AES-256-GCM with fresh 12-byte IV, authenticated 16-byte tag, strict format/version/size gates, independent per-export randomness, fail-closed wrong-passphrase/tampered-file handling. Passphrase remains in the temporary UI state only, not network/browser storage.
- No changes to server schema, membership, routing, existing Voice/Writer sessions, cloud storage, App Router middleware, or source ownership.
- This is **NOT** a server-managed member vault, independently approved encryption implementation, third-party streaming license, or anti-resurrection recovery service. User forgetting passphrase means the app cannot decrypt their copy; independent security review and data export format governance required before a member beta.

## Important source integration findings

1. The current accepted repository baseline's `lib/auth/session.ts` checks a valid Cookie first and returns before comparing `x-session-token` header. If both credentials identify different members, this does **not** satisfy the founder-approved fail-closed concordance rule. The LISTEN page delegates to that shared boundary and must not enable member beta until the separately controlled shared authentication repair is actually integrated. Do NOT hotfix shared auth in this lane.
2. `components/mobile/MobileRouteGuard.tsx` gates native Capacitor routes using the `lib/mobile/mobileAllowlist` source. An unknown `/listen` is web-only for native iPhone. A separately authorized mobile route policy must be accepted before describing this candidate as an iPhone-native Listening Room.
3. No production Next.js dependency runtime is available in the local main checkout for a joined fictional Postgres/Next acceptance. Test traces of `app/listen/page.tsx` are isolated mocked imports only. A joined real-source build and device acceptance are still necessary.
4. Existing MAIA Writer audio uses `ws-stop-maia-reading` on a shared DOM document. LISTEN surfaces coordinate locally, but cross-route, cross-tab, spoken/audio-channel priority requires a tested platform audio-focus authority; do not describe current behavior as fully unified.

## Test evidence and boundaries

- `node --experimental-strip-types --test tests/listening/contracts.test.mjs tests/listening/private_backup.test.mjs` ⇒ **35/35 PASS**, of which seven validate encrypt, decrypt, unique salt/IV, tamper/wrong passphrase, downgrade refusal, oversized payload rejection and unsafe input refusal.
- `node --test tests/listening/page_authentication.test.cjs` ⇒ **3/3** isolated mocked session cases; NOT Next/PG.
- `node tests/listening/source_integrity.cjs` ⇒ **25/25** parsing/structural tests; NOT a type-safe full Next build or independent audit.
- `tsc --noEmit --strict --target es2022 --lib es2022,dom --module esnext --moduleResolution bundler --allowImportingTsExtensions lib/listening/*.ts` ⇒ PASS for all pure TS modules; TSX compatibility requires the real React/Next source-runtime dependencies.
- Browser WebCrypto witness attempted but this execution environment blocks navigation to all localhost/file/remote test origins (`ERR_BLOCKED_BY_ADMINISTRATOR`); **NOT QUALIFIED**. Real Safari/iPhone, long-form audio/DAC fidelity, encryption UX device test, deletion/restore/revocation, human source-owner signoff: **NOT DONE**.

## Next bounded admission

1. Single existing source owner acknowledges source branch and accepts/revises the LISTEN-05 isolated review delta.
2. Before any test member access, accept the shared session concordance repair and decide Capacitor /listen behavior (native or web-only) without adding an unauthorized route.
3. Separately review the encryption scheme with a cryptography/privacy reviewer and test browser/device performance, password-error recovery, VoiceOver, retention and accidental plaintext export.
4. Then qualify actual integrated Next server, signed fictional-account sessions and PostgreSQL restore/deletion on the exact candidate. Source-only tests are not a substitute.
5. Licensed original long-form composition masters and rights receipt authority remain blocked until legally accepted. Signed GO required before commercial or member deployment.

**DO NOT merge/deploy or enable `SOULLAB_LISTEN_REVIEW_ENABLED` from this record.**
