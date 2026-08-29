import * as fs from 'fs';
import * as path from 'path';
import { visibleDestinations } from '../studioMap';
import { PANELS } from '../studioTheme';

const canvas = fs.readFileSync(
  path.join(__dirname, '..', 'canvas', 'page.tsx'),
  'utf8',
);
const strip = (s: string) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*/g, '');
const code = strip(canvas);

/**
 * WS2-03A — the seam that makes the WS2-02 witness possible.
 *
 * The design system was intentionally unrouted, so the §0.2 instrument, which
 * photographs /writers-studio/canvas, had nothing of it to photograph. These
 * tests hold the two things that projection must not cost: the accepted system
 * really is what the route renders, and the runtime rail stays honest.
 */
describe('the real Canvas renders through the accepted WS2-02 system', () => {
  it('draws on the accepted ground ramp, not the raw legacy gradient', () => {
    expect(code).toContain('GROUND.base');
    expect(code).toContain('GROUND.field');
    expect(code).not.toContain('PRESS.bg');
  });

  it('uses the accepted panel and type primitives', () => {
    expect(code).toContain('StudioPanel');
    expect(code).toContain('StudioText');
  });

  it('renders MAIA’s presence through the panel contract', () => {
    // Dismissibility comes from PANELS, not from this call site.
    expect(code).toMatch(/role="maia"/);
  });
});

describe('the runtime rail stays honest', () => {
  it('draws the member-facing projection, never the canonical fixture one', () => {
    expect(code).toContain('StudioRail');
    // CanonicalRail draws all sixteen inert. It is fixture-only and must never
    // reach a route, however much closer to 04 that would look.
    expect(code).not.toContain('CanonicalRail');
    expect(code).not.toMatch(/\bSTUDIO_MAP\b/);
  });

  it('offers no unbuilt destination on the real route', () => {
    for (const has of [true, false]) {
      const shown = visibleDestinations(has).flatMap((g) => g.destinations);
      expect(shown.filter((d) => d.availability === 'later')).toEqual([]);
    }
  });

  it('does not make Conversations available to match the reference', () => {
    const all = visibleDestinations(true).flatMap((g) => g.destinations).map((d) => d.label);
    expect(all).not.toContain('Conversations');
  });
});

describe('each drawer renders under the contract it actually is', () => {
  /*
   * The first projection gave every open drawer role="manuscript-outline".
   * `role` is not styling — it selects the design-contract entry and is
   * emitted as data-panel-role, so Materials announced itself as a manuscript
   * outline and History did too. These four mappings are the repair.
   */
  it('maps materials, structure and history to their real panel roles', () => {
    expect(code).toContain("materials: 'materials'");
    expect(code).toContain("structure: 'manuscript-outline'");
    expect(code).toContain("history: 'versions'");
  });

  it('gives Work no PanelRole, because the contract has none', () => {
    // Inventing a 'work' role to fill the gap would be the same error in the
    // other direction. StudioSurface gives a truthful surface instead.
    expect(code).toContain('work: null');
    expect(code).toContain('StudioSurface');
    expect(PANELS.map((p) => p.role)).not.toContain('work');
  });

  it('no longer hardcodes one role for every drawer', () => {
    expect(code).not.toMatch(/role="manuscript-outline"/);
    expect(code).toContain('DRAWER_PANEL_ROLE[drawer]');
  });

  it('names only roles the contract actually defines', () => {
    const declared = new Set(PANELS.map((p) => p.role));
    for (const role of ['materials', 'manuscript-outline', 'versions']) {
      expect(declared.has(role as never)).toBe(true);
    }
  });
});

describe('WS2-03A stops at the seam', () => {
  it('claims no Work context beyond the existing unite rule', () => {
    // 0 works: nothing claimed. 1: that work. 2+: ambiguous, and the room does
    // not choose. arrivalWork already decides this and 03A does not touch it.
    expect(code).toContain('arrivalWork');
    expect(code).not.toContain('living_work_expressions');
  });

  it('adds no Studio → MAIA handoff', () => {
    // The Window still opens onto one honest sentence. A reflection endpoint
    // on this surface is WS2-03B's, gated on Work context surviving the trip.
    expect(code).toContain('WINDOW_SENTENCE');
    expect(code).not.toMatch(/\/maia\b/);
  });

  it('keeps every existing drawer reachable', () => {
    for (const drawer of ['WorkDrawer', 'MaterialsDrawer', 'Worktable']) {
      expect(code).toContain(drawer);
    }
  });
});
