jest.mock('@/lib/db/postgres', () => ({ query: jest.fn() }));
jest.mock('@/lib/manuscript/ask/threadStore', () => ({ loadThread: jest.fn() }));
import { query } from '@/lib/db/postgres';
import { loadThread } from '@/lib/manuscript/ask/threadStore';
import { resolveCraftPassCarry, craftPassCandidates } from '../craftPassCarry';

const q = query as jest.Mock;
const load = loadThread as jest.Mock;
const input = { memberId: 'writer', receiverThreadId: 'new', sourceThreadId: 'old', sourceTurnIndex: 1 };
const rows = [
  { id: 'new', manuscript_id: 'work', proposal_chain_id: 'new-chain' },
  { id: 'old', manuscript_id: 'work', proposal_chain_id: 'old-chain' },
];
describe('Prior-passage carry is server-resolved and authorship-separated', () => {
  beforeEach(() => {
    jest.clearAllMocks(); q.mockResolvedValue({ rows });
    load.mockResolvedValue({ id: 'old', manuscriptId: 'work', turns: [
      { index: 0, speaker: 'author', body: 'Keep my word.' },
      { index: 1, speaker: 'maia', body: 'The later paragraph is worth considering.' },
      { index: 2, speaker: 'author', body: 'This is after the carried boundary.' },
    ] });
  });
  it('carries exact records only through the selected MAIA boundary', async () => {
    const out = await resolveCraftPassCarry(input);
    expect(out.ok).toBe(true); if (!out.ok) throw new Error(out.reason);
    expect(out.carry.memberTurns).toEqual([{ turnIndex: 0, body: 'Keep my word.' }]);
    expect(out.carry.maiaTurns).toEqual([{ turnIndex: 1, body: 'The later paragraph is worth considering.' }]);
    const blocks = craftPassCandidates(out.carry);
    expect(blocks[0]?.producerId).toBe('member.writer_prior_work_conversation');
    expect(blocks[1]?.producerId).toBe('system.writer_prior_work_conversation');
    expect(blocks[0]?.text).not.toContain('The later paragraph');
    expect(blocks[1]?.text).not.toContain('Keep my word');
    expect(q.mock.calls[0][0]).toMatch(/^SELECT/);
    expect(q.mock.calls[0][1]).toEqual(['writer', ['new', 'old']]);
  });
  it('refuses a source unavailable to the verified owner, before loading its body', async () => {
    q.mockResolvedValue({ rows: rows.slice(0,1) });
    expect(await resolveCraftPassCarry(input)).toEqual({ ok: false, reason: 'craft_pass_source_unavailable' });
    expect(load).not.toHaveBeenCalled();
  });
  it('refuses a source from another Work', async () => {
    q.mockResolvedValue({ rows: [rows[0], { ...rows[1], manuscript_id: 'other-work' }] });
    expect(await resolveCraftPassCarry(input)).toEqual({ ok: false, reason: 'craft_pass_scope_mismatch' });
    expect(load).not.toHaveBeenCalled();
  });
  it('requires two real editorial chains rather than an arbitrary nearby conversation', async () => {
    q.mockResolvedValue({ rows: [rows[0], { ...rows[1], proposal_chain_id: null }] });
    expect(await resolveCraftPassCarry(input)).toEqual({ ok: false, reason: 'craft_pass_scope_mismatch' });
  });
  it('does not substitute another or later turn for a missing boundary', async () => {
    expect(await resolveCraftPassCarry({ ...input, sourceTurnIndex: 20 })).toEqual({ ok: false, reason: 'craft_pass_boundary_missing' });
    expect(await resolveCraftPassCarry({ ...input, sourceTurnIndex: 0 })).toEqual({ ok: false, reason: 'craft_pass_boundary_missing' });
  });
  it('refuses oversized context without inventing a summary', async () => {
    load.mockResolvedValue({ manuscriptId: 'work', turns: [{ index: 1, speaker: 'maia', body: 'x'.repeat(36001) }] });
    expect(await resolveCraftPassCarry(input)).toEqual({ ok: false, reason: 'craft_pass_context_too_large' });
  });
  it('keeps exact recent exchanges under the budget and explicitly discloses omitted history', async () => {
    const turns = Array.from({ length: 14 }, (_, index) => ({ index,
      speaker: index % 2 ? 'maia' : 'author', body: String(index) + 'x'.repeat(5000) }));
    load.mockResolvedValue({ manuscriptId: 'work', turns });
    const out = await resolveCraftPassCarry({ ...input, sourceTurnIndex: 13 });
    expect(out.ok).toBe(true); if (!out.ok) throw new Error(out.reason);
    expect(out.carry.omittedTurnCount).toBeGreaterThan(0);
    expect(out.carry.memberTurns.at(-1)?.body).toBe(turns[12]!.body);
    expect(out.carry.maiaTurns.at(-1)?.body).toBe(turns[13]!.body);
    expect(craftPassCandidates(out.carry)[0]?.text).toContain('older turns omitted');
    expect([...out.carry.memberTurns, ...out.carry.maiaTurns].reduce((n,t)=>n+Array.from(t.body).length,0)).toBeLessThanOrEqual(36000);
  });

});
