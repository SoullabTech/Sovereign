/**
 * DESKTOP-SOVEREIGN-STT-UTTERANCE-LIMIT-01 — how long a Desktop turn may be.
 *
 * ⛔ THE DEFECT (DEVICE + SOURCE CONFIRMED). Long spoken turns on Desktop ended
 * at 8704 ms and 8652 ms while the member was still speaking. Shorter turns in
 * the same run completed on silence at 3.0 s and 2.4 s, which is what separates
 * a hard ceiling from a false VAD stop: the failures cluster on the timer, not
 * on the audio.
 *
 * ⛔ THE ONTOLOGY ERROR, not an off-by-one. `DEFAULT_MAX_RECORDING_MS = 8000`
 * in `androidVoiceFallback` was authored for what that module's name still says
 * it is: a bounded ONE-SHOT RECOVERY on Android Chrome, entered after the
 * browser's own recognition had already failed. Eight seconds is a sensible
 * bound on a recovery attempt. When `DESKTOP-SOVEREIGN-STT-01` routed Desktop
 * through the same transport by CLASSIFICATION, Desktop inherited that number
 * as well — and a bound on a recovery attempt silently became the semantic end
 * of a first-class conversation turn. A member mid-breath at second eight was
 * told, by a constant that was never about them, that their thought was over.
 *
 * ⛔ WHAT THIS VALUE IS AND IS NOT. It is a SAFETY ceiling: the backstop for a
 * pathological capture — a stuck VAD, a room that never falls silent, a mic
 * left open by something no other guard caught. It is NOT a turn boundary.
 * Ordinary Desktop speech must end where it actually ends: in silence, via the
 * recorder's silence holdoff. If members routinely reach this number, the
 * number is wrong again.
 *
 * ⛔ SCOPE. Desktop only. `androidVoiceFallback`'s own default is untouched, so
 * the Android-Chrome recovery and the Firefox/Zen no-Web-Speech branch keep the
 * exact 8 s bound they were designed with. Nothing here widens them.
 */

/**
 * The Desktop safety ceiling. Two minutes: far enough past any ordinary spoken
 * turn that reaching it is exceptional rather than conversational, and still
 * bounded — the microphone cannot stay open indefinitely on a stuck VAD.
 *
 * Sizing sanity: ~2 min of Opus-in-WebM is a few hundred KB, comfortably inside
 * the transcription route's 25 MB limit.
 */
export const DESKTOP_MAX_UTTERANCE_MS = 120_000;

/**
 * How long a Desktop turn may fall silent before the recorder decides the
 * member has finished.
 *
 * ⛔ THE DEFECT THIS ANSWERS, device-witnessed 2026-08-30. The floor was
 * inherited from `androidVoiceFallback`'s 1500 ms exactly as the 8 s ceiling
 * was — by classification, not by decision. On a bounded Android recovery,
 * where the member has already spoken once and is repeating themselves, 1.5 s
 * is reasonable. In first-class Desktop conversation it is shorter than an
 * ordinary considered pause, so a member who stops to think is told their turn
 * is over. Paired with a silence clock that started before they spoke at all,
 * it closed the microphone at ~1.5 s and handed Whisper room tone to
 * hallucinate over.
 *
 * ⛔ WHAT THIS IS NOT. It is not a fix for the clock's start point — that is
 * the `lastLoudAt === null` latch in `androidVoiceFallback`, and it is the
 * load-bearing half. This value only governs how long a pause may be AFTER the
 * member has actually been heard. Both are needed: the latch decides whether
 * the timer may run at all, this decides how patient it is once it does.
 *
 * 2.5 s: long enough for a mid-thought breath or a searched-for word, short
 * enough that a genuinely finished turn does not feel like it is hanging.
 *
 * ⛔ SCOPE. Desktop only. Android Chrome recovery and the Firefox/Zen branch
 * keep the module's own 1500 ms, unchanged.
 */
export const DESKTOP_SILENCE_HOLDOFF_MS = 2_500;
