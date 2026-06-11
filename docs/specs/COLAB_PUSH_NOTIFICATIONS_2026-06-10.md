# Co-Lab Web/Desktop Push Notifications — Spec

**Date:** 2026-06-10
**Branch:** `feature/colab-push-notifications` (off `clean-main-no-secrets` @ `563d1110b`)
**Status:** Spec only. Nothing built. **No code, no SW change, no activation.**
**Sequencing:** in-app badge (live) → email (live) → **web/desktop push (this)** → SMS (later — see `SMS_HANDOFF_BRIEF.md`).

---

## Why push before SMS

Push removes SMS's *long pole*: no carrier account, no Twilio/Telnyx/Plivo, no US A2P 10DLC registration, no per-message fees, no 1–2 week carrier review. There is **no external gate to wait on** — the work is self-contained engineering. Same sovereignty stance as email/SMS: a content-free *alert* ("you have a new Co-Lab message"), never message content; conversation stays in Co-Lab.

## Architectural fit (cheap by design)

Notifications are already **event × channel** — `NotificationChannel = 'in_app' | 'email' | 'sms'` (`lib/team/notificationTypes.ts`). Push is a fourth channel: extend the enum + per-event `DEFAULTS`, add a send branch in `lib/team/notifications.ts`, add a UI column. The consent/prefs/notify spine the SMS work generalized is **reused** — push is *another channel*, not a new system.

## ⚠️ Service-worker reality (scout findings — the load-bearing part)

Web push requires an **active service worker on the Co-Lab surface**. The disk shows a partially-built, partially-broken PWA layer — do NOT assume "it's a PWA, so a SW exists":

| Fact (from disk) | Consequence |
|---|---|
| `components/providers/PWAProvider.tsx` registers `/sw-enhanced.js` | …but **`public/sw-enhanced.js` is MISSING** → that registration 404s |
| `PWAProvider` is **not mounted** anywhere in `app/` | …so it never even runs — it's dead wiring |
| `public/consciousness-sw.js` **exists (343 lines) and already handles `push` / `notificationclick` / `showNotification`** | …but is registered **only** by `app/consciousness-computing/pwa/page.tsx`, not app-wide and not on `/team` |
| `app/DevNoServiceWorker.tsx` unregisters SWs **in dev only** (`NODE_ENV==='production'` early-returns) | prod SWs are untouched; this is a dev cache-buster, not a prod kill-switch |

**Net:** there is **no active service worker on `/team` today.** The good news: a **push-capable SW already exists in-repo** (`consciousness-sw.js`) — its handlers can be reused/adapted rather than written from scratch. **Step zero is establishing a registered SW on the Co-Lab surface** (and deciding the scope), not VAPID.

**Open decision — SW scope:**
- **A. Co-Lab-scoped** — register a small SW on `/team` only (adapt `consciousness-sw.js`'s push handlers). Contained; doesn't touch the broken global PWA wiring.
- **B. App-wide** — fix `PWAProvider` (point at a real SW with push handlers, actually mount it). Cleaner long-term, but it untangles a pre-existing broken PWA layer first (likely a rabbit hole). **Recommend A for v1.**

## Platform support

| Platform | Web Push | Notes |
|---|---|---|
| Desktop (Chrome/Edge/Firefox, Safari macOS) | ✅ | Primary Co-Lab surface — strongest fit |
| Android (Chrome/Edge/Firefox/Samsung) | ✅ | Browser tab **or** installed PWA |
| iOS/iPadOS — Safari **tab** | ❌ | Not supported |
| iOS/iPadOS — **installed PWA** (16.4+) | ✅ | Member must add Co-Lab to Home Screen |
| Native Capacitor iOS app | ✘ web push | Would need **APNs** separately — out of scope here |

**Implication:** iPhone members must install the Co-Lab PWA to receive push; desktop/Android are covered as-is. The settings UI must say this for iOS, not show a dead toggle.

## Server-side

- **VAPID keys** — generate once; `VAPID_PUBLIC_KEY` (client) + `VAPID_PRIVATE_KEY` + `VAPID_SUBJECT` (server env).
- **Subscription store** — new table `member_push_subscriptions { member_id, endpoint, p256dh, auth, created_at }` (one member → many devices). Prune on `410 Gone`.
- **Send path** — `lib/sms/`-style module (`lib/push/sendPush.ts`) using the `web-push` library; VAPID-signed; fire-and-forget; structural-log-only (`[push/send] sent { purpose, endpoint: '…', status }`). Wire into the same 3 notify functions (DM / mention / thread reply), gated independently like email/sms.
- **Content-free copy:** `New Co-Lab message from {sender}` / `{sender} mentioned you in #{channel}` / `{sender} replied in #{channel}` + `url` deep-link. No body text.

## Client-side

- **Service worker** (per the scope decision above): `push` → `showNotification`; `notificationclick` → focus/open the deep link.
- **Subscribe flow:** on opt-in → `navigator.serviceWorker.ready` → `pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: VAPID_PUBLIC_KEY })` → POST the subscription to the store.
- **Prefs UI** (`NotificationSettings.tsx`): a `Push` column beside Email, rendered only when `('serviceWorker' in navigator && 'PushManager' in window)`; default **OFF** (opt-in). On iOS-non-standalone, show "Add Co-Lab to your Home Screen to enable push" instead of a dead toggle.

## End-to-end flow

```
Co-Lab event (DM / mention / thread reply)
   │
   ▼
lib/team/notifications.ts ── per-channel fan-out: in_app · email · sms · [push]
   │   push branch → for each member with push ON + a stored subscription:
   ▼
web-push (VAPID-signed) ──► Browser Push Service (FCM / Mozilla / Apple / WNS)
   │
   ▼
Service Worker 'push' ──► showNotification("New Co-Lab message", { data.url })
   │  (member clicks)
   ▼
'notificationclick' ──► focus or open  https://soullab.life/team/<channel>
```

## What exists / net-new / pre-existing-broken

- **Reuse:** event×channel prefs model + `lib/team/notifications.ts` fan-out (just add a branch); `consciousness-sw.js` push handlers (adapt).
- **Net-new:** `'push'` channel in the enum + DEFAULTS; `member_push_subscriptions` table + migration; `lib/push/*` (VAPID + send + subscribe endpoints); SW registration on `/team`; Push column in the settings UI.
- **Pre-existing-broken (decide whether to touch):** `PWAProvider` registers a missing `sw-enhanced.js` and isn't mounted. v1 (scope A) can ignore it; a proper app-wide PWA fix is a separate task.

## Consent / sovereignty

Opt-in by construction (browser permission + default-OFF prefs). Content-free alerts only — no message content leaves Co-Lab, same canon line as email/SMS. Member can revoke OS/browser permission or toggle off anytime; on `410 Gone` the server prunes the dead subscription.

## Validation

- Desktop Chrome/Edge/Firefox: opt-in → real DM → content-free notification → click opens the right channel.
- Android browser + installed PWA: same.
- iOS installed PWA (16.4+): same; confirm Safari-tab correctly shows the "install to Home Screen" message, not a dead toggle.
- Opt-out respected; unsubscribed/expired endpoints pruned; VAPID signature valid.

## Open questions (for the build phase, not now)

1. SW scope — A (Co-Lab-scoped) vs B (fix app-wide PWA). Recommend A.
2. Reuse `consciousness-sw.js` vs a dedicated `colab-sw.js` (cleaner separation).
3. Batching ("5 new mentions") — future enhancement, not v1.
