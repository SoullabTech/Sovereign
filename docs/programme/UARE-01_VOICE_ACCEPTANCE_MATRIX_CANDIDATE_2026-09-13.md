# UARE-01 — MAIA Voice Acceptance Matrix — CANDIDATE

**Date:** 2026-09-13
**Lane:** `UARE-01` · **Status:** ⛔ **CANDIDATE INSTRUMENT. NOT RATIFIED. NOT A GATE.**
**Derived from:** the Uare mobile defect log (first-pass study §6), reclassified against MAIA's own
voice canon. It is **not** a copy of a competitor's QA list.

---

## What this is, and what it is not

**Is:** a proposed acceptance surface for MAIA voice — the set of conditions under which "voice works"
would be a falsifiable statement rather than an impression.

**Is not:** authority. It does not gate anything today. It does not bind any lane. Adopting it —
whole, in part, or not at all — is a founder act. **Nothing here may be cited as a requirement until
that act occurs.**

**Why a competitor's defect log is legitimate input.** Every row below is **sensory infrastructure or
session transport**. Under `docs/canon/MAIA_CONVERSATIONAL_INTELLIGENCE_NON_DEGRADATION.md`, STT/TTS
and capture paths may change freely — *voice may have a different capture path; it may not have a
different mind.* So these rows carry no doctrinal risk: they describe conditions MAIA must survive,
never what MAIA should think. The one class that is **not** infrastructure — the turn-record rows,
marked ⭐ — is included precisely because it is where the gate already lives.

**The corroboration.** MAIA's 2026-09-07 voice-silence defect and four rows of Uare's shipped defect
log are the same failure family: *the record of the turn coupled to the audio path.* Two independent
teams, opposite origins, same attractor. That is the evidence that this surface is real.

---

## Coverage column — honesty statement

Coverage below was established by a **filename-and-assertion-name survey**, not a behavioural audit.

- **GATED** — a named test asserts it; the assertion names were read.
- **CODE PRESENT, UNGATED** — implementation exists; no acceptance test was found for it.
- **NOT SURVEYED** — no claim either way. This is the honest majority.

⛔ **`NOT SURVEYED` does not mean absent.** Establishing the real coverage column is lane step **U1**
and is the first work this document asks for.

---

## The matrix

### Class A — turn record ⭐ (the non-negotiable class)

| # | Condition | Coverage |
| --- | --- | --- |
| A1 | A spoken turn and a typed turn converge before MAIA cognition begins; nothing stands between the log line and canonical cognition. | **GATED** — `__tests__/voice-non-degradation.test.ts` |
| A2 | MAIA's turn is committed exactly once, from one seam, reached by every terminal path. | **GATED** — `__tests__/voice-transcript-commit.test.ts` |
| A3 | A stalled or failed TTS delays MAIA's words; it never erases them. | **GATED** — same |
| A4 | Commit is independent of any render preference (`showVoiceText`), so no display setting can decide what MAIA remembers saying. | **GATED** — same |
| A5 | The text emitted and the transcript persisted are the same guarded value. | **GATED** — `__tests__/r2-voice-continuity-contract.test.ts` |
| A6 | Switching text ↔ voice mid-conversation produces one continuous conversation, not two. | **NOT SURVEYED** |
| A7 | A reconnect resumes the same conversation; it never splits it into a second one. | **NOT SURVEYED** |
| A8 | A message delivered in both channels appears once, not twice. | **NOT SURVEYED** |
| A9 | The second turn works. Replies do not stop after the first. | **NOT SURVEYED** |

### Class B — capture and transport

| # | Condition | Coverage |
| --- | --- | --- |
| B1 | MAIA does not hear her own voice; output never re-enters capture as input. | **CODE PRESENT, UNGATED** — `lib/voice/voice-feedback-prevention.ts` |
| B2 | The member can interrupt MAIA while she is speaking, and the interruption is honoured. | **NOT SURVEYED** — candidates: `lib/voice/VoiceBus.ts`, `lib/voice/MaiaRealtimeWebRTC.ts` |
| B3 | The end of member speech is not truncated; trailing words survive endpointing. | **NOT SURVEYED** — candidates: `lib/voice/ConversationalTiming.ts`, `lib/voice/captureForensics.ts` |
| B4 | A network drop recovers without member action and without losing the turn in flight. | **NOT SURVEYED** |
| B5 | Backgrounding the app does not silently kill an active session. | **NOT SURVEYED** — iOS/Capacitor path |
| B6 | Synthesis quality after resume matches synthesis quality before suspend. | **NOT SURVEYED** |

### Class C — device and interruption (mobile; deferred, not dismissed)

| # | Condition | Coverage |
| --- | --- | --- |
| C1 | Audio routes to the connected device (car, headset), not the handset speaker. | **NOT SURVEYED** |
| C2 | Headphone disconnect is handled without dumping audio to speaker mid-turn. | **NOT SURVEYED** |
| C3 | An incoming phone call suspends cleanly. | **NOT SURVEYED** |
| C4 | The session resumes correctly after the call ends. | **NOT SURVEYED** |

### Class D — surface truthfulness

| # | Condition | Coverage |
| --- | --- | --- |
| D1 | The UI never shows a live state for a dead session. Stale connection is visible as stale. | **NOT SURVEYED** |
| D2 | The live interim transcript shows that MAIA is still hearing — bounded, tail-pinned, never frozen behind an ellipsis. | **CODE PRESENT, UNGATED** — repaired 2026-09-07; no named test found |
| D3 | Where MAIA answers from a member's material, the source is reachable without intruding on the conversation. | **NOT SURVEYED** — design input, study §5.3; Cat 1, held |

---

## Sovereignty check on the matrix itself

Required by the Anchor for anything touching voice or user-facing behaviour. Answered, not passed:

- **Agency** — increases. Every row returns control the member had already assumed they had
  (interrupting, switching modality, leaving and returning, seeing whether they are still heard).
- **Life outward** — neutral. This is infrastructure reliability; it neither pushes life outward nor
  inward, and must not be described as if it did.
- **Reduces psychological centrality over time** — neutral-to-positive. A voice surface that fails
  ambiguously *increases* centrality: the member attends to the system's state instead of their own.
  Failing legibly costs less attention than failing silently.
- **Cultural sovereignty (Invariant 14)** — no framework is imposed; no member meaning is translated.
- **Growth obligation** — this matrix adds **no capability**. It adds falsifiability to a capability
  already shipped. It introduces no new uncertainty, requires no new provenance boundary, and creates
  one responsibility: *a condition listed here and left `NOT SURVEYED` is a known unknown on the
  record, and may not be cited as covered.*

## What adoption would require

1. **U1** — replace every `NOT SURVEYED` with a real finding. Some will already be covered.
2. Founder ruling on which classes are **blocking** for a voice release and which are recorded debt.
   **[I]** Class A is the only class that plausibly blocks; it is the only class where failure costs
   MAIA's own record of what she said.
3. Only then does any row become a gate, and only then may `docs/ops/` reference it.

⛔ Until then: a candidate list of conditions, and an argument that the list is real.

---

*Another production team already paid for this failure surface. Taking the map is free. Taking their
conclusions is not, and is not proposed here.*
