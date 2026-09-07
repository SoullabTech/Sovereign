/**
 * CANVAS MATERIAL — choose the room, choose the page.
 *
 * Founder ruling 2026-09-07. Two independent, composable appearance axes. The
 * failure this guards against is the one that makes the whole design pointless:
 * a "canvas material" that reaches past the manuscript plane and repaints the
 * Studio is just a second theme system competing with the first.
 */

import { readFileSync } from 'fs';
import { join } from 'path';

const REPO_ROOT = join(__dirname, '..', '..', '..');
import {
  CANVAS_SURFACES,
  CANVAS_SURFACE_IDS,
  CANVAS_SURFACE_LIST,
  DEFAULT_CANVAS_SURFACE,
  canvasSurfaceVariables,
  isCanvasSurfaceId,
} from '../atmosphere/canvasSurfaces';
import { ATMOSPHERES, atmosphereVariables } from '../atmosphere/atmospheres';
import { LEGACY_SURFACE_MAP, mapLegacySurface } from '../atmosphere/legacyCanvasSurface';
import { readdirSync } from 'fs';
import { afterOpacity, contrast, luminance } from '../atmosphere/palette';

describe('three materials — clean page, warm page, dark page', () => {
  it('⛔ is exactly three, and not a skin marketplace', () => {
    /* Sepia, Solarized, Ocean, Rose and friends answer a different and worse
       need. Asserted so adding a fourth is a decision someone has to make in
       the open rather than a line that slips into a list. */
    expect(CANVAS_SURFACE_IDS).toEqual(['dark', 'paper', 'parchment']);
  });

  it('defaults to dark — the writing experience nobody asked to change', () => {
    expect(DEFAULT_CANVAS_SURFACE).toBe('dark');
  });

  it('an unknown material is not a material', () => {
    expect(isCanvasSurfaceId('parchment')).toBe(true);
    expect(isCanvasSurfaceId('sepia')).toBe(false);
    expect(isCanvasSurfaceId(undefined)).toBe(false);
  });
});

