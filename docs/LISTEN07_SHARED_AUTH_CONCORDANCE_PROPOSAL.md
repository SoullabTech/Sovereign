# LISTEN-07 — proposed shared-session concordance correction (NOT APPLIED)

**2026-10-24 · Existing platform security owner owns any real change · CLASS A HOLD.**

## Exact source reviewed

`lib/auth/session.ts` on the source baseline `clean-main-no-secrets`, SHA256 `6e37552f56410dd1e045d570d93b0421aa29a62bf79024b947fc4ac7ee7a20d4`.

The current priority implementation accepts the first valid cookie or header. That is incompatible with the founder's approved decision: if both cookie and `x-session-token` are supplied, **both must be current valid sessions belonging to the same member**. Failure of either or failure of the session database must not admit a member. An absent credential and an empty-but-present credential are not equivalent.

## Minimum proposed behavior

| Credentials presented | Expected |
|---|---|
| Valid cookie only | Admit its verified member |
| Valid header only | Admit its verified member (Safari/native compatibility) |
| Both valid, identical token | Admit verified member |
| Both valid, different tokens, same member | Admit verified member |
| Both valid, different members | Deny |
| One valid, other invalid/revoked/expired | Deny |
| One credential empty but present, other valid | Deny |
| Both invalid / neither supplied | Deny |
| Session database cannot verify the credential | Deny (do not claim revocation or authorization success) |

## In-memory candidate checked without changing runtime

[Source witness](../tests/listening/listen07_shared_auth_proposal_witness.cjs) substitutes a bounded proposed `requireMemberId` implementation **only in a JavaScript VM** after confirming the exact shared-auth SHA256. It uses fictional session tokens and stubbed database rows, without production cookies, PostgreSQL, network requests, or changes to protected source.

Results on Mac Studio Node v22.22.3:

- **12/12 candidate cases PASS**.
- Current source fails **5/12**: conflicting-valid-members, invalid-cookie+valid-header, valid-cookie+invalid-header, empty-cookie+valid-header, valid-cookie+empty-header. The earlier eight-case source gate remains **5/8 PASS**.
- When the fictional session database throws, the candidate refuses to identify a member; the eventual owning implementation must determine its HTTP error classification and logging discipline.

## Integration constraints (existing security owner)

This is **not a blanket authorization to write shared source**. The authentic integration must verify source drift, browser cookie persistence, CSRF/Origin, one authenticated profile read/write, database revocation/expiration, native header-only Safari, separate Cabin offline authority, strict route policy, and no cross-member admission on the exact full joined image. Reject user-controlled `x-member-id` as independent authority. Header-only native access must not be removed.

The Listening Room must stay feature-disabled until the shared platform owner accepts a correction independently; don't locally monkeypatch it inside `/listen`. Related: [platform #1877](https://github.com/SoullabTech/Sovereign/issues/1877), [LISTEN-01 #1979](https://github.com/SoullabTech/Sovereign/issues/1979).

**Disposition:** Proposed function verified in a test VM; shared source untouched, no PR/merge/deployment/production session testing, CLASS A member release HOLD.
