# Session Studio — unified session-material environment (candidate spec, 2026-07-19)

**Status: CANDIDATE. Authorizes nothing to build beyond the name change. Kelly directive (2026-07-19).**

## The reframe

"Session Room" was named for one capture path (record a live session). Its deeper role is broader: **the place where a practitioner brings session material — however it was captured — to recognize, understand, organize, and return to the work.** Renamed to **Session Studio** (label-only rename shipped separately; routes and DB `source='studio_session_room'` unchanged).

Product principle: **Capture may differ. The practitioner experience afterward should be one coherent room.**

## Four paths at the Session Studio threshold ("How would you like to begin?")

| Path | Meaning |
|---|---|
| **Start a session** | Record/host a session now (native room, or capture Zoom/Meet/Teams) — the current live path |
| **Upload a recording** | Bring in audio/video (Zoom recordings, voice memos, older sessions) → transcribe → detect/correct speakers → review |
| **Add a transcript** | Upload/paste TXT, DOCX, PDF, VTT, SRT, or pasted text (Zoom/Otter exports) → straight into review prep |
| **Return to a session** | Continue reviewing prior material |

All four converge on the **same canonical session-review object** and the **same Review-with-MAIA surface** (Overview / Elemental-Developmental / Organizational / Transcript+evidence).

## Non-negotiable safeguards (why this is gated)

1. **Consent + provenance threshold BEFORE processing** — uploader confirms authority/permission; session type; participant identity *optional*; AI-processing permission; retention choice (recording / transcript / review artifacts / none); presence of minors or sensitive third parties. MAIA never infers identity, consent, or ownership from a filename.
2. **Import creates an UNASSIGNED session object first.** Do NOT auto-create a client, relationship record, or `rl_session`. Association with a client is an explicit later action (keep standalone / connect to client / place in supervision / compare / delete). This directly extends the Parent Update ruling (no synthetic rl_session) — see [[project_staged_long_session_review]] Bug B.
3. **Never invent missing speaker attribution.** After transcription/upload, show a speaker-confirmation screen (Speaker 1 58% / Speaker 2 42% / unknown-overlap N) allowing rename / merge / split / mark-practitioner / mark-participant / leave-anonymous / declare-missing.
4. **Evidence-quality statement on every review** — speakers detected, attribution confidence, missing/corrupted sections, and whether the review is based on audio, supplied transcript, or both. ("Two speakers detected. Attribution confidence: high." vs "Partial record. One speaker appears missing. Interpretive conclusions may be incomplete.") Motivated by the 2026-07-19 audit: all 30 sessions are single-speaker undiarized.

## Why it matters

- **Fallback when live capture fails** (the single-speaker problem — a practitioner can bring the original Zoom recording or a transcript instead of losing the session).
- **Immediate usefulness** — practitioners have existing recordings/transcripts/archives; no waiting for the next live session to experience MAIA's value.
- **Historical learning** — bring several sessions with the same person: what changed over time, recurring themes, what helped, where agency increased, how the elemental balance shifted. This is where MAIA exceeds a transcription system.

## Proposed build sequence (each its own PR, gated)

0. **Rename Session Room → Session Studio** (label-only) — SHIPPING NOW.
1. **Transcript paste/upload** (TXT + pasted first; then VTT/SRT preserving timestamps+speakers) → unassigned session object → existing review. Smallest path that delivers value; no audio pipeline.
2. **Consent/provenance threshold** + speaker-confirmation screen + evidence-quality statement in the review.
3. **Audio/video upload** → async transcription (existing Whisper) → speaker detection → review. Preserve source per policy.
4. **Recording provenance surfaced + dual-track diarization** (Native Session Room Phase B) — see [[project_native_session_room]].

Depends on / relates to: [[project_staged_long_session_review]] (the review surface all paths enter), [[project_native_session_room]] (dual-track capture), [[feedback_recognition_precedes_identification]], the consent architecture (unassigned-first, no synthetic client/rl_session).
