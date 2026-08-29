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
    // The field's ground now comes from StudioSurface level="field" rather than
    // a raw token on a <main> — the primitive owns the ramp, not the call site.
    expect(code).toMatch(/StudioSurface[\s\S]{0,80}level="field"/);
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

describe('each surface renders under the contract it actually is', () => {
  /*
   * WS2-03A mapped four drawers to panel roles. WS2-03B dissolved the drawer
   * spine into the reference composition, so the mapping is now direct: each
   * region IS the panel it claims to be, and the roles are asserted where they
   * are rendered rather than in a lookup table.
   *
   * The rule the old table protected still holds — no region may announce a
   * contract it is not. Materials is `materials`, MAIA is `maia`, the outline
   * is `manuscript-outline`.
   */
  it('names each panel by its real role', () => {
    expect(code).toMatch(/role="manuscript-outline"/);
    expect(code).toMatch(/role="materials"/);
    expect(code).toMatch(/role="maia"/);
  });

  it('invents no Work panel — the contract has none', () => {
    // WorkDrawer's capability survives inside the manuscript panel rather than
    // acquiring a role of its own.
    expect(code).toContain('WorkDrawer');
    expect(code).not.toMatch(/role="work"/);
    expect(PANELS.map((p) => p.role)).not.toContain('work');
  });

  it('gives Versions real content rather than a panel role it does not fill', () => {
    // Versions moved to the lower band as read revisions, not a drawer.
    expect(code).toContain('loadRevisions');
    expect(code).toContain('revisions.slice');
  });

  it('keeps every contextual panel dismissible and recallable', () => {
    for (const setter of ['setOutlineOpen', 'setMaiaOpen', 'setMaterialsOpen']) {
      expect(code).toContain(`${setter}(false)`);
      expect(code).toContain(`${setter}(true)`);
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

describe('WS2-03B — identity is honoured or refused, never substituted', () => {
  /*
   * Runtime established the cost of the old rule. A member asked for
   * a3ae67fd — "Elemental Alchemy (KDP print)", 174 sections, their own — and
   * the room served a different, empty manuscript while reporting success.
   * The page looked fine and was the wrong book.
   */
  it('no longer falls through to manuscripts[0] when a manuscript was named', () => {
    expect(code).not.toMatch(/find\(\(m\) => m\.id === requested\) \?\? manuscripts\[0\]/);
  });

  it('resolves an explicit id exactly, or to nothing', () => {
    expect(code).toMatch(/requested !== null\s*\?\s*\(manuscripts\.find\(\(m\) => m\.id === requested\) \?\? null\)/);
  });

  it('still opens the most recent when no identity was asserted', () => {
    // Not naming a manuscript substitutes no identity, so this is safe.
    expect(code).toMatch(/:\s*\(manuscripts\[0\] \?\? null\)/);
  });

  it('tells the member, rather than showing a different manuscript', () => {
    expect(code).toContain('identityRefused');
    expect(code).toContain('That manuscript is not one of yours');
  });
});

describe('WS2-03B — the reference geometry reaches the real room', () => {
  it('lays the five measured columns', () => {
    for (const col of [
      'rail',
      'outlinePanel',
      'writingField',
      'maiaPanel',
      'materialsPanel',
    ]) {
      expect(code).toContain(`columnFlex('${col}')`);
    }
  });

  it('carries the five modes, with unbuilt ones not pretending to be links', () => {
    for (const mode of ['Write', 'Develop', 'Explore', 'Review', 'Publish']) {
      expect(code).toContain(`'${mode}'`);
    }
    // Explore is Studio Home, which is real. The rest carry no href.
    expect(code).toMatch(/label: 'Explore', href: '\/writers-studio'/);
    expect(code).toMatch(/label: 'Develop' \}/);
    expect(code).toMatch(/label: 'Publish' \}/);
  });

  it('has dissolved the legacy drawer spine', () => {
    // 03B's brief: do not skin the old composition. The spine, its DrawerId
    // type and its one-at-a-time state are gone.
    expect(code).not.toContain('DrawerId');
    expect(code).not.toContain('drawerBody');
    expect(code).not.toMatch(/writing-mode:vertical-rl/);
  });

  it('exposes no capability that does not exist', () => {
    // Goals has no substrate, so the lower band does not draw it.
    expect(code).not.toMatch(/bandLabel\('Goals'\)/);
    // Conversations stays unavailable until Work context survives the handoff.
    expect(code).not.toMatch(/href="\/maia"/);
  });
});
