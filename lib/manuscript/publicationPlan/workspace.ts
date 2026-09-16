import { transaction, type TransactionClient } from '@/lib/db/postgres';
import { splitStoredSection } from '@/lib/manuscript/sections/sectionProjection';
import {
  inspectPublicationMatter,
  publicationRoleFor,
  type BookProductionIssue,
  type MemberBookSection,
} from '@/lib/manuscript/render/renderMemberBook';
import { isPublicationMatterRole, type PublicationMatterRole } from './roles';

export interface PublicationWorkspaceSection {
  id: string;
  position: number;
  heading: string | null;
  preview: string;
  assignedRole: PublicationMatterRole | null;
  effectiveRole: string;
  frontMatter: boolean;
}

export interface PublicationWorkspaceIssue extends BookProductionIssue {
  sectionIds: string[];
}

export type PublicationWorkspaceResult =
  | {
      status: 'ok';
      availability: 'ready';
      draftVersion: number;
      totalChars: number;
      sectionCount: number;
      bodyStartPosition: number | null;
      sections: PublicationWorkspaceSection[];
      placements: Array<{ role: PublicationMatterRole; sectionIds: string[] }>;
      issues: PublicationWorkspaceIssue[];
    }
  | {
      status: 'ok';
      availability: 'section_aware_draft_required';
      draftVersion: number | null;
      totalChars: 0;
      sectionCount: 0;
      bodyStartPosition: null;
      sections: [];
      placements: [];
      issues: [];
    }
  | { status: 'refused'; refusal: 'not_found' };

type WorkspaceRow = {
  id: string;
  position: number;
  text: string;
  heading: string | null;
  heading_depth: number | null;
  heading_signal: string | null;
  publication_role: string | null;
};

const excerpt = (body: string): string => {
  const oneLine = body.replace(/\s+/g, ' ').trim();
  if (oneLine.length <= 240) return oneLine;
  return `${oneLine.slice(0, 237).trimEnd()}…`;
};

async function loadRows(
  tx: TransactionClient,
  manuscriptId: string,
  memberId: string,
): Promise<{ version: number | null; rows: WorkspaceRow[] } | null> {
  const owned = await tx.query<{ id: string }>(
    `SELECT id FROM member_manuscripts WHERE id = $1 AND member_id = $2`,
    [manuscriptId, memberId],
  );
  if (owned.rows.length === 0) return null;

  const draft = await tx.query<{ id: string; version: string; section_addressable_at: Date | null }>(
    `SELECT id, version, section_addressable_at
       FROM manuscript_working_drafts
      WHERE manuscript_id = $1 AND member_id = $2`,
    [manuscriptId, memberId],
  );
  const current = draft.rows[0] ?? null;
  if (!current?.section_addressable_at) {
    return { version: current ? Number(current.version) : null, rows: [] };
  }

  const rows = await tx.query<WorkspaceRow>(
    `SELECT ds.id, ds.position, ds.text,
            ms.heading, ms.heading_depth, ms.heading_signal,
            po.role AS publication_role
       FROM manuscript_draft_sections ds
       JOIN manuscript_working_drafts d ON d.id = ds.draft_id
       LEFT JOIN manuscript_sections ms ON ms.id = ds.source_section_id
       LEFT JOIN manuscript_publication_members pm ON pm.draft_section_id = ds.id
       LEFT JOIN manuscript_publication_objects po
              ON po.id = pm.object_id AND po.manuscript_id = d.manuscript_id
      WHERE d.manuscript_id = $1
        AND d.member_id = $2
        AND d.section_addressable_at IS NOT NULL
      ORDER BY ds.position`,
    [manuscriptId, memberId],
  );
  return { version: Number(current.version), rows: rows.rows };
}

export function buildPublicationWorkspace(
  rows: readonly WorkspaceRow[],
  version: number,
): Extract<PublicationWorkspaceResult, { status: 'ok'; availability: 'ready' }> {
  const allBookSections: MemberBookSection[] = rows.map((row) => {
    const split = splitStoredSection(row.text, row.heading);
    return {
      heading: row.heading,
      body: split ? split.body : row.text,
      headingDepth: row.heading_depth === 1 || row.heading_depth === 2 || row.heading_depth === 3
        ? row.heading_depth : null,
      headingSignal: row.heading_signal,
      publicationRole: row.publication_role && isPublicationMatterRole(row.publication_role)
        ? row.publication_role : null,
    };
  });

  /* Production omission is an author-owned disposition, not deletion. Omitted
     rows remain in this workspace projection so the member can see and clear the
     decision, but they do not enter the produced book or its final preflight. */
  const includedIndexes = allBookSections
    .map((section, index) => section.publicationRole === 'omit' ? -1 : index)
    .filter((index) => index >= 0);
  const includedSections = includedIndexes.map((index) => allBookSections[index]!);
  const preflight = inspectPublicationMatter(includedSections);
  const bodyStartSourceIndex = preflight.bodyStartIndex === null
    ? null : includedIndexes[preflight.bodyStartIndex] ?? null;
  const bodyStartPosition = bodyStartSourceIndex === null
    ? null : rows[bodyStartSourceIndex]?.position ?? null;

  const placementMap = new Map<PublicationMatterRole, string[]>();
  const sections: PublicationWorkspaceSection[] = rows.map((row, index) => {
    const source = allBookSections[index]!;
    const assignedRole = source.publicationRole ?? null;
    if (assignedRole) {
      const ids = placementMap.get(assignedRole) ?? [];
      ids.push(row.id);
      placementMap.set(assignedRole, ids);
    }
    return {
      id: row.id,
      position: Number(row.position),
      heading: row.heading,
      preview: excerpt(source.body),
      assignedRole,
      effectiveRole: publicationRoleFor(source),
      frontMatter: assignedRole === 'omit'
        || bodyStartPosition === null
        || Number(row.position) < bodyStartPosition,
    };
  });

  const issues: PublicationWorkspaceIssue[] = preflight.issues.map((issue) => ({
    ...issue,
    sectionIds: issue.sectionIndexes
      .map((index) => includedIndexes[index])
      .map((sourceIndex) => sourceIndex === undefined ? undefined : rows[sourceIndex]?.id)
      .filter((id): id is string => Boolean(id)),
  }));

  return {
    status: 'ok', availability: 'ready', draftVersion: version,
    totalChars: includedSections.reduce((sum, section) => sum + section.body.length, 0),
    sectionCount: includedSections.length,
    bodyStartPosition, sections,
    placements: [...placementMap.entries()].map(([role, sectionIds]) => ({ role, sectionIds })),
    issues,
  };
}

export async function readPublicationWorkspace(
  manuscriptId: string,
  memberId: string,
): Promise<PublicationWorkspaceResult> {
  return transaction(async (tx) => {
    const loaded = await loadRows(tx, manuscriptId, memberId);
    if (loaded === null) return { status: 'refused', refusal: 'not_found' } as const;
    if (loaded.rows.length === 0) {
      return {
        status: 'ok', availability: 'section_aware_draft_required',
        draftVersion: loaded.version, totalChars: 0, sectionCount: 0, bodyStartPosition: null,
        sections: [], placements: [], issues: [],
      } as const;
    }
    return buildPublicationWorkspace(loaded.rows, loaded.version ?? 0);
  });
}
