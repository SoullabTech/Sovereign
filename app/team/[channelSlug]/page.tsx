import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { query } from '@/lib/db/postgres';
import { getChannelBySlug } from '@/lib/team/ChannelService';
import { ChannelView } from '@/components/team/ChannelView';

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

export default async function ChannelPage({
  params,
}: {
  params: Promise<{ channelSlug: string }>;
}) {
  const { channelSlug } = await params;

  const memberId = await getSessionMemberId();
  if (!memberId) redirect(`/signin?next=/team/${channelSlug}`);

  const channel = await getChannelBySlug(channelSlug).catch(() => null);

  if (!channel) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-8">
        <span className="text-5xl opacity-20">#</span>
        <p className="text-white/40 text-sm">
          Channel <span className="text-white/60 font-medium">#{channelSlug}</span> not found.
        </p>
        <p className="text-white/20 text-xs">
          Apply the team messaging migration to get started.
        </p>
      </div>
    );
  }

  return (
    <ChannelView
      channel={channel}
      currentMemberId={memberId}
    />
  );
}
