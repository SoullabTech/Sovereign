/**
 * DESKTOP-WHISPER-REPETITION-LOOP-01 — the witnessed loops, and the speech
 * around them.
 *
 * The strings below are the real device transcripts from 2026-08-30, shortened
 * only in repeat count. Background noise was present, which is the input that
 * drives this failure mode.
 */
import { describe, it, expect } from 'vitest';
import { collapseRepetitionLoops, isDegenerate } from '../transcriptSanity';

describe('1 — the witnessed loops', () => {
  it('collapses a repeated sentence but keeps the speech before it', () => {
    const raw = "No, you're not supposed to use a metal spoon. Is there bread for this? Yes, there is. "
      + 'There is. '.repeat(60);
    const { text, collapsed } = collapseRepetitionLoops(raw);
    expect(collapsed).toBe(true);
    expect(text).toContain("not supposed to use a metal spoon");
    expect(text).toContain('Is there bread for this?');
    // The loop is gone, not the sentence it degenerated from.
    expect((text.match(/There is\./g) ?? []).length).toBeLessThanOrEqual(3);
  });

  it('collapses a repeated word run', () => {
    const raw = 'No, ' + 'no, '.repeat(100) + 'no';
    const { text, collapsed } = collapseRepetitionLoops(raw);
    expect(collapsed).toBe(true);
    expect(text.split(/\bno\b/i).length - 1).toBeLessThanOrEqual(4);
  });

  it('collapses a repeated phrase loop', () => {
    const raw = 'What have we had today? ' + 'Good to have a star with an apple. '.repeat(40);
    const { text } = collapseRepetitionLoops(raw);
    expect(text).toContain('What have we had today?');
    expect((text.match(/Good to have a star with an apple\./g) ?? []).length).toBeLessThanOrEqual(2);
  });

  it('a capture that decoded as nothing but a loop is refused', () => {
    // ⛔ JUDGED ON THE RAW OUTPUT, before collapsing. Collapsing first would
    // reduce an entirely-hallucinated capture to a short, plausible "no no no"
    // and commit it as something the member said.
    expect(isDegenerate('no no no no no no no no no no no no')).toBe(true);
    expect(isDegenerate('There is. '.repeat(60))).toBe(true);
  });
});

describe('2 — ordinary speech is not edited', () => {
  it('leaves a normal sentence alone', () => {
    const raw = "Hi MAIA, I'm testing to see whether or not we can talk back and forth.";
    const { text, collapsed } = collapseRepetitionLoops(raw);
    expect(collapsed).toBe(false);
    expect(text).toBe(raw);
  });

  it('allows human emphasis', () => {
    // ⛔ People really do say this. The thresholds sit above natural
    // repetition precisely so the repair never rewrites someone's speech.
    const raw = 'No, no, no. That is not what I meant.';
    const { text, collapsed } = collapseRepetitionLoops(raw);
    expect(collapsed).toBe(false);
    expect(text).toBe(raw);
  });

  it('allows saying a short sentence twice', () => {
    const raw = 'I hear you. I hear you.';
    const { collapsed } = collapseRepetitionLoops(raw);
    expect(collapsed).toBe(false);
  });

  it('a long ordinary utterance is not degenerate', () => {
    const raw = "Don't go. We're making it past four rounds now. We really need to get it to at least "
      + '45 minutes of uninterrupted communication.';
    const { text, collapsed } = collapseRepetitionLoops(raw);
    expect(collapsed).toBe(false);
    expect(isDegenerate(text)).toBe(false);
  });

  it('empty and short inputs are left alone', () => {
    expect(collapseRepetitionLoops('').text).toBe('');
    expect(isDegenerate('yes')).toBe(false);
    expect(isDegenerate('no no no')).toBe(false);   // too short to judge
  });
});

describe('3 — the request asks Whisper not to loop', () => {
  it('sends a VAD filter and disables previous-text conditioning', async () => {
    const fs = await import('fs');
    const path = await import('path');
    const route = fs.readFileSync(
      path.resolve(__dirname, '../../../app/api/voice/transcribe-simple/route.ts'), 'utf8');
    // ⛔ Without the VAD filter, room tone reaches the decoder as if it were
    // speech — the input that produced the witnessed loops.
    expect(route).toMatch(/whisperFormData\.append\('vad_filter', 'true'\)/);
    // ⛔ condition_on_previous_text is the feedback path that SUSTAINS a loop.
    expect(route).toMatch(/whisperFormData\.append\('condition_on_previous_text', 'false'\)/);
  });

  it('collapses before returning, and refuses what does not survive', () => {
    const fs = require('fs');
    const path = require('path');
    const route = fs.readFileSync(
      path.resolve(__dirname, '../../../app/api/voice/transcribe-simple/route.ts'), 'utf8');
    expect(route).toMatch(/collapseRepetitionLoops\(transcription\)/);
    expect(route).toMatch(/if \(isDegenerate\(transcription\)\)/);
    // Order is load-bearing: degeneracy is judged on the RAW output.
    expect(route.indexOf('isDegenerate(transcription)'))
      .toBeLessThan(route.indexOf('collapseRepetitionLoops(transcription)'));
  });

  it('logs lengths, never content', () => {
    const fs = require('fs');
    const path = require('path');
    const route = fs.readFileSync(
      path.resolve(__dirname, '../../../app/api/voice/transcribe-simple/route.ts'), 'utf8');
    const i = route.indexOf('repetition loop collapsed');
    const block = route.slice(i, i + 260);
    expect(block).toMatch(/before: transcription\.length/);
    expect(block).not.toMatch(/text: sanity\.text[,\s}]/);
  });
});
