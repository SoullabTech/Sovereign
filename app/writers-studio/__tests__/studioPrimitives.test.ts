import * as fs from 'fs';
import * as path from 'path';
import {
  assertFieldIsTheLargestColumn,
  columnPx,
  COLUMN_FRACTION,
  INSIGHT_CHIP,
  PANELS,
  PROVENANCE,
} from '../studioTheme';
import { STUDIO_MAP, visibleDestinations } from '../studioMap';

const DIR = path.join(__dirname, '..', 'studio');
/** Comments explain the rules and therefore quote the banned words. Assertions
 *  about what the CODE does must read the code, not the rationale beside it. */
const stripComments = (src: string) =>
  src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*/g, '');

const sourceFiles = fs
  .readdirSync(DIR)
  .filter((f) => f.endsWith('.tsx'))
  .map((f) => ({
    name: f,
    body: fs.readFileSync(path.join(DIR, f), 'utf8'),
    code: stripComments(fs.readFileSync(path.join(DIR, f), 'utf8')),
  }));

const fixture = fs.readFileSync(
  path.join(DIR, '__fixtures__', 'WritingFieldComposition.tsx'),
  'utf8',
);

describe('primitives consume studioTheme rather than forking it', () => {
  it('finds the primitives', () => {
    expect(sourceFiles.length).toBeGreaterThanOrEqual(6);
  });

  it('hard-codes no colour anywhere in a primitive', () => {
    // The whole reason tokens exist: DERIVED values are expected to be wrong
    // and get corrected once. A component carrying its own hex survives the
    // correction and silently forks the system.
    for (const { name, body } of sourceFiles) {
      const hexes = stripComments(body).match(/#[0-9a-fA-F]{3,8}\b/g) ?? [];
      expect({ file: name, hexes }).toEqual({ file: name, hexes: [] });
    }
  });

  it('imports its values from studioTheme', () => {
    for (const { name, body } of sourceFiles) {
      if (name === 'StudioType.tsx' || name === 'StudioSurface.tsx') {
        expect(body).toMatch(/from '\.\.\/studioTheme'/);
      }
    }
  });
});

describe('the rail cannot leak an unbuilt room', () => {
  it('draws from visibleDestinations, never from STUDIO_MAP directly', () => {
    const rail = sourceFiles.find((f) => f.name === 'StudioRail.tsx')!;
    expect(rail.code).toContain('visibleDestinations');
    // Importing the raw map would route around the render boundary.
    expect(rail.code).not.toMatch(/\bSTUDIO_MAP\b/);
  });

  it('offers no `later` destination in either manuscript state', () => {
    for (const has of [true, false]) {
      const shown = visibleDestinations(has).flatMap((g) => g.destinations);
      expect(shown.filter((d) => d.availability === 'later')).toEqual([]);
      for (const d of shown) expect(d.href).toBeTruthy();
    }
  });

  it('still carries the whole grammar behind that boundary', () => {
    const all = STUDIO_MAP.flatMap((g) => g.destinations);
    expect(all.filter((d) => d.availability === 'later').length).toBeGreaterThan(0);
  });
});

describe('panels stay contextual, not furniture', () => {
  it('reads dismissibility from the contract instead of a prop', () => {
    const panel = sourceFiles.find((f) => f.name === 'StudioPanel.tsx')!.code;
    expect(panel).toContain('PANELS.find');
    expect(panel).not.toMatch(/dismissible\s*[?:]\s*boolean/);
  });

  it('keeps every contextual panel dismissible', () => {
    for (const p of PANELS) if (p.contextual) expect(p.dismissible).toBe(true);
  });
});

describe('MAIA’s treatment stays distinct from the member’s work', () => {
  const maia = () => sourceFiles.find((f) => f.name === 'MaiaReading.tsx')!.code;

  it('uses the MAIA accent, not the work’s gold', () => {
    expect(maia()).toContain('MAIA_ACCENT.voice');
    expect(maia()).not.toContain('GOLD');
  });

  it('gives a score nowhere to enter — evidence is the only figure', () => {
    // maiaOffering.ts holds this in data; the component holds it in form.
    for (const banned of ['score', 'rating', 'confidence', 'severity', 'rank']) {
      expect(maia().toLowerCase()).not.toContain(`${banned}:`);
    }
    expect(maia()).toContain('evidenceCount');
  });
});

describe('insight chips carry kind, never severity', () => {
  it('exposes no ranked chip and no severity prop', () => {
    const chip = sourceFiles.find((f) => f.name === 'StudioInsightChip.tsx')!.code;
    for (const banned of ['severity', 'priority', 'critical', 'level']) {
      expect(chip.toLowerCase()).not.toContain(banned);
    }
    expect(Object.keys(INSIGHT_CHIP).sort()).toEqual(
      ['continuity', 'readerExperience', 'structure', 'theme'].sort(),
    );
  });
});

describe('the composition is a fixture, and inert', () => {
  it('lives outside any route', () => {
    expect(fs.existsSync(path.join(DIR, '__fixtures__'))).toBe(true);
    expect(fs.existsSync(path.join(DIR, '__fixtures__', 'page.tsx'))).toBe(false);
  });

  it('pretends no capability works — no handlers, no fetch, no state', () => {
    expect(stripComments(fixture)).not.toMatch(/onClick=/);
    expect(fixture).not.toMatch(/\bfetch\(/);
    expect(fixture).not.toMatch(/useState|useEffect/);
  });

  it('advertises nothing as coming soon', () => {
    expect(fixture.toLowerCase()).not.toContain('coming soon');
    expect(fixture).not.toMatch(/disabled=\{?true/);
  });
});

describe('measured column proportions', () => {
  it('keeps the writing field the largest column in its own room', () => {
    expect(() => assertFieldIsTheLargestColumn()).not.toThrow();
  });

  it('refuses a panel grown past the field', () => {
    const original = COLUMN_FRACTION.maiaPanel;
    try {
      (COLUMN_FRACTION as Record<string, number>).maiaPanel = 0.4;
      expect(() => assertFieldIsTheLargestColumn()).toThrow(/column of prose/);
    } finally {
      (COLUMN_FRACTION as Record<string, number>).maiaPanel = original;
    }
  });

  it('resolves proportions per viewport rather than freezing pixels', () => {
    expect(columnPx('writingField', 1680)).toBe(591);
    expect(columnPx('writingField', 1180)).toBe(415);
  });

  it('records the proportions as measured and the pixels as not', () => {
    expect(PROVENANCE.COLUMN_FRACTION.level).toBe('SAMPLED');
    expect(PROVENANCE.MEASURE.level).toBe('DERIVED');
  });
});

describe('compact preserves the observed 04→08 relations', () => {
  it('drops Materials from the right rail and keeps MAIA and the outline', () => {
    // 08 demotes Materials to a bottom strip; MAIA and the outline stay.
    expect(fixture).toMatch(/\{!compact && \(\s*<StudioPanel\s+role="materials"/);
    expect(fixture).not.toMatch(/\{!compact && \(\s*<StudioPanel\s+role="maia"/);
    expect(fixture).not.toMatch(/\{!compact && \(\s*<StudioPanel\s+role="manuscript-outline"/);
  });

  it('never hides the writing field', () => {
    expect(fixture).not.toMatch(/\{!compact && \(\s*<main/);
  });
});
