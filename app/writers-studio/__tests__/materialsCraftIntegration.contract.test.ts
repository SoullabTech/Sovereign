/**
 * LOCAL-INTEGRATION-MATERIALS-CRAFT-01.
 * Regression: the member sees BOTH the existing Craftsman's Table and the
 * Materials door, but must never be offered unapproved source persistence.
 * No model calls, database edits or network activity.
 */
import { readFileSync } from 'node:fs';
import { sourceUploadPostureAuthorized, sourceReviewedEditAuthorized } from '@/lib/workbench/uploadPostureAuthority';

const read = (path: string) => readFileSync(path, 'utf8');

describe('local integration: Material availability + Craftsman continuity', () => {
  it('keeps independent, hard-closed source ingest and transcription custody gates', () => {
    expect(sourceUploadPostureAuthorized()).toBe(false);
    expect(sourceReviewedEditAuthorized()).toBe(false);
    const sources = read('app/api/writers-studio/sources/route.ts');
    const edits = read('app/api/writers-studio/sources/[id]/route.ts');
    expect(sources).toMatch(/if \(!sourceUploadPostureAuthorized\(\)\) return NextResponse\.json/);
    expect(edits).toMatch(/if \(!sourceReviewedEditAuthorized\(\)\) return NextResponse\.json/);
    expect(edits).toMatch(/if \(!sourceUploadPostureAuthorized\(\)\) return NextResponse\.json/);
  });
  it('renders the Materials door within MAIA in Develop', () => {
    const view=read('app/dev/writers-studio-pc3-live/P4R1DevelopView.tsx');
    expect(view).toContain('import P4R1WorkMaterialsDoor');
    expect(view).toContain('<P4R1WorkMaterialsDoor');
    expect(view).toContain('Open Craftsman’s Table');
    expect(view).toContain('maia={maia}');
  });
  it('does not offer an enabled source-writing input while the gate is shut', () => {
    const door=read('app/dev/writers-studio-pc3-live/P4R1WorkMaterialsDoor.tsx');
    expect(door).toContain('Adding new material is temporarily paused.');
    expect(door).toContain('{false && <div className="p4r1-door-form">');
    expect(door).toContain('disabled aria-label="Add a file temporarily paused"');
    expect(door).toContain('Saving new Work material is paused');
  });
  it('keeps the Craftsman entry out of the narrow 42px Develop icon track', () => {
    const css=read('app/dev/writers-studio-p4r1/p4r1-live.css');
    const selector='.p4r1-root .p4r1-open-craft {';
    expect(css.split(selector).length - 1).toBe(1);
    const rule=css.split(selector)[1]!.split('}')[0]!;
    expect(rule).toMatch(/grid-column:\s*1\s*\/\s*-1/);
    expect(rule).toMatch(/justify-self:\s*start/);
    expect(rule).toMatch(/min-width:\s*0/);
    expect(rule).toMatch(/white-space:\s*normal/);
  });
  it('preserves the genuine Craftsman, its focus actions and writer-controlled edits', () => {
    const host=read('app/dev/writers-studio-p4r1/P4R1StudioHost.tsx');
    const write=read('app/dev/writers-studio-pc3-live/P4R1Pc3WriteEditView.tsx');
    const craft=read('app/dev/writers-studio-pc3-live/CraftsmansTableR1.tsx');
    const focus=read('app/dev/writers-studio-pc3-live/CraftFocusToolsR1.tsx');
    expect(host).toContain('developCraft');
    expect(write).toContain('<CraftsmansTableR1');
    expect(write).toContain('<CraftFocusToolsR1');
    expect(craft).toContain('Suggest an edit');
    expect(craft).toContain('Write here');
    expect(focus).toContain('Work here &amp; suggest an edit');
  });
});
