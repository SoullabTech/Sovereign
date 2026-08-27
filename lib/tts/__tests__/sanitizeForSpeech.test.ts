/**
 * VOICE-TTS-LEAK-01 — speech sanitization contract.
 *
 * The failure this guards against is member-facing: MAIA must never read
 * implementation code, markdown syntax or internal metadata aloud. Equally,
 * sanitization must not silently delete ordinary human prose.
 */

import {
  sanitizeForSpeech,
  sanitizeSsmlForSpeech,
  sanitizeSpeechInput,
} from '../sanitizeForSpeech';
import { synthesize as synthesizeKokoro } from '../providers/kokoro';

describe('sanitizeForSpeech', () => {
  it('removes fenced code while preserving surrounding prose', () => {
    const input = 'Here is the important part.\n```ts\nconst secret = 42;\nconsole.log(secret);\n```\nAnd this is what matters.';
    expect(sanitizeForSpeech(input)).toBe(
      'Here is the important part. And this is what matters.',
    );
  });

  it('preserves inline-code words while removing backticks', () => {
    expect(sanitizeForSpeech('Use `git status` before you continue.')).toBe(
      'Use git status before you continue.',
    );
  });

  it('keeps markdown link text and drops the URL', () => {
    expect(sanitizeForSpeech('Read [the field note](https://example.com/private?id=7) next.')).toBe(
      'Read the field note next.',
    );
  });

  it('removes markdown presentation markers without changing the words', () => {
    expect(sanitizeForSpeech('# **A quiet heading**')).toBe('A quiet heading');
  });

  it('preserves ordinary bracketed prose exactly', () => {
    expect(sanitizeForSpeech('I met her at [the old house].')).toBe(
      'I met her at [the old house].',
    );
  });

  it('preserves ordinary braces exactly', () => {
    expect(sanitizeForSpeech('The ritual uses {earth, water, fire}.')).toBe(
      'The ritual uses {earth, water, fire}.',
    );
  });

  it('preserves ordinary parentheses', () => {
    expect(sanitizeForSpeech('She returned (after a long pause) and stayed.')).toBe(
      'She returned (after a long pause) and stayed.',
    );
  });

  it('removes a standalone JSON artifact without treating braces as syntax generally', () => {
    expect(sanitizeForSpeech('{"internal":true,"score":0.9}')).toBe('');
    expect(sanitizeForSpeech('Keep {this human phrase} intact.')).toBe(
      'Keep {this human phrase} intact.',
    );
  });

  it('removes SOUL_METADATA blocks', () => {
    expect(
      sanitizeForSpeech('Before. ---SOUL_METADATA--- {"x":1} ---END_METADATA--- After.'),
    ).toBe('Before. After.');
  });
});

describe('sanitizeSsmlForSpeech', () => {
  it('preserves MAIA SSML tags but removes fenced implementation code', () => {
    const input = '<speak><prosody rate="100%">Hello. ```ts\nconst x = 1;\n``` Still here.</prosody></speak>';
    const output = sanitizeSsmlForSpeech(input);

    expect(output).toContain('<speak>');
    expect(output).toContain('<prosody rate="100%">');
    expect(output).toContain('Hello.');
    expect(output).toContain('Still here.');
    expect(output).not.toContain('const x');
    expect(output).not.toContain('```');
  });

  it('removes non-SSML tags rather than passing arbitrary markup to Kokoro', () => {
    const output = sanitizeSsmlForSpeech('<speak><script>bad()</script><prosody rate="100%">Safe.</prosody></speak>');
    expect(output).not.toContain('<script>');
    expect(output).not.toContain('</script>');
    expect(output).toContain('bad()');
    expect(output).toContain('Safe.');
  });
});

describe('Kokoro provider boundary', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  it('sanitizes plain text before sending it to Kokoro', async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      arrayBuffer: async () => new ArrayBuffer(0),
      text: async () => '',
    });
    global.fetch = fetchMock as any;

    await synthesizeKokoro({
      text: 'Speak this. ```js\nconsole.log("never speak me")\n``` Then this.',
      voice: 'af_kore',
    });

    const request = fetchMock.mock.calls[0][1];
    const body = JSON.parse(request.body as string);
    expect(body.input).toBe('Speak this. Then this.');
    expect(body.input).not.toContain('console.log');
  });

  it('sanitizes SSML before sending it to Kokoro', async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      arrayBuffer: async () => new ArrayBuffer(0),
      text: async () => '',
    });
    global.fetch = fetchMock as any;

    const rawSsml = '<speak><prosody rate="100%">Before. ```ts\nconst token = "secret";\n``` After.</prosody></speak>';
    await synthesizeKokoro({ text: rawSsml, voice: 'af_kore' });

    const request = fetchMock.mock.calls[0][1];
    const body = JSON.parse(request.body as string);
    expect(body.input).toContain('<speak>');
    expect(body.input).toContain('Before.');
    expect(body.input).toContain('After.');
    expect(body.input).not.toContain('const token');
    expect(body.input).not.toContain('```');
  });

  it('rejects an input that contains nothing speakable after sanitization', async () => {
    await expect(
      synthesizeKokoro({ text: '```ts\nconst x = 1;\n```', voice: 'af_kore' }),
    ).rejects.toThrow('empty after speech sanitization');
  });
});

describe('sanitizeSpeechInput', () => {
  it('selects SSML-aware sanitization for speak documents', () => {
    const output = sanitizeSpeechInput('<speak><prosody rate="100%">Use `git status`.</prosody></speak>');
    expect(output).toContain('<speak>');
    expect(output).toContain('Use git status.');
  });
});
