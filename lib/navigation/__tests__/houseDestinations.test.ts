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
  it('hides founder/steward-only destinations from ordinary members', () => {
    const ids = getHouseDestinations(false).map((d) => d.id);
    expect(ids).not.toContain('circles');
    expect(ids).not.toContain('vision-studio');
    // Decisions/Changes are governance surfaces — founder/steward only.
    expect(ids).not.toContain('decisions');
    expect(ids).not.toContain('changes');
    expect(ids).toContain('ideas');
    expect(ids).toContain('studio');
  });

  it('shows founder/steward-only destinations to founders', () => {
    const ids = getHouseDestinations(true).map((d) => d.id);
    expect(ids).toContain('circles');
    expect(ids).toContain('vision-studio');
    expect(ids).toContain('decisions');
    expect(ids).toContain('changes');
  });
});

describe('classifyReachability', () => {
  it('sheets are always "sheet"', () => {
    expect(classifyReachability(find('decisions'), true)).toBe('sheet');
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
    dispatchHouseDestination(find('decisions'), h.ctx);
    expect(h.sheets).toEqual(['decisions']);
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
  it('shows Ideas on web but withholds it on native until reconciled', () => {
    const member = getHouseDestinations(false);
    expect(visibleInGroup(member, 'work', false).map((d) => d.id)).toContain('ideas');
    expect(visibleInGroup(member, 'work', true).map((d) => d.id)).not.toContain('ideas');
  });

  it('founder sheets remain visible on native; ordinary members never see them', () => {
    const founderWork = visibleInGroup(getHouseDestinations(true), 'work', true).map((d) => d.id);
    expect(founderWork).toContain('decisions');
    expect(founderWork).toContain('changes');
    const memberWork = visibleInGroup(getHouseDestinations(false), 'work', true).map((d) => d.id);
    expect(memberWork).not.toContain('decisions');
    expect(memberWork).not.toContain('changes');
  });
});

describe('webBridgePath', () => {
  it('encodes the destination route', () => {
    expect(webBridgePath('/press/manuscript')).toBe('/open-web?to=%2Fpress%2Fmanuscript');
  });
});

describe('journal route correction', () => {
  it('uses the native-bundled /journal, not founder-gated /labtools/journal', () => {
    expect(find('journal').route).toBe('/journal');
  });
});
