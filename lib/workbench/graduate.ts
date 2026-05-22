/**
 * Graduate a Workbench group → Book Studio draft.
 *
 * Reusable logic shared between:
 *   - app/api/book-studio/drafts/from-group/route.ts (HTTP entry point)
 *   - scripts/smoke-test-workbench-graduate.ts        (regression test)
 *
 * Resolves each card via its source adapter, assembles a markdown draft in
 * the order the arranger placed them, and writes the file to disk. Sanctuary
 * captures are skipped (adapter.resolve returns null for sanctuary refs).
 *
 * The graduation pipe is the structural seam between the Workbench
 * (arrangement) and Book Studio (form). "Graduate only when this wants form."
 */

import { promises as fs } from 'fs';
import path from 'path';
import { query } from '@/lib/db/postgres';
import { getSource } from '@/lib/workbench/sources';
import type { TableLayout } from '@/lib/workbench/sources/types';

export type GraduateResult =
  | { ok: true; slug: string; studioUrl: string; filePath: string }
  | { ok: false; status: number; error: string };

function slugify(input: string): string {
  return (
    input
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
      .slice(0, 80) || 'untitled-group'
  );
}

export async function graduateGroup(
  arrangerId: string,
  tableId: string,
  groupId: string,
): Promise<GraduateResult> {
  const result = await query<{ id: string; name: string; layout: TableLayout }>(
    `SELECT id, name, layout FROM workbench_tables
     WHERE id = $1 AND arranger_id = $2`,
    [tableId, arrangerId],
  );
  if (result.rows.length === 0) {
    return { ok: false, status: 404, error: 'Table not found' };
  }
  const table = result.rows[0];

  const group = (table.layout.groups ?? []).find((g) => g.id === groupId);
  if (!group) {
    return { ok: false, status: 404, error: 'Group not found' };
  }
  if (group.cards.length === 0) {
    return { ok: false, status: 400, error: 'Group is empty; nothing to graduate' };
  }

  const resolvedSections: string[] = [];
  const refLines: string[] = [];

  for (const card of group.cards) {
    const adapter = getSource(card.source);
    if (!adapter) {
      refLines.push(`<!-- ${card.source}:${card.ref} (no adapter) -->`);
      continue;
    }
    const resolved = await adapter.resolve(card.ref, arrangerId);
    if (!resolved) {
      refLines.push(`<!-- ${card.source}:${card.ref} (unresolved or sanctuary) -->`);
      continue;
    }
    const title =
      typeof resolved.meta.originalName === 'string'
        ? resolved.meta.originalName
        : `${card.source}:${card.ref.slice(0, 8)}`;
    resolvedSections.push(`## ${title}\n\n${resolved.content.trim()}`);
    refLines.push(`<!-- ${card.source}:${card.ref} -->`);
  }

  if (resolvedSections.length === 0) {
    return { ok: false, status: 422, error: 'No card content could be resolved' };
  }

  const draftsDir = path.join(process.cwd(), 'docs', 'book-studio', 'drafts');
  await fs.mkdir(draftsDir, { recursive: true });

  const date = new Date().toISOString();
  const slug = `${slugify(group.name)}-${groupId.slice(0, 8)}`;

  const markdown = `# Draft — ${group.name}

Source: Workbench (table "${table.name}", group "${group.name}")
Created: ${date}

<!-- workbench-source
table: ${table.id}
group: ${groupId}
cards:
${refLines.join('\n')}
-->

---

${resolvedSections.join('\n\n---\n\n')}
`;

  const filePath = path.join(draftsDir, `${slug}.md`);
  await fs.writeFile(filePath, markdown, 'utf8');

  return {
    ok: true,
    slug,
    studioUrl: `/book-studio/drafts/${slug}`,
    filePath,
  };
}
