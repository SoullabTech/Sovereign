# Email provider-send correctness — deferred sites

**Status: DISCOVERED — NOT ACTIVE**
**Founder ruling (Kelly, 2026-08-24):** record, do not widen. Provider-send
correctness across all email surfaces becomes the next bounded job *after* one
new signup is witnessed end to end. It is not to be folded into a live
authentication incident.

---

## The bug class

Resend's `emails.send()` returns `{ data, error }` and **resolves** on a
provider refusal — it does not throw. A caller that `await`s it inside a
`try/catch` and then declares success on the next line cannot observe the
refusal: the `catch` fires only on transport faults.

`lib/email/sendEmail.ts` was written to close this class centrally. Its own
header documents the trap. The sites below do not use it.

## What it cost, once

The 2026-08-24 signup incident. Resend's monthly quota was exhausted, so every
signup send returned `{ data: null, error: { statusCode: 429, name:
'monthly_quota_exceeded' } }`. `app/api/members/email-code` recorded
`magic_link_sent`, logged `[EMAIL-CODE] Code sent`, returned HTTP 200, and the
client advanced the member to the code-entry screen for an email that had never
been sent. One person made six attempts across two days and could not create an
account. Every observable surface said the mail had gone out.

Fixed for that one route in `c20ca38`. The class is untouched everywhere else.

---

## Confirmed by reading (not heuristic)

### `lib/email/sendBetaInviteWithPasscode.ts:104` — two faults, compounding

```ts
from: 'Kelly @ Soullab <onboarding@resend.dev>',  // Use Resend's verified domain for now
...
console.log(`✅ Sent to ${invite.name} ...:`, result.id);
return { success: true, id: result.id };
```

1. **Sandbox sender.** `onboarding@resend.dev` delivers **only to the Resend
   account owner**. Real invitees receive nothing. `lib/email/sendEmail.ts`
   states this explicitly: *"NEVER send from `onboarding@resend.dev`."*
2. **Unchecked result.** `result.error` is never read, so the refusal — or the
   silent non-delivery — is reported as `✅ Sent` and `{ success: true }`.
3. `result.id` is `undefined` (the id lives at `result.data.id`), so the
   success log has been printing `undefined` as the message id.

**Read this before interpreting any past invite wave.** A wave sent through
this path would report full success while delivering to nobody but the account
owner. That is a different explanation for "invited N, none arrived" than
disinterest, and it is not currently distinguishable from the logs.

### `lib/email/sendBetaInvite.ts:50` — unchecked result, and a sender to verify

```ts
from: 'Kelly @ Soullab <kelly@soullab.org>',
...
return { success: true, id: result.id };
```

Same unchecked-result fault and the same `result.id` / `result.data.id`
confusion. Separately: the sender domain is `soullab.org`, while the verified
Resend domain per `SENDERS` is `soullab.life`. Whether `.org` is verified on the
account is **unconfirmed** — check before treating this path as working.

---

## Flagged by scan — NOT individually confirmed

Heuristic match (file contains `emails.send` and shows no nearby error
inspection). Each needs reading before it is called a defect.

- `app/api/notifications/email/route.ts`
- `app/api/build/alert/route.ts`
- `app/api/fields/nathan/message/route.ts`
- `lib/team/notifications.ts` (three call sites)
- `lib/services/emailService.ts`
- `lib/masters/partnerNotifications.ts`
- `lib/security/alertEngine.ts`
- `lib/portal/notifications.ts`
- `scripts/send-maia-ready-email.ts`
- `scripts/send-beta-update-email.ts`
- `scripts/send-passkey-reminder.ts`
- `scripts/send-steward-invitation.ts`

## Appear to check already — confirm before trusting

- `app/api/members/send-verification/route.ts` (destructures `{ error: sendError }`)
- `lib/practiceField/inviteEmail.ts`
- `lib/notifications/safety.ts`
- `lib/focus/FocusReminderService.ts`
- `lib/comms/emailRouter.ts` (practitioner BYO routing — its own module by design)

---

## Shape of the eventual job

Not "add an if to twenty files". The fix is to route every transactional send
through `lib/email/sendEmail`, which already inspects `error`, logs
purpose/sender/recipient/domain/status, carries the provider's typed
`providerCode`, and never throws. Sites that cannot use it need a stated reason.

Two properties any such change must prove, because this incident showed both
absent:

1. **A refusal can never be reported as a send.** No success log, no success
   telemetry, no 200.
2. **The test fixture can express failure.** The email-code suite passed
   throughout the defect's life because its Resend mock resolved to a bare
   `{ id }` and could not represent `{ data: null, error }`. A mock that cannot
   fail cannot prove failure handling.

## Do not close until

`sendBetaInviteWithPasscode.ts`'s sandbox sender is resolved. Of everything
listed here, it is the only one that is silently delivering to nobody *right
now* while reporting success.
