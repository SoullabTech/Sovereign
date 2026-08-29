/**
 * VOICE-STREAM-PROVIDER-CONVERGENCE-01 — voice obeys the same provider authority
 * as text.
 *
 * ⛔ THE DEFECT, device-witnessed 2026-08-29. `/maia` text generation ran on
 * local Ollama under MAIA_TEXT_PROVIDER=local. The voice response path
 * constructed `getClaudeService()` unconditionally, so a successfully
 * transcribed member turn — Whisper HTTP 200, 72 chars, dispatched, visible on
 * screen — died on `validation_error: API key is invalid`.
 *
 * These are written as attempts to reach Anthropic from a sovereign turn.
 */

import { describe, it, expect, vi } from 'vitest';
import {
  streamOracleResponse,
  resolveTextProvider,
  splitIntoSentences,
  foldHistoryIntoInput,
  type OracleStreamChunk,
} from '../oracleStreaming';

const collect = async (gen: AsyncGenerator<OracleStreamChunk>) => {
  const out: OracleStreamChunk[] = [];
  for await (const c of gen) out.push(c);
  return out;
};

/** A claude factory that FAILS the test merely by being called. */
const forbiddenClaude = () => {
  throw new Error('ClaudeService was constructed on a sovereign turn');
};

const localSaying = (text: string) => vi.fn(async () => ({ text }));
const available = vi.fn(async () => {});

describe('T1 — local provider selected: Anthropic is unreachable', () => {
  it('does not construct ClaudeService', async () => {
    const chunks = await collect(
      streamOracleResponse('hello', {}, 'SYS', {
        provider: 'local',
        claudeFactory: forbiddenClaude as any,
        localGenerate: localSaying('I hear you.'),
        assertAvailable: available,
      }),
    );
    expect(chunks.some((c) => c.type === 'sentence')).toBe(true);
  });

  it('holds for every non-anthropic provider value, including unknown ones', async () => {
    // ⛔ Written as a default-deny: a provider nobody has implemented yet must
    // not fall through to Anthropic. That fall-through is the defect's shape.
    for (const provider of ['local', 'consciousness_engine', 'multi_engine', 'moonshot', 'something-new']) {
      const chunks = await collect(
        streamOracleResponse('hi', {}, 'SYS', {
          provider,
          claudeFactory: forbiddenClaude as any,
          localGenerate: localSaying('ok.'),
          assertAvailable: available,
        }),
      );
      expect(chunks.length, provider).toBeGreaterThan(0);
    }
  });
});

describe('T2 — local provider selected: the local model is invoked', () => {
  it('passes the voice system prompt through unchanged', async () => {
    const generate = localSaying('One. Two.');
    await collect(
      streamOracleResponse('hello', {}, 'THE VOICE SYSTEM PROMPT', {
        provider: 'local', localGenerate: generate, assertAvailable: available,
      }),
    );
    expect(generate).toHaveBeenCalledOnce();
    expect(generate.mock.calls[0][0].systemPrompt).toBe('THE VOICE SYSTEM PROMPT');
  });

  it('yields the same chunk contract the route already consumes', async () => {
    const chunks = await collect(
      streamOracleResponse('hello', {}, 'SYS', {
        provider: 'local',
        localGenerate: localSaying('First sentence. Second sentence!'),
        assertAvailable: available,
      }),
    );
    expect(chunks).toEqual([
      { type: 'sentence', text: 'First sentence.', index: 0 },
      { type: 'sentence', text: 'Second sentence!', index: 1 },
      { type: 'done', text: '', index: 2 },
    ]);
  });

  it('always ends the turn, even when the provider returns nothing', async () => {
    // ⛔ The route's teardown waits on `done`. A silent provider must not leave
    // the member's microphone hanging open.
    const chunks = await collect(
      streamOracleResponse('hello', {}, 'SYS', {
        provider: 'local', localGenerate: localSaying('   '), assertAvailable: available,
      }),
    );
    expect(chunks).toEqual([{ type: 'done', text: '', index: 0 }]);
  });
});

