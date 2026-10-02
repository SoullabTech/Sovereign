import fs from 'node:fs';
import path from 'node:path';
import {
  allowedStandingsFor,
  validateLineageItem,
  type IntellectualLineageItem,
} from '@/lib/writersStudio/intellectualLineage';
import type { WorkMaturity } from '@/lib/writersStudio/workMaturity';

const ROOT = process.cwd();
const route = fs.readFileSync(
  path.join(ROOT, 'app/api/sovereign/manuscripts/[id]/lineage-scan/route.ts'),
  'utf8',
);

const maturity: WorkMaturity = {
  observedExtent: 'substantial',
  declaredState: 'existing-manuscript',
  writtenSectionIds: ['s1'],
  emptySectionIds: [],
  totalCharacters: 100_000,
};

const base: IntellectualLineageItem = {
  id: 'x1',
  kind: 'quotation',
  standing: 'evidenced-in-manuscript',
  statement: 'A quotation appears here.',
  manuscriptLoci: [{ sectionId: 's1' }],
  sourceRefs: [{ type: 'bibliography-entry', key: 'B1', label: 'Source' }],
  notes: null,
  provenance: 'maia-candidate',
};

describe('C15 intellectual lineage', () => {
  it('keeps pre-manuscript work prospective rather than evidentiary', () => {
    expect(allowedStandingsFor('pre-manuscript')).toEqual([
      'prospective-research-direction',
      'unresolved',
    ]);
  });

  it('requires an exact manuscript locus for manuscript-evidenced relationships', () => {
    expect(validateLineageItem(base, maturity)).toEqual({ ok: true });
    expect(validateLineageItem({
      ...base,
      manuscriptLoci: [],
    }, maturity)).toEqual({
      ok: false,
      reason: 'manuscript_evidence_requires_locus',
    });
  });

  it('keeps the scan route read-only with respect to manuscript and bibliography', () => {
    expect(route).toContain('LINEAGE_SCAN_SYSTEM');
    expect(route).toContain('This is an EXISTING manuscript');
    expect(route).not.toMatch(/UPDATE\s+manuscript|INSERT\s+INTO\s+manuscript|DELETE\s+FROM\s+manuscript/i);
    expect(route).not.toMatch(/bibliograph[^\n]{0,80}(UPDATE|INSERT|DELETE)/i);
  });

  it('returns candidates rather than accepted lineage records', () => {
    expect(route).toContain('candidate');
    expect(route).not.toContain('acceptLineage');
    expect(route).not.toContain('applyCitation');
  });
});
