import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { query } from '@/lib/db/postgres';
import { listDMThreads } from '@/lib/team/DMService';
import { DMView } from '@/components/team/DMView';

async function getSessionMemberId(): Promise<string | null> {
  const cookieStore = await cookies();
  const cookieMemberId = cookieStore.get('maia_member_id')?.value;
  if (cookieMemberId) {
    const result = await query('SELECT id FROM members WHERE id = $1', [cookieMemberId]);
    if (result.rows.length > 0) return cookieMemberId;
  }
  const sessionToken = cookieStore.get('maia_session')?.value;
  if (sessionToken) {
    const result = await query(
      `SELECT member_id FROM auth_sessions
       WHERE session_token = $1 AND expires_at > NOW() AND revoked = FALSE`,
      [sessionToken]
    );
    if (result.rows.length > 0) return result.rows[0].member_id;
  }
  return null;
}

export default async function DMPage({
  params,
}: {
  params: Promise<{ dmId: string }>;
}) {
  const { dmId } = await params;

  const memberId = await getSessionMemberId();
  if (!memberId) redirect(`/signin?next=/team/dm/${dmId}`);

  const threads = await listDMThreads(memberId).catch((err) => {
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
