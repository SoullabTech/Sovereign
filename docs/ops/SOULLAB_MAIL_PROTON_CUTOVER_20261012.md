# Soullab Mail — Proton SMTP convergence (12 October 2026)

**Status: ISOLATED CODE CANDIDATE; PRODUCTION CUTOVER NOT AUTHORIZED BY TESTS ALONE.**

## Founder direction

Retire Resend as a platform dependency after the reported breach/charges. Soullab Mail owns policy, sender authority, delivery record, and suppression. Proton SMTP is the **qualified present** authenticated submission transport; a self-hosted SMTP-compatible transport remains a longer-term possibility. Do **not** restore a Resend credential or offer Resend as a fallback.

**2026-10-12 founder sender-identity approval:** The sole managed automated From address is `noreply@soullab.life`. Kelly explicitly approved it for all automated Soullab messaging and identified it as potentially the best **permanent/default architecture**. This is a preferred enduring policy, not an irreversible commitment to one mail vendor. Keep the domain identity stable if a transport changes.

**What one identity does NOT collapse:** Purpose is represented through static, governed display names; Reply-To remains the human/practitioner correspondence address where legitimately known. This never permits software to authenticate AS `kelly@`, `support@`, or another human or organizational mailbox. An independently authorized and credential-isolated build/safety pager is an **out-of-band monitoring exception**; it must not become the member-facing mail transport. The single From does not remove P0 identity protections, per-recipient guards, separate lane budgets or independently accountable vendor credentials.

## Evidence, not assumption

- Exact running application release witnessed: `c9e4f7f7e` (`GIT_COMMIT` on `maia-sovereign`).
- Production `EMAIL_PROVIDER` **unset** (legacy default Resend); `SMTP_HOST`, `SMTP_USER`, `SMTP_PASSWORD` **absent**; old `RESEND_API_KEY` **present** but a real Soul Portrait send was refused (`API key is invalid`).
- Proton MX records resolve; TLS v1.3/chain verification from Minisforum to `smtp.protonmail.ch:587` succeeds. **SMTP AUTH passed** from Minisforum as `noreply@soullab.life`, and one controlled test to Proton and one controlled test to an owned Gmail inbox arrived. The Gmail original headers confirmed **SPF PASS, DKIM PASS, DMARC PASS**. No client mail was sent during qualification.
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
- SMTP transport rejects every `From` that does not equal its authenticated username, before opening any connection. Managed mail is now locked to **`noreply@soullab.life`**, with trusted display names for Account, Invitations, Soul Portraits, Studio, Bookings, Reminders, Updates and Safety messages. Former legitimate transactional roles are normalized to this identity. The founder **approved this** as a possible lasting standard on 2026-10-12. Explicit Reply-To and Kelly's known human reply address are retained; `support@` and `problem@` are deliberately NOT software From identities.
- The Proton token is kept in owner-only host storage. Candidate production Compose bind-mounts it read-only into the application at `/run/secrets/soullab_smtp_token`; `SMTP_PASSWORD_FILE` reads it without placing a credential in environment variables or Git. The deploy preflight rejects missing/unsafe file modes, plaintext SMTP passwords in env, non-SMTP provider selection and any populated Resend API key.
- Recipient log references are now keyed, versioned HMACs instead of short unkeyed hashes of email addresses.
- The existing 03:17 daily prune job has been verified on the Minisforum; the candidate extends that script to prune expired MAIL-05 counters.

### Final founder-approved From / Reply-To design

The October 12 founder decision favors one canonical **software From identity** for the foreseeable future, even if transport eventually changes. Application routes may not impersonate a human mailbox. Display names are **trusted, fixed purpose labels**, not arbitrary actor names:

| Purpose | From display | Authenticated envelope |
|---|---|---|
| auth / sign-in | Soullab Account | noreply@soullab.life |
| invite | Soullab Invitations | noreply@soullab.life |
| Soul Portrait | Soullab Soul Portraits | noreply@soullab.life |
| practitioner / Writer's Studio | Soullab Studio | noreply@soullab.life |
| portal / booking | Soullab Bookings | noreply@soullab.life |
| reminders | Soullab Reminders | noreply@soullab.life |
| broadcast | Soullab Updates | noreply@soullab.life |
| `notify:safety` | Soullab Safety | noreply@soullab.life |

A human Reply-To remains distinct from the From identity and must be explicitly sourced from a trusted context. Existing Studio scheduled sends already carry a stored practitioner Reply-To; beta invitations route replies to Kelly. A role name in prose is **not** authorization to use a different SMTP credential. A separate safety/build operations pager with its own authenticated transport is deliberately excluded from the member-facing sender policy.

This means **one name for SMTP authorization does not mean one shared trust or sending budget.** The DB-backed MAIL-05 caps and independent P0 reserve remain mandatory.

The preceding list is an approved *stable default*, not an irreversible ban on future separate credential identities if a documented operational safety need arises.

**Known Reply-To debts before final release:** Confirm a monitored reply destination for Soul Portrait recipients; a missing Reply-To currently falls back to the mailbox in From. Gift-bead replies currently route to Kelly even for another member's gift, and require product review to avoid misrouting correspondence. Verify support and practitioner mailboxes actually receive replies before stating they do.



### Synthetic evidence

