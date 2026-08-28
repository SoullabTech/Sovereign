// DESKTOP-VOICE-SHAPE-01 — the wire contract, pinned.
//
// This is a serialization repair, not a provider repair. Most of what follows
// is therefore negative control: it asserts what this unit must NOT have
// changed. If a later change to voice selection or the provider path makes
// these fail, that is the point — it means the shape fix and the provider
// question got tangled, which is exactly what the unit was bounded to prevent.

import { readFileSync } from 'fs';
import path from 'path';
import { toAudioResponsePayload } from '../audioResponsePayload';

const repo = path.join(__dirname, '..', '..', '..');
const read = (p: string) => readFileSync(path.join(repo, p), 'utf8');

// Comments discuss the provider defect by name on purpose — the banned-token
// checks below are about what the code DOES, so they read the stripped source.
const stripComments = (src: string) =>
  src
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .split('\n')
    .map((l) => l.replace(/(^|[^:'"`])\/\/.*$/, '$1'))
    .join('\n');

const voiceService = read('lib/voice/maiaVoiceService.ts');
const maiaService = read('lib/sovereign/maiaService.ts');
const listRoute = read('app/api/sovereign/app/maia/list/route.ts');

// ── the defect itself ───────────────────────────────────────────────────────
//
// ⭐ The whole failure in one case: a Buffer went in, and the old code read
// `.audioBase64` off it. Anything that puts a usable base64 string on the wire
// for raw bytes closes it.
describe('a Buffer becomes audio on the wire', () => {
  it('encodes raw synthesis bytes as base64 mp3', () => {
    const bytes = Buffer.from([0x49, 0x44, 0x33, 0x00, 0xff, 0x7f, 0x80]);
    const out = toAudioResponsePayload(bytes);

    expect(out).not.toBeNull();
    expect(typeof out!.audioBase64).toBe('string');
    expect(out!.audioBase64!.length).toBeGreaterThan(0);
    expect(out!.format).toBe('mp3');
  });

  it('round-trips byte-identically — no corruption in the encode', () => {
    // Every byte value, so a range or sign bug cannot hide in a short sample.
    const bytes = Buffer.from(Array.from({ length: 256 }, (_, i) => i));
    const out = toAudioResponsePayload(bytes)!;
    const decoded = Buffer.from(out.audioBase64!, 'base64');

    expect(decoded.equals(bytes)).toBe(true);
  });

  it('accepts a plain Uint8Array, not only a Buffer', () => {
    const bytes = new Uint8Array([1, 2, 3, 4]);
    const out = toAudioResponsePayload(bytes)!;
    expect(Buffer.from(out.audioBase64!, 'base64').equals(Buffer.from(bytes))).toBe(true);
  });
});

// ── ⛔ never fabricate ───────────────────────────────────────────────────────
//
// The old code emitted `"audio": {}` — an object that is truthy to a caller
// checking `data.audio`, while carrying nothing. Silence must stay legible as
// silence.
describe('no audio means no audio object', () => {
  it.each([
    ['undefined', undefined],
    ['null', null],
    ['an empty Buffer', Buffer.alloc(0)],
    ['an empty object', {}],
    ['an object whose base64 is an empty string', { audioBase64: '', format: 'mp3' }],
    ['a string', 'not audio'],
    ['a number', 7],
  ])('returns null for %s', (_label, input) => {
    expect(toAudioResponsePayload(input as unknown)).toBeNull();
  });

  it('the route omits the key entirely rather than sending an empty object', () => {
    expect(listRoute).toMatch(/if \(audioPayload\) \{\s*responseData\.audio = audioPayload;/);
    expect(listRoute).not.toContain('orchestratorResult.audio.audioBase64');
  });
});

// ── legacy shape preserved ──────────────────────────────────────────────────
describe('an already-shaped object is preserved, not rewritten', () => {
  it('passes through every field it was given', () => {
    const legacy = {
      audioBase64: 'QUJD',
      audioUrl: 'https://example.invalid/a.mp3',
      voiceProfile: 'warm',
      format: 'opus',
      synthesisTimeMs: 1234,
    };
    expect(toAudioResponsePayload(legacy)).toEqual(legacy);
  });

  it('keeps a URL-only payload — bytes are not the only legacy form', () => {
    const out = toAudioResponsePayload({ audioUrl: 'https://example.invalid/a.mp3' })!;
    expect(out.audioUrl).toBe('https://example.invalid/a.mp3');
    expect(out.audioBase64).toBeUndefined();
    expect(out.format).toBe('mp3');
  });
});

// ── negative controls: the provider path is untouched ───────────────────────
//
// DESKTOP-VOICE-PROVIDER-01 stays an open, unrepaired finding. These fail if
// this unit quietly became a provider change.
describe('this unit did not touch voice selection or the provider', () => {
  it('maiaService still calls synthesizeMaiaVoice with no voice argument', () => {
    expect(maiaService).toContain('await synthesizeMaiaVoice(text);');
    expect(maiaService).not.toMatch(/synthesizeMaiaVoice\(\s*text\s*,/);
  });

  it('maiaVoiceService still returns a Buffer and still defaults to nova', () => {
    expect(voiceService).toContain('Promise<Buffer>');
    expect(voiceService).toMatch(/options\?\.voice \?\? "nova"/);
  });

  it('no TTS routing was introduced by this unit', () => {
    const normalizer = stripComments(read('lib/voice/audioResponsePayload.ts'));
    for (const banned of ['ttsRouter', 'kokoro', 'alloy', 'openai', 'OpenAI', 'synthesize']) {
      expect(normalizer).not.toContain(banned);
    }
  });

  it('the normalizer is pure — no imports, no I/O', () => {
    const normalizer = stripComments(read('lib/voice/audioResponsePayload.ts'));
    expect(normalizer).not.toMatch(/^import /m);
    expect(normalizer).not.toContain('fetch(');
    expect(normalizer).not.toContain('process.env');
  });
});
