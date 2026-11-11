# R20 H1R2/H2R2 in-house review — prioritised summary for founder decision

**Date:** 2026-10-27 · **Status:** local working record, not admitted, not posted · **Classification:** `FOUNDER-DIRECTED / CC-LED IN-HOUSE REVIEW / NOT INDEPENDENTLY REVIEWED`
Detail and evidence: `R20-H2R2-IN-HOUSE-REVIEW-01_STEP1-3_FINDINGS_2026-10-26.md` (section numbers below). Severities are the reviewer's, non-binding. Every evidence item is scratch/model/software-TPM; none is hardware, production, or independent. All R20 holds are unchanged.

## A. Decide first — design questions that block any reliance on H2R2/H1R2

| # | Finding | Sev. | Evidence | Why it matters |
|---|---|---|---|---|
| 1 | **H2R2-M1** (§3.2): the TPM counter binds a *number*, not an *event*. A restored ledger holding a different pending intent can be finalised after another event advanced the counter, giving two verifying receipts for one generation. Related: `recover()` signs a receipt with no credential check (B1, §3e). | High (for counter + restorable ledger, if no restore fence) | executed on model; bounded explorer, shortest path 7 steps | The packet's crash-safety claim does not hold against restore. A scratch candidate (TPM side also records which event advanced it) closes it in the model but changes the policy design. |
| 2 | **H2R2-T2/T4** (§3d): the NV policy commits only to the signing key, policy reference and command code. Nonce, expiry and cpHash are the signer's choice (replay and no-cpHash signatures were accepted). A service key that signs an approved policy naming delete **deleted the index**. The packet's "service cannot delete" test refuses only because its policy names increment. | High (for the stated design) | executed, disposable software TPM, with controls | Service/founder separation is a signer habit, not a structural guarantee. |
| 3 | **Floor/revocation state** (§3g, §3h): no placement is decided. App-store floor or revocation list is defeated by a restored backup (4 steps); a TPM counter survives restore but not a device swap; per-device configurations close the swap (model only). | High if H1R2 is to be admitted | model + scratch prototype | Without it, trust-configuration rotation and revocation have no effect against rollback. |

**Your decisions:** (a) direction for event-binding in the counter design; (b) must service/founder separation be structural (command-code check in the service branch, or founder-only delete branch)? (c) the floor design: dedicated counter under installation-root authority, revocation by floor raise, device-bound configurations. I recommend (a)–(c) be decided together, since all three change the TPM policy.

## B. Fix soon — real gaps with compatible or bounded fixes

| # | Finding | Sev. | Note |
|---|---|---|---|
| 4 | **G1** (§3c, §3g): no lifetime cap, sequence, or revocation on trust configuration | Medium | Lifetime cap + key uniqueness patch keeps the packet's 38/38 green; sequence/revocation prototype also does, 6/6 guard mutants killed. |
| 5 | **G3**: provider Object Lock identity is unpinned, so a PIN signer can assert any bucket/key | Medium | Optional pinned-bucket patch keeps all tests green. |
| 6 | **G8** (§3f): the 21 static checks are string presence; four single-line removals (nonce check, completion expiry, PIN↔HEAD binding, HEAD↔attestation binding) pass the packet's static **and** 38 behavioural tests | Medium (as test evidence) | My scratch tests kill all four; adding such tests is cheap. |
| 7 | **H2R2-M2, M3**: `recover()` does not cross-check the head against the signed receipt; resuming a pending intent moves the counter before validating it | Medium | executed on model |
| 8 | **G2**: keys not required unique across domains or against the installation root | Low–Med | Local key vs domain key collision is impossible by type (refined). |

## C. Note and track

- **G4** (Low): currentness checks omit the trust-config digest; making it mandatory breaks 9 of 38 tests, so it needs a design decision on where the "current digest" comes from. Revocation does not reach already-minted tokens (S9).
- **G9**: nonce is caller-supplied and never consumed, so reuse inside 5 minutes is not caught; the packet states this itself.
- **H2R2-M4**: only the latest commit has a durable receipt (design question). B2–B4 (§3e): ack cache outlives a restore; `verify_receipt` is not a currentness check; "after commit, before receipt" is unmodelled.
- **Resolved or as designed:** **G5** (token bounded by the 300 s attestation window), **G6** (caller-set clock; the longitudinal and desktop paths read use the real clock), **G7** (canonicalisation read from the parent: unambiguous, signature covers every field).
- **Not a defect:** the packet's "crash after commit loses ack, not commit" claim holds for the latest event with the cache cleared.

## D. Corrections to the packet's own record

Parent SHA in `START_HERE.md` is 39 characters (`6032ef43` resolves; tree hash matches). The packet canary's founder-delete assertion greps a zero-padded handle that the TPM prints without the leading zero, so it can never fail (the recorded empty handle list is still genuine evidence). The packet's 116-test count was **not** reproduced (I ran 38 + 21 static, all green). The packet's 23 crash-model tests catch 12 of 31 single-line guard weakenings (30/31 with my 15 added laws; on seven structural mutants 4/7, rising to 7/7 with my new suite). The packet does not claim mutation strength; this is a strength measurement, not a contradiction.

## E. Not covered

Hardware TPM, real filesystem durability and power loss, restore-fence behaviour, the other test files behind the 116 count, retention/provider reality, anything in production. Mutants and variants are hand-chosen and single-line. Nothing here changes any gate: H1R2 source admission, H3, key creation, runtime permissions, restoration with member data, MOK/EFI/TPM physical steps, deployment, member-facing claims and Cabin release all remain held, and any adoption of the scratch tests or patches would be a separate act.
