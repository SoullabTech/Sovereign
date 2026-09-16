import { parseTurnBenchCase } from '@/lib/voice/turnBenchCorpus';
import { evaluateTurnBenchByClass } from '@/lib/voice/turnBench';

const evidence = {
  explicitFloorHeld: false,
  speechActive: false,
  silenceMs: 4000,
  selectedSilenceMs: 3500,
  acousticContinue: 0.2,
  acousticYield: 0.8,
};

describe('MAIA-TURN-BENCH-01', () => {
  it('accepts a content-free structural case', () => {
    const c = parseTurnBenchCase({ id: 'case-1', pauseClass: 'word_search', label: 'continue', evidence });
    expect(c.pauseClass).toBe('word_search');
  });

  it.each(['transcript', 'text', 'audio', 'audioPath', 'utterance', 'words'])('rejects content-bearing repo field %s', (key) => {
    expect(() => parseTurnBenchCase({ id: 'case-1', pauseClass: 'word_search', label: 'continue', evidence, [key]: 'private member content' })).toThrow(/forbidden/);
    expect(() => parseTurnBenchCase({ id: 'case-1', pauseClass: 'word_search', label: 'continue', evidence: { ...evidence, [key]: 'private member content' } })).toThrow(/forbidden/);
  });

  it('rejects malformed predictor probabilities', () => {
    expect(() => parseTurnBenchCase({ id: 'bad-prob', pauseClass: 'ordinary_pause', label: 'yield', evidence: { ...evidence, acousticYield: 1.2 } })).toThrow(/probability/);
  });

  it('rejects unrecognized pause classes rather than silently relabeling them', () => {
    expect(() => parseTurnBenchCase({ id: 'x', pauseClass: 'slow_person', label: 'continue', evidence })).toThrow(/pauseClass/);
  });

  it('reports false floor seizure rate by pause class', () => {
    const byClass = evaluateTurnBenchByClass([
      { pauseClass: 'word_search', label: 'continue' as const, decision: 'yield_candidate' as const },
      { pauseClass: 'word_search', label: 'continue' as const, decision: 'wait' as const },
      { pauseClass: 'question_yield', label: 'yield' as const, decision: 'yield_candidate' as const, latencyMs: 380 },
    ]);
    expect(byClass.word_search.falseFloorSeizureRate).toBe(0.5);
    expect(byClass.question_yield.yieldRecall).toBe(1);
  });
});
