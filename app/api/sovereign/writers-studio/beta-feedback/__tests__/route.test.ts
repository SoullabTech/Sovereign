/** @jest-environment node */
import fs from 'fs';
import path from 'path';

const inserted: unknown[][] = [];
jest.mock('@/lib/db/postgres', () => ({
  query: jest.fn(async (sql: string, params: unknown[]) => {
    if (/INSERT INTO writer_studio_beta_feedback/.test(sql)) inserted.push(params);
    return { rows: [{ '?column?': 1 }] };
  }),
}));
jest.mock('@/lib/auth/getMemberFromRequest', () => ({ getMemberIdFromRequest: jest.fn(async () => '00000000-0000-4000-8000-000000000001') }));
jest.mock('@/lib/writersStudio/betaAccessServer', () => ({ writersStudioStanding: jest.fn(async () => ({ admitted: true })) }));

import { POST } from '../route';

/** The modes the table actually accepts, read from the migration that created it. */
const MIGRATION = fs.readFileSync(path.resolve(__dirname, '../../../../../../database/migrations/20260929000005_writer_studio_beta_feedback.sql'), 'utf8');
const TABLE_MODES = [...(MIGRATION.match(/studio_mode TEXT CHECK \(studio_mode IN \(([^)]*)\)\)/)?.[1] ?? '').matchAll(/'([a-z]+)'/g)].map((m) => m[1]);

const post = (body: Record<string, unknown>) => POST(new Request('http://localhost/api/sovereign/writers-studio/beta-feedback', {
  method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body),
}) as never);

beforeEach(() => { inserted.length = 0; });

describe('beta feedback keeps a note from every Studio room', () => {
  test('the migration’s mode list is read (guards this test against a silent empty parse)', () => {
    expect(TABLE_MODES).toEqual(['home', 'write', 'develop', 'review']);
  });

  for (const room of ['home', 'write', 'develop', 'review', 'publish', 'listen']) {
    test(`a note from ${room} is kept with a studio_mode the table accepts`, async () => {
      const res = await post({ signal: 'lost_thread', studioMode: room, orientationContext: {} });
      expect(res.status).toBe(200);
      expect(inserted).toHaveLength(1);
      const [, , , studioMode, contextJson] = inserted[0] as [string, string | null, string, string | null, string];
      expect(studioMode === null || TABLE_MODES.includes(studioMode)).toBe(true);
      const context = JSON.parse(contextJson) as Record<string, string>;
      if (TABLE_MODES.includes(room)) {
        expect(studioMode).toBe(room);
        expect(context.studioRoom).toBeUndefined();
      } else {
        expect(studioMode).toBeNull();
        expect(context.studioRoom).toBe(room);
      }
    });
  }

  test('a client cannot write studioRoom itself', async () => {
    const res = await post({ signal: 'lost_thread', studioMode: 'write', orientationContext: { studioRoom: 'publish' } });
    expect(res.status).toBe(400);
    expect(inserted).toHaveLength(0);
  });

  test('an unknown room is stored as no room at all', async () => {
    await post({ signal: 'lost_thread', studioMode: 'attic', orientationContext: {} });
    const [, , , studioMode, contextJson] = inserted[0] as [string, string | null, string, string | null, string];
    expect(studioMode).toBeNull();
    expect(JSON.parse(contextJson)).toEqual({});
  });

  test('the membrane names every room, Listen included', () => {
    const client = fs.readFileSync(path.resolve(__dirname, '../../../../../../app/dev/writers-studio-p4r1/P4R1BetaFeedback.tsx'), 'utf8');
    expect(client).toMatch(/studioMode: mode,/);
  });
});
