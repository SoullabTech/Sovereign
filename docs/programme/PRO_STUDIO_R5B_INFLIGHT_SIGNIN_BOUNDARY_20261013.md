# Pro Studio R5b — In-Flight Deliberate Sign-In Identity Reconciliation
Date: October 13, 2026
Standing: **LOCAL SOURCE CANDIDATE — CLASS A HUMAN REVIEW AND BETA RELEASE HOLD**

## Exact ancestry and retained custody
- R5 frozen predecessor: `e796009713ef1559292732e810aa6f66f76d4a6d`.
- R5a frozen predecessor: `859c46df0db43633191b508ff24cd2f95b37e232`.
- Separate source branch/worktree: `fix/pro-studio-r5b-inflight-relogin-20261013` on T7 Shield.
- R5a and R5 remain unmodified/unmerged; protected release branch untouched.
- No migration, real member data, billing, active beta or production changes.

## Adversarial finding motivating R5b
A fresh, explicitly initiated B credential return verified a real B server
session, but another browser tab could change cached `beta_user` to A while
`/api/members/session` was in flight. R5a's helper returned `admit` using
the **pre-network** cache assessment, even though browser ownership no longer
matched. The source was frozen and the negative technical witness retained.

## Narrow correction
- `assessFreshSignInAdmission` rechecks **all existing browser account
  aliases and active-account scope** after the awaited cookie-backed server
  verification, and checks that the explicit sign-out marker remains intact
  during verification. A changed account or marker refuses sign-in; no
  browser records are moved, merged, erased, or silently adopted.
- The explicit credential caller makes one more synchronous account-owner
  check immediately before writing any browser identity/display keys.
- Passive auto-resume still honors the sign-out latch. Different-account
  sign-in remains held at the neutral conflict screen.
- No session cookie is minted by client-local evidence; server identity and
  session revocation remain the authority.

## Test and release requirements
- Focused adversarial unit tests for in-flight B->A cache mutation and marker
  mutation must PASS on the exact R5b revision; all prior R5/R5a auth
  regressions must also PASS.
- Exact-source governed no-regression TypeScript, local Next.js production
  build, fictional PostgreSQL backup/restore, desktop/mobile WebKit login,
  mounted Home+MAIA cookie-only switch and cross-tab in-flight tests to be
  attached to release issue #1816 before any sign-off.
- Full MAIA conversations, voice/memory/consent, genuine provider-based
  credential verification, R20 historical deletion/revocation recovery,
  physical iOS Safari, global member routes, legacy local-data custody,
  production image digest/rollback and independent qualified human Class A
  review remain outside focused source qualification.
- Founder visual acceptance and exact tester-only GO/NO-GO remain separate.

**This file is a local engineering record, not deployment or security approval.**
https://github.com/SoullabTech/Sovereign/issues/1816
