/**
 * R2 — voice inhabits the canonical MAIA continuity contract.
 *
 * Context: on 2026-08-13, R1 bound the PWA witness turn to
 * /api/voice/stream-conversation — a route that reached ClaudeService with NO
 * memory loaded and NO memory canon guard. Both witnessed amnesia utterances
 * carry that route's fingerprint. MAIA was not evading a guard; she was
 * accurately describing a path on which she had been given nothing.
 *
 * These tests pin the two properties that make that unrepeatable:
 *
 *   1. The voice model request receives the same continuity contributors and the
 *      same memory posture as text MAIA.
 *   2. The member cannot READ OR HEAR the amnesia posture — protection happens
 *      before emission, including across chunk boundaries.
 *
 * (2) is behavioural. (1) is pinned at the wiring level: the composition is
 * assembled inside a streaming route handler that cannot be invoked without a
 * live request, so we assert the seam rather than simulate the route. We learned
 * today not to equate "loader called" with "MAIA received continuity" — so the
 * pins are on what enters the PROMPT, not merely on the loader being present.
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import { guardVoiceChunk, advanceVoiceGuardTail, VOICE_GUARD_TAIL_CHARS } from '@/lib/maia/prompts/voiceStreamGuard';

const ROOT = join(__dirname, '..');
const voiceRoute = readFileSync(join(ROOT, 'app/api/voice/stream-conversation/route.ts'), 'utf8');

const LOADED = { hasLoadedContext: true };

describe('R2 · the member cannot read or hear the amnesia posture', () => {
  it('scrubs a forbidden statement contained in one chunk', () => {
    const v = guardVoiceChunk("I don't have memory between conversations.", { recentTail: '', ...LOADED });
    expect(v.scrubbed).toBe(true);
    expect(v.reason).toBe('chunk');
    expect(v.safeText).not.toMatch(/don'?t have memory/i);
    expect(v.safeText.length).toBeGreaterThan(0); // replaced, not silenced
  });

  it('catches a violation SPLIT ACROSS CHUNKS — the streaming-specific hole', () => {
    // Neither fragment matches alone, yet the member would read and hear the
    // complete forbidden statement. This is the case a per-chunk probe misses.
    const c1 = guardVoiceChunk("I don't have", { recentTail: '', ...LOADED });
    expect(c1.scrubbed).toBe(false); // correctly innocuous on its own

    const tail = advanceVoiceGuardTail('', c1.safeText);
    const c2 = guardVoiceChunk('memory between conversations.', { recentTail: tail, ...LOADED });

    expect(c2.scrubbed).toBe(true);
    expect(c2.reason).toBe('cross-chunk');
    expect(c2.safeText).toBe(''); // the completing fragment never reaches the member
  });

  it('does NOT destroy legitimate not-in-front-of-me language', () => {
    // The original incident brief warned against over-broadening the guard.
    const v = guardVoiceChunk("I don't have that detail in front of me right now.", { recentTail: '', ...LOADED });
    expect(v.scrubbed).toBe(false);
    expect(v.safeText).toBe("I don't have that detail in front of me right now.");
  });

  it('stays honest when continuity genuinely failed', () => {
    // Different replacement when nothing was loaded: MAIA may say she cannot
    // recall when that is TRUE. The canon governs false claims, not honest ones.
    const withCtx = guardVoiceChunk("I don't have memory between conversations.", { recentTail: '', hasLoadedContext: true });
    const without = guardVoiceChunk("I don't have memory between conversations.", { recentTail: '', hasLoadedContext: false });
    expect(withCtx.safeText).not.toBe(without.safeText);
  });

  it('bounds the detection window so streaming is never buffered wholesale', () => {
    const tail = advanceVoiceGuardTail('x'.repeat(1000), 'y'.repeat(1000));
    expect(tail.length).toBeLessThanOrEqual(VOICE_GUARD_TAIL_CHARS);
  });

  it('handles an empty chunk without throwing', () => {
    expect(guardVoiceChunk('', { recentTail: 'anything', ...LOADED }).safeText).toBe('');
  });
});

describe('R2 · voice receives the same continuity substrate as text MAIA', () => {
  it('builds the shared memory bundle rather than copying /list route logic', () => {
    expect(voiceRoute).toMatch(/MemoryBundleService\.build\(/);
    expect(voiceRoute).toMatch(/formatForPrompt/);
  });

  it('puts the memory context INTO the model prompt, not merely into a variable', () => {
    // The failure mode we are guarding against is a loader that runs and whose
    // output never reaches the model.
    const composition = voiceRoute.match(/const voiceSystemPrompt\s*=\s*\[([\s\S]*?)\]/);
    expect(composition).not.toBeNull();
    expect(composition![1]).toMatch(/voiceMemoryContext/);
    expect(composition![1]).toMatch(/MEMORY_CANON_GUARD_PROMPT/);
  });

  it('requests cross-session scope — voice must not be session-local', () => {
    expect(voiceRoute).toMatch(/scope:\s*'cross_session'/);
  });

  it('a continuity failure degrades the turn instead of breaking voice', () => {
    expect(voiceRoute).toMatch(/\[Voice\/MemoryBundle\][^\n]*failed/);
  });

  it('declares its origin route so this path can never again be unattributable', () => {
    expect(voiceRoute).toMatch(/originRoute:\s*'\/api\/voice\/stream-conversation'/);
  });
});

describe('R2 · every member-visible channel consumes the guarded text', () => {
  it('TTS speaks safeText, not the raw chunk', () => {
    // Regression pin: TTS previously synthesized `chunk.text` while the screen
    // received sanitized text, so audio could speak what the screen was
    // protected from — defeating BOTH the identity and memory guards.
    expect(voiceRoute).toMatch(/const chunkText = safeText;/);
    expect(voiceRoute).not.toMatch(/const chunkText = chunk\.text;/);
  });

  it('the emitted text and the persisted transcript are the same guarded value', () => {
    expect(voiceRoute).toMatch(/text:\s*safeText,/);
    expect(voiceRoute).toMatch(/fullResponse \+= safeText/);
  });

  it('routes the guard through the shared module, not a local reimplementation', () => {
    expect(voiceRoute).toMatch(/guardVoiceChunk\(/);
    expect(voiceRoute).toMatch(/advanceVoiceGuardTail\(/);
  });
});
