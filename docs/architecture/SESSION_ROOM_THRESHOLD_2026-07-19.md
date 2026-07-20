# Session Room Threshold — arrival paths into accompaniment (2026-07-19)

**Status: ACTIVE specification for the Session Room threshold. Re-homed from the "Session Studio unified environment" candidate (carried on the closed, unmerged PR #648) after the Session Room & Studio ruling — see `SESSION_ROOM_AND_STUDIO_CANDIDATE_2026-07-19.md`. The rename it originally traveled with is superseded; the functional insight survives intact.**

## The insight

The Session Room was named for one capture path (record a live session). Its threshold is broader: **there are multiple arrival paths into accompaniment.** However the material was captured, the practitioner experience afterward should be one coherent room — the same review, the same lenses, the same witnessing.

Constitutional placement (per the Room/Studio ruling): bringing session material in to understand it is **arrival into accompaniment, not stewardship**. A person returning to a session is re-entering relationship. This is Room behavior, governed by the Session Room test: *does this deepen accompaniment within a relationship?*

## Four paths at the Session Room threshold ("How would you like to begin?")

| Path | Meaning |
|---|---|
| **Start a session** | Record/host a session now (native room, or capture Zoom/Meet/Teams) — the current live path |
| **Upload a recording** | Bring in audio/video (Zoom recordings, voice memos, older sessions) → transcribe → detect/correct speakers → review |
| **Add a transcript** | Upload/paste TXT, DOCX, PDF, VTT, SRT, or pasted text (Zoom/Otter exports) → straight into review prep |
| **Return to a session** | Continue reviewing prior material |

All four converge on the **same canonical session-review object** and the **same Review-with-MAIA surface** (Overview / Elemental-Developmental / Organizational / Transcript+evidence, with the Core / Spiralogic / Mentor lenses).

## Non-negotiable safeguards (why the build is gated per step)

1. **Consent + provenance threshold BEFORE processing** — uploader confirms authority/permission; session type; participant identity *optional*; AI-processing permission; retention choice (recording / transcript / review artifacts / none); presence of minors or sensitive third parties. MAIA never infers identity, consent, or ownership from a filename.
2. **Import creates an UNASSIGNED session object first.** Do NOT auto-create a client, relationship record, or `rl_session`. Association with a client is an explicit later action (keep standalone / connect to client / place in supervision / compare / delete). Extends the Parent Update ruling (no synthetic rl_session).
3. **Never invent missing speaker attribution.** After transcription/upload, show a speaker-confirmation screen (Speaker 1 58% / Speaker 2 42% / unknown-overlap N) allowing rename / merge / split / mark-practitioner / mark-participant / leave-anonymous / declare-missing. Document-supplied labels are evidence and are preserved verbatim; absent labels are never fabricated.
4. **Evidence-quality statement on every review** — speakers detected, attribution confidence, missing/corrupted sections, and whether the review is based on audio, supplied transcript, or both. Motivated by the 2026-07-19 audit: all 30 then-existing sessions were single-speaker undiarized.

## Why it matters

- **Fallback when live capture fails** — a practitioner can bring the original recording or a transcript instead of losing the session.
- **Immediate usefulness** — practitioners have existing recordings/transcripts/archives; no waiting for the next live session.
- **Historical learning** — several sessions with the same person: what changed over time, recurring themes, what helped, where agency increased, how the elemental balance shifted. (Note: cross-session reading is where authority crosses into the Studio — see the synthesis-in-both-spaces question in the Room/Studio paper §Ruling record 4.)

## Build sequence (each its own PR, gated)

0. ~~Rename Session Room → Session Studio~~ — **SUPERSEDED, closed unmerged (#648).** The Session Room keeps its name; the Studio is the surrounding stewardship environment.
1. **Transcript paste/upload** (TXT + pasted; VTT/SRT preserving timestamps+speakers follows) → unassigned session → existing review. **BUILT — PR #660** (parser + `POST /api/scribe/import-transcript` + threshold panel; consent-before-processing in minimal two-confirmation form; monotonic timeline; provenance in `summary.imported`).
2. **Consent/provenance threshold** (full form) + speaker-confirmation screen + evidence-quality statement in the review.
3. **Audio/video upload** → async transcription (existing Whisper) → speaker detection → review. Preserve source per policy.
4. **Recording provenance surfaced + dual-track diarization** (Native Session Room Phase B).

Depends on / relates to: the staged long-session review (the surface all paths enter), the Native Session Room (dual-track capture), recognition-precedes-identification, the consent architecture (unassigned-first, no synthetic client/rl_session).
