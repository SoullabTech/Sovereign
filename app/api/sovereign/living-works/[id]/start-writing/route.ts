// Production web requires force-dynamic for runtime database access.
export const dynamic = 'force-dynamic';

/**
 * Start writing inside one specific Living Work.
 *
 * This is the atomic form of the existing two-request browser gesture:
 * create a blank member manuscript, its writable draft, and the explicit
 * Work declaration together or leave none of them behind.
 *
 * It does not copy Idea/Source/materials, infer a title, import a file, open an
 * editorial thread, call MAIA, or attach an existing manuscript. "Add to Work"
 * remains its separate explicit member act.
 */
import { NextRequest, NextResponse } from 'next/server';
import { transaction } from '@/lib/db/postgres';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { computeSourceHash } from '@/lib/manuscript/render/renderMemberBook';
import { partitionFromSections } from '@/lib/manuscript/draftSections';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const PRIVATE_HEADERS = { 'Cache-Control': 'private, no-store', Vary: 'Cookie' } as const;

class StartWritingRefused extends Error {
  constructor(readonly reason: 'work_not_found' | 'work_already_has_manuscript') {
    super(reason);
    this.name = 'StartWritingRefused';
  }
}

type ExistingExpression = {
  manuscript_id: string;
  draft_id: string | null;
  provenance: string;
  title: string | null;
  content: string | null;
  version: number | string | null;
  section_addressable_at: Date | string | null;
};

export async function POST(
  request: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ error: 'Not available in static build' }, { status: 501, headers: PRIVATE_HEADERS });
  }

  const memberId = await getMemberIdFromRequest(request);
  if (!memberId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: PRIVATE_HEADERS });
  const { id: livingWorkId } = await ctx.params;
  if (!UUID.test(livingWorkId)) return NextResponse.json({ error: 'Not found' }, { status: 404, headers: PRIVATE_HEADERS });

  try {
    const baseSourceHash = computeSourceHash([]);
    const created = await transaction(async (client) => {
      // The Work row is the server-owned mutex for this exact gesture. Two
      // starts for one Work serialize; starts for different Works remain
      // independent and can never reuse one undeclared global blank page.
      const work = await client.query<{ id: string }>(
        `SELECT id FROM living_works
          WHERE id = $1 AND member_id = $2
          FOR UPDATE`,
        [livingWorkId, memberId],
      );
      if (work.rows.length !== 1) throw new StartWritingRefused('work_not_found');

      const expressions = await client.query<ExistingExpression>(
        `SELECT m.id AS manuscript_id, d.id AS draft_id, m.provenance, m.title,
                d.content, d.version, d.section_addressable_at
           FROM living_work_expressions e
           JOIN member_manuscripts m
             ON m.id = e.expression_id AND m.member_id = $2
           LEFT JOIN manuscript_working_drafts d
             ON d.manuscript_id = m.id AND d.member_id = $2
          WHERE e.living_work_id = $1
            AND e.expression_type = 'manuscript'
            AND e.declared_by = $2
          ORDER BY e.declared_at ASC, m.id ASC`,
        [livingWorkId, memberId],
      );

      if (expressions.rows.length > 0) {
        const row = expressions.rows[0]!;
        const exactlyOneUntouchedBlank = expressions.rows.length === 1
          && row.provenance === 'member_written'
          && row.title === null
          && row.draft_id !== null
          && row.content === ''
          && Number(row.version) === 1
          && row.section_addressable_at !== null;
        if (exactlyOneUntouchedBlank) {
          return { manuscriptId: row.manuscript_id, draftId: row.draft_id!, reused: true };
        }
        throw new StartWritingRefused('work_already_has_manuscript');
      }

      const ms = await client.query<{ id: string }>(
        `INSERT INTO member_manuscripts (member_id, title, provenance)
         VALUES ($1, NULL, 'member_written')
         RETURNING id`,
        [memberId],
      );
      if (ms.rows.length !== 1) throw new Error('blank_manuscript_unconfirmed');
      const manuscriptId = ms.rows[0]!.id;

      const draft = await client.query<{ id: string }>(
        `INSERT INTO manuscript_working_drafts
           (manuscript_id, member_id, content, base_source_hash, revision_count,
            section_addressable_at, section_conversion_version)
         VALUES ($1, $2, '', $3, 1, now(), 1)
         RETURNING id`,
        [manuscriptId, memberId, baseSourceHash],
      );
      if (draft.rows.length !== 1) throw new Error('blank_draft_unconfirmed');

      const section = await client.query<{ id: string }>(
        `INSERT INTO manuscript_draft_sections (draft_id, position, text, source_section_id)
         VALUES ($1, 0, '', NULL)
         RETURNING id`,
        [draft.rows[0]!.id],
      );
      if (section.rows.length !== 1) throw new Error('blank_section_unconfirmed');
      const partition = partitionFromSections([{ id: section.rows[0]!.id, text: '' }]);

      await client.query(
        `INSERT INTO working_draft_revisions
           (draft_id, revision_number, content, saved_by, note, section_partition)
         VALUES ($1, 1, '', $2, 'Started writing', $3::jsonb)`,
        [draft.rows[0]!.id, memberId, JSON.stringify(partition)],
      );

      const declaration = await client.query<{ id: string }>(
        `INSERT INTO living_work_expressions
           (living_work_id, expression_type, expression_id, declared_by)
         VALUES ($1, 'manuscript', $2, $3)
         RETURNING id`,
        [livingWorkId, manuscriptId, memberId],
      );
      if (declaration.rows.length !== 1) throw new Error('work_declaration_unconfirmed');

      return { manuscriptId, draftId: draft.rows[0]!.id, reused: false };
    });

    return NextResponse.json(
      { id: created.manuscriptId, draftId: created.draftId, title: null },
      { status: created.reused ? 200 : 201, headers: PRIVATE_HEADERS },
    );
  } catch (error) {
    if (error instanceof StartWritingRefused) {
      if (error.reason === 'work_not_found') {
        return NextResponse.json({ error: 'Not found' }, { status: 404, headers: PRIVATE_HEADERS });
      }
      return NextResponse.json(
        { error: 'This Work already has writing' },
        { status: 409, headers: PRIVATE_HEADERS },
      );
    }
    console.error('[living-works/start-writing] create failed', error);
    return NextResponse.json(
      { error: 'Could not begin writing for this Work' },
      { status: 500, headers: PRIVATE_HEADERS },
    );
  }
}
