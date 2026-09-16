import { inferSemanticTurnSignals } from '@/lib/voice/semanticTurnSignals';
import { decideTurn } from '@/lib/voice/turnArbiter';

describe('TURN-02 high-precision semantic turn cues', () => {
  it('recognizes the exact incomplete construction from the DualTurn falsifier', () => {
    const s = inferSemanticTurnSignals("I think what I'm realizing is");
    expect(s.semanticIncomplete).toBeGreaterThanOrEqual(0.9);
    expect(s.reasons).toContain('dangling_syntax');
  });

  it('honors explicit floor-hold language', () => {
    for (const text of ['give me a second', 'let me think', "I'm not done", 'stay with me']) {
      expect(inferSemanticTurnSignals(text).semanticIncomplete).toBe(1);
    }
  });

  it('recognizes explicit yield language without treating ordinary completion as a command', () => {
    for (const text of ["I'm done.", 'what do you think?', 'your turn', 'go ahead']) {
      expect(inferSemanticTurnSignals(text).semanticYield).toBe(1);
    }
    expect(inferSemanticTurnSignals('I went to the store.').semanticYield).toBeNull();
  });

  it('recognizes dangling conjunctions and fillers conservatively', () => {
    expect(inferSemanticTurnSignals('This matters because').semanticIncomplete).toBeGreaterThanOrEqual(0.9);
    expect(inferSemanticTurnSignals('I was thinking, um').semanticIncomplete).toBeGreaterThanOrEqual(0.8);
  });

  it('overrides the measured DualTurn false-yield for unfinished syntax', () => {
    const semantic = inferSemanticTurnSignals("I think what I'm realizing is");
    const r = decideTurn({
      explicitFloorHeld: false,
      speechActive: false,
      silenceMs: 4000,
      selectedSilenceMs: 3500,
      acousticContinue: 0.0731,
      acousticYield: 0.9861,
      semanticIncomplete: semantic.semanticIncomplete,
    });
    expect(r.decision).toBe('wait');
    expect(r.reasons).toContain('continuation_evidence');
  });

  it('does not invent incompleteness for ambiguous ordinary phrases', () => {
    for (const text of ['I think', "I don't know", 'maybe', 'this is hard']) {
      expect(inferSemanticTurnSignals(text).semanticIncomplete).toBeNull();
    }
  });
});
