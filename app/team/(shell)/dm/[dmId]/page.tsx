import { redirect } from 'next/navigation';
import { getCurrentSession } from '@/lib/auth/serverSessions';
import { query } from '@/lib/db/postgres';
import { listDMThreads, type DMThread } from '@/lib/team/DMService';
import { DMView } from '@/components/team/DMView';

/** Never accept a claimed member ID. The session helper verifies the real cookie.
 * A DM is readable only when the member belongs to its exact Co-Lab AND thread.
 */
async function getOwnedTeamId(dmId: string, memberId: string): Promise<string | null> {
  const found = await query<{ team_id: string }>(
    `SELECT dt.team_id
       FROM team_dm_threads dt
       JOIN team_dm_members dm
         ON dm.dm_thread_id = dt.id
        AND dm.member_id = $2 AND dm.hidden_at IS NULL
       JOIN studio_team_members tm
         ON tm.team_id = dt.team_id AND tm.member_id = $2
      WHERE dt.id = $1
      LIMIT 1`,
    [dmId, memberId],
  );
  return found.rows[0]?.team_id ?? null;
}

export default async function DMPage({
  params,
}: {
  params: Promise<{ dmId: string }>;
}) {
  const { dmId } = await params;

  const session = await getCurrentSession();
  const memberId = session?.memberId ?? null;
  if (!memberId) redirect(`/signin?next=/team/dm/${dmId}`);

  const teamId = await getOwnedTeamId(dmId, memberId);
  if (!teamId) {
    return <div className="text-white/40 text-center p-8">DM thread not found.</div>;
  }

  const threads: DMThread[] = await listDMThreads(memberId, teamId).catch((err): DMThread[] => {
    console.error('[DM page] listDMThreads failed:', err);
    return [];
  });
  const thread = threads.find(t => t.id === dmId);

  if (!thread) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-8">
        <p className="text-white/40 text-sm">DM thread not found.</p>
      </div>
    );
  }

  return <DMView dmThread={thread} currentMemberId={memberId} />;
}