describe('T5 — the voice route\'s context contributors survive', () => {
  it('conversation history reaches a provider that takes a single string', async () => {
    // The Anthropic path passes structured turns. A local client accepting only
    // { systemPrompt, userInput } would silently drop them — MAIA fluent and
    // amnesiac, the exact failure the canon guard exists to catch.
    const generate = localSaying('ok.');
    await collect(
      streamOracleResponse('and then?', {
        conversationHistory: [
          { role: 'user', content: 'I have been thinking about the move.' },
          { role: 'assistant', content: 'What draws you toward it?' },
        ],
      }, 'SYS', { provider: 'local', localGenerate: generate, assertAvailable: available }),
    );
    const sent = generate.mock.calls[0][0].userInput;
    expect(sent).toContain('I have been thinking about the move.');
    expect(sent).toContain('What draws you toward it?');
    expect(sent).toContain('and then?');
  });

  it('folds at most the recent turns, and drops blanks', () => {
    const history = Array.from({ length: 20 }, (_, i) => ({ role: 'user', content: `turn ${i}` }));
    const folded = foldHistoryIntoInput('now', [...history, { role: 'user', content: '  ' }]);
    expect(folded).toContain('turn 19');
    expect(folded).not.toContain('turn 5');
  });

  it('an empty history changes nothing about the input', () => {
    expect(foldHistoryIntoInput('just this', [])).toBe('just this');
    expect(foldHistoryIntoInput('just this', undefined)).toBe('just this');
  });
});

describe('T3 — anthropic selected: the existing Claude path is preserved', () => {
  it('delegates to ClaudeService with the same arguments', async () => {
    const streaming = vi.fn(async function* () {
      yield { type: 'sentence', text: 'From Claude.', index: 0 } as OracleStreamChunk;
      yield { type: 'done', text: '', index: 1 } as OracleStreamChunk;
    });
    const factory = vi.fn(() => ({ generateOracleResponseStreaming: streaming }));
    const ctx = { conversationHistory: [{ role: 'user', content: 'hi' }] };

    const chunks = await collect(
      streamOracleResponse('hello', ctx, 'SYS', {
        provider: 'anthropic', claudeFactory: factory as any, assertAvailable: available,
      }),
    );

    expect(factory).toHaveBeenCalledOnce();
    expect(streaming).toHaveBeenCalledWith('hello', ctx, 'SYS');
    expect(chunks[0]).toEqual({ type: 'sentence', text: 'From Claude.', index: 0 });
  });

  it('an unset provider still means anthropic — no silent sovereignty change', async () => {
    // ⛔ This unit removes Anthropic's MONOPOLY, not its use. A deployment that
    // never set MAIA_TEXT_PROVIDER must behave exactly as it did.
    expect(resolveTextProvider(undefined)).toBe(process.env.MAIA_TEXT_PROVIDER?.toLowerCase() || 'anthropic');
    const factory = vi.fn(() => ({
      generateOracleResponseStreaming: async function* () {
        yield { type: 'done', text: '', index: 0 } as OracleStreamChunk;
      },
    }));
    await collect(streamOracleResponse('x', {}, 'S', {
      provider: 'anthropic', claudeFactory: factory as any, assertAvailable: available,
    }));
    expect(factory).toHaveBeenCalledOnce();
  });
});

