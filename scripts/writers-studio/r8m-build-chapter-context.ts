/**
 * R8M read-only context builder.
 *
 * Builds one fixed, epistemically separated Chapter Conversation Context packet
 * from the current Elemental Alchemy draft and existing frozen Overview readings.
 * It does NOT commission readings, mutate the Work, or call a model.
 */

import { writeFileSync } from 'node:fs';
import { query } from '@/lib/db/postgres';
import { writerUnderstandingContextForManuscript } from '@/lib/writersStudio/writerUnderstandingServer';
import { workDirectiveContextForWork } from '@/lib/writersStudio/workDirectivesServer';
import {
  type BookMovementContext,
  type ChapterConversationContext,
  type QualifiedObservation,
  renderChapterConversationContext,
} from '@/lib/writersStudio/qualification/chapterConversationContext';

type SectionRow = {
  id: string;
  position: number;
  heading: string | null;
  heading_depth: number | null;
};

type ReadingRow = {
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

const manuscriptId = process.argv[2] ?? 'c81925d1-9df3-46e7-a69c-7e257326f284';
const chapterPattern = process.argv[3] ?? '^Chapter 10';
const outPath = process.argv[4] ?? '/tmp/r8m-chapter10-context.json';

const toObservations = (row: ReadingRow | undefined): QualifiedObservation[] =>
  (row?.outcome === 'reading' ? row.observations : [])
    .filter((o) => typeof o.observation === 'string' && o.observation.trim())
    .map((o, index) => ({
      key: typeof o.key === 'string' ? o.key : `o${index + 1}`,
      text: String(o.observation).trim(),
      doesNotEstablish: Array.isArray(o.doesNotEstablish)
        ? o.doesNotEstablish.filter((x): x is string => typeof x === 'string')
        : [],
    }));

function sameIds(a: readonly string[], b: readonly string[]): boolean {
  return a.length === b.length && a.every((id, index) => id === b[index]);
}

async function main() {
  const manuscript = await query<{ title: string; member_id: string }>(
    'SELECT title, member_id FROM member_manuscripts WHERE id=$1',
    [manuscriptId],
  );
  const m = manuscript.rows[0];
  if (!m) throw new Error('manuscript_not_found');

  const draft = await query<{ id: string; revision_count: number }>(
    'SELECT id, revision_count FROM manuscript_working_drafts WHERE manuscript_id=$1 AND member_id=$2',
    [manuscriptId, m.member_id],
  );
  const d = draft.rows[0];
  if (!d) throw new Error('draft_not_found');

  const sectionsResult = await query<SectionRow>(
    `SELECT ds.id, ds.position, ms.heading, ms.heading_depth
       FROM manuscript_draft_sections ds
       LEFT JOIN manuscript_sections ms ON ms.id=ds.source_section_id
      WHERE ds.draft_id=$1
      ORDER BY ds.position ASC`,
    [d.id],
  );
  const sections = sectionsResult.rows;
  const roots = sections
    .map((section, index) => ({ section, index }))
    .filter(({ section }) => section.heading_depth === 1);

  if (roots.length < 2) throw new Error('top_level_structure_missing');

  const segments = roots.map(({ section, index }, rootIndex) => {
    const end = roots[rootIndex + 1]?.index ?? sections.length;
    return {
      root: section,
      sections: sections.slice(index, end),
      ordinal: rootIndex + 1,
    };
  });

  const chapterRegex = new RegExp(chapterPattern, 'i');
  const chapterIndex = segments.findIndex((segment) => chapterRegex.test(segment.root.heading ?? ''));
  if (chapterIndex < 0) throw new Error('chapter_not_found');
  const chapter = segments[chapterIndex]!;

  const readingsResult = await query<ReadingRow>(
    `SELECT id, revision_number, scope, outcome, observations, frozen_at
       FROM developmental_readings
      WHERE manuscript_id=$1
        AND member_id=$2
        AND commissioned_lens='overview'
        AND revision_number=$3
      ORDER BY frozen_at DESC`,
    [manuscriptId, m.member_id, d.revision_count],
  );
  const readings = readingsResult.rows;

  const readingsFor = (sectionIds: readonly string[]): ReadingRow[] =>
    readings.filter((reading) => {
      const bodyScope = Array.isArray(reading.scope?.bodyScope) ? reading.scope!.bodyScope! : [];
      return sameIds(bodyScope, sectionIds);
    });
  const readingFor = (sectionIds: readonly string[]): ReadingRow | undefined => {
    const exact = readingsFor(sectionIds);
    return exact.find((reading) => reading.outcome === 'reading') ?? exact[0];
  };

  const chapterIds = chapter.sections.map((s) => s.id);
  const chapterReading = readingFor(chapterIds);
  if (!chapterReading || chapterReading.outcome !== 'reading') {
    throw new Error('current_chapter_overview_reading_required');
  }

  const movementContexts: BookMovementContext[] = segments.map((segment) => {
    const ids = segment.sections.map((s) => s.id);
    const reading = readingFor(ids);
    return {
      label: segment.root.heading ?? `Movement ${segment.ordinal}`,
      position: segment.ordinal,
      sectionCount: ids.length,
      standing: reading ? (reading.outcome === 'reading' ? 'read' : 'none') : 'not_read',
      ...(reading ? { readingId: reading.id } : {}),
      observations: toObservations(reading),
    };
  });

  const workResult = await query<{ id: string }>(
    `SELECT w.id
       FROM living_works w
       JOIN living_work_expressions e
         ON e.living_work_id=w.id
        AND e.expression_type='manuscript'
        AND e.expression_id=$1
      WHERE w.member_id=$2
      ORDER BY w.id`,
    [manuscriptId, m.member_id],
  );
  const workId = workResult.rows.length === 1 ? workResult.rows[0]!.id : null;

  const writerUnderstanding = await writerUnderstandingContextForManuscript(
    m.member_id,
    manuscriptId,
  );
  const directives = workId
    ? await workDirectiveContextForWork(m.member_id, workId)
    : '';

  const numberedChapters = segments
    .map((segment) => {
      const match = /^Chapter\s+(\d+)/i.exec(segment.root.heading ?? '');
      return match ? Number(match[1]) : null;
    })
    .filter((n): n is number => Number.isFinite(n));
  const chapterNumberMatch = /^Chapter\s+(\d+)/i.exec(chapter.root.heading ?? '');
  const chapterNumber = chapterNumberMatch ? Number(chapterNumberMatch[1]) : null;
  const maxChapter = numberedChapters.length ? Math.max(...numberedChapters) : null;

  const packet: ChapterConversationContext = {
    contractVersion: 'r8m-chapter-context-v1',
    manuscriptId,
    workId,
    manuscriptTitle: m.title,
    draftRevision: d.revision_count,
    chapter: {
      rootSectionId: chapter.root.id,
      title: chapter.root.heading ?? 'Current chapter',
      position: chapter.ordinal,
      sectionIds: chapterIds,
      isFinalNumberedChapter: chapterNumber !== null && maxChapter === chapterNumber,
      previousTopLevelTitle: segments[chapterIndex - 1]?.root.heading ?? null,
      nextTopLevelTitle: segments[chapterIndex + 1]?.root.heading ?? null,
      readingId: chapterReading.id,
      observations: toObservations(chapterReading),
    },
    bookMovements: movementContexts,
    writerEstablished: {
      understanding: writerUnderstanding,
      directives,
    },
    contextSources: [
      'current_chapter_reading',
      'book_structure',
      'prior_book_reading',
      'writer_established',
    ],
  };

  writeFileSync(outPath, JSON.stringify({
    packet,
    rendered: renderChapterConversationContext(packet),
  }, null, 2));
  process.stdout.write(JSON.stringify({
    outPath,
    manuscriptId,
    revision: d.revision_count,
    chapter: packet.chapter.title,
    finalNumberedChapter: packet.chapter.isFinalNumberedChapter,
    bookMovements: packet.bookMovements.length,
    movementStanding: packet.bookMovements.map((x) => ({
      label: x.label,
      standing: x.standing,
      observations: x.observations.length,
    })),
    chapterObservations: packet.chapter.observations.length,
  }, null, 2) + '\n');
}

void main();
