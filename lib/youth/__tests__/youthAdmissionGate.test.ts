import { checkYouthAdmission } from '../youthAdmissionGate';

const NOW = new Date('2026-10-01T12:00:00Z');

describe('TEEN-CLOSED-01 youth admission gate', () => {
  it('allows an absent birth date (optional)', () => {
    for (const v of [undefined, null, '']) expect(checkYouthAdmission(v, NOW)).toEqual({ ok: true });
  });

  it('allows an adult', () => {
    expect(checkYouthAdmission('1980-05-04', NOW)).toEqual({ ok: true });
    expect(checkYouthAdmission('2008-10-01', NOW)).toEqual({ ok: true }); // 18 today
  });

  it('refuses every youth tier: under 13, 13-15, 16-17', () => {
    for (const d of ['2016-01-01', '2012-06-15', '2009-10-02']) {
      const r = checkYouthAdmission(d, NOW);
      expect(r.ok).toBe(false);
      if (!r.ok) {
        expect(r.status).toBe(403);
        expect(r.code).toBe('YOUTH_NOT_YET_OPEN');
      }
    }
  });

  it('refuses an unparseable or future date rather than letting it through', () => {
    for (const d of ['not-a-date', '2030-01-01', 42]) {
      const r = checkYouthAdmission(d, NOW);
      expect(r.ok).toBe(false);
      if (!r.ok) expect(r.code).toBe('INVALID_BIRTH_DATE');
    }
  });
});
