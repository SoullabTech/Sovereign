/** Walk 2026-11-13: "Show me where" did not land on the place; holding a passage neither scrolled to it nor marked it. */
import fs from 'node:fs';
import path from 'node:path';
import { locateBlocks, paragraphProbes } from '@/lib/writersStudio/revealHeldPassage';

const blocks = ['I awoke suddenly, heart pounding.', 'The children splash abouthttps://example.org/x in the streams.', 'Middle words here.', 'Last line of the held run here.', 'After.'];

describe('the held words are found among the rendered paragraphs', () => {
  it('a one-paragraph passage', () => {
    expect(locateBlocks(blocks, 'The children splash abouthttps://example.org/x in the streams.')).toEqual({ from: 1, to: 1 });
  });
  it('a run of paragraphs, first to last', () => {
    expect(locateBlocks(blocks, 'The children splash abouthttps://example.org/x in the streams.\n\nMiddle words here.\n\nLast line of the held run here.')).toEqual({ from: 1, to: 3 });
  });
  it('⭐ MUST FAIL IF words that are not on the page are "shown"', () => {
    expect(locateBlocks(blocks, 'Words that are nowhere in this section.')).toBeNull();
    expect(paragraphProbes('   \n\n  ')).toBeNull();
  });
});

describe('the boundary', () => {
  const src = fs.readFileSync(path.join(process.cwd(), 'lib/writersStudio/revealHeldPassage.ts'), 'utf8');
  it('⭐ MUST FAIL IF revealing writes to the manuscript: no text, attribute or node of the editor is changed', () => {
    expect(src).not.toMatch(/\.(textContent|innerText|innerHTML|nodeValue)\s*=/);
    expect(src).not.toMatch(/setAttribute|\.style\.|appendChild\((first|last|editor)|insertBefore|replaceWith/);
  });
  it('Show me where uses the verified passage, and falls back to the section', () => {
    const panel = fs.readFileSync(path.join(process.cwd(), 'app/dev/writers-studio-pc3-live/EditorialLetterPanel.tsx'), 'utf8');
    expect(panel).toMatch(/data-letter-act="where"[^>]*onClick=\{\(\) => void where\(it, sec\.draftSectionId\)\}/);
    expect(panel).toMatch(/if \(target\) props\.onShowPassage\(target\); else props\.onShowSection\(sectionId\);/);
    const controller = fs.readFileSync(path.join(process.cwd(), 'app/dev/writers-studio-pc3-live/P4R1WriteEditController.tsx'), 'utf8');
    expect(controller).toMatch(/holdPassage\(section, range\.start, range\.end, exact\);\s+\/\*[^*]*\*\/\s+revealHeldPassage\(section\.draftSectionId, exact\);/);
  });
});
