# SMS Notifications — Handoff Brief

**Task:** build/activate alert-only SMS notifications for Co-lab (DM / mention / thread-reply). No message content in texts; no inbound replies — the conversation stays inside Co-lab.

**Sequencing:** SMS is **later** in the notification roadmap — in-app badge (live) → email (live) → **web/desktop push (next)** → SMS (after push, only if still needed). Do not start SMS build/activation ahead of web push unless re-prioritized.

## Provider — undecided (decide first)

- Price/compare **Twilio vs Telnyx vs Plivo** (Vonage / SignalWire also viable). Each needs its own account + **US A2P 10DLC registration** (brand + campaign; fees + ~1–2 week carrier review, varying by provider).
- **SMS cannot be self-hosted for free.** Every text routes through a carrier gateway; there is no sovereign/local path that avoids a provider.
- The MAIA code is **provider-agnostic except the adapter layer.** Twilio is the implemented *reference* adapter, not a canonical choice. Switching = swap `lib/sms/{twilioClient,verifyPhone,sendSMS}.ts` + the credential env-var names; the notify wiring, prefs API, consent model, migration, E.164 normalize, and UI are reused. **Do not generalize the code into an `SMS_PROVIDER` layer until a carrier is chosen.**

## Source of truth

Start from `feature/colab-sms-notifications` (origin). Work from the committed `docs/runbooks/SMS_ACTIVATION_RUNBOOK.md` + `docs/specs/COLAB_SMS_NOTIFICATIONS_2026-06-10.md` — they are exact to the code, not a paraphrase.

## Build / activate sequence

1. Pick a provider (above); set up its account + A2P 10DLC + Verify/OTP service.
2. Rebase onto **current** clean-main; typecheck + SMS tests green.
3. If non-Twilio: swap the transport adapter + env-var names (no other layer changes).
4. Apply migration `20260610000002`.
5. Deploy (**gated** — Kelly's approval), then set the provider creds + enable flag and restart `maia`.
6. Verify: the "coming later" footer drops, a per-event SMS column appears (default OFF), the real OTP phone-verify flow works, and a test DM sends a content-free text.

## Locks (necessary — "tests pass" alone is not enough)

- **Approval:** the merge/deploy is Kelly's call (review gate), not the building session's.
- **Carrier account:** Kelly's provider account + A2P/Verify setup — code alone cannot activate.
- Tests-green is the precondition to *propose*, not to ship.
