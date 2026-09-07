import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { query } from '@/lib/db/postgres';
import { resolveCurrentTeamId, COLAB_TEAM_COOKIE } from '@/lib/team/colabTeams';
import { TeamShell } from '@/components/team/TeamShell';

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

/**
 * ROUTE GROUP `(shell)` — WHY THIS LAYOUT LIVES ONE LEVEL DOWN.
 *
 * This layout redirects every unauthenticated visitor to sign-in. It used to sit
 * at `app/team/layout.tsx`, where it also wrapped `app/team/invite/[token]` —
 * the ONE `/team` route that must work BEFORE a visitor has an account.
 * `config/accessMatrix.ts` already declares that route public
 * (`{ prefix: '/team/invite/', public: true }`), so middleware let strangers
 * through and this layout redirected them anyway: two authorities disagreeing,
 * with the silent one winning. A stranger holding a valid invitation was sent
 * to `/signin?next=/team/general` and could never register.
 *
 * `(shell)` is a route group, so it contributes NOTHING to any URL: `/team`,
 * `/team/general`, `/team/admin` and the rest resolve exactly as before. What
 * changed is only which files this layout wraps — `invite/[token]` now sits
 * outside it, matching the access matrix instead of contradicting it.
 *
 * ⛔ DO NOT move `invite/[token]` into this group, and do not add an auth
 * exception inside this layout to compensate. The separation IS the boundary:
 * everything under `(shell)` is authenticated, without exception, and the one
 * public page is public by position rather than by conditional.
 */
export default async function TeamLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const memberId = await getSessionMemberId();
  if (!memberId) redirect('/signin?next=/team/general');

  const cookieStore = await cookies();
  const currentTeamId = await resolveCurrentTeamId(
    memberId,
    cookieStore.get(COLAB_TEAM_COOKIE)?.value ?? null
  );

  return (
    <TeamShell currentMemberId={memberId} currentTeamId={currentTeamId}>
      {children}
    </TeamShell>
  );
}
