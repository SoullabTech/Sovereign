import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const read = (p: string) => fs.readFileSync(path.join(ROOT, p), 'utf8');

describe('Writer Studio Prose View', () => {
  const view = read('app/dev/writers-studio-pc3-live/P4R1Pc3WriteEditView.tsx');
  const css = read('app/dev/writers-studio-p4r1/p4r1-live.css');
  const typesetting = read('app/writers-studio/full-redesign/manuscriptTypesetting.ts');
  const fullCss = read('app/dev/writers-studio-full-redesign-review/full-redesign-review.css');
  const whole = read('app/writers-studio/canvas/WholeManuscriptSurface.tsx');
  const focus = read('app/dev/writers-studio-pc3-live/IsolatedEditorialRoom.tsx');

  it('makes a continuous chapter the default while retaining exact Edit', () => {
    expect(view).toContain('data-prose-view');
    expect(view).toContain('>Prose</button>');
    expect(view).toContain('>Edit</button>');
    expect(view).toContain('chapterSpanFor');
    expect(view).toContain('Edit this section');
  });

  it('uses typesetting without rewriting canonical source', () => {
    expect(view).toContain('typesetManuscriptBody');
    expect(typesetting).toContain('Preserve every authored/extracted character');
    expect(typesetting).toContain('markdownWrapped');
  });

  it('suppresses print folios from prose presentation', () => {
    expect(view).toContain("if (block.kind === 'folio') return null");
    expect(fullCss).toContain("p[data-write-block='folio'] { display: none; }");
  });

  it('keeps the Prose view visually manuscript-first', () => {
    expect(css).toContain('.p4r1-prose-page');
    expect(css).toContain('font-family:var(--fr-serif-stack)');
    expect(css).toContain('.p4r1-prose-section>blockquote');
  });

  it('keeps Edit on the continuous chapter instead of one storage slice', () => {
    expect(view).toContain('<WholeManuscriptSurface');
    expect(view).toContain('data-chapter-edit');
    expect(view).toContain('captureMountedBeforeLeave');
    expect(whole).toContain('showHeadings?: boolean');
    expect(whole).toContain('data-whole-manuscript-heading');
  });

  it('keeps Attention Map returns inside a bounded, wheel-scrollable canvas', () => {
    expect(css).toMatch(/\.p4r1-attention-write-return\{[^}]*height:100%;[^}]*overflow:hidden;/s);
    expect(css).toContain('.p4r1-attention-write-return>.p4r1-edit-host');
    expect(css).toContain('.p4r1-attention-write-return>.p4r1-prose-host');
    expect(css).toMatch(/\.p4r1-attention-write-return>\.p4r1-edit-host,[\s\S]*?flex:1 1 auto;[\s\S]*?height:auto;[\s\S]*?min-height:0;/);
    expect(whole).toContain("style={{ position: 'relative', height: '100%', overflowY: 'auto' }}");
  });

  it('shows a plain Light-to-Heavy edit preference while preserving the five-level law', () => {
    expect(focus).toContain("1: 'Light'");
    expect(focus).toContain("5: 'Heavy'");
    expect(focus).toContain('<span>Edit strength</span>');
    expect(focus).toContain('Your voice remains the reference');
  });
});
