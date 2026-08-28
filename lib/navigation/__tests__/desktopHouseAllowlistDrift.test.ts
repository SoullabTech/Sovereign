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
import { buildManifest, RETURN_TO_MAIA_ROUTES } from '../../../scripts/generate-desktop-house-allowlist';
import { HOUSE_DESTINATIONS } from '../houseDestinations';

const MANIFEST = path.join(__dirname, '..', '..', '..', 'maia-desktop', 'src', 'house-allowlist.json');

describe('DESKTOP-HOUSE-01 · Desktop allow-list is derived from the House', () => {
  it('the committed manifest is exactly what the generator produces', () => {
    const onDisk = JSON.parse(fs.readFileSync(MANIFEST, 'utf8'));
    expect(onDisk).toEqual(buildManifest());
  });

  it('every routed House destination is reachable, except the conversation itself', () => {
    const m = buildManifest();
    for (const d of HOUSE_DESTINATIONS) {
      if (d.kind !== 'route' || !d.route) continue;
      if (RETURN_TO_MAIA_ROUTES.includes(d.route)) {
        // ⛔ The center is NOT a remote destination. Desktop already holds the
        // member's conversation locally; loading the web one would put a second
        // MAIA in the same window.
        expect(m.allowedRoots).not.toContain(d.route);
        continue;
      }
      expect(m.allowedRoots).toContain(d.route);
    }
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

  it('the conversation route is matched exactly, never as a prefix', () => {
    // /maia/anchor, /maia/ideas, /maia/living-field, /maia/keep-capture and
    // /maia/vision-studio are Rooms that live under the conversation's path.
    // A prefix rule would bounce a member out of Anchor and back to MAIA.
    const m = buildManifest();
    const roomsUnderMaia = m.allowedRoots.filter((r) => r.startsWith('/maia/'));
    expect(roomsUnderMaia.length).toBeGreaterThan(0);
    for (const room of roomsUnderMaia) {
      expect(RETURN_TO_MAIA_ROUTES).not.toContain(room);
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
