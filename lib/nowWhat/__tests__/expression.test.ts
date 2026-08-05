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
  type Expression,
} from '../expression';

/**
 * A lens a practitioner genuinely authored, with rights signed.
 *
 * Constructed here rather than taken from the module because NO SHIPPED LENS
 * QUALIFIES YET — `now_what` is `platform_draft` with unsigned rights (E1).
 * Using it to test attribution is what let the defect hide: the suite asserted
 * that our own words carried Larry's name, and passed.
 */
const AUTHORED_BY_PRACTITIONER: Expression = {
  key: 'test_practitioner_lens',
  authoredBy: 'practitioner',
  rightsCleared: true,
  labels: { current_work: 'Their own wording' },
};

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
  it('attributes a practitioner-authored, rights-cleared lens while live', () => {
    expect(lensAttribution(AUTHORED_BY_PRACTITIONER, 'Larry', true)).toBe(
      'Within your work with Larry',
    );
  });

  it('STOPS attributing once the relationship has ended', () => {
    // A line that outlives its context has become identity, which is the
    // prohibited form. Absence here is the correct behaviour, not a gap.
    expect(lensAttribution(AUTHORED_BY_PRACTITIONER, 'Larry', false)).toBeNull();
  });

  it('never attributes the platform lens to a person', () => {
    const universal = resolveExpression('universal');
    expect(lensAttribution(universal, 'Larry', true)).toBeNull();
  });
});

/**
 * E1 — the platform must not speak in a practitioner's voice.
 *
 * Found in audit 2026-08-04. The shipped leadership lens was marked
 * `authoredBy: 'practitioner'` over labels WE wrote, and `lensAttribution`
 * gated on authorship alone. On the founder walk — the one path that sets
 * `allowUnclearedRights` — it would have rendered "Within your work with Larry"
 * above words Larry never wrote.
 *
 * These assertions fail if either protection is removed.
 */
describe('E1 — authorship and rights are INDEPENDENT, both fail closed', () => {
  it('the shipped leadership lens is a platform DRAFT, not the practitioner s', () => {
    const lens = resolveExpression('now_what', { allowUnclearedRights: true });
    // Our synthesis of leadership language, proposed to a practitioner and not
    // yet owned by one. Claiming otherwise is the absorption failure itself.
    expect(lens.authoredBy).toBe('platform_draft');
  });

  it('a platform draft is NEVER attributed to a person, even on the walk', () => {
    const lens = resolveExpression('now_what', { allowUnclearedRights: true });
    expect(lensAttribution(lens, 'Larry', true)).toBeNull();
  });

  it('a practitioner lens with UNSIGNED rights is never attributed', () => {
    // Authorship alone is not enough. Rights clearance is a separate question,
    // and the pre-E1 code checked only the first.
    const uncleared: Expression = {
      ...AUTHORED_BY_PRACTITIONER,
      rightsCleared: false,
    };
    expect(lensAttribution(uncleared, 'Larry', true)).toBeNull();
  });

  it('a draft lens may still RENDER its labels — only the NAME is withheld', () => {
    // The fix must not over-correct into silence. A draft is renderable; what
    // it may not do is claim an author.
    const lens = resolveExpression('now_what', { allowUnclearedRights: true });
    expect(labelFor('current_work', lens)).toBe('Leadership focus');
    expect(lensAttribution(lens, 'Larry', true)).toBeNull();
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
      // Comments are stripped first. Twice now a whole-file text match has
      // read PROSE ABOUT the invariant as a breach of it -- the migration that
      // documents "meaning lives in member_field_note_threads with no link
      // back" was flagged for containing both names. A test that cannot tell
      // documentation from schema will be silenced rather than fixed.
      const code = sql
        .replace(/--[^\n]*/g, '')
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/'(?:[^']|'')*'/g, "''"); // string literals, incl. COMMENT ON bodies

      // Only statements that actually TARGET the member table can put a column
      // on it. Widened from the original `ADD COLUMN` pattern after the
      // 2026-08-03 walk surfaced that a reference introduced inside a CREATE
      // TABLE body, or named anything other than invitation_id/practitioner_id,
      // would have slipped through.
      const targeting = [
        ...code.matchAll(/CREATE TABLE[^;]*?member_field_note_threads\s*\(([\s\S]*?);/gi),
        ...code.matchAll(/ALTER TABLE\s+member_field_note_threads\b([\s\S]*?);/gi),
      ].map((m) => m[1] ?? '');
      if (targeting.length === 0) continue;

      // The invariant is a REFERENCE TO A PERSON OR THEIR OFFER landing on
      // member-authored material -- not two particular column names.
      const REFERENCE =
        /\b(?:[a-z_]*invitation[a-z_]*_id|[a-z_]*practitioner[a-z_]*_id|program_id|offered_by[a-z_]*)\b/i;
      if (targeting.some((stmt) => REFERENCE.test(stmt))) offenders.push(file);
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
