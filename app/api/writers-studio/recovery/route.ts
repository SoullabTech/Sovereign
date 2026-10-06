export const dynamic = 'force-dynamic';

import { createHash } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { query } from '@/lib/db/postgres';
import { splitStoredSection } from '@/lib/manuscript/sections/sectionProjection';

type ManuscriptSource = {
  id: string;
  title: string | null;
};

type SectionRow = {
  id: string;
  text: string;
  heading: string | null;
  position: number;
};

type RecoveryCandidate = {
  id: string;
  sourceManuscriptId: string;
  sourceSectionId: string;
  sourceHeading: string | null;
  text: string;
  lexicalOverlap: number;
  sameHeading: boolean;
  evidence: 'low_lexical_overlap';
};

function words(value: string): string[] {
  return value.toLowerCase().match(/[a-z0-9’'-]+/g) ?? [];
}

function normalizedHeading(value: string | null): string {
  return words(value ?? '').join(' ');
}

function tokenSet(value: string): Set<string> {
  return new Set(words(value).filter((token) => token.length > 2));
}

function overlap(a: string, b: string): number {
  const left = tokenSet(a);
  const right = tokenSet(b);
  if (left.size === 0 || right.size === 0) return 0;
  let shared = 0;
  for (const token of left) if (right.has(token)) shared += 1;
  return shared / Math.max(left.size, right.size);
}

function headingOverlap(a: string | null, b: string | null): number {
  return overlap(a ?? '', b ?? '');
}

function paragraphs(value: string): string[] {
  return value
    .split(/\n\s*\n|\r\n\s*\r\n/)
    .map((part) => part.trim())
    .filter((part) => {
      const count = words(part).length;
      return count >= 8 && part.length >= 45;
    });
}

function bodyOf(row: SectionRow): string {
  const split = splitStoredSection(row.text, row.heading);
  return split?.body ?? row.text;
}

async function ownedWorkForManuscript(
  memberId: string,
  manuscriptId: string,
): Promise<string | null> {
  const result = await query<{ living_work_id: string }>(
    [
      'SELECT e.living_work_id',
      '  FROM living_work_expressions e',
      '  JOIN member_manuscripts m ON m.id = e.expression_id',
      " WHERE e.expression_type = 'manuscript'",
      '   AND e.expression_id = $1',
      '   AND m.member_id = $2',
      ' LIMIT 1',
    ].join('\n'),
    [manuscriptId, memberId],
  );
  return result.rows[0]?.living_work_id ?? null;
}

async function sourcesForWork(
  memberId: string,
  workId: string,
  currentManuscriptId: string,
): Promise<ManuscriptSource[]> {
  const result = await query<ManuscriptSource>(
    [
      'SELECT m.id, m.title',
      '  FROM living_work_expressions e',
      '  JOIN member_manuscripts m ON m.id = e.expression_id',
      " WHERE e.expression_type = 'manuscript'",
      '   AND e.living_work_id = $1',
      '   AND m.member_id = $2',
      '   AND m.id <> $3',
      ' ORDER BY e.declared_at ASC, m.id ASC',
    ].join('\n'),
    [workId, memberId, currentManuscriptId],
  );
  return result.rows;
}

async function sectionsFor(
  memberId: string,
  manuscriptId: string,
): Promise<SectionRow[]> {
  const result = await query<SectionRow>(
    [
      'SELECT s.id, s.text, ms.heading, s.position',
      '  FROM manuscript_draft_sections s',
      '  JOIN manuscript_working_drafts d ON d.id = s.draft_id',
      '  LEFT JOIN manuscript_sections ms ON ms.id = s.source_section_id',
      ' WHERE d.manuscript_id = $1 AND d.member_id = $2',
      ' ORDER BY s.position ASC, s.id ASC',
    ].join('\n'),
    [manuscriptId, memberId],
  );
  return result.rows;
}

export async function GET(request: NextRequest) {
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ error: 'Not available in static build' }, { status: 501 });
  }
  const memberId = await getMemberIdFromRequest(request);
  if (!memberId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const url = new URL(request.url);
  const manuscriptId = url.searchParams.get('manuscriptId');
  const sourceManuscriptId = url.searchParams.get('sourceManuscriptId');
  const sectionId = url.searchParams.get('sectionId');

  if (!manuscriptId) {
    return NextResponse.json({ error: 'manuscript_required' }, { status: 400 });
  }

  const workId = await ownedWorkForManuscript(memberId, manuscriptId);
  if (!workId) return NextResponse.json({ error: 'work_unresolved' }, { status: 404 });

  const sources = await sourcesForWork(memberId, workId, manuscriptId);
  if (!sourceManuscriptId) {
    return NextResponse.json({
      workId,
      sources,
      boundary: 'Only manuscripts the writer declared into this same Work are offered.',
    });
  }

  if (!sources.some((source) => source.id === sourceManuscriptId)) {
    return NextResponse.json({ error: 'source_not_in_work' }, { status: 404 });
  }

  const [currentSections, sourceSections] = await Promise.all([
    sectionsFor(memberId, manuscriptId),
    sectionsFor(memberId, sourceManuscriptId),
  ]);

  const focus = sectionId
    ? currentSections.find((section) => section.id === sectionId) ?? null
    : null;

  const currentParagraphs = currentSections.flatMap((section) => paragraphs(bodyOf(section)));
  const sourceHeadingScores = sourceSections.map((section) => ({
    section,
    score: focus ? headingOverlap(focus.heading, section.heading) : 0,
    exact: Boolean(
      focus
      && normalizedHeading(focus.heading)
      && normalizedHeading(focus.heading) === normalizedHeading(section.heading)
    ),
  }));

  const bestHeadingScore = sourceHeadingScores.reduce(
    (max, item) => Math.max(max, item.score),
    0,
  );
  const focusedSourceSections = focus
    ? sourceHeadingScores
        .filter((item) => item.exact || (bestHeadingScore >= 0.35 && item.score === bestHeadingScore))
        .map((item) => item.section)
    : sourceSections;
  const candidateSections = focusedSourceSections.length > 0
    ? focusedSourceSections
    : sourceSections;

  const candidates: RecoveryCandidate[] = [];
  for (const section of candidateSections) {
    const sameHeading = Boolean(
      focus
      && normalizedHeading(focus.heading)
      && normalizedHeading(focus.heading) === normalizedHeading(section.heading)
    );
    for (const paragraph of paragraphs(bodyOf(section))) {
      let maximum = 0;
      for (const current of currentParagraphs) {
        maximum = Math.max(maximum, overlap(paragraph, current));
        if (maximum >= 0.58) break;
      }
      if (maximum >= 0.58) continue;
      const text = paragraph.length > 1400
        ? paragraph.slice(0, 1397).trimEnd() + '…'
        : paragraph;
      const id = createHash('sha256')
        .update(sourceManuscriptId + '\n' + section.id + '\n' + paragraph)
        .digest('hex')
        .slice(0, 20);
      candidates.push({
        id,
        sourceManuscriptId,
        sourceSectionId: section.id,
        sourceHeading: section.heading,
        text,
        lexicalOverlap: Number(maximum.toFixed(3)),
        sameHeading,
        evidence: 'low_lexical_overlap',
      });
    }
  }

  candidates.sort((a, b) =>
    Number(b.sameHeading) - Number(a.sameHeading)
    || a.lexicalOverlap - b.lexicalOverlap
    || b.text.length - a.text.length
    || a.id.localeCompare(b.id)
  );

  return NextResponse.json({
    workId,
    manuscriptId,
    sourceManuscriptId,
    focus: focus ? { sectionId: focus.id, heading: focus.heading } : null,
    candidates: candidates.slice(0, 12),
    method: {
      kind: 'deterministic_lexical_difference',
      threshold: 0.58,
      claim: 'Possible recovery material: present in the selected earlier manuscript and not closely represented lexically in the current manuscript.',
      notClaimed: 'This does not establish that the material is better, should be restored, or was removed accidentally.',
    },
  });
}
