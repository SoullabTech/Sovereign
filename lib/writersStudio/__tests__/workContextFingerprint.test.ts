import { workContextFingerprint } from '../workContextFingerprint';
import { query } from '@/lib/db/postgres';

jest.mock('@/lib/db/postgres', () => ({ query: jest.fn() }));

const mockedQuery = query as jest.MockedFunction<typeof query>;

describe('workContextFingerprint polymorphic material identity', () => {
  beforeEach(() => mockedQuery.mockReset());

  it('compares UUID-backed material tables through text because living_work_materials.material_id is polymorphic TEXT', async () => {
    mockedQuery
      .mockResolvedValueOnce({
        rows: [{
          title: 'A Work', purpose: null, form: null, stage: null, manuscript_state: null,
        }],
      } as never)
      .mockResolvedValueOnce({ rows: [] } as never);

    const fingerprint = await workContextFingerprint('work-1', 'member-1');
    expect(typeof fingerprint).toBe('string');

    const materialSql = String(mockedQuery.mock.calls[1]?.[0] ?? '');
    expect(materialSql).toContain('u.id::text = m.material_id');
    expect(materialSql).toContain('i.id::text = m.material_id');
    expect(materialSql).not.toContain('u.id = m.material_id');
    expect(materialSql).not.toContain('i.id = m.material_id');
  });
});
