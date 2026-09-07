/**
 * VOICE TRANSCRIPT COMMIT — MAIA's turn is not a side effect of TTS.
 *
 * Defect (2026-09-07, voice mode only, reported as "she isn't answering in
 * words or text"): every non-streaming voice path into the transcript ran
 * through the TTS call. The only append lived inside `await maiaSpeak(...)`'s
 * success branch and was additionally gated on `showVoiceText`. So:
 *
 *   - MAIA's voice off  → the `else` branch only logged; nothing appeared.
 *   - `maiaSpeak` stalls without throwing → neither success nor catch ran;
 *     no audio AND no words, no error to surface. Intermittent by nature.
 *   - transcript hidden → the turn never entered `messages`, so it was missing
 *     when revealed and missing from the next turn's conversationHistory.
 *
 * VOICE-CANONICAL-CONVERGENCE-02 made this the ordinary path: with the
 * streaming exit removed, voice turns are non-streaming, so the streaming
 * append never runs.
 *
 * This gate pins the repair: exactly one commit seam, reached from every
 * terminal path, independent of TTS outcome and of render preference.
 *
 * Source-shape assertions strip comments first — the same discipline the
 * Circles verifier's C6/C21 learned the hard way. A file must never fail a
 * gate because its own prose documents the behaviour the gate forbids.
 */
import { readFileSync } from 'fs';
import { join } from 'path';

const SOURCE = join(process.cwd(), 'components', 'OracleConversation.tsx');

function stripComments(src: string): string {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|[^:])\/\/.*$/gm, '$1');
}

describe('voice transcript commit', () => {
  const code = stripComments(readFileSync(SOURCE, 'utf8'));

  it('⭐ there is exactly one commit seam for MAIA\'s turn', () => {
    expect(code).toContain('const commitOracleTurn = (reason: string) => {');
    // The seam is idempotent: a watchdog firing after a successful speech, or a
    // catch running after the watchdog, must not double-post MAIA's turn.
    expect(code).toMatch(/if \(oracleTurnCommitted\) return;\s*\n\s*oracleTurnCommitted = true;/);
  });

  it('⛔ nothing in the canonical turn appends the oracle message except the seam', () => {
    // Scoped to the canonical response-handling region of handleTextMessage.
    // The two other appends in this file live in the useStreamingVoice hook's
    // callbacks — the retired streaming path, preserved as evidence and
    // unreachable from voice (see VOICE-CANONICAL-CONVERGENCE-02). They build
    // their own locally-scoped oracleMessage and are out of scope here.
    const start = code.indexOf('const commitOracleTurn = (reason: string) => {');
    const end = code.indexOf("console.error('Text chat API error:'", start);
    expect(start).toBeGreaterThan(-1);
    expect(end).toBeGreaterThan(start);

    const region = code.slice(start, end);
    const directAppends = region.match(/appendMessageCapped\(prev,\s*oracleMessage\)/g) ?? [];
    // One and only one: the append inside commitOracleTurn itself.
    expect(directAppends).toHaveLength(1);
  });

  it('⛔ the post-speech commit is NOT gated on showVoiceText', () => {
    // `showVoiceText` governs RENDERING. It must never decide whether the turn
    // exists — a hidden transcript later revealed must contain MAIA's words,
    // and conversationHistory must carry them either way.
    expect(code).not.toMatch(/isInVoiceMode\s*&&\s*showVoiceText/);
  });

  it('⭐ a stalled maiaSpeak cannot withhold MAIA\'s words indefinitely', () => {
    expect(code).toContain('VOICE_TRANSCRIPT_WATCHDOG_MS');
    expect(code).toMatch(/setTimeout\(\s*\(\) => commitOracleTurn\('voice_tts_watchdog'\),/);
    // and it is cancelled once speech settles, so a healthy turn keeps the
    // intended "text follows speech" ordering.
    expect(code).toContain('clearTimeout(transcriptWatchdog)');
  });

  it('⭐ speak + silent is a real cell — no TTS still commits the turn', () => {
    expect(code).toContain("commitOracleTurn('voice_no_tts')");
  });

  it('⭐ every terminal voice path reaches the seam', () => {
    for (const reason of [
      'chat',
      'voice_streaming_audio',
      'voice_after_speech',
      'voice_speech_error',
      'voice_tts_watchdog',
      'voice_no_tts',
    ]) {
      expect(code).toContain(`commitOracleTurn('${reason}')`);
    }
  });
});
