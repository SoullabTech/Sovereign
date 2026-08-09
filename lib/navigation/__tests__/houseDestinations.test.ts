/**
 * House navigation contract — action dispatch, audience filtering, reachability.
 *
 * The House's failure mode was that its render, the runtime allowlist, and the
 * native bundle disagreed. These lock the render/dispatch half of the contract;
 * houseNavDrift.test.ts locks the reconciliation half.
 */
import {
  HOUSE_DESTINATIONS,
  getHouseDestinations,
  classifyReachability,
  dispatchHouseDestination,
  visibleInGroup,
  webBridgePath,
  WEB_BRIDGE_ROUTE,
  type HouseDestination,
  type HouseSheetId,
} from '../houseDestinations';

function find(id: string): HouseDestination {
  const d = HOUSE_DESTINATIONS.find((x) => x.id === id);
  if (!d) throw new Error(`no destination ${id}`);
  return d;
}

function harness(isNative: boolean) {
  const pushed: string[] = [];
  const sheets: HouseSheetId[] = [];
  let closed = 0;
  const ctx = {
    isNative,
    push: (p: string) => pushed.push(p),
    openSheet: (s: HouseSheetId) => sheets.push(s),
    onClose: () => {
      closed += 1;
    },
  };
  return { pushed, sheets, get closed() { return closed; }, ctx };
}

describe('getHouseDestinations — audience filtering', () => {
  it('Changes is member-owned and reaches members', () => {
    const member = getHouseDestinations(false).map((d) => d.id);
    expect(member).toContain('changes'); // member-owned (/api/changes is member-scoped)
    // Other practitioner/steward rooms still hidden from members.
    expect(member).not.toContain('circles');
    expect(member).not.toContain('vision-studio');
    expect(member).toContain('ideas');
    expect(member).toContain('studio');
  });

  it('shows practitioner/steward-only destinations to founders/practitioners', () => {
    const ids = getHouseDestinations(true).map((d) => d.id);
    expect(ids).toContain('changes');
    expect(ids).toContain('circles');
    expect(ids).toContain('vision-studio');
    expect(ids).toContain('studio-decisions'); // founder ruling 2026-08-09
  });

  /**
   * Decisions — two rulings, both still in force, and they are about DIFFERENT
   * surfaces. Do not collapse them.
   *
   * 1. Kelly, 2026-07-28 (unchanged): the MEMBER decisions capability is not
   *    part of the member House grammar at all — for any audience, including a
   *    practitioner using the member House. The distinction is drawn by
   *    SURFACE, not identity. Recorded in PR #785 (Supersession section); no
   *    repo canon doc records it yet — do not cite one.
   * 2. Kelly, 2026-08-09: the PRACTITIONER surface /studio/decisions IS
   *    reachable from the House as a PRACTITIONER room — a web bridge into the
   *    Pro Studio environment, not a member capability rendered inside the
   *    member grammar. A refinement of scope, not a reversal of (1).
   *
   * So: no destination opens the member decisions sheet, and the only decisions
   * route in the registry is the practitioner one, owned by the practitioner
   * surface. (It is withheld from members by the same steward boolean that
   * withholds the founder rooms — see the conflation note below.)
   */
  it('no audience receives the member decisions capability from the House', () => {
    expect(getHouseDestinations(false).map((d) => d.id)).not.toContain('decisions');
    expect(getHouseDestinations(true).map((d) => d.id)).not.toContain('decisions');
  });

  it('members do not receive the practitioner decisions room', () => {
    expect(getHouseDestinations(false).map((d) => d.id)).not.toContain('studio-decisions');
  });

  it('the only decisions route in the registry is the practitioner surface', () => {
    const decisionRoutes = HOUSE_DESTINATIONS.filter((d) => d.route?.includes('decisions')).map(
      (d) => d.route,
    );
    expect(decisionRoutes).toEqual(['/studio/decisions']);
  });

  /**
   * The audience is named after the SURFACE that governs the route, not after
   * whoever can currently see it. /studio/decisions is gated by practitioner
   * identity end to end — app/studio/layout.tsx redirects a non-practitioner
   * via /api/studio/whoami, and /api/studio/decisions 401s without
   * getCurrentPractitioner(). Neither consults founder/admin, so labelling this
   * room 'founder' would encode the wrong owner even though the route works.
   */
  it('the Decisions room is owned by the practitioner surface', () => {
    expect(find('studio-decisions').audience).toBe('practitioner');
  });

  /**
   * Honest record of a conflation, so a later split is a deliberate act rather
   * than a surprise: the House gets ONE boolean (MaiaShell passes
   * `isAdmin || isPractitioner`), so 'founder' and 'practitioner' resolve
   * identically today. If this test ever fails because the signals were split,
   * that is the follow-up landing — re-check Circles and Vision Studio too.
   */
  it('founder and practitioner audiences gate identically under the single steward boolean', () => {
    const steward = getHouseDestinations(true).map((d) => d.id);
    const member = getHouseDestinations(false).map((d) => d.id);
    for (const d of HOUSE_DESTINATIONS.filter((x) => x.audience !== 'all')) {
      expect(steward).toContain(d.id);
      expect(member).not.toContain(d.id);
    }
  });
});

