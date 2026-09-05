import * as fs from 'fs';
import * as path from 'path';
import { iconFor } from '../studio/StudioIcon';
import { MAIA_POSTURES } from '../studio/MaiaReading';
import { PROVENANCE, RAIL_RHYTHM } from '../studioTheme';
import { STUDIO_MAP } from '../studioMap';

const DIR = path.join(__dirname, '..', 'studio');
const read = (f: string) => fs.readFileSync(path.join(DIR, f), 'utf8');
const strip = (s: string) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*/g, '');

describe('the rail carries an icon language, and only where 04 does', () => {
  it('gives every one of the canonical sixteen a glyph', () => {
    const missing = STUDIO_MAP.flatMap((g) => g.destinations)
      .filter((d) => iconFor(d.id) === null)
      .map((d) => d.label);
    expect(missing).toEqual([]);
  });

  it('invents no glyph for anything the reference does not show', () => {
    // An invented icon is the visual form of inventing a destination, so there
    // is no generic fallback — the rail reserves the column instead.
    expect(iconFor('gatherings')).toBeNull();
    expect(iconFor('shape')).toBeNull();
    expect(iconFor('')).toBeNull();
  });

  it('sizes glyphs from the measured rail rhythm, not a local constant', () => {
    expect(strip(read('StudioIcon.tsx'))).toContain('RAIL_RHYTHM.iconSize');
  });
});

describe('rail rhythm is measured, and the render was re-measured against it', () => {
  it('records the rhythm as sampled', () => {
    expect(PROVENANCE.RAIL_RHYTHM.level).toBe('SAMPLED');
  });

  it('drives item height from the pitch rather than accumulated padding', () => {
    // Pitch is what the eye reads as density. Letting it emerge from padding
    // at each call site is how the first composition drifted to ~37px.
    expect(strip(read('StudioRail.tsx'))).toContain('RAIL_RHYTHM.itemPitch');
  });

  it('keeps 04’s proportions: item pitch well under the band gap', () => {
    expect(RAIL_RHYTHM.itemPitch).toBeLessThan(RAIL_RHYTHM.bandGap);
    expect(RAIL_RHYTHM.itemPitch).toBeGreaterThanOrEqual(28);
    expect(RAIL_RHYTHM.itemPitch).toBeLessThanOrEqual(36);
  });
});

describe('+ New Work is appearance only', () => {
  const canonical = read('__fixtures__/CanonicalRail.tsx');

  it('lives in the fixture, never in the member-facing rail', () => {
    expect(canonical).toContain('new-work');
    expect(strip(read('StudioRail.tsx'))).not.toContain('New Work');
  });

  it('is not a control — no button element, no handler', () => {
    // A gold affordance in a reference must not quietly relocate business
    // logic. Start/import capability belongs to Work Home / EXPLORE and
    // persistent navigation to WS2-03; this unit decides appearance only.
    const code = strip(canonical);
    expect(code).not.toMatch(/<button/);
    expect(code).not.toMatch(/onClick|href=/);
  });
});

describe('MAIA’s posture row depicts form without implying capability', () => {
  const maia = read('MaiaReading.tsx');

  it('carries 04’s four postures', () => {
    expect([...MAIA_POSTURES]).toEqual(['Reflect', 'Question', 'Notice', 'Connect']);
  });

  it('renders them inert, and not as buttons even to a screen reader', () => {
    const code = strip(maia);
    expect(code).not.toMatch(/<button/);
    expect(code).not.toMatch(/onClick/);
  });

  it('keeps them out of gold — these are MAIA’s offers, not the member’s work', () => {
    expect(strip(maia)).not.toContain('GOLD');
  });
});

describe('counts stay facts about the member’s material', () => {
  it('carries only the counts 04 shows, on Materials and Notes', () => {
    const withCount = STUDIO_MAP.flatMap((g) => g.destinations)
      .filter((d) => typeof d.count === 'number')
      .map((d) => [d.label, d.count]);
    expect(withCount).toEqual([
      ['Materials', 24],
      ['Notes', 12],
    ]);
  });

  it('puts no figure on anything MAIA produces', () => {
    // A count of a member's own materials is a fact. A number beside an
    // insight would be a rating — D-003, held here in the navigation too.
    const maiaBand = STUDIO_MAP.filter((g) => g.region === 'maia')
      .flatMap((g) => g.destinations)
      .filter((d) => typeof d.count === 'number');
    expect(maiaBand).toEqual([]);
  });
});

describe('depicted controls carry no interactive semantics', () => {
  const inert = read('__fixtures__/InertControls.tsx');
  const code = strip(inert);
  const composition = strip(read('__fixtures__/WritingFieldComposition.tsx'));

  it('uses only div and span — never an element a browser makes actionable', () => {
    for (const tag of ['<button', '<input', '<a ', '<textarea', '<select', '<form', '<label']) {
      expect(code).not.toContain(tag);
    }
  });

  it('refuses the disabled and readOnly forms too', () => {
    // A disabled button and a readOnly input still announce themselves as
    // controls to assistive technology. Depicting a control is permitted;
    // presenting one that cannot work is not.
    for (const attr of ['disabled', 'readOnly', 'aria-disabled']) {
      expect(code).not.toContain(attr);
    }
  });

  it('carries no handler, href, tabindex or interactive role', () => {
    for (const attr of ['onClick', 'onChange', 'onSubmit', 'href', 'tabIndex']) {
      expect(code).not.toContain(attr);
    }
    // Not a bare `role=` check: StudioText takes a typography `role` prop
    // ("metadata", "navItem"), which is unrelated to ARIA. What must never
    // appear is a role that makes a div announce itself as a control.
    for (const aria of ['button', 'link', 'textbox', 'searchbox', 'checkbox', 'menuitem', 'tab']) {
      expect(code).not.toContain(`role="${aria}"`);
      expect(code).not.toContain(`role='${aria}'`);
    }
  });

  it('marks every depiction fixture-only and hides it from assistive technology', () => {
    expect(code).toContain("'data-fixture-only': 'true'");
    expect(code).toContain("'aria-hidden': true");
    // Every exported depiction spreads that marker rather than opting in
    // one at a time.
    const exported = code.match(/export function (\w+)/g) ?? [];
    expect(exported.length).toBeGreaterThanOrEqual(5);
    expect(code.match(/\{\.\.\.fixtureOnly\}/g)?.length).toBe(exported.length);
  });

  it('keeps the depictions out of the Studio primitives', () => {
    // A generic operable Toolbar or SearchField belongs in the primitives only
    // when a real product capability needs one — not because a fixture wanted
    // its shape. These live under __fixtures__ and are imported from there.
    const primitives = fs.readdirSync(DIR).filter((f) => f.endsWith('.tsx'));
    for (const f of primitives) {
      expect(strip(read(f))).not.toContain('Depiction');
    }
    expect(composition).toContain("from './InertControls'");
  });

  it('reaches no route', () => {
    const files = fs.readdirSync(path.join(DIR, '__fixtures__'));
    expect(files.filter((f) => /^(page|route|layout)\./.test(f))).toEqual([]);
  });

  it('spends gold only where 04 spends it', () => {
    // Two gold affordances in the chrome: "+ New Work" in the rail and
    // "+ Add Material" in the Materials panel. Gold marks where the member
    // acts on their own work, and it stops meaning that if it spreads.
    expect((code.match(/GOLD\.fill/g) ?? []).length).toBe(1);
    expect(code).toContain('Add Material');
  });
});
