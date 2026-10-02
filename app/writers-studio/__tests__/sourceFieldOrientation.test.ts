import fs from 'node:fs';
import path from 'node:path';
import { SOURCE_FIELD_ORIENTATION_SYSTEM } from '@/lib/writersStudio/sourceFieldOrientation';
import { lineageProcessForState } from '@/lib/writersStudio/intellectualLineageProcess';

const ROOT = process.cwd();

describe('C15 pre-manuscript source-field orientation', () => {
  it('treats source terrains as possible inquiry, never manuscript position', () => {
    const law = SOURCE_FIELD_ORIENTATION_SYSTEM.join(' ');
    expect(law).toContain('There is no manuscript yet');
    expect(law).toContain('possible field of inquiry');
    expect(law).toContain('Do not convert source claims into the writer’s beliefs');
    expect(law).toContain('invitations only');
  });

  it('uses declared Work materials and labels unread bodies honestly', () => {
    const route = fs.readFileSync(
      path.join(ROOT, 'app/api/sovereign/living-works/[id]/source-field-orientation/route.ts'),
      'utf8',
    );
    expect(route).toContain('FROM living_work_materials');
    expect(route).toContain("material_type === 'source_upload'");
    expect(route).toContain("material_type === 'idea'");
    expect(route).toContain("coverage: 'full' | 'metadata-only'");
    expect(route).toContain('metadata-only means MAIA has NOT read the material body');
    expect(route).not.toMatch(/slice\([^)]*transcription_reviewed|substring\([^)]*transcription_reviewed/i);
  });

  it('gives pre-manuscript a different developmental research process', () => {
    const plan = lineageProcessForState('pre-manuscript');
    expect(plan.phases).toEqual([
      'source-field-orientation',
      'prospective-research',
      'possible-structure',
      'writing-threshold',
    ]);
    expect(plan.openingQuestion).toContain('intellectual field');
  });

  it('makes the lineage UI state-sensitive', () => {
    const view = fs.readFileSync(
      path.join(ROOT, 'app/dev/writers-studio-pc3-live/P4R1DevelopView.tsx'),
      'utf8',
    );
    expect(view).toContain('Existing-manuscript research');
    expect(view).toContain('Partial-manuscript research');
    expect(view).toContain('Pre-manuscript exploration');
    expect(view).toContain('Explore Sources and Ideas');
  });
});
