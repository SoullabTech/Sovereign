# Push notifications to the iOS app: scoping (DRAFT, 5 Nov 2026)

**Status:** scoping only. Nothing here is authorized, built or deployed. Read-only census of the repository (`origin/clean-main-no-secrets` at `f179bf945`) and production.

## Why
Email failed silently for five weeks (29 Sep to 5 Nov). The failure alert now posts to the private `#ops-alerts` channel and can text, but Twilio texting is carrier-blocked (error 30034): of 383 Twilio messages since 2 Feb 2026, 359 were undelivered for that reason and about 8 were delivered or read (the `read` ones can only be WhatsApp). The founder prefers in-app channel and email, and a way to be buzzed that Soullab owns. Push to the iOS app needs no carrier and no registration.

## What exists today (evidence: code read, production read)
| Fact | Source |
|---|---|
| iOS app id `life.soullab.maia`, team `ZVK2X646Z2` | `ios/App/App.xcodeproj/project.pbxproj` |
| Entitlements contain only Sign in with Apple; **no `aps-environment`** | `ios/App/App/App.entitlements` |
| Plugins registered: `LocalNotificationsPlugin` only; **no `@capacitor/push-notifications`** in `package.json` | `capacitor.config.ts`, `package.json` |
| `AppDelegate.swift` has no push registration | grep: no matches |
| Local notifications only ask permission in `lib/platform-adapters/ios-adapter.ts` | grep |
| No device-token table (`client_subscriptions` is unrelated) | production schema read |
| `member_notification_preferences(member_id, event_type, channel, enabled)` exists, 1 row | production read |

## Shape of the build
1. **iOS (native change, needs a new TestFlight build):** add `@capacitor/push-notifications`, enable the Push Notifications capability (`aps-environment` entitlement), forward the token callbacks in `AppDelegate`, ask permission only on an explicit member choice.
2. **Server:** table `member_push_devices` (member, device token, environment, created, last seen, revoked); `POST`/`DELETE /api/members/push-device` using the existing `apiFetch` header path; sender `lib/push/apns.ts` speaking HTTP/2 to Apple with an ES256 token signed by the APNs key. The key is a **file** mounted read-only and owner-only, the same pattern as the SMTP token, never an environment value.
3. **Alerts:** add `push` as a fourth path in `lib/ops/mailTransportAlert.server.ts`, sending to the founder's registered devices. The Monitor banner's "alert recipient configured" learns about it.
4. **Members (separate decision, later):** opt-in per event type through `member_notification_preferences` with channel `push`, default off, revocable, never during Sanctuary.

## What the founder provides
- An **APNs authentication key** (.p8 file, its Key ID) created in the Apple Developer account for team `ZVK2X646Z2`, and the Push Notifications capability enabled on App ID `life.soullab.maia`. The key is placed on minisforum by the founder; it is never pasted into chat.
- Installing the new TestFlight build on the founder's phone.

## Constraints and honest limits
- **Apple is in the path.** Every iOS push travels through Apple's service. Payloads must be **content-free** ("Email is failing"; never message text, names, memory or Sanctuary content).
- **Push is best-effort.** iOS can delay or drop it. It is a buzz, not the record: `#ops-alerts` and the Monitor banner remain the durable record.
- **Member safety is not solved by push.** A safety concern must reach a human by a path that confirms receipt. That is a separate decision, and the current text path for it is unproven.
- Android and web push are out of scope.

## Phases (each a separate approval)
- **P0** founder: APNs key and capability.
- **P1** server, dark: table, sender, endpoint, tests, behind no caller.
- **P2** iOS: plugin, entitlement, TestFlight build; the founder registers their own device.
- **P3** wire the ops alert to push; witness a real buzz.
- **P4** member opt-in, only on a separate ruling.

## Not in this note
No code, migration, key handling, build or deploy. No change to Twilio or the member-safety path.
