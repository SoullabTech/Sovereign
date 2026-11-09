/** LISTEN-13 · In-document MAIA SPEECH focus lease.
 *
 * This is a UX audio-focus signal, NEVER authentication, consent, turn authority,
 * an audio recording permission, or a music-rights grant. A lease is held only
 * while the MAIA streaming queue owns an audible or continuing spoken turn.
 * Each queue has its own nonserializable symbol so one queue cannot accidentally
 * clear another queue's active speech.
 *
 * Do not use legacy maya-voice-start (preparation can precede sound) or the
 * global maya-voice-interrupted command (it affects microphone/turn state).
 * No member ID, speech text, media URL, token, timestamps, or network/storage.
 */
const activeMaiaSpeech = new Set<symbol>();

export function beginMaiaSpeechLease(owner: symbol): void {
  if (typeof owner !== 'symbol') throw new Error('Speech lease requires a local symbol.');
  activeMaiaSpeech.add(owner);
}

export function endMaiaSpeechLease(owner: symbol): void {
  activeMaiaSpeech.delete(owner);
}

export function isMaiaSpeechActive(): boolean {
  return activeMaiaSpeech.size > 0;
}
