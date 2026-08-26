/**
 * READER-01 — the position boundary, enforced by what MAIA is handed.
 *
 * Law 2 says what page 180 establishes cannot excuse an ambiguity on page 40.
 * The way to keep that true is not to ask the model to remember it: it is to
 * never show her page 180 while she is standing at page 40. This suite pins
 * that the route actually does so, and that declared material reaches her
 * marked as something the reader does not have.
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
const PASS = '66666666-6666-6666-6666-666666666666';
const WORK = '77777777-7777-7777-7777-777777777777';

const EARLY = 'Maya arrives at the river without knowing why she has come here.';
const MIDDLE = 'and the days went on much as before. '.repeat(20);
const LATE = 'Aether is the field in which the other four elements are held together.';
const SNAPSHOT = `${EARLY}\n\n${MIDDLE}\n\n${LATE}`;
const CHECKPOINT = SNAPSHOT.indexOf(LATE);

const norm = (sql: string) => sql.replace(/\s+/g, ' ').trim();

function db(opts: { workId?: string | null } = {}) {
  const statements: { sql: string; params: unknown[] }[] = [];
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
            supersedes_review_id: null,
            mode: 'reader',
          },
        ],
      };
    }
    if (s.includes("SET status = 'running'")) {
      return {
        rows: [
          {
            id: PASS,
            lens: 'referents',
            segment_index: 0,
            segment_label: 'through Chapter One',
            start_offset: 0,
            end_offset: CHECKPOINT,
            segment_hash: null,
          },
        ],
      };
    }
    if (s.includes('FROM living_work_materials')) {
      return {
        rows: [
          {
            material_type: 'studio_material',
            relationship_sentence: 'where the river came from',
            label: 'Larry interview',
            kind: 'transcript',
            extracted_text: 'the river is the place her grandmother took her',
          },
        ],
      };
    }
    if (s.includes('FROM living_works')) return { rows: [{ title: 'A Work', purpose: null }] };
    if (s.includes('FROM manuscript_sections')) return { rows: [] };
    if (s.includes('AS remaining')) return { rows: [{ remaining: '9' }] };
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
          title: 'The river is named before it is grounded',
          observation: 'The Work names the river before saying what it is to her.',
          quotes: [EARLY],
        },
      ],
    }),
    provider: {},
  });
});

describe('what MAIA is shown stops at the checkpoint', () => {
  it('hands her the Work up to here and nothing after it', async () => {
    db();
    await advance();
    const shown = mockClaude.mock.calls[0][0].userInput as string;
    expect(shown).toContain(EARLY);
    expect(shown).not.toContain(LATE);
  });

  it('tells her where the reader stands', async () => {
    db();
    await advance();
    const prompt = mockClaude.mock.calls[0][0].systemPrompt as string;
    expect(prompt).toContain('through Chapter One');
  });

  it('records the checkpoint on the finding', async () => {
    const statements = db();
    await advance();
    const insert = statements.find((s) => s.sql.startsWith('INSERT INTO developmental_findings'))!;
    expect(insert.sql).toContain('checkpoint_label');
    expect(insert.params).toContain('through Chapter One');
  });
});

describe('a later passage cannot evidence an earlier absence', () => {
  it('drops a finding quoting text after the checkpoint', async () => {
    mockClaude.mockResolvedValue({
      text: JSON.stringify({
        findings: [
          {
            title: 'Aether is established',
            observation: 'The Work has supplied what Aether means.',
            quotes: [LATE],
          },
        ],
      }),
      provider: {},
    });
    const statements = db();
    const res = await advance();
    expect(statements.some((s) => s.sql.startsWith('INSERT INTO developmental_findings'))).toBe(
      false,
    );
    expect((await res.json()).dropped).toBe(1);
  });

  it('drops a finding that asserts how a reader feels', async () => {
    mockClaude.mockResolvedValue({
      text: JSON.stringify({
        findings: [
          {
            title: 'The opening is disorienting',
            observation: 'The reader feels lost in this opening.',
            quotes: [EARLY],
          },
        ],
      }),
      provider: {},
    });
    const statements = db();
    await advance();
    expect(statements.some((s) => s.sql.startsWith('INSERT INTO developmental_findings'))).toBe(
      false,
    );
  });
});

describe('material is context for the writer, never reader knowledge', () => {
  it('is labelled as something the reader does not have', async () => {
    db();
    await advance();
    const prompt = mockClaude.mock.calls[0][0].systemPrompt as string;
    expect(prompt).toContain('THE READER DOES NOT HAVE THIS');
    expect(prompt).toContain('never quote it as evidence');
  });

  it('is present so MAIA can say the draft has not supplied what the material holds', async () => {
    db();
    await advance();
    const prompt = mockClaude.mock.calls[0][0].systemPrompt as string;
    expect(prompt).toContain('the river is the place her grandmother took her');
    expect(prompt).toContain('the DRAFT has not yet made available');
  });

  it('records that flag when MAIA sets it', async () => {
    mockClaude.mockResolvedValue({
      text: JSON.stringify({
        findings: [
          {
            title: 'The river’s meaning is only in your material',
            observation: 'The draft names the river; what it is to her is not on the page.',
            onlyInMaterial: true,
            quotes: [EARLY],
          },
        ],
      }),
      provider: {},
    });
    const statements = db();
    await advance();
    const insert = statements.find((s) => s.sql.startsWith('INSERT INTO developmental_findings'))!;
    expect(insert.sql).toContain('only_in_material');
    expect(insert.params).toContain(true);
  });

  it('reads no material at all when no Work is declared', async () => {
    const statements = db({ workId: null });
    await advance();
    expect(statements.some((s) => s.sql.includes('FROM living_work_materials'))).toBe(false);
  });
});

describe('a reader pass is still a pass', () => {
  it('is marked done only after its findings are written', async () => {
    const statements = db();
    await advance();
    const insert = statements.findIndex((s) =>
      s.sql.startsWith('INSERT INTO developmental_finding_evidence'),
    );
    const done = statements.findIndex((s) => s.sql.includes("SET status = 'done'"));
    expect(insert).toBeGreaterThan(-1);
    expect(done).toBeGreaterThan(insert);
  });

  it('lands on failed, not done, when the reading throws', async () => {
    mockClaude.mockRejectedValue(new Error('provider down'));
    const statements = db();
    await advance();
    expect(statements.some((s) => s.sql.includes("SET status = 'failed'"))).toBe(true);
    expect(statements.some((s) => s.sql.includes("SET status = 'done'"))).toBe(false);
  });

  it('never writes a disposition', async () => {
    const statements = db();
    await advance();
    expect(statements.some((s) => s.sql.includes('disposition'))).toBe(false);
  });
});
