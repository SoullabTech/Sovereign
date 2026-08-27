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

## 0 · ⚠️ MAIA's voice is going through OpenAI in production

```
[tts.resolve] {"path":"stream-conversation","ttsProviderPref":"cloud",
               "openaiVoice":"alloy","kokoroVoice":"af_kore","localEnabled":true}
[tts.attempt] {"provider":"openai","voice":"alloy","reason":"auto/cloud lead"}
🔊 [openai-tts] request { model: 'tts-1', voice: 'alloy', hasApiKey: true }
🔊 [Audio] Sentence 0: 35712B MP3 via openai
```

**Not a bug — designed behaviour.** `app/api/voice/stream-conversation/route.ts`
routes `member_choice=local` to Kokoro with no fallback, and everything else —
`auto` or `cloud` — to *"OpenAI Alloy leads."* Kokoro is healthy and available
(`af_kore`, `localEnabled: true`); it simply is not selected.

Against the project invariant in CLAUDE.md:

> Never use OpenAI or other cloud AI providers.
> Voice: Local TTS/STT or browser APIs only.

A sovereignty gate already exists — `DISABLE_OPENAI_COMPLETELY=true`, or the
absence of `OPENAI_API_KEY` — and is currently OFF (`hasApiKey: true`,
`keyLength: 164`).

⭐ **This is the openai-tts canon conflict (MAIA-D00 §5.4) that MAIA-D05 has
been held behind, and it is no longer hypothetical.** It is live, on the default
path, for the founder's own member record. D05 was blocked on "decide the
canonical voice path first"; the decision is more urgent than the unit, because
the web and voice surfaces are already resolving it in one direction by default.

⛔ NOT CHANGED. Turning the gate on silences MAIA wherever a member has not
chosen local, and the member-choice mechanism is real and deliberate. This is a
canon decision, not an ops toggle.

## 2 · A prefixed id reaching a UUID column

```
❌ [POSTGRES] Query error: invalid input syntax for type uuid:
   "voice-0ea7253b-57f4-4456-a05a-b4b153ff9455"
```

Something passes `voice-<uuid>` where a `uuid` is expected, so the query fails
outright. The value is a UUID with a `voice-` prefix on it.

⭐ **ROOTED, and already known.** The consumers are
`lib/learning/conversationTurnService.ts` (`INSERT INTO maia_conversation_turns`,
reached via `🎓 [TRAINING] logTurn`) and `[field-monitor]`, which reports it as
`Telemetry failed (non-critical)`.

⭐ **A tripwire for this already exists** at
`app/api/voice/stream-conversation/route.ts:1143`:

> R4 TRIPWIRE: if this ever reports a uuid cast failure on a `voice-` prefixed
> session id, the UUID defect has become load-bearing for restoration and must
> stop being separately bounded.

It sits on the `MemoryBundleService.build` catch. **It has not tripped** — the
failures are in training capture and telemetry, not in memory restoration. So
this is a known, bounded defect behaving as bounded, not a regression.

What it costs while it stands: training turns and field telemetry are silently
not recorded for `voice-`-prefixed sessions. Conversation turns themselves are
unaffected (`conversation_turns` count 41264, healthy).

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
