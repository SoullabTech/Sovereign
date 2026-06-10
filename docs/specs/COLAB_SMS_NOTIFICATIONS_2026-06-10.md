# Co-lab SMS Notifications — Dormant Groundwork

**Date:** 2026-06-10
**Branch:** `feature/colab-sms-notifications` (off `clean-main-no-secrets`)
**Status:** Built, dormant behind a flag. **Nothing sends until the activation runbook below is complete.**
**Directive (Kelly, 2026-06-10):** *Twilio + build the provider-agnostic groundwork now, dormant until account-side setup is ready. Alert-only, no message content, no inbound replies.*

---

## Scope (what this is, and is not)

- **Is:** SMS as an opt-in *alert* channel for Co-lab — "you have a new message," with a link back into Co-lab. Extends the existing `member_notification_preferences` event×channel model with the `sms` channel.
- **Is not:** an SMS *conversation* bridge. No message content ever rides an SMS. No inbound SMS is processed. The conversation stays inside Co-lab.

## Sovereignty stance

There is no self-hosted SMS — every text routes through a carrier gateway (Twilio). This is the **same category** as the existing email notifications, which already route through Resend: a third-party *transport* that sees a contact handle + "you have a message," never the thread. The canon-safe line is held by construction: **the SMS body is content-free** (sender / channel / action only — see copy below). Twilio is reached via its **REST API** (`lib/sms/twilioClient.ts`), not the SDK, so the exact egress is visible in our own code and adds no dependency.

## Consent model (opt-in by construction)

1. `member_notification_preferences` default for channel `sms` is **FALSE** for every event (code default, `lib/team/notificationTypes.ts`).
2. A number must be **verified** (Twilio Verify OTP) before it can receive any send.
3. `members.sms_consent_at` records the explicit opt-in timestamp (TCPA hygiene), set at verification, cleared on removal.
4. The member can **remove** their number / opt out at any time (`DELETE /api/members/phone`), which also drops every `sms` preference row.
5. SMS copy includes `reply STOP to opt out` guidance in the setup UI.

## Content-free copy (alert-only)

| Event | SMS body |
|-------|----------|
| DM | `You have a new Co-lab message from {sender}. Open Co-lab: {url}` |
| Mention | `{sender} mentioned you in #{channel} on Co-lab. Open: {url}` |
| Thread reply | `{sender} replied to your message in #{channel} on Co-lab. Open: {url}` |

## Architecture / files

| File | Role |
|------|------|
| `database/migrations/20260610000002_members_phone_sms.sql` | Adds `phone`, `phone_verified`, `phone_verified_at`, `sms_consent_at` to `members` (additive, idempotent). |
| `lib/sms/config.ts` | Flag + credential resolution; `isSmsConfigured()` dormancy gate. |
| `lib/sms/phoneNumber.ts` | Pure E.164 normalize + mask (no deps). |
| `lib/sms/twilioClient.ts` | Minimal Twilio REST client (fetch + Basic auth, never throws). |
| `lib/sms/sendSMS.ts` | Central alert sender; mirrors email module contract (fire-and-forget, structural-log-only). |
| `lib/sms/verifyPhone.ts` | Twilio Verify start/check wrappers. |
| `lib/team/notifications.ts` | Wires SMS into the 3 notify functions, gated independently of email. |
| `app/api/team/notifications/preferences/route.ts` | Conditional `sms` write (was always-rejected); exposes `sms.available` + phone status. |
| `app/api/members/phone/route.ts` | GET status, DELETE (remove + opt out). |
| `app/api/members/phone/verify/route.ts` | POST `start` / `check` (Twilio Verify). |
| `components/team/NotificationSettings.tsx` | SMS column + phone-verify flow — rendered ONLY when `sms.available`. |

**Dormancy guarantee:** with the flag/creds absent, `isSmsConfigured()` is false → the SMS branch in `notifications.ts` is a no-op, the prefs API still rejects `sms` writes, the verify route returns 503, and the settings UI renders exactly the email-only panel with the "coming later" line. Verified by `lib/sms/__tests__/*` (31 tests) + typecheck + no-supabase.

## Activation runbook (Kelly's account-side steps — the long pole)

These are external/compliance steps, not code. The code can deploy now (dormant) while these proceed in parallel.

1. **Twilio account** — create / confirm a project.
2. **Verify Service** — create a Twilio Verify service → note its SID (`VAxxxx`). (Verify/OTP has its own, faster compliance path than marketing A2P.)
3. **Messaging Service + A2P 10DLC** — create a Messaging Service, register a Brand + Campaign (US application-to-person). **Days–weeks lead time + small fees.** Note the Messaging Service SID (`MGxxxx`).
4. **Env vars** (server-runtime, NOT `NEXT_PUBLIC` — no rebuild needed for the flag, just a container restart after the code is deployed):
   ```
   SMS_NOTIFICATIONS_ENABLED=1
   TWILIO_ACCOUNT_SID=ACxxxx
   TWILIO_AUTH_TOKEN=xxxx
   TWILIO_VERIFY_SERVICE_SID=VAxxxx
   TWILIO_MESSAGING_SERVICE_SID=MGxxxx
   ```
   Add to `.env.production` on minisforum.
5. **Deploy** the branch via the normal clean-main deploy flow, **then** set the env vars and restart `maia`.
6. **Flip on** by setting `SMS_NOTIFICATIONS_ENABLED=1`. Until this + both SIDs are present, `isSmsConfigured()` stays false and the feature is invisible.

## Verification once live

- `GET /api/team/notifications/preferences` returns `sms.available: true`.
- A member adds + verifies a phone (Twilio Verify OTP), then enables SMS for an event.
- A real DM to that member emits `[sms/send] sent { purpose: 'dm_received', to: '•••• NNNN', status: 'sent' }` in `maia-sovereign` logs, and the text arrives content-free.

## Known follow-ups (not blocking)

- **iOS/Capacitor:** `NotificationSettings.tsx` uses plain `fetch` (pre-existing, inherited from the notif-prefs feature). On iOS the Co-lab settings surface needs `apiFetch` + `x-member-id` to reach the production API. Web (the primary Co-lab surface) is fine.
- **Rate limiting:** no per-member send throttle yet. A2P throughput limits + the verified-number + opt-in gates bound abuse, but a burst guard is a reasonable hardening step.
- **Changing number mid-verify** replaces the prior verified number with the unverified new one; acceptable for v1.
