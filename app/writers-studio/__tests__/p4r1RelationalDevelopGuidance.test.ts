import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const read = (p: string) => fs.readFileSync(path.join(ROOT, p), 'utf8');

describe('Writer Studio relational Develop guidance', () => {
  const develop = read('app/dev/writers-studio-pc3-live/P4R1DevelopView.tsx');
  const css = read('app/dev/writers-studio-p4r1/p4r1-live.css');
  const ask = read('lib/manuscript/ask/developmentalAskReader.ts');
  const reader = read('lib/manuscript/developmentalReader/render.ts');
  const dance = read('app/dev/writers-studio-pc3-live/EditorialDancePanel.tsx');
  const controller = read('app/dev/writers-studio-pc3-live/P4R1DevelopController.tsx');

  it('puts a humane chapter read before advanced Develop machinery', () => {
    const arrival = develop.indexOf('p4r1-intent-arrival');
    const chapterReview = develop.indexOf('<ChapterReviewPanel', arrival);
    const more = develop.indexOf('More ways to explore', arrival);
    const attention = develop.indexOf('<AttentionMapPanel', arrival);
    expect(chapterReview).toBeGreaterThan(arrival);
    expect(more).toBeGreaterThan(chapterReview);
    expect(attention).toBeGreaterThan(more);
    expect(develop).toContain('Let MAIA read this chapter.');
    expect(develop).toContain('Read this chapter');
    expect(controller).toContain('begin-here: What is working — begin positively and specifically.');
    expect(develop).toContain('These are places to begin a conversation, not conclusions.');
    expect(develop).toContain('Talk with MAIA about the movement');
    expect(develop).toContain('Talk with MAIA about what to protect');
    expect(develop).toContain('Talk with MAIA about what may need strengthening');
    expect(develop).toContain('Try a revision');
    expect(develop).toContain('Chapter scorecard');
    expect(controller).toContain('Respond directly to the writer as a perceptive, encouraging editor');
    expect(controller).toContain('Relationship comes first. Before any problem, friction, or recommendation');
    expect(controller).toContain('what you genuinely appreciate');
    expect(controller).toContain('brilliant or genius');
    expect(controller).toContain('Never flatter and never manufacture praise');
    expect(develop).toContain('What feels alive here');
  });

  it('keeps saved chapter analysis available beyond the immediate tab', () => {
    expect(controller).toContain('window.localStorage.getItem(key) ?? window.sessionStorage.getItem(key)');
    expect(controller).toContain('window.localStorage.setItem(key, raw)');
    expect(controller).toContain('window.localStorage.setItem(');
    expect(controller).toContain('writers-studio:chapter-review:v1');
  });

  it('treats each selected chapter as a distinct developmental subject', () => {
    expect(controller).toContain('const previousChapterRootRef = useRef<string | null>(null)');
    expect(controller).toContain('previousChapterRootRef.current = currentChapterRootId');
    expect(controller).toContain('setChapterReview(null)');
    expect(controller).toContain('setChapterBookFit(null)');
    expect(controller).toContain('setChapterMovement(null)');
  });

  it('lets chapter-root rail selections reveal the chapter review rather than cover it', () => {
    expect(develop).toContain("import { chapterSpanFor, type RebuildSection }");
    expect(develop).toContain('const selectsChapterRoot = chapter?.root.draftSectionId === sectionId');
    expect(develop).toContain('setRailSelectionId(selectsChapterRoot ? null : sectionId)');
    expect(develop).toContain('ChapterReviewPanel own it');
  });

  it('keeps grading and book-fit tools secondary to the conversation', () => {
    expect(develop).toContain('More ways to look');
    expect(develop).toContain('Chapter scorecard');
    expect(develop).toContain('How does this chapter fit the book?');
    expect(develop).toContain('Optional craft guide · not a grade');
    expect(develop).not.toContain('Start with the few changes that do the most work.');
    expect(controller).toContain('writers-studio:chapter-scorecard:v1');
    expect(controller).toContain('chapter-scorecard-previous:v1');
  });

  it('continues from the first read into book-fit and chapter-movement questions', () => {
    const attentionRoute = read('app/api/sovereign/manuscripts/[id]/attention-map/route.ts');
    expect(develop).toContain('How does this chapter fit the book?');
    expect(develop).toContain('Talk with MAIA about the movement');
    expect(develop).toContain('data-chapter-book-fit');
    expect(develop).toContain('data-chapter-conversation');
    expect(controller).toContain('The writer has asked how the currently reviewed chapter fits into the whole book.');
    expect(controller).toContain('What this chapter contributes to the whole book');
    expect(controller).toContain('strongest movement');
    expect(controller).toContain('Book placement is a hierarchical read, not a 100k-token monolith.');
    expect(controller).toContain('topLevelBookSegments(context.sections)');
    expect(controller).toContain('chapter-scale Overview readings across the authored top-level movements');
    expect(attentionRoute).toContain("readings.every((reading) => reading.scope.commissionedLens === 'overview')");
    expect(attentionRoute).toContain("error: 'overview_segments_overlap'");
  });

  it('uses the MAIA field for chapter exploration instead of stacking report panels', () => {
    expect(develop).toContain("useState<'book-fit' | 'scorecard' | null>(null)");
    expect(develop).toContain("activeExpansion === 'book-fit' && bookFit");
    expect(develop).toContain("activeExpansion === 'scorecard' && scorecard");
    expect(develop).not.toContain("activeExpansion === 'protect' && protect");
    expect(develop).not.toContain("activeExpansion === 'movement' && movement");
    expect(develop).not.toContain("activeExpansion === 'minimal-path' && minimalPath");
    expect(develop).toContain('const beginChapterDialogue = (item: AttentionItem, kind: ChapterDialogueKind)');
    expect(develop).toContain('autoSendInitialQuestion');
    expect(develop).toContain('Please make this a conversation, not a report or checklist.');
    expect(develop).toContain('Let my Working with MAIA setting govern how active you are.');
  });

  it('commissions the whole-manuscript synthesis as an editorial pass, not an abstract dashboard', () => {
    expect(controller).toContain('writers-studio:editorial-pass:v1');
    expect(controller).toContain('MAIA is reading through the manuscript for edit opportunities');
    expect(controller).toContain('Make an editorial pass through this whole manuscript from macro to micro.');
    expect(controller).toContain('clarification, compression, expansion, transition, reordering, repetition, voice, pacing');
    expect(controller).toContain('Do not rewrite the prose yet.');
  });

  it('makes edit options explicit once the writer reaches a passage', () => {
    expect(dance).toContain('<b>Show edit options</b>');
    expect(dance).toContain('Nothing changes until you apply one.');
    expect(dance).toContain('Show revision options');
  });

  it('gives a selected chapter plain, relational choices and an explicit chapter read', () => {
    expect(develop).toContain('Talk with MAIA first');
    expect(develop).toContain('Read this ${props.scope.kind === \'chapter\' ? \'chapter\' : \'section\'} for ${LABEL[activeField]}');
    expect(develop).toContain('See how it is shaped');
    expect(develop).toContain('Notice what returns');
    expect(develop).toContain('Meet it as a reader');
  });

  it('foregrounds a human invitation while keeping the frozen reading available', () => {
    expect(develop).toContain('Something is returning here');
    expect(develop).toContain('See the saved reading in full');
    expect(develop).toContain('You do not have to decide what this means alone');
    expect(develop).toContain('Explain it plainly');
    expect(develop).toContain('Talk with me about it');
  });

  it('keeps MAIA visibly related to the selected observation before a model call', () => {
    expect(develop).toContain("? 'With this observation'");
    expect(develop).toContain('p4r1-observation-maia-ready');
  });
  it('routes observation dialogue through the guided MAIA translation law', () => {
    expect(ask).toContain("editorialDirective('guided')");
    expect(ask).toContain('Talk with the writer, not at them.');
    expect(ask).toContain("DEVELOPMENTAL_ASKER_VERSION = 'ws2-07e-02'");
  });

  it('makes future saved readings writer-facing instead of taxonomy-facing', () => {
    expect(reader).toContain('Write as MAIA noticing something WITH a writer');
    expect(reader).toContain('The taxonomy belongs in metadata');
    expect(reader).toContain("READER_VERSION = 'DEVELOPMENTAL-READER-11'");
  });

  it('pins colors to Studio variables so night mode cannot fall back to native black', () => {
    expect(css).toContain('Theme-safe text: no native/button black may leak into the night surfaces.');
    expect(css).toContain('.p4r1-root .p4r1-developmental-options button,');
    expect(css).toContain('color:var(--fr-ink)');
  });

  it('shows a facts-only chapter shape before asking MAIA to read Structure', () => {
    expect(develop).toContain("activeField === 'structure' && props.scope.kind === 'chapter'");
    expect(develop).toContain('<ChapterShape manuscriptId={props.manuscriptId} sections={props.sections} scope={props.scope} />');
    expect(develop).toContain('ingestion cut is never');
    expect(develop).toContain('Explicit structure preserved by the manuscript');
    expect(develop).toContain('Import details');
    expect(develop).toContain('level unconfirmed');
    expect(develop).toContain('Restore chapter structure');
    expect(develop).toContain('some of their levels were lost in import');
    expect(reader).toContain('SECTION IDS AND POSITIONS ARE TECHNICAL EVIDENCE COORDINATES, NOT AUTHORSHIP');
    expect(develop).toContain('Opening epigraph');
    expect(develop).toContain('words in this chapter span');
    expect(css).toContain('.p4r1-root .p4r1-chapter-outline');
  });
});
