# Writer’s Studio R43 — Accepted Source, native selection, one-use author-choice gate

**October 16, 2026 | Mac Studio isolated worktree | Fictional only | Five-tester launch HOLD**

## Product decision and source authority

Preserve the **actual** Writer’s Studio and its PC3/V10 author, Work identity, MAIA relationship and reversible editorial behavior. Do not replace it with the separate appealing R40 fixture. The writer must be able to choose an exact passage (including the second identical occurrence and Unicode emojis), view two to four independent options in context, consent to one edit explicitly, and find the same Work and structural sections after Save, Undo and return.

The accepted **late ordered R36 Source composer** is commit 079fcfb5f48c559701596882af751d7c1bd1b6f1, present through the R42 accepted branch. The earlier one-shot Source prototype 4929eac is not the authoritative Source composer in this R43 convergence.

R43 source ancestry:
- R42 accepted ordered Source → protected encrypted Draft → Apply/Undo and restart: 5198b6e337e9307e385b7ac7471c957d0fc14968
- R41 exact selected passage and Reset widths in the **canonical** Editor/Shell: 626ba44e39394c7e0bd2f08c8f3ee2ea7425c11e
- Conflict-free, dual-parent local integration: d49b4cc98fe6e16ddb1be37936f1c8115cc2e745

New isolated branch: fix/ws-beta-r43-accepted-source-native-studio-20261016, worktree under /Volumes/T7 Shield/ws-beta-r43-accepted-source-native-studio-20261016. Both parent branches remain intact. No push, release/main merge, production deploy, provider call, schema migration or real-member access.

## Added one-use author-choice gate

New review-only service: lib/writersStudio/recovery/heldAuthorChoiceR43.ts.

1. **Before preview:** check the existing R17/R38 stored member session, exact invited beta role and latest consent event. Reopen the member-owned exact R35 encrypted draft at the requested revision under separately supplied fictional custody. Ask the existing R37 verifier to approve the section identities/order, whole-Work and section digests, Unicode-safe selected passage location and one of the distinct available alternatives.
2. **After preview:** expose original/proposed words to that verified fictional author and issue a cryptographically random opaque 256-bit approval token. The server keeps the token digest, frozen selection, Work, member/session binding, exact accepted notice and immutable consent-event sequence. The registry is process-local, size-bounded and expires tokens after two minutes. Neither token nor structural response contains manuscript prose, raw key material or private filenames.
3. **On author Apply:** receive a closed, same-origin JSON request containing only the chosen action and opaque token. Require the same author, session, consent notice/event, Work, action, generation and nonexpired token. Consume the token exactly once **before** attempting any downstream write.
4. **On protected write:** reconstruct exact R37 selection/gesture/idempotency on the server, then delegate to the existing R39 signed request authority. R39 independently rechecks current member/consent across provider latency and inside its fictional Work fence. R26/R29 signature/highwater checks, R37 section validation and R35 AES-GCM immutable Work history remain binding. The consumer refuses an unexpected revision receipt.
5. **Undo:** issue a distinct short-lived Undo token only after a matching signed Apply receipt. A separate explicit author request invokes R39/R37 restoration as a new encrypted Work version. Reuse of Apply or Undo tokens refuses. A failed remote commit does not regrant the consumed token.

No public Next.js route imports the new service. All R41/R42/R39/R43 real-author activation flags stay compiled false. Exact fictional-only settings, localhost PostgreSQL with the fixture database and a disposable marked vault directory are checked before use.

**Critical limitations:** A same-origin POST is a checked user-interface workflow gesture, not proof that a biological person clicked. A process-local token registry is not a durable cross-node replay authority. A crash between consuming an approval and finalizing encrypted history requires separately governed recovery. The upstream future caller must derive proposals from the protected server Work rather than trusting browser-provided text. This work does not install independent operational KMS, real session attestation or author enrollment.

## Test evidence, local fictional-only

