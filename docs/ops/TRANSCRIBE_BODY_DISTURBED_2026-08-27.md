# `Response body object should not be disturbed or locked` — `/api/voice/transcribe-simple`

**Found** 2026-08-27, during the MAIA Desktop device walk.
**Deployed commit at time of finding** `04f621bf9` (`deploy-lane`).
**Status** ✅ RESOLVED — fixed, deployed, and witnessed on device 2026-08-27.
Founder ruling: option A (exclude the route from the middleware matcher).
Merged as PR #1111; deployed as `92bc2a9df` with provenance verified
(`[deploy-ctx:ok] GIT_COMMIT=92bc2a9df == asserted`).

---

## 1. What happens

Large multipart POSTs to `/api/voice/transcribe-simple` fail with HTTP 500. The
body returned is not the route's JSON — it is Next's `/_error` page — and the
container log shows:

```
 ⨯ TypeError: Response body object should not be disturbed or locked
     at new i (.next/server/chunks/95873.js:15:2021)
     at l.fromNodeNextRequest (.next/server/chunks/95873.js:1:4614)
     at F (.next/server/app/api/voice/transcribe-simple/route.js:20:5340)
```

`fromNodeNextRequest` is Next constructing the web `Request` from the Node
request. **This throws before any application code runs.** The route's own
logging (`🎤 [TRANSCRIBE-SIMPLE] Request received`) never appears for a failing
request, `getMemberIdFromRequest` is never called, and Whisper is never reached.

## 2. Why it is not a size limit, a duration limit, or a timeout

Each of those was proposed during the walk and each was disproved by measurement.
The full sample, byte size and duration against outcome:

| rate | seconds | bytes   | result |
|------|---------|---------|--------|
| 48k  |  3.7    |  352300 | 200    |
| 48k  |  3.9    |  370220 | 200    |
| 48k  |  4.3    |  414508 | 200    |
| 48k  |  3.8    |  363308 | 200    |
| 48k  |  9.0    |  861996 | 200 — 339 chars |
| 48k  | 15.2    | 1455660 | 200 —  75 chars |
| 48k  |  5.5    |  527148 | 500    |
| 48k  |  7.2    |  692780 | 500    |
| 48k  | 12.3    | 1179436 | 500    |
| 48k  | 21.9    | 2107692 | 500    |
| 16k  |  6.0    |  193140 | 200    |
| 16k  |  6.5    |  208744 | 200 — 43 chars |
| 16k  |  9.8    |  314070 | 500    |
| 16k  | 14.3    |  458404 | 500    |
| 16k  | 19.8    |  633948 | 500 (and 500 on retry) |

1455660 bytes succeeded; 314070 bytes failed. 9.0 s succeeded; 7.2 s failed.
There is no monotonic threshold in either axis. The behaviour is **intermittent
with a bias toward larger bodies**, which is the signature of a stream that is
sometimes fully buffered before Next reads it and sometimes not.

A `Content-Length` hypothesis was also tested and falsified: Desktop now builds
the multipart envelope as one contiguous buffer so `fetch` sets an explicit
length, and large bodies still fail identically.

## 3. Mechanism

`middleware.ts` matches every route except three static prefixes:

```ts
matcher: ['/((?!_next/static|_next/image|favicon.ico).*)']
```

Because the matcher matches, Next buffers the request body so middleware can
run, then reconstructs a `Request` for the route handler from the same Node
stream. When that stream has already been consumed, construction throws
`disturbed or locked`.

Middleware itself never touches the body — it makes path-based decisions only
(field/studio boundary, access check, dev headers). The disturbance is in Next's
plumbing for a body-carrying request on a middleware-matched route, not in
application code.

`next.config.js` already carries a related scar in this exact area:

```ts
// Request-body buffer for routes that pass through middleware.
// Next's default is 10 MiB. Because middleware.ts matches every API route,
// that default silently truncated manuscript uploads…
middlewareClientMaxBodySize: 30 * 1024 * 1024,
```

