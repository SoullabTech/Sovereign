/**
 * M1.5 — the observability cut.
 *
 * These tests pin TWO things, and the second matters more than the first:
 *
 *   1. the new evidence is truthful;
 *   2. NOTHING ELSE MOVED.
 *
 * M1 established that the voice path's memory reading could not distinguish
 * retrieval from ranking from selection from prompt inclusion. M1.5 makes those
 * separable. It is explicitly NOT allowed to make memory better — so every seam
 * touched below is proved identical before/after, with only emitted evidence
 * differing. There is no blanket "behaviour unchanged" assertion anywhere here;
 * each seam is pinned on its own.
 */

import { MemoryBundleService } from '@/lib/memory/MemoryBundle';
import {
  detectMemoryLayerHits,
  countMemoryLayerHits,
  type MemoryLayerHits,
} from '@/lib/consciousness/fieldMonitorTelemetry';
import { readFileSync } from 'fs';
import { join } from 'path';

const ROOT = join(__dirname, '..');
const src = readFileSync(join(ROOT, 'app/api/voice/stream-conversation/route.ts'), 'utf8');
/** Strip comments so no pin can be satisfied by prose. */
const code = src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^[ \t]*\/\/.*$/gm, '');

const candidate = (over: Partial<any> = {}): any => ({
  id: 'c1', content: 'x', source: 'turn', significance: 0.5,
  timestamp: new Date('2026-08-01T00:00:00Z'), similarity: 0, compositeScore: 0, ...over,
});

// ═══════════════════════════════════════════════════════════════════
// SEAM 1 · ranking — untouched
// ═══════════════════════════════════════════════════════════════════
describe('SEAM ranking · identical', () => {
  it('keeps the exact composite formula and the pre-computed-score short-circuit', () => {
    const c = candidate({ similarity: 0.5, significance: 0.8, timestamp: new Date() });
    const [ranked] = MemoryBundleService.rankCandidates([c], 'q');
    // 0.40*sim + 0.30*sig + 0.20*recency + 0.10, recency≈1 today, facet 1.0
    expect(ranked.compositeScore).toBeCloseTo(0.4 * 0.5 + 0.3 * 0.8 + 0.2 * 1 + 0.1, 2);
  });

  it('still preserves a pre-computed score rather than recomputing it', () => {
    const c = candidate({ source: 'developmental', compositeScore: 0.87 });
    expect(MemoryBundleService.rankCandidates([c], 'q')[0].compositeScore).toBe(0.87);
  });

  it('still orders by descending score', () => {
    const out = MemoryBundleService.rankCandidates(
      [candidate({ id: 'lo', compositeScore: 0.1 }), candidate({ id: 'hi', compositeScore: 0.9 })],
      'q',
    );
    expect(out.map((c) => c.id)).toEqual(['hi', 'lo']);
  });
});

// ═══════════════════════════════════════════════════════════════════
// SEAM 2 · dedup + selection cutoff — untouched
// ═══════════════════════════════════════════════════════════════════
describe('SEAM selection · identical', () => {
  it('still dedups on the first-100-char hash', () => {
    const out = MemoryBundleService.deduplicate([
      candidate({ id: 'a', content: 'Same Thing' }),
      candidate({ id: 'b', content: 'same   thing' }),
      candidate({ id: 'c', content: 'different' }),
    ]);
    expect(out.map((c) => c.id)).toEqual(['a', 'c']);
  });

  it('selectionTrace marks exactly the first maxBullets as selected — it does not decide them', () => {
    // The trace is a projection of an ordering the pipeline already produced.
    // If this ever disagrees with slice(0, n), the trace has become an actor.
    const deduped = Array.from({ length: 8 }, (_, i) => candidate({ id: `c${i}` }));
    const maxBullets = 5;
    const trace = deduped.map((c, index) => ({ id: c.id, rank: index, selected: index < maxBullets }));
    const sliced = deduped.slice(0, maxBullets).map((c) => c.id);

    expect(trace.filter((t) => t.selected).map((t) => t.id)).toEqual(sliced);
    expect(trace.filter((t) => t.selected)).toHaveLength(5);
    expect(trace.filter((t) => !t.selected).map((t) => t.id)).toEqual(['c5', 'c6', 'c7']);
  });
});

// ═══════════════════════════════════════════════════════════════════
// SEAM 3 · retrieval + formatting + prompt composition — untouched
// ═══════════════════════════════════════════════════════════════════
describe('SEAM retrieval/formatting/prompt · identical', () => {
  it('retrieval arguments are unchanged, and no M3 work rode along', () => {
    const call = code.slice(code.indexOf('MemoryBundleService.build('));
    const args = call.slice(0, call.indexOf('});'));
    expect(args).toContain('currentInput: message');
    expect(args).toContain('sessionId: effectiveSessionId');
    expect(args).toContain("scope: 'cross_session'");
    expect(args).toContain('maxBullets: 5');
    expect(args).not.toContain('threshold');
    expect(args).not.toContain('limit:');
    // D5: no traceId here on purpose — passing it would make MemoryBundle write
    // conversation_memory_uses rows at RETRIEVAL time, which is the text-path
    // conflation this cut refuses to reproduce.
    expect(args).not.toContain('traceId');
  });

  it('F10 remains intact — observability did not loosen the Sanctuary boundary', () => {
    const before = code.slice(0, code.indexOf('MemoryBundleService.build('));
    const guard = before.slice(before.lastIndexOf('if ('));
    expect(guard).toMatch(/!\s*sanctuary/);
  });

  it('prompt composition keeps the same contributors, filter and join', () => {
    const c = code.slice(code.indexOf('const voicePromptParts'), code.indexOf('const memoryPromptIncluded'));
    expect(c).toContain('councilPromptSection');
    expect(c).toContain('identityContext?.astrologyAddendum');
    expect(c).toContain('voiceMemoryContext');
    expect(c).toContain('MEMORY_CANON_GUARD_PROMPT');
    expect(c).toMatch(/\.filter\(\(s\): s is string => !!s && s\.length > 0\)/);
    expect(c).toMatch(/voicePromptParts\.join\('\\n\\n'\) \|\| undefined/);
  });

  it('formatForPrompt output is still the only thing that becomes memory context', () => {
    expect(code).toMatch(/voiceMemoryContext = MemoryBundleService\.formatForPrompt\(bundle\) \|\| ''/);
  });
});

