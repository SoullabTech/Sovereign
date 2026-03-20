import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { query } from '@/lib/db/postgres';
import { TeamSidebar } from '@/components/team/TeamSidebar';

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

export default async function TeamLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const memberId = await getSessionMemberId();
  if (!memberId) redirect('/signin?next=/team/general');

  return (
    <div className="flex h-screen bg-[#1a1a2e] overflow-hidden">
      <TeamSidebar currentMemberId={memberId} />
      <main className="flex-1 min-w-0 flex flex-col">{children}</main>
    </div>
  );
}