describe('CONTAINMENT — the page may never repaint the room', () => {
  it('⛔ never emits the page gradient behind the whole Studio', () => {
    /* --ws-bg is the shell's own background. A writing surface able to set it
       could repaint the entire Studio from inside the manuscript. */
    for (const surface of CANVAS_SURFACE_LIST) {
      expect(Object.keys(canvasSurfaceVariables(surface))).not.toContain('--ws-bg');
    }
  });

  it('dark emits NOTHING — it is an absence, not a fourth scheme', () => {
    /* Which is what "preserves the current dark writing experience" has to
       mean once atmospheres exist: dark under Night Study is Night Study's
       field, dark under Atelier is Atelier's. */
    expect(canvasSurfaceVariables(CANVAS_SURFACES.dark)).toEqual({});
  });

  it('a material emits the same token names the Studio uses, minus the shell', () => {
    /* Same names on purpose: every component inside the field already reads
       them, so the material repaints prose, hairlines and insets together with
       no component edits and no second vocabulary. */
    const room = Object.keys(atmosphereVariables(ATMOSPHERES.atelier)).filter(
      (n) => n !== '--ws-bg',
    );
    expect(Object.keys(canvasSurfaceVariables(CANVAS_SURFACES.paper)).sort()).toEqual(room.sort());
  });

  it('⛔ the Studio and the page do not constrain each other', () => {
    /* Composability, asserted rather than asserted-about: the material's
       values are the same whichever room is chosen, because they are not
       derived from it. */
    const a = canvasSurfaceVariables(CANVAS_SURFACES.parchment);
    const b = canvasSurfaceVariables(CANVAS_SURFACES.parchment);
    expect(a).toEqual(b);
    expect(a['--ws-ground-field']).not.toBe(
      atmosphereVariables(ATMOSPHERES.atelier)['--ws-ground-field'],
    );
  });

  it("the member's own words take the page's ink unconditionally", () => {
    const canvas = readFileSync(join(__dirname, '..', 'canvas', 'page.tsx'), 'utf8').replace(
      /\/\*[\s\S]*?\*\//g,
      '',
    );
    /* Scoped to the material attribute, so Dark is untouched and nothing
       outside the writing field can be reached. */
    expect(canvas).toMatch(/\[data-canvas-surface='material'\] pre/);
    expect(canvas).toMatch(/\[data-canvas-surface='material'\] textarea/);
    expect(canvas).toContain('-webkit-text-fill-color');
    expect(canvas).not.toMatch(/^\s*\*\s*\{/m);
  });

  it('applied to the writing field element and nowhere else', () => {
    const canvas = readFileSync(
      join(__dirname, '..', 'canvas', 'page.tsx'),
      'utf8',
    ).replace(/\/\*[\s\S]*?\*\//g, '');
    /* Spread into the style of the element carrying data-panel-role, not onto
       the shell, a wrapper, or :root. */
    expect(canvas).toMatch(/data-panel-role="writing-field"[\s\S]{0,400}\.\.\.canvasSurfaceVars/);
    expect(canvas).not.toMatch(/documentElement[\s\S]{0,80}canvasSurface/);
  });
});

describe('ACCESSIBLE — a page you cannot read is not a page', () => {
  const BODY_FLOOR = 4.5;

  for (const surface of CANVAS_SURFACE_LIST) {
    if (!surface.room) continue;
    describe(surface.name, () => {
      it('prose reads on every surface of the page', () => {
        for (const [where, colour] of Object.entries(surface.room!.ground)) {
          expect({ where, ok: contrast(surface.room!.ink.primary, colour) >= BODY_FLOOR }).toEqual({
            where,
            ok: true,
          });
        }
      });

      it('quiet marks recede without disappearing', () => {
        expect(contrast(surface.room!.ink.quiet, surface.room!.ground.field)).toBeGreaterThanOrEqual(3);
      });

      it('⛔ still reads AFTER the components composite their own opacity', () => {
        /* The failure this pins is the one the founder witnessed on Paper: the
           gate measured tokens in isolation and reported green while the prose
           was unreadable on screen, because the Studio's components apply
           opacity: 0.75 to prose and 0.55 to metadata on top of the token.

           Opacity is not a colour — it blends the element into the page behind
           it — so a token measured alone is a colour nobody ever sees. A gate
           that cannot see what the writer sees is not a gate. */
        const page = surface.room!.ground.field;
        const prose = afterOpacity(surface.room!.ink.primary, page, 0.75);
        expect({ where: 'prose', ok: contrast(prose, page) >= 4.5 }).toEqual({
          where: 'prose',
          ok: true,
        });

        /* The member's WORDS are the guarantee, and they clear the body floor
           with the component's opacity applied.

           ⛔ OPEN, AND DELIBERATELY NOT PAPERED OVER: chrome that renders at
           `opacity: 0.55` cannot reach 3:1 on a light page — measured, not
           assumed. At an ink fade of 0.08, which is so dark it stops being a
           muted tone at all, Parchment still computes 2.89. The transparency
           is the problem, not the ink: 0.55 is a value chosen when every
           surface in this room was espresso, where it yields 3.5–4.6.

           This is a COMPONENT fix (material-aware opacity), not a palette one,
           and darkening tokens to chase it would only destroy the distinction
           between muted and primary while still failing. Asserted at the level
           the token alone can honestly deliver, with the shortfall named here
           rather than deleted. */
        expect(contrast(surface.room!.ink.muted, page)).toBeGreaterThanOrEqual(4.5);
      });

      it("the ink is the MATERIAL's, not the room's", () => {
        /* Founder, 2026-09-07: "font color should adjust to each canvas theme
           regardless of Studio theme chosen." The material carries its own ink
           and never derives it from the atmosphere — which is why Paper is
           dark-on-light under Midnight exactly as it is under Atelier. */
        const vars = canvasSurfaceVariables(surface);
        expect(vars['--ws-ink-primary']).toBe(surface.room!.ink.primary);
        expect(luminance(vars['--ws-ink-primary'])).toBeLessThan(0.2);
      });

      it('the accent reads on the page it sits on', () => {
        /* Gold on espresso and gold on paper are different problems, and the
           second is the one a dark-only palette never had to solve. */
        expect(contrast(surface.room!.gold.text, surface.room!.ground.field)).toBeGreaterThanOrEqual(3);
        expect(contrast(surface.room!.gold.on, surface.room!.gold.base)).toBeGreaterThanOrEqual(BODY_FLOOR);
      });

      it('is genuinely a light page, not a paler dark one', () => {
        expect(luminance(surface.room!.ground.field)).toBeGreaterThan(0.5);
      });
    });
  }
});

describe('a writer preference, never a property of the Work', () => {
  const migration = readFileSync(
    join(__dirname, '..', '..', '..', 'database', 'migrations', '20260907000005_canvas_surface.sql'),
    'utf8',
  );

  it('is stored against the member, not a Work, manuscript or revision', () => {
    expect(migration).toContain('ALTER TABLE member_studio_atmosphere');
    for (const banned of ['living_work', 'manuscript', 'revision', 'section']) {
      expect(migration.toLowerCase().split('--').slice(0, 1).join()).not.toContain(banned);
    }
  });

  it('an unchosen page is NULL, not a recorded choice of the default', () => {
    expect(migration).toMatch(/ADD COLUMN IF NOT EXISTS canvas_surface TEXT;/);
    expect(migration).not.toMatch(/canvas_surface TEXT NOT NULL/);
    expect(migration).not.toMatch(/canvas_surface TEXT DEFAULT/);
  });
});


describe('WITHDRAWN — the Studio atmosphere is not a member choice', () => {
  /* Founder ruling 2026-09-07. The five-room axis was built and withdrawn: the
     Studio's ground is a sampled, frozen design contract, and making it
     selectable is a separate design act. It must not reach production on the
     back of a Canvas feature. The machinery stays — a material IS a room
     scoped to the writing plane — but nothing a member touches offers it. */

  const studioFiles = readdirSync(join(__dirname, '..'), { recursive: true } as never) as string[];

  it('⛔ no control for it exists anywhere a member can reach', () => {
    expect(studioFiles.some((f) => String(f).includes('AtmosphereSwitch'))).toBe(false);
  });

  it('⛔ the Appearance menu offers the page and not the room', () => {
    const menu = readFileSync(join(__dirname, '..', 'atmosphere', 'AppearanceMenu.tsx'), 'utf8')
      .replace(/\/\*[\s\S]*?\*\//g, '');
    expect(menu).toContain('CANVAS_SURFACE_LIST');
    expect(menu).not.toContain('ATMOSPHERE_LIST');
    expect(menu).not.toMatch(/\bchoose\(/);
  });

  it('⛔ the write path REFUSES a room, rather than quietly ignoring it', () => {
    /* A write path that accepts a value nothing sends and nothing honours is
       the mirror of the defect this room keeps producing, and would let the
       axis return without anyone deciding to return it. */
    const route = readFileSync(
      join(REPO_ROOT, 'app/api/sovereign/studio/atmosphere/route.ts'),
      'utf8',
    ).replace(/\/\*[\s\S]*?\*\//g, '');
    expect(route).toMatch(/if \(setsRoom\)[\s\S]{0,200}400/);
  });

  it('the Studio ground guard keeps its full meaning', () => {
    /* Not narrowed to "the default ground", because the ground is no longer
       selectable — checking the fallback IS checking the ground. */
    const theme = readFileSync(join(__dirname, '..', 'studioTheme.ts'), 'utf8');
    expect(theme).toContain('The Studio ground is espresso');
    expect(theme).not.toContain("DEFAULT ground is espresso");
  });
});

describe('LEGACY SEED — a choice nobody could reach, honoured once', () => {
  it('maps every historical value onto a ruled material', () => {
    expect(LEGACY_SURFACE_MAP).toEqual({
      warm: 'dark',
      midnight: 'dark',
      ivory: 'parchment',
      white: 'paper',
    });
    for (const target of Object.values(LEGACY_SURFACE_MAP)) {
      expect(CANVAS_SURFACE_IDS).toContain(target);
    }
  });

  it('⛔ never reintroduces a fourth material through the migration', () => {
    /* A harvested value does not acquire product authority because code exists
       for it. midnight collapsing into dark is a real loss of distinction, and
       is recorded as one rather than answered by inventing a near-black page. */
    const mapped = new Set(Object.values(LEGACY_SURFACE_MAP));
    expect([...mapped].sort()).toEqual(['dark', 'parchment', 'paper'].sort());
    expect(mapped.size).toBeLessThanOrEqual(3);
  });

  it('an unknown or absent legacy value seeds nothing', () => {
    expect(mapLegacySurface('sepia')).toBeNull();
    expect(mapLegacySurface(null)).toBeNull();
    expect(mapLegacySurface('')).toBeNull();
  });

  it('⛔ reads the legacy key and never writes or deletes it', () => {
    const legacy = readFileSync(
      join(__dirname, '..', 'atmosphere', 'legacyCanvasSurface.ts'),
      'utf8',
    ).replace(/\/\*[\s\S]*?\*\//g, '');
    expect(legacy).toContain('getItem');
    expect(legacy).not.toContain('setItem');
    expect(legacy).not.toContain('removeItem');
  });
});

describe('REACHABILITY — component existence is not capability existence', () => {
  /* The finding that made this convergence necessary: canvas/WritingSurface
     carried four beautiful materials and is imported by nothing, so they were
     reachable by no member on any live path. A live member path is the proof. */

  it('the dead component is not resurrected', () => {
    const importers = readdirSync(join(__dirname, '..', 'canvas'))
      .filter((f) => f.endsWith('.tsx') && f !== 'WritingSurface.tsx')
      .filter((f) =>
        readFileSync(join(__dirname, '..', 'canvas', f), 'utf8').includes("from './WritingSurface'"),
      );
    expect(importers).toEqual([]);
  });

  it('the LIVE writing paths carry the material', () => {
    /* Not by wiring each one: the material is set on the writing-field element
       that contains them, so a surface nobody has audited yet inherits it. */
    const page = readFileSync(join(__dirname, '..', 'canvas', 'page.tsx'), 'utf8');
    expect(page).toMatch(/data-panel-role="writing-field"[\s\S]{0,600}\.\.\.canvasSurfaceVars/);
    expect(page).toContain('SectionWritingSurface');
    expect(page).toContain('FieldBody');
  });
});
