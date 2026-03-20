import { cookies } from 'next/headers';
import { query } from '@/lib/db/postgres';
import { InviteAcceptClient } from '@/components/team/InviteAcceptClient';

interface InviteRow {
  id: string;
  email: string;
  message: string | null;
  accepted_at: string | null;
  expires_at: string;
  invited_by_name: string | null;
  invited_by_username: string;
}

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

export default async function InviteAcceptPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const result = await query<InviteRow>(
    `SELECT ti.id, ti.email, ti.message, ti.accepted_at, ti.expires_at,
            m.name AS invited_by_name, m.username AS invited_by_username
     FROM team_invites ti
     JOIN members m ON m.id = ti.invited_by
     WHERE ti.token = $1`,
    [token]
  );

  const invite = result.rows[0];

  if (!invite) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center space-y-4">
          <h1 className="text-xl font-semibold text-white/70">Invite not found</h1>
          <p className="text-white/40 text-sm">This invite link is invalid or has already been removed.</p>
        </div>
      </div>
    );
  }

  if (invite.accepted_at) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center space-y-4">
          <h1 className="text-xl font-semibold text-white/70">Already accepted</h1>
          <p className="text-white/40 text-sm">This invite has already been used.</p>
        </div>
      </div>
    );
  }

  const expired = new Date(invite.expires_at) < new Date();
  if (expired) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center space-y-4">
          <h1 className="text-xl font-semibold text-white/70">Invite expired</h1>
          <p className="text-white/40 text-sm">This invite link has expired. Ask the sender to send a new one.</p>
        </div>
      </div>
    );
  }

  const currentMemberId = await getSessionMemberId();
  const inviterName = invite.invited_by_name || invite.invited_by_username;

  return (
    <InviteAcceptClient
      token={token}
      email={invite.email}
      inviterName={inviterName}
      message={invite.message}
      currentMemberId={currentMemberId}
    />
  );
}
