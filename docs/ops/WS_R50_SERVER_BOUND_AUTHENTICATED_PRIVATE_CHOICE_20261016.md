# Writer’s Studio R50 — Server-owned, session-bound protected author choice

**2026-10-16 · isolated Mac Studio R50 branch · fictional-only R17/R38 session + PostgreSQL 16 · real beta HOLD**

## Source and purpose

R50 is built from accepted clean R49 `bf57c6e0a749b6948c5ae7d6bb40feebec559719`, retaining the complete one-Work R36 encrypted original → R42 section Draft → R47 private choice → R44 durable one-use approval → R46 signed encrypted Apply → R48 ciphertext-confirmation → separate R47 Undo → forced PostgreSQL restart/cold reopening proof.

Previous R49 exercised the accepted R17/R38 fake verified member/consent path and manually passed the reopened R47 choice to R46 in a trusted Jest function. This proves the underlying cryptographic sequence but leaves an unsafe future integration temptation: accepting a browser-supplied section/alternative as an allegedly server-owned R46 `selection` parameter.

**R50 closes that test-to-server boundary** with `lib/writersStudio/recovery/heldServerOwnedChoiceR50.ts`, a default-OFF service that takes only founder-controlled server-held Work ID, verified private review UUID, exact source generation, distinct injected fake Work/private keys and fictional issuer root. The actual browser supplies either a cookie or Safari/iOS session token, and on an explicit POST only the opaque one-use author token. It supplies **no trusted identity, Work, text, section, alternative, selected locus, consent notice, generation, signing key or approval Boolean.**

## One-call trusted adapter contract

- Every preview/Apply entry first checks **R50_REAL_SERVER_BOUND_AUTHOR_ENABLED=false**, exact `R50_SERVER_OWNED_CHOICE_FIXTURE=fictional-only`, `R47`/`R46`/`R38`/`R35` fictional markers, disposable `postgresql://fict@127.0.0.1:PORT/r35_draft` and marked `ws-r35-physical-…/vault`. It has **no live Next.js API route** and is unreachable through real member HTTP.
- The server refuses untrusted member/Work/section/alternative/author-confirmed headers and the old `maia_member_id` claim cookie. It verifies `maia_session` (web) or `x-session-token` (Safari/iOS) through the repository's actual `auth_sessions` lookup; both presented with different token values refuse before any review decryption.
- A verified cookie-only session is **normalized server-side** to the R38 accepted `x-session-token` context only AFTER a successful live-schema-compatible session lookup. Then the existing R17 exact HTTPS `soullab.life` Host/path, active tester allowlist, and consent eligibility preflight is called. Its resolved member must exactly match the independently verified token identity. R38 independently rechecks latest accepted notice and consent sequence; no cached session/consent witness is reused between preview and Apply.
- After admission and only after it, R50 opens the **actual R47 AES-GCM encrypted private editorial selection** under the current Work owner, generation, separate private key and consent event, and calls R46 with **that exact recovered R37 section plan** and trusted server custody. The GET `prepareHeldServerChoiceR50` returns R46's fictional private review and issues the R44 one-use attempt token; the POST `submitHeldServerChoiceR50` accepts only JSON `{kind:"apply_reviewed_change",opaqueToken:"…"}` with a bounded body. Unknown fields, prose, altered section ID or browser-supplied author/grant claims refuse **before** R44 can be spent.
- R46 retains actual one-use PostgreSQL claim and R39/R29 verification across faux signer latency. The R50 wrapper never writes directly to R35 or bypasses R46; it returns the same structural, release-held outcome. A confirmed attempt is not real author provenance and cannot create independent KMS/consent authority.

## Acceptance contract

The new isolated Jest test `lib/writersStudio/recovery/__tests__/heldServerOwnedChoiceR50.test.ts` checks default-off/no route and refusal-before-I/O, cookie-only, header-only, both credentials conflicting, verified principal mismatch, stale consent, client identity/work/section/author claims, wrong Origin, oversized or invalid JSON, encrypted review denial and exact trusted selection forwarding.

The existing one-Work PostgreSQL driver and sequential R49 Source→review→Apply→Undo tests are retained with a new R50 opt-in and one extra negative application test. Crucially, the test calls **R50 adapter** rather than manually copying the encrypted R47 proposal into R46; one concurrent browser-shaped Apply uses the header transport and one uses the cookie-only transport. Their IDs, Work and protected revision are identical and R44 spends exactly once.

The first precommit disposable PostgreSQL16 physical run passed **6/6 initial one-Work application tests**, **6/6 restart/cold process tests** and **19/19 physical integrity/teardown checks**, with the genuine existing session verifier querying *fictional* `auth_sessions`, not actual accounts. The R50 unit negative suite initially passed **10/10**, then additional foreign GET Origin and client Work/author header refusals brought it to **12/12**. Strict scoped TypeScript PASSED.

**Exact-commit postcommit requalification remains required.** Retain precommit evidence and rerun the actual frozen source under a new exclusive evidence directory; do not claim precommit test receipts bind a different SHA.

## Nonwaivable limitations

- There is still **no connected production Writer Next.js route** or mounted `P4R1WriteEditController` calling R50. The verified account, notice, protected Work, signer, key and consent tests use invented database rows, invented tokens and fake local keys. No actual member or private writing was accessed or changed.
- A same-origin POST and opaque token is an authenticated **workflow request**, not a cryptographic proof that a specific biological author clicked Apply. Final product UX must witness the author's explicit review/selection/confirmation under a real member session without allowing MAIA or a background task to silently Apply.
- Operational independent KMS, revocation/deletion high-water, cross-node Work fence and offsite key/DB/ciphertext restoration remain nonexistent in this branch. R44 spend and R35 commit are not a remotely atomic transaction; R48 evidence can classify spent/saved but **never** authorize automatic replay.
- All historical ordinary/legacy Source, SQL drafts/sections/revisions, Keeps, editorial/proposals, logs/WAL/backups, exports and rollback/old-reader pathways remain plaintext-capable until separately migrated with **no fallback** if KMS fails.
- A full authenticated browser-to-editor journey on Mac Safari and physical iPhone, complete import/Develop/Write/Review/MAIA/semantic zoom/columns/Listen/Save a Copy, clean shipping TypeScript, enforced signed image, independent Class A review, source/image custody, founder GO and per-member two-person canary authorization remain blocked.

**Decision: HELD synthetic staging integration, beta HOLD, production unchanged.**
