# Session Room — Stop teardown trace (pre-existing finding)

**Date**: 2026-08-04
**Status**: FINDING — traced statically, not reproduced live, no code changed
**Relationship to `40c417fdf`**: SEPARATE. The pane-scroll change does not participate
in this path (see §6). This record exists so the acceptance walk for
`fix/session-room-stop-button-reachability` can be judged cleanly.

---

## 1. What endpoint receives and persists each final transcript segment?

`POST /api/supervision/transcript/stream`
→ `addTranscriptSegment()` (`lib/supervision/SupervisionStore.ts:254`)
→ table **`supervision_transcript_segments`**.

Chunks are produced by `recorder.ondataavailable`
(`lib/studio/RecordingContext.tsx:508`), on a 5-second cadence
(`recorder.start(5000)`).

**`/api/scribe/stop` is not the persistence path for segments.** It flips
`scribe_sessions.is_active/ended_at` and then COUNTs
`scribe_transcript_entries` — a *different* table from where live segments
land. The `Transcript entries: N` line it logs is therefore not a measure of
the live transcript and must not be read as one.

## 2. Does `/api/scribe/stop` wait for in-flight transcription work?

**No.** The whole route is one `UPDATE` plus two `COUNT` queries
(`app/api/scribe/stop/route.ts:61-80`). There is no job drain, no pending-chunk
check, no await on Whisper. It returns as soon as the row is flipped.

## 3. Does the server emit a final segment or completion event after Stop?

**Yes — the server side is fully capable.** `/api/supervision/scribe` is a
server-side poller. Each tick (`tickTranscript`,
`app/api/supervision/scribe/route.ts:99`):

1. reads `getTranscriptSegments(sessionId, { afterMs })` and emits
   `event: transcript` for anything new;
2. then reads `getSession(sessionId)` and, if `ended_at` is set, emits
   `event: session_ended` exactly once (line 131).

So a late-landing final segment *would* be emitted, followed by an explicit
completion event. The client even registers a handler for it
(`es.addEventListener('session_ended', …)`, RecordingContext.tsx:288).

**That handler never fires at Stop** — because the client hangs up first (§5).

## 4. Could `eventSource.close()` move until after the server confirms its flush?

**Structurally, yes.** Today `close()` runs synchronously at
`lib/studio/RecordingContext.tsx:629-631`, *before* any `await`. The server only
learns the session ended at step 4 below. Since the poller already emits
`session_ended` after draining segments, that event is the natural close
signal, with a timeout fallback so a wedged stream cannot hang teardown.

**Not proposed here.** Noted as feasible; the fix is out of scope for
`40c417fdf` and needs its own decision. See §8 for the direction as stated —
recorded, not ruled.

## 5. What does "Stop works while speech is arriving" currently guarantee?

Order of operations in `stopSession()` (`RecordingContext.tsx:625-660`):

| # | Step | Awaited? |
|---|------|----------|
| 1 | `mediaRecorder.stop()` → fires final `ondataavailable` | **No** — handler is `async`, unawaited |
| 2 | mic/tab tracks stopped, `AudioContext.close()` | — |
| 3 | `eventSource.close()` ← **client stops listening here** | — |
| 4 | `await /api/supervision/session/stop` (sets `ended_at`) | yes |
| 5 | `await /api/scribe/stop` | yes |

The final chunk's upload is kicked off in step 1 and races steps 2–5. It lands
*after* the stream is closed. So:

- **Recorder shutdown** — guaranteed (immediate, step 1–2).
- **Persistence of the final segment** — *probable but unawaited*. The upload is
  fire-and-forget; nothing blocks on it and no error surfaces to the member.
- **UI visibility of the final *in-flight* segment** — **structurally
  prevented.** The stream is closed before that chunk can be transcribed and
  polled. This applies only to audio still in flight at the moment of the
  click; segments already delivered over the SSE before Stop remain visible
  and are unaffected. That boundary — last-delivered vs. still-in-flight — is
  the thing to observe in the walk, not "the transcript disappeared."
- **All three** — no.

**Predicted live result: row 2 of the acceptance table** — final words not
visible immediately, present after reopening. This is a Stop/SSE presentation
race and is pre-existing.

## 6. Does the pane-scroll change participate?

**No.** The transcript effect is guarded by `phase === 'recording'`, so it stops
firing the moment Stop flips phase, and it reads a null-checked ref. The
Ask-MAIA effect keys on `maiaExchanges`, which Stop does not touch. Neither
effect writes state, touches the recorder, or holds a reference to anything in
the teardown path. The removed end-sentinel divs were scroll anchors only — no
observer, no teardown reference.

## 7. Note for acceptance rows 3 and 4

The reopen path reads the **supervision** store
(`assemble-transcript` selects `FROM supervision_sessions`), which is the same
family the final segment lands in. So "absent after reopening" would be a
genuine persistence signal, **not** a store-mismatch artifact.

Post-Stop visibility is prevented only for a segment still in flight at the
click. Words already delivered before the click remain visible; their absence
would be a different defect than the one traced here.

The one condition that could produce row 4 (loss) is the step-1 upload being
cancelled by page teardown. `handleStopSession` does not navigate — it awaits
and the phase changes in place — so the fetch should survive. If row 4 is
observed anyway, suspect chunk upload cancellation or Whisper failure, and
check for `[RecordingContext] Chunk #N upload failed` in the console.

## 8. Direction — RECORDED, NOT RULED

Stated during the trace review. **Not authorized. Not implemented. Needs its
own branch and its own acceptance instrument.** It must not enter the
reachability fix.

1. stop the recorder;
2. await completion of the final chunk upload;
3. call the server stop operation;
4. keep the SSE open until `session_ended`;
5. close the SSE after that event, with a bounded timeout fallback;
6. expose upload or flush failure rather than treating recorder shutdown as
   full success.

Step 6 is the one with member-facing consequence: today a failed final upload
is a `console.error` and nothing else — the member sees a session that stopped
normally.

