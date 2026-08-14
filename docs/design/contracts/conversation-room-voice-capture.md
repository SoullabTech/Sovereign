---
room: Conversation
human_activity: speaking with MAIA — the member using their own voice, out loud, in live conversation
surfaces:
  - components/voice/WhisperContinuousConversation.tsx
change_class: structural
principles:
  - MAIA_OATH — "I remember only what is offered, and I forget what is asked to be forgotten"
  - MAIA_SOVEREIGNTY_INVARIANTS Invariant 11, Protection precedence — protection boundaries are an eligibility gate on what may enter at all
  - INHABITABLE_ARCHITECTURE_STANDARD design law 2 — the interface reveals, it does not expose; a house does not display the plumbing
reference_surfaces:
  - docs/design/contracts/journal-room.md — the only prior Experience Contract; consulted for shape
  - lib/memory/__tests__/breakthroughLogContainment.test.ts — the two-sided containment proof this unit follows
  - commit 70644c3c6 — the member-content log containment unit that named this file's defect and left it unfixed
shared_with_house: the House's containment rule for member-authored content — the plaintext is removed and NOT replaced by a hash, digest, prefix, excerpt, truncation or encoding; the event, its timing and non-content diagnostics survive
distinct_to_room: this room's member content arrives as speech rather than typing, so containment must hold at the moment of transcription — the point where the member's voice first becomes text the system can copy
structural_rationale: This contract exists to name the room so a privacy defect can be removed. The change is the deletion of a log emission — the member's transcribed speech was written verbatim to the browser console. Nothing rendered, nothing laid out, no gesture, no copy, no state and no timing changes; `onTranscript` still receives the full transcription, so what the member sees and hears is identical before and after. The only observable difference is in a developer console the member is not in.
---

# Conversation (voice capture) — Experience Contract

**Scope, stated plainly.** This contract governs **one component**:
`components/voice/WhisperContinuousConversation.tsx`, the continuous voice-capture
surface by which a member speaks to MAIA. It is **not** a full room contract for
`/maia`. It names the room this component belongs to, so that a privacy defect in
it can be fixed under the gate rather than around it. Authoring the Conversation
room's own experiential contract remains unauthored work.

**Why it is written as a privacy unit and not a design unit.** `70644c3c6`
removed member-authored content from log sinks across the app and deliberately
left this file, recording the reason in its own commit message: editing it trips
`check:design-canon`, which demands a contract naming a room. That refusal was
correct — but a governance gate must not become a permanent privacy exemption.
The gate asks a question this surface can answer honestly, so it is answered here.

**Present mounting.** Searched at `70644c3c6`: no `.ts`/`.tsx` file in the tree
imports this component. It is referenced only by two root-level markdown notes
(`VOICE_CONVERSATION_BULLETPROOF_FIX.md`,
`OPENAI_TRANSCRIPTION_REMOVAL_SUMMARY.md`) and by generated typehealth
artifacts. So the defect is **reachable code, not witnessed live traffic** — and
that is exactly why fixing it is cheap and why leaving it would be careless: the
first surface that mounts this component would begin writing member speech to the
console.

## What this room is for

A person saying something out loud to MAIA, and being heard. The activity is
speech — not "audio capture," not "transcription pipeline." The member's words
belong to the member; the transcription exists so MAIA can receive them, and for
no other purpose.

## Arrival

> **(unchanged — this contract adds no arrival state)**

This component is a microphone control inside a conversation, not a threshold.
It has no arrival of its own and this change gives it none.

## Gestures

| Gesture | Language used | Why this wording |
|---|---|---|
| speak | *(unchanged)* | this unit adds, renames and removes no gesture |

## Forbidden here

- the member's transcribed speech, verbatim, in any log sink
- a hash, digest, fingerprint, embedding, excerpt, prefix, truncation or
  reversible encoding of that speech — a digest of a sentence is still a handle
  on that sentence
- logging the transcription endpoint's response body whole, which puts the
  speech back on the console the moment the server's shape changes

## Preserved here

The event still emits. Transcription duration, character count, audio size,
audio energy, MIME type and every state marker survive untouched — containment
is about the member's words, not about diagnosability.

## The two brand tests

**Same house?** Yes. It applies the same containment rule, in the same words, as
the nine sites contained in `70644c3c6`, and preserves the same class of
non-content diagnostics.

**Distinct room?** Not asserted, and deliberately not. Nothing member-visible
changes here, so this contract makes no claim that a member could tell this
surface from another. That claim would require an experiential walk this unit
does not perform and does not need.
