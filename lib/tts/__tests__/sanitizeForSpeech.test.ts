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
  sanitizeSpeechInputPlain,
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

  // VOICE-TTS-SSML-01: this assertion previously required `<speak>` to REACH
  // Kokoro. That encoded the untested belief that Kokoro parses SSML. It does
  // not — it speaks the markup aloud — so the contract is now plain text only.
  it('flattens SSML to plain text before sending it to Kokoro', async () => {
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
    expect(body.input).toContain('Before.');
    expect(body.input).toContain('After.');
    expect(body.input).not.toContain('const token');
    expect(body.input).not.toContain('```');
    expect(body.input).not.toContain('<');
    expect(body.input).not.toContain('>');
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

/**
 * VOICE-TTS-SSML-01 — Kokoro speaks plain text, never control markup.
 *
 * The member-facing failure this guards against was heard in production on
 * 2026-08-27: MAIA's prose was clean, but the voice layer wrapped each chunk
 * in SSML and Kokoro-FastAPI read the markup aloud — "speak", "break time
 * equals 120 MS", "prosody rate equals 108 percent", "slash speak".
 */
describe('VOICE-TTS-SSML-01 — Kokoro receives plain text only', () => {
  const originalFetch = global.fetch;

  const captureKokoroInput = async (text: string): Promise<string> => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      arrayBuffer: async () => new ArrayBuffer(0),
      text: async () => '',
    });
    global.fetch = fetchMock as any;
    await synthesizeKokoro({ text, voice: 'af_kore' });
    return JSON.parse(fetchMock.mock.calls[0][1].body as string).input;
  };

  afterEach(() => {
    global.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  // The exact payload shape the voice layer produced for the reported turn.
  const PRODUCTION_SSML =
    '<speak><break time="120ms"/><prosody rate="108%">'
    + "I don't actually have a voice on my end."
    + '</prosody><break time="180ms"/></speak>';

  it('cannot reproduce the member-facing "speak / prosody / break time" failure', async () => {
    const input = await captureKokoroInput(PRODUCTION_SSML);

    expect(input).toBe("I don't actually have a voice on my end.");
    for (const spoken of ['speak', 'prosody', 'break', 'time=', 'rate=', '120ms', '108%']) {
      expect(input.toLowerCase()).not.toContain(spoken.toLowerCase());
    }
  });

  it('strips opening tags, closing tags, self-closing tags and attributes', async () => {
    const input = await captureKokoroInput(
      '<speak><emphasis level="strong">Steady.</emphasis><break time="90ms"/>'
      + '<prosody rate="95%" pitch="+2st">And clear.</prosody></speak>',
    );

    expect(input).not.toMatch(/[<>]/);
    expect(input).not.toMatch(/emphasis|prosody|speak|break|level|pitch|st\b/i);
    expect(input).toContain('Steady.');
    expect(input).toContain('And clear.');
  });

  it('treats a tag boundary as a word boundary rather than fusing words', async () => {
    const input = await captureKokoroInput(
      '<speak><prosody rate="100%">First sentence.</prosody><break time="200ms"/>'
      + '<prosody rate="100%">Second sentence.</prosody></speak>',
    );

    expect(input).toBe('First sentence. Second sentence.');
  });

  it('still refuses fenced code carried inside SSML', async () => {
    const input = await captureKokoroInput(
      '<speak><prosody rate="100%">Here.\n```ts\nconst apiKey = "x";\n```\nDone.</prosody></speak>',
    );

    expect(input).not.toContain('apiKey');
    expect(input).not.toContain('```');
    expect(input).toContain('Here.');
    expect(input).toContain('Done.');
  });

  it('preserves ordinary prose punctuation that only looks like syntax', async () => {
    const input = await captureKokoroInput(
      '<speak><prosody rate="100%">'
      + 'She kept [the old house] and {the garden} (both of them), '
      + 'plus R&amp;D notes, and said if x &lt; 10 it still holds.'
      + '</prosody></speak>',
    );

    expect(input).toContain('[the old house]');
    expect(input).toContain('{the garden}');
    expect(input).toContain('(both of them)');
    expect(input).toContain('R&D notes');
    expect(input).toContain('x < 10');
  });

  it('still refuses input that is empty after sanitization', async () => {
    await expect(
      synthesizeKokoro({ text: '<speak><break time="120ms"/></speak>', voice: 'af_kore' }),
    ).rejects.toThrow('empty after speech sanitization');
  });
});

describe('sanitizeSpeechInputPlain', () => {
  it('flattens SSML while sanitizeSsmlForSpeech keeps preserving approved tags', () => {
    const ssml = '<speak><prosody rate="100%">Use `git status`.</prosody></speak>';

    // The shared SSML sanitizer is deliberately unchanged — a future provider
    // that genuinely reads SSML still gets the approved subset.
    expect(sanitizeSsmlForSpeech(ssml)).toContain('<prosody');
    expect(sanitizeSpeechInput(ssml)).toContain('<speak>');

    // The plain-text contract is what Kokoro gets.
    expect(sanitizeSpeechInputPlain(ssml)).toBe('Use git status.');
  });

  it('is a pass-through to plain sanitization for non-SSML input', () => {
    expect(sanitizeSpeechInputPlain('Just ordinary prose.')).toBe('Just ordinary prose.');
    expect(sanitizeSpeechInputPlain('')).toBe('');
  });
});
