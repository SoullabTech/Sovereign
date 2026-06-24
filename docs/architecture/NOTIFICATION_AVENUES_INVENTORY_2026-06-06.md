# Notification & Alert Avenues — Inventory

- **Date**: 2026-06-06
- **Purpose**: "Make sure all the avenues for alerts and notifications are working." Step one is enumerating them. Code audit (read-only, conservative). Runtime config (e.g. is `RESEND_API_KEY` set in prod) marked unverified where not checked.

## The map

| Avenue | Trigger | Status | Needs |
|---|---|---|---|
| **Email (Resend)** | DM / @mention / thread-reply (Co-lab); booking confirm; session follow-up | **LIVE (if configured)** | `RESEND_API_KEY` (prod set? unverified) |
| **In-app attention (For You)** | Request / @mention in a channel | **LIVE** | — |
| **SSE realtime (DM/channel)** | message delivery (polling stream) | **LIVE** | — |
| **Session reminders (Twilio SMS/WhatsApp)** | booking confirm, 24h/1h reminders, cancellation | **PARTIAL** — service + table built; *unverified the scheduled dispatch actually runs* | Twilio creds + a scheduler/worker firing it |
| **Comms delivery (DeliveryService)** | practitioner→client messages | **PARTIAL** — abstraction + encrypted creds built; unclear which routes call `.send()` | wire send paths |
| **Web push** | "consciousness reminders" | **STUB** — `push` handler in `public/consciousness-sw.js`, but **no subscription registration, no VAPID keys, no dispatch** | full build |
| **Real-time alerts** (`lib/alerting/real-time-alerts.ts`) | crisis/risk detection | **STUB** — class exists, **no callers** | wire to a trigger |
| **system_notifications table** | TTS sovereignty | **ORPHANED** — no consumer/UI | — |

**LIVE:** email, in-app attention, SSE. **PARTIAL (verify/wire):** Twilio session reminders, comms delivery. **STUB/ORPHANED (not working):** web push, real-time alerts, system_notifications.

## "Tags on MAIA" — the important finding

There is **no tag-or-mention notification in the MAIA member experience, by design:**
- Tags in MAIA (Ideas, community posts, chat channels) are **silent data fields** — `app/maia/ideas/[id]/page.tsx:24` literally codes the guardrail **"no tagging UI."** Members can't add/edit them; they notify no one.
- **No `@person` mention** exists anywhere member-facing (mentions live only in Co-lab/Studio).
- **MAIA has zero notification surfaces** — `components/maia/MaiaLeftRail.tsx:55` codifies it: *"Coordination presence, NOT a MAIA engagement bell."* Relationships/Circles don't notify either (passive feed).

So **"tags on MAIA" as a notification avenue does not exist — and was deliberately excluded.** The sovereignty boundary we've held all session is *already enforced in code.* Making MAIA tags alert someone would cross it.

## Recommended next moves
1. **Verify the LIVE ones in prod**: confirm `RESEND_API_KEY` is set (email actually delivers).
2. **The real gaps for practitioners** (who won't live in-app): **web push (stub)** + **Twilio session reminders (partial)** — these are what "all avenues working" most needs.
3. **MAIA tags**: clarify intent before any build — see the boundary above.
