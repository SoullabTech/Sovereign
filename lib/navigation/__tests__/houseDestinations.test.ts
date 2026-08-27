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

/**
 * Exemplars are DERIVED, never named by hand.
 *
 * WHY (MLX-06 Unit 5A). These tests used to assert against `find('astrology')`
 * as *the* web-policy route. On 2026-08-17 the registry deliberately reclassified
 * /astrology from a Safari bridge to a native room — House → Astrology on a
 * physical iPhone had been opening soullab.life and landing on the Journey
 * threshold, a different room presented as Astrology, while native Settings
 * already showed the member's correct birth data. The fix was right; the guard
 * still named astrology as its web exemplar, so this suite went red and stayed
 * red for weeks.
 *
 * A hand-named exemplar rots the moment a destination legitimately changes
 * policy. Deriving the set means a reclassified destination leaves one group and
 * joins the other, and the contract keeps being enforced on both — for every
 * destination, not just the one someone happened to name.
 */
const webPolicy = HOUSE_DESTINATIONS.filter(
  (d) => d.kind === 'route' && d.nativePolicy === 'web' && d.route,
);
const nativeReady = HOUSE_DESTINATIONS.filter(
  (d) => d.kind === 'route' && d.nativePolicy === 'native' && d.nativeReady && d.route,
);

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

  it('web-policy routes are "web" on both platforms (dispatch decides the bridge)', () => {
    expect(webPolicy.length).toBeGreaterThan(0);
    for (const d of webPolicy) {
      expect(classifyReachability(d, true)).toBe('web');
      expect(classifyReachability(d, false)).toBe('web');
    }
  });

  it('native-ready routes are "native" on both platforms', () => {
    expect(nativeReady.length).toBeGreaterThan(0);
    for (const d of nativeReady) {
      expect(classifyReachability(d, true)).toBe('native');
      expect(classifyReachability(d, false)).toBe('native');
    }
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
    expect(webPolicy.length).toBeGreaterThan(0);
    for (const d of webPolicy) {
      const h = harness(true);
      dispatchHouseDestination(d, h.ctx);
      expect(h.pushed).toEqual([webBridgePath(d.route as string)]);
      expect(h.pushed[0]).toContain(WEB_BRIDGE_ROUTE);
    }
  });

  it('web-policy route pushes directly on web', () => {
    expect(webPolicy.length).toBeGreaterThan(0);
    for (const d of webPolicy) {
      const h = harness(false);
      dispatchHouseDestination(d, h.ctx);
      expect(h.pushed).toEqual([d.route]);
    }
  });

  it('native-ready route never bridges, on either platform', () => {
    for (const d of nativeReady) {
      for (const isNative of [true, false]) {
        const h = harness(isNative);
        dispatchHouseDestination(d, h.ctx);
        expect(h.pushed).toEqual([d.route]);
        expect(h.pushed[0]).not.toContain(WEB_BRIDGE_ROUTE);
      }
    }
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
    expect(webBridgePath('/writers-studio').startsWith(`${WEB_BRIDGE_ROUTE}?to=`)).toBe(true);
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

/**
 * MLX-06 Unit 5A. The ruling this suite failed to carry.
 *
 * Astrology is a NATIVE ROOM, not a Safari bridge (2ef2d40, 2026-08-17, from a
 * physical-device observation). Bridging it out sent the member to
 * soullab.life and landed them on the Journey threshold — a different room
 * wearing Astrology's name — while native Settings already showed their correct
 * birth data. One product surface on PWA and iOS.
 *
 * `nativeReady: true` is not a claim this file verifies: houseNavDrift.test.ts
 * derives the same set from this registry and asserts each route is present in
 * BOTH the runtime allowlist (lib/mobile/mobileAllowlist) and the Capacitor
 * keep-list (capacitor-patch-routes.sh MOBILE_TOP_LEVEL). What this locks is
 * the routing decision that sat on top of it.
 */
describe('Astrology is a native room, not a Safari bridge', () => {
  const astrology = () => find('astrology');

  it('is declared a reconciled native route', () => {
    expect(astrology().nativePolicy).toBe('native');
    expect(astrology().nativeReady).toBe(true);
    expect(astrology().route).toBe('/astrology');
  });

  it('returns to MAIA rather than out through the web bridge', () => {
    expect(astrology().returnBehavior).toBe('back-to-maia');
  });

  it('opens in-app on native — never soullab.life in Safari', () => {
    const h = harness(true);
    dispatchHouseDestination(astrology(), h.ctx);
    expect(h.pushed).toEqual(['/astrology']);
    expect(h.pushed[0]).not.toContain(WEB_BRIDGE_ROUTE);
  });

  it('is the same door on web', () => {
    const h = harness(false);
    dispatchHouseDestination(astrology(), h.ctx);
    expect(h.pushed).toEqual(['/astrology']);
  });

  it('is visible in Rooms on both platforms — never hidden', () => {
    for (const isNative of [true, false]) {
      expect(classifyReachability(astrology(), isNative)).toBe('native');
      expect(visibleInGroup(HOUSE_DESTINATIONS, 'rooms', isNative).map((d) => d.id))
        .toContain('astrology');
    }
  });

  it('is the only House door to /astrology — no second route', () => {
    expect(HOUSE_DESTINATIONS.filter((d) => d.route === '/astrology')).toHaveLength(1);
  });
});

/**
 * The class of defect, not the instance: no destination may carry a transport
 * declaration that contradicts itself, and no route may be declared reachable
 * in-app without saying so explicitly.
 */
describe('no destination contradicts its own transport', () => {
  it('never declares nativeReady on a web-policy route', () => {
    for (const d of webPolicy) expect(d.nativeReady).toBeUndefined();
  });

  it('never routes a bridged destination back to MAIA, or a native room out the bridge', () => {
    for (const d of webPolicy) expect(d.returnBehavior).toBe('web-bridge');
    for (const d of nativeReady) expect(d.returnBehavior).not.toBe('web-bridge');
  });

  it('hard-codes no environment URL — every route is same-origin', () => {
    for (const d of HOUSE_DESTINATIONS) {
      if (d.kind === 'external') continue;
      if (!d.route) continue;
      expect(d.route.startsWith('/')).toBe(true);
      expect(d.route).not.toMatch(/^https?:|soullab\.life|localhost/);
    }
  });
});
