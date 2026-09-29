import { query } from '@/lib/db/postgres';
import { UNTITLED_EXPRESSION } from '@/lib/manuscript/untitledExpression';
import type { MemberBookSection } from './renderMemberBook';

export type RenderSourceAuthority = 'working_draft' | 'source';

export type MemberRenderSource =
  | {
      ok: true;
      title: string;
      author: string | null;
      sections: MemberBookSection[];
      sourceAuthority: RenderSourceAuthority;
      sourceRevision: string | null;
    }
  | {
      ok: false;
      status: 404 | 400 | 409 | 500;
      error: string;
    };

/**
 * One authority for both Produce preflight and rendering.
 *
 * If a section-addressable working draft exists, it outranks imported/source
 * prose. If that draft cannot be read, refuse rather than silently export an
 * older source.
 */
export async function loadMemberRenderSource(
  manuscriptId: string,
  memberId: string,
): Promise<MemberRenderSource> {
  try {
    const ms = await query<{ title: string | null }>(
      `SELECT title FROM member_manuscripts WHERE id = $1 AND member_id = $2`,
      [manuscriptId, memberId],
    );
    if (ms.rows.length === 0) {
      return { ok: false, status: 404, error: 'Not found' };
    }

    const title = ms.rows[0]!.title ?? UNTITLED_EXPRESSION;

    const draft = await query<{
      id: string;
      version: string;
      section_addressable_at: Date | null;
    }>(
      `SELECT id, version, section_addressable_at
         FROM manuscript_working_drafts
        WHERE manuscript_id = $1 AND member_id = $2`,
      [manuscriptId, memberId],
    );

    let sections: MemberBookSection[];
    let sourceAuthority: RenderSourceAuthority = 'source';
    let sourceRevision: string | null = null;
    const currentDraft = draft.rows[0] ?? null;

    if (currentDraft?.section_addressable_at) {
      sourceAuthority = 'working_draft';
      sourceRevision = currentDraft.version;

      const draftRows = await query<{
        heading: string | null;
        body: string;
        heading_depth: number | null;
        heading_signal: string | null;
      }>(
        `SELECT ms.heading, ds.text AS body, ms.heading_depth, ms.heading_signal
           FROM manuscript_draft_sections ds
           JOIN manuscript_working_drafts d ON d.id = ds.draft_id
           LEFT JOIN manuscript_sections ms ON ms.id = ds.source_section_id
          WHERE d.manuscript_id = $1
            AND d.member_id = $2
            AND d.section_addressable_at IS NOT NULL
          ORDER BY ds.position`,
        [manuscriptId, memberId],
      );

      if (draftRows.rows.length === 0) {
        return {
          ok: false,
          status: 409,
          error: 'The current writing could not be prepared for export. Nothing older was substituted.',
        };
      }

      sections = draftRows.rows.map((row) => ({
        heading: row.heading,
        body: row.body,
        headingDepth:
          row.heading_depth === 1 || row.heading_depth === 2 || row.heading_depth === 3
            ? row.heading_depth
            : null,
        headingSignal: row.heading_signal,
      }));
    } else {
      const secRows = await query<{
        heading: string | null;
        body: string;
        heading_depth: number | null;
        heading_signal: string | null;
      }>(
        `SELECT heading, body, heading_depth, heading_signal
           FROM manuscript_sections
          WHERE manuscript_id = $1
          ORDER BY position`,
        [manuscriptId],
      );

      if (secRows.rows.length === 0) {
        return { ok: false, status: 400, error: 'This manuscript has no sections to render' };
      }

      sections = secRows.rows.map((row) => ({
        heading: row.heading,
        body: row.body,
        headingDepth:
          row.heading_depth === 1 || row.heading_depth === 2 || row.heading_depth === 3
            ? row.heading_depth
            : null,
        headingSignal: row.heading_signal,
      }));
    }

    const who = await query<{ name: string | null }>(
      `SELECT name FROM members WHERE id = $1`,
      [memberId],
    );

    return {
      ok: true,
      title,
      author: who.rows[0]?.name ?? null,
      sections,
      sourceAuthority,
      sourceRevision,
    };
  } catch (error) {
    console.error('[press/render-source] load error:', error);
    return { ok: false, status: 500, error: 'Failed to load manuscript' };
  }
}
