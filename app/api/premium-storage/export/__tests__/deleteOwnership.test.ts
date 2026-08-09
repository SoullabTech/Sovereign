/**
 * `DELETE /api/premium-storage/export` may not delete an archive the caller
 * does not own.
 *
 * Incident (found 2026-08-09): the handler took NO identity at all. It resolved
 * an archive by `exportId`, unlinked `exportRecord.filePath`, and deleted the
 * row. Any caller who knew or guessed an id could destroy another member's
 * export — file and record. `/api/premium-storage/**` is unmapped in the access
 * matrix and `ACCESS_CONTROL_MODE` is unset in production, so the namespace was
 * confirmed anonymously reachable.
 * Reference: docs/security/API_AUTHENTICATION_BOUNDARY_AUDIT_2026-08-09.md
 *
 * WHAT THIS PROVES: an unauthenticated caller deletes nothing; a non-owner
 * deletes nothing and is not told the id exists; the owner still succeeds.
 * WHAT IT DOES NOT PROVE: that the other handlers in this namespace are safe.
 * They take identity from the request body/query and are repaired separately.
 */
import { describe, it, expect, jest, beforeEach } from '@jest/globals';

const mockCallerId = jest.fn<(r: unknown) => Promise<string | null>>();
jest.mock('@/lib/auth/getMemberFromRequest', () => ({
  __esModule: true,
  getMemberIdFromRequest: (r: unknown) => mockCallerId(r),
}));

const mockFindUnique = jest.fn<(a: unknown) => Promise<unknown>>();
const mockDelete = jest.fn<(a: unknown) => Promise<unknown>>();
jest.mock('@prisma/client', () => ({
  __esModule: true,
  PrismaClient: class {
    exportArchive = { findUnique: mockFindUnique, delete: mockDelete };
  },
}));

const mockUnlink = jest.fn<(p: string) => Promise<void>>();
jest.mock('fs/promises', () => ({ __esModule: true, unlink: (p: string) => mockUnlink(p) }));

jest.mock('@/lib/services/premium-storage', () => ({
  __esModule: true,
  PremiumStorageService: class {},
}));

const OWNER = '11111111-1111-4111-8111-111111111111';
const STRANGER = '22222222-2222-4222-8222-222222222222';

const ARCHIVE = {
  id: 'exp_1',
  userId: OWNER,
  filePath: '/data/exports/exp_1.enc',
  fileName: 'exp_1.enc',
  exportType: 'full',
};

function req(exportId = 'exp_1'): any {
  return { url: `https://soullab.life/api/premium-storage/export?exportId=${exportId}`, headers: new Headers() };
}

let DELETE: (r: any) => Promise<any>;

beforeEach(async () => {
  jest.clearAllMocks();
  mockFindUnique.mockResolvedValue(ARCHIVE);
  mockDelete.mockResolvedValue(ARCHIVE);
  mockUnlink.mockResolvedValue(undefined);
  ({ DELETE } = await import('../route'));
});

describe('an unauthenticated caller deletes nothing', () => {
  it('returns 401 and never touches the database or filesystem', async () => {
    mockCallerId.mockResolvedValue(null);

    const res = await DELETE(req());

    expect(res.status).toBe(401);
    expect(mockFindUnique).not.toHaveBeenCalled();
    expect(mockUnlink).not.toHaveBeenCalled();
    expect(mockDelete).not.toHaveBeenCalled();
  });
});

describe('a non-owner deletes nothing', () => {
  beforeEach(() => mockCallerId.mockResolvedValue(STRANGER));

  it('does not unlink the file and does not delete the row', async () => {
    const res = await DELETE(req());

    expect(res.status).toBe(404);
    expect(mockUnlink).not.toHaveBeenCalled();
    expect(mockDelete).not.toHaveBeenCalled();
  });

  it('does not confirm that the archive exists', async () => {
    const res = await DELETE(req());
    const body = await res.json();

    // Same shape as a genuine miss — no ownership language, no filename, no id.
    expect(body).toEqual({ error: 'Export archive not found' });
    expect(JSON.stringify(body)).not.toContain(OWNER);
    expect(JSON.stringify(body)).not.toContain(ARCHIVE.fileName);
  });

  it('is indistinguishable from a nonexistent archive', async () => {
    const refused = await (await DELETE(req())).json();

    mockFindUnique.mockResolvedValue(null);
    const missing = await (await DELETE(req('exp_does_not_exist'))).json();

    expect(refused).toEqual(missing);
  });
});

describe('the owner is unaffected', () => {
  it('still deletes the file and the row', async () => {
    mockCallerId.mockResolvedValue(OWNER);

    const res = await DELETE(req());
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(mockUnlink).toHaveBeenCalledWith(ARCHIVE.filePath);
    expect(mockDelete).toHaveBeenCalledWith({ where: { id: 'exp_1' } });
    expect(body.success).toBe(true);
  });

  it('a missing exportId is still a 400, before any auth work', async () => {
    mockCallerId.mockResolvedValue(OWNER);

    const res = await DELETE({ url: 'https://soullab.life/api/premium-storage/export', headers: new Headers() });

    expect(res.status).toBe(400);
    expect(mockFindUnique).not.toHaveBeenCalled();
  });
});

describe('ordering: authorization precedes every destructive act', () => {
  it('ownership is checked before unlink and before delete', () => {
    const src = require('fs').readFileSync(require('path').join(__dirname, '../route.ts'), 'utf8');
    const del = src.slice(src.indexOf('export async function DELETE'));
    const check = del.indexOf('exportRecord.userId !== callerId');
    expect(check).toBeGreaterThan(-1);
    expect(check).toBeLessThan(del.indexOf('fs.unlink'));
    expect(check).toBeLessThan(del.indexOf('.delete('));
  });
});
