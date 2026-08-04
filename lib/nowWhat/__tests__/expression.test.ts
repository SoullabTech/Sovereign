/**
 * The lens boundary, as tests.
 *
 * These assert the invariants ruled 2026-08-03 (CF-D5 / CF-D5a / CF-D5c). They
 * are written to FAIL if a later change loosens the boundary, which is the only
 * reason they are worth having:
 *
 *   - an expression may rename, order, or omit a universal verb;
 *     it may NEVER introduce a zone that has no universal verb behind it
 *   - vocabulary resolves at render time and fails safe
 *   - contextual attribution does not survive the relationship
 */

import fs from 'fs';
import path from 'path';
import {
  UNIVERSAL_VERBS,
  resolveExpression,
  labelFor,
  lensAttribution,
} from '../expression';

describe('expression vocabulary — CF-D5a: vocabulary may not create capability', () => {
  it('every lens labels only universal verbs — no lens invents a zone', () => {
    const verbs = new Set<string>(UNIVERSAL_VERBS);
    for (const key of ['universal', 'now_what']) {
      const expr = resolveExpression(key, { allowUnclearedRights: true });
      for (const labelled of Object.keys(expr.labels)) {
        // A lens that could add a key here would be creating a zone by naming,
        // bypassing CF-D2 through vocabulary rather than through code.
        expect(verbs.has(labelled)).toBe(true);
      }
    }
  });

  it('omission is permitted; silence is not — every verb still renders', () => {
    const expr = resolveExpression('now_what', { allowUnclearedRights: true });
    for (const verb of UNIVERSAL_VERBS) {
      const label = labelFor(verb, expr);
      expect(typeof label).toBe('string');
      expect(label.length).toBeGreaterThan(0);
    }
  });
});

describe('expression vocabulary — fails safe', () => {
  it('an unknown lens falls back to universal rather than throwing', () => {
    expect(resolveExpression('no-such-lens').key).toBe('universal');
  });

  it('a null lens is the universal lens', () => {
    expect(resolveExpression(null).key).toBe('universal');
    expect(resolveExpression(undefined).key).toBe('universal');
  });

  it('a lens whose rights are NOT cleared never reaches a member', () => {
    // Larry's rights instrument is unsigned as of 2026-08-03. Without the
    // explicit founder-walk opt-in, the practitioner lens must not resolve.
    const forMember = resolveExpression('now_what');
    expect(forMember.key).toBe('universal');
    expect(forMember.authoredBy).toBe('platform');
  });

  it('the founder-walk opt-in is the only way to see an uncleared lens', () => {
    const forWalk = resolveExpression('now_what', { allowUnclearedRights: true });
    expect(forWalk.key).toBe('now_what');
    expect(forWalk.rightsCleared).toBe(false);
  });
});

describe('attribution — CF-D5c: context may not become identity', () => {
  const lens = resolveExpression('now_what', { allowUnclearedRights: true });

  it('attributes a practitioner lens while the relationship is live', () => {
    expect(lensAttribution(lens, 'Larry', true)).toBe('Within your work with Larry');
  });

  it('STOPS attributing once the relationship has ended', () => {
    // A line that outlives its context has become identity, which is the
    // prohibited form. Absence here is the correct behaviour, not a gap.
    expect(lensAttribution(lens, 'Larry', false)).toBeNull();
  });

  it('never attributes the platform lens to a person', () => {
    const universal = resolveExpression('universal');
    expect(lensAttribution(universal, 'Larry', true)).toBeNull();
  });
});

describe('schema boundary — the member row carries no practitioner reference', () => {
  const migrations = path.join(__dirname, '../../../database/migrations');

  it('no migration adds an invitation reference to member material', () => {
    // The tempting join: "to show attribution, just add invitation_id to member
    // reflections." It would permanently couple a person's meaning to whoever
    // helped evoke it. This assertion is the structural refusal.
    const offenders: string[] = [];
    for (const file of fs.readdirSync(migrations)) {
      if (!file.endsWith('.sql')) continue;
      const sql = fs.readFileSync(path.join(migrations, file), 'utf8');
      const touchesMemberMaterial = /member_field_note_threads/i.test(sql);
      const addsInvitationRef =
        /ADD COLUMN[^;]*invitation_id/i.test(sql) ||
        /ADD COLUMN[^;]*practitioner_id/i.test(sql);
      if (touchesMemberMaterial && addsInvitationRef) offenders.push(file);
    }
    expect(offenders).toEqual([]);
  });

  it('the response table stores a gesture, never a completion state', () => {
    const file = path.join(migrations, '20260803000002_field_invitations.sql');
    const sql = fs.readFileSync(file, 'utf8');
    // An invitation is an offer, not an assignment (CF-D2a). A completion
    // state would make the practitioner the auditor of the member's living.
    //
    // Asserted against the CHECK constraint itself, not the file text: the
    // prose above it names 'completed' precisely to say it does not exist, and
    // a whole-file match would read that refusal as the violation.
    const check = sql.match(/response TEXT NOT NULL CHECK \(([^)]*)\)/);
    expect(check).not.toBeNull();
    const allowed = check![1];
    expect(allowed).toMatch(/'accepted'/);
    expect(allowed).toMatch(/'declined'/);
    expect(allowed).not.toMatch(/'completed'/);
    expect(allowed).not.toMatch(/'in_progress'/);
  });
});
