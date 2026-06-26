/**
 * Release as Consented Authorship — the recording records the ACT, never the OBJECT.
 *
 * No DB required: the db layer is mocked, so we assert exactly what would be written.
 * Plus a structural assertion on the migration itself — the non-reconstructability
 * guarantee is enforced by the table shape, and this test guards against a future
 * edit quietly adding a content-bearing column.
 */

const mockQuery = jest.fn();
jest.mock('@/lib/db/postgres', () => ({ query: (...args: unknown[]) => mockQuery(...args) }));

import { recordRelease } from '@/lib/recognition/releaseService';
import { readFileSync } from 'fs';
import { join } from 'path';

beforeEach(() => {
  jest.clearAllMocks();
  mockQuery.mockResolvedValue({ rows: [] });
});

describe('recordRelease — records the act, never the object', () => {
  test('writes only member_id, artifact_type, note — no content-bearing column', async () => {
    await recordRelease('m1', 'journal_entry', 'a short reflection');
    expect(mockQuery).toHaveBeenCalledTimes(1);
    const [sql, params] = mockQuery.mock.calls[0] as [string, unknown[]];
    expect(sql).toMatch(/INSERT INTO released_artifacts/);
    expect(sql).toMatch(/\(member_id, artifact_type, note\)/);
    expect(sql).not.toMatch(/\b(content|body|title|entry_text|artifact_id)\b/i);
    expect(params).toEqual(['m1', 'journal_entry', 'a short reflection']);
  });

  test('caps the note at 500 chars (a reflection, not a copy of the content)', async () => {
    await recordRelease('m1', 'journal_entry', 'x'.repeat(2000));
    const params = mockQuery.mock.calls[0][1] as unknown[];
    expect((params[2] as string).length).toBe(500);
  });

  test('empty / whitespace / null note → null (nothing is stored)', async () => {
    await recordRelease('m1', 'journal_entry', '   ');
    expect((mockQuery.mock.calls[0][1] as unknown[])[2]).toBeNull();
    await recordRelease('m1', 'journal_entry', null);
    expect((mockQuery.mock.calls[1][1] as unknown[])[2]).toBeNull();
  });
});

describe('schema — non-reconstructability is structural, not behavioral', () => {
  test('released_artifacts table defines no content-bearing column', () => {
    const sql = readFileSync(
      join(process.cwd(), 'database/migrations/20260626000002_released_artifacts.sql'),
      'utf8',
    );
    // Isolate the CREATE TABLE column block and strip inline `-- ...` comments
    // (the comments legitimately mention "content" while explaining its absence).
    const block = sql.match(/CREATE TABLE[^(]*\(([\s\S]*?)\);/i)?.[1] ?? '';
    const columns = block
      .split('\n')
      .map((line) => line.replace(/--.*$/, ''))
      .join('\n');

    expect(columns).toMatch(/member_id/);
    expect(columns).toMatch(/artifact_type/);
    expect(columns).toMatch(/note/);
    expect(columns).not.toMatch(/\b(content|body|title|entry_text|artifact_id)\b/i);
    // the note is capped so it stays a reflection, not a copy
    expect(columns).toMatch(/char_length\(note\)\s*<=\s*500/);
  });
});
