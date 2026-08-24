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
  decideProvisioning, classifyCollision, isUniqueViolation, constraintNameOf,
  publicConflictBody, personalSlugFor,
  type PractitionerRow,
} from '@/lib/studio/personalStudioProvisioning';
import { readFileSync } from 'node:fs';
import path from 'node:path';

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
    // Re-read shows the member still owns nothing ⇒ the conflict is real.
    expect(classifyCollision(NONE, 'practitioners_slug_key').action).toBe('slug_conflict');
  });

  it('a suspended row found on re-read is refused, not replaced', () => {
    expect(classifyCollision(SUSPENDED).action).toBe('refuse_suspended');
  });
});

describe('COLLISION ATTRIBUTION — name the constraint that actually fired', () => {
  // The creation INSERT carries TWO deterministic unique values:
  //   slug  = personal-<member8>
  //   email = <slug>@soullab.life
  // A 23505 therefore does not identify itself, and calling every unresolved
  // one a "slug conflict" is a more specific claim than the evidence supports.

  it('slug constraint ⇒ slug_conflict', () => {
    const c = classifyCollision(NONE, 'practitioners_slug_key');
    expect(c.action).toBe('slug_conflict');
  });

  it('email constraint ⇒ NOT slug_conflict — it is a typed email conflict', () => {
    const c = classifyCollision(NONE, 'practitioners_email_key');
    expect(c.action).not.toBe('slug_conflict');
    expect(c.action).toBe('email_conflict');
  });

  it('any other unique constraint ⇒ a neutral unique_conflict, still named', () => {
    const c = classifyCollision(NONE, 'practitioners_pkey');
    expect(c.action).toBe('unique_conflict');
    if (c.action === 'unique_conflict') expect(c.constraint).toBe('practitioners_pkey');
  });

  it('an UNNAMED constraint is not narrated as a slug problem', () => {
    const c = classifyCollision(NONE, null);
    expect(c.action).toBe('unique_conflict');
    if (c.action === 'unique_conflict') expect(c.constraint).toBeNull();
  });

  it('recovery stays constraint-agnostic: the re-read is stronger evidence', () => {
    // Whichever index fired, if the member now owns an active row a concurrent
    // request won and the conflict is resolved.
    for (const con of ['practitioners_slug_key', 'practitioners_email_key', 'other', null]) {
      expect(classifyCollision(ACTIVE, con).action).toBe('use_existing');
      expect(classifyCollision(SUSPENDED, con).action).toBe('refuse_suspended');
    }
  });

  it('constraintNameOf reads the driver field, and invents nothing', () => {
    expect(constraintNameOf({ code: '23505', constraint: 'practitioners_email_key' })).toBe('practitioners_email_key');
    expect(constraintNameOf({ code: '23505' })).toBeNull();
    expect(constraintNameOf(new Error('boom'))).toBeNull();
    expect(constraintNameOf(null)).toBeNull();
  });
});

describe('PUBLIC SURFACE — the server may know why; the member gets the class', () => {
  // A constraint name like `practitioners_slug_key` is internal schema. The
  // client needs the truthful actionable class and nothing more.
  const SCHEMA_LEAKS = ['practitioners_slug_key', 'practitioners_email_key', 'practitioners_pkey', '23505', 'constraint'];

  it('email constraint ⇒ email_conflict, and the schema name is NOT in the body', () => {
    const body = publicConflictBody(classifyCollision(NONE, 'practitioners_email_key').action as never);
    expect(body.state).toBe('email_conflict');
    const json = JSON.stringify(body);
    for (const leak of SCHEMA_LEAKS) expect(json).not.toContain(leak);
  });

  it('email conflict is NOT described as a slug or naming conflict', () => {
    const body = publicConflictBody('email_conflict');
    expect(JSON.stringify(body).toLowerCase()).not.toContain('naming conflict');
    expect(JSON.stringify(body).toLowerCase()).not.toContain('address');
    expect(body.error.toLowerCase()).toContain('email');
  });

  it('unnamed/unknown constraint ⇒ unique_conflict with NO field speculation', () => {
    const body = publicConflictBody(classifyCollision(NONE, null).action as never);
    expect(body.state).toBe('unique_conflict');
    const lower = JSON.stringify(body).toLowerCase();
    for (const leak of SCHEMA_LEAKS) expect(lower).not.toContain(leak.toLowerCase());
    // must not guess WHICH field
    expect(lower).not.toContain('address');
    expect(lower).not.toContain('email');
    expect(lower).not.toContain('naming conflict');
  });

  it('no public body carries a raw schema identifier, for any class', () => {
    for (const a of ['slug_conflict', 'email_conflict', 'unique_conflict'] as const) {
      const json = JSON.stringify(publicConflictBody(a));
      for (const leak of SCHEMA_LEAKS) expect(json).not.toContain(leak);
      expect(json).not.toContain('_key');
    }
  });

  it('publicConflictBody cannot leak a constraint: it never receives one', () => {
    expect(publicConflictBody.length).toBe(1); // action only
  });

  it('ROUTE: the operator log carries no member identifier fragment', () => {
    const route = readFileSync(
      path.join(process.cwd(), 'app/api/studio/personal/enter/route.ts'), 'utf8');
    // A truncated UUID is a FRAGMENT of the real identifier, not a derivation:
    // still directly matchable against it. The slug is `personal-<first8>`, so
    // logging it leaks the same fragment under a different name.
    expect(route).not.toContain('memberId.slice(');
    expect(route).toContain('member: memberRef(memberId)');
    const warnBlock = route.slice(route.indexOf('unresolved unique conflict'),
                                  route.indexOf('unresolved unique conflict') + 400);
    expect(warnBlock).not.toMatch(/\bslug\b\s*,/);
  });

  it('ROUTE: the 409 body is publicConflictBody(action), and the constraint only reaches the log', () => {
    const route = readFileSync(
      path.join(process.cwd(), 'app/api/studio/personal/enter/route.ts'), 'utf8');
    // the constraint appears exactly once, inside the operator warn
    const warnBlock = route.slice(route.indexOf('unresolved unique conflict'));
    expect(warnBlock).toContain('constraint: after.constraint');
    // and the 409 response is the pure body helper
    expect(route).toContain('NextResponse.json(publicConflictBody(after.action), { status: 409 })');
    // no response object spreads the constraint
    expect(route).not.toMatch(/NextResponse\.json\(\{[^}]*constraint/);
  });
});

describe('the slug is deterministic — which is why collision is reachable', () => {
  it('same member always yields the same slug', () => {
    const m = '49ae4717-2b3a-4189-b25d-2bef95b1a45a';
    expect(personalSlugFor(m)).toBe('personal-49ae4717');
    expect(personalSlugFor(m)).toBe(personalSlugFor(m));
  });
});
