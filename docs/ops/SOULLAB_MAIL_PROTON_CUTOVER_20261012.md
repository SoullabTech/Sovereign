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

## MAIL-05 release candidate — additive hardening, 12 October 2026

**Prepared in the same isolated worktree; not deployed.** The previously absent global guard is now implemented in `lib/email/capacity.ts` and the additive, isolated-reviewed migration candidate
`database/migrations/20261012000001_mail05_capacity.sql`. It is NOT a ledger query or a conditional cap on the previous mail vendor.

- Atomic PostgreSQL advisory-locked reservations and a separate table of **keyed HMAC** recipient counters. No plaintext email recipients in the counter table.
- Per-hour/per-day caps per lane: **P0 30/120, P1 25/80, P2 35/100, P3 5/20**, with additional recipient-hour/day caps (P0 5/12; P1 6/12; P2 6/15; P3 2/3). Non-identity lanes also share a 50/hour and 150/day ceiling. This is a conservative founder-beta candidate, NOT a final scale policy.
- One attempt is charged before SMTP even if the provider later refuses (avoids refusal-based loops). Invalid recipients, duplicate destinations and a fan-out exceeding 20 are refused without any capacity write.
- If durable reservation fails: P1–P3 fail closed. P0 only has a small **per-process emergency ceiling** of six per hour, two per HMAC recipient per hour, with bounded memory. This is outage containment, not a shared substitute. Deployment still requires the durable schema.
- The central `sendEmail()` checks sender authority and capacity before calling the provider. This now covers managed Soul Portrait deliveries, authentication, invitations, notifications and scheduled sends through `EmailRouter`. It does not claim MAIL-04's endpoint-by-endpoint admission audit complete.
- SMTP transport rejects every `From` that does not equal its authenticated username, before opening any connection. The interim managed-mail policy converges known historic `soullab.life` software sender aliases onto **`Soullab <noreply@soullab.life>`**, preserving explicit Reply-To and Kelly's known human reply address. An unknown sender is refused rather than impersonated. This branding/reply decision needs founder confirmation before release.
- The Proton token is kept in owner-only host storage. Candidate production Compose bind-mounts it read-only into the application at `/run/secrets/soullab_smtp_token`; `SMTP_PASSWORD_FILE` reads it without placing a credential in environment variables or Git. The deploy preflight rejects missing/unsafe file modes, plaintext SMTP passwords in env, non-SMTP provider selection and any populated Resend API key.
- Recipient log references are now keyed, versioned HMACs instead of short unkeyed hashes of email addresses.
- The existing 03:17 daily prune job has been verified on the Minisforum; the candidate extends that script to prune expired MAIL-05 counters.

### Synthetic evidence

- Independent disposable PostgreSQL container `soullab-mail05-synthetic-20261012` with `--network none`, outside production, accepted the additive migration without errors.
- The SQL proof in `scripts/witness/mail05-synthetic-proof.sql` passed: repeated P0 sends cap at five to one recipient, P3 exhaustion leaves P0 available, invalid/duplicate/plaintext-HMAC requests do not spend capacity, and no raw address is stored.
- 30 parallel simulated P0 calls to the *same* HMAC address: **5 admitted, 25 refused**, authoritative counter **5**. Witness: `scripts/witness/mail05-synthetic-concurrent.sh`.
- Full mocked application regressions: **22 suites, 259 tests passed**; includes route-level refusal invalidating unreceived sign-in codes, ownership/consent in Soul Portrait, SMTP sender mismatches, file-backed secret permissions, and delivery ledger guarantees.
- TypeScript entrypoint check and shell/Node syntax checks passed. Docker host mount tested as UID 1000, mode 0600, read-only, with no token value printed. Gmail SPF/DKIM/DMARC externally confirmed PASSED on the test message in the connected inbox.
- No member emails or database writes were made during the engineering tests. The only externally sent test email was the previously authorized, one-message Gmail qualification.

### Known remaining release blockers

- **Human migration custody:** The additive schema requires exact-target independent file-read review, compatibility with the still-running old reader, and a migration-only authorized gate before application image swap.
- **MAIL-04/MAIL-05 authority completeness:** Caps mitigate loss, but do not prove every externally callable mail endpoint has proper actor and recipient-origin authorization. Complete that inventory and test it before public release.
- **Identity and replies:** Only `noreply` is authenticated and externally tested; the alias-to-noreply presentation needs founder adjudication. Account recovery and other protected P0/P1 paths still need user-owned end-to-end acceptance after the actual candidate deployment.
- **Physical lane separation:** Counters protect P0's budget but the single Proton account remains shared underneath. A separate high-reputation P0 credential/transport is longer-term resilience, not yet implemented.
- **Operations:** Confirm provider quotas, suppression/bounce webhook handling, alerting, log minimization, independent review verdict, and no accidental Writer's Studio image replacement. DNS SPF still authorizes Resend and DMARC is in monitoring mode; those are post-cutover cleanup items, not completed changes.

## Holds before public cutover

1. **SMTP credential:** From Proton `Settings → All settings → IMAP/SMTP → SMTP tokens`, mint an application-specific token for an active `@soullab.life` sender. The Proton account password is NOT an SMTP credential. Never paste a token into chat, code, logs, or Git. Earlier `noreply@` attempts returned SMTP 535. A fresh token must pass STARTTLS authentication from Minisforum without a send before acceptance.
2. **Sender authority:** Proton SMTP tokens are tied to individual addresses. Soullab issues mail from `noreply`, `kelly`, `bookings`, `reminders`, `portal`, `updates`, `team`, `gifts`, and other roles. A single successful `noreply@` authentication does **not** qualify other From identities. Inventory legitimate senders, authorize each exact sender (possibly separate token/credentials), prove real From alignment and reply routing, and refuse unqualified senders rather than impersonate an alias or collapse human/organizational identities. Preserve established founder/mail authority decisions.
3. **Abuse prevention:** Validate MAIL-04 admission across every member-triggered and worker-triggered route; build/witness MAIL-05 per-recipient/IP/purpose limits, lane budgets, and anomaly ceilings. The historical $200+ mail abuse is a gate, not merely a transport choice.
4. **Isolated qualification:** Test an owned inbox first; inspect delivered message headers for SPF/DKIM/DMARC pass and correct reply-to. Then test P0 identity recovery, P1 access invitations, P2 portrait notification, P3 broadcast only if sender/rate-policy allows. Do not send test mail to Justin or beta members without consent. Demonstrate truthful error messages, acceptance IDs, non-delivery evidence, rate caps and no duplicate mail.
5. **Independent release review:** Review the exact changeset, existing workflows, dependents, configuration, security and incident regression. Resolve any difference between the working release and latest Writer's Studio candidate. Do not deploy the mail change by accidentally replacing Writer's Studio.
6. **Production activation:** Securely install and verify credentials and server-only sender policy; perform bounded observed cutover; check P0 inbox arrival and database ledger; then revoke the obsolete Resend token and remove its DNS sender authorization after confirming Proton alignment. Preserve a vetted SMTP-compatible rollback plan that does **not** revive Resend.

**User immediate remedy:** Soul Portrait `/soul-portrait/view/justin-16cf872c` is published and may be shared privately with Justin through a separate, consented channel. The failed built-in email delivery did not undo publication.
