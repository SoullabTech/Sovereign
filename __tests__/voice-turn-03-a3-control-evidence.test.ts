import { readFileSync } from 'fs';
import { join } from 'path';
const E='docs/programme/VOICE-2026/evidence/TURN-03-A3-SYNTH-01-20260916/A3_SYNTH_CONTROL_EVIDENCE.json';
const R='docs/programme/VOICE-2026/TURN-03_A3_SYNTH_CONTROL_2026-09-16.md';
const evidence=JSON.parse(readFileSync(join(process.cwd(),E),'utf8'));
const record=readFileSync(join(process.cwd(),R),'utf8');

describe('TURN-03 A3 synthetic control evidence',()=>{
  it('pins the baseline interruption problem',()=>{
    expect(evidence.metrics.baseline.overall.falseFloorSeizures).toBe(6);
    expect(evidence.metrics.baseline.overall.falseFloorSeizureRate).toBe(0.75);
    expect(evidence.metrics.baseline.overall.yieldRecall).toBe(1);
  });
  it('proves DualTurn adds no decision value over conservative control on this corpus',()=>{
    expect(evidence.metrics.acoustic.overall).toEqual(evidence.metrics.conservative.overall);
    expect(evidence.metrics.acoustic.overall.falseFloorSeizures).toBe(0);
    expect(evidence.metrics.acoustic.overall.yieldRecall).toBe(0);
  });
  it('proves fusion matches semantic-only on this corpus',()=>{
    expect(evidence.metrics.fused.overall).toEqual(evidence.metrics.semantic.overall);
    expect(evidence.metrics.fused.overall.falseFloorSeizures).toBe(0);
    expect(evidence.metrics.fused.overall.yieldRecall).toBe(1);
  });
  it('keeps A3 open and live authority closed',()=>{
    expect(evidence.authority).toEqual({canCommitTranscript:false,canDispatchCognition:false,canStartTts:false,canAlterEndpointing:false});
    expect(record).toContain('does **not** demonstrate incremental decision value from DualTurn');
    expect(record).toContain('A3 remains OPEN');
    expect(record).toContain('must not be latched across the member-selected Conversational Space threshold');
  });
});
