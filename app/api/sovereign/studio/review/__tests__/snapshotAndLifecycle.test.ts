/**
 * DE-01A — the two claims DE-01 made and did not keep.
 *
 * 1. THE SNAPSHOT IS FROZEN. The reading is opened on one text and every pass
 *    reads that text. If /advance re-read the live draft, a writer who kept
 *    working mid-review would get findings stitched from several draft states,
 *    with offsets planned against text that no longer existed.
 *
 * 2. A PASS IS NOT DONE UNTIL IT IS READ. Claiming and reading are separate
 *    events. A process that dies between them must not leave coverage
 *    asserting MAIA read something she never saw — and the pass it abandoned
 *    must become reclaimable rather than stranding the review.
 */

jest.mock('@/lib/auth/getMemberFromRequest', () => ({ getMemberIdFromRequest: jest.fn() }));
jest.mock('@/lib/db/postgres', () => ({ query: jest.fn() }));
jest.mock('@/lib/ai/claudeClient', () => ({ generateWithClaude: jest.fn() }));

import { NextRequest } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { query } from '@/lib/db/postgres';
import { generateWithClaude } from '@/lib/ai/claudeClient';
import { POST as ADVANCE } from '../[id]/advance/route';
import { POST as OPEN } from '../route';

const mockAuth = getMemberIdFromRequest as jest.Mock;
const mockQuery = query as jest.Mock;
const mockClaude = generateWithClaude as jest.Mock;

const MEMBER = '11111111-1111-1111-1111-111111111111';
const MANUSCRIPT = '22222222-2222-2222-2222-222222222222';
const REVIEW = '44444444-4444-4444-4444-444444444444';
const PASS = '55555555-5555-5555-5555-555555555555';

const FROZEN =
  'Air is the unseen matrix in which all movement, communication and thought arise. ' +
  'We do not always notice the air, and yet without it nothing moves at all. '.repeat(30);
const LIVE_DRAFT = 'COMPLETELY DIFFERENT TEXT THE WRITER TYPED WHILE MAIA WAS READING. '.repeat(40);

const norm = (sql: string) => sql.replace(/\s+/g, ' ').trim();

interface Recorded {
  sql: string;
  params: unknown[];
}

