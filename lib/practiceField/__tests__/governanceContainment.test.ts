/**
 * Governance Containment — executable invariants.
 *
 * Design + durable record: docs/design/practitioner-portal/GOVERNANCE_CONTAINMENT_2026-08-09.md
 *
 *   GC-1  Readiness recomputation may never clear, weaken, or override an active containment.
 *   GC-2  effective_live := (status = 'live') AND (containment_status = 'none')
 *   GC-3  Containment transitions are explicit, attributed acts.
 *
 * WHY THESE ARE SOURCE-LEVEL ASSERTIONS, NOT ONLY BEHAVIOURAL ONES:
 * the failure this guards against is a future edit adding a column to one UPDATE statement.
 * No amount of behavioural testing of today's code catches tomorrow's extra column; reading
 * the statement does. This mirrors lib/nowWhat/__tests__/rooms.test.ts, whose disk→registry
 * assertion is the reason a whole class of drift was catchable in this codebase at all.
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import {
  checkPracticeFieldReadiness,
  isContained,
  isEffectivelyLive,
  holderReleaseCheck,
  type PracticeField,
} from '@/lib/types/practiceField';

const ROOT = join(__dirname, '..', '..', '..');
const read = (p: string) => readFileSync(join(ROOT, p), 'utf8');

const SERVICE = 'lib/practiceField/practiceFieldService.ts';
const INVITE_ROUTE = 'app/api/practitioner/practice-field/invite/route.ts';
const CONTAINMENT_ROUTE = 'app/api/practitioner/practice-field/[id]/containment/route.ts';
const MIGRATION = 'database/migrations/20260809000001_practice_field_governance_containment.sql';

const CONTAINMENT_COLUMNS = [
  'containment_status',
  'authority_basis',
  'containment_reason',
  'contained_at',
  'contained_by',
  'containment_reference',
  'released_at',
  'released_by',
] as const;

const HOLDER = 'holder-member-id';
const OTHER_HOLDER = 'a-different-member-id';

/** A containment the field holder imposed on their own field. */
function holderContained(): Partial<PracticeField> {
  return {
    practitioner_member_id: HOLDER,
    status: 'live',
    containment_status: 'contained',
    authority_basis: 'holder',
    containment_reason: 'pausing my own field while I revise it',
    contained_at: '2026-08-09T00:00:00Z',
    contained_by: HOLDER,
  };
}

/** A prohibition imposed by an authority other than the holder. */
function governanceContained(): Partial<PracticeField> {
  return {
    practitioner_member_id: HOLDER,
    status: 'live',
    containment_status: 'contained',
    authority_basis: 'governance',
    containment_reason: 'held pending governance decision',
    contained_at: '2026-08-03T00:00:00Z',
    contained_by: 'some-governance-actor',
  };
}

/** The real 2026-08-03 row: governance basis, imposing actor unrecoverable. */
function legacyGovernanceContained(): Partial<PracticeField> {
  return {
    ...governanceContained(),
    contained_by: null,
    containment_reason:
      'contained 2026-08-03: active content was Soullab candidate material composed as Larry program corpus; preserved as evidence pending governance decision',
  };
}

/** A field that is fully ready by content, and contained by governance. */
function readyAndContained(): Partial<PracticeField> {
  return {
    welcome_message: 'w',
    how_we_work_together: 'h',
    how_maia_supports: 'm',
    professional_practice: 'p',
    status: 'live',
    containment_status: 'contained',
    authority_basis: 'governance',
    containment_reason: 'held pending governance decision',
    contained_at: '2026-08-03T00:00:00Z',
  };
}

// ── Invariant 1 — syncStatus writes readiness columns only ───────────────────

