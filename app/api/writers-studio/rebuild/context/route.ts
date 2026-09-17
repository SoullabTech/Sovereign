/**
 * WRITERS-STUDIO-EXPERIENCE-REBUILD-01 — read model for the rebuilt room.
 *
 * This endpoint exists because the old Canvas split one fact across two APIs:
 * the writer needs draft-section ids to navigate/edit, while MAIA disclosure
 * and provenance need immutable Source ids. A bare `sectionId` cannot say
 * which namespace it belongs to. The rebuild receives both, by name, in one
 * ownership-scoped snapshot.
 *
 * READ ONLY. No conversion, save, relationship, reading, or model call occurs.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { query } from '@/lib/db/postgres';
import { splitStoredSection } from '@/lib/manuscript/sections/sectionProjection';

export const dynamic = 'force-dynamic';

interface DraftRow {
  id: string;
  version: string;
  updated_at: Date;
  section_addressable_at: Date | null;
}

interface SectionRow {
  draft_section_id: string;
  source_section_id: string | null;
  position: number;
  text: string;
  heading: string | null;
  heading_depth: number | null;
  heading_signal: string | null;
}

export async function GET(req: NextRequest) {
  const memberId = await getMemberIdFromRequest(req);
  if (!memberId) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });

  const manuscriptId = req.nextUrl.searchParams.get('manuscriptId');
  if (!manuscriptId) {
    return NextResponse.json({ error: 'manuscriptId is required' }, { status: 400 });
  }

  const manuscript = await query<{ id: string; title: string | null }>(
    `SELECT id, title FROM member_manuscripts WHERE id = $1 AND member_id = $2`,
    [manuscriptId, memberId],
  );
  if (manuscript.rows.length === 0) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
  }

  const draft = await query<DraftRow>(
    `SELECT id, version, updated_at, section_addressable_at
       FROM manuscript_working_drafts
      WHERE manuscript_id = $1 AND member_id = $2`,
    [manuscriptId, memberId],
  );
  if (draft.rows.length === 0) {
    return NextResponse.json({
      state: 'no_draft', manuscriptId, title: manuscript.rows[0].title,
    });
  }
  const d = draft.rows[0];
  if (d.section_addressable_at === null) {
    return NextResponse.json({
      state: 'continuous', manuscriptId, title: manuscript.rows[0].title,
      version: Number(d.version), updatedAt: d.updated_at.toISOString(),
    });
  }

  const rows = await query<SectionRow>(
    `SELECT ds.id AS draft_section_id, ds.source_section_id, ds.position, ds.text,
            ms.heading, ms.heading_depth, ms.heading_signal
       FROM manuscript_draft_sections ds
       LEFT JOIN manuscript_sections ms ON ms.id = ds.source_section_id
      WHERE ds.draft_id = $1
      ORDER BY ds.position ASC`,
    [d.id],
  );

  const sections = rows.rows.map((row) => {
    const split = splitStoredSection(row.text, row.heading);
    return {
      draftSectionId: row.draft_section_id,
      sourceSectionId: row.source_section_id,
      position: row.position,
      heading: row.heading,
      headingDepth: row.heading_depth,
      headingSignal: row.heading_signal,
      body: split ? split.body : row.text,
      headingPrefix: split ? split.headingPrefix : '',
      editable: split !== null,
    };
  });

  return NextResponse.json({
    state: 'section_aware', manuscriptId, title: manuscript.rows[0].title,
    version: Number(d.version), updatedAt: d.updated_at.toISOString(), sections,
  });
}
