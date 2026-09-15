/**
 * RETURN-LOCUS-01 — the tie rule, as a law rather than an implementation
 * detail. These assert the SHAPE the read must produce, so a future rewrite
 * that reaches for `[0]` fails here rather than in front of a writer.
 */
import type { SectionActivity } from '../sectionActivity';

/** The rule, stated independently of SQL so it can be checked against it. */
function decide(rows: { id: string; at: string }[]): SectionActivity {
  if (rows.length === 0) return { kind: 'none' };
  const max = rows.reduce((a, r) => (r.at > a ? r.at : a), rows[0]!.at);
  const holders = rows.filter((r) => r.at === max);
  return holders.length === 1
    ? { kind: 'distinct', sectionId: holders[0]!.id, at: max }
    : { kind: 'undifferentiated', at: max, among: holders.length };
}

const S = (id: string, at: string) => ({ id, at });

describe('a locus exists only when the evidence discriminates', () => {
  it('⭐ one section holding the latest change IS a place', () => {
    const r = decide([S('a', '2026-09-01T10:00Z'), S('b', '2026-09-14T10:00Z')]);
    expect(r).toEqual({ kind: 'distinct', sectionId: 'b', at: '2026-09-14T10:00Z' });
  });

  it('⛔⛔ a TIE is not a weak signal to be ranked — it is NO place', () => {
    /* An import, a conversion, a whole-draft save and a restore all stamp every
       row with one timestamp. Choosing among them would replace "always
       Chapter 1" with a different invisible guess. */
    const t = '2026-09-14T10:00Z';
    const r = decide([S('a', t), S('b', t), S('c', t)]);
    expect(r.kind).toBe('undifferentiated');
    expect(r).not.toHaveProperty('sectionId');
  });

  it('⭐ a single later save breaks a prior tie, and that is meaningful', () => {
    const t = '2026-09-14T10:00Z';
    const r = decide([S('a', t), S('b', t), S('c', '2026-09-15T09:00Z')]);
    expect(r).toEqual({ kind: 'distinct', sectionId: 'c', at: '2026-09-15T09:00Z' });
  });

  it('a Work with no sections has no place, and says so', () => {
    expect(decide([])).toEqual({ kind: 'none' });
  });

  it('⛔ ordering of the input never decides the answer', () => {
    /* The defect this forbids is a rule that depends on row order. */
    const t = '2026-09-14T10:00Z';
    const rows = [S('a', t), S('b', t)];
    expect(decide(rows)).toEqual(decide([...rows].reverse()));
  });

  it('⛔ nothing here claims she was WRITING there', () => {
    /* STUDIO-WRITING-PRESENCE-01: updated_at establishes draft ACTIVITY.
       The type carries no `wroteAt`, no `authored`, no `writing`. */
    const r = decide([S('a', '2026-09-14T10:00Z')]) as Record<string, unknown>;
    expect(Object.keys(r).sort()).toEqual(['at', 'kind', 'sectionId']);
  });
});