/** Answers the advance route's reads; records every statement it issued. */
function advanceDb(opts: { claim?: boolean; openPasses?: number } = {}) {
  const statements: Recorded[] = [];
  mockQuery.mockImplementation(async (sql: string, params: unknown[] = []) => {
    const s = norm(sql);
    statements.push({ sql: s, params });

    if (s.includes('FROM developmental_reviews')) {
      return {
        rows: [
          {
            id: REVIEW,
            manuscript_id: MANUSCRIPT,
            living_work_id: null,
            declared_form: null,
            status: 'reading',
            overview: null,
            snapshot_content: FROZEN,
          },
        ],
      };
    }
    // The live draft. If the route asks for this to READ from, that is the bug.
    if (s.includes('FROM manuscript_working_drafts')) {
      return { rows: [{ content: LIVE_DRAFT, revision_count: 9 }] };
    }
    if (s.startsWith('UPDATE developmental_review_passes SET status = \'running\'')) {
      return opts.claim === false
        ? { rows: [] }
        : {
            rows: [
              {
                id: PASS,
                lens: 'threads',
                segment_index: 0,
                segment_label: 'Opening',
                start_offset: 0,
                end_offset: FROZEN.length,
              },
            ],
          };
    }
    if (s.includes("status NOT IN ('done', 'failed')")) {
      return { rows: [{ open: String(opts.openPasses ?? 0) }] };
    }
    if (s.includes('AS remaining')) return { rows: [{ remaining: '12' }] };
    if (s.includes('FROM manuscript_sections')) return { rows: [] };
    if (s.startsWith('INSERT INTO developmental_findings')) return { rows: [{ id: 'f1' }] };
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
  mockClaude.mockResolvedValue({
    text: JSON.stringify({
      findings: [
        {
          title: 'Air is introduced as matrix',
          observation: 'The element arrives as the medium of everything else.',
          quotes: [
            'Air is the unseen matrix in which all movement, communication and thought arise.',
          ],
        },
      ],
    }),
    provider: {},
  });
});

describe('the snapshot is frozen', () => {
  it('reads the stored snapshot, never the live draft', async () => {
    const statements = advanceDb();
    await advance();
    // The text handed to MAIA is the frozen one.
    const sent = mockClaude.mock.calls[0][0].userInput as string;
    expect(sent).toContain('Air is the unseen matrix');
    expect(sent).not.toContain('COMPLETELY DIFFERENT TEXT');
    // And the route never had to consult the working draft to get it.
    expect(statements.some((s) => s.sql.includes('FROM manuscript_working_drafts'))).toBe(false);
  });

  it('anchors evidence to offsets inside the snapshot', async () => {
    const statements = advanceDb();
    await advance();
    const ev = statements.find((s) => s.sql.startsWith('INSERT INTO developmental_finding_evidence'));
    const [, start, end, quote] = ev!.params as [string, number, number, string];
    expect(FROZEN.slice(start, end)).toBe(quote);
    expect(quote).toContain('unseen matrix');
  });

  it('stores the snapshot text when the review is opened', async () => {
    const statements: Recorded[] = [];
    mockQuery.mockImplementation(async (sql: string, params: unknown[] = []) => {
      const s = norm(sql);
      statements.push({ sql: s, params });
      if (s.includes('FROM member_manuscripts')) return { rows: [{ id: MANUSCRIPT }] };
      if (s.includes('FROM manuscript_working_drafts')) {
        return { rows: [{ content: FROZEN, revision_count: 3 }] };
      }
      if (s.includes('FROM manuscript_sections')) return { rows: [] };
      if (s.startsWith('INSERT INTO developmental_reviews')) return { rows: [{ id: REVIEW }] };
      return { rows: [] };
    });
    await OPEN(
      new NextRequest('http://localhost/api/sovereign/studio/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ manuscriptId: MANUSCRIPT }),
      }),
    );
    const insert = statements.find((s) => s.sql.startsWith('INSERT INTO developmental_reviews'));
    expect(insert!.sql).toContain('snapshot_content');
    expect(insert!.params).toContain(FROZEN);
  });
});

describe('a pass is not done until it is read', () => {
  it('claims the pass as running, not done', async () => {
    const statements = advanceDb();
    await advance();
    const claim = statements.find((s) => s.sql.includes('SET status = \'running\''));
    expect(claim).toBeDefined();
    expect(claim!.sql).toContain('started_at = now()');
    // No statement anywhere marks a pass done before the model was called.
    const claimIndex = statements.indexOf(claim!);
    const early = statements
      .slice(0, claimIndex + 1)
      .filter((s) => s.sql.includes("SET status = 'done'"));
    expect(early).toHaveLength(0);
  });

  it('marks the pass done only after the findings are written', async () => {
    const statements = advanceDb();
    await advance();
    const insert = statements.findIndex((s) =>
      s.sql.startsWith('INSERT INTO developmental_finding_evidence'),
    );
    const done = statements.findIndex((s) => s.sql.includes("SET status = 'done'"));
    expect(insert).toBeGreaterThan(-1);
    expect(done).toBeGreaterThan(insert);
  });

  it('marks the pass failed — not done — when the reading throws', async () => {
    const statements = advanceDb();
    mockClaude.mockRejectedValue(new Error('provider down'));
    await advance();
    expect(statements.some((s) => s.sql.includes("SET status = 'failed'"))).toBe(true);
    expect(statements.some((s) => s.sql.includes("SET status = 'done'"))).toBe(false);
  });

  it('reclaims a pass a dead process left running', async () => {
    const statements = advanceDb();
    await advance();
    const claim = statements.find((s) => s.sql.includes("SET status = 'running'"))!;
    expect(claim.sql).toContain("status = 'running'");
    expect(claim.sql).toContain('started_at <');
    expect(claim.params).toContain('10');
  });

  it('does not complete a review while another window still holds passes', async () => {
    advanceDb({ claim: false, openPasses: 3 });
    const res = await advance();
    const body = await res.json();
    expect(body.done).toBe(false);
    expect(body.waiting).toBe(true);
    expect(mockClaude).not.toHaveBeenCalled();
  });
});
