import { query } from '@/lib/db/postgres';
import { loadFrozenDevelopmentalReading } from '@/lib/manuscript/ask/frozenDevelopmentalReading';
import { writerUnderstandingContextForManuscript } from './writerUnderstandingServer';
import { workDirectiveContextForWork } from './workDirectivesServer';
import type {
  BookMovementContext,
  ChapterConversationContext,
  QualifiedObservation,
} from './qualification/chapterConversationContext';

type SectionRow = {
  id: string;
  position: number;
  heading: string | null;
  heading_depth: number | null;
};

type OverviewRow = {
  id: string;
  revision_number: number;
  scope: { bodyScope?: string[] } | null;
  outcome: 'reading' | 'none';
  observations: Array<{
    key?: string;
    observation?: string;
    doesNotEstablish?: string[];
  }>;
  frozen_at: Date;
};

export type ChapterConversationContextRefusal =
  | 'reading_not_found'
  | 'reading_not_current'
  | 'chapter_scope_unresolved'
  | 'work_unresolved';

export type ChapterConversationContextResult =
  | { ok: true; context: ChapterConversationContext }
  | { ok: false; refusal: ChapterConversationContextRefusal };

const toObservations = (
  observations: OverviewRow['observations'] | undefined,
): QualifiedObservation[] =>
  (observations ?? [])
    .filter((item) => typeof item?.observation === 'string' && item.observation.trim())
    .map((item, index) => ({
      key: typeof item.key === 'string' ? item.key : `o${index + 1}`,
      text: String(item.observation).trim(),
      doesNotEstablish: Array.isArray(item.doesNotEstablish)
        ? item.doesNotEstablish.filter((x): x is string => typeof x === 'string')
        : [],
    }));

const sameIds = (a: readonly string[], b: readonly string[]) =>
  a.length === b.length && a.every((id, index) => id === b[index]);

/**
 * R8C — build the lawful chapter context entirely server-side.
 *
 * The browser supplies only a reading id. Every book/chapter fact is re-read
 * under the authenticated member. No prose beyond what the already-frozen
 * developmental observations contain crosses here.
 */
