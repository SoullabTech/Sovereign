/**
 * DESKTOP-HOUSE-01 — the Desktop platform-view allow-list may not drift from
 * the House.
 *
 * The failure this prevents is the one `houseNavDrift.test.ts` already
 * documents for native: a destination advertised in one list, allowed in a
 * second, and absent from a third, drifting apart silently until a member taps
 * a door that opens onto nothing.
 *
 * Desktop's shell is CommonJS and cannot import the registry, so its allow-list
 * exists as a generated manifest. This test regenerates it and compares, which
 * makes the manifest a derivative rather than a duplicate: the only way to
 * change what Desktop may open is to change the House.
 */

import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { buildManifest, DESKTOP_MAIA_ROUTE } from '../../../scripts/generate-desktop-house-allowlist';
import { HOUSE_DESTINATIONS } from '../houseDestinations';

const MANIFEST = path.join(__dirname, '..', '..', '..', 'maia-desktop', 'src', 'house-allowlist.json');

describe('DESKTOP-HOUSE-01 · Desktop allow-list is derived from the House', () => {
  it('the committed manifest is exactly what the generator produces', () => {
    const onDisk = JSON.parse(fs.readFileSync(MANIFEST, 'utf8'));
    expect(onDisk).toEqual(buildManifest());
  });

  it('every routed House destination is reachable, the conversation included', () => {
    // ⛔ SUPERSEDED: DESKTOP-HOUSE-01 excluded /maia here, because Desktop
    // answered it by revealing the local Electron renderer. Founder ruling after
    // the device walk — there is ONE visible MAIA and she is the canonical one,
    // so the conversation is a destination like any other place the House opens.
    const m = buildManifest();
    for (const d of HOUSE_DESTINATIONS) {
      if (d.kind !== 'route' || !d.route) continue;
      expect(m.allowedRoots).toContain(d.route);
    }
    expect(m.allowedRoots).toContain(DESKTOP_MAIA_ROUTE);
    expect(m.maiaRoute).toBe(DESKTOP_MAIA_ROUTE);
  });

  it('nothing is allowed that the House does not name', () => {
    const m = buildManifest();
    const fromHouse = new Set(
      HOUSE_DESTINATIONS.filter((d) => d.kind === 'route' && d.route).map((d) => d.route as string),
    );
    const infrastructure = new Set(['/house', '/open-web', '/signin']);
    for (const root of m.allowedRoots) {
      const named = fromHouse.has(root) || infrastructure.has(root);
      expect(named, `${root} is allowed but no House destination names it`).toBe(true);
    }
  });

  it('Rooms living under the conversation path are reachable in their own right', () => {
    // /maia/anchor, /maia/ideas, /maia/living-field and /maia/keep-capture are
    // Rooms that happen to sit under the conversation's path. Each is allowed
    // as itself, not merely as a consequence of /maia being allowed.
    const m = buildManifest();
    const roomsUnderMaia = m.allowedRoots.filter((r) => r.startsWith('/maia/'));
    expect(roomsUnderMaia.length).toBeGreaterThan(0);
    for (const room of roomsUnderMaia) {
      expect(m.destinations.some((d) => d.route === room)).toBe(true);
    }
  });

  it('sheets and external destinations are not platform-view routes', () => {
    const m = buildManifest();
    const routes = new Set(m.destinations.map((d) => d.route));
    for (const d of HOUSE_DESTINATIONS) {
      if (d.kind === 'sheet') expect(routes.has(d.route as string)).toBe(false);
      // 'external' destinations go to the OS browser via navigationDecision,
      // never into the contained view.
      if (d.kind === 'external' && d.route) expect(m.allowedRoots).not.toContain(d.route);
    }
  });
});