describe('classifyReachability', () => {
  it('sheets are always "sheet"', () => {
    expect(classifyReachability(find('changes'), false)).toBe('sheet');
  });

  it('web-policy routes are "web" on both platforms (dispatch decides the bridge)', () => {
    expect(classifyReachability(find('astrology'), true)).toBe('web');
    expect(classifyReachability(find('astrology'), false)).toBe('web');
    expect(classifyReachability(find('studio'), true)).toBe('web');
  });

  it('native-ready routes are "native" on both platforms', () => {
    expect(classifyReachability(find('journal'), true)).toBe('native');
    expect(classifyReachability(find('settings'), true)).toBe('native');
  });

  it('native-not-ready rooms are hidden on native, native on web', () => {
    expect(classifyReachability(find('ideas'), true)).toBe('hidden');
    expect(classifyReachability(find('ideas'), false)).toBe('native');
    expect(classifyReachability(find('living-field'), true)).toBe('hidden');
    expect(classifyReachability(find('anchor'), true)).toBe('hidden');
    expect(classifyReachability(find('keeps'), true)).toBe('hidden');
  });
});

describe('dispatchHouseDestination', () => {
  it('closes the House before acting', () => {
    const h = harness(false);
    dispatchHouseDestination(find('journal'), h.ctx);
    expect(h.closed).toBe(1);
  });

  it('native-ready route pushes the route in-app (native)', () => {
    const h = harness(true);
    dispatchHouseDestination(find('journal'), h.ctx);
    expect(h.pushed).toEqual(['/journal']);
    expect(h.sheets).toEqual([]);
  });

  it('web-policy route bridges to /open-web on native', () => {
    const h = harness(true);
    dispatchHouseDestination(find('astrology'), h.ctx);
    expect(h.pushed).toEqual(['/open-web?to=%2Fastrology']);
  });

  it('web-policy route pushes directly on web', () => {
    const h = harness(false);
    dispatchHouseDestination(find('astrology'), h.ctx);
    expect(h.pushed).toEqual(['/astrology']);
  });

  it('sheet destination opens the existing sheet with no navigation', () => {
    const h = harness(false);
    dispatchHouseDestination(find('changes'), h.ctx);
    expect(h.sheets).toEqual(['changes']);
    expect(h.pushed).toEqual([]);
  });

  it('Studio enters the Author Studio environment, bridged on native', () => {
    expect(find('studio').interim).toBe(true);
    expect(find('studio').route).toBe('/press/studio');
    const h = harness(true);
    dispatchHouseDestination(find('studio'), h.ctx);
    expect(h.pushed).toEqual(['/open-web?to=%2Fpress%2Fstudio']);
  });

  // The regression this guards: until 2026-07-30 the House opened straight onto
  // /press/manuscript — a working surface — so the member landed on an upload
  // textarea with no Studio around it and asked "where is the rest of it?".
  // The House must enter Layer 2 (the environment), never Layer 3 (the desk).
  it('Studio does NOT enter a working surface directly', () => {
    expect(find('studio').route).not.toBe('/press/manuscript');
  });

  it('Studio does NOT point at /studio (the practitioner Pro Studio)', () => {
    expect(find('studio').route).not.toBe('/studio');
  });
});

describe('visibleInGroup — no broken buttons on native', () => {
  it('shows Ideas on web but withholds it on native until reconciled', () => {
    const member = getHouseDestinations(false);
    expect(visibleInGroup(member, 'work', false).map((d) => d.id)).toContain('ideas');
    expect(visibleInGroup(member, 'work', true).map((d) => d.id)).not.toContain('ideas');
  });

  it('Changes shows on native for members and practitioners alike; Decisions for neither', () => {
    const memberWork = visibleInGroup(getHouseDestinations(false), 'work', true).map((d) => d.id);
    expect(memberWork).toContain('changes'); // member-owned
    expect(memberWork).not.toContain('decisions');
    const founderWork = visibleInGroup(getHouseDestinations(true), 'work', true).map((d) => d.id);
    expect(founderWork).toContain('changes');
    expect(founderWork).not.toContain('decisions'); // not in the member House grammar
  });
});

describe('webBridgePath', () => {
  it('builds off WEB_BRIDGE_ROUTE and forwards the destination as an encoded ?to=', () => {
    expect(webBridgePath('/press/manuscript')).toBe('/open-web?to=%2Fpress%2Fmanuscript');
    expect(webBridgePath('/astrology').startsWith(`${WEB_BRIDGE_ROUTE}?to=`)).toBe(true);
    // the target survives round-trip decoding
    const to = new URLSearchParams(webBridgePath('/wisdom-keepers/wisdom').split('?')[1]).get('to');
    expect(to).toBe('/wisdom-keepers/wisdom');
  });
});

describe('journal route correction', () => {
  it('uses the native-bundled /journal, not founder-gated /labtools/journal', () => {
    expect(find('journal').route).toBe('/journal');
  });
});
