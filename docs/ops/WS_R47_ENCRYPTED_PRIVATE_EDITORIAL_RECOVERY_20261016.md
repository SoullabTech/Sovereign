# R47 — Durable encrypted private editorial-choice witness (held)

**16 October 2026 · Mac Studio · Fictional-only acceptance · Real five-writer beta HOLD**

## Scope and authority

This R47 branch is separate from the independently active R47 durable Undo implementation and the accepted R47 legacy-writer-surface census. It descends from exact committed R45/R46 Source/UI/durable-claim-before-signed-Apply integration `5d0bafd5a9cb1353def83d607f6c4a7074d73bec`, preserving all R36–R46 inherited protections and production flags OFF.

The prior R44 one-use approval database intentionally stores **metadata-only HMACs**, not a durable copy of the private selected passage or alternatives. After a server crash, that HMAC alone cannot recreate a writer's reviewed proposal. R47 adds a separately encrypted, owner-and-generation-bound **private editorial review witness** without creating a manuscript edit, approval, or new member authority.

## New held service and schema

- `lib/writersStudio/recovery/heldPrivateEditorialReviewR47.ts` uses the accepted R35 owner-scoped encrypted draft reader and R37 exact section/whole-Work/passage/choice verifier. The R41 codepoint-safe selection can be used as input **only after a trusted server reconstructs it from the authored Work**. Neither the browser nor raw request text can create trust here.
- R47 requires a separate fictional **32-byte private-review key** with an ID and actual material distinct from the mutable R35 Draft Work key. Both keys require current signed deletion/Work authorization. A different key ID carrying duplicated raw Draft key bytes is refused. Production independent KMS is still absent.
- `docs/ops/WS_R47_PRIVATE_REVIEW_CUSTODY_REVIEW_ONLY.sql` is **review-only**, never a production migration. It records Work/owner/section/generation, private-key ID, keyed intention and review HMAC, keyed consent event binding, an opaque planned vault reference, state and ciphertext digest. It contains **no private prose or raw author token**. The SQL guard prohibits deletion, metadata edits and state rollback.
- Exact operation: verify current fake author/consent and encrypted R35 Work → R37 pure preview → insert immutable `reserved` review intention → seal selection, all alternatives and original/proposed words via AES-256-GCM into a classified private Work record with associated member/Work/revision identity → fsync and exclusively hard-link the sealed vault file → independently read/decrypt and verify choice HMAC → commit `verified` manifest/digest.
- Exact retries reuse the single prior SQL intention and never create another ciphertext. A crash after SQL intention but **before ciphertext** remains `reserved` and **HELD**—automatic republishing or destructive orphan cleanup is prohibited. An already published ciphertext with a matching intention can undergo separately requested, authenticated reconciliation without a second write. SQL/metadata mismatch, stale consent, foreign Work, revoked keys and wrong AES-GCM key material refuse.
- Recovery requires the author-scoped R35 version and review key, plus the current fictional consent event and deletion proof. A new fictional login session with the same accepted consent epoch can read the exact encrypted private review. Revocation and changed consent are not bypassed.
- Both private reopening and structural receipts explicitly carry `releaseApproved:false` and `canApply:false`; this witness **cannot call R46 Apply or R47 durable Undo**. No public Next.js route imports it. `R47_REAL_PRIVATE_EDITORIAL_ENABLED=false` is compiled static.
- An explicit fixture-only interruption flag tests an exception after intention or after ciphertext. No real application route or client option can set this flag.

## Testing and negative evidence

Strict scoped TypeScript, inherited R35/R37/selection security tests and new R47 default-off/route tests are required. Physical acceptance is performed by `scripts/ops/wsBetaR47PrivateEditorialPG16.py` with the **already cached** disposable `postgres:16.13` image, a randomized 127.0.0.1 port, no host bind mounts, limits on CPU/RAM and a fresh temporary fsync AES-GCM vault. The driver writes a receipt in its own append-safe evidence folder. It never pulls images, operates a production database, reads real members, calls a model or provider, sends mail or deploys.

The first physical candidate pass yielded:
- **8/8 initial PG16 application tests:** encrypted review, exact second repeated phrase, no manuscript mutation, exact retry, changed choice refusal, parallel no-duplicate, interruption after intention and after ciphertext, explicit recovery, wrong author/key/consent, SQL immutability.
- **5/5 new-Node recovery tests** after forced PostgreSQL SIGKILL and restart: correct owner reopens exact proposal, ciphertext authentication and topology, stable no-duplicate recovery, reserved-only remains held, foreign/withdrawn/wrong-key refusal.
- **5/5 default-off and route isolation tests**. Strict R47 TypeScript passed.
- **15/15 physical runner checks**: loopback-only PostgreSQL16/no host binds, encrypted vault SQL markers absence, only ciphertext in files, intention-before-manifest, fresh-process cold recovery and cleanup of Docker/vault/key fixtures.

Initial acceptance is **working-tree evidence**, not the exact final commit. It must be rerun against the frozen R47 source in a separate evidence directory before acceptance is recorded as exact-commit proof.

## Not yet certified — nonwaivable beta stop

This source is a **standalone held-only private proposal recovery service**. It is **not** yet connected atomically to R44 spent author approval or R46 signed R39 Apply. It cannot resolve an unknown outcome between R44 approval consumption and the separate R35 ciphertext commit. A recovered editorial proposal is not, by itself, evidence that a real human accepted it. Durable Undo remains a separately held parallel workstream.

Operational KMS and independent signer/revocation witness, monotonic deletion/commit fencing across processes and offsite backup, old-key retirement, protected current member cookie/consent/Sanctuary and server-witnessed UI approval, historical plaintext legacy SQL/JSON/WAL/backup/log/reader migration, signed production build, actual Mac/iPhone Safari, authenticated Source→proposal→Apply→Undo→reopen/export and independent founder/Classes A cutover remain held.

**Current release decision: HOLD. No real writer enrolled, no production migration, source release merge, provider, public Next route, email, AWS KMS, deployment, or charge.**
