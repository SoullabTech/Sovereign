import fs from 'node:fs';
import path from 'node:path';

import { readabilityLaw } from '../readability';

const read = (relative: string) =>
  fs.readFileSync(path.resolve(process.cwd(), relative), 'utf8');

const savedReadings = read('app/oracle/reflections/page.tsx');
const symbolicCarry = read('components/house/SymbolicCarryNotice.tsx');
const facetCarry = read('components/house/FacetCarryNotice.tsx');
const originTrail = read('components/house/FacetOriginTrail.tsx');
const journalTokens = read('components/journal/room/tokens.ts');
const journalCss = read('app/journal/journal-sanctum.module.css');

describe('Soullab House readability standard', () => {
  it('sets explicit floors for meaningful text and actions', () => {
    expect(readabilityLaw.meaningfulTextFloorPx).toBe(14);
    expect(readabilityLaw.ordinaryCopyFloorPx).toBe(16);
    expect(readabilityLaw.readingCopyFloorPx).toBe(17);
    expect(readabilityLaw.actionFloorPx).toBe(16);
    expect(readabilityLaw.touchTargetPx).toBe(44);
  });
  it('uses the shared semantic readability roles on Saved Readings', () => {
    expect(savedReadings).toContain("import { readability } from '@/lib/house/readability'");
    expect(savedReadings).toContain('readability.roomTitle');
    expect(savedReadings).toContain('readability.itemTitle');
    expect(savedReadings).toContain('readability.reading');
    expect(savedReadings).toContain('readability.metadata');
    expect(savedReadings).toContain('readability.action');
    expect(savedReadings).not.toContain('text-xs');
  });

  it('keeps cross-facet provenance readable instead of micro-sized', () => {
    for (const source of [symbolicCarry, facetCarry, originTrail]) {
      expect(source).toContain("readability");
      expect(source).not.toContain('text-[9px]');
      expect(source).not.toContain('text-[10px]');
      expect(source).not.toContain('text-[11px]');
      expect(source).not.toContain('text-xs');
    }
  });
  it('raises Journal metadata and MAIA labels to the meaningful-metadata floor', () => {
    expect(journalTokens).toContain("meta: 'font-sans text-[0.875rem] sm:text-[0.9375rem]");
    expect(journalTokens).toContain("maiaLabel: 'font-sans text-[0.75rem]");
    expect(journalTokens).toContain("maiaBody: 'font-serif text-[clamp(1.0625rem");
  });

  it('binds Journal main width to the book rather than global 100vw landscape rules', () => {
    expect(journalCss).toContain('.book :global(main) {');
    expect(journalCss).toContain('width: 100% !important;');
    expect(journalCss).toContain('max-width: 100% !important;');
    expect(journalCss).toContain('min-width: 0 !important;');
    expect(journalCss).toContain('writing spine drifts right');
  });

  it('keeps interpretive symbolic layers available without pushing writing out of the first view', () => {
    expect(symbolicCarry).toContain("kind === 'source_fact'");
    expect(symbolicCarry).toContain('<details');
    expect(symbolicCarry).toContain('CLASS_LABEL[kind]');
    expect(symbolicCarry).toContain('group-open:rotate-45');
  });
});
