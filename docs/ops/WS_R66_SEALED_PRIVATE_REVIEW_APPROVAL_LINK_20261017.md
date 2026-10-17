# Writer's Studio R66 — one verified encrypted private review tied to one spent author approval

**October 17, 2026 | Mac Studio | Isolated fictional PostgreSQL16/AES-GCM/Chrome/WebKit | Production and five-person beta HOLD**

## Exact source and design distinction

- Parent R65: `090765eb8f5d22f03d27017ab4138cbaed182a61`.
- Isolated worktree: `/Volumes/T7 Shield/ws-beta-r66-sealed-review-approval-link-20261017`, branch `fix/ws-beta-r66-sealed-review-approval-link-20261017`.
- R65 already opened the current R47 private AES-GCM proposal via the R57 actual fictional session, consent and Work checks, then used its exact text in R53/R46 Apply and a separately approved R47 Undo.
- R44 already stored a secret-keyed HMAC of the **entire** reviewed context and consumed an opaque author token exactly once. R48 could compare original ciphertext and the spent Apply **after** the fact.
- Missing boundary: the exact **R47 review ID and ciphertext digest** were not durably linked to the **R44 prepared author token** *before* Apply. A same-wording choice check is not immutable proposal-record provenance.

## R66 implementation (review-only; original services unchanged)

1. New `docs/ops/WS_R66_PRIVATE_APPROVAL_LINK_REVIEW_ONLY.sql` creates a separate fictional-only PostgreSQL16 `writers_studio_r66_held_private_approval_link` table. It is a **new review-only schema**, never a production migration. The primary key FK is the R44 prepared token HMAC; the unique R47 `review_id` FK links the exact verified private proposal. Rows retain member, manuscript, section, alternative, generation, consent sequence, R44 full-review HMAC, R47 secret-keyed review/consent HMACs, ciphertext SHA-256 and a distinct synthetic link HMAC. No prose, raw approval/session token, private key or model output is recorded.
2. The SQL insert trigger checks both sides are the exact **prepared R44 / verified R47** record, comparing owner, Work, generation, chosen section/alternative and their recorded HMAC/digest. UPDATE and DELETE always refuse. An R47 review cannot be silently reassigned to a second approval.
3. New server-only, unmounted `heldSealedApprovalBindingR66.ts` requires R66/R65/R64/R55 fictional opt-ins, `NODE_ENV=test`, marked localhost fake SQL/vault and compiled-OFF real-member flags. It uses R57 to recheck actual application session/consent/Source/Draft/Living Work, reopens the exact independently sealed R47 review, decrypts the original R35 Draft, and verifies the **original R44 full-selection HMAC** including unchosen alternatives.
4. Only after R53 creates a prepared one-use author-review token does R66 create the immutable link. Before a **separate browser Apply gesture**, R66 reopens/verifies the same current review and stored link MAC; the R53/R46 original durable signed Apply service itself remains unchanged. The synthetic R66 response is always `canApply=false`, `canUndo=false`, `releaseApproved=false`: it is an integrity witness **not** a writing authority.
5. The existing R54 Chrome/WebKit fictional browser fixture, original R35 encryption, R44/R46 Apply, separately approved R47 Undo, R48 replay/uncertain-commit recovery and all default-off real-member protections remain intact. R66 is a gated extension of the established R55 physical harness, not a new provider or a live Next.js route.

## Negative and positive physical acceptance

- Exact proposal link must be unique; a duplicate attempt is refused. A different R47 review ID and a forged link signer are refused, even if section and wording match. An unbound browser Apply token cannot qualify.
- After Apply, R44 is `spent`, R47 remains `verified`, the R66 link's token/proposal HMACs and ciphertext digest are unchanged, and a previous-generation proposal cannot become current again. Attempted SQL UPDATE and DELETE of the immutable link are refused.
- PostgreSQL records contain only metadata and keyed hashes; private and manuscript vaults contain ciphertext. No plaintext selected words, proposed wording, raw author token, fictional key bytes or private review text appear in the accepted scans.
- The original R54 browser fixture verifies the full reviewed change, Apply, reread, separately approved Undo and immutable restoration in Chrome and WebKit, four synthetic session/consent/Work checks per browser. R66 adds one prepared one-use record-to-record link per browser, not additional author actions.
- Forced PostgreSQL SIGKILL/restart and a fresh Node process still verify the spent claims and restored Work without duplicating encrypted revisions, followed by cleanup of **only owned** fictional containers and vaults.

Initial local physical evidence before commit: **38/38 R55/R64/R65/R66 physical/custody/cleanup checks PASS**, **33/33 active encrypted-author application tests PASS**, one original R48 separately gated test skipped, Chrome and WebKit each **32/32** author/UI assertions, zero off-host browser requests. This is **precommit evidence only**, not exact committed-source acceptance. R65 original behavior retested separately **34/34 PASS** before commit.

## Release HOLD and remaining independent duties

- **No operational independent signer/KMS**: both R44 issuer key and R66 link HMAC key are distinct but fabricated in the **same local test process**. R66 is not a separately administered, monotonic freshness/revocation/deletion witness.
- **No cross-system atomic Work commit**: SQL linking an R47 proposal to an R44 prepared token before Apply is not an atomic, independently witnessed R29/Work-key lease, current consent, key revocation and actual ciphertext publication transaction. Uncertain commit outcomes stay held and non-retryable.
- **No genuine Next.js browser author POST**: tests use R54's accepted local author fixture, not the real mounted `/writers-studio` production writer route. The live R54 panel stays compiled OFF; the Next protected readiness endpoint stays read-only/423.
- **No migration or broad deployment**: historical plaintext Source/Draft/Keep/MAIA SQL/WAL/log/backup/replay/exports/rollback readers, independently qualified offsite restore, signed build, physical iPhone and Mac Safari, security review, founder controlled two-writer then five-writer admission remain unresolved. The whole shipping TypeScript baseline previously had 184 inherited errors and cannot be waived.
- **Parallel source**: R67 Vision/Source improvements occupy a separate reviewed worktree, not automatically contained in this R65-derived integration. Do not silently merge them or overwrite protected source.

**Disposition:** isolated R66 local acceptance candidate, real members/production/five-writer beta **HOLD**. No real accounts, paid model or KMS requests, cloud database writes, GitHub PR/push, invitation, or deployment.