That fixed truncation. It did not address the reconstruction failure.

## 4. Blast radius — this is NOT Desktop-specific

Any client posting a large enough body to a middleware-matched route can hit
this. Desktop found it first only because it sends uncompressed WAV, where a
10-second turn is ~320 KB, while every browser client of this route uses
MediaRecorder (webm/opus), where the same turn is ~20 KB and lands well inside
the range that succeeds.

**Worth checking before this is closed:** Session Room chunked audio upload
(`ALLOW_AUDIO_UPLOADS`), `/api/studio/sessions/[id]/voice-notes`, and manuscript
ingest. If any of them intermittently 500s on large inputs, it is probably this.

## 5. Candidate fixes — NOT applied, founder decision required

**A. Exclude the route from the middleware matcher.** ⭐ CHOSEN AND APPLIED.
Narrowest change; removes the buffering path entirely for this route.

⚠️ CORRECTION to this document's first draft. It claimed the exclusion would
cost a defence-in-depth layer, because `checkAccess` returns 401 JSON for
unauthenticated `/api/*`. **That was wrong, and it was asserted without being
checked.** The 401 branch only fires when a rule denies the path. Verified
against the real matcher:

```
matchRule('/api/voice/transcribe-simple')  →  null   (no rule; unmapped)
getAccessMode()                            →  'permissive'
```

No rule in `config/accessMatrix.ts` matches `/api/voice/*`, and an unmapped
path under `permissive` is ALLOWED. Middleware was already waving this route
through without authenticating it. **The exclusion costs nothing.**

The route's own protections are untouched: `getMemberIdFromRequest` → 401, the
`ALLOW_AUDIO_TRANSCRIPTION` / `ALLOW_AUDIO_UPLOADS` gate, the multipart guard,
the 25 MB cap, and local-Whisper-only transport.

Scope is one path, not `/api/voice/*` — a namespace exclusion would silently
remove future routes from the matcher as they are added.

**B. Upgrade / patch Next.**
The failure is in framework code (`fromNodeNextRequest`). If a fixed release
exists, this is the correct fix and changes no security posture. Requires
checking the installed Next version against the upstream issue.

**C. Make bodies small enough to stay on the working path.**
Desktop already sends 16 kHz instead of 48 kHz — Whisper's native rate, a third
of the bytes, no accuracy lost. Going further (opus encoding, or splitting an
utterance at its quietest interior point) would keep Desktop under the failing
range without a server change.

⛔ Rejected as a primary fix. It leaves the defect in place for every other
client, and it would impose a ~8-second speech limit that no member should ever
meet. It is a fallback if A and B are both unavailable, not a resolution.

## 5a. The fix, and its proof

`middleware.ts` — matcher only:

```diff
- '/((?!_next/static|_next/image|favicon.ico).*)',
+ '/((?!_next/static|_next/image|favicon.ico|api/voice/transcribe-simple).*)',
```

`__tests__/middleware-transcribe-exclusion.test.ts` asserts five things, two of
which are the *premise* rather than the change — so if the premise stops
holding, the test fails instead of the exclusion quietly becoming a hole:

1. middleware does not run on the transcription route
2. middleware still runs on `/api/voice/transcribe`, `/api/voice/openai-tts`,
   `/api/sovereign/*`, `/api/members/signin`, `/api/studio/*`, `/maia`, `/`
3. exactly one path is excluded, not the `/api/voice` namespace
4. PREMISE — `matchRule` returns null for this path and the mode is permissive
5. PREMISE — the route still authenticates itself and keeps every gate

Negative controls, both bite:

- pre-fix matcher restored → (1) fails; the request is intercepted
- exclusion widened to `/api/voice` → (2) and (3) fail

