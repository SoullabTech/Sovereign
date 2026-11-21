/**
 * Beta 2026-11-17: "I highlighted some sentences but I could not see what to click."
 * A highlight that cannot become a held passage must be said, never dropped in silence.
 */
import { readFileSync } from 'fs';
import { join } from 'path';
import { DESK_SELECTION_NOTICE, unheldSelectionNotice } from '@/lib/writersStudio/selectionNotice';
import { locateUniquePassage } from '@/lib/writersStudio/rebuild/editorialCollaboration';
import { locateUniquePresentationPassage } from '@/lib/writersStudio/presentationPassageLocator';

const body = 'The river was cold. I waded in anyway.\n\nThe river was cold, and so was I.';

describe('why highlighted words could not be held', () => {
  it('repeated words ask for a little more', () => {
    expect(locateUniquePassage(body, 'The river was cold')).toBeNull();
    expect(unheldSelectionNotice(body, 'The river was cold')).toMatch(/more than once/);
  });

  it('a highlight across a paragraph break is held as the exact Source words', () => {
    const acrossParagraphs = 'I waded in anyway.\nThe river'; // the page shows one break, the text holds two
    expect(locateUniquePassage(body, acrossParagraphs)).toBeNull();
    const located = locateUniquePresentationPassage(body, acrossParagraphs);
    expect(located).not.toBeNull();
    expect(Array.from(body).slice(located!.start, located!.end).join('')).toBe('I waded in anyway.\n\nThe river');
  });

  it('words that still cannot be matched (formatting marks in the text) name formatting', () => {
    const styled = 'The *river* ran on.';
    expect(locateUniquePassage(styled, 'The river ran')).toBeNull();
    expect(locateUniquePresentationPassage(styled, 'The river ran')).toBeNull();
    expect(unheldSelectionNotice(styled, 'The river ran')).toMatch(/italics or other formatting/);
  });

  it('NEGATIVE: words that can be held are held, so no notice is needed', () => {
    expect(locateUniquePassage(body, 'I waded in anyway.')).not.toBeNull();
  });

  it('the desk notice points to the writer’s own words, not a new control', () => {
    expect(DESK_SELECTION_NOTICE).toMatch(/quote them in your message to MAIA/);
  });
});

describe('the Write view never drops a highlight silently', () => {
  const view = readFileSync(join(process.cwd(), 'app/dev/writers-studio-pc3-live/P4R1Pc3WriteEditView.tsx'), 'utf8');
  const inspect = view.slice(view.indexOf('const inspect = () => {'), view.indexOf("document.addEventListener('selectionchange', inspect)"));

  it('an unheld page highlight sets a notice', () => {
    expect(inspect).toMatch(/if \(!section \|\| !located\) \{[\s\S]*?setSelectionProblem\(\{ rect: picked\.rect, message: unheldSelectionNotice/);
  });

  it('a highlight inside the passage desk sets the desk notice', () => {
    expect(inspect).toMatch(/selectionInPassageDesk\(\) \? \{ rect: null, message: DESK_SELECTION_NOTICE \}/);
  });

  it('both notices are rendered', () => {
    expect(view).toContain('data-unheld-selection-notice');
    expect(view).toContain('data-desk-selection-notice');
  });
});
