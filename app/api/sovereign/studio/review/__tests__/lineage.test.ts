/**
 * DE-02 — the boundary that must not move.
 *
 * A later reading may record that it stopped seeing a finding. It may NOT
 * record that the finding was resolved. Those are different facts owned by
 * different parties: MAIA observes, the writer resolves. This suite pins the
 * statement itself, because the failure mode is silent — a system that quietly
 * closes a writer's open questions looks like a system that is working.
 *
 * It also pins where MAIA's permission to read a material comes from: the
 * declaration join, and nothing else.
 */

jest.mock('@/lib/auth/getMemberFromRequest', () => ({ getMemberIdFromRequest: jest.fn() }));
jest.mock('@/lib/db/postgres', () => ({ query: jest.fn() }));
jest.mock('@/lib/ai/claudeClient', () => ({ generateWithClaude: jest.fn() }));

import { NextRequest } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { query } from '@/lib/db/postgres';
import { generateWithClaude } from '@/lib/ai/claudeClient';
import { POST as ADVANCE } from '../[id]/advance/route';

const mockAuth = getMemberIdFromRequest as jest.Mock;
const mockQuery = query as jest.Mock;
const mockClaude = generateWithClaude as jest.Mock;

const MEMBER = '11111111-1111-1111-1111-111111111111';
const REVIEW = '44444444-4444-4444-4444-444444444444';
const PRIOR_REVIEW = '55555555-5555-5555-5555-555555555555';
const PASS = '66666666-6666-6666-6666-666666666666';
const WORK = '77777777-7777-7777-7777-777777777777';

const AIR = 'Air is the unseen matrix in which all movement and thought arise.';
const RIVER = 'The river returns in the seventh chapter without being named again.';
const SNAPSHOT = `${AIR}\n\n${RIVER}\n\n${'and more prose. '.repeat(40)}`;

const norm = (sql: string) => sql.replace(/\s+/g, ' ').trim();

interface Recorded {
  sql: string;
  params: unknown[];
}

function db(opts: { reusable?: boolean; priorFindings?: unknown[]; workId?: string | null } = {}) {
  const statements: Recorded[] = [];
  mockQuery.mockImplementation(async (sql: string, params: unknown[] = []) => {
    const s = norm(sql);
    statements.push({ sql: s, params });

    if (s.includes('FROM developmental_reviews') && s.includes('snapshot_content')) {
      return {
        rows: [
          {
            id: REVIEW,
            manuscript_id: 'ms',
            living_work_id: opts.workId === undefined ? WORK : opts.workId,
            declared_form: null,
            status: 'reading',
            overview: null,
            snapshot_content: SNAPSHOT,
            supersedes_review_id: PRIOR_REVIEW,
          },
        ],
      };
    }
    if (s.includes("SET status = 'running'")) {
      return {
        rows: [
          {
            id: PASS,
            lens: 'threads',
            segment_index: 0,
            segment_label: 'Opening',
            start_offset: 0,
            end_offset: SNAPSHOT.length,
            segment_hash: 'hash-of-opening',
            // The prior pass over this part is always named — that link is
            // what lineage is computed against. Whether it is CARRIED depends
            // on whether its hash matches, below.
            supersedes_pass_id: 'prior-pass-1',
          },
        ],
      };
    }
    if (s.startsWith('SELECT segment_hash FROM developmental_review_passes')) {
      // Same hash = the text did not move = carry. Different = re-read, with
      // the prior pass still named for lineage.
      return { rows: [{ segment_hash: opts.reusable === true ? 'hash-of-opening' : 'older-hash' }] };
    }
    if (s.includes('array_remove')) {
      return {
        rows: opts.priorFindings ?? [
          {
            id: 'prior-1',
            lens: 'threads',
            title: 'Air recurs',
            observation: 'It opens twice.',
            quotes: [AIR],
          },
          {
            id: 'prior-2',
            lens: 'threads',
            title: 'The river is dropped',
            observation: 'It returns unnamed.',
            quotes: [RIVER],
          },
        ],
      };
    }
    if (s.includes('FROM living_work_materials')) {
      return {
        rows: [
          {
            material_type: 'studio_material',
            relationship_sentence: 'the lived example',
            label: 'Larry interview',
            kind: 'transcript',
            extracted_text: 'we were talking about breath and belonging',
          },
        ],
      };
    }
    if (s.includes('FROM living_works')) return { rows: [{ title: 'A Work', purpose: null }] };
    if (s.includes('FROM manuscript_sections')) return { rows: [] };
    if (s.includes("status NOT IN ('done', 'failed')")) return { rows: [{ open: '0' }] };
    if (s.includes('AS remaining')) return { rows: [{ remaining: '4' }] };
    if (s.startsWith('INSERT INTO developmental_findings')) return { rows: [{ id: 'new-1' }] };
    return { rows: [] };
  });
  return statements;
}

const advance = () =>
  ADVANCE(
    new NextRequest(`http://localhost/api/sovereign/studio/review/${REVIEW}/advance`, {
      method: 'POST',
    }),
    { params: Promise.resolve({ id: REVIEW }) },
  );

