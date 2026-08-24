/**
 * Personal Studio provisioning — the invariant:
 *
 *   Suspension is a state of an EXISTING practitioner, never evidence that the
 *   practitioner does not exist.
 *
 * The NEGATIVE CONTROL below reproduces the pre-fix predicate inline and proves
 * it takes the creation path on the exact witnessed input. A suite that only
 * shows the repaired code passing would not establish that anything was wrong.
 */
import {
  decideProvisioning, classifyCollision, isUniqueViolation, personalSlugFor,
  type PractitionerRow,
} from '@/lib/studio/personalStudioProvisioning';

/** The historical predicate, verbatim in behaviour: `WHERE member_id AND status='active'`. */
function legacyWouldCreate(rows: PractitionerRow[]): boolean {
  const filtered = rows.filter((r) => r.status === 'active');
  return filtered.length === 0; // empty ⇒ old route took the INSERT path
}

// The witnessed row: member 49ae4717's practitioner fb0cb8b7, suspended.
const SUSPENDED: PractitionerRow[] = [{ id: 'fb0cb8b7-ebd0-4cc6-ab37-305ed2e16fc6', status: 'suspended' }];
const ACTIVE: PractitionerRow[] = [{ id: '0776d427-d550-4da9-8944-cddc3619befa', status: 'active' }];
const NONE: PractitionerRow[] = [];

describe('NEGATIVE CONTROL — the defect reproduces against the pre-fix predicate', () => {
  it('old predicate WOULD have created a replacement for a suspended practitioner', () => {
    expect(legacyWouldCreate(SUSPENDED)).toBe(true); // this is the bug, proven
  });

  it('repaired decision does NOT create — it recognises the row and refuses by name', () => {
    const d = decideProvisioning(SUSPENDED);
    expect(d.action).toBe('refuse_suspended');
    expect(d.action).not.toBe('create');
    if (d.action === 'refuse_suspended') {
      expect(d.practitionerId).toBe('fb0cb8b7-ebd0-4cc6-ab37-305ed2e16fc6');
    }
  });

  it('old and new disagree on exactly this input — that disagreement IS the repair', () => {
    expect(legacyWouldCreate(SUSPENDED)).toBe(true);
    expect(decideProvisioning(SUSPENDED).action).toBe('refuse_suspended');
  });
});

describe('ACTIVE CONTROL — an active practitioner is used, never re-created', () => {
  it('returns the existing row', () => {
    const d = decideProvisioning(ACTIVE);
    expect(d.action).toBe('use_existing');
    if (d.action === 'use_existing') expect(d.practitionerId).toBe('0776d427-d550-4da9-8944-cddc3619befa');
  });

  it('an active row wins even when a suspended row sits beside it', () => {
    // Member 49ae4717 really does hold both. "First row" would be unsafe here.
    const both: PractitionerRow[] = [...SUSPENDED, ...ACTIVE];
    const d = decideProvisioning(both);
    expect(d.action).toBe('use_existing');
  });
});

describe('POSITIVE CONTROL — a genuinely new member still gets a Personal Studio', () => {
  it('creates when the member owns no practitioner at all', () => {
    expect(decideProvisioning(NONE).action).toBe('create');
  });

  it('the controls can distinguish: not everything is refused', () => {
    expect(decideProvisioning(NONE).action).toBe('create');
    expect(decideProvisioning(ACTIVE).action).toBe('use_existing');
    expect(decideProvisioning(SUSPENDED).action).toBe('refuse_suspended');
  });
});

describe('OTHER NON-ACTIVE STATES — named, never read as absence', () => {
  it.each(['pending', 'archived', 'disabled', 'unknown-future-state'])('%s is recognised as existing', (status) => {
    const d = decideProvisioning([{ id: 'p-1', status }]);
    expect(d.action).toBe('refuse_state');
    expect(d.action).not.toBe('create');
    if (d.action === 'refuse_state') expect(d.status).toBe(status);
  });

  it('a NULL status is still an existing row, not an absent one', () => {
    const d = decideProvisioning([{ id: 'p-1', status: null }]);
    expect(d.action).toBe('refuse_state');
    expect(d.action).not.toBe('create');
  });
});

describe('RACE / COLLISION CONTROL — a unique conflict is recovered or named', () => {
  it('detects a Postgres unique_violation and nothing else', () => {
    expect(isUniqueViolation({ code: '23505' })).toBe(true);
    expect(isUniqueViolation({ code: '23503' })).toBe(false);
    expect(isUniqueViolation(new Error('boom'))).toBe(false);
    expect(isUniqueViolation(null)).toBe(false);
  });

  it('a concurrent winner is recovered: the member now owns an active row', () => {
    expect(classifyCollision(ACTIVE).action).toBe('use_existing');
  });

  it('a conflict that cannot be reconciled to this member is a NAMED conflict, not a 500', () => {
    // Re-read shows the member still owns nothing ⇒ the slug belongs elsewhere.
    expect(classifyCollision(NONE).action).toBe('slug_conflict');
  });

  it('a suspended row found on re-read is refused, not replaced', () => {
    expect(classifyCollision(SUSPENDED).action).toBe('refuse_suspended');
  });
});

describe('the slug is deterministic — which is why collision is reachable', () => {
  it('same member always yields the same slug', () => {
    const m = '49ae4717-2b3a-4189-b25d-2bef95b1a45a';
    expect(personalSlugFor(m)).toBe('personal-49ae4717');
    expect(personalSlugFor(m)).toBe(personalSlugFor(m));
  });
});
