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
  });

  /**
   * Superseding ruling (Kelly, 2026-07-28): Decisions is a practitioner
   * capability and is not part of the member House grammar at all — including
   * for a practitioner who is using the member House. The 2026-07-27 design
   * gated it to 'founder'; that is superseded. The distinction is drawn by
   * SURFACE, not identity. Ruling recorded in PR #785 (Supersession section); no repo canon doc records it yet — do not cite one.
   *
   * This is the invariant, not a visibility preference: no audience receives a
   * 'decisions' destination from the member House registry.
   */
  it('no audience receives a decisions destination from the member House', () => {
    expect(getHouseDestinations(false).map((d) => d.id)).not.toContain('decisions');
    expect(getHouseDestinations(true).map((d) => d.id)).not.toContain('decisions');
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

  it('the reconciled PR-2 rooms are native on both platforms (beta-bundle expansion)', () => {
    // These four were nativeReady:false ("hidden on native until reconciled").
    // The reconciliation arrived 2026-07-28: the beta-bundle expansion
    // (c718c27e4) ships /maia/* in the native bundle, and the flags now say
    // so. Native FUNCTIONALITY of each room is verified by the integrated
    // device walk (#757) — if a room misbehaves natively, that walk is where
    // it shows, and the fix is the room, not re-hiding it.
    expect(classifyReachability(find('ideas'), true)).toBe('native');
    expect(classifyReachability(find('ideas'), false)).toBe('native');
    expect(classifyReachability(find('living-field'), true)).toBe('native');
    expect(classifyReachability(find('anchor'), true)).toBe('native');
    expect(classifyReachability(find('keeps'), true)).toBe('native');
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

  it('Studio is interim → /press/manuscript, bridged on native', () => {
    expect(find('studio').interim).toBe(true);
    expect(find('studio').route).toBe('/press/manuscript');
    const h = harness(true);
    dispatchHouseDestination(find('studio'), h.ctx);
    expect(h.pushed).toEqual(['/open-web?to=%2Fpress%2Fmanuscript']);
  });

  it('Studio does NOT point at /studio (the practitioner Pro Studio)', () => {
    expect(find('studio').route).not.toBe('/studio');
  });
});

describe('visibleInGroup — no broken buttons on native', () => {
  it('shows Ideas on both platforms — the withhold ended with the reconciliation', () => {
    // Was: withheld on native "until reconciled". Reconciled 2026-07-28: the
    // beta-bundle expansion ships the /maia/* rooms natively and the registry
    // flags agree. Native functionality is the integrated walk's to verify.
    const member = getHouseDestinations(false);
    expect(visibleInGroup(member, 'work', false).map((d) => d.id)).toContain('ideas');
    expect(visibleInGroup(member, 'work', true).map((d) => d.id)).toContain('ideas');
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