- Independent disposable PostgreSQL container `soullab-mail05-synthetic-20261012` with `--network none`, outside production, accepted the additive migration without errors.
- The SQL proof in `scripts/witness/mail05-synthetic-proof.sql` passed: repeated P0 sends cap at five to one recipient, P3 exhaustion leaves P0 available, invalid/duplicate/plaintext-HMAC requests do not spend capacity, and no raw address is stored.
- 30 parallel simulated P0 calls to the *same* HMAC address: **5 admitted, 25 refused**, authoritative counter **5**. Witness: `scripts/witness/mail05-synthetic-concurrent.sh`.
- Full mocked application regressions: **23 suites, 267 tests passed**; includes route-level refusal invalidating unreceived sign-in codes, ownership/consent in Soul Portrait, SMTP sender mismatches, file-backed secret permissions, and delivery ledger guarantees.
- TypeScript entrypoint check and shell/Node syntax checks passed. Docker host mount tested as UID 1000, mode 0600, read-only, with no token value printed. Gmail SPF/DKIM/DMARC externally confirmed PASSED on the test message in the connected inbox.
- No member emails or database writes were made during the engineering tests. The only externally sent test email was the previously authorized, one-message Gmail qualification.

### Sender-path convergence and privacy follow-up

- Beta invitation sender in `lib/email/sendBetaInvite.ts` was still `kelly@soullab.org`; it is now the qualified `noreply` identity, with Reply-To `kelly@soullab.life` and the Invitations display name.
- `lib/email/sendBetaInviteWithPasscode.ts` uses canonical `noreply` and retains a human Reply-To; sensitive per-recipient correlation is HMAC-derived.
- Stellium practitioner safety notifications in `lib/notifications/safety.ts` formerly claimed `notifications@soullab.ai`; they now go through the qualified `noreply` account, with the distinct trusted display name **Soullab Safety**. Independent human escalation on any failed safety email remains in force. An email is **not** a substitute for live safety escalation.
- Historical beta invite idempotency keys embedded recipient emails, while gift-bead keys embedded a secret passkey. Both call sites have been replaced by keyed, domain-separated HMACs. The central sending boundary also HMACs EVERY supplied idempotency key before any log, SMTP header or delivery-ledger write, preventing recurrence if future callers pass raw identifiers. The recipient address HMAC and the mail-reference HMAC remain separate domains. Mocked provider/header/ledger non-disclosure tests passed.
- Existing bead-mail success logging had embedded gift sender/recipient names and email; removed in the isolated candidate. Sender display name is only ever an approved static purpose label, not a user-provided string.

### Known remaining release blockers

- **Human migration custody:** The additive schema requires exact-target independent file-read review, compatibility with the still-running old reader, and a migration-only authorized gate before application image swap.
- **MAIL-04/MAIL-05 authority completeness:** Caps mitigate loss, but do not prove every externally callable mail endpoint has proper actor and recipient-origin authorization. Complete that inventory and test it before public release.
- **Identity and replies:** Founder approval of one From identity is **settled**. The outstanding gate is technical end-to-end acceptance of all P0/P1/P2 routes, evidence that the designated human Reply-To mailboxes can receive and are monitored, and negative tests for unintended addresses. Only `noreply` has been authenticated and externally tested; the separate alert pager retains its own credentials.
- **Physical lane separation:** Counters protect P0's budget but the single Proton account remains shared underneath. A separate high-reputation P0 credential/transport is longer-term resilience, not yet implemented.
- **Operations:** Confirm provider quotas, suppression/bounce webhook handling, alerting, log minimization, independent review verdict, and no accidental Writer's Studio image replacement. DNS SPF still authorizes Resend and DMARC is in monitoring mode; those are post-cutover cleanup items, not completed changes.

## Holds before public cutover

1. **SMTP credential — QUALIFIED:** An application-specific token was minted, authenticated, and proved externally. Its restricted-access file exists on Minisforum at `/home/soullab/.config/soullab-mail/noreply.smtp-token` (UID 1000 / mode 0600), to be mounted read-only. No token must be copied into env files, Git, logs, chat or artifacts. The Docker image/config and protected secret mount must still be independently accepted before public deployment.
2. **Sender authority — FOUNDER DECIDED, TECHNICAL PROOF PENDING:** Software sends as `noreply@soullab.life` only. No other user/organizational From identity is authorized. Governed fixed-purpose display names and trusted Reply-To routing are in the candidate; prove each applicable delivery path and staffed reply destination before rollout.
3. **Abuse prevention — BUILT, PARTIALLY PROVEN:** MAIL-05 shared per-recipient and lane budgets passed isolated/concurrent tests. Remaining requirements: independently review the migration, complete MAIL-04 authorization inventory per externally callable and worker-triggered route (including spoofed IP-header handling), test production-compatible anomalous traffic, and ensure operational alerts/recovery. No proof that every vector is closed is claimed.
4. **Isolated qualification:** Test an owned inbox first; inspect delivered message headers for SPF/DKIM/DMARC pass and correct reply-to. Then test P0 identity recovery, P1 access invitations, P2 portrait notification, P3 broadcast only if sender/rate-policy allows. Do not send test mail to Justin or beta members without consent. Demonstrate truthful error messages, acceptance IDs, non-delivery evidence, rate caps and no duplicate mail.
5. **Independent release review:** Review the exact changeset, existing workflows, dependents, configuration, security and incident regression. Resolve any difference between the working release and latest Writer's Studio candidate. Do not deploy the mail change by accidentally replacing Writer's Studio.
6. **Production activation:** Securely install and verify credentials and server-only sender policy; perform bounded observed cutover; check P0 inbox arrival and database ledger; then revoke the obsolete Resend token and remove its DNS sender authorization after confirming Proton alignment. Preserve a vetted SMTP-compatible rollback plan that does **not** revive Resend.

**User immediate remedy:** Soul Portrait `/soul-portrait/view/justin-16cf872c` is published and may be shared privately with Justin through a separate, consented channel. The failed built-in email delivery did not undo publication.
