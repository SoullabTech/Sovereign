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

  // Founder direction 2026-08-16 (beta): Pro Studio's door is open to every
  // member, superseding its 'founder' gate. This asserts DISCOVERABILITY, not
  // authorization — /studio sends a non-practitioner to /studio/create, and the
  // server-gate question the entry's comment records stays open.
  it('Pro Studio reaches every member during beta', () => {
    expect(getHouseDestinations(false).map((d) => d.id)).toContain('pro-studio');
    expect(getHouseDestinations(true).map((d) => d.id)).toContain('pro-studio');
  });

  it('shows practitioner/steward-only destinations to founders/practitioners', () => {
    const ids = getHouseDestinations(true).map((d) => d.id);
    expect(ids).toContain('changes');
    expect(ids).toContain('circles');
    expect(ids).toContain('vision-studio');
    expect(ids).toContain('pro-studio');
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

  // These once used 'astrology' as the web-policy exemplar. Astrology became a
  // nativePolicy:'native' room (its entry records why — bridging it out to
  // Safari landed the member in the Journey threshold), so the assertions were
  // asserting the registry's old shape rather than the dispatch rule. Wisdom is
  // the exemplar now: a genuinely web-policy room with a nested path, so the
  // bridge's encoding is exercised too.
  it('web-policy routes are "web" on both platforms (dispatch decides the bridge)', () => {
    expect(classifyReachability(find('wisdom'), true)).toBe('web');
    expect(classifyReachability(find('wisdom'), false)).toBe('web');
    expect(classifyReachability(find('studio'), true)).toBe('web');
  });

  it('native-ready routes are "native" on both platforms', () => {
    expect(classifyReachability(find('journal'), true)).toBe('native');
    expect(classifyReachability(find('settings'), true)).toBe('native');
    // Astrology is a native room, not a Safari bridge — the correction the two
    // stale web-policy assertions above used to contradict.
    expect(classifyReachability(find('astrology'), true)).toBe('native');
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
    dispatchHouseDestination(find('wisdom'), h.ctx);
    expect(h.pushed).toEqual(['/open-web?to=%2Fwisdom-keepers%2Fwisdom']);
  });

  it('web-policy route pushes directly on web', () => {
    const h = harness(false);
    dispatchHouseDestination(find('wisdom'), h.ctx);
    expect(h.pushed).toEqual(['/wisdom-keepers/wisdom']);
  });

  // The other half of the same correction: on native, a native-ready room is
  // pushed in-app rather than handed to the bridge.
  it('native-ready Astrology pushes in-app on native, never through the bridge', () => {
    const h = harness(true);
    dispatchHouseDestination(find('astrology'), h.ctx);
    expect(h.pushed).toEqual(['/astrology']);
  });

  it('sheet destination opens the existing sheet with no navigation', () => {
    const h = harness(false);
    dispatchHouseDestination(find('changes'), h.ctx);
    expect(h.sheets).toEqual(['changes']);
    expect(h.pushed).toEqual([]);
  });

  it("Studio enters the Writer's Studio environment, bridged on native", () => {
    expect(find('studio').interim).toBe(true);
    expect(find('studio').route).toBe('/writers-studio');
    const h = harness(true);
    dispatchHouseDestination(find('studio'), h.ctx);
    expect(h.pushed).toEqual(['/open-web?to=%2Fwriters-studio']);
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

  it('Pro Studio enters /studio, bridged on native', () => {
    expect(find('pro-studio').route).toBe('/studio');
    const h = harness(true);
    dispatchHouseDestination(find('pro-studio'), h.ctx);
    expect(h.pushed).toEqual(['/open-web?to=%2Fstudio']);
  });

  // Founder direction (Kelly, 2026-08-04): Pro Studio sits FIRST in Rooms, and
  // Community Library is no longer a House door (the route itself is untouched
  // — its disposition is 'intentionally_withheld' in houseDispositions).
  it('Pro Studio is the first Room', () => {
    const rooms = HOUSE_DESTINATIONS.filter((d) => d.group === 'rooms');
    expect(rooms[0]?.id).toBe('pro-studio');
  });

  it('Community Library has no House door', () => {
    expect(HOUSE_DESTINATIONS.some((d) => d.id === 'community-library')).toBe(false);
  });
});

/**
 * RULING (Kelly, 2026-08-04): "Studio is one threshold. Mode is revealed after
 * entry." docs/governance/HOUSE_IA_RULING_STUDIO_ONE_THRESHOLD_2026-08-04.md
 *
 * These are the enforcing mechanism for that ruling, not a description of it.
 * The failure they guard is a plausible, tidy-looking refactor: registering
 * Personal Field and Practice Portal as two Rooms so each "has its own door".
 * That asserts the person has two workspaces. They have one, entered in
 * different relational contexts. The House reveals a place; it must not expose
 * the object model underneath it.
 */
describe('Studio is ONE threshold — mode is not an address', () => {
  const all = HOUSE_DESTINATIONS.filter((d) => d.kind === 'route');

  it('exactly one House destination opens /studio', () => {
    const doors = all.filter((d) => d.route === '/studio' || d.route?.startsWith('/studio?'));
    expect(doors.map((d) => d.id)).toEqual(['pro-studio']);
  });

  it('no destination encodes a studio MODE in its route', () => {
    // Personal Field / Practice Portal are StudioMode values (see MODE_CONFIG in
    // components/studio/TeamSwitcher.tsx), never navigation targets.
    for (const d of all) {
      expect(d.route).not.toMatch(/[?&]mode=/);
    }
  });

  it('no destination is LABELLED as a studio mode', () => {
    const labels = HOUSE_DESTINATIONS.map((d) => d.label);
    expect(labels).not.toContain('Personal Field');
    expect(labels).not.toContain('Practice Portal');
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
