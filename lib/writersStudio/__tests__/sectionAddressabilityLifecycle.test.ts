/**
 * WS2-NAV-01 — the lifecycle the pilot depends on:
 * import stays unconverted · the member act converts · navigation follows · reload keeps it.
 *
 * These are unit + structural assertions. Clicking a real row in a browser is a
 * production witness, not something this suite can claim to have done.
 */
import fs from 'fs';
import path from 'path';
import { chooseMount, type WriteState } from '../writeStateClient';

const REPO = path.resolve(__dirname, '../../..');
const read = (p: string) => fs.readFileSync(path.join(REPO, p), 'utf8');

describe('import alone does NOT make a Work section-addressable', () => {
  const ingestPaths = [
    'app/api/sovereign/manuscripts/route.ts',
    'app/api/sovereign/manuscripts/ingest/route.ts',
  ];

  it.each(ingestPaths)('%s never sets section_addressable_at', (p) => {
    expect(read(p)).not.toMatch(/section_addressable_at\s*=/);
  });

  it.each(ingestPaths)('%s never issues the convert command', (p) => {
    expect(read(p)).not.toMatch(/convert\s*:\s*true/);
  });

  it('an imported Work therefore mounts as worktable, not sections', () => {
    const imported: WriteState = {
      mode: 'continuous',
      version: 1,
      content: '# Chapter 1\n\ntext',
      notice: { title: 't', body: 'b' },
    };
    expect(chooseMount('ready', imported).mount).toBe('worktable');
  });
});

describe('only the explicit member act converts', () => {
  it('the act is reachable from exactly one place, and it is a member gesture', () => {
    const page = read('app/writers-studio/canvas/page.tsx');
    expect(page).toMatch(/data-action="confirm-section-breaks"/);
    expect(page).toMatch(/onClick=\{onConfirmSectionBreaks\}/);
  });

  it('no automatic conversion fires on mount or on save', () => {
    const page = read('app/writers-studio/canvas/page.tsx');
    // the command appears only inside the callback the button invokes
    const callSites = page.match(/confirmSectionBreaks\(/g) ?? [];
    expect(callSites).toHaveLength(1);
    expect(page).not.toMatch(/useEffect\([^)]*confirmSectionBreaks/);
  });

  it('conversion carries no content — the save contract is untouched', () => {
    expect(read('lib/writersStudio/confirmSectionBreaks.ts'))
      .toMatch(/JSON\.stringify\(\{\s*convert:\s*true\s*\}\)/);
  });
});

describe('after conversion the Work is navigable — and navigability comes from the server', () => {
  /* `section_aware` is the WRITE STATE the server reports; `sections` is the
     MOUNT the canvas chooses from it. Naming them apart matters — conflating
     them is what made an earlier draft of this test assert against a mode that
     does not exist. */
  const converted: WriteState = {
    mode: 'section_aware',
    version: 2,
    rows: [
      { id: 's1', heading: 'Chapter 1', position: 0 },
      { id: 's2', heading: 'Chapter 2', position: 1 },
      { id: 's3', heading: 'Chapter 3', position: 2 },
    ] as never,
    sections: [] as never,
  } as WriteState;

  it('mounts the section-addressable branch', () => {
    const m = chooseMount('ready', converted);
    expect(m.mount).toBe('sections');
    if (m.mount !== 'sections') return;
    expect(m.rows).toHaveLength(3);
  });

  it('RELOAD preserves it: the same server state yields the same mount, with no client memory', () => {
    const first = chooseMount('ready', converted);
    const afterReload = chooseMount('ready', converted); // fresh page, same GET
    expect(afterReload).toEqual(first);
    expect(afterReload.mount).toBe('sections');
  });

  it('a failed conversion leaves the Work exactly where it was', () => {
    const stillContinuous: WriteState = {
      mode: 'continuous', version: 1, content: 'x', notice: { title: 't', body: 'b' },
    };
    expect(chooseMount('ready', stillContinuous).mount).toBe('worktable');
  });
});

describe('the unconverted outline explains itself instead of sitting inert', () => {
  it('names its state and offers the act', () => {
    const page = read('app/writers-studio/canvas/page.tsx');
    expect(page).toMatch(/data-outline-state="unconverted"/);
    expect(page).toMatch(/SECTION_BREAKS_COPY\.action/);
  });

  it('prefers the server\'s own reason when it has one', () => {
    const page = read('app/writers-studio/canvas/page.tsx');
    expect(page).toMatch(/writeMount\.notice\?\.title \?\? SECTION_BREAKS_COPY\.title/);
  });
});
