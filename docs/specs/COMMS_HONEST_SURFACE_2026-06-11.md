# Communications Surface — Honesty Pass (Brief)

- **Date**: 2026-06-11
- **Goal**: Remove/mark mock communications UI so practitioners don't believe fake message history, delivery state, or contact activity is real.
- **Claim discipline**: this is "communications surface made honest," **not** "communications product complete."

## Scope (audited)

The only **mock communications** surface is **`/studio/comms`**. `lib/studio/mockMessages.ts` (7 hardcoded rows — Sarah Chen, Marcus Johnson, incoming SMS, MAIA/System notifications, Triage Queue) feeds exactly:
- `app/studio/comms/page.tsx` (list — `useState(initialMessages)`, no fetch)
- `app/studio/comms/[messageId]/page.tsx` (detail — `mockMessages.find()`)
- `components/studio/CommsMessageDetail.tsx` (imports the `Message` **type** only)

**Untouched (real data — leave intact):**
- `components/comms/*` (`InboxList`, `ThreadView`, …) → `/stellium/comms`, live `/api/comms/inbox`
- `components/maia/CommsQuickAccess.tsx` → live `/api/comms/inbox?count_only=true`
- The verified SMS wire: `/api/notifications/sms` send + `sms_delivery_status` + StatusCallback (#404/#406/#411/#413)

**Out of scope (flagged, not touched — not "communications"):** mock/sample data in other Studio pages (`clients`, `marketing/contacts`, `teams`, etc.).

## What real data can populate `/studio/comms` today?

- **Outbound SMS** — real and works (the "Compose SMS" button). But sent content is **not stored** (`sms_delivery_status` keeps SID/status only, no recipient/body — sovereignty choice), so there is **no displayable sent history**.
- **Inbox/email/inbound SMS** — **not wired to this surface.** A real inbox (Comms Spine) exists but is wired to `/stellium/comms`, not Studio.

**Implication for honesty:** an empty state that says "Messages, email, SMS will appear here" would itself be **aspirational** — it promises inbound that isn't wired. The copy must reflect what's actually Live (SMS *sending*) vs not-yet-connected (inbox/email).

## Options

**Option A — Honest empty state + keep the real Compose SMS (recommended, minimal).**
- Remove the mock data; list starts empty; `selectedMessage` defaults to `null`.
- Move the `Message` type to `lib/studio/commsTypes.ts`; delete `mockMessages.ts`.
- Honest empty state (copy below). Keep Compose SMS (it's Live + verified).
- Hide the filter tabs (All/Unread/Email/…) and search while empty (they imply content/features that aren't there).
- Files: `app/studio/comms/page.tsx`, `app/studio/comms/[messageId]/page.tsx`, `components/studio/CommsMessageDetail.tsx`, + new `lib/studio/commsTypes.ts`, − `lib/studio/mockMessages.ts`.

**Option B — Mark the whole surface "in development" (comingSoon) and hide it.**
- Discards the real, verified Compose SMS. Heavier-handed; loses working function. Not recommended.

**Option C — Wire `/studio/comms` to the real Comms Spine inbox (`/api/comms/inbox`).**
- Makes it show real data, but that's an **integration/feature**, explicitly deferred by this track's scope ("no new messaging features yet"). Defer.

## Empty-state copy (pick one — trust-critical wording)

**C1 — plainest, foregrounds what's Live:**
> **No messages yet**
> You can send an SMS with Compose. Incoming messages and email aren't connected to this view yet.

**C2 — slightly warmer, still honest about not-yet:**
> **Your communications hub is taking shape**
> SMS sending is live. Your inbox, email, and session follow-ups will appear here as they're connected.

C1 is the stricter claim-discipline choice (states Live, marks the rest absent). C2 reads better but edges toward a soft promise ("will appear … as they're connected").

## Recommendation
**Option A + copy C1.** Minimal, removes all fake data, preserves verified function, and the empty state makes no claim the system can't keep.

## Verification plan
Run the dev server, load `/studio/comms`, screenshot the empty state (desktop + mobile), confirm: no fake rows, Compose SMS still sends, `[messageId]` route shows "not found" gracefully.
