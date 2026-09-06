import {
  GOVERNED_ROOMS,
  FULL_CONVERSATION_ROUTES,
  resolveGovernedRoom,
  isFullConversationRoute,
  isMaiaHandleVisible,
  placeFromPathname,
  validatePlaceContext,
  buildPlaceAddendum,
} from '../place';

// House Presence (2026-07-17) — deterministic guards over the place layer:
// facts-only shape, strict validation, and the governed-room inventory.

describe('governed-room registry (Phase 8 inventory)', () => {
  it('every governed room has a valid placeId, name, route prefix, and purpose', () => {
    for (const room of GOVERNED_ROOMS) {
      expect(room.placeId).toMatch(/^[a-z][a-z0-9-]*$/);
      expect(room.placeName.trim().length).toBeGreaterThan(0);
      expect(room.routePrefix.startsWith('/')).toBe(true);
      expect(room.purpose.trim().length).toBeGreaterThan(0);
    }
  });

  it('placeIds are unique', () => {
    const ids = GOVERNED_ROOMS.map(r => r.placeId);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('every governed route resolves to its own room (longest prefix wins)', () => {
    expect(resolveGovernedRoom('/studio/decisions/abc-123')?.placeId).toBe('decisions');
    expect(resolveGovernedRoom('/studio/changes/xyz')?.placeId).toBe('changes');
    expect(resolveGovernedRoom('/studio')?.placeId).toBe('studio');
    expect(resolveGovernedRoom('/studio/session-room')?.placeId).toBe('session-room');
    expect(resolveGovernedRoom('/maia/ideas/42')?.placeId).toBe('ideas');
    expect(resolveGovernedRoom('/maia/moments')?.placeId).toBe('moments');
    expect(resolveGovernedRoom('/maia/anchor/history')?.placeId).toBe('anchor-history');
    expect(resolveGovernedRoom('/journal')?.placeId).toBe('journal');
    // Reflections: the feed and one kept reflection are the same governed room.
    // The room is governed so "Discuss this with MAIA" can open OVER the
    // reflection instead of navigating the member to /maia.
    expect(resolveGovernedRoom('/reflections')?.placeId).toBe('reflections');
    expect(resolveGovernedRoom('/reflections/dc5720b0-dff0-4111-a85d-b91503410c6f')?.placeId).toBe('reflections');
    expect(resolveGovernedRoom('/guides')?.placeId).toBe('guides');
    expect(resolveGovernedRoom('/soul-portrait/some-slug')?.placeId).toBe('soul-portrait');
    expect(resolveGovernedRoom('/home')?.placeId).toBe('home');
    expect(resolveGovernedRoom('/maia')?.placeId).toBe('maia');
  });

  it('ungoverned and isolated containers resolve to nothing', () => {
    // Now What? is founder-directed isolation — presence must not reach into it.
    expect(resolveGovernedRoom('/now-what')).toBeNull();
    expect(resolveGovernedRoom('/now-what/room')).toBeNull();
    // Public/auth/onboarding surfaces carry no member relationship.
    expect(resolveGovernedRoom('/')).toBeNull();
    expect(resolveGovernedRoom('/signin')).toBeNull();
    expect(resolveGovernedRoom('/begin')).toBeNull();
    // Practitioner admin surfaces are not member rooms.
    expect(resolveGovernedRoom('/labtools/guides')).toBeNull();
    expect(resolveGovernedRoom('/stellium')).toBeNull();
  });

  it('full conversation surfaces suppress the handle/sheet', () => {
    for (const route of FULL_CONVERSATION_ROUTES) {
      expect(isFullConversationRoute(route)).toBe(true);
    }
    // Sub-rooms of /maia are NOT full surfaces — the handle belongs there.
    expect(isFullConversationRoute('/maia/moments')).toBe(false);
    expect(isFullConversationRoute('/maia/ideas')).toBe(false);
  });
});

describe('placeFromPathname', () => {
  it('derives facts-only context from the registry', () => {
    const place = placeFromPathname('/studio/decisions/abc');
    expect(place).toEqual({
      placeId: 'decisions',
      placeName: 'Decisions',
      route: '/studio/decisions/abc',
      purpose: 'A room for naming and reflecting on decisions.',
    });
  });

  it('returns null off governed rooms', () => {
    expect(placeFromPathname('/now-what/field')).toBeNull();
  });
});

describe('validatePlaceContext (server-side gate)', () => {
  const valid = {
    placeId: 'decisions',
    placeName: 'Decisions',
    route: '/studio/decisions',
    purpose: 'A room for naming and reflecting on decisions.',
  };

  it('accepts a well-formed place and strips unknown fields', () => {
    const out = validatePlaceContext({ ...valid, dwellTimeMs: 91234, clicks: ['a', 'b'] });
    expect(out).not.toBeNull();
    expect(out).toEqual(expect.objectContaining(valid));
    // Behavioral fields must never survive validation.
    expect(out as any).not.toHaveProperty('dwellTimeMs');
    expect(out as any).not.toHaveProperty('clicks');
  });

  it('rejects garbage, missing required fields, and non-path routes', () => {
    expect(validatePlaceContext(null)).toBeNull();
    expect(validatePlaceContext('decisions')).toBeNull();
    expect(validatePlaceContext({})).toBeNull();
    expect(validatePlaceContext({ placeId: 'x', placeName: 'X' })).toBeNull();
    expect(validatePlaceContext({ ...valid, route: 'http://evil.example' })).toBeNull();
  });

  it('caps field lengths', () => {
    expect(validatePlaceContext({ ...valid, placeId: 'x'.repeat(500) })).toBeNull();
  });
});

describe('buildPlaceAddendum (facts-only prompt block)', () => {
  const place = validatePlaceContext({
    placeId: 'decisions',
    placeName: 'Decisions',
    route: '/studio/decisions/abc',
    purpose: 'A room for naming and reflecting on decisions.',
    objectType: 'decision',
    objectId: 'abc',
  })!;

  it('states the present-tense fact and the room purpose', () => {
    const block = buildPlaceAddendum(place);
    expect(block).toContain('PLACE');
    expect(block).toContain('Decisions');
    expect(block).toContain('/studio/decisions/abc');
    expect(block).toContain('naming and reflecting on decisions');
  });

  it('forbids inference explicitly and never claims content knowledge', () => {
    const block = buildPlaceAddendum(place);
    expect(block).toContain('do NOT know why');
    expect(block).toContain('never infer');
    expect(block).toContain('not its contents');
    // Never present behavioral claims.
    expect(block.toLowerCase()).not.toContain('you seem');
    expect(block.toLowerCase()).not.toContain('dwell');
  });
});

// ── Handle visibility ────────────────────────────────────────────────────────
// Eligibility and affordance are separate concepts (founder ruling 2026-09-04):
// a room may be fully MAIA-capable without every surface in it advertising
// MAIA. These pin that they cannot collapse back into one boolean.

// ACCEPTANCE NUMBERING: the presence programme numbers its acceptance cases in
// ONE space shared with injection.test.ts — not per file. This case was authored
// as 4 when injection.test.ts held 1-3; it is 6 now that injection.test.ts holds
// 1-5. Before adding a case here or there, grep both files for the next free
// number. (A second ACCEPTANCE 4 landed in injection.test.ts on 2026-09-05
// precisely because the shared space is invisible from inside one file.)
describe('isMaiaHandleVisible (affordance, not eligibility)', () => {
  const reflection = {
    placeId: 'reflections',
    placeName: 'Reflections',
    route: '/reflections/dc5720b0-dff0-4111-a85d-b91503410c6f',
    objectType: 'reflection',
    objectId: 'dc5720b0-dff0-4111-a85d-b91503410c6f',
  };

  it('ACCEPTANCE 6: the reflections feed offers no handle; one open reflection does', () => {
    // Feed — governed (MAIA may be hosted) but nothing particular in view, so
    // an unprompted handle would claim general presence rather than "discuss
    // THIS". No object registered, and none derivable from the route.
    expect(resolveGovernedRoom('/reflections')?.placeId).toBe('reflections');
    expect(isMaiaHandleVisible('/reflections', placeFromPathname('/reflections'))).toBe(false);

    // Detail — a specific kept reflection is open and is the referent.
    expect(isMaiaHandleVisible(reflection.route, reflection)).toBe(true);
  });

  it('an object-scoped room stays quiet until an object is actually open', () => {
    // Registered place, but incomplete: type without id, or id without type,
    // is not a referent.
    expect(isMaiaHandleVisible(reflection.route, { ...reflection, objectId: undefined })).toBe(false);
    expect(isMaiaHandleVisible(reflection.route, { ...reflection, objectType: undefined })).toBe(false);
    expect(isMaiaHandleVisible(reflection.route, null)).toBe(false);
  });

  it('room-scoped rooms are unchanged — they advertise across the room', () => {
    expect(isMaiaHandleVisible('/journal', placeFromPathname('/journal'))).toBe(true);
    expect(isMaiaHandleVisible('/studio/decisions', placeFromPathname('/studio/decisions'))).toBe(true);
    expect(isMaiaHandleVisible('/home', placeFromPathname('/home'))).toBe(true);
  });

  it('never widens eligibility: ungoverned routes and full surfaces stay false', () => {
    // A registered place cannot buy a handle on a route the registry does not
    // govern — visibility is always narrower than permission, never broader.
    expect(isMaiaHandleVisible('/now-what', { ...reflection, route: '/now-what' })).toBe(false);
    expect(isMaiaHandleVisible('/signin', { ...reflection, route: '/signin' })).toBe(false);
    for (const route of FULL_CONVERSATION_ROUTES) {
      expect(isMaiaHandleVisible(route, placeFromPathname(route))).toBe(false);
    }
  });

  it('handleVisibility is a closed vocabulary', () => {
    for (const room of GOVERNED_ROOMS) {
      if (room.handleVisibility !== undefined) {
        expect(['room', 'object']).toContain(room.handleVisibility);
      }
    }
  });
});
