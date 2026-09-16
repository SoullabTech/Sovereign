import { readFileSync } from 'fs';
import { join } from 'path';
import { decideTurn } from '@/lib/voice/turnArbiter';
import { evaluateTurnBench } from '@/lib/voice/turnBench';

const base = {
  explicitFloorHeld: false,
  speechActive: false,
  silenceMs: 4000,
  selectedSilenceMs: 3500,
};
const W = (p: string) => readFileSync(join(process.cwd(), p), 'utf8');

describe('TURN-02 · predictive turn intelligence', () => {
  it('explicit floor ownership always wins over predictor yield confidence', () => {
    expect(decideTurn({ ...base, explicitFloorHeld: true, acousticYield: 1, semanticYield: 1 }).decision).toBe('wait');
  });

  it('active speech always retains the floor', () => {
    expect(decideTurn({ ...base, speechActive: true, acousticYield: 1 }).decision).toBe('wait');
  });

  it('never recommends yield before the member-selected conversational-space threshold', () => {
    expect(decideTurn({ ...base, silenceMs: 1200, acousticYield: 1, semanticYield: 1 }).decision).toBe('wait');
  });

  it('continuation evidence wins a conflict conservatively', () => {
    expect(decideTurn({ ...base, acousticContinue: 0.86, acousticYield: 0.91 }).decision).toBe('wait');
  });

  it('can recommend yield only after member space and strong yield evidence', () => {
    expect(decideTurn({ ...base, acousticContinue: 0.18, acousticYield: 0.82, semanticYield: 0.78 }).decision).toBe('yield_candidate');
  });

  it('keeps backchannel permission distinct from floor permission', () => {
    const r = decideTurn({ ...base, silenceMs: 900, acousticContinue: 0.8, backchannel: 0.9 });
    expect(r.decision).toBe('backchannel_candidate');
    expect(r.decision).not.toBe('yield_candidate');
  });

  it('refuses to manufacture a prediction when no predictor evidence exists', () => {
    expect(decideTurn(base).decision).toBe('insufficient_evidence');
  });

  it('benchmarks false floor seizures as a first-class metric', () => {
    const m = evaluateTurnBench([
      { label: 'continue', decision: 'wait' },
      { label: 'continue', decision: 'yield_candidate' },
      { label: 'yield', decision: 'yield_candidate', latencyMs: 420 },
      { label: 'yield', decision: 'wait' },
    ]);
    expect(m.falseFloorSeizureRate).toBe(0.5);
    expect(m.yieldRecall).toBe(0.5);
    expect(m.medianYieldLatencyMs).toBe(420);
  });

  it('keeps TURN-02 shadow-only in ContinuousConversation', () => {
    const src = W('components/voice/ContinuousConversation.tsx');
    expect(src).toContain('voice_turn_shadow_decision');
    expect(src).not.toMatch(/if\s*\([^)]*shadowDecision[^)]*\)/);
  });
});
