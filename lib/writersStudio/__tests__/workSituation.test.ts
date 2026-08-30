import {
  formatWorkSituationForPrompt,
  resolveSituatedWork,
  summarizeWorkSituationForLog,
  type SituatedWork,
} from '../workSituation';

const rows: { rows: unknown[] } = { rows: [] };
const calls: { sql: string; params: unknown[] }[] = [];
jest.mock('@/lib/db/postgres', () => ({
  query: jest.fn(async (sql: string, params: unknown[]) => {
    calls.push({ sql, params });
    return rows;
  }),
}));

const WORK: SituatedWork = {
  id: 'w-alchemy',
  title: 'Elemental Alchemy',
  purpose: 'The Art of Living a Phenomenal Life',
  form: 'Book',
  stage: 'refining',
};

beforeEach(() => {
  rows.rows = [];
  calls.length = 0;
});

/**
 * WS2-03C — the middle term of the Studio → MAIA → Studio contract.
 *
 * The dangerous part of situating a conversation is not the prompt text. It is
 * deciding whose Work the exchange is allowed to be about, from a value that
 * arrived in a member-editable URL.
 */

describe('a Work is resolved, never taken on the client’s word', () => {
  it('scopes the read to the member in the WHERE clause, not afterwards', async () => {
    rows.rows = [WORK];
    await resolveSituatedWork('member-1', 'w-alchemy');
    expect(calls).toHaveLength(1);
    expect(calls[0].sql).toMatch(/WHERE id = \$1 AND member_id = \$2/);
    expect(calls[0].params).toEqual(['w-alchemy', 'member-1']);
    // No code path reads a row before establishing whose it is.
  });

  it('returns null for a Work the member does not own', async () => {
    rows.rows = []; // the member-scoped query simply matches nothing
    expect(await resolveSituatedWork('member-1', 'someone-elses-work')).toBeNull();
  });

  it('refuses without a member, and never touches the database', async () => {
    expect(await resolveSituatedWork(null, 'w-alchemy')).toBeNull();
    expect(await resolveSituatedWork(undefined, 'w-alchemy')).toBeNull();
    expect(calls).toHaveLength(0);
  });

  it('refuses a non-string or empty id rather than querying on it', async () => {
    for (const bad of [undefined, null, 42, {}, [], '', '   ']) {
      expect(await resolveSituatedWork('member-1', bad)).toBeNull();
    }
    expect(calls).toHaveLength(0);
  });

  it('fails closed when the read itself fails', async () => {
    const { query } = jest.requireMock('@/lib/db/postgres');
    (query as jest.Mock).mockRejectedValueOnce(new Error('db down'));
    // A read failure is not a licence to situate on the client's say-so.
    expect(await resolveSituatedWork('member-1', 'w-alchemy')).toBeNull();
  });
});

describe('only the member’s own words reach the prompt', () => {
  const text = formatWorkSituationForPrompt(WORK)!;

  it('says nothing at all when nothing was resolved', () => {
    expect(formatWorkSituationForPrompt(null)).toBeUndefined();
  });

  it('carries the member’s title, purpose, form and stage', () => {
    for (const own of ['Elemental Alchemy', 'The Art of Living', 'Book', 'refining']) {
      expect(text).toContain(own);
    }
  });

  it('states plainly that MAIA neither authored nor holds the work', () => {
    expect(text).toMatch(/do not hold this Work/i);
    expect(text).toMatch(/not its author/i);
    expect(text).toMatch(/have not been given its text/i);
  });

  it('publishes no measurement of the member', () => {
    // A situated conversation is context, never a report. Counts, progress and
    // activity are all absent by construction — see the module header.
    /* Measurement terms only. Note what is NOT banned: "words" — the addendum
       says the member's material is in "their own words", which is the exact
       opposite of a word count. Banning the token rather than the claim would
       have forced the honest sentence out to satisfy the test. */
    for (const banned of [
      'progress', 'complete', 'word count', 'sessions', 'streak',
      'score', 'level', 'behind', 'ahead', 'should',
    ]) {
      expect(text.toLowerCase()).not.toContain(banned);
    }
  });

  it('does not instruct MAIA what to do with the Work', () => {
    // A situated conversation is still the member's to steer.
    expect(text).toMatch(/do not assume the conversation is/i);
  });

  it('renders an unnamed Work honestly rather than inventing a title', () => {
    const t = formatWorkSituationForPrompt({ ...WORK, title: null, purpose: null })!;
    expect(t).toContain('they have not named it yet');
    expect(t).not.toContain('Untitled');
  });
});

describe('the log line carries ids, never prose', () => {
  it('reports what was asked and what was granted', () => {
    expect(summarizeWorkSituationForLog('w-alchemy', WORK)).toEqual({
      requested: true, situated: true, workIdPrefix: 'w-alchem',
    });
    expect(summarizeWorkSituationForLog('w-alchemy', null)).toEqual({
      requested: true, situated: false,
    });
    expect(summarizeWorkSituationForLog(undefined, null)).toEqual({
      requested: false, situated: false,
    });
  });

  it('never logs the member’s own sentence', () => {
    const line = JSON.stringify(summarizeWorkSituationForLog('w-alchemy', WORK));
    expect(line).not.toContain(WORK.purpose!);
    expect(line).not.toContain(WORK.title!);
  });
});
