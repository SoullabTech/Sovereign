import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { query } from '@/lib/db/postgres';
import { getChannelBySlug, listChannels } from '@/lib/team/ChannelService';
import { isChannelAdminOrTeamAdmin } from '@/lib/team/permissions';
import { resolveCurrentTeamId, COLAB_TEAM_COOKIE } from '@/lib/team/colabTeams';
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

  // Channels are team-scoped; resolve the slug within the member's current team.
  const cookieStore = await cookies();
  const teamId = await resolveCurrentTeamId(
    memberId,
    cookieStore.get(COLAB_TEAM_COOKIE)?.value ?? null
  );
  const channel = await getChannelBySlug(channelSlug, teamId).catch(() => null);

  if (!channel) {
    // Distinguish an empty workspace (no channels yet) from a genuinely missing
    // channel, so a channel-less team gets a true empty state — not a false
    // "#general not found".
    const channels = teamId ? await listChannels(memberId, teamId).catch(() => []) : [];
    const emptyWorkspace = channels.length === 0;
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-8">
        <span className="text-5xl opacity-20">#</span>
        {emptyWorkspace ? (
          <>
            <p className="text-white/40 text-sm">This workspace has no channels yet.</p>
            <p className="text-white/20 text-xs">
              Use the + next to “Channels” in the sidebar to create the first one.
            </p>
          </>
        ) : (
          <>
            <p className="text-white/40 text-sm">
              Channel <span className="text-white/60 font-medium">#{channelSlug}</span> not found.
            </p>
            <p className="text-white/20 text-xs">Pick a channel from the sidebar.</p>
          </>
        )}
      </div>
    );
  }

  // Channel owner/admin or global team admin: can manage members and delete any message.
  const isAdmin = await isChannelAdminOrTeamAdmin(memberId, channel.id).catch(() => false);

  return (
    <ChannelView
      channel={channel}
      currentMemberId={memberId}
      isAdmin={isAdmin}
    />
  );
}
