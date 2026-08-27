# Production log findings — 2026-08-27, surfaced by the Desktop device walk

Found while diagnosing something else. None are Desktop defects; all are
platform-level. Recorded rather than fixed, because none were in the authorized
scope of the Desktop programme and two are not yet rooted.

Deployed commit at time of capture: `7f8886962` (PR #1112, on canonical,
carries the middleware fix from #1111).

---

## 1 · ⚠️ Email quota exhausted — passkey recovery is failing NOW

```
[EMAIL-CODE] Provider REFUSED the send for member=anonymous —
  status=error failureKind=quota_exceeded
  providerCode=monthly_quota_exceeded retryable=false
  error=You have reached your monthly email sending quota.
```

**The most member-facing item in this log.** `/api/members/recover` sends a
member their passkey and username by email — the documented recovery path for
"Forgot your passkey?" on `/signin` and `/test-elemental`. With the provider
quota exhausted, a member locked out of their account cannot get back in, and
the failure is `retryable=false`.

`member=anonymous` means this fired on an unauthenticated path, which is
consistent with recovery rather than with a routine notification.

Not diagnosed further: whether the quota is a plan ceiling reached legitimately
or a send loop consuming it. Both are worth checking before it is simply
raised.

## 2 · A prefixed id reaching a UUID column

```
❌ [POSTGRES] Query error: invalid input syntax for type uuid:
   "voice-0ea7253b-57f4-4456-a05a-b4b153ff9455"
```

Something passes `voice-<uuid>` where a `uuid` is expected, so the query fails
outright. The value is a UUID with a `voice-` prefix on it.

⛔ NOT ROOTED. Two sites mint `voice-${Date.now()}` —
`lib/voice/MaiaRealtimeWebRTC.ts:522` and `app/api/voice/persist/route.ts:90` —
but those produce `voice-<timestamp>`, not `voice-<uuid>`. **The failing value
comes from somewhere else, and that somewhere was not found.** Recorded with
the search that failed so the next person does not repeat it.

## 3 · A gap in `conversation_turns`, unexplained

No rows were written between **18:16:32** and roughly **19:37** — from any
surface, under any account. Conversations were visibly happening in that window
(a browser session `session_1787855636110`, minted ~18:33, left no rows at all;
so did an iPhone exchange).

Writes resumed and are healthy: `count 41256, max 2026-08-27 19:37:27`.

A container restart for the `7f8886962` deploy sits inside the gap at ~19:33.

⛔ **That is a coincidence, not a cause, and it is deliberately left that way.**
Four separate explanations were proposed during this walk on the same kind of
evidence — a body-size limit, a duration limit, a missing `Content-Length`, a
role-mapping bug — and every one was consistent with the data available and
every one was wrong. The pattern held until a measurement was taken.

If the gap recurs, the thing to capture is a live turn's log at the moment it
fails, not the shape of the gap afterwards.

---

## What this is NOT

Not a Desktop defect. Desktop reads `conversation_turns`; it does not write it.
The thread-adoption behaviour investigated alongside these findings was working
correctly the whole time — it was reading a table that, in that window, had
stopped receiving rows.
