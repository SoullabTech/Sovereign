/**
 * MAIA/Jarvis Memory Organism — P6 restoration proof.
 *
 * This is a bounded transfer proof for the already-certified P6 invariant onto
 * the canonical memory-organism lineage. It does not reopen the full MIPA Phase
 * 0 architecture and imports no competing CMT constructor.
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import {
  memberConferredReturn,
  noContextualReturn,
  returnPreferenceValue,
  ReturnAuthorityError,
} from '@/lib/psyche/returnAuthority';

const ROOT = process.cwd();
const read = (p: string) => readFileSync(join(ROOT, p), 'utf8');

const MEMBER = '11111111-1111-4111-8111-111111111111';
const OTHER = '22222222-2222-4222-8222-222222222222';

describe('P6 restoration — return authority is explicit', () => {
  it('a non-subject actor cannot confer contextual return', () => {
    expect(() => memberConferredReturn('contextual_doorway', {
      actingMemberId: OTHER,
      subjectMemberId: MEMBER,
      gesture: 'set_return_preference',
    })).toThrow(ReturnAuthorityError);
  });

  it('no authorization resolves to member_pulled', () => {
    expect(returnPreferenceValue(noContextualReturn(
      'practitioner-authored observation has no member-conferred future-return authority',
    ))).toBe('member_pulled');
  });

  it('the brand cannot be named outside the boundary', () => {
    const src = read('lib/psyche/returnAuthority.ts');
    expect(src).toMatch(/declare const RETURN_AUTHORITY_BRAND: unique symbol/);
    expect(src).not.toMatch(/export\s+(?:declare\s+)?const\s+RETURN_AUTHORITY_BRAND/);
  });

  it('member keep and member return-preference gestures bind through the authority boundary', () => {
    const src = read('lib/psyche/portfolio.ts');
    expect(src).toMatch(/memberConferredReturn\(\s*'contextual_doorway'/);
    expect(src).toMatch(/returnPreferenceValue\(keepReturnAuthority\)/);
    expect(src).toMatch(/gesture:\s*'set_return_preference'/);
    expect(src).toMatch(/returnPreferenceValue\(authorized\)/);
  });

  it('the practitioner writer cannot mint contextual return', () => {
    const src = read('app/api/studio/with-me/sessions/[sessionId]/route.ts');
    const executable = src
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/^\s*\/\/.*$/gm, '');
    expect(executable).not.toMatch(/'observed',\s*'active',\s*'contextual_doorway'/);
    expect(src).toMatch(/noContextualReturn\(/);
    expect(src).toMatch(/returnPreferenceValue\(practitionerReturnAuthority\)/);
  });

  it('the migration fails closed without rewriting authorship', () => {
    const mig = read('database/migrations/20260903000001_return_authority_fail_closed.sql');
    expect(mig).toMatch(/ALTER COLUMN return_preference SET DEFAULT 'member_pulled'/);
    expect(mig).toMatch(/source_type = 'practitioner_observation'/);
    expect(mig).toMatch(/generated_by = 'practitioner-observation'/);
    expect(mig).toMatch(/return_preference = 'contextual_doorway'/);
    const setClause = /UPDATE member_memory_atoms\s+SET([\s\S]*?)WHERE/i.exec(mig)?.[1] ?? '';
    expect(setClause).toMatch(/return_preference\s*=\s*'member_pulled'/);
    expect(setClause).not.toMatch(/source_type|facilitator_id|generated_by|epistemological_status|provenance/);
  });
});
