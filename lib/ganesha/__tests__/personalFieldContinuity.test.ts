import { beforeEach, describe, expect, it, jest } from '@jest/globals';

const mockQuery = jest.fn<(...args: unknown[]) => Promise<any>>();
jest.mock('@/lib/db/postgres', () => ({
  query: (...args: unknown[]) => mockQuery(...args),
}));
import {
  readPersonalFieldContinuity,
  PERSONAL_DECISIONS_SQL,
  PERSONAL_PROCESS_SQL,
  PERSONAL_CHANGES_SQL,
  PERSONAL_LEGACY_NOTES_SQL,
  PERSONAL_LEGACY_ATTENTION_SQL,
} from '../personalFieldContinuity';
import type { IndividualContext } from '@/lib/auth/individualContext';

const MEMBER = '11111111-1111-4111-8111-111111111111';
const PERSONAL = '22222222-2222-4222-8222-222222222222';
const FOREIGN = '33333333-3333-4333-8333-333333333333';
const memberContext = (status: IndividualContext['legacyPersonalStatus'] = 'none'): IndividualContext => ({
  memberId: MEMBER,
  legacyPersonalStatus: status,
  legacyPersonalPractitionerId: status === 'active' ? PERSONAL : null,
});
const queries = () => mockQuery.mock.calls.map(([s, p]) => ({
  sql: String(s), params: p as unknown[],
}));
const findQuery = (part: string) => queries().find(q => q.sql.includes(part));

beforeEach(() => {
  mockQuery.mockReset();
  mockQuery.mockResolvedValue({ rows: [] });
});

