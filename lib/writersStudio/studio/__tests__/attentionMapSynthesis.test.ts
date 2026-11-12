import {
  attentionSynthesisSystem,
  buildAttentionMap,
  type AttentionSynthesisCommission,
  type AttentionSynthesisResult,
} from '../attentionMapSynthesis';

const commission: AttentionSynthesisCommission = {
  manuscriptId: 'm1',
  revisionNumber: 4,
  commissionedAt: '2026-09-28T23:30:00Z',
  readingIds: ['r1', 'r2'],
  observations: [
    { synthesisRef: 'E1', readingId: 'r1', observationKey: 'o1', lens: 'structure', sectionIds: ['s1'], observation: 'A transition repeats an earlier move.', doesNotEstablish: ['defect'] },
    { synthesisRef: 'E2', readingId: 'r2', observationKey: 'o2', lens: 'voice', sectionIds: ['s1'], observation: 'The register shifts here.', doesNotEstablish: ['reader-effect'] },
  ],
  request: 'Show me where my attention would have the most leverage.',
};

const result: AttentionSynthesisResult = {
  version: 'ams-1',
  items: [{
    band: 'begin-here',
    scale: 'section',
    label: 'Transition into the final synthesis',
    notice: 'Two independent readings converge on this section.',
    whyItMatters: 'It carries the reader into the book’s final movement.',
    uncertainty: 'The observations establish convergence, not that the passage is defective.',
    evidenceRefs: ['E1', 'E2'],
  }],
};
describe('attention-map synthesis contract', () => {
  it('binds synthesis output only to supplied frozen observations', () => {
    const map = buildAttentionMap(commission, result);
    expect(map.items[0]?.band).toBe('begin-here');
    expect(map.items[0]?.evidence).toHaveLength(2);
  });

  it('⭐ an item citing only invented evidence never reaches the writer; the evidence-bound items do, and the drop is counted', () => {
    const mixed: AttentionSynthesisResult = {
      ...result,
      items: [result.items[0]!, { ...result.items[0]!, label: 'Invented', evidenceRefs: ['E999'] }],
    };
    const map = buildAttentionMap(commission, mixed);
    expect(map.items).toHaveLength(1);
    expect(map.items.some((i) => i.label === 'Invented')).toBe(false);
    expect(map.droppedUnbound).toBe(1);
  });

  it('⭐ an invented citation is removed from an item that also cites real evidence; nothing is re-attributed', () => {
    const partly: AttentionSynthesisResult = {
      ...result,
      items: [{ ...result.items[0]!, evidenceRefs: [...result.items[0]!.evidenceRefs, 'E999'] }],
    };
    const map = buildAttentionMap(commission, partly);
    expect(map.items[0]!.evidence).toHaveLength(result.items[0]!.evidenceRefs.length);
    expect(map.droppedUnbound).toBeUndefined();
  });

  it('refuses a synthesis in which nothing is evidence-bound', () => {
    const bad: AttentionSynthesisResult = {
      ...result,
      items: [{
        ...result.items[0]!,
        evidenceRefs: ['E999'],
      }],
    };
    expect(() => buildAttentionMap(commission, bad))
      .toThrow('attention_synthesis_unbound_evidence');
  });

  it('derives manuscript locations only from the cited frozen observations', () => {
    const map = buildAttentionMap(commission, result);
    expect(map.items[0]?.sectionIds).toEqual(['s1']);
    expect(map.items[0]?.evidence[0]?.sectionIds).toEqual(['s1']);
  });

  it('makes the non-scoring law explicit in the synthesis prompt', () => {
    const system = attentionSynthesisSystem();
    expect(system).toMatch(/begin-here, next, later, watch/);
    expect(system).toMatch(/Do not emit numeric scores, grades, severity, confidence, priority/);
    expect(system).toMatch(/Do not propose replacement prose/);
  });
});