describe('GC-1 · syncStatus may not touch containment', () => {
  const source = read(SERVICE);
  const syncStatusBody = source.slice(
    source.indexOf('async function syncStatus'),
    source.indexOf('async function syncStatus') + 900,
  );

  it('1. the syncStatus UPDATE names only status and status_reason', () => {
    const update = syncStatusBody.match(/UPDATE practice_fields SET ([^`]*?)WHERE/s);
    expect(update).not.toBeNull();
    const setClause = update![1];
    expect(setClause).toContain('status');
    expect(setClause).toContain('status_reason');
    for (const col of CONTAINMENT_COLUMNS) {
      expect(setClause).not.toContain(col);
    }
  });

  it('1b. syncStatus does not reference any containment column at all', () => {
    for (const col of CONTAINMENT_COLUMNS) {
      expect(syncStatusBody).not.toContain(col);
    }
  });
});

// ── Invariant 2/3 — only the containment route writes containment ────────────

describe('GC-3 · containment is written in exactly one place', () => {
  it('2. no code path outside the containment route writes containment_status', () => {
    const offenders: string[] = [];
    const glob = require('child_process')
      .execSync(
        `grep -rl "containment_status" ${ROOT}/app ${ROOT}/lib --include=*.ts --include=*.tsx || true`,
        { encoding: 'utf8' },
      )
      .trim()
      .split('\n')
      .filter(Boolean);

    for (const file of glob) {
      const rel = file.replace(`${ROOT}/`, '');
      if (rel === CONTAINMENT_ROUTE) continue;
      const body = readFileSync(file, 'utf8');
      // A write is an assignment inside a SET clause. Reads and type declarations are fine.
      if (/SET[\s\S]{0,400}?containment_status\s*=/.test(body)) offenders.push(rel);
    }
    expect(offenders).toEqual([]);
  });

  it('3. only the one authorized migration writes containment_status', () => {
    const migrations = require('child_process')
      .execSync(
        `grep -rl "containment_status" ${ROOT}/database/migrations || true`,
        { encoding: 'utf8' },
      )
      .trim()
      .split('\n')
      .filter(Boolean)
      .map((f: string) => f.replace(`${ROOT}/`, ''));
    expect(migrations).toEqual([MIGRATION]);
  });

  it('3b. the legacy containment is scoped to exactly one row and guarded on its evidence', () => {
    const sql = read(MIGRATION);
    const update = sql.slice(sql.indexOf('UPDATE practice_fields'));
    expect(update).toContain("id::text LIKE '8be895ad%'");
    expect(update).toContain("status_reason LIKE 'contained 2026-08-03:%'");
    expect(update).toContain("containment_status = 'none'"); // inert if already contained
    expect(update).toContain('contained_by          = NULL'); // author not invented
    // Verbatim preservation: the reason is copied from the surviving column, never retyped.
    expect(update).toContain('containment_reason    = status_reason');
  });

  it('3c. the migration is transactional — substrate and containment land together', () => {
    const sql = read(MIGRATION);
    expect(sql).toContain('BEGIN;');
    expect(sql).toContain('COMMIT;');
    expect(sql.indexOf('BEGIN;')).toBeLessThan(sql.indexOf('ADD COLUMN IF NOT EXISTS containment_status'));
    expect(sql.indexOf('UPDATE practice_fields')).toBeLessThan(sql.indexOf('COMMIT;'));
  });

  it('3d. new containment acts require an attributed actor', () => {
    const route = read(CONTAINMENT_ROUTE);
    // The imposing UPDATE binds contained_by to the authenticated member, never NULL.
    const impose = route.slice(route.indexOf("containment_status    = 'contained'"));
    expect(impose).toContain('contained_by          = $3');
    expect(route).toContain('auth.memberId');
    expect(route).toContain("status: 401"); // unauthenticated is refused
  });
});

// ── Invariant 4 — every liveness gate reads both ─────────────────────────────

describe('GC-2 · gates require readiness AND absence of containment', () => {
  it('4. the invite gate tests containment before deciding', () => {
    const route = read(INVITE_ROUTE);
    expect(route).toContain('isContained(field)');
    // Containment is checked before the readiness refusal, so a contained-and-ready field
    // cannot fall through to a 422 that reads like mere incompleteness.
    expect(route.indexOf('isContained(field)')).toBeLessThan(route.indexOf("field.status === 'pending'"));
  });

  it('4b. the two refusals are distinguishable — prohibition is not incompleteness', () => {
    const route = read(INVITE_ROUTE);
    expect(route).toContain('status: 409'); // contained
    expect(route).toContain('status: 422'); // incomplete
    expect(route).toContain('containment_reason');
  });

  it('4c. isEffectivelyLive is a conjunction', () => {
    expect(isEffectivelyLive({ status: 'live', containment_status: 'none' })).toBe(true);
    expect(isEffectivelyLive({ status: 'live', containment_status: 'contained' })).toBe(false);
    expect(isEffectivelyLive({ status: 'pending', containment_status: 'none' })).toBe(false);
    expect(isEffectivelyLive({ status: 'pending', containment_status: 'contained' })).toBe(false);
  });
});

// ── Invariant 5 — a ready, contained field cannot go live ────────────────────

describe('GC-2 · the state the old model could not represent', () => {
  it('5. ready = true AND contained = true → must remain non-live', () => {
    const field = readyAndContained();
    expect(checkPracticeFieldReadiness(field).is_live).toBe(true); // readiness says yes
    expect(isContained(field)).toBe(true); // governance says no
    expect(isEffectivelyLive(field)).toBe(false); // and governance wins
  });

  it('5b. this is exactly the shape of the 2026-08-03 legacy containment', () => {
    // All four required sections populated, yet held. Recorded in the durable record.
    const legacy = readyAndContained();
    expect(checkPracticeFieldReadiness(legacy).missing).toEqual([]);
    expect(isEffectivelyLive(legacy)).toBe(false);
  });
});

// ── GC-4 · release authority follows the KIND of containment ─────────────────
//
// Founder ruling 2026-08-09: "A field holder may contain and release a holder-authored
// containment on their own field. A governance containment requires a separately
// authorized governance release act."

describe('GC-4 · who may release which containment', () => {
  it('R1. a holder containment can be released by the authorized holder', () => {
    expect(holderReleaseCheck(holderContained(), HOLDER)).toEqual({ allowed: true });
  });

  it('R2. another holder cannot release it', () => {
    expect(holderReleaseCheck(holderContained(), OTHER_HOLDER)).toEqual({
      allowed: false,
      refusal: 'not_holder',
    });
  });

  it('R3. a governance containment cannot be released through the holder route', () => {
    // Even though the actor IS the field holder. Holding is necessary, not sufficient.
    expect(holderReleaseCheck(governanceContained(), HOLDER)).toEqual({
      allowed: false,
      refusal: 'governance_authority',
    });
  });

  it('R4. the legacy contained_by = NULL governance hold stays unreleasable by the holder', () => {
    const legacy = legacyGovernanceContained();
    expect(legacy.contained_by).toBeNull(); // the missing actor was not invented
    expect(holderReleaseCheck(legacy, HOLDER)).toEqual({
      allowed: false,
      refusal: 'governance_authority',
    });
    // And nobody else can either — non-holders are refused earlier.
    expect(holderReleaseCheck(legacy, OTHER_HOLDER).allowed).toBe(false);
  });

  it('R4b. an unclassifiable containment fails CLOSED, treated as governance', () => {
    // authority_basis absent → not a self-imposed pause. The safe direction for an
    // unknown restraint is the more restrictive one.
    const unclassified = { ...governanceContained(), authority_basis: undefined };
    expect(holderReleaseCheck(unclassified, HOLDER)).toEqual({
      allowed: false,
      refusal: 'governance_authority',
    });
  });

  it('R4c. the DELETE route delegates to holderReleaseCheck rather than re-deriving it', () => {
    const route = read(CONTAINMENT_ROUTE);
    expect(route).toContain('holderReleaseCheck(auth.field, auth.memberId)');
    expect(route).toContain("refusal === 'governance_authority'");
    expect(route).toContain('status: 403');
  });

  it('R4d. the holder route can only mint holder containments, never governance ones', () => {
    const route = read(CONTAINMENT_ROUTE);
    const impose = route.slice(route.indexOf("containment_status    = 'contained'"));
    expect(impose).toContain("authority_basis       = 'holder'");
    // No path in this route writes a governance basis.
    expect(route).not.toContain("authority_basis       = 'governance'");
    expect(route).not.toContain("authority_basis = 'governance'");
  });

  it('R4e. the migration classifies the legacy hold as governance, from its own evidence', () => {
    const sql = read(MIGRATION);
    const update = sql.slice(sql.indexOf('UPDATE practice_fields'));
    expect(update).toContain("authority_basis       = 'governance'");
    // And the schema refuses to store a containment with no defined release authority.
    expect(sql).toContain('authority_basis IS NOT NULL');
  });
});

// ── Invariant 6 — recomputation leaves containment byte-identical ────────────

describe('GC-1 · a computed state may never erase an explicit governance act', () => {
  it('6. recomputing readiness leaves every containment column untouched', () => {
    const before = readyAndContained();
    const snapshot = JSON.stringify(
      CONTAINMENT_COLUMNS.map((c) => (before as Record<string, unknown>)[c] ?? null),
    );

    // Readiness recomputation is a pure function of content; simulate the full write path's
    // decision and apply it exactly as syncStatus would — to status/status_reason only.
    const readiness = checkPracticeFieldReadiness(before);
    const after: Partial<PracticeField> = {
      ...before,
      status: readiness.is_live ? 'live' : 'pending',
      status_reason: readiness.is_live ? null : `Missing: ${readiness.missing.join(', ')}`,
    };

    const afterSnapshot = JSON.stringify(
      CONTAINMENT_COLUMNS.map((c) => (after as Record<string, unknown>)[c] ?? null),
    );
    expect(afterSnapshot).toBe(snapshot);
    expect(isContained(after)).toBe(true);
    expect(isEffectivelyLive(after)).toBe(false);
  });

  it('R5. readiness recomputation cannot affect release authority either', () => {
    // The founder-required fifth proof, stated at the authority layer: recomputing
    // readiness must not turn a governance hold into something the holder can lift.
    const before = legacyGovernanceContained();
    const readiness = checkPracticeFieldReadiness({
      welcome_message: 'w', how_we_work_together: 'h',
      how_maia_supports: 'm', professional_practice: 'p',
    });
    const after: Partial<PracticeField> = {
      ...before,
      status: readiness.is_live ? 'live' : 'pending',
      status_reason: readiness.is_live ? null : `Missing: ${readiness.missing.join(', ')}`,
    };
    expect(after.authority_basis).toBe('governance');
    expect(holderReleaseCheck(after, HOLDER)).toEqual({
      allowed: false,
      refusal: 'governance_authority',
    });
    expect(isEffectivelyLive(after)).toBe(false);
  });

  it('6b. release preserves the containment history rather than erasing it', () => {
    const route = read(CONTAINMENT_ROUTE);
    const release = route.slice(route.indexOf("containment_status = 'none'"));
    // The releasing UPDATE must not blank the record of what was held.
    expect(release).not.toContain('containment_reason    = NULL');
    expect(release).not.toContain('containment_reason = NULL');
    expect(release).not.toContain('contained_at       = NULL');
    expect(release).toContain('released_at        = NOW()');
    expect(release).toContain('released_by        = $2');
  });
});
