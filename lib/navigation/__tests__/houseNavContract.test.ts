/**
 * House navigation contract (PR 1) — route classification, native dispatch, and
 * audience filtering for The House sheet.
 *
 * These assert the pure logic behind MaiaHouseSheet's dispatch:
 *   - isNativeBundled(route) decides in-app router.push vs /open-web bridge.
 *   - getVisibleRecord / getHousePlaces enforce audience gating and grouping.
 *
 * The classifier mirrors scripts/capacitor-patch-routes.sh; if that allowlist
 * changes, these tests are the tripwire.
 */

import {
  isNativeBundled,
  getHousePlaces,
  getVisibleRecord,
  getVisibleBoundaries,
  MAIA_RECORD,
  DECISIONS_RAIL_ITEM,
  CHANGES_RAIL_ITEM,
} from '@/lib/navigation/maiaNav';

describe('isNativeBundled — mirrors the native static-export allowlist', () => {
  it('bundles routes that survive the native build', () => {
    expect(isNativeBundled('/maia')).toBe(true);
    expect(isNativeBundled('/labtools/journal')).toBe(true);
    expect(isNativeBundled('/account/settings')).toBe(true);
  });

  it('treats every /maia/* sub-route as web-only (MOBILE_MAIA_KEEP empty in PR 1)', () => {
    for (const r of [
      '/maia/anchor',
      '/maia/ideas',
      '/maia/keep-capture',
      '/maia/living-field',
      '/maia/community/library',
      '/maia/vision-studio',
    ]) {
      expect(isNativeBundled(r)).toBe(false);
    }
  });

  it('treats non-allowlisted top-level roots as web-only', () => {
    for (const r of [
      '/studio',
      '/studio/decisions',
      '/studio/changes',
      '/wisdom-keepers/wisdom',
      '/astrology',
      '/team/for-you',
      '/commons/circles',
      '/book-studio',
    ]) {
      expect(isNativeBundled(r)).toBe(false);
    }
  });

  it('treats the /labtools root as web-only even though some sub-dirs are kept', () => {
    expect(isNativeBundled('/labtools')).toBe(false);
    expect(isNativeBundled('/labtools/settings')).toBe(true);
    expect(isNativeBundled('/labtools/admin')).toBe(false);
  });

  it('ignores query and hash when classifying', () => {
    expect(isNativeBundled('/maia?x=1')).toBe(true);
    expect(isNativeBundled('/maia/anchor?x=1#y')).toBe(false);
  });
});

describe('Record group — Decisions & Changes (founder/steward only)', () => {
  it('registers both under /studio with founder audience and record group', () => {
    expect(DECISIONS_RAIL_ITEM).toMatchObject({
      id: 'decisions',
      route: '/studio/decisions',
      audience: 'founder',
      houseGroup: 'record',
    });
    expect(CHANGES_RAIL_ITEM).toMatchObject({
      id: 'changes',
      route: '/studio/changes',
      audience: 'founder',
      houseGroup: 'record',
    });
    expect(MAIA_RECORD).toEqual([DECISIONS_RAIL_ITEM, CHANGES_RAIL_ITEM]);
  });

  it('hides Record from ordinary members and shows it to founders', () => {
    expect(getVisibleRecord(false)).toHaveLength(0);
    expect(getVisibleRecord(true).map((i) => i.id)).toEqual(['decisions', 'changes']);
  });

  it('does NOT pollute the boundary registry (boundary detection unchanged)', () => {
    const boundaryIds = getVisibleBoundaries(true).map((i) => i.id);
    expect(boundaryIds).not.toContain('decisions');
    expect(boundaryIds).not.toContain('changes');
  });
});

describe('House display groups — houseGroup, audience-filtered', () => {
  it('Rooms holds direct practices (member set), never founder tools', () => {
    const memberRooms = getHousePlaces('rooms', false).map((i) => i.id);
    expect(memberRooms).toEqual(expect.arrayContaining(['journal', 'anchor', 'ideas', 'keeps']));
    expect(memberRooms).not.toContain('studio');
  });

  it('Worlds holds broader environments; founder tools appear only for founders', () => {
    const memberWorlds = getHousePlaces('worlds', false).map((i) => i.id);
    expect(memberWorlds).toEqual(
      expect.arrayContaining(['living-field', 'wisdom', 'astrology', 'community-library', 'colab']),
    );
    expect(memberWorlds).not.toContain('studio'); // founder-gated
    expect(memberWorlds).not.toContain('book-studio');

    const founderWorlds = getHousePlaces('worlds', true).map((i) => i.id);
    expect(founderWorlds).toEqual(
      expect.arrayContaining(['studio', 'book-studio', 'circles', 'vision-studio', 'labtools']),
    );
  });

  it('every member-visible place resolves to a boolean dispatch (bundled or bridge)', () => {
    const places = [...getHousePlaces('worlds', false), ...getHousePlaces('rooms', false)];
    expect(places.length).toBeGreaterThan(0);
    for (const p of places) {
      expect(typeof isNativeBundled(p.route)).toBe('boolean');
    }
  });
});
