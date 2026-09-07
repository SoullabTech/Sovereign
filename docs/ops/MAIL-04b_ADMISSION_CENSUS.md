# MAIL-04b — Admission Census

Every site that can cause Soullab to send mail, classified on the two MAIL-04a
axes. **Purpose does not confer destination authority**; each site is judged on
the pairing, never on whether its purpose sounds legitimate.

```
ADMITTED    pairing is legitimate as written
CORRECTED   pairing violated MAIL-04a and was fixed
REFUSED     unsafe pairing, removal recommended
AMBIGUOUS   evidence insufficient — held, not guessed
```

**33 sites accounted for.** No silent bypasses.

## P0 · identity (anonymous by necessity)

| Site | Authority | Destination | Disposition |
|---|---|---|---|
| `members/email-code` | anonymous | **identity-claim** | ADMITTED |
| `members/magic-link` | anonymous | **identity-claim** | ADMITTED |
| `members/recover` | anonymous | member-record (confirmed by lookup) | ADMITTED |
| `members/reset-password` | anonymous | member-record (confirmed, route:59) | ADMITTED |
| `members/send-verification` | anonymous | member-record | **CORRECTED** (MAIL-03) |

`email-code` and `magic-link` forced the `identity-claim` category into
existence — a new member has no record to read from, so mailing the typed
address *is* how the claim is tested. Refusing them would make signup
impossible. They qualify only because the message confers nothing except by
being received.

`recover` and `reset-password` look the same in the source (`to: email`) and
are **not** the same: both confirm the address against `members` before
sending, so the destination is record-governed. `recover` additionally mails a
standing secret, which is why it may never be an identity claim.

## P1 · access (authenticated actor chooses the destination)

| Site | Authority | Destination | Disposition |
|---|---|---|---|
| `labtools/gifts` | admin (shared secret) | actor-supplied | ADMITTED |
| `members/beads` | member (verified session) | actor-supplied | ADMITTED |
| `team/invite` | actor + role check | actor-supplied | ADMITTED |
| `lib/practiceField/inviteEmail` | actor (practitioner) | actor-supplied | ADMITTED |
| `lib/email/sendBetaInvite` | system/admin | stored-record | ADMITTED |
| `lib/email/sendBetaInviteWithPasscode` | system/admin | stored-record | ADMITTED |

A proven actor choosing a destination is what an invitation *is*. Bounding how
many they may choose is metering — MAIL-05, not here.

## P2 · transactional (stored records and configured addresses)

| Site | Authority | Destination | Disposition |
|---|---|---|---|
| `notifications/email` | actor (`resolveSendAuthority`) | stored-record | ADMITTED |
| `studio/session-followup/send` | actor | stored-record | ADMITTED |
| `feedback` | anonymous | **configured** (`PROBLEM_EMAIL`/`KELLY_EMAIL`) | ADMITTED |
| `fields/nathan/message` | anonymous | configured (`FOUNDER_EMAIL`) | ADMITTED |
| `build/alert` | system | configured (`DEV_EMAIL`) | ADMITTED |
| `lib/security/alertEngine` | system | configured | ADMITTED |
| `lib/focus/FocusReminderService` | system | stored-record | ADMITTED |
| `lib/masters/partnerNotifications` | system | stored-record | ADMITTED |
| `lib/notifications/safety` | system | stored-record | ADMITTED |
| `lib/portal/notifications` | system | stored-record | ADMITTED |
| `lib/team/notifications` | system | stored-record | ADMITTED |
| `lib/notifications/SessionNotificationService` | system | stored-record | ADMITTED ⚠ |

An anonymous caller reaching a **configured** address is safe and needs no
session: the caller cannot influence where it goes. `feedback` is the clearest
case — anyone may submit feedback; it always lands in the same inbox.

