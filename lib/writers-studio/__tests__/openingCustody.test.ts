jest.mock('@/lib/db/postgres', () => ({ query: jest.fn(), transaction: jest.fn() }));
import {
  appendEditorialEpisodeWithClient, appendEditorialOpeningEpisodeWithClient,
  RelationshipCustodyRefused, EDITORIAL_OPENING_GESTURE,
} from '../relationshipCustody';

const PREP = { relationshipId: 'rel1', memberId: 'm1', livingWorkId: 'w1', manuscriptId: 'ms1' };
const GOOD = { threadId: 'th1', proposalChainId: 'pc1', maiaTurnIndex: 0, gesture: EDITORIAL_OPENING_GESTURE, manuscriptLocusScope: 'passage' as const };

/** A fake tx that answers the custody queries from a described world. */
function tx(world: { subject?: boolean; turns?: Array<{ turn_index: number; speaker: string }>; existing?: boolean }) {
  const calls: Array<{ sql: string; params: unknown[] }> = [];
  return {
    calls,
    query: jest.fn(async (sql: string, params: unknown[] = []) => {
      calls.push({ sql, params });
      if (sql.includes("child_kind = 'EDITORIAL_OPENING'\n        AND editorial_thread_id")) {
        return { rows: world.existing ? [{ id: 'e0', relationship_id: 'rel1', sequence: 1 }] : [] };
      }
      if (sql.includes('FROM ask_threads th')) return { rows: world.subject === false ? [] : [{ id: 'th1' }] };
      if (sql.includes('FROM ask_turns')) return { rows: world.turns ?? [{ turn_index: 0, speaker: 'maia' }] };
      if (sql.includes('next_sequence')) return { rows: [{ next_sequence: 1 }] };
      if (sql.includes('INSERT INTO writer_editorial_relationship_episodes')) return { rows: [{ id: 'e1', sequence: 1 }] };
      throw new Error('unexpected query: ' + sql.slice(0, 80));
    }),
  };
}
const open = (t: ReturnType<typeof tx>, input: object = GOOD) =>
  appendEditorialOpeningEpisodeWithClient(t as never, PREP, input as never);
const refused = async (p: Promise<unknown>) => {
  await expect(p).rejects.toBeInstanceOf(RelationshipCustodyRefused);
  await expect(p).rejects.toMatchObject({ reason: 'editorial_child_invalid' });
};

describe('opening episode custody', () => {
  test('accepted: MAIA turn 0 is the first turn, gesture exact; stored as EDITORIAL_OPENING with a NULL member turn', async () => {
    const t = tx({});
    const out = await open(t);
    expect(out).toMatchObject({ id: 'e1', existing: false });
    const insert = t.calls.find((c) => c.sql.includes('INSERT INTO'))!;
    expect(insert.sql).toContain("'EDITORIAL_OPENING'");
    expect(insert.sql).toMatch(/NULL, \$6, \$7/);               // member turn index is NULL, never a number
    expect(insert.params).toContain('opened_conversation_on_passage');
  });

  test('an opening claiming a member turn index is refused', async () => {
    await refused(open(tx({}), { ...GOOD, memberTurnIndex: 0 }));
  });

  test('refused: wrong gesture, wrong index, an author turn at or before the opening, no MAIA turn, wrong subject', async () => {
    await refused(open(tx({}), { ...GOOD, gesture: 'let_us_look_at_this_passage' }));
    await refused(open(tx({ turns: [{ turn_index: 0, speaker: 'author' }, { turn_index: 1, speaker: 'maia' }] }), { ...GOOD, maiaTurnIndex: 1 }));
    await refused(open(tx({ turns: [{ turn_index: 0, speaker: 'author' }, { turn_index: 0, speaker: 'maia' }] })));
    await refused(open(tx({ turns: [] })));
    await refused(open(tx({ turns: [{ turn_index: 0, speaker: 'author' }] })));
    await refused(open(tx({ subject: false })));
  });

  test('one opening per thread: a replay returns the existing episode and inserts nothing', async () => {
    const t = tx({ existing: true });
    expect(await open(t)).toMatchObject({ existing: true, id: 'e0' });
    expect(t.calls.some((c) => c.sql.includes('INSERT INTO'))).toBe(false);
  });

  test('LAW NOT WEAKENED: an EDITORIAL_TURN episode without a member (author) turn is still refused', async () => {
    const t = tx({ turns: [{ turn_index: 0, speaker: 'maia' }] });
    // no existing editorial episode
    (t.query as jest.Mock).mockImplementation(async (sql: string) => {
      if (sql.includes("child_kind = 'EDITORIAL_TURN'")) return { rows: [] };
      if (sql.includes('FROM ask_threads th')) return { rows: [{ id: 'th1' }] };
      if (sql.includes('FROM ask_turns')) return { rows: [{ turn_index: 0, speaker: 'maia' }] };
      throw new Error('should refuse before insert');
    });
    await expect(appendEditorialEpisodeWithClient(t as never, PREP, {
      threadId: 'th1', proposalChainId: 'pc1', memberTurnIndex: undefined as unknown as number,
      maiaTurnIndex: 0, manuscriptLocusScope: 'passage',
    })).rejects.toMatchObject({ reason: 'editorial_child_invalid' });
    await expect(appendEditorialEpisodeWithClient(t as never, PREP, {
      threadId: 'th1', proposalChainId: 'pc1', memberTurnIndex: 0, maiaTurnIndex: 0, manuscriptLocusScope: 'passage',
    })).rejects.toMatchObject({ reason: 'editorial_child_invalid' });   // index 0 is MAIA, not an author turn
  });
});
