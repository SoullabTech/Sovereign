# Editorial disclosure implementation — 2026-09-21

Candidate only. No production deployment or live manuscript witness performed.

Kelly authorized both permission and durable accountability, boundary
`writers_studio.editorial_turn->maia_cognition`, gesture `work_with_this`, and
continuation with a shared inference outcome extension in this conversation.

## Implementation

- Preserve boundary-only migration 519ab1e2 via cherry-pick 005cd2f41.
- Separate migration adds an immutable logical provider destination. Existing
  receipts retain null; editorial receipts must name Anthropic. This does not
  claim physical endpoint identity. Both migrations precede new application code.
- Explicit per-request writer permission names the passage, nearby prose and
  editorial history/directions/revisions sent to Anthropic. Cancellation sends
  no editorial turn request; editing latitude grants no disclosure authority.
- Route passes its resolved Sanctuary posture. Required consent state is awaited
  before assembly; the shared boundary verifies it before minting the receipt.
- Only a newly minted attempted receipt permits dispatch. Provider-response
  evidence confirms crossed before editorial admission. Confirmation failure
  refuses accountable success. Uncertain errors leave attempted intact.
- SDK-specific classification stays inside the approved adapter. A stream's
  connect event is response evidence even if finalMessage later fails. Missing
  HTTP status never establishes no transmission. Logs omit raw error messages.
- The shared seam byte pin moves to the separately committed authorized seam
  amendment. Earlier pin ancestry is preserved; no exemption or disabled check.
- Revision callback dependencies now include current latitude and paragraph/
  sequence permissions, preventing a stale closure from sending older choices.

## Evidence and limits

134 tests across eight synthetic Jest suites passed. They exercise dispatch evidence, request equivalence, policy,
non-fallback behavior, consent/receipt ordering, failures, and content-free metadata.
The HTTP refusal test uses the real SDK through the adapter against loopback only.
No additional SDK import was allowed: the initial test import was rejected by the
existing provider gate and replaced with a loopback test through the adapter.

An isolated database `ws_disclosure_synthetic_20260921` executes the actual receipt
migrations and tests destination requirement, immutability and state transition.
Minimal consent/tombstone dependency tables are fixtures, not a whole deployment.
Initial fixture runs lacked a dependency, omitted explicit state, and attempted an
already-forbidden same-state update. Corrected fixtures passed; no production
constraint was relaxed to admit them. The reusable SQL witness is under scripts/
writers-studio/editorial-disclosure-schema-witness.sql.

Two external synthetic requests using the current local configuration succeeded:
provider=anthropic, modelAgreement=agreed. No manuscript or personal data was sent.
The second used the actual discussion-first editorial tool schema and passed
`admitEditorialToolEnvelope`, with matching model identity. This establishes
present provider/schema availability, not the full UI/persistence journey or
the cause of the historical failed W1 request.

Typecheck no-regression gate passed with 229 existing diagnostics against 239
baselined diagnostics. This is not a type-clean project. No baseline was regenerated.

## Outstanding release evidence

- Visual review of the per-request permission interaction (currently a native
  confirm dialog; no screenshot or visual pass claimed).
- Integrated W1–W6 in the Studio, including apply and undo.
- Verification on the intended preview database after the migration pair.
- Historical failure attribution remains unresolved.

No scope, voice, sequence or latitude threshold was weakened. No manuscript was
edited by this repair. Beta remains held until the complete writer journey passes.

Pre-commit provider, sovereignty, PHI-pattern and design-contract gates passed.
Design-contract coverage is not visual verification.
