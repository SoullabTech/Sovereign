import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { query } from '@/lib/db/postgres';
import { AdminPanel } from '@/components/team/AdminPanel';

async function getAdminMemberId(): Promise<string | null> {
  const cookieStore = await cookies();
  const cookieMemberId = cookieStore.get('maia_member_id')?.value;
  let memberId: string | null = null;

  if (cookieMemberId) {
    const r = await query('SELECT id FROM members WHERE id = $1', [cookieMemberId]);
    if (r.rows.length > 0) memberId = cookieMemberId;
  }

  if (!memberId) {
    const sessionToken = cookieStore.get('maia_session')?.value;
    if (sessionToken) {
      const r = await query(
        `SELECT member_id FROM auth_sessions WHERE session_token = $1 AND expires_at > NOW() AND revoked = FALSE`,
        [sessionToken]
      );
      if (r.rows.length > 0) memberId = r.rows[0].member_id;
    }
  }

  if (!memberId) return null;

  const adminCheck = await query(
    `SELECT id FROM members WHERE id = $1 AND ('team_admin' = ANY(roles) OR 'admin' = ANY(roles))`,
    [memberId]
  );
  return adminCheck.rows.length > 0 ? memberId : null;
}

export default async function TeamAdminPage() {
  const adminId = await getAdminMemberId();
  if (!adminId) redirect('/team');

  return <AdminPanel />;
}
