# JARVIS-VOICE-DOORWAY-01 — Programme Charter

**Opened:** 2026-09-23 by founder ruling OE-1 (`JARVIS-FOUNDER-OPERATING-ENVIRONMENT-01_P0_FOUNDER_ADJUDICATION_2026-09-23.md` §IV).
**Parent (flow):** `JARVIS-FOUNDER-OPERATING-ENVIRONMENT-01` (readiness authority). **Surface parent:** `JARVIS-FOUNDER-WORKSPACE-01` (the doorway lands on its Work surface, after B6).
**Current act:** V1 DELIVERED (`…_V1_OPERATOR_VOICE_CONTRACT_AND_FALSIFIER_SUITE_2026-09-23.md`) — contract ratified as test contract, matrix lethal; ⛔ V2 closed until WORKSPACE-01 B6 (founder act 2026-09-23). Prior: V0 DELIVERED.

## Mandatory lane preamble

Manual `docs/programme/JARVIS_INSTRUCTIONAL_MANUAL_v1.md` governs. Evidence states OBSERVED · PARTIAL · INFERRED · UNVERIFIED · ABSENT · CANDIDATE · RATIFIED. Census does not repair (§7). Liveness ladder BUILT ≠ WIRED ≠ LIVE ≠ USABLE ≠ WITNESSED applies to every voice claim.

## Purpose (founder, verbatim)

> Give the Founder a sovereign spoken doorway into the same JARVIS mind and work state used by typed interaction.

## Law (ratified by OE-1, binding on every act)

1. **One mind, two capture modes.** `microphone → local STT → transcript → SAME O1 intent seam used by typed text → plan / answer / work state → text response → local TTS when speech requested`. ⛔ No parallel "voice commands" authority system. A spoken utterance may never reach a capability that the same words typed could not.
2. **First mode: push-to-talk.** Also permitted: clickable microphone; keyboard hold-to-talk shortcut.
3. **STT = local whisper.cpp** (`whisper-server`, `127.0.0.1:8080`, `scripts/start-whisper.sh`). ⛔ Production `maia-whisper` is never used for Founder JARVIS.
4a. **Speech output is OFF by default** (founder, continuation act 2026-09-23).
4. **TTS = local Kokoro** (`http://localhost:8880`, `lib/tts/providers/kokoro.ts`). **LOCAL ONLY · FAIL CLOSED.** ⛔ No `ttsRouter` cloud fallback. Kokoro unavailable → say so, keep the text. ⛔ Founder speech never leaves the machine.
5. **Wake phrase "Jarvis…" is desired and ⛔ NOT AUTHORIZED.** `lib/voice/wakeWord.ts` is not a semantic detector. A later act must bring genuine wake-word recognition · explicit always-listening setting · visible listening state · local processing · false-activation, background-noise and interruption tests · no audio retention beyond declared policy.
6. Speech output is optional and interruptible; the text response is always the record.
7. Privacy/retention state is visible whenever capture is open.

## Relationship to MAIA voice

MAIA's voice substrate (`lib/voice/**`, `components/voice/**`, `app/api/voice/**`) is *member-facing* and governed by the Deep-Intelligence Gate (`MAIA_CONVERSATIONAL_INTELLIGENCE_NON_DEGRADATION.md`). This lane may **reuse infrastructure** (STT/TTS transports, capture utilities, turn-taking primitives that are general) and ⛔ may not import MAIA-specific cognition, prosody, archetype or member-memory behaviour. V0's job is to draw that line file by file.

## V0 — the ten questions (founder §VIII)

1. What existing microphone capture can JARVIS reuse? 2. What existing turn-taking/liveness work is general enough to reuse? 3. What is MAIA-specific and must not be imported? 4. What is the exact local Whisper contract? 5. What is the exact local Kokoro contract? 6. How does spoken input become the identical O1 object as typed input? 7. How is speech output optional and interruptible? 8. What happens when STT/TTS is unavailable? 9. What privacy/retention state is visible? 10. What later evidence would be required before "Jarvis" wake activation can ship?

**V0 may:** read `lib/voice`, `lib/tts`, `components/voice`, `app/api/voice`, `scripts/*whisper*`, `jarvis-desktop/src`, the O1 contract; specify the JARVIS operator voice contract as a document. **V0 may not:** modify Desktop · activate a microphone · add a permission handler · call any STT/TTS endpoint · touch production.

## Flow

V0 census + contract (open) → V1 contract ratification + falsifier suite with defeat candidates (founder act) → V2 push-to-talk implementation on the Work surface (after WORKSPACE-01 B6; founder act; Desktop mutation under the five-question preload law) → V3 speech output (Kokoro, fail-closed) → V4 wake activation (only on the evidence listed in law 5).

## Exit gate for V0

Ten answers, each with evidence state and file citations; the operator voice contract written as a testable document; the MAIA-specific exclusion list explicit; STOP for founder adjudication.
