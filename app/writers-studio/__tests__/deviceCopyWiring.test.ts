import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const read = (relative: string) => readFileSync(join(process.cwd(),relative),'utf8');

describe('WRITER-DEVICE-COPY-01 · canonical Write only', () => {
  test('the canonical Studio still mounts the unified Write host', () => {
    const page=read('app/writers-studio/page.tsx');
    const host=read('app/dev/writers-studio-p4r1/P4R1StudioHost.tsx');
    expect(page).toContain('<P4R1StudioHost defaultMode="home"');
    expect(host).toContain('<P4R1WriteEditController');
  });
  test('device export stays attached to Write, with complete manuscript identity and live text', () => {
    const source=read('app/dev/writers-studio-pc3-live/P4R1Pc3WriteEditView.tsx');
    // This view is mounted exclusively by P4R1WriteEditController in the
    // unified Studio host. The retired surfaceMode prop is not available.
    expect(source).not.toContain('props.surfaceMode');
    const host=read('app/dev/writers-studio-p4r1/P4R1StudioHost.tsx');
    expect(host).toContain(': <P4R1WriteEditController />');
    expect(host).toContain("mode === 'develop' ? <P4R1DevelopController />");
    expect(host).toContain("mode === 'review' ? <P4R1ReviewController />");
    expect(source).toContain('<SaveDeviceCopy');
    expect(source).toContain('key={props.context.manuscriptId}');
    expect(source).toContain('sections={props.context.sections}');
    expect(source).toContain('latestBody={props.writing.bodyOf}');
    expect(source).toContain('hasUnsavedWork={props.writing.hasUnsavedWork}');
    expect(source).toContain('version={props.writing.currentRevisionId()}');
  });
  test('the personal device boundary has no cloud or server write mechanism', () => {
    const ui=read('app/dev/writers-studio-pc3-live/SaveDeviceCopy.tsx');
    const pure=read('lib/writersStudio/deviceManuscriptCopy.ts');
    expect(ui).toContain('URL.createObjectURL');
    expect(ui).toContain('a.download = copy.filename');
    expect(ui).toContain("download('txt')");
    expect(ui).toContain("download('md')");
    expect(ui).toContain("download('json')");
    expect(ui+pure).not.toMatch(/apiFetch\(|fetch\(|localStorage\.|document\.cookie|oauth|sendBeacon\(/);
  });
});
