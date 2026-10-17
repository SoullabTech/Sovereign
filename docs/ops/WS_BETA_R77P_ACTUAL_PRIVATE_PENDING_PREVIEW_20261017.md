# R77P — Actual Studio read of a confidential *pending* fictional proposal

**2026-10-17 · Mac Studio · isolated disposable Next.js + WebKit + PostgreSQL 16 · member beta HOLD**

## Parent and narrow goal

R77P is a clean, separate worktree based exactly on R76
`8629159b32943b1c8cf4c8999ef27d734c20158c`. It bridges R76's
server-only encrypted *prepublication* candidate into the real, authenticated
Writer's Studio read experience. Its scope is explicitly fictional and it
introduces neither MAIA model execution nor an author Apply transport.

It does not reimplement the R71/R72 protected member-authored editing chain:
the real WebKit regression still tests Import → Write → Review → History →
member-authored proposals → explicit Apply → separate Undo → revocation.

## Actual Next/WebKit experience

The existing PC3 manuscript editor carries a narrow, default-off
`R77pConfidentialPreview` under the local-only fictional flag. After a writer
selects an exact passage, the panel clearly states **No MAIA model was called**.

1. A separate author click asks Next to seal a predetermined *server-held*
   fictional sample. The request carries only a session-authorized manuscript
   and section identity and `kind`; it cannot supply proposed wording,
   model, provider, Work key, approval or authored-by label.
2. Next reads the actual current `auth_sessions` member via the existing
   session verifier. The existing R72 beta notice and latest current consent
   gate checks the fictional active member and exact owner/section/draft.
   R76 creates a new random candidate identity, authenticates and encrypts
   the fixed sample with AES-256-GCM, verifies R75's synthetic server-signed
   response attribution, and writes **only ciphertext and witness metadata**
   to the temporary PG16 fixture table.
3. The initial response carries only an opaque pending candidate identifier
   and explicit non-authorization; no suggestion text.
4. The writer explicitly clicks **Read sealed fictional suggestion**. The
   server first SELECTs **owner-scoped metadata only**, refusing other members
   as 404 without exposing whether they have beta consent. It then verifies
   current beta consent, current owned draft/section/generation, cipher
   integrity and signed server witness before decrypting and returning the
   confidential wording. The response is `private, no-store` and the panel
   explicitly displays **Apply unavailable**.
5. The other browser remains unable to see the private candidate, an altered
   draft closes historical preview (409), and later consent revocation
   closes private preview (403). The old plaintext editorial endpoints stay
   held at 404; protected member-authored Apply/Undo remain separate.

A first v1 browser run proved the genuine seal/read but revealed that testing
an unrelated member yielded 403 because the consent gate ran before
owner-scoped metadata lookup. This was corrected **without selecting private
ciphertext first**. The v2 run demonstrates owner privacy (404), actual
authenticated read, provider/meta injection refusal (400), moved draft and
revoked consent. The original failed receipt is retained rather than
rewritten.

## Test-only key handling

The Python physical runner mints an entirely new synthetic Ed25519 signer,
32-byte content-authentication key and 32-byte AES Work key for *every*
unique disposable run. It forwards those fake keys only into the
loopback-bound Next test process. No production .env, credential, actual model
service or hardware KMS is accessed. Keys are never stored in receipts,
exposed to browsers, emitted to logs or deployed. The fixture-enabled R76
service refuses an arbitrary development process unless the complete R77P
fiction-only flags and exact `fict@127.0.0.1` database are present.

The sole extra schema is the already isolated
`scripts/ops/fixtures/wsR76PrivateCandidate.sql`, still **outside all
production migrations**. The real manuscript, section-aware draft, beta
consent and immutable member-authored proposal schemas are original source
migrations applied to a disposable PostgreSQL16 instance.

## Precommit acceptance and release interpretation

- Actual Next.js + WebKit: **83/83 browser assertions** passed.
- Independent PostgreSQL16, session, current-consent, privacy, writer-version,
  original Source, one-use Apply/Undo and cleanup checks: **66/66** passed.
- One encrypted private pending row and **zero** MAIA-published versions; no
  authored manuscript bytes were altered by the pending suggestion.
- Fake-model/provider/text injection, cross-member read, stale draft read,
  spent author-action replay and revoked consent all refused.
- No off-host browser requests or external model calls. The Next server,
  Playwright WebKit and individually owned disposable SQL container shut down.

Evidence: `/Volumes/T7 Shield/ws-beta-r77p-private-preview-precommit-v2-20261017/`.
Additional independently rechecked evidence: inherited R76 encrypted-custody
**13/13 physical** and **13/13 Jest**, the original R76 Writer/author custody
**112/112 selected suites, 1,175/1,175 tests**, and scoped R77P TypeScript
**PASS**. The full shipping TypeScript audit has **113 existing diagnostics**,
exactly the same set as R76 after worktree-path normalization, with **zero new
errors**. This is not a passing production shipping build.

This is precommit evidence; requalify the exact committed source separately
before marking R77P complete.

## Remaining release stops

This is **not** a real MAIA review, provider call, published editorial offer
or production encryption rollout. The static fictional response is server-held
only for acceptance. A genuine MAIA response needs explicit member consent
for provider input, trusted runtime/provider attribution, restricted
confidential publication without deceptive `proposal_versions` placeholders,
and a separately gated exact author review and one-use Apply transaction
after current owner/consent validation. No automatic promotion from pending
candidate to authored proposal is permitted.

Verify conventional production DB/WAL/Source/Draft/legacy/audit/backup
encryption with cold/offsite restore, fix the inherited whole-app TypeScript
shipping diagnostics, qualify real Mac Safari and physical iPhone Safari,
and admit two founder-authorized canary writers only after an approved
notice and exact release custody. Optional sovereign independent KMS remains
a later upgrade for ordinary writers; no already stronger-protected Work
should be silently downgraded.

**Disposition: local-fictions-only protected preview ACCEPTANCE CANDIDATE,
production and beta HOLD; no model calls, credentials, real member data,
GitHub push, merge to protected branch, deployment or tester invitation.**
