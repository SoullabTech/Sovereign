import { createHash } from 'crypto';
import { readFileSync } from 'fs';
import { join } from 'path';

const path = join(process.cwd(), 'docs/programme/VOICE-2026/evidence/TURN-03-A3-SMARTTURN-01-20260916/A3_SMARTTURN_EVIDENCE.json');
const bytes = readFileSync(path);
const evidence = JSON.parse(bytes.toString('utf8'));
const sha = createHash('sha256').update(bytes).digest('hex');

describe('TURN-03 A3 Smart Turn comparator evidence', () => {
  it('pins the exact sealed evidence and preserves shadow-only authority', () => {
    expect(sha).toBe('2588168fe038cbcab6ac93ff8b7b09f4ad6917a165bc84e17933c5d55f474c42');
    expect(evidence.shadowOnly).toBe(true);
    expect(evidence.network.noOpenSocketsObserved).toBe(true);
    expect(evidence.authority).toEqual({ canCommitTranscript:false, canDispatchCognition:false, canStartTts:false, canAlterEndpointing:false });
  });
  it('records raw Smart Turn as still interruption-prone', () => {
    expect(evidence.metrics.smartTurn.overall.falseFloorSeizures).toBe(5);
    expect(evidence.metrics.smartTurn.overall.falseFloorSeizureRate).toBe(0.625);
    expect(evidence.metrics.smartTurn.overall.yieldRecall).toBe(1);
  });
  it('records semantic override improvement without claiming model promotion', () => {
    expect(evidence.metrics.smartTurnSemantic.overall.falseFloorSeizures).toBe(2);
    expect(evidence.metrics.smartTurnSemantic.overall.falseFloorSeizureRate).toBe(0.25);
    expect(evidence.metrics.smartTurnSemantic.overall.yieldRecall).toBe(1);
    expect(evidence.metrics.sealedControls.semantic.falseFloorSeizures).toBe(0);
    expect(evidence.metrics.sealedControls.semantic.yieldRecall).toBe(1);
  });
  it('pins emotional pause and re-entry as the residual false seizures', () => {
    const failures = evidence.cases.filter((r:any) => r.label === 'continue' && r.smartTurnSemantic.decision === 'yield_candidate').map((r:any) => r.id).sort();
    expect(failures).toEqual(['emotional-6s','reentry-4s']);
  });
});
