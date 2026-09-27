# MAIA-FIELD-PRESENCE-04 — Launch Hardening

Status: **OPEN · LONG-CONVERSATION CONTINUITY + HEARING LIVENESS FIRST**

## Founder priority

The highest-risk launch defect is not visual. It is relational continuity:

1. a long conversation loses an earlier thread;
2. voice capture silently stops hearing the member;
3. either failure makes the member feel that MAIA is no longer with them.

These outrank cosmetic performance tuning.

## P04A — long-conversation continuity

The canonical service already reads the full durable current session, while keeping a bounded recent prompt aperture.

Hardening rule:

> Never widen the whole prompt merely to preserve continuity. Keep the recent aperture bounded, but carry truthful anchors from the displaced temporal middle.

The session thread spine now carries at most four deterministic anchors:

- opening anchor;
- earlier continuity anchor, selected by IDF-weighted overlap with the recent aperture;
- earlier relevant anchor for the current utterance;
- bridge into the recent window.

Explicit retrospective questions still use the existing verbatim current-session recovery mechanism, up to three recovered exchanges.

No summaries are invented. No member psychology is inferred. The source remains the durable current-session record.

## P04B — hearing liveness

Voice capture already has:

- recognition-state truth;
- capture-loss listeners;
- one-shot hands-free self-heal;
- Android no-speech bounded fallback;
- transcript salvage into an editable draft;
- visible member-facing voice-status callbacks.

Hardening repair:

> An automatic reconnect may never look like silent idle.

When capture loss triggers `VOICE_RECONNECTING_AFTER_GAP`, the parent now enters the visible `recovering` voice state until the microphone confirms live again or recovery fails.

If partial member speech survived capture loss, it returns to the text composer as an editable draft.

If bounded recovery fails, MAIA stops pretending to listen and makes text the obvious continuation path.

## P04C — remaining launch conformance

After P04A/P04B founder witness:

- iOS Safari / PWA voice start-stop-restart;
- background / foreground recovery;
- Bluetooth / track interruption;
- resize / orientation / keyboard geometry;
- reduced motion;
- long transcript rendering and scrolling;
- contained carrier geometry;
- frame-rate / animation load;
- dependency alignment, including the Next 15.5.11 / SWC 15.5.7 warning.

No redesign. No new symbolic states.
