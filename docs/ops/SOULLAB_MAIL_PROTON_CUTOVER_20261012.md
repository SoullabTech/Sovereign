# Soullab Mail — Proton SMTP convergence (12 October 2026)

**Status: ISOLATED CODE CANDIDATE; PRODUCTION CUTOVER NOT AUTHORIZED BY TESTS ALONE.**

## Founder direction

Retire Resend as a platform dependency after the reported breach/charges. Soullab Mail owns policy, sender authority, delivery record, and suppression. Proton SMTP is the **interim** authenticated submission transport; self-hosted MTA remains the longer-term direction. Do **not** restore a Resend credential or offer Resend as a fallback.

## Evidence, not assumption

- Exact running application release witnessed: `c9e4f7f7e` (`GIT_COMMIT` on `maia-sovereign`).
- Production `EMAIL_PROVIDER` **unset** (legacy default Resend); `SMTP_HOST`, `SMTP_USER`, `SMTP_PASSWORD` **absent**; old `RESEND_API_KEY` **present** but a real Soul Portrait send was refused (`API key is invalid`).
- Proton MX records resolve; TLS v1.3/chain verification from Minisforum to `smtp.protonmail.ch:587` succeeds. **SMTP authentication has NOT been proven**; no test email was sent.
- DMARC presently `p=none`; SPF presently retains `include:send.resend.com`. DNS changes must be separately reviewed and tested; remove the obsolete Resend SPF authorization only after actual sends prove Proton alignment and the legacy keys are revoked.
- No Postal/self-hosted mail-service container running.
- These observations are time-bound; recheck at each gate.

## Candidate code

A separate worktree `fix/soullab-mail-proton-convergence-20261012` was based on the exact live release. The existing 2026-09-28 SMTP-only implementation (`2125864ebc`) was replayed with conflicts reconciled while **preserving** the later dedicated alert-SMTP isolation, independent SMS/Slack monitor, deployed dependency-audit gate, package versions, and lockfile.

- `lib/email/providers/index.ts`: SMTP only in production; memory capture refused in production; never silently fall back to Resend.
- `lib/comms/emailRouter.ts`: practitioner, Soul Portrait, scheduled-send paths use `lib/email/sendEmail.ts` (common ledger/acceptance truth), **not** Resend.
- Other historical direct Resend SDK/API callers migrated or retired, including monitoring and beta re-engagement script. Senders using member-authorized Gmail connections remain independent because those are not platform transactional mail.
- Deployment preflight **refuses** missing SMTP transport settings, non-SMTP `EMAIL_PROVIDER`, or a populated legacy `RESEND_API_KEY`.
- Out-of-band build pager keeps dedicated `ALERT_SMTP_*`, separate from member-mail credentials; SMS/Slack independence preserved.

## Tests and scope

- 45 provider, central send, SMTP, vendor-import-guard and ledger tests: PASS (mocked).
- 97 account-access and mail-security tests: PASS (mocked).
- 91 admission, ledger and Soul Portrait owner/consent tests: PASS (mocked).
- TypeScript entrypoint typecheck, shell and monitor JavaScript syntax checks: PASS.
- No live emails, recipient changes, member vault reads, production database writes, provider rotation or deployment performed by these tests.

## Holds before public cutover

1. **SMTP credential:** From Proton `Settings → All settings → IMAP/SMTP → SMTP tokens`, mint an application-specific token for an active `@soullab.life` sender. The Proton account password is NOT an SMTP credential. Never paste a token into chat, code, logs, or Git. Earlier `noreply@` attempts returned SMTP 535. A fresh token must pass STARTTLS authentication from Minisforum without a send before acceptance.
2. **Sender authority:** Proton SMTP tokens are tied to individual addresses. Soullab issues mail from `noreply`, `kelly`, `bookings`, `reminders`, `portal`, `updates`, `team`, `gifts`, and other roles. A single successful `noreply@` authentication does **not** qualify other From identities. Inventory legitimate senders, authorize each exact sender (possibly separate token/credentials), prove real From alignment and reply routing, and refuse unqualified senders rather than impersonate an alias or collapse human/organizational identities. Preserve established founder/mail authority decisions.
3. **Abuse prevention:** Validate MAIL-04 admission across every member-triggered and worker-triggered route; build/witness MAIL-05 per-recipient/IP/purpose limits, lane budgets, and anomaly ceilings. The historical $200+ mail abuse is a gate, not merely a transport choice.
4. **Isolated qualification:** Test an owned inbox first; inspect delivered message headers for SPF/DKIM/DMARC pass and correct reply-to. Then test P0 identity recovery, P1 access invitations, P2 portrait notification, P3 broadcast only if sender/rate-policy allows. Do not send test mail to Justin or beta members without consent. Demonstrate truthful error messages, acceptance IDs, non-delivery evidence, rate caps and no duplicate mail.
5. **Independent release review:** Review the exact changeset, existing workflows, dependents, configuration, security and incident regression. Resolve any difference between the working release and latest Writer's Studio candidate. Do not deploy the mail change by accidentally replacing Writer's Studio.
6. **Production activation:** Securely install and verify credentials and server-only sender policy; perform bounded observed cutover; check P0 inbox arrival and database ledger; then revoke the obsolete Resend token and remove its DNS sender authorization after confirming Proton alignment. Preserve a vetted SMTP-compatible rollback plan that does **not** revive Resend.

**User immediate remedy:** Soul Portrait `/soul-portrait/view/justin-16cf872c` is published and may be shared privately with Justin through a separate, consented channel. The failed built-in email delivery did not undo publication.
