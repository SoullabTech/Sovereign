import fs from 'node:fs';
import path from 'node:path';
import { pc3Paragraphs } from '@/app/writers-studio/full-redesign/liveWriteAdapter';

const ROOT = process.cwd();
const read = (p: string) => fs.readFileSync(path.join(ROOT, p), 'utf8');

describe('Writer Studio immediate manuscript-selection support', () => {
  const writeView = read('app/dev/writers-studio-pc3-live/P4R1Pc3WriteEditView.tsx');
  const developView = read('app/dev/writers-studio-pc3-live/P4R1DevelopView.tsx');
  const developController = read('app/dev/writers-studio-pc3-live/P4R1DevelopController.tsx');
  const writeRoom = read('app/writers-studio/full-redesign/WriteRoom.tsx');
  const css = read('app/dev/writers-studio-full-redesign-review/full-redesign-review.css');

  it('keeps blank lines as paragraph boundaries while reflowing PDF hard wraps inside them', () => {
    expect(pc3Paragraphs('first hard\nwrap\n \nsecond')).toEqual(['first hard\nwrap', 'second']);
  });

  it('typesets prose at a readable measure with visible paragraph rhythm', () => {
    expect(css).toContain('.fr-write-editor {');
    expect(css).toContain('white-space: normal');
    expect(css).toContain('.fr-write-editor p { margin: 0 0 30px;');
    expect(css).toContain("p[data-write-block='epigraph']");
    expect(css).toContain("p[data-write-block='subhead']");
  });

  it('treats a Write rail choice as an attentional act even when it is already open', () => {
    expect(writeView).toContain('setRailSelectionId(sectionId);');
    expect(writeView.indexOf('setRailSelectionId(sectionId);')).toBeLessThan(
      writeView.indexOf('if (sectionId === props.writing.activeId) return;'),
    );
    expect(writeRoom).toContain('if (onOpenChapter) {');
    expect(writeRoom).toContain('onOpenChapter(c.id);');
    expect(writeView).toContain('WRITE_RELATIONAL_GEOMETRY');
    expect(writeView).toContain('data-write-locus-support');
    expect(writeView).toContain('Talk about this');
    expect(writeView).toContain('Develop this place');
  });

  it('turns a Develop rail choice into the actual selected scope', () => {
    expect(developController).toContain("if (chapter?.root.draftSectionId === sectionId && chapter.sections.length)");
    expect(developController).toContain("kind: 'chapter'");
    expect(developController).toContain("kind: 'section'");
  });

  it('replaces the generic overview with immediate selected-place support', () => {
    expect(developView).toContain('setRailSelectionId(sectionId);');
    expect(developView).toContain('data-develop-locus=');
    expect(developView).toContain('Chapter selected');
    expect(developView).toContain('Section selected');
    expect(developView).toContain('without going through the whole-Work material first');
    expect(developView).toContain('onSection={selectManuscriptLocus}');
  });
});
