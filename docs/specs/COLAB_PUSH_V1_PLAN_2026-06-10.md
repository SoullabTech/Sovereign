# Co-Lab Push Notifications — v1 Implementation Plan

**Date:** 2026-06-10
**Branch:** `feature/colab-push-notifications` (off `clean-main-no-secrets` @ `563d1110b`)
**Status:** Plan only. **No build, no merge, no deploy.**
**Pairs with:** `COLAB_PUSH_NOTIFICATIONS_2026-06-10.md` (rationale + service-worker scout findings).

> **v1 in one line:** Co-Lab-scoped push first. Dormant behind runtime VAPID config. Alert-only. Default OFF. No app-wide PWA repair in v1.

## Decisions locked

1. **Runtime VAPID public key** — served from an API endpoint, **not** `NEXT_PUBLIC_*`. Avoids the build-time inlining trap (CLAUDE.md), so activation stays **env + restart**, no rebuild.
2. **Dedicated `/team` service worker** — a minimal `public/colab-push-sw.js` registered only on the Co-Lab surface. Reuse `consciousness-sw.js`'s handler *patterns*, not the file. **Do not touch** the broken app-wide `PWAProvider` / `sw-enhanced.js`.

## Dormancy contract (mirrors SMS)

`isPushConfigured()` is true only when the VAPID keys are present. Until then: the SW is not registered, no permission prompt fires, the prefs API rejects `push` writes, the send path is a no-op, and the settings UI hides the Push column. **The code deploys safe and invisible** before keys exist.

## Phased build (each phase lands dormant + green)

**Phase 0 — schema + channel (additive)**
- Migration: `member_push_subscriptions (id, member_id FK→members, endpoint TEXT UNIQUE, p256dh TEXT, auth TEXT, user_agent TEXT NULL, created_at, last_used_at)`. Additive/idempotent. One member → many devices.
- `lib/team/notificationTypes.ts`: add `'push'` to `NotificationChannel` + `NOTIFICATION_CHANNELS`; per-event `DEFAULTS` `push: false` (opt-in).
- Tests: defaults assert `push` OFF for every event.

**Phase 1 — server push core (dormant)**
- `lib/push/config.ts` — `getVapid()` reads `VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY` / `VAPID_SUBJECT`; `isPushConfigured()` = all three present. Mirrors `lib/sms/config.ts`.
- `lib/push/sendPush.ts` — VAPID-signed send via the `web-push` library; fire-and-forget; structural-log-only (`[push/send] sent { purpose, endpoint: '…tail', status }`); prune subscription on `404`/`410 Gone`.
- `lib/push/subscriptions.ts` — store / list-by-member / delete.
- Add `web-push` dependency (runtime only).
- Tests: dormant gate (no VAPID → no-op), send shape (mocked), prune-on-410.

**Phase 2 — routes (dormant)**
- `GET /api/team/push/vapid-public-key` — returns the public key at **runtime** (503 when unconfigured). This is decision (1).
- `POST /api/members/push-subscription` (store), `DELETE` (remove). Auth via existing `getMemberFromRequest`.
- Extend `app/api/team/notifications/preferences/route.ts`: accept `push` writes only when `isPushConfigured()` (else reject, exactly like `sms`); expose `push.available` + has-subscription status.

**Phase 3 — service worker + client (dormant)**
- `public/colab-push-sw.js` — minimal, **no caching**: `push` → `showNotification(title, { body, data: { url } })`; `notificationclick` → focus an existing `/team` client or open the deep link. Single responsibility; cannot interfere with app assets.
- `components/team/ColabPushProvider.tsx` (or a hook) mounted in the **team layout only** — registers `/colab-push-sw.js` when `push.available` && feature-supported; otherwise a no-op. **Does not touch `PWAProvider`.**
- Subscribe flow: on opt-in → `GET` the VAPID public key → `pushManager.subscribe({ userVisibleOnly: true, applicationServerKey })` → `POST` the subscription.

**Phase 4 — notify wiring (dormant)**
- `lib/team/notifications.ts`: add a `push` branch to the 3 notify functions (DM / mention / thread-reply), gated on `isPushConfigured()` + member pref + has-subscription, **independent** of email/sms. Content-free copy:
  - DM: `New Co-Lab message from {sender}` · Mention: `{sender} mentioned you in #{channel}` · Reply: `{sender} replied in #{channel}` — all with `data.url` deep-link, no body text.

**Phase 5 — settings UI**
- `components/team/NotificationSettings.tsx`: a **Push** column beside Email, default OFF, rendered only when `push.available` && `'serviceWorker' in navigator && 'PushManager' in window`. On iOS non-standalone: render **"Add Co-Lab to your Home Screen to enable push"**, never a dead toggle. Toggling on triggers the subscribe flow + browser permission prompt.

## Activation (when green-lit — env + restart, NO rebuild)

1. Generate keys: `npx web-push generate-vapid-keys`.
2. Set `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT` (`mailto:…`) in `.env.production` on minisforum.
3. Deploy the (gated) code, then restart `maia`. Because the public key is served at runtime (decision 1), **no rebuild** is needed — unlike a `NEXT_PUBLIC_*` flag.

## Verification

- Desktop Chrome/Edge/Firefox (+ Safari macOS): opt-in → real DM → content-free notification → click opens the right channel.
- Android browser + installed PWA: same.
- iOS installed PWA (16.4+): same; Safari **tab** correctly shows the install hint, not a dead toggle.
- Opt-out respected; expired/`410` endpoints pruned; VAPID signature valid; no message content in any payload.

## Gates & non-goals

- **Merge/deploy gated** (review). Tests-green is the precondition to *propose*, not to ship.
- **Out of v1:** app-wide `PWAProvider` repair; native iOS APNs; notification batching; any message content. SMS remains the later channel (`SMS_HANDOFF_BRIEF.md`).

## Files (summary)

| Net-new | Modified |
|---|---|
| migration `member_push_subscriptions`; `lib/push/{config,sendPush,subscriptions}.ts` (+tests); `app/api/team/push/vapid-public-key/route.ts`; `app/api/members/push-subscription/route.ts`; `public/colab-push-sw.js`; `components/team/ColabPushProvider.tsx` | `lib/team/notificationTypes.ts` (+`push`); `app/api/team/notifications/preferences/route.ts`; `lib/team/notifications.ts`; `components/team/NotificationSettings.tsx`; team layout (mount provider); `package.json` (`web-push`) |
