/**
 * Book Studio — Workbench page.
 *
 * The arrangement surface between captures and form. v0 ships with a
 * single persistent Table per arranger — find-or-create here so the
 * client doesn't need a separate provisioning step.
 *
 * MAIA is silent in this room. The Shelf provides retrieval; the Table
 * holds arrangement. No commentary, no suggested clusters, no synthesis.
 * That silence is structural, not stylistic.
 */

import { redirect } from 'next/navigation';
import { requireFounder } from '@/lib/founder/founderAuth';
import { query } from '@/lib/db/postgres';
import { WorkbenchRoom } from '@/components/book-studio/workbench/Room';

export const metadata = {
  title: 'Workbench · The Book Studio',
};

export const dynamic = 'force-dynamic';

async function findOrCreateTable(arrangerId: string): Promise<string> {
  const existing = await query<{ id: string }>(
    `SELECT id FROM workbench_tables
     WHERE arranger_id = $1
     ORDER BY updated_at DESC
     LIMIT 1`,
    [arrangerId],
  );
  if (existing.rows.length > 0) return existing.rows[0].id;

  const created = await query<{ id: string }>(
    `INSERT INTO workbench_tables (arranger_id, name)
     VALUES ($1, 'My Workbench')
     RETURNING id`,
    [arrangerId],
  );
  return created.rows[0].id;
}

export default async function WorkbenchPage() {
  const auth = await requireFounder();
  if (!auth.ok) {
    redirect('/signin?next=/book-studio/workbench');
  }

  const tableId = await findOrCreateTable(auth.memberId);

  return <WorkbenchRoom tableId={tableId} />;
}