describe('G2-2 bounded continuity: personal membership, not professional inference', () => {
  it('new member reads directly owned history with zero practitioner rows required', async () => {
    const payload = await readPersonalFieldContinuity(memberContext());
    expect(payload).toMatchObject({
      owner: 'member',
      access: 'bounded_read_only',
      coverage: 'personal_records_with_verified_provenance_only',
      legacyPersonal: { status: 'none', referenced: false },
      records: { decisions: [], processItems: [], changes: [], notes: [], attention: [] },
    });
    expect(mockQuery).toHaveBeenCalledTimes(3);
    expect(findQuery('FROM studio_decisions')?.params).toEqual([MEMBER, 25]);
    expect(findQuery('FROM process_items')?.params).toEqual([MEMBER, null, 25]);
    expect(findQuery('FROM studio_changes')?.params).toEqual([MEMBER, null, 25]);
    expect(findQuery('FROM field_notes')).toBeUndefined();
    expect(findQuery('FROM field_attention')).toBeUndefined();
  });

  it('one verified, active Personal Studio ID is used ONLY for exact historical read', async () => {
    await readPersonalFieldContinuity(memberContext('active'));
    expect(mockQuery).toHaveBeenCalledTimes(5);
    expect(findQuery('FROM process_items')?.params).toEqual([MEMBER, PERSONAL, 25]);
    expect(findQuery('FROM studio_changes')?.params).toEqual([MEMBER, PERSONAL, 25]);
    expect(findQuery('FROM field_notes')?.params).toEqual([MEMBER, PERSONAL, 25]);
    expect(findQuery('FROM field_attention')?.params).toEqual([MEMBER, PERSONAL, 25]);
    expect(queries().flatMap(q => q.params)).not.toContain(FOREIGN);
  });

  it.each(['ambiguous', 'unavailable'] as const)(
    '%s Personal legacy custody cannot activate practitioner-keyed reads',
    async (status) => {
      const payload = await readPersonalFieldContinuity(memberContext(status));
      expect(payload.legacyPersonal).toEqual({ status, referenced: false });
      expect(mockQuery).toHaveBeenCalledTimes(3);
      expect(findQuery('FROM field_notes')).toBeUndefined();
      expect(findQuery('FROM field_attention')).toBeUndefined();
    },
  );

  it('the statement projections exclude client records, clinical notes and raw prompts', () => {
    for (const q of [PERSONAL_DECISIONS_SQL, PERSONAL_PROCESS_SQL,
      PERSONAL_CHANGES_SQL, PERSONAL_LEGACY_NOTES_SQL, PERSONAL_LEGACY_ATTENTION_SQL]) {
      expect(q).not.toMatch(/\b(INSERT|UPDATE|DELETE|TRUNCATE|DROP)\b/i);
      expect(q).not.toContain('practitioner_clients');
      expect(q).not.toContain('client_notes');
      expect(q).not.toContain('council_result');
      expect(q).toMatch(/LIMIT \$[23]/);
    }
    expect(PERSONAL_DECISIONS_SQL).toContain("decision_scope = 'personal'");
    expect(PERSONAL_DECISIONS_SQL).toContain('personal_member_id = $1');
    expect(PERSONAL_DECISIONS_SQL).toContain('d.client_id IS NULL');
    expect(PERSONAL_DECISIONS_SQL).toContain('d.team_id IS NULL');
    expect(PERSONAL_PROCESS_SQL).toContain('pi.member_id = $1');
    expect(PERSONAL_PROCESS_SQL).toContain('pi.practitioner_id = $2::uuid');
    expect(PERSONAL_CHANGES_SQL).toContain('c.member_id = $1');
    expect(PERSONAL_CHANGES_SQL).toContain('c.member_id IS NULL');
    expect(PERSONAL_CHANGES_SQL).toContain('c.client_id IS NULL AND c.team_id IS NULL');
    expect(PERSONAL_LEGACY_NOTES_SQL).toContain('n.team_id IS NULL');
    expect(PERSONAL_LEGACY_NOTES_SQL).toContain('personal_adapter.member_id = $1');
    expect(PERSONAL_LEGACY_NOTES_SQL).toContain("personal_adapter.portal_type = 'personal'");
    expect(PERSONAL_LEGACY_NOTES_SQL).toContain("personal_adapter.status = 'active'");
    expect(PERSONAL_PROCESS_SQL).toContain('personal_adapter.member_id = $1');
    expect(PERSONAL_CHANGES_SQL).toContain('personal_adapter.member_id = $1');
    expect(PERSONAL_LEGACY_ATTENTION_SQL).toContain("d.decision_scope = 'personal'");
    expect(PERSONAL_LEGACY_ATTENTION_SQL).toContain('a.team_id IS NULL');
    expect(PERSONAL_LEGACY_ATTENTION_SQL).toContain('d.id IS NOT NULL');
    expect(PERSONAL_LEGACY_ATTENTION_SQL).toContain('c.id IS NOT NULL');
  });

  it('maps only minimized record fields even when a driver row includes unrelated data', async () => {
    mockQuery.mockImplementation(async (sql) => {
      if (String(sql).includes('FROM studio_decisions')) return { rows: [{
        id: 'd1', title: 'My decision', status: 'draft', created_at: '2026-10-12T00:00:00Z',
        client_email: 'forbidden@example.invalid', council_result: 'private',
      }] };
      if (String(sql).includes('FROM field_notes')) return { rows: [{
        id: 'n1', section: 'alive', body: 'My authored note', created_at: '2026-10-12T00:00:00Z',
        practitioner_id: PERSONAL, clinician_notes: 'never-visible',
      }] };
      if (String(sql).includes('FROM field_attention')) return { rows: [{
        id: 'a1', field: 'important', kind: 'note', label: 'My attention',
        created_at: '2026-10-12T00:00:00Z', ref_id: FOREIGN,
      }] };
      return { rows: [] };
    });
    const payload = await readPersonalFieldContinuity(memberContext('active'));
    expect(payload.records.decisions).toHaveLength(1);
    expect(payload.records.notes).toHaveLength(1);
    expect(payload.records.attention).toHaveLength(1);
    const serialized = JSON.stringify(payload);
    expect(serialized).not.toContain(PERSONAL);
    expect(serialized).not.toContain('forbidden@example.invalid');
    expect(serialized).not.toContain('clinician_notes');
    expect(serialized).not.toContain(FOREIGN);
    expect(serialized).not.toContain('council_result');
  });

  it('does not silently convert source failure to "no history"', async () => {
    mockQuery.mockRejectedValueOnce(new Error('database unavailable: private details'));
    await expect(readPersonalFieldContinuity(memberContext())).rejects.toThrow();
    expect(mockQuery).toHaveBeenCalledTimes(1);
  });
});
