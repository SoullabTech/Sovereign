import { createHash } from 'node:crypto';
import { query } from '@/lib/db/postgres';
import {
  assembleH8RelationalFieldPacket,
  assembleRelationalFieldPacket,
  loadH8CrossSessionMemberTurns,
  loadPriorMemberTurns,
} from '../fieldAssembler';

jest.mock('@/lib/db/postgres', () => ({ query: jest.fn() }));
const mockQuery = query as jest.Mock;

const sha = (s: string) => createHash('sha256').update(s).digest('hex');

describe('SH-F2/3/5/8 relational field assembly', () => {
  beforeEach(() => mockQuery.mockReset());

  const prior = [
    { id: '11', exchangeId: 'x1', content: 'earlier one', createdAt: '2026-09-16T18:00:00Z' },
    { id: '12', exchangeId: 'x2', content: 'earlier two', createdAt: '2026-09-16T18:01:00Z' },
  ];

  test('binds current member turn last and preserves only member-authored evidence', () => {
    const packet = assembleRelationalFieldPacket({ exchangeId: 'x3', userInput: 'current turn', priorMemberTurns: prior });
    expect(packet.currentEvidenceId).toBe('E3');
    expect(packet.evidence.map((e) => e.text)).toEqual(['earlier one', 'earlier two', 'current turn']);
    expect(packet.evidence.every((e) => e.authoredBy === 'member')).toBe(true);
    expect(packet.evidence.every((e) => e.participationClass === 'authored')).toBe(true);
    expect(packet.evidence.every((e) => e.authority === 'situate')).toBe(true);
  });

  test('manifest stores historical source refs/digests rather than another transcript copy', () => {
    const packet = assembleRelationalFieldPacket({ exchangeId: 'x3', userInput: 'current turn', priorMemberTurns: prior });
    expect(packet.manifest[0]).toMatchObject({ sourceRowId: '11', exchangeId: 'x1', contentSha256: sha('earlier one'), current: false });
    expect(packet.manifest[2]).toMatchObject({ sourceRowId: null, exchangeId: 'x3', contentSha256: sha('current turn'), current: true });
    expect(JSON.stringify(packet.manifest)).not.toContain('earlier one');
    expect(JSON.stringify(packet.manifest)).not.toContain('current turn');
  });

  test('same inputs recompute the same packet digest', () => {
    const a = assembleRelationalFieldPacket({ exchangeId: 'x3', userInput: 'current turn', priorMemberTurns: prior });
    const b = assembleRelationalFieldPacket({ exchangeId: 'x3', userInput: 'current turn', priorMemberTurns: prior });
    expect(a.packetDigest).toBe(b.packetDigest);
  });

  test('history is bounded to the most recent eight items', () => {
    const many = Array.from({ length: 11 }, (_, i) => ({ id: String(i), exchangeId: `x${i}`, content: `turn ${i}`, createdAt: String(i) }));
    const packet = assembleRelationalFieldPacket({ exchangeId: 'current', userInput: 'now', priorMemberTurns: many });
    expect(packet.evidence).toHaveLength(9);
    expect(packet.evidence[0].text).toBe('turn 3');
    expect(packet.currentEvidenceId).toBe('E9');
  });

  test('history loader is read-only, member-only, current-exchange excluding and chronological', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [
      { id: '2', exchangeId: 'x2', content: 'later', createdAt: '2026-09-16T18:02:00Z' },
      { id: '1', exchangeId: 'x1', content: 'earlier', createdAt: '2026-09-16T18:01:00Z' },
    ] });
    const rows = await loadPriorMemberTurns('s1', 'current-x', 4);
    const [sql, params] = mockQuery.mock.calls[0];
    expect(sql).toMatch(/FROM conversation_turns/);
    expect(sql).toMatch(/role = 'user'/);
    expect(sql).toMatch(/exchange_id IS NULL OR exchange_id::text <> \$2/);
    expect(sql).not.toMatch(/INSERT|UPDATE|DELETE/i);
    expect(params).toEqual(['s1', 'current-x', 4]);
    expect(rows.map((r) => r.id)).toEqual(['1', '2']);
  });


  test('H8 cross-session loader is member-only and consent-fail-closed in SQL', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [
      { id: '7', exchangeId: 'old-x', content: 'older member turn', createdAt: '2026-09-15T18:01:00Z' },
    ] });
    const rows = await loadH8CrossSessionMemberTurns('member-1', 'current-session', 4);
    const [sql, params] = mockQuery.mock.calls[0];
    expect(sql).toMatch(/JOIN members m ON m\.id = t\.user_id/);
    expect(sql).toMatch(/m\.conversational_recall_enabled IS TRUE/);
    expect(sql).toMatch(/t\.role = 'user'/);
    expect(sql).toMatch(/t\.session_id <> \$2/);
    expect(sql).not.toMatch(/INSERT|UPDATE|DELETE/i);
    expect(params).toEqual(['member-1', 'current-session', 4]);
    expect(rows).toEqual([
      expect.objectContaining({ id: '7', sourceKind: 'cross_session_turn' }),
    ]);
  });

  test('H8 cross-session loader returns no evidence when its consent/read query fails', async () => {
    mockQuery.mockRejectedValueOnce(new Error('preference-read-failed'));
    await expect(loadH8CrossSessionMemberTurns('member-1', 'current-session', 4)).resolves.toEqual([]);
  });

  test('H8 packet reserves bounded room for cross-session evidence without contaminating source kind', () => {
    const current = Array.from({ length: 6 }, (_, i) => ({
      id: `c${i}`, exchangeId: `cx${i}`, content: `current ${i}`,
      createdAt: `2026-09-17T18:0${i}:00Z`, sourceKind: 'conversation_turn' as const,
    }));
    const cross = Array.from({ length: 6 }, (_, i) => ({
      id: `p${i}`, exchangeId: `px${i}`, content: `prior ${i}`,
      createdAt: `2026-09-16T18:0${i}:00Z`, sourceKind: 'cross_session_turn' as const,
    }));
    const packet = assembleH8RelationalFieldPacket({
      exchangeId: 'now', userInput: 'current act',
      currentSessionMemberTurns: current, crossSessionMemberTurns: cross,
    });
    const historical = packet.manifest.filter((item) => !item.current);
    expect(historical).toHaveLength(8);
    expect(historical.filter((item) => item.sourceKind === 'cross_session_turn')).toHaveLength(4);
    expect(historical.filter((item) => item.sourceKind === 'conversation_turn')).toHaveLength(4);
  });

});
