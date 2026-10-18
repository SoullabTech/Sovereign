# RF01 R1-E — Real password sign-in convergence and acceptance

**Date:** 2026-10-17
**Status:** LOCAL CANDIDATE, production HOLD
**Branch:** fix/rf01-r1e-signin-session-failclosed-20261017
**Pinned parent:** ce79982dad89b541d95ac3a6ee6d1f4fdb3a4c80
**Real member data, paid calls, GitHub push, merge and deployment:** NONE

## Sign-in source convergence

The integrated R1-D source inherited password sign-in that could return a
successful response without a usable session after session or cookie
issuance failed. A separate Reflect/Pro Studio branch contained an earlier
fail-closed correction. R1-E reconciles that work into the uninterrupted
S0–R1-D source. The returned response alone receives four completed cookies,
with the bearer issued last. On incomplete issuance, the route discards
the partially prepared response, returns a clean no-store 503, and attempts
to revoke the unusable session.

The member UI no longer treats HTTP 200 or a name as authenticated authority.
It requires success=true, a verified member ID and a valid bearer. Late
housekeeping failure cannot cause a misleading login failure after the
session was successfully issued. Auth-event labels use actual audit schema.

## Evidence

- Selected unit and security regressions: **366/366 tests, 35 suites**.
- Dedicated failure injections: **12/12**, covering invalid password,
  unknown member, session creation failure, invalid session, four distinct
  cookie-operation failures, revocation failure, last-sign-in write failure
  and audit unavailability.
- Actual Next.js 16.3.8 password sign-in, disposable PostgreSQL16 member,
  server-created session and HttpOnly cookies witnessed in desktop Chrome,
  desktop WebKit and phone-sized WebKit emulation. Incorrect password
  produced no bearer; correct password continued into MAIA Arrival,
  then Sanctuary with visible refusal before any model or memory-consent
  call. The real New Conversation UI produced a different authenticated
  session ID, preserved earlier fictional writing, and a deliberately
  failed new encounter did not change current identity.
- **0 external and 0 model calls** observed; unrelated application APIs
  were mocked in the browser.
- Scoped TypeScript: baseline R1-D five diagnostics, R1-E two inherited
  biometric diagnostics; **zero introduced**.
- Desktop and mobile sign-in failure screenshots show generic feedback
  and recovery in the actual UI, with fictional identifiers and no
  successful session cookie.
- R1-D original 135-change working checkout remains untouched.

## Remaining release gates

1. Physical iPhone 16 Pro Max is paired and available but has not been
   modified, installed to or signed into.
2. S1-A live Sanctuary external processing is still held; separate model,
   voice, storage and member permission must not be inferred from sign-in.
3. Broader source still has inherited TypeScript diagnostics and existing
   Cabin test-file failures; these are not waived by R1-E.
4. Production image, credentials, rollback custody, hosting and storage
   readiness need explicit release qualification.
5. This is fictional testing; it is not a live account or deliberately
   failed production database witness.

**Next:** finish local governance and commit, then read-only physical-device
readiness and founder-authorized installation/acceptance.

**Production and cohort release: HOLD.**