⚠️ EVIDENCE CLASS. This is a STATIC proof of the matcher and the premise. Jest
could not be run in the authoring environment (no `node_modules`), so the
assertions were executed through an equivalent standalone harness; the jest
suite itself has not been run. And no static test can show a multipart POST
arriving at the handler with `x-session-token` intact — that is RUNTIME
evidence and it comes from the device walk after deploy, not from here.

## 6. What Desktop does today

Nothing that hides this. A 5xx whose body is not the route's own JSON is retried
up to three attempts total — `maia-desktop/src/conversation.js` — because the
failure measured close to a coin flip and one retry still lost about a quarter
of turns. After three the member is shown the server's actual message rather
than a bare status code. Never on a 4xx, and never on a 5xx the route itself
answered.

The retry is labelled a mitigation in the source, with the condition under which
it must be removed: it is safe only because a failed transcription stores
nothing and forms no memory, and it comes out when this fix is deployed and
proven on device.


---

## 7 · RUNTIME WITNESS — the evidence class the static proof could not supply

Device walk, 2026-08-27, after `92bc2a9df` went live. Nine consecutive spoken
turns on a Mac, no Terminal touched.

**Zero failures. Zero retries.** Every `voice_transcribe_sent` is followed by a
`voice_transcribe_result`; `errorName=http_500 source=non_route` does not appear
once, and neither does `source=retry`.

| bytes  | seconds | result |
|--------|---------|--------|
| 914816 | 28.6    | 200 · 80 chars |
| 661254 | 20.7    | 200 · 265 chars |
| 520820 | 16.3    | 200 · 102 chars |
| 505216 | 15.8    | 200 · 73 chars |
| 403792 | 12.6    | 200 · 128 chars |
| 390138 | 12.2    | 200 · 89 chars |
| 351128 | 11.0    | 200 · 56 chars |
| 345278 | 10.8    | 200 · 34 chars |
| 284812 |  8.9    | 200 · 58 chars |

Before the fix, a 20-second turn failed roughly half the time and 583236 bytes
failed twice in a row. After it, 914816 bytes at 28.6 seconds — larger and
longer than anything that had ever succeeded — went through on the first
attempt.

⭐ The prediction was stated in advance and was falsifiable: *the 500s should
stop entirely, not become rarer; if they persist, the matcher was not the cause
either.* They stopped entirely. That matters because three earlier explanations
(a size limit, a duration limit, a missing `Content-Length`) were each
consistent with the data available when proposed and each was wrong; this one
was the first to make a prediction that could have failed.

### 7.1 A new finding the walk surfaced

One turn produced a looping Whisper hallucination — a single phrase repeated
thirty-plus times. Its diagnostics identify it immediately:

```
voice_transcribe_sent bytes=661254 seconds=20.7 peakX1000=127 rmsX1000=8
```

`peak 127 / rms 8` against a normal speech reading of `peak ~1000 / rms 70–100`.
That turn was ~20 seconds of near-silence, and Whisper's multilingual `base`
model hallucinates repeated phrases when given one. **Not a transport defect and
not a language-detection fault** — the model behaving as it does on empty input.

This is exactly what the `peak`/`rms` fields were added for. Before them the
turn would have been indistinguishable from a transcription failure. Belongs to
D02 (voice reliability): a near-silent epoch should probably not be dispatched
at all.

### 7.2 A second observation, unactioned

`peakX1000` reads 1002–1005 on most turns — above 1.0, meaning the input is
clipping before `encodeWav` clamps it. Input gain is hot. Recorded, not fixed;
it is a D02 item and no transcript has yet been visibly harmed by it.

### 7.3 The retry mitigation — its removal condition is now met

`maia-desktop/src/conversation.js` carries a three-attempt retry labelled a
mitigation, with a written condition: *it comes out when the server is fixed.*
The server is fixed and the walk shows the retry never firing.

⛔ Not removed in this pass, and not silently kept either. One walk is runtime
evidence, not longitudinal evidence, and the retry is narrow, bounded and inert
when the path is healthy. Flagged as an open decision so the condition is
honoured deliberately rather than forgotten.
