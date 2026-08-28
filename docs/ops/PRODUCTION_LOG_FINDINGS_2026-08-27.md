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

---

# VOICE-SOVEREIGNTY-01 — runtime acceptance

Deployed SHA `37bbf0c23` (merge of PR #1113), provenance verified at the
container: `docker exec maia-sovereign printenv GIT_COMMIT` → `37bbf0c23`.

Finding §0 of this document recorded the violation: `[tts.attempt]
provider:"openai" voice:"alloy" reason:"auto/cloud lead"` on ordinary member
turns while Kokoro was healthy. This section records whether the deployed unit
ended it, under the acceptance conditions the founder ruling set (A / B / C).

## A + B — PASS (witnessed together)

A and B were satisfiable in a single walk because the founder's own account is
the cloud-preference case. `member_voice_preferences` at the time of the walk:

```
              member_id               | tts_provider
--------------------------------------+--------------
 17a14614-2bda-44b2-b282-fb1a67cff097 | auto
 3946706a-3082-47e6-8d72-b627a8f22b55 | auto
 826ca5fd-455d-4204-9bf4-88926f7de999 | auto
 ce284751-e457-42f6-89b6-bc07d0876682 | cloud
```

`ce284751` is the founder's primary member record (27,305 conversation turns).
Its stored preference is `cloud` — the exact input that produced the violation.

Four consecutive spoken turns, each emitting the same three lines:

```
[tts.resolve] {"path":"stream-conversation","ttsProviderPref":"cloud",
               "openaiVoice":"alloy","kokoroVoice":"af_kore","localEnabled":true}
[tts.policy]  {"storedPreference":"cloud","effective":"local",
               "note":"cloud voice unavailable under current sovereignty policy;
                       member preference preserved"}
[tts.attempt] {"provider":"kokoro","voice":"af_kore","reason":"sovereign_primary"}
```

`provider:"openai"` appeared zero times across the window.

Three things in that trace are load-bearing, and each was a design decision
rather than a side effect:

1. **`effective:"local"` under `storedPreference:"cloud"`.** The preference that
   used to route cloud now resolves local. This is the violation closing.
2. **`reason:"sovereign_primary"`, not `openai_fallback`.** Local is not
   catching a cloud failure; local is the authority. The log distinguishes the
   two, so a future regression to fallback-shaped behaviour is visible.
3. **The DB still reads `cloud`.** Re-querying after the walk shows the stored
   value unchanged. The system did not rewrite the member's choice to make
   itself internally consistent. A policy change is not consent to edit what
   someone said they wanted.

### Note on reading these logs

`[tts.policy]` fires **only** when the stored preference is literally `cloud`
(`resolveVoicePreference` sets `cloudRequestedButUnavailable` on that value
alone). For an `auto` or unset member it never fires, and its absence means
nothing. The unconditional entry marker is `[tts.resolve]`; if that is missing,
no server-side synthesis ran at all and the window proves neither pass nor fail.

Two earlier acceptance attempts produced empty greps that were misread as
evidence. Both were window errors, not results.

## C — NOT YET RUN

Two attempts have failed to produce a valid C window, both the same way: `docker
stop maia-kokoro-tts` and `docker start maia-kokoro-tts` executed back to back
with no turn spoken between them, and a `--since` window wide enough to reach
back past the stop and re-capture healthy pre-stop turns. The second attempt's
output showed Kokoro apparently succeeding while stopped — which is the
signature of that error, not of a passing test.

C requires a turn spoken **while** `maia-kokoro-tts` is down, and a log window
that begins **after** the stop.

Expected on pass:

- `[tts.resolve]` present, `[tts.attempt] provider:"kokoro"` present and failing
- `provider:"openai"` absent
- MAIA's text still arrives
- the voice-unavailable state shown to the member is truthful

`CloudVoiceForbidden` may or may not appear, and its absence is **not** a
failure. Because `cloudVoicePermitted()` is false, `openaiDisabled` is already
true in `stream-conversation`, so that route never enters the OpenAI block to
begin with; the throw fires only if `ttsRouter` internally attempts to construct
`TTSFallbackToOpenAI`. Refusing to reach the gate and being stopped by the gate
are both passes. This is the same reading error as `[tts.policy]` above, and is
written down here so it is not made a third time.

## Status

`VOICE-SOVEREIGNTY-01` is **STATIC + TEST + RUNTIME(A,B)**. It is not yet
RUNTIME-proven; the ruling requires A **and** B **and** C.

## Scope boundary — a second violation, not covered

`app/api/voice/preview/route.ts:141` imports `synthesizeSpeech` from
`lib/tts/openaiTts` **directly**, bypassing `ttsRouter` and therefore bypassing
`assertCloudVoiceAllowed`. On `37bbf0c23` today, a member on `auto` or `cloud`
who plays a voice preview in settings still executes OpenAI TTS:

```
[tts.attempt] {"path":"preview","provider":"openai","reason":"auto/cloud lead"}
```

PR #1113's body stated that legacy OpenAI-TTS call sites exist outside the
resolver and are out of scope, and the founder explicitly accepted that
boundary. This is that boundary made specific. It is recorded here because
"the production resolver violation is closed" is true of the conversation path
and only of the conversation path — it is not a repository-wide claim that no
OpenAI TTS can execute.

Candidate second unit. Not opened; awaiting a ruling.

---

# Desktop findings — 2026-08-27 PWA console walk

Both surfaced in a browser console capture during a VOICE-SOVEREIGNTY-01
Runtime C attempt. Neither bears on the sovereignty verdict, and neither is
allowed to: C lives or dies on server-side provider attribution alone.

## D02A — FALSE LISTENING STATE  (high priority)

Observed, verbatim from the console:

```
[liveness] Capture silent for 16s (silent_death) — mic said "listening" and was not.
[liveness] Capture loss detected: silent_death (NO_AUDIO_FRAMES)
voice_capture_lost { cause: 'silent_death', reasonCode: 'NO_AUDIO_FRAMES',
                     session: 'iwaij27x', ua: '...Chrome/151.0.0.0 Safari/537.36' }
[voice-status] error NO_AUDIO_FRAMES (recoverable=true)
```

The mic state machine held `LISTENING` for sixteen seconds while producing zero
audio frames. The UI told the member it was hearing them; it was not.

This is the **silent-success class** — the same failure shape as a green log
line that proves nothing, and the same shape as the three voided Runtime C
windows above. A system that reports a state it is not in is worse than one
that reports failure, because it spends the member's trust to do it.

### Acceptance

The UI may never continue presenting "hearing" or "listening" once capture
liveness has crossed the silent-death threshold.

Required behaviour, in order:

```
detect
  → change the visible state
  → attempt bounded recovery
  → if recovery fails, tell the member truthfully
```

Note that the detector already exists and already fired — `[liveness]` named
the condition correctly and `recoverable=true` was set. What did not happen is
the visible state changing to match. So this is not a detection gap; it is a
gap between what the system knows and what it shows. That is the narrower and
more tractable repair, and it is also the more serious defect: the system was
not confused, it was silent.

## IDENTITY-BOOT-RACE  (lower priority)

```
/api/relationship-essence?soulSignature=soul_guest → 403
[ANAMNESIS] Failed to load essence, continuing as first encounter
...moments later...
[ANAMNESIS] Essence loaded via API (1790 encounters)
[GREETING] Recollection greeting for Kelly (1790 encounters)
[Identity] Healing from explorerId: ce284751...
```

The essence request fires under `soul_guest` before authenticated identity
resolves, takes a 403, and falls back to first-encounter. The authenticated
essence then loads and the greeting corrects itself.

Self-correcting here, so it is lower priority than D02A. But the failure mode
is not cosmetic: on a slow load the first-encounter greeting can win the race
and a member with 1790 encounters is met as a stranger. Being forgotten by
something that has known you for 1790 encounters is a sovereignty-adjacent
harm, not a rendering bug — it just happens to be rare rather than wrong.

## Not investigated — "code spoken aloud"

A report that MAIA read code aloud in the robot voice. The turn captured in
this walk had the response text *"Hi — I'm here. Both of them landed."*, which
contains none, so the report belongs to a different turn.

⛔ Deliberately not chased. Without a timestamp or identifiable turn, any
repair would be guess-driven, and this document already records five wrong
diagnoses made ahead of measurement. Reopen when a concrete turn or time is
available.

---

# VOICE-FAILURE-EATS-THE-TURN  (high priority)

Found while running VOICE-SOVEREIGNTY-01 Runtime C. Not what the test was
looking for, and more serious than what it was looking for.

## What happened

```
21:31:17  assistant  "I hear you, Kelly. I'm right here."   Kokoro up   → PERSISTED
21:31:45  docker stop maia-kokoro-tts
21:35:44  Runtime C window opens
          3× [tts.attempt] provider:"kokoro" reason:"sovereign_primary"
          3× [tts-router] Kokoro failed (kokoro_error): fetch failed
          3× CloudVoiceForbidden — gate refused the OpenAI escape
          conversation_turns rows in window: ZERO
21:40ish  docker start maia-kokoro-tts
```

A turn occurred. Three `[tts.attempt]` lines mean MAIA generated text and the
synthesizer was called on it. It left no row.

## Why this is established rather than inferred

Three explanations were possible for zero rows, and one query separated them:

- **Wrong window** — ruled out. `SHOW TimeZone` → `Etc/UTC`, and `db_now`
  matched wall clock. The window was in the right frame.
- **Write path down** — ruled out. Two turns at 21:30:31 and 21:31:17 wrote
  normally, minutes before the stop, and the earlier 21:20 turn logged
  `[apiFetch] POST /api/conversation/turns` + `Synced exchange to sovereign
  database` client-side.
- **The turn genuinely was not persisted** — what remains.

## The open half, and why it decides the repair

Whether the member SAW the text is not in any log or table. It splits the
defect in two, and the repairs differ:

- **Text appeared but was not persisted** → persistence is coupled to TTS
  success. A member whose voice engine is down keeps talking and MAIA
  remembers none of it. Silent memory loss.
- **Text never appeared** → the turn collapses entirely on TTS failure, and the
  canon's "local unavailable → text response + truthful voice-unavailable
  state" clause is not implemented at all.

Both fail Runtime C's "MAIA text arrives" criterion.

⛔ Not diagnosed further here. This document already records five diagnoses
made ahead of measurement, every one wrong. The eyewitness answer is one
question away and settles it.

## Why it outranks D02A

False listening wastes a member's breath. This loses what they actually said.

And it is the same **silent-success class** for the third time today — after
D02A's LISTENING-with-no-audio-frames, and after three Runtime C windows whose
empty greps read as evidence and were not. The system reported nothing wrong.
It simply did not keep anything.

For a project whose memory is the thing that makes it more than a chatbot,
losing a turn without saying so is the worst shape a failure can take: it
cannot be noticed at the moment it happens, only later, as an absence the
member will experience as being forgotten.

---

# CLAIM-DISCIPLINE / SELF-MODEL — MAIA misdescribes her own architecture

Observed on MAIA Desktop, 2026-08-27, during D04A runtime preparation. Recorded,
not fixed. Outside D04A scope; no Desktop code change.

## Observed

The member asked what was happening with MAIA's voice. She answered:

> "I don't actually have a voice on my end I'm text-based here, so I'm not
> generating any audio. What you're hearing would be coming from whatever app or
> interface you're using to interact with me."

## Contrary runtime facts

```
maia:audio          a RATIFIED preload push channel, purpose recorded in
                    test/d01-preload-allowlist.mjs — "MAIA's synthesized voice as
                    base64 + format, outward only"
renderer play()     Desktop plays that audio; only the renderer has an output device
Kokoro              synthesized on production the same evening — witnessed
                    [tts.attempt] provider:"kokoro" reason:"sovereign_primary"
                    across four consecutive turns
```

Voice synthesis is not a property of "whatever app the member is using". It is
part of the deployed MAIA architecture, decided server-side by the sovereign
voice path, and delivered to the surface on the same call that produced the
words — deliberately, so voice and text cannot diverge.

## Risk

MAIA confidently misrepresents an actual capability of her own system, and does
it in the register of helpfulness — offering to "help you think through" a
problem she has just located in the wrong place.

⭐ The load-bearing distinction: **MAIA need not claim she EXPERIENCES having a
voice.** She is not required to assert an inner life, and refusing to is right.
But she must accurately describe the system she is participating through.
"I am text-based and no audio is being generated" is not humility about
experience — it is a false statement about architecture, made while that
architecture is running.

A companion that misdescribes what it IS teaches the member to discount
everything else it says. That cost is not paid at the moment of the error; it is
paid later, when something true needs to be believed.

## Disposition

```
recorded finding
outside D04A scope
no Desktop code change
requires later prompt / architectural self-description treatment
```

⛔ Deliberately not repaired here. The repair is a change to how MAIA is told
what she is, which is a claim-discipline and prompt matter rather than a Desktop
one, and belongs to whichever lane owns MAIA's self-description. Fixing it inside
a continuity unit would bury a canon-level correction in an unrelated diff.
