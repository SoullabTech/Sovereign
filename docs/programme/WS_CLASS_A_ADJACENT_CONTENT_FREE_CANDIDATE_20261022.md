# Writer Class A — adjacent content-free diagnostic candidate (unratified)

**DRAFT / REVIEW ONLY / NO MERGE / NO LIVE MODEL / NO PRODUCTION.**

## Dependency and exact source scope
- Stacked on *test-only* draft #1925 (negative source proof), not the unpublished Writer R87 source.
- Original `contextDisclosureReceipt.ts` Git blob: `2fa1fe28b4dce6123542d2c1c3c92d002566aa71`.
- Original `policy.ts` Git blob: `241580957df0bab601b918256102ae639aab218a`.
- Commit A contains only disclosure receipt logging changes; Commit B separately contains only policy error-detail change and this supplemental test/workflow/documentation. This allows independent legal/custody/source decisions.
- The six **unchanged** original negative assertions in #1925 (four logging and two invalid-mode refusals) must pass on this proposed source. The original #1925 red proof must remain available unaltered.

## Proposed contracts requiring independent Class A approval
**Receipt diagnostics:** Mint failure still yields `{kind:'unavailable'}`, never permitting context disclosure. Confirmation failure still yields `false`: after the cognition boundary, the crossing remains unresolved, not "no crossing". No `err.message`, `String(err)`, nested vendor/DB object, getter or error prototype enters either log. The output schema retains an `error` field only as a fixed machine-safe token; existing `disclosureIdPrefix` telemetry remains unchanged. That prefix needs a separate source-and-privacy review for any path permitting user-controlled IDs.

**Structured policy:** Invalid mode continues to refuse, never falling back to `primary`, but its detail is a fixed machine-safe code. Other modes (`primary`, `sovereign`, `local_only`) and model routing stay unchanged. No raw invalid env text, even if multiline, can be returned.

**Historical pin is not amended:** `seamIsolation.test.ts` and `GOVERNED_SEAM_BASELINE` remain byte-identical. Proposed policy.ts differs from the ratified source and MUST fail the existing pin until separately approved by Founder-Steward and independent Class A reviewer. Its RED result is a constitutional stop, not a test to delete.

## Acceptance gates
- [ ] Verify source exact bytes and negative-to-green evidence in real repository CI, not in a mirror.
- [ ] Independently review hardcoded diagnostics and permitted structural metadata, plus raw error sinks in transaction helpers and upstream log aggregators.
- [ ] Independent privacy/custody acceptance of receipt changes without loss of attempted-vs-crossed/uncertain semantics.
- [ ] Independent structured-inference policy and Founder-Steward acceptance of exact policy change.
- [ ] Only then: *separately proposed* governed source-baseline change with original hashes preserved, rollback and new exact-head CI.
- [ ] Qualify current merged Writer source, real author consent, requested/reported model, R20 current revocation/restore, R86P original-file intake containment, physical iPhone Safari and signed release image before production.

## Prohibited in this review
No real member/manuscript/Source access, DB migration, external provider inference, signer/key modification, disabling failing tests, permissions/grants, paid checkout, source uploads, restart, merge, deployment or founder release designation.

See #1917, #1926, #1800, drafts #1918/#1920/#1922/#1925.
