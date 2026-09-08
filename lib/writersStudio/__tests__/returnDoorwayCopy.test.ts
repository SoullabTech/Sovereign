import { readFileSync } from 'fs';
import { join } from 'path';

import { RETURN_DOORWAY_COPY } from '../returnDoorwayCopy';

/**
 * FOUNDER RULING — WRITER'S STUDIO · LIFE OF A WORK, Step 1 (2026-09-08).
 *
 * The doorway is presentation, so the thing worth pinning is not that a string
 * exists but that the OLD framing is gone from Home, that the new framing is
 * rendered from ONE source at BOTH placements, and that Step 1 stayed inside
 * its authorization: the import path is untouched.
 */

const HOME_VIEW = readFileSync(
  join(__dirname, '../../../app/writers-studio/HomeView.tsx'),
  'utf8',
);

const STUDIO_MAP = readFileSync(
  join(__dirname, '../../../app/writers-studio/studioMap.ts'),
  'utf8',
);

/** Comments document the change; only rendered code may answer these. */
const HOME_CODE = HOME_VIEW.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

describe('return doorway copy', () => {
  it('names the act, not the mechanism', () => {
    expect(RETURN_DOORWAY_COPY.label).toBe('Bring a work back to life');
  });

  it('ends in the member’s authority — arrival obliges nothing', () => {
    expect(RETURN_DOORWAY_COPY.note).toContain('what, if anything');
  });

  it('no longer offers the mechanism-named door on Home', () => {
    expect(HOME_CODE).not.toContain('Import writing');
  });

  it('renders both placements from the one copy module', () => {
    // Two <ReturnDoorway /> placements: the empty Studio and the shelf footer.
    const placements = HOME_CODE.match(/<ReturnDoorway\b/g) ?? [];
    expect(placements).toHaveLength(2);
    // ...and neither of them re-states the copy inline.
    expect(HOME_CODE).toContain('RETURN_DOORWAY_COPY.label');
    expect(HOME_CODE).toContain('RETURN_DOORWAY_COPY.note');
  });

  it('opens the existing import path — Step 1 added no route', () => {
    expect(HOME_CODE).toContain('href={IMPORT_HREF}');
    expect(STUDIO_MAP).toContain("export const IMPORT_HREF = '/press/manuscript?import=1';");
  });
});
