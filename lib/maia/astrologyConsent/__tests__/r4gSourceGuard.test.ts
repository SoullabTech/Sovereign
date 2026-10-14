import fs from 'node:fs';
import path from 'node:path';
const read = (p: string) => fs.readFileSync(path.join(process.cwd(), p), 'utf8');

describe('R4G sealed MAIA route and derivative-memory source boundaries', () => {
  it('holds both MAIA endpoints before model and turn acceptance', () => {
    const between = read('app/api/between/chat/route.ts');
    expect(between.indexOf('assertR4gOrdinarySession(safeSessionId, requestedSessionId)'))
      .toBeLessThan(between.indexOf('generateMaiaTurn({'));
    const list = read('app/api/sovereign/app/maia/list/route.ts');
    expect(list.indexOf('await assertR4gOrdinarySession(sessionId)'))
      .toBeLessThan(list.indexOf('TurnsStore.addExchangeTurn(turnPosture'));
    const service = read('lib/sovereign/maiaService.ts');
    expect(service.indexOf('await assertR4gOrdinarySession(sessionId)'))
      .toBeLessThan(service.indexOf('const turnCount = await incrementTurnCount(sessionId)'));
  });
  it('blocks every long-term writeBack entry, including direct writers', () => {
    const writeback = read('lib/memory/MemoryWriteback.ts');
    expect((writeback.match(/await assertR4gOrdinarySession\(sessionId\)/g) || []).length).toBeGreaterThanOrEqual(4);
    expect(writeback).toContain('source_exchange_id');
    expect(writeback).toContain('exchangeId,');
  });
  it('filters developmental, vector and breakthrough recall before prompts', () => {
    const bundle = read('lib/memory/MemoryBundle.ts');
    expect(bundle).toContain('excludeProtectedDevelopmentalMemories');
    expect(bundle).toContain('eligibleVectorRows.map');
    expect(bundle).toContain("breakthrough_moments.origin_scope = 'ordinary'");
    expect(bundle).toContain('source.exchange_id = breakthrough_moments.source_exchange_id');
    const vector = read('lib/sovereign/maiaService.ts');
    expect(vector).toContain('semanticSourceExchangeId');
    expect(vector).toContain('source_exchange_id');
  });
  it('requires separate migration, never asserts historical untagged safety', () => {
    const migration = read('database/migrations/20261013000002_r4g_derivative_ancestry.sql');
    expect(migration).toContain('ADD COLUMN IF NOT EXISTS source_exchange_id');
    expect(migration).toContain('NULL means ancestry was not recorded');
  });
});
