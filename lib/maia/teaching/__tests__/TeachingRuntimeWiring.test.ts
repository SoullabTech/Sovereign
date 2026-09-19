import { readFileSync } from 'node:fs';

const source = (path: string) => readFileSync(path, 'utf8');

describe('T8 live runtime wiring', () => {
  const sovereignRoute = source('app/api/sovereign/app/maia/list/route.ts');
  const maiaService = source('lib/sovereign/maiaService.ts');
  const maiaVoice = source('lib/sovereign/maiaVoice.ts');
  const deepWrapper = source('lib/consciousness/consciousness-layer-wrapper.ts');
  const writerTurn = source('lib/manuscript/editorialRuntime/turn.ts');
  const bridge = source('lib/maia/teaching/TeachingRuntimeBridge.ts');

  it('server-adjudicates live MAIA teaching surfaces and prevents client override', () => {
    expect(sovereignRoute).toContain('resolveTeachingRuntimeSurfaceAuthority({');
    expect(sovereignRoute).toContain('buildTeachingRuntimeBridge({');
    expect(sovereignRoute).toContain('surface: surfaceAuthority.surface');
    expect(sovereignRoute).toContain('route: surfaceAuthority.route');
    const spread = sovereignRoute.indexOf('...meta,', sovereignRoute.indexOf('getMaiaResponse({'));
    const teaching = sovereignRoute.indexOf('teachingIntelligenceAddendum, // 🎓 T8', spread);
    expect(spread).toBeGreaterThan(-1);
    expect(teaching).toBeGreaterThan(spread);
  });

  it('registers the same directive in canonical participation', () => {
    expect(sovereignRoute).toContain('teachingIntelligenceAddendum,\n          memberWebAddendum');
    const shadow = source('lib/maia/canonical-turn/shadow.ts');
    expect(shadow).toContain("teachingIntelligenceAddendum: 'computed.teaching_intelligence'");
  });  it('reaches FAST, CORE and DEEP cognition', () => {
    expect(maiaService).toContain('const teachingIntelligenceAddendum = (meta as any).teachingIntelligenceAddendum');
    expect(maiaService).toContain("\${teachingIntelligenceAddendum ? '\\n\\n' + teachingIntelligenceAddendum : ''}");
    expect(maiaService).toContain('teachingIntelligenceAddendum: (meta as any)?.teachingIntelligenceAddendum');
    expect(maiaVoice).toContain("field: 'teachingIntelligenceAddendum'");
    expect(deepWrapper).toContain('teachingIntelligenceBlock(context)');
    expect(deepWrapper).toContain('context.teachingIntelligenceAddendum?.trim()');
  });

  it("admits Writer's Studio teaching through MIPA before structured inference", () => {
    expect(writerTurn).toContain("surface: 'writers_studio'");
    expect(writerTurn).toContain("domainKey: 'writing_rhetoric'");
    expect(writerTurn).toContain("producerId: 'computed.teaching_intelligence'");
    expect(writerTurn).toContain('constructEditorialWriterTurn');
    expect(writerTurn).toContain('renderEditorialTurn');
    const teaching = writerTurn.indexOf("producerId: 'computed.teaching_intelligence'");
    const model = writerTurn.indexOf('runStructured(request)');
    expect(teaching).toBeGreaterThan(-1);
    expect(model).toBeGreaterThan(teaching);
  });

  it('keeps the bridge pure: no retrieval, browsing, model, persistence, or routing execution', () => {
    for (const forbidden of [
      'retrieveGovernedKnowledge(', 'fetch(', 'runStructured(', 'getMaiaResponse(',
      'generateText(', 'pool.query(', 'query(', 'INSERT INTO', 'UPDATE ',
    ]) {
      expect(bridge).not.toContain(forbidden);
    }
  });
});
