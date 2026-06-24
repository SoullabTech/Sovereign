# Email Sender Reliability Audit — 2026-06-10
### Read-only. Source of truth: `origin/clean-main-no-secrets` (deployed branch). No code changed.

**Why this exists:** before payment launch, email is trust infrastructure (auth, invites, receipts) — same tier as authentication and memory continuity. This maps every launch-critical sender so we can instrument the silent ones.

## Headline findings

1. **The systemic gap: most senders catch *exceptions* but ignore `result.error`.** The Resend SDK returns `{ data, error }` and does **not** throw on API-level failures (unverified domain, auth, rate-limit). A sender that doesn't read `result.error` treats those failures as success — silently.
2. **The correct pattern already exists in-repo — replicate it, don't invent it:**
   - `lib/notifications/safety.ts` — checks `if (result.error)`, logs it, writes a `failed` status row, returns `{ success: false }`. **Gold standard.**
   - `app/api/members/send-verification/route.ts` — destructures `const { error } = await …send()`, logs + 500s on it.
3. **No central email wrapper.** `lib/services/emailService.ts` exists but does *not* check `result.error` and isn't used universally — senders call Resend directly. Fix is per-sender, or introduce a single checked `sendEmail()` chokepoint.
4. **Sender-domain sprawl = deliverability risk.** Four different from-domains; each must be separately verified in Resend or it fails:
   - `soullab.life` (most senders — the known-verified one)
   - `soullab.org` — `sendBetaInvite.ts`
   - `soullab.ai` — `safety.ts`
   - **`onboarding@resend.dev` (SANDBOX) — `sendBetaInviteWithPasscode.ts`** → only delivers to the Resend account owner; **real invitees never receive it.** Same trap we just fixed in team notify.
5. **No payment / membership confirmation email exists at all.** Confirmed by grep. A paying customer currently gets no receipt/confirmation. **Launch gap (priority #3).**

## Sender-by-sender

| # | File | Purpose | From | `result.error`? | catch/logs? | Failure behavior | Risk |
|---|------|---------|------|-----------------|-------------|------------------|------|
| 1 | `api/members/magic-link/route.ts` | Passwordless signin link | `noreply@soullab.life` | **NO** | catch+`console.error` | 500 on throw; **silent success on API error** | **CRITICAL** |
| 1 | `api/members/email-code/route.ts` | Signin code | `noreply@soullab.life` | **NO** | catch+`console.error` | 500 on throw; **silent on API error** | **CRITICAL** |
| 1 | `api/members/recover/route.ts` | Passkey recovery | `noreply@soullab.life` | **NO** | catch+`console.error` | 500 on throw; **silent on API error** | **CRITICAL** |
| 1 | `api/members/reset-password/route.ts` | Password reset | `noreply@soullab.life` | **NO** | catch+`console.error` | 500 on throw; **silent on API error** | **CRITICAL** |
| 1 | `api/members/send-verification/route.ts` | Email verification | `kelly@soullab.life` | **YES** ✅ | logs sent + error | 500 on error (checked) | OK (reference) |
| 2 | `lib/email/sendBetaInviteWithPasscode.ts` | Beta invite + passcode | **`onboarding@resend.dev`** ⚠️ | NO | logs `result.id`, catch+log | sandbox sender → **invitee never receives** | **CRITICAL (deliverability)** |
| 2 | `lib/email/sendBetaInvite.ts` | Beta invite | `kelly@soullab.org` ⚠️ | NO | logs `result.id`, catch+log | silent on API error; `.org` domain unverified? | HIGH |
| 2 | `api/team/invite/route.ts` | Co-lab invite | `noreply@soullab.life` | **NO** | catch+`console.error` | logged, **not surfaced to inviter** | HIGH |
| 3 | *(none found)* | Payment/membership receipt | — | — | — | **no email sent at all** | **HIGH (gap)** |
| 4 | `api/notifications/email/route.ts` | Session reminders | `reminders@soullab.life` | **NO** (uses `result.data?.id`) | logs sent/error, 503 | 500 on throw; silent on API error | MED |
| 4 | `lib/portal/notifications.ts` | Booking confirmations | `bookings@soullab.life`, `portal@soullab.life` | NO | logs sent/failed | silent on API error (client-facing) | MED-HIGH |
| 4 | `api/studio/session-followup/send/route.ts` | Practitioner follow-up | `updates@soullab.life` | NO | catch+`console.error` | silent on API error | MED |
| 5 | `lib/team/notifications.ts` | DM/mention/thread notify | `team@soullab.life` | **NO** | **none — `catch { /* Silent */ }`** | fully silent | LOW-MED (confirmed bad) |
| 5 | `lib/masters/partnerNotifications.ts` | Kelly/Nathan partner notify | `noreply@soullab.life` | NO | catch+`console.error` | silent on API error | LOW |
| ✓ | `lib/notifications/safety.ts` | Practitioner safety alert | `notifications@soullab.ai` ⚠️ | **YES** ✅ | logs + writes `failed` status | returns `{success:false}` | OK (gold standard; `.ai` domain) |

## Proposed instrument phase (one small PR, priority order, fire-and-forget preserved)

1. **Auth (CRITICAL):** add `const { data, error } = await …send()` + `if (error) { console.error(...); return 500 }` to `magic-link`, `email-code`, `recover`, `reset-password`. (Pattern already in `send-verification`.)
2. **Invites:** fix `sendBetaInviteWithPasscode` sandbox sender → a verified `soullab.life` address; add `result.error` checks to both invite senders + `team/invite`.
3. **Payment:** flagged as a gap — confirmation/receipt email needs to exist before launch (separate build, noted not patched).
4. **Reminders / portal / follow-up / team-notify / partner:** add `result.error` logging; keep fire-and-forget (log, don't throw) where it must not block.
5. **Domain hygiene:** confirm `soullab.org` and `soullab.ai` are verified in Resend, or consolidate onto `soullab.life`.

Reusable target: a single `sendEmail()` helper that always checks `result.error` and logs, so new senders inherit it.
