# SMS / Text Notifications — Activation Runbook

**Status: NOT ACTIVATED.** This is a reference checklist for *when* Co-lab SMS/text alerts are green-lit. Following it is what turns the dormant groundwork on; reading it changes nothing. No activation has been performed.

- **Feature:** alert-only SMS notifications for Co-lab (DM / mention / thread-reply). Content-free — the text says "you have a message," never the message.
- **Design rationale / sovereignty / consent model:** see `docs/specs/COLAB_SMS_NOTIFICATIONS_2026-06-10.md`. This runbook is the operator checklist; the spec is the *why*.
- **Current live state:** email + in-app only. The settings page shows "Text / SMS notifications are coming later." That footer is the dormant gate, working as intended.

The dormancy gate is one function — `isSmsConfigured()` in `lib/sms/config.ts` — which is `isSmsSendConfigured() && isSmsVerifyConfigured()`. Until it returns true: the send path is a no-op, the prefs API rejects `sms` writes, the verify route returns 503, and the UI renders the email-only panel. Everything below exists to make that function return true, safely.

---

## 1. Deploy the branch (code first — gated)

- **Branch:** `feature/colab-sms-notifications` · **worktree:** `/Users/soullab/maia-colab-sms` · **commit:** `914015eee`.
- It is **held behind the review gate (#391)** and not merged. Deploying the code = merge to `clean-main-no-secrets` (review + approval), then the standard deploy (`docker compose ... up -d --build maia` on minisforum, per `CLAUDE.md`).
- The migration `20260610000002_members_phone_sms.sql` must be applied on minisforum (additive/idempotent: adds `phone`, `phone_verified`, `phone_verified_at`, `sms_consent_at` to `members`).
- Deploying the code while the env vars below are absent is **safe** — it stays dormant (the email-only UI is byte-identical to today). Code can ship before the Twilio account-side work is done.

## 2. Twilio credentials setup

Create/confirm a Twilio project, then obtain:
- **Account SID** (`ACxxxx`) + **Auth Token** — `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`.
- **Verify Service** (`VAxxxx`) — `TWILIO_VERIFY_SERVICE_SID`. Powers the OTP that verifies a member's number. Verify has its own, faster compliance path than A2P.

Twilio is reached via REST (`lib/sms/twilioClient.ts`), not the SDK — no new dependency, egress visible in our code.

## 3. US A2P 10DLC registration (the long pole)

- Create a **Messaging Service** → register a **Brand + Campaign** (US application-to-person). Note the **Messaging Service SID** (`MGxxxx`) → `TWILIO_MESSAGING_SERVICE_SID`.
- **Lead time: days–weeks + small fees.** Start this early; it gates *sending* (not verifying). The Messaging Service SID is what carries the A2P 10DLC campaign + sender pool.

## 4. Phone capture + consent (opt-in by construction — already built)

No work here; this is what members do once live, and how consent is enforced:
- A number must be **verified** (Twilio Verify OTP) before any send. `POST /api/members/phone/verify` (`start` / `check`).
- `members.sms_consent_at` records the explicit opt-in timestamp (TCPA hygiene), set at verification.
- Default `sms` preference is **FALSE** for every event (`lib/team/notificationTypes.ts`) — opt-in, not opt-out.
- Member can remove their number / opt out anytime: `DELETE /api/members/phone` (also drops every `sms` preference row). Setup UI shows `reply STOP to opt out`.

## 5. Environment flag to flip

Server-runtime env (NOT `NEXT_PUBLIC` → no rebuild; container restart suffices once code is deployed). Add to `.env.production` on minisforum:

```
SMS_NOTIFICATIONS_ENABLED=1
TWILIO_ACCOUNT_SID=ACxxxx
TWILIO_AUTH_TOKEN=xxxx
TWILIO_VERIFY_SERVICE_SID=VAxxxx
TWILIO_MESSAGING_SERVICE_SID=MGxxxx
```

Then restart `maia`. `isSmsConfigured()` flips true only when the flag **and** both SIDs **and** the creds are all present.

## 6. Expected UI change (how you know it's live)

In `components/team/NotificationSettings.tsx`, driven by `sms.available` from the prefs API:
- The footer **"In-app badge is always on. Text / SMS notifications are coming later." disappears.**
- A **per-event SMS column** appears alongside EMAIL (DM / Mentions / Thread replies / Channel activity), all **defaulting OFF**.
- A **phone add + verify** flow appears.
- No dead toggles ever: the SMS column shows only when sending is actually possible.

## 7. Validation steps (once live)

1. `GET /api/team/notifications/preferences` returns `sms.available: true`.
2. Settings page: footer gone, SMS column + phone-verify present.
3. Add a number → `verify start` → OTP arrives → `verify check` → `phone_verified` true, `sms_consent_at` set.
4. Enable SMS for one event (e.g. DM).
5. Send that member a real DM → log line `[sms/send] sent { purpose: 'dm_received', to: '•••• NNNN', status: 'sent' }` in `maia-sovereign`, and a **content-free** text arrives.
6. `DELETE /api/members/phone` → number removed, `sms` prefs dropped (opt-out works).

## Rollback / re-dormancy

Unset `SMS_NOTIFICATIONS_ENABLED` (or remove either SID) and restart `maia`. `isSmsConfigured()` returns false → UI reverts to email-only + the "coming later" footer, prefs API rejects `sms` writes, verify returns 503, send is a no-op. Fully reversible; no schema change to undo.

---

*Built ≠ deployed ≠ activated. This document records the path from "built" to "activated"; it does not walk it.*