⚠ `SessionNotificationService` sends `purpose: 'booking:confirmation'`, which is
**not registered** in `EMAIL_PURPOSE_LANES` — only `portal:booking-*` are — and
`booking` is not in `FAMILY_LANES`. It therefore falls to `DEFAULT_PRIORITY`
(P2) by accident rather than by decision. Admission is unaffected; lane
assignment is undeclared. Finding, not a defect.

## P3 · bulk and scripts (system triggers)

| Site | Authority | Destination | Disposition |
|---|---|---|---|
| `lib/services/emailService` (Ganesha) | system | stored-record | ADMITTED ⚠ |
| `scripts/send-beta-update-email` | system | stored-record | ADMITTED |
| `scripts/send-maia-ready-email` | system | stored-record | ADMITTED |
| `scripts/send-passkey-reminder` | system | stored-record | ADMITTED |
| `scripts/send-steward-invitation` | system | stored-record | ADMITTED |

⚠ `lib/services/emailService.ts` carries `@ts-nocheck`, so its call site is
unverified by the type checker. Pre-existing; noted, not fixed here.

## Outside the provider boundary — REFUSED / AMBIGUOUS

These do **not** call `lib/email/sendEmail`. They send through `GmailService`,
so none of the mail architecture applies to them: no purpose, no lane, no
ledger, no admission, no metering. They were not part of the Resend incident
because they are not part of Resend.

| Site | Authority | Destination | Disposition |
|---|---|---|---|
| `app/api/test/gmail-send` | **none observed** | **request-supplied** | **REFUSED** |
| `app/api/gmail/send` | `userId` **from request body** | request-supplied | **REFUSED** |
| `app/api/_backend/.../calendarIntegrationService` | unclear | `participant.email` | AMBIGUOUS |
| `lib/gmail/GmailService` | n/a (transport itself) | n/a | AMBIGUOUS |
| `lib/services/newsletter/NewsletterIntegration` | unclear | unclear | AMBIGUOUS |

### Why the first two are REFUSED

`app/api/test/gmail-send` is a **test route reachable in production**. Its POST
takes `to` from the request body, has no observable authentication, and sends
as a hardcoded `TEST_USER_ID`. That is an unauthenticated caller choosing a
destination — the exact pairing MAIL-04a forbids, on a different transport.
Recommendation: **delete it.** A test route is not a feature.

`app/api/gmail/send` takes `userId` from the request body and sends on that
user's behalf. Authority asserted by the caller is not authority. The 401 at
:80 gates on whether Gmail is *connected*, which is a configuration check, not
an admission check. Recommendation: resolve the actor from the session.

Both are gated in practice only by whether Gmail OAuth happens to be connected —
a control that can be satisfied without anyone deciding it should be.

### The three AMBIGUOUS

Held deliberately. `calendarIntegrationService` sends to `participant.email`
with no visible purpose or authority path; `GmailService` is a transport rather
than a call site; `NewsletterIntegration` yielded neither a purpose nor a
destination to static reading. **Evidence was insufficient and no answer was
invented to make the census complete.** Each needs a reading of its callers.

## Findings recorded, not acted on

1. **A second send surface exists outside the mail architecture.** Gmail routes
   have no purpose, lane, ledger, admission or metering. Everything MAIL-01
   through MAIL-05 provides stops at `lib/email`. The boundary is narrower than
   "how Soullab sends mail."
2. **`booking:confirmation` is unregistered** — lane by accident.
3. **`lib/services/emailService.ts` is `@ts-nocheck`.**
4. **Volume risk is untouched.** Several ADMITTED sites fan out to many
   recipients (`team/notifications`, `emailService` broadcast, the scripts).
   Admission permits them; nothing bounds them. **MAIL-05.**

## Acceptance

- 33/33 accounted for, no silent bypasses
- 19 admission tests green
- Mail + limiter suites green
- Typecheck no regressions

Not done here, by instruction: no MAIL-05 guards, no transport change, no SMTP
activation, no Proton or DNS work, no MAIL-03 revisiting, no unrelated cleanup.
