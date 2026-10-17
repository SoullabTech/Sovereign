# Writer’s Studio R57 — current member session and separately encrypted editorial review

**October 16, 2026 | Mac Studio | Local fictional acceptance only | Production and five-writer beta HOLD**

## Why this convergence is necessary

R55 exact source 8e179c1452e9ad25844824bd39b5ee2370d93769 preserves the actual Next.js Writer's Studio and PC3 controls, the R54 encrypted Apply/Undo fictional browser, the R52 precise rendered-passage selector, and the accepted R47 separately encrypted private editorial witness.

R56 exact source 9ca120a7100e80a922a1ac247d6c50065a26ff11 independently checks the application's actual auth_sessions credential verifier, current tester eligibility and consent, protected manuscript Source and Draft, and member-declared Living Work. It is read-only.

The clean R57 two-parent merge 1a8942ec14d0e877fd4a0b7ed6f2a6d79f0daead preserves both without modifying their worktrees. The missing private-editorial module that blocked a test in R56's older base is already in the accepted R55 tree. Its exact service blob matches the accepted separate R47 private-review history; no duplicate replacement was introduced.

R35's stored Work ID is the member_manuscripts UUID, not the distinct living_works UUID. A manuscript can legitimately belong to several declared Living Works. R57 must check the specific member-owned declaration, never guess the first match.

## R57 implementation

New source: lib/writersStudio/recovery/heldRealPrivateEditorialR57.ts.

R57 is an explicitly OFF, server-only, read-only service for opening a previously encrypted R47 editorial choice under the R56 session and Work boundary. Its private keys, session-binding root, review ID, member-scoped custody and Work authority must be provided by a trusted server process, NEVER from a browser payload. There is no new Next.js API route.

The fictional flow:

1. Require all relevant real-member constants compiled OFF, exact fiction-only flags and localhost-only disposable PostgreSQL/vault roots. R56's previously accepted vault path was extended for exactly the R57 disposable vault pattern and an additional explicit R57 marker. No broad path waiver.
2. Verify the R47 synthetic session-binding HMAC against the very same credential which R56 validates against actual auth_sessions, with no URL query token accepted on a Writer POST.
3. Ask R56 to check exact current member, active invited tester, exact approved notice, latest immutable accepted consent event and sequence, member-owned manuscript, R32 Source ledger presence, R35 current Draft head and specifically declared Living Work.
4. Refuse if R47's separate private proposal owner, manuscript ID, current generation, notice digest or consent sequence disagrees.
5. Open the ORIGINAL R47 AES-GCM private ciphertext service, checking signed fictional deletion highwater, separate private and Draft key, immutable manifest, cipher SHA, exact R37 section/alternative and encrypted prior Work. A reserved-only, interrupted or corrupt private record cannot become a preview.
6. Ask R56 to revalidate the real session, consent epoch and Work/head state AFTER decryption. If the member withdraws consent or the Work advances while reading, refuse and do not return private text.
7. Return only the authorized preview's original/proposed passage, section and alternative identity, with canApply=false, canRestore=false and releaseApproved=false. Never invent an Apply token, modify the manuscript, retry a spent approval or delete an orphan.

The post-decrypt check is NOT an atomic cross-process consent/key/commit fence. A later production R46/R39 Apply must still bind actual author intent, current Work, notice, signed independent Work key and revocation authority within its protected commit.

## Physical testing on invented data

A new local script scripts/ops/wsBetaR57PrivateCurrentSessionPG16.py creates a disposable postgres:16.13 database on 127.0.0.1 and an fsync AES-GCM vault. It combines actual application auth_sessions and beta-consent SQL, two deliberately distinct member-owned Living Works, the R32 original Source ledger marker, R35 encrypted Draft and the R47 private sealed proposal, in ONE fictional PostgreSQL instance.

The added R47 test verifies a private proposal can be decrypted for the current session and matching Work, can be reopened under either legitimately declared Work, and is withheld for foreign/undeclared Work. A later immutable consent revoke stops the preview while the protected proposal and original Draft remain unchanged.

Precommit qualifications:

- 9/9 PostgreSQL private editorial, encrypted R47 witness and new R57 session/consent tests passed.
- 5/5 fresh Node process plus PostgreSQL restart tests passed.
- 15/15 physical storage, cipher integrity, privacy scan and disposable cleanup checks passed.
- 27/27 separate R56 actual-session PostgreSQL checks passed on the merged source.
- 30/30 R56/R57 focused refusal tests and strict scoped TypeScript passed.
- 84/84 selected Studio/Source/privacy/consent/private-editing/ownership suites passed, 887/887 tests. The formerly missing-module browser-source test is INCLUDED and passing.

Evidence root:
/Volumes/T7 Shield/ws-beta-r57-real-auth-pc3-evidence-20261016/

These are local **fictional precommit** observations; exact-commit acceptance must be rerun separately. The R32 fixture records Source custody metadata only, not an independently decrypted original Source. Synthetic same-process keys are NOT operationally independent KMS or offsite restoration.

## Nonwaivable release stops

Real Next.js PC3 remains read-only in the R55 physical test, while encrypted Apply/Undo runs in the separate R54 fictional harness. The R57 current private preview is not mounted in an actual Next route and carries no Apply permission. Independent Work/Proposal key custody, durable proposal review across process loss, monotonic revoke/delete and commit fence, historical Source/Draft/Keep/MAIA plaintext and SQL/WAL/backup/rollback migration, a full clean shipping Next image, genuine Mac/physical iPhone Safari, offsite restore, security review and separate founder exact-image/two-writer canary approval remain missing.

**Decision: R57 held current-session plus private encrypted review qualified for further isolated integration. Five-person production beta HOLD. No real member edit, GitHub push, KMS activation, provider or mail call, or deployment.**