- R41/R42 first source merge: 47 passing suites, 436 passing tests; 1 existing skipped test. Scoped R41 and R42 TypeScript passed.
- New R43 one-use unit suite: **16/16 PASS**, including no-before-preview Apply, replay, token confidentiality, current consent withdrawal/sequence change, wrong member/session/Work, forged request shape/origin, expiry, stale selection, separate Undo authorization and failed signed commit.
- R43 actual isolated PostgreSQL16 R39 adapter acceptance: **23/23 application tests and 10/10 infrastructure/privacy/cleanup checks PASS**. A real fictional auth_sessions-backed writer, synthetic signed R26/R29 lease and Work fence, precise R37 multi-section edit and R35 fsync/AES-GCM immutable history participated. One-use Apply/Undo passed and consent withdrawn **during** key-issuer latency prevented any new ciphertext generation. Selected invented writing and raw action tokens did not appear in the tested SQL dump or encrypted vault bytes.
- Accepted ordered R42 Source-to-Draft-plus-editorial requalified against the combined R43 tree: **13/13 infrastructure/safety/cleanup checks PASS**, with its earlier recorded **11/11 initial PG tests and 5/5 fresh-process recovery** following PostgreSQL SIGKILL/restart. Original encrypted bytes, private provenance, section identity and history were retained and recovered.
- Actual R41 exact-selected-locus helper requalified using headless desktop and mobile **WebKit, 11/11 PASS**, including repeated selected phrases, emoji/codepoint offsets, stale-body and foreign section refusals, and zero external network requests. This is a browser DOM harness importing the canonical helper, not the entire authenticated production Studio.
- Combined accepted R42 regression population plus native R41 shell/selection plus R43 one-use: **67/67 suites and 711/711 tests PASS**. Strict scoped R41/R42/R43 TypeScript all passed.
- Repeatable combined runner: scripts/ops/wsBetaR43CombinedAcceptance.py. It requires exact fictional-only opt-in, a clean branch, checks out no other branches, rebinds only evidence outputs (without altering original R41/R42 receipts), runs the independent physical/browser proofs and creates a combined receipt for the exact committed SHA.

Private fictional evidence: /Volumes/T7 Shield/ws-beta-r43-author-choice-evidence-20261016/

These are **separate isolated fixture environments**, not one live authenticated Next.js Writer’s Studio journey. A fully qualified Source-to-Draft-to-signed-human-choice/Undo on the real domain has not been demonstrated.

## Nonwaivable release HOLD

- **Real author identity/consent:** independently validated current member cookies, verified same-origin browser request/CSRF, single-use durable multi-node author-choice and editor-to-Work binding. The R17 fixture x-session-token shortcut is not a public login pathway.
- **Operational independent encryption:** real administrator-separated Work-key issuer, monotonic nonrollbackable deletion highwater, external cross-node revoke/write fence, original+Draft+key offsite restore, pending-key retirement, orphan reconciliation and explicit handling of old copied raw keys. False claims of universal erasure are prohibited.
- **Historical plaintext and recovery:** legacy Source, working drafts, revisions, proposals, kept writing, provider logs, WAL, old backups/downloads and rollback images remain outside the encrypted path. Preserve edited continuous drafts and never fall back to plaintext on KMS failure.
- **Actual UI and devices:** bind the native PC3/V10 Develop/Write/Review and MAIA, original DOCX/PDF/TXT/MD import, author selection and suggested alternatives, three adjustable columns, semantic zoom, Undo, Save a Copy/Listen, browser refresh/return. Test authenticated Mac Safari and physical iPhone Safari, multiple restricted members and exact remote rollback.
- **Full release:** R42 previously had 193 inherited shipping TypeScript diagnostics; no clean enforced production image is claimed. Independent Class A custody/security witness, exact image/schema/backup restore, release-rollback safeguards and founder separate cutover/admission authorization are still required.

**Disposition:** Local R43 source/UI convergence plus fictional signed one-use encrypted author choice PASS. Five-tester launch and any live writer admission remain HOLD. No real member storage, AWS KMS, production API, mail, billing, deployment or GitHub push was changed.
