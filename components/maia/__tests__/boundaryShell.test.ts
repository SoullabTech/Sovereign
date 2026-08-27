/**
 * The boundary-room shell contract — pinned at the source.
 *
 * MLX-06 Unit 6. The retired rail survived on boundary rooms because
 * MaiaBoundaryLayout rendered it unconditionally with a hard `paddingLeft: 56`.
 * These guards make that shape impossible to restore by accident: the rail must
 * stay width-scoped, the offset must stay width-scoped with it, and there must
 * remain exactly one renderer of the House doorway.
 *
 * WHAT THIS DOES NOT PROVE: nothing about production, and nothing about the
 * Capacitor shell. It is a source-shape guard; the walks are the acceptance
 * test.
 */
import { readFileSync } from 'fs';
import path from 'path';
import { RAIL_WIDTH_PX } from '@/lib/navigation/maiaNav';

const REPO = path.resolve(__dirname, '../../..');
const read = (rel: string) => readFileSync(path.join(REPO, rel), 'utf8');

/** Comments record intent; code is what ships. */
const strip = (src: string) =>
  src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1');

const LAYOUT = 'components/maia/MaiaBoundaryLayout.tsx';
const layout = strip(read(LAYOUT));

describe('the rail is desktop-only', () => {
  it('renders the rail inside a width-scoped wrapper', () => {
    const wrapper = layout.match(/className="([^"]*)"\s*>\s*\n\s*<MaiaLeftRail/);
    expect(wrapper).not.toBeNull();
    expect(wrapper![1]).toContain('hidden');
    expect(wrapper![1]).toContain('md:block');
  });

  it('never offsets content for a rail that is not there', () => {
    // The old defect, exactly: an unconditional pixel offset.
    expect(layout).not.toMatch(/paddingLeft:\s*RAIL_WIDTH_PX/);
    expect(layout).not.toMatch(/style=\{\{\s*paddingLeft/);
    expect(layout).toMatch(/const RAIL_OFFSET_CLASS = 'md:pl-\d+'/);
  });

  it('offsets by exactly the rail width, at the same breakpoint', () => {
    const cls = layout.match(/const RAIL_OFFSET_CLASS = '(md:pl-(\d+))'/)!;
    // Tailwind spacing: 1 unit = 0.25rem = 4px at the 16px base.
    expect(Number(cls[2]) * 4).toBe(RAIL_WIDTH_PX);
    expect(cls[1].startsWith('md:')).toBe(true);
  });
});

describe('the way back on mobile', () => {
  it('mounts the House doorway and the House sheet', () => {
    expect(layout).toMatch(/<MaiaHouseDoorway/);
    expect(layout).toMatch(/<MaiaHouseSheet/);
  });

  it('scopes the doorway to mobile, so desktop is not given two ways out', () => {
    expect(layout).toMatch(/<MaiaHouseDoorway[^>]*className="md:hidden"/);
  });

  it('lets a room that owns its mobile navigation opt out', () => {
    expect(layout).toMatch(/ownsMobileNav/);
    expect(layout).toMatch(/\{!ownsMobileNav && \(/);
  });

  it('builds no second navigation system of its own', () => {
    // No tab bar, no bottom dock, no route list. The House is the navigation.
    expect(layout).not.toMatch(/bottom-0|TABS|tabBar|BottomNav/i);
    expect(layout).not.toMatch(/href=|router\.push\('\//);
  });
});

describe('one House, one renderer, one doorway', () => {
  const DOORWAY = 'components/maia/MaiaHouseDoorway.tsx';

  it('is rendered from the shared component everywhere it appears', () => {
    const shell = strip(read('components/maia/MaiaShell.tsx'));
    expect(shell).toMatch(/<MaiaHouseDoorway/);
    expect(layout).toMatch(/<MaiaHouseDoorway/);
  });

  it('has exactly one hand-written doorway box in the tree', () => {
    // aria-label is the doorway's identity; a second literal means a second box.
    for (const f of ['components/maia/MaiaShell.tsx', LAYOUT]) {
      expect(strip(read(f))).not.toMatch(/aria-label="Open The House"/);
    }
    expect(strip(read(DOORWAY))).toMatch(/aria-label="Open The House"/);
  });

  it('keeps the geometry that made the doorway reachable on iOS', () => {
    const d = strip(read(DOORWAY));
    expect(d).toMatch(/h-\[54px\]/);          // the header box it must match
    expect(d).toMatch(/px-4 md:px-6/);        // ditto
    expect(d).toMatch(/h-11 min-w-\[44px\]/); // touch target
    expect(d).toMatch(/safe-area-inset-top/); // status bar / Dynamic Island
  });
});

describe('the rail leaves no orphaned offsets behind', () => {
  const studio = () => strip(read('app/studio/layout.tsx'));
  /** The element carrying a given class, up to the end of its style prop. */
  const elementWith = (src: string, marker: string) => {
    const i = src.indexOf(marker);
    expect(i).toBeGreaterThan(-1);
    return src.slice(src.lastIndexOf('<', i), src.indexOf('>', src.indexOf('style=', i)));
  };

  it('does not inset the Studio mobile drawer by a rail that is desktop-only', () => {
    // The mobile drawer is the only w-[280px] panel in the file.
    expect(elementWith(studio(), 'w-[280px]')).not.toMatch(/left:\s*RAIL_WIDTH_PX/);
  });

  it('still insets the Studio desktop sidebar, where the rail does render', () => {
    // The desktop sidebar is the only animated aside.
    expect(elementWith(studio(), '<motion.aside')).toMatch(/left:\s*RAIL_WIDTH_PX/);
  });
});

describe('every boundary room inherits the contract', () => {
  const LAYOUTS = [
    'app/astrology/layout.tsx',
    'app/commons/circles/layout.tsx',
    'app/labtools/layout.tsx',
    'app/maia/community/library/layout.tsx',
    'app/studio/layout.tsx',
  ];

  it('mounts the shared shell rather than the rail directly', () => {
    for (const f of LAYOUTS) {
      const src = strip(read(f));
      expect(src).toMatch(/MaiaBoundaryLayout/);
      expect(src).not.toMatch(/<MaiaLeftRail/);
    }
  });

  it('leaves the rail with exactly one render site in the whole tree', () => {
    // If a future room mounts the rail itself, it bypasses the width scoping —
    // which is how /astrology kept the rail after the 2026-07-22 ruling.
    const { execSync } = require('child_process');
    const hits = execSync(
      `grep -rl "<MaiaLeftRail" --include=*.tsx app components || true`,
      { cwd: REPO, encoding: 'utf8' },
    ).trim().split('\n').filter(Boolean);
    expect(hits).toEqual([LAYOUT]);
  });
});
