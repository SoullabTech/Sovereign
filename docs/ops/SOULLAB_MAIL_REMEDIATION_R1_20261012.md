# Soullab Mail — F1–F6 Remediation R1

Status: Isolated candidate, security and migration review pending; no approval to deploy.
Parent: 3c18ec402d99e6e2dfcd0b09925c0fc4c8f50a63.
Branch: fix/soullab-mail-release-remediation-20261012.
Candidate exact SHA: bind after commit using git rev-parse HEAD.

## Governing decision

Founder approved noreply@soullab.life as the single managed automated From, with trusted purpose-specific display names and separately authenticated Reply-To. Proton SMTP controlled Gmail test passed SPF, DKIM, DMARC and Inbox. This proves transport, not app release.

## Isolated implementation

- F1 MAIL-04: enforce fail-closed admission in central SMTP sending path. Annotate 39 managed send call sites with actor and recipient provenance. No implicit system authority; the caller must provide evidence. EmailRouter and PracticeField caller require explicit session-derived authority. Unknown and unregistered protected P0/P1 purposes do not get priority reserves.
- F1 public booking: until client email ownership is independently verified, do not automatically mail confirmations, cancellations, reschedules, or portal claim links to anonymous-input client addresses. Practitioner notifications remain separately permitted. This is an intentional product-facing hold, NOT a completed verification feature.
- F2: remove unbounded public feedback Twilio SMS; rate-limit POST before durable write, escape outgoing HTML, and avoid personal-content console logs.
- F3: additive scheduled-send migration permits sending and indeterminate states and durable claim tokens. Atomic SELECT FOR UPDATE SKIP LOCKED claim precedes SMTP. Only claim holder can settle; uncertain outcomes are quarantined without auto-resend.
- F4: recipient-specific delivery requires BOTH the portrait subject's permission to share with the exact recipient and that recipient's permission to receive. Append keyed pseudonymous audit, reject revoked published portraits, preserve original subject consent authority.
- F5: remove all process-local emergency capacity paths. Every lane including P0 refuses when shared durable reservation is unavailable.
- F6: do not accept caller-selected priority promotion; protected P0/P1 messages require a registered purpose.

## Test and migration custody

- 28 targeted app security and privacy suites passed **294 tests** on the final source revision, including the portal-claim refusal, subject-specific sharing and registered-purpose P0/P1 restrictions. TypeScript typecheck and shell/Node syntax checks also passed.
- Disconnected synthetic PostgreSQL: MAIL-05 migration plus scheduled-send and recipient-audit migrations applied; old-reader pending query gave one eligible item before and one after migration.
- 24 concurrent exact scheduled-send claim queries admitted just one due/consented record. Unconsented/future rows were never claimed.
- F4 synthetic privacy and deletion checks: plaintext recipient fingerprints rejected; member/portrait deletion cascades through the pseudonymous delivery-audit table.
- Synthetic evidence is NOT a substitute for an approved privacy-protected real-backup restoration and old-reader compatibility test. No production database changes or member emails.

## Mandatory holds

1. Independent human review of the exact final commit, source access traces, MAIL-04 route authority and all three migrations. An implementer/model review does not qualify.
2. Founder adjudication of the deliberate temporary hold on client-facing public portal emails versus a verified-recipient design. No automatic release of emails to unverified form addresses.
3. Protected backup-restore compatibility, prefix migration failure testing, and review-custody approval before a production migration.
4. Reconciliation with Writer's Studio release image. Candidate is based on an older public release and cannot simply overwrite the newer application.
5. Controlled production test of identity delivery, practitioner replies, Soul Portrait sharing, alerts, throttles and correct rejection semantics after explicit authorization.
6. Source annotation for recipient provenance is not self-proving. Human reviewer must verify each route and each system worker's true trust boundary and authority.

Verdict: HOLD. No merge, deploy, DNS, credential rotation or production mutation authorized.
