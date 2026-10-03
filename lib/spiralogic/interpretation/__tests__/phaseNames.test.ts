/**
 * Phase display vocabulary — Finding 6 ruling (Kelly, 2026-07-10).
 *
 * vector/circle/spiral = interpretive-layer display names for phases 1/2/3,
 * modality-keyed, defined ONCE in PHASE_DISPLAY_NAMES. The sentinel section
 * enforces the ruling's correction clause: the house-keyed variant of this
 * vocabulary does not survive the engine refit — no house table hardcodes
 * the words; they all consume the ruled mapping.
 */

import { readFileSync } from 'fs';
import { join } from 'path';

import { SPIRALOGIC_FACETS } from '@/lib/astrology/spiralogicMapping';
import { SPIRALOGIC_HOUSE_MAPPING } from '@/lib/astrology/spiralogicHouseMapping';
import { PHASE_KEYS } from '../../registration';
import { PHASE_DISPLAY_NAMES, phaseDisplayName } from '../phaseNames';

describe('PHASE_DISPLAY_NAMES — the ruled modality-keyed mapping', () => {
  it('maps phase 1 (cardinal) to vector, 2 (fixed) to circle, 3 (mutable) to spiral', () => {
    expect(PHASE_DISPLAY_NAMES[1]).toBe('vector');
    expect(PHASE_DISPLAY_NAMES[2]).toBe('circle');
    expect(PHASE_DISPLAY_NAMES[3]).toBe('spiral');
    expect(phaseDisplayName(1)).toBe('vector');
    expect(phaseDisplayName(2)).toBe('circle');
    expect(phaseDisplayName(3)).toBe('spiral');
  });

  it('is total over the grammar phases and injective (three distinct names)', () => {
    expect(Object.keys(PHASE_DISPLAY_NAMES).sort()).toEqual(['1', '2', '3']);
    expect(new Set(Object.values(PHASE_DISPLAY_NAMES)).size).toBe(3);
  });

  it('covers exactly the phases the grammar emits (every PhaseKey suffix has a name)', () => {
    for (const key of PHASE_KEYS) {
      const phase = Number(key.split('_')[1]) as 1 | 2 | 3;
      expect(PHASE_DISPLAY_NAMES[phase]).toBeDefined();
    }
  });
});

describe('sentinel — no house-keyed phase vocabulary survives the refit (Finding 6 correction clause)', () => {
  const HOUSE_TABLE_FILES = [
    'lib/astrology/spiralogicMapping.ts',
    'lib/astrology/spiralogicHouseMapping.ts',
  ];

  it.each(HOUSE_TABLE_FILES)('%s hardcodes no vector/circle/spiral literals', (relPath) => {
    const source = readFileSync(join(__dirname, '../../../..', relPath), 'utf8');
    // A house table may CONSUME the ruled mapping; it may never DEFINE the
    // vocabulary again (a field literally assigned 'vector'/'circle'/'spiral').
    const hardcoded = source.match(/\b(?:stage|phase)\s*:\s*['"](?:vector|circle|spiral)['"]/g);
    expect(hardcoded).toBeNull();
    // And it must actually consume the ruled mapping.
    expect(source).toContain('PHASE_DISPLAY_NAMES');
  });

  it('SPIRALOGIC_FACETS stage agrees with the ruled mapping at every facet position', () => {
    for (const facet of Object.values(SPIRALOGIC_FACETS)) {
      expect(facet.stage).toBe(PHASE_DISPLAY_NAMES[facet.facetNumber]);
    }
  });

  it('SPIRALOGIC_HOUSE_MAPPING agrees with SPIRALOGIC_FACETS house-for-house', () => {
    for (const [house, data] of Object.entries(SPIRALOGIC_HOUSE_MAPPING)) {
      expect(data.stage).toBe(SPIRALOGIC_FACETS[Number(house)].stage);
    }
  });

  it('house tables expose no field named "phase" (reserved for the grammar, INV-4)', () => {
    for (const data of Object.values(SPIRALOGIC_HOUSE_MAPPING)) {
      expect('phase' in data).toBe(false);
    }
    for (const facet of Object.values(SPIRALOGIC_FACETS)) {
      expect('phase' in facet).toBe(false);
    }
  });
});