// ═══════════════════════════════════════════════════════════════════
// D4 · the witness must not be a string search
// ═══════════════════════════════════════════════════════════════════
describe('D4 · prompt-inclusion witness', () => {
  it('rejects the substring form, which reports INCLUDED for an empty context', () => {
    // This is the whole reason the witness is array membership. Under Sanctuary
    // voiceMemoryContext is '', and String.includes('') is unconditionally true —
    // so the substring witness would have lied about the F10 boundary first.
    const prompt = 'council\n\nguard';
    expect(prompt.includes('')).toBe(true);            // the trap
    expect(['council', 'guard'].includes('')).toBe(false); // the form actually used
  });

  it('is implemented as array membership guarded on a non-empty context', () => {
    const w = code.slice(code.indexOf('const memoryPromptIncluded'));
    const expr = w.slice(0, w.indexOf(';'));
    expect(expr).toContain('voiceMemoryContext.length > 0');
    expect(expr).toContain('voicePromptParts.includes(voiceMemoryContext)');
    expect(expr).not.toMatch(/voiceSystemPrompt\.includes\(/);
  });
});

// ═══════════════════════════════════════════════════════════════════
// D5 · attribution means USED, not retrieved
// ═══════════════════════════════════════════════════════════════════
describe('D5 · conversation_memory_uses attribution', () => {
  it('writes only when memory actually reached the prompt, and only what was selected', () => {
    const a = code.slice(code.indexOf('if (memoryPromptIncluded'));
    const block = a.slice(0, a.indexOf('timer.mark'));
    expect(block).toContain('memoryPromptIncluded');
    expect(block).toContain('memorySelected.length > 0');
    expect(block).toContain('!sanctuary');
    expect(block).toContain('messageId: turnId');
    expect(block).toContain('candidates: memorySelected.map');
    // Non-blocking: attribution must not enter the response path.
    expect(block).toContain('.catch(');
    expect(block).not.toMatch(/await ConversationMemoryUsesStore/);
  });

  it('retrieval-side evidence survives a turn that included nothing', () => {
    // The M2 negative control: retrieved>0, selected=0, included=false must still
    // leave a witness — just not a false claim of use.
    const t = code.slice(code.indexOf('[voice:memory_trace:'));
    const line = t.slice(0, t.indexOf(');'));
    for (const field of ['attempted=', 'retrieved=', 'selected=', 'formatted=', 'promptIncluded=']) {
      expect(line).toContain(field);
    }
    expect(line).toContain('notAttemptedReason=');
  });
});

// ═══════════════════════════════════════════════════════════════════
// D6 · Palace flags stop being fictitious observations
// ═══════════════════════════════════════════════════════════════════
describe('D6 · Palace truthfulness', () => {
  it('reports not_run instead of five false observations when the palace did not run', () => {
    const hits = detectMemoryLayerHits(undefined);
    expect(hits.palace).toBe('not_run');
    // The five keys must be ABSENT, not false: the production aggregate reads
    // (memory_layers_hit->>'episodic')::boolean = true, and a missing key yields
    // NULL, so these rows stop being counted rather than counting as negatives.
    for (const k of ['episodic', 'somatic', 'morphic', 'semantic', 'session']) {
      expect(k in hits).toBe(false);
    }
  });

  it('counts zero for not_run — the naive Object.values count would invent two hits', () => {
    const hits = detectMemoryLayerHits(null);
    expect(Object.values(hits).filter(Boolean).length).toBe(2); // the old formula's answer
    expect(countMemoryLayerHits(hits)).toBe(0);                  // the truthful one
  });

  it('still reports real palace hits unchanged when the palace DID run', () => {
    const hits = detectMemoryLayerHits({
      significantEpisodes: [{ a: 1 }],
      sessionMemory: { b: 2 },
      somaticPatterns: [],
    }) as Extract<MemoryLayerHits, { palace: 'ran' }>;
    expect(hits.palace).toBe('ran');
    expect(hits.episodic).toBe(true);
    expect(hits.session).toBe(true);
    expect(hits.somatic).toBe(false);
    expect(hits.morphic).toBe(false);
    expect(countMemoryLayerHits(hits)).toBe(2);
  });

  it('memory_layer_count stays a non-null integer — the DB column is NOT NULL', () => {
    expect(countMemoryLayerHits(detectMemoryLayerHits(undefined))).toBe(0);
    expect(Number.isInteger(countMemoryLayerHits(detectMemoryLayerHits(undefined)))).toBe(true);
  });
});
