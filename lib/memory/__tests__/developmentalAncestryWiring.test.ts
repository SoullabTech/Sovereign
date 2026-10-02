import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const mockQuery = jest.fn();

jest.mock('@/lib/db/postgres', () => ({
  query: (...args: unknown[]) => mockQuery(...args),
}));

import { MemoryWritebackService } from '../MemoryWriteback';

const ROOT = process.cwd();

beforeEach(() => {
  mockQuery.mockReset();
  mockQuery.mockResolvedValue({ rows: [{ id: 'memory-1' }] });
});

describe('developmental ancestry · exact exchange provenance', () => {
  it('persists the supplied exchange UUID as source_exchange_id', async () => {
    await MemoryWritebackService.writeDevelopmentalMemory({
      userId: 'member-1',
      sessionId: 'session-1',
      exchangeId: '11111111-1111-4111-8111-111111111111',
      userMessage: 'I can see the pattern now.',
      assistantResponse: 'Stay with what is becoming clear.',
      significance: 0.7,
      capsule: {
        distilledSignal: 'recognition forming; clarity emerging; steady',
        signalQuality: 'distilled',
        facts: [],
        preferences: [],
        openLoops: [],
        entities: [],
      },
    });

    const [sql, params] = mockQuery.mock.calls[0] as [string, unknown[]];
    expect(sql).toContain('source_exchange_id');
    expect(params[7]).toBe('11111111-1111-4111-8111-111111111111');
  });

  it('preserves unknown ancestry as NULL when no exchange identity is supplied', async () => {
    await MemoryWritebackService.writeDevelopmentalMemory({
      userId: 'member-1',
      sessionId: 'session-1',
      userMessage: 'A legacy-compatible call.',
      assistantResponse: 'No invented lineage.',
      significance: 0.7,
      capsule: {
        distilledSignal: 'recognition forming; integration landing; steady',
        signalQuality: 'distilled',
        facts: [],
        preferences: [],
        openLoops: [],
        entities: [],
      },
    });

    const [, params] = mockQuery.mock.calls[0] as [string, unknown[]];
    expect(params[7]).toBeNull();
  });

  it('/list reuses its existing pre-generation exchangeId for writeback', () => {
    const source = readFileSync(
      join(ROOT, 'app/api/sovereign/app/maia/list/route.ts'),
      'utf8',
    );
    expect(source).toMatch(/MemoryWritebackService\.writeBack\(\{[\s\S]*?sessionId: session\.id,[\s\S]*?exchangeId,[\s\S]*?userMessage: message/);
  });

  it('/between uses one UUID for generation and later exchange persistence', () => {
    const source = readFileSync(join(ROOT, 'app/api/between/chat/route.ts'), 'utf8');
    expect(source).toContain('const exchangeId = crypto.randomUUID();');
    expect(source).toMatch(/generateMaiaTurn\(\{[\s\S]*?sessionId: safeSessionId,[\s\S]*?exchangeId,/);
    expect(source).toMatch(/addConversationExchange\(safeSessionId,[\s\S]*?userId: effectiveUserId,[\s\S]*?exchangeId,/);
  });

  it('keeps exchange identity explicit at the orchestrator boundary', () => {
    const source = readFileSync(join(ROOT, 'lib/consciousness/maiaOrchestrator.ts'), 'utf8');
    expect(source).toContain('exchangeId?: string;');
    expect(source).toMatch(/MemoryWritebackService\.writeBack\(\{[\s\S]*?sessionId,[\s\S]*?exchangeId,[\s\S]*?userMessage: message/);
  });

  it('does not weaken the Sanctuary writeback refusal', () => {
    const source = readFileSync(join(ROOT, 'lib/consciousness/maiaOrchestrator.ts'), 'utf8');
    expect(source).toMatch(/if \(isSanctuary\) \{[\s\S]*?MemoryWriteback[\s\S]*?Skipped - Sanctuary mode[\s\S]*?\} else if \(memoryMode === 'longterm'\)/);
  });
});
