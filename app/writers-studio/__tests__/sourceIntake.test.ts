import { readFileSync } from 'fs';
import { join } from 'path';

const root = join(__dirname, '..');
const read = (...parts: string[]) => readFileSync(join(root, ...parts), 'utf8');

describe('WS-SOURCE-INTAKE-01 — outside material remains source material', () => {
  it('Studio Home exposes a real source-intake door distinct from manuscript import', () => {
    const home = read('HomeView.tsx');
    expect(home).toContain('Bring notes & sources');
    expect(home).toContain('SOURCE_INTAKE_HREF');
    expect(home).toContain('Import writing');
  });

  it('the intake surface requires review before a transcription becomes reviewed', () => {
    const page = read('sources', 'page.tsx');
    expect(page).toContain('Review transcription');
    expect(page).toContain('Accept transcription');
    expect(page).toContain("materialType: 'source_upload'");
    expect(page).toContain('It remains source material, not manuscript text.');
    expect(page).toContain('Delete source');
    expect(page).toContain("method: 'DELETE'");
    expect(page).toContain('Automatic handwriting transcription is still being tested.');
    expect(page).toContain('When automatic reading is available');
    expect(page).not.toContain('Handwritten and scanned pages are transcribed locally');
  });

  it('Materials renders source_upload as a material rather than a manuscript', () => {
    const drawer = read('canvas', 'MaterialsDrawer.tsx');
    expect(drawer).toContain("materialType === 'source_upload'");
    expect(drawer).toContain('type="source_upload"');
    expect(drawer).toContain('bring new source material');
  });

  it('the current rebuilt Write room exposes real Work materials', () => {
    const rebuild = read('rebuild', 'RebuildStudioClient.tsx');
    expect(rebuild).toContain('data-work-materials');
    expect(rebuild).toContain('workSourceMaterials');
    expect(rebuild).toContain('SOURCE_INTAKE_HREF');
    expect(rebuild).toContain('/api/writers-studio/sources/${material.materialId}/file');
  });

});
