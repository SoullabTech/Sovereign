# Email Sender Reliability Audit — 2026-06-10
### Audited against `clean-main-no-secrets` (deployed branch). Drove the `feature/central-email-sender` PR.

**Why:** before payment launch, email is trust infrastructure (auth, invites, receipts) — same tier as authentication and memory continuity. This maps every launch-critical sender; the silent ones are fixed in the accompanying PR.

## Headline findings

1. **Systemic gap:** most senders caught *exceptions* but never checked `result.error`. Resend reports API failures (unverified domain, auth, rate-limit) as a returned `error`, **not** a thrown exception — so those failures passed as silent success.
2. **The correct pattern already existed in-repo** — `lib/notifications/safety.ts` (checks `result.error`, logs, writes a failed-status row) and `app/api/members/send-verification/route.ts`. The fix **replicates** it via a central helper.
3. **No central wrapper** existed; senders called Resend directly. Fixed: new `lib/email/sendEmail.ts` (always checks `result.error`, logs structured, returns typed result, never throws).
4. **Sender-domain sprawl** = deliverability risk: `soullab.life` (verified), `soullab.org` (`sendBetaInvite`), `soullab.ai` (`safety`), and **`onboarding@resend.dev` (SANDBOX)** in `sendBetaInviteWithPasscode` → only delivers to the Resend account owner; real invitees never received it. **Fixed** to `invites@soullab.life`. `.org`/`.ai` left as-is — verify or consolidate in Resend.
5. **No payment/membership confirmation email exists at all.** Confirmed by grep. **Launch gap — next required item (not in this PR).**

## Sender-by-sender (pre-fix state)

| # | File | Purpose | From | `result.error`? | catch/logs? | Failure behavior | Risk |
|---|------|---------|------|------|------|------|------|
| 1 | `members/magic-link` | Signin link | `noreply@soullab.life` | NO→**fixed** | catch+log | 500 on throw; silent on API error | CRITICAL |
| 1 | `members/email-code` | Signin code | `noreply@soullab.life` | NO→**fixed** | catch+log | 500 on throw; silent on API error | CRITICAL |
| 1 | `members/recover` | Passkey recovery | `noreply@soullab.life` | NO→**fixed** | catch+log | 500 on throw; silent on API error | CRITICAL |
| 1 | `members/reset-password` | Password reset | `noreply@soullab.life` | NO→**fixed** | catch+log | 500 on throw; silent on API error | CRITICAL |
| 1 | `members/send-verification` | Email verify | `kelly@soullab.life` | **YES** ✅ | logs | 500 (checked) | OK (reference, untouched) |
| 2 | `email/sendBetaInviteWithPasscode` | Beta invite + passcode | **resend.dev→`invites@soullab.life`** | NO→**fixed** | logs | sandbox: invitee never received | CRITICAL→fixed |
| 2 | `email/sendBetaInvite` | Beta invite | `kelly@soullab.org` ⚠️ | NO→**fixed** | logs | silent on API error; `.org` unverified? | HIGH |
| 2 | `team/invite` | Co-lab invite | `noreply@soullab.life` | NO→**fixed** | catch+log | logged, non-fatal (preserved) | HIGH |
| 3 | *(none)* | Payment/membership receipt | — | — | — | **no email at all** | HIGH (gap, deferred) |
| 4 | `notifications/email` | Session reminders | `reminders@soullab.life` | NO→**fixed** | logs, 503 | 500 on throw; silent on API error | MED |
| 4 | `portal/notifications` ×3+1 | Booking/inquiry confirmations | `bookings@`/`portal@soullab.life` | NO→**fixed** | logs | silent on API error | MED-HIGH |
| 4 | `studio/session-followup/send` | Practitioner follow-up | `updates@soullab.life` | NO→**fixed** | catch+log | 502 on failure (preserved) | MED |
| 5 | `team/notifications` ×3 | DM/mention/thread | `team@soullab.life` | NO→**fixed** | **none (silent)** | fully silent → now logs (fire-and-forget kept) | LOW-MED |
| 5 | `masters/partnerNotifications` | Partner notify | `noreply@soullab.life` | NO | catch+log | (not in this PR scope) | LOW |
| ✓ | `notifications/safety` | Safety alert | `notifications@soullab.ai` ⚠️ | **YES** ✅ | logs+status | returns failure | OK (gold standard, untouched) |

## The fix (this PR: `feature/central-email-sender`)

- **New `lib/email/sendEmail.ts`** — central wrapper; always checks `result.error`, logs structured success/failure (recipient masked), returns `{ ok, id?, reason?, error? }`, never throws. Unit-tested 5/5.
- **Migrated** the launch-critical senders (auth, invites, reminders, portal, follow-up, team-notify) onto it. Route HTTP contracts preserved (anti-enumeration early-returns untouched; 500-on-failure kept, now also catching API errors); team-notify stays fire-and-forget but now logs failures.
- **Fixed** the `onboarding@resend.dev` sandbox sender → `invites@soullab.life`.

## Still open (NOT in this PR)
1. **Payment / membership confirmation email** — does not exist. Required before payment launch.
2. **Domain verification** — confirm `soullab.org` and `soullab.ai` are verified in Resend, or consolidate onto `soullab.life`. (Dashboard check — can't be verified from code.)
3. `lib/masters/partnerNotifications.ts` — low-risk, not migrated; can fold in later.
