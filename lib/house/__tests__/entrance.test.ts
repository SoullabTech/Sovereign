import { resolvePersonalPortalEntrance, resolveProStudioEntrance, type EntranceFacts } from '../entrance';

const member = (over: Partial<EntranceFacts> = {}): EntranceFacts => ({
  signedIn: true,
  proStudioEntitlement: 'absent',
  ...over,
});

describe('House entrances — fictional members', () => {
  test('signed-out visitor gets an honest intro for both doors', () => {
    const f = member({ signedIn: false });
    expect(resolveProStudioEntrance(f)).toBe('signed_out_intro');
    expect(resolvePersonalPortalEntrance(f)).toBe('signed_out_intro');
  });

  test('signed-in member with no paid entitlement: limited try, and a personal space', () => {
    const f = member();
    expect(resolveProStudioEntrance(f)).toBe('limited_try');
    expect(resolvePersonalPortalEntrance(f)).toBe('personal_space');
  });

  test('verified Pro Studio entitlement opens the full workspace; personal space stays independent', () => {
    const f = member({ proStudioEntitlement: 'verified' });
    expect(resolveProStudioEntrance(f)).toBe('full_workspace');
    expect(resolvePersonalPortalEntrance(f)).toBe('personal_space');
  });

  test('a practitioner row is NOT a paid entitlement', () => {
    expect(resolveProStudioEntrance(member({ hasPractitionerRow: true }))).toBe('limited_try');
  });

  test('studioMode is NOT a paid entitlement, in either mode', () => {
    expect(resolveProStudioEntrance(member({ studioMode: 'practice' }))).toBe('limited_try');
    expect(resolveProStudioEntrance(member({ studioMode: 'personal' }))).toBe('limited_try');
  });

  test('Personal Portal never depends on Pro Studio or practitioner status', () => {
    for (const over of [{}, { hasPractitionerRow: true }, { studioMode: 'practice' as const }, { proStudioEntitlement: 'verified' as const }]) {
      expect(resolvePersonalPortalEntrance(member(over))).toBe('personal_space');
    }
  });

  test('no signed-out visitor ever reaches a workspace, even with a verified entitlement flag', () => {
    const f = member({ signedIn: false, proStudioEntitlement: 'verified', hasPractitionerRow: true });
    expect(resolveProStudioEntrance(f)).toBe('signed_out_intro');
    expect(resolvePersonalPortalEntrance(f)).toBe('signed_out_intro');
  });
});
