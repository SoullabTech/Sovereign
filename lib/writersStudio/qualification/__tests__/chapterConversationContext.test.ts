import {
  renderChapterConversationContext,
  type ChapterConversationContext,
} from '../chapterConversationContext';

const fixture: ChapterConversationContext = {
  contractVersion: 'r8m-chapter-context-v1',
  manuscriptId: 'manuscript-1',
  workId: 'work-1',
  manuscriptTitle: 'Elemental Alchemy',
  draftRevision: 2,
  chapter: {
    rootSectionId: 'chapter-10',
    title: 'Chapter 10: The Living Spiral',
    position: 11,
    sectionIds: ['chapter-10', 'living-spiral'],
    isFinalNumberedChapter: true,
    previousTopLevelTitle: 'Chapter 9: Aether',
    nextTopLevelTitle: 'Conclusion',
    readingId: 'reading-10',
    observations: [{
      key: 'o1',
      text: 'Maya grounds the framework in lived experience.',
      doesNotEstablish: ['author-intent'],
    }],
  },
  bookMovements: [{
    label: 'Chapter 9: Aether',
    position: 10,
    sectionCount: 4,
    standing: 'read',
    readingId: 'reading-9',
    observations: [{
      key: 'o1',
      text: 'Aether integrates the preceding elemental movements.',
      doesNotEstablish: [],
    }],
  }],
  writerEstablished: {
    understanding: 'Intentional spiral return must be preserved.',
    directives: 'Protect the direct spirit-world ontology.',
  },
  contextSources: [
    'current_chapter_reading',
    'book_structure',
    'prior_book_reading',
    'writer_established',
  ],
};

describe('R8M Chapter Conversation Context', () => {
  it('keeps chapter reading, structure, prior book reading, and writer-established meaning visibly distinct', () => {
    const rendered = renderChapterConversationContext(fixture);
    expect(rendered).toContain('[BOOK STRUCTURE — current authored facts]');
    expect(rendered).toContain('Final numbered chapter: yes');
    expect(rendered).toContain('[CURRENT CHAPTER READING — frozen observations from the explicit chapter read]');
    expect(rendered).toContain('Maya grounds the framework in lived experience.');
    expect(rendered).toContain('[PRIOR BOOK READING — current chapter-scale overview readings across the book]');
    expect(rendered).toContain('Aether integrates the preceding elemental movements.');
    expect(rendered).toContain('[WRITER ESTABLISHED — writer-authored context, not manuscript fact]');
    expect(rendered).toContain('Intentional spiral return must be preserved.');
  });

  it('states the epistemic vocabulary that prevents a model from pretending it read more than the packet', () => {
    const rendered = renderChapterConversationContext(fixture);
    expect(rendered).toContain('I know this from the chapter reading');
    expect(rendered).toContain('the authored structure shows');
    expect(rendered).toContain('earlier book readings suggest');
    expect(rendered).toContain('the writer has established');
    expect(rendered).toContain('Do not invent whole-book familiarity.');
  });
});