beforeEach(() => {
  jest.clearAllMocks();
  mockAuth.mockResolvedValue(MEMBER);
  // This reading sees "Air recurs" again, and does not see the river finding.
  mockClaude.mockResolvedValue({
    text: JSON.stringify({
      findings: [
        {
          title: 'Air recurs',
          observation: 'It opens twice.',
          quotes: [AIR],
        },
      ],
    }),
    provider: {},
  });
});

describe('no longer observed is never resolution', () => {
  it('records that the previous finding was not seen again', async () => {
    const statements = db();
    await advance();
    const marked = statements.find((s) => s.sql.includes('no_longer_observed_at = now()'));
    expect(marked).toBeDefined();
    expect((marked!.params[0] as string[])).toEqual(['prior-2']);
  });

  it('NEVER writes a disposition while doing so', async () => {
    const statements = db();
    await advance();
    const marked = statements.find((s) => s.sql.includes('no_longer_observed_at = now()'))!;
    expect(marked.sql).not.toContain('disposition');
    // And nothing else in the whole pass touches disposition either.
    expect(statements.some((s) => s.sql.includes('SET disposition'))).toBe(false);
    expect(statements.some((s) => s.sql.includes("disposition = 'resolved'"))).toBe(false);
  });

  it('does not re-mark a finding an earlier reading already stopped seeing', async () => {
    const statements = db();
    await advance();
    const marked = statements.find((s) => s.sql.includes('no_longer_observed_at = now()'))!;
    expect(marked.sql).toContain('no_longer_observed_at IS NULL');
  });

  it('marks nothing when every prior finding was seen again', async () => {
    const statements = db({
      priorFindings: [
        { id: 'prior-1', lens: 'threads', title: 'Air recurs', observation: 'It opens twice.', quotes: [AIR] },
      ],
    });
    await advance();
    expect(statements.some((s) => s.sql.includes('no_longer_observed_at = now()'))).toBe(false);
  });
});

describe('lineage travels with the finding', () => {
  it('records a restated finding as persisting, naming its ancestor', async () => {
    const statements = db();
    await advance();
    const insert = statements.find((s) => s.sql.startsWith('INSERT INTO developmental_findings'))!;
    expect(insert.sql).toContain('lineage');
    expect(insert.params).toContain('persists');
    expect(insert.params).toContain('prior-1');
  });

  it('records an observation that moved as changed', async () => {
    mockClaude.mockResolvedValue({
      text: JSON.stringify({
        findings: [{ title: 'Air recurs', observation: 'It now opens three times.', quotes: [AIR] }],
      }),
      provider: {},
    });
    const statements = db();
    await advance();
    const insert = statements.find((s) => s.sql.startsWith('INSERT INTO developmental_findings'))!;
    expect(insert.params).toContain('changed');
  });

  it('records something with no ancestor as newly observed', async () => {
    const statements = db({ priorFindings: [] });
    await advance();
    const insert = statements.find((s) => s.sql.startsWith('INSERT INTO developmental_findings'))!;
    expect(insert.params).toContain('newly_observed');
  });
});

describe('a reusable pass carries rather than re-reads', () => {
  it('does not call the model at all', async () => {
    db({ reusable: true });
    await advance();
    expect(mockClaude).not.toHaveBeenCalled();
  });

  it('still re-locates evidence against THIS reading’s snapshot', async () => {
    const statements = db({ reusable: true });
    await advance();
    const ev = statements.find((s) =>
      s.sql.startsWith('INSERT INTO developmental_finding_evidence'),
    )!;
    const [, start, end, quote] = ev.params as [string, number, number, string];
    expect(SNAPSHOT.slice(start, end)).toBe(quote);
  });

  it('marks what it carried as carried', async () => {
    const statements = db({ reusable: true });
    await advance();
    const insert = statements.find((s) => s.sql.startsWith('INSERT INTO developmental_findings'))!;
    expect(insert.sql).toContain('carried');
    expect(insert.params).toContain(true);
  });
});

describe('material MAIA is allowed to read', () => {
  it('takes its permission from the declaration join, not from gathering', async () => {
    const statements = db();
    await advance();
    const read = statements.find((s) => s.sql.includes('FROM living_work_materials'))!;
    // Every row is a member declaration; a gathered-but-undeclared material
    // cannot appear in this result at all.
    expect(read.sql).toContain('living_work_id = $1');
    expect(read.params).toEqual([WORK]);
  });

  it('reads no material at all for a manuscript with no declared Work', async () => {
    const statements = db({ workId: null });
    await advance();
    expect(statements.some((s) => s.sql.includes('FROM living_work_materials'))).toBe(false);
  });

  it('hands the excerpt to MAIA marked as material, not as the manuscript', async () => {
    db();
    await advance();
    const prompt = mockClaude.mock.calls[0][0].systemPrompt as string;
    expect(prompt).toContain('NOT the manuscript');
    expect(prompt).toContain('we were talking about breath and belonging');
    expect(prompt).toContain('the lived example');
  });
});
