/**
 * R8M — lawful, epistemically separated context for Writer's Studio model
 * qualification and later Chapter Conversation integration.
 *
 * This is NOT a model router and grants no authority. It is the packet all
 * candidate models must receive identically during qualification.
 */

export type ChapterContextSource =
  | 'current_chapter_reading'
  | 'book_structure'
  | 'prior_book_reading'
  | 'writer_established'
  | 'conversation_history'
  | 'current_locus';

export interface QualifiedObservation {
  readonly key: string;
  readonly text: string;
  readonly doesNotEstablish: readonly string[];
}

export interface BookMovementContext {
  readonly label: string;
  readonly position: number;
  readonly sectionCount: number;
  readonly standing: 'read' | 'not_read' | 'none';
  readonly readingId?: string;
  readonly observations: readonly QualifiedObservation[];
}

export interface ChapterConversationContext {
  readonly contractVersion: 'r8m-chapter-context-v1';
  readonly manuscriptId: string;
  readonly workId: string | null;
  readonly manuscriptTitle: string;
  readonly draftRevision: number;
  readonly chapter: {
    readonly rootSectionId: string;
    readonly title: string;
    readonly position: number;
    readonly sectionIds: readonly string[];
    readonly isFinalNumberedChapter: boolean;
    readonly previousTopLevelTitle: string | null;
    readonly nextTopLevelTitle: string | null;
    readonly readingId: string;
    readonly observations: readonly QualifiedObservation[];
  };
  readonly bookMovements: readonly BookMovementContext[];
  readonly writerEstablished: {
    readonly understanding: string;
    readonly directives: string;
  };
  readonly contextSources: readonly ChapterContextSource[];
}

const renderObservations = (items: readonly QualifiedObservation[]) =>
  items.length
    ? items.map((item) => [
        `- ${item.text}`,
        item.doesNotEstablish.length
          ? `  Does not establish: ${item.doesNotEstablish.join(', ')}`
          : '',
      ].filter(Boolean).join('\n')).join('\n')
    : '(no frozen observations)';

export function renderChapterConversationContext(ctx: ChapterConversationContext): string {
  const movements = ctx.bookMovements.map((movement) => [
    `${movement.position}. ${movement.label} · ${movement.standing}`,
    movement.readingId ? `   Reading: ${movement.readingId}` : '',
    movement.observations.length
      ? movement.observations.map((o) => `   - ${o.text}`).join('\n')
      : '   - no retained overview observations',
  ].filter(Boolean).join('\n')).join('\n');

  return [
    '=== CHAPTER CONVERSATION CONTEXT · R8M ===',
    'Keep each source class epistemically distinct. Do not convert one source into another.',
    '',
    '[BOOK STRUCTURE — current authored facts]',
    `Work: ${ctx.manuscriptTitle}`,
    `Current chapter: ${ctx.chapter.title}`,
    `Top-level position: ${ctx.chapter.position}`,
    `Previous top-level movement: ${ctx.chapter.previousTopLevelTitle ?? '(none)'}`,
    `Next top-level movement: ${ctx.chapter.nextTopLevelTitle ?? '(none)'}`,
    `Final numbered chapter: ${ctx.chapter.isFinalNumberedChapter ? 'yes' : 'no'}`,
    '',
    '[CURRENT CHAPTER READING — frozen observations from the explicit chapter read]',
    `Reading id: ${ctx.chapter.readingId}`,
    renderObservations(ctx.chapter.observations),
    '',
    '[PRIOR BOOK READING — current chapter-scale overview readings across the book]',
    movements || '(none)',
    '',
    '[WRITER ESTABLISHED — writer-authored context, not manuscript fact]',
    ctx.writerEstablished.understanding || '(none declared)',
    ctx.writerEstablished.directives || '(no active directives)',
    '',
    '[EPISTEMIC RULE]',
    'You may say: “I know this from the chapter reading,” “the authored structure shows,” “earlier book readings suggest,” or “the writer has established.”',
    'If the packet does not establish something, say that you do not currently know it. Do not invent whole-book familiarity.',
  ].join('\n');
}
