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

// ═══════════════════════════════════════════════════════════════
// VOICE-TTS-LEAK-01A — two gaps found in the merged #1115 behaviour
//
// Each was verified by running #1115's own code before these rules existed,
// not by reading it. The "before" strings below are what it actually spoke.
// ═══════════════════════════════════════════════════════════════

describe('sanitizeForSpeech — VOICE-TTS-LEAK-01A', () => {
  describe('unterminated fenced block', () => {
    // Streaming produces this routinely: the response is chunked by sentence,
    // so a chunk can open a fence whose closing delimiter lands in a later
    // chunk. The paired ```…``` rule cannot match a half that has not arrived.
    it('⭐ drops an unterminated fence and everything after it', () => {
      // #1115 spoke: "Here it is: ```js const secret = 1;"
      const out = sanitizeForSpeech('Here it is: ```js\nconst secret = 1;');
      expect(out).not.toMatch(/```/);
      expect(out).not.toMatch(/const secret/);
      expect(out).toContain('Here it is');
    });

    it('handles the tilde form too', () => {
      const out = sanitizeForSpeech('Look: ~~~python\nimport os\nos.system("rm")');
      expect(out).not.toMatch(/~~~|import os|rm/);
      expect(out).toContain('Look');
    });

    it('an unterminated fence mid-paragraph takes only the tail', () => {
      const out = sanitizeForSpeech('First sentence. Second one. ```sh\nsudo reboot');
      expect(out).toContain('First sentence');
      expect(out).toContain('Second one');
      expect(out).not.toMatch(/sudo reboot|```/);
    });
  });

  describe('indented code block', () => {
    it('⭐ drops a four-space indented block', () => {
      // #1115 spoke: "Run it: rm -rf /tmp/cache Done."
      const out = sanitizeForSpeech('Run it:\n\n    rm -rf /tmp/cache\n\nDone.');
      expect(out).not.toMatch(/rm -rf/);
      expect(out).toContain('Run it');
      expect(out).toContain('Done');
    });

    it('drops a tab-indented block', () => {
      const out = sanitizeForSpeech('Try:\n\n\tDROP TABLE members;\n\nThat is all.');
      expect(out).not.toMatch(/DROP TABLE/);
      expect(out).toContain('That is all');
    });

    it('drops a multi-line indented block entirely', () => {
      const out = sanitizeForSpeech('Steps:\n\n    one();\n    two();\n    three();\n\nOK.');
      expect(out).not.toMatch(/one\(\)|two\(\)|three\(\)/);
      expect(out).toContain('OK');
    });
  });

  describe('the guard against over-stripping', () => {
    // Over-stripping MAIA's speech is the worse defect: silence heard as
    // composure. The indented-block rule therefore requires a preceding blank
    // line, which is what markdown itself requires of an indented block.
    it('⭐ indented continuation prose with no blank line before it survives', () => {
      const out = sanitizeForSpeech('A thought\n    that continues indented.');
      expect(out).toContain('that continues indented');
    });

    it('⭐ ordinary speech is untouched by both new rules', () => {
      const plain = "I hear you. That sounds heavy, and I don't think you're wrong.";
      expect(sanitizeForSpeech(plain)).toBe(plain);
    });

    it('a lone backtick pair is still inline code, not a fence', () => {
      expect(sanitizeForSpeech('The voice is `af_kore` today.'))
        .toBe('The voice is af_kore today.');
    });
  });

  describe('#1115 behaviour is preserved', () => {
    it('a normal fenced block is still dropped', () => {
      expect(sanitizeForSpeech('Try:\n```bash\ndocker compose up\n```\nok'))
        .toBe('Try: ok');
    });
  });
});
