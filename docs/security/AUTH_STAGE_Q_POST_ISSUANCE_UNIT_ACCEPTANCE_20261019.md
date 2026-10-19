---
title: "Stage Q — post-issuance sign-in metadata fault acceptance"
date: "2026-10-19"
status: "isolated fictional unit PASS, release HOLD"
authority: "read-only runtime witness after narrowly scoped candidate"
release: "HOLD"
---

# Stage Q — post-issuance sign-in fault correction and isolated acceptance

## Scope and source identity

This **separate security review branch** `security/auth-stage-q-post-issuance-review-20261019` was created at pinned parent `68eea346c42e3e9dc810e99432f83532c0497c35` (the Stage Q web bearer candidate). The existing draft client PR #1863, protected canonical, staging, production and founder/member data were not modified.

Exactly two files changed:

| File | New Git blob SHA |
|---|---|
| `app/api/members/signin/route.ts` | `aa645135644c7ad7f12516288ceeb1992c50c543` |
| `docs/security/auth-signout-session-failure-contract.test.cjs` | `1967c59935c4b15cf673e80c33cac991f782b00c` |

**Failure window discovered by source review:** `createSession()` successfully inserted a session and the sign-in response cookies were set, but `UPDATE members SET last_sign_in = NOW()` executed afterwards. If that metadata update threw, the outer catch returned 500 even though the session might remain valid. That would misrepresent the authentication state.

**Correction:** Keep the `last_sign_in` timestamp update after durable session issuance, but treat it as best-effort non-authoritative metadata. On failure, record a stable sanitized diagnostic marker, not the raw database exception, member identity, or bearer token, then return the already-established session via the existing authenticated response path. This does not change password verification, rate limiting, session creation, cookie issuance, session compensation, authorized roles, other auth endpoints, or the trusted origin policy.

## Actual isolated test execution

The test environment was the network-disabled disposable container at `/mnt/data/stageq_acceptance`, separate from the user's Mac Studio. Existing source-pinned Stage Q files were checked against prior original Git blob SHAs. The two changed files were constructed from that exact base using the same approved replacements as committed to GitHub and verified with `git hash-object` to match **both new GitHub blob SHAs above**.

- Node.js: `v22.16.0`
- TypeScript transpiler: `v5.8.3`
- Command: `node --test docs/security/auth-signout-session-failure-contract.test.cjs`
- Observed output: **13 tests, 13 passed, 0 failed, exit 0**
- New test: `post-issuance last_sign_in failure preserves truthful successful session` — simulated SQL update failure after synthetic durable session issuance; received HTTP 200 with `success:true`, the fixture token, no compensation revocation, a success audit, and a sanitized diagnostic that did not include the test token.
- Previous 12 tests also passed, including password/session issuance failures, cookie compensation, revoked/stale sessions, origin refusal, simulated database failure on sign-out, and cookie/header credential conflict.

**Test-proven scope:** fictional in-memory SQL and cookie dependencies executing transpiled actual route code. No real SQL service or browser was used.

## Unaccepted risks — do not promote

- The new test is **not** genuine PostgreSQL fault injection or database recovery. A real DB outage after session issuance can still make protected resource access temporarily fail closed; this case must be observed separately.
- The Stage Q client integration is a separate draft PR #1863 and its full UI fixture, Safari/WebKit, and PostgreSQL acceptance remain incomplete.
- No full Next.js product build, no full TypeScript baseline/no-regression check, no live HTTPS origin/Host/Set-Cookie examination, no native session revocation, no independent security approval, and no real founder sign-in was performed for this branch.
- Remain separate from the client-review PR until both have independently qualified; do not conflate green noncanonical CI with release approval.

**Disposition:** exact-source fictional server contract **PASS 13/13**; integrated staging/production release **HOLD**.
