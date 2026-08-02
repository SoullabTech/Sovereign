/**
 * /maia/workbench — the member's own arrangement surface.
 *
 * The first member slice of the Workbench. What it tests is narrow and
 * behavioural: does a member place a Keep, move it into a group they named,
 * leave, come back, and find it where they left it?
 *
 * Deliberately NOT here (each is a separate decision, not an oversight):
 *   - graduation into drafts        → from-group stays requireFounder()
 *   - uploads                       → uploads/* stay requireFounder()
 *   - Ideas / Journals / Decisions  → source-native id vs canonical atom id
 *                                     is unreconciled for those sources
 *   - multiple tables / projects     → one table per member until use earns more
 *   - shared or collaborative tables → out of v0 entirely (ARCHITECTURE §1)
 *   - any clustering, naming, ordering, readiness judgment or suggestion by
 *     MAIA. The room is silent (ARCHITECTURE §8: "No model calls anywhere in
 *     lib/workbench/; absence is auditable"). That still holds — nothing in
 *     this slice adds one.
 *
 * Placement is written only to workbench_tables.layout. Nothing here mutates
 * an atom, its source detail, its sanctuary state, or its return_preference.
 */

import { redirect } from 'next/navigation';
import { getCurrentSession } from '@/lib/auth/serverSessions';
import { query } from '@/lib/db/postgres';
import { WorkbenchRoom } from '@/components/book-studio/workbench/Room';

export const metadata = {
  title: 'Workbench · MAIA',
};

export const dynamic = 'force-dynamic';

/**
 * One table per member for this slice. Multiple tables are supported by the
 * schema and deferred by ARCHITECTURE §12 ("schema supports many; v0 UI ships
 * with one") until lived contact says a second one is wanted.
 */
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

export default async function MemberWorkbenchPage() {
  const session = await getCurrentSession();
  if (!session?.memberId) {
    redirect('/signin?next=/maia/workbench');
  }

  const tableId = await findOrCreateTable(session.memberId);

  return (
    <div className="min-h-screen bg-[#0a0e1a] px-6 py-10 md:px-10">
      <div className="mx-auto max-w-6xl">
        <WorkbenchRoom
          tableId={tableId}
          canUpload={false}
          canGraduate={false}
          title="Workbench"
          subtitle="Things you kept. Move them into whatever order makes sense to you."
        />
      </div>
    </div>
  );
}
