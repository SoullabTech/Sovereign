import fs from 'node:fs';
import path from 'node:path';
import {
  LINEAGE_PROCESS_LAW,
  LINEAGE_PROCESS_PHASES,
} from '@/lib/writersStudio/intellectualLineageProcess';

const route = fs.readFileSync(
  path.join(process.cwd(), 'app/api/sovereign/manuscripts/[id]/lineage-orientation/route.ts'),
  'utf8',
);
const view = fs.readFileSync(
  path.join(process.cwd(), 'app/dev/writers-studio-pc3-live/P4R1DevelopView.tsx'),
  'utf8',
);

describe('C15R2 macro-first intellectual lineage', () => {
  it('holds the developmental sequence whole field → chapter → locus → whole', () => {
    expect(LINEAGE_PROCESS_PHASES).toEqual([
      'source-field-orientation',
      'whole-field-orientation',
      'written-vs-planned-map',
      'chapter-lineage',
      'prospective-research',
      'exact-locus',
      'possible-structure',
      'writing-threshold',
      'whole-field-synthesis',
    ]);
    expect(LINEAGE_PROCESS_LAW.join(' ')).toContain('Begin with the whole intellectual field');
  });

  it('reuses exact-current whole-manuscript readings for macro orientation', () => {
    expect(route).toContain('developmental_readings');
    expect(route).toContain('current_whole_manuscript_readings_required');
    expect(route).toContain('WHOLE-MANUSCRIPT DEVELOPMENTAL OBSERVATIONS');
  });

  it('samples by manuscript position rather than ranking observations', () => {
    expect(route).toContain('sampleAcross');
    expect(route).toContain('firstPosition');
    expect(route).toContain('sampleAcross(lensObservations, 8)');
    expect(route).not.toMatch(/score|severity|priority/i);
  });

  it('uses the macro panel before local attribution claims', () => {
    expect(view).toContain('What intellectual world is this Work moving through?');
    expect(view).toContain('whole-field orientation');
    expect(view).toContain('directions for investigation, not attribution verdicts');
  });
});