export async function buildChapterConversationContext(input: {
  memberId: string;
  manuscriptId: string;
  readingId: string;
}): Promise<ChapterConversationContextResult> {
  const { memberId, manuscriptId, readingId } = input;

  const reading = await loadFrozenDevelopmentalReading(manuscriptId, readingId, memberId);
  if (!reading || reading.scope.commissionedLens !== 'overview' || reading.outcome !== 'reading') {
    return { ok: false, refusal: 'reading_not_found' };
  }

  const manuscript = await query<{ title: string }>(
    'SELECT title FROM member_manuscripts WHERE id=$1 AND member_id=$2',
    [manuscriptId, memberId],
  );
  const title = manuscript.rows[0]?.title;
  if (!title) return { ok: false, refusal: 'work_unresolved' };

  const draft = await query<{ id: string; revision_count: number }>(
    'SELECT id, revision_count FROM manuscript_working_drafts WHERE manuscript_id=$1 AND member_id=$2',
    [manuscriptId, memberId],
  );
  const currentDraft = draft.rows[0];
  if (!currentDraft) return { ok: false, refusal: 'work_unresolved' };
  if (reading.readState.revisionNumber !== currentDraft.revision_count) {
    return { ok: false, refusal: 'reading_not_current' };
  }

  const sections = await query<SectionRow>(
    `SELECT ds.id, ds.position, ms.heading, ms.heading_depth
       FROM manuscript_draft_sections ds
       LEFT JOIN manuscript_sections ms ON ms.id=ds.source_section_id
      WHERE ds.draft_id=$1
      ORDER BY ds.position ASC`,
    [currentDraft.id],
  );

  const roots = sections.rows
    .map((section, index) => ({ section, index }))
    .filter(({ section }) => section.heading_depth === 1);

  const segments = roots.map(({ section, index }, rootIndex) => ({
    root: section,
    ordinal: rootIndex + 1,
    sections: sections.rows.slice(index, roots[rootIndex + 1]?.index ?? sections.rows.length),
  }));

  const chapterScope = reading.scope.bodyScope;
  const chapterIndex = segments.findIndex((segment) =>
    sameIds(segment.sections.map((section) => section.id), chapterScope));
  if (chapterIndex < 0) return { ok: false, refusal: 'chapter_scope_unresolved' };
  const chapter = segments[chapterIndex]!;

  const overviewRows = await query<OverviewRow>(
    `SELECT id, revision_number, scope, outcome, observations, frozen_at
       FROM developmental_readings
      WHERE manuscript_id=$1
        AND member_id=$2
        AND commissioned_lens='overview'
        AND revision_number=$3
      ORDER BY frozen_at DESC`,
    [manuscriptId, memberId, currentDraft.revision_count],
  );

  const readingsFor = (ids: readonly string[]) =>
    overviewRows.rows.filter((row) => {
      const scope = Array.isArray(row.scope?.bodyScope) ? row.scope!.bodyScope! : [];
      return sameIds(scope, ids);
    });

  const preferredReading = (ids: readonly string[]) => {
    const exact = readingsFor(ids);
    return exact.find((row) => row.outcome === 'reading') ?? exact[0];
  };

  const bookMovements: BookMovementContext[] = segments.map((segment) => {
    const ids = segment.sections.map((section) => section.id);
    const found = preferredReading(ids);
    return {
      label: segment.root.heading ?? `Movement ${segment.ordinal}`,
      position: segment.ordinal,
      sectionCount: ids.length,
      standing: found ? (found.outcome === 'reading' ? 'read' : 'none') : 'not_read',
      ...(found ? { readingId: found.id } : {}),
      observations: found?.outcome === 'reading'
        ? toObservations(found.observations)
        : [],
    };
  });

  const work = await query<{ id: string }>(
    `SELECT w.id
       FROM living_works w
       JOIN living_work_expressions e
         ON e.living_work_id=w.id
        AND e.expression_type='manuscript'
        AND e.expression_id=$1
      WHERE w.member_id=$2
      ORDER BY w.id`,
    [manuscriptId, memberId],
  );
  if (work.rows.length !== 1) return { ok: false, refusal: 'work_unresolved' };
  const workId = work.rows[0]!.id;

  const writerUnderstanding = await writerUnderstandingContextForManuscript(
    memberId,
    manuscriptId,
  );
  const directives = await workDirectiveContextForWork(memberId, workId);

  const numberedChapters = segments
    .map((segment) => {
      const match = /^Chapter\s+(\d+)/i.exec(segment.root.heading ?? '');
      return match ? Number(match[1]) : null;
    })
    .filter((value): value is number => Number.isFinite(value));

  const chapterNumberMatch = /^Chapter\s+(\d+)/i.exec(chapter.root.heading ?? '');
  const chapterNumber = chapterNumberMatch ? Number(chapterNumberMatch[1]) : null;
  const maxChapter = numberedChapters.length ? Math.max(...numberedChapters) : null;

  return {
    ok: true,
    context: {
      contractVersion: 'r8m-chapter-context-v1',
      manuscriptId,
      workId,
      manuscriptTitle: title,
      draftRevision: currentDraft.revision_count,
      chapter: {
        rootSectionId: chapter.root.id,
        title: chapter.root.heading ?? 'Current chapter',
        position: chapter.ordinal,
        sectionIds: chapterScope,
        isFinalNumberedChapter: chapterNumber !== null && maxChapter === chapterNumber,
        previousTopLevelTitle: segments[chapterIndex - 1]?.root.heading ?? null,
        nextTopLevelTitle: segments[chapterIndex + 1]?.root.heading ?? null,
        readingId: reading.id,
        observations: reading.observations.map((observation) => ({
          key: observation.key,
          text: observation.observation,
          doesNotEstablish: observation.doesNotEstablish,
        })),
      },
      bookMovements,
      writerEstablished: {
        understanding: writerUnderstanding,
        directives,
      },
      contextSources: [
        'current_chapter_reading',
        'book_structure',
        'prior_book_reading',
        'writer_established',
        'conversation_history',
        'current_locus',
      ],
    },
  };
}