describe('T4 — a provider failure is surfaced honestly', () => {
  it('an unavailable provider throws rather than becoming MAIA speech', async () => {
    // ⛔ MAIA-PROCESSING-FAILURE-AS-SPEECH-01 is the shape being avoided: an
    // error swallowed and rendered under MAIA's name. The guard runs FIRST and
    // its error propagates.
    const boom = vi.fn(async () => { throw new Error('ollama_model_not_loaded'); });
    await expect(collect(
      streamOracleResponse('hello', {}, 'SYS', {
        provider: 'local', localGenerate: localSaying('never'), assertAvailable: boom,
      }),
    )).rejects.toThrow('ollama_model_not_loaded');
  });

  it('the availability guard runs BEFORE any provider is touched', async () => {
    const generate = localSaying('never');
    const boom = vi.fn(async () => { throw new Error('nope'); });
    await expect(collect(
      streamOracleResponse('hello', {}, 'SYS', {
        provider: 'local', localGenerate: generate, assertAvailable: boom,
      }),
    )).rejects.toThrow();
    expect(generate).not.toHaveBeenCalled();
  });
});

describe('sentence splitting matches what the guards and TTS expect', () => {
  it('uses the same boundaries as the Anthropic streamer', () => {
    expect(splitIntoSentences('One. Two! Three?')).toEqual(['One.', 'Two!', 'Three?']);
  });

  it('a final fragment without punctuation is still emitted', () => {
    expect(splitIntoSentences('Complete. And trailing')).toEqual(['Complete.', 'And trailing']);
  });

  it('strips the soul metadata block, as the Anthropic path does', () => {
    const text = 'Visible sentence. ---SOUL_METADATA---\nsecret: yes\n---END_METADATA--- After.';
    const out = splitIntoSentences(text);
    expect(out.join(' ')).not.toContain('secret');
    expect(out[0]).toBe('Visible sentence.');
  });

  it.each([['', []], ['   ', []], [null as any, []], [undefined as any, []]])(
    'empty input %s yields no sentences', (input, expected) => {
      expect(splitIntoSentences(input)).toEqual(expected);
    });
});

// ════════════════════════════════════════════════════════════════════════════
// T6 / T7 — the ROUTE, asserted structurally
// ════════════════════════════════════════════════════════════════════════════

describe('T7 — stream-conversation no longer hardcodes Claude', () => {
  const fs = require('node:fs') as typeof import('node:fs');
  const path = require('node:path') as typeof import('node:path');
  const ROUTE = path.join(__dirname, '..', '..', '..', 'app', 'api', 'voice', 'stream-conversation', 'route.ts');
  const src = fs.readFileSync(ROUTE, 'utf8');
  const code = src
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .split('\n').filter((l) => !/^\s*(\/\/|\*)/.test(l)).join('\n');

  it('constructs no Anthropic client of its own', () => {
    // ⛔ The defect verbatim: `const claudeService = getClaudeService()` on the
    // full-LLM path, unconditional and ahead of any provider question.
    expect(code).not.toContain('getClaudeService');
    expect(code).not.toContain('claudeService');
  });

  it('streams through the shared provider authority', () => {
    expect(code).toContain("from '@/lib/ai/oracleStreaming'");
    expect(code).toContain('for await (const chunk of streamOracleResponse(');
  });

  it('T6 — the voice intelligence around the call is untouched', () => {
    // Each of these operates on the chunks the generator yields. If a provider
    // swap ever quietly removed one, MAIA would speak with a guard missing.
    for (const contributor of [
      'enforceMaiaIdentity',      // identity guard
      'guardVoiceChunk',          // memory canon guard, per sentence
      'advanceVoiceGuardTail',    // cross-chunk boundary probing
      'voiceSystemPrompt',        // the voice prompt itself
      'identityContext',          // identity / natal context
      'THRESHOLD fast-path',      // threshold governance
      'relationalStack',          // relational-stack governance
    ]) {
      expect(src, `${contributor} disappeared from the voice route`).toContain(contributor);
    }
  });

  it('T6 — STT and TTS routing were not touched by this unit', () => {
    // This unit changes who GENERATES. Transcription and speech remain where
    // they were; a provider repair that quietly moved them would be out of scope.
    expect(code).not.toContain('transcribe-simple');
    expect(code).toMatch(/emit\('text'/);
  });
});
