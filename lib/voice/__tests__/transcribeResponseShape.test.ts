/**
 * VOICE-TRANSCRIBE-RESPONSE-SHAPE-01 — the transcript must survive the handoff.
 *
 * ⛔ WHAT THIS UNIT REPAIRS, stated as the device saw it. On 2026-08-29 MAIA
 * Desktop selected the sovereign path, captured 48,707 then 117,802 bytes of
 * webm/opus, reached `/api/voice/transcribe-simple` authenticated, and
 * Faster-Whisper returned HTTP 200 with English at p=0.99 — 35 chars, then 81.
 * Both were discarded as `empty_transcript`, because the reader looked for
 * `text` or `transcript` while the route sends `transcription`.
 *
 * Every other consumer of that route reads `transcription` correctly
 * (MaiaCapture, EnhancedVoiceControls, MicrophoneCapture,
 * WhisperContinuousConversation, useVoiceInput). This module was the only
 * outlier — and it is the sovereign transport for THREE surfaces, so none of
 * them could ever have produced a voice turn through it.
 */

import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { readTranscript } from '../transcribeResponse';

describe('the shape our own endpoint actually sends', () => {
  it('THE DEFECT: { transcription } is read, not discarded', () => {
    expect(readTranscript({ success: true, transcription: 'hello' })).toBe('hello');
  });

  it('the real device payload produces the real transcript', () => {
    // The route's own shape, as returned on the witnessed run.
    const payload = {
      success: true,
      transcription: 'we are so close to having a full on Desktop app now',
      language: 'en',
      language_probability: 0.99,
    };
    expect(readTranscript(payload)).toBe('we are so close to having a full on Desktop app now');
    expect(readTranscript(payload).length).toBeGreaterThan(0);
  });
});

describe('the shapes that already worked keep working', () => {
  it('{ text } — the raw OpenAI/Whisper shape', () => {
    expect(readTranscript({ text: 'hello' })).toBe('hello');
  });

  it('{ transcript }', () => {
    expect(readTranscript({ transcript: 'hello' })).toBe('hello');
  });

  it('transcription wins when more than one is present', () => {
    // Our endpoint's field is the authoritative one at this boundary.
    expect(readTranscript({ transcription: 'ours', text: 'theirs' })).toBe('ours');
  });
});

describe('blank and missing values still mean empty', () => {
  it.each([
    ['missing', {}],
    ['null payload', null],
    ['undefined payload', undefined],
    ['empty string', { transcription: '' }],
    ['whitespace only', { transcription: '   \n\t ' }],
    ['non-string', { transcription: 42 }],
    ['object', { transcription: { nested: 'no' } }],
    ['array payload', []],
    ['a string payload', 'not an object'],
  ])('%s → empty', (_label, payload) => {
    expect(readTranscript(payload)).toBe('');
  });

  it('trims, so a padded transcript is still a transcript', () => {
    expect(readTranscript({ transcription: '  hello  ' })).toBe('hello');
  });
});

describe('the route contract this reader is matched against', () => {
  it('the route really does send `transcription`', () => {
    // ⛔ Pins the two halves together. If the route is ever changed to send a
    // different field, this fails here rather than silently discarding
    // members' speech on three surfaces again.
    const route = fs.readFileSync(
      path.join(__dirname, '..', '..', '..', 'app', 'api', 'voice', 'transcribe-simple', 'route.ts'),
      'utf8',
    );
    expect(route).toMatch(/transcription:\s*transcription\.trim\(\)/);
  });
});
