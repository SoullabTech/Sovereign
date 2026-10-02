import { readFileSync } from 'fs';
import { join } from 'path';
import { resolveMemberInitiatedSafetyDisclosureAuthority } from '../safetyDisclosureAuthority';

describe('SAFETY-DISCLOSURE-01 member-initiated authority law', () => {
  it('defaults to no disclosure authority', () => {
    expect(resolveMemberInitiatedSafetyDisclosureAuthority({})).toEqual({
      kind: 'none',
      basis: 'none',
      mayCross: false,
    });
  });

  it('permits only a present explicit member act as the currently executable basis', () => {
    expect(resolveMemberInitiatedSafetyDisclosureAuthority({
      memberAct: {
        explicit: true,
        presentTurn: true,
        recipient: 'practitioner',
        scope: 'current_message',
      },
    })).toEqual({
      kind: 'may_cross',
      basis: 'member_act',
      recipient: 'practitioner',
      scope: 'current_message',
      requiresDisclosureBoundary: true,
    });
  });

  it.each([
    'imminent_danger_exception',
    'legal_compulsion',
    'minor_or_vulnerable_adult',
  ] as const)('%s is review-required, never executable authority', (reviewBasis) => {
    expect(resolveMemberInitiatedSafetyDisclosureAuthority({ reviewBasis })).toEqual({
      kind: 'review_required',
      basis: reviewBasis,
      mayCross: false,
    });
  });

  it('member act is the only path inside this resolver that can return may_cross', () => {
    const candidates = [
      {},
      { reviewBasis: 'imminent_danger_exception' as const },
      { reviewBasis: 'legal_compulsion' as const },
      { reviewBasis: 'minor_or_vulnerable_adult' as const },
    ];

    for (const candidate of candidates) {
      expect(resolveMemberInitiatedSafetyDisclosureAuthority(candidate).kind).not.toBe('may_cross');
    }
  });

  it('is structurally independent of crisis severity and detection', () => {
    const src = readFileSync(
      join(process.cwd(), 'lib/safety/safetyDisclosureAuthority.ts'),
      'utf8',
    );

    expect(src).not.toMatch(/crisisRecognition|recognizeLiveCrisis|crisisLevel|severity|riskScore/i);
    expect(src).not.toMatch(/fetch\s*\(|sendAlert|sendEmail|resend|smtp|webhook/i);
    expect(src).not.toMatch(/database|postgres|prisma|supabase|query\s*\(/i);
  });

  it('cannot itself perform the crossing or recipient lookup', () => {
    const src = readFileSync(
      join(process.cwd(), 'lib/safety/safetyDisclosureAuthority.ts'),
      'utf8',
    );

    expect(src).not.toMatch(/establishDisclosureBoundary\s*\(/);
    expect(src).not.toMatch(/getPractitioner|findPractitioner|guardian|emergencyContact/i);
    expect(src).toContain('requiresDisclosureBoundary: true');
  });

  it('explicitly preserves canonical #1671 human-delivery authority outside this resolver', () => {
    const src = readFileSync(
      join(process.cwd(), 'lib/safety/safetyDisclosureAuthority.ts'),
      'utf8',
    );

    expect(src).toContain('#1671 human-safety delivery membrane');
    expect(src).toContain('does NOT model, supersede, disable, or authorize');
  });
});
