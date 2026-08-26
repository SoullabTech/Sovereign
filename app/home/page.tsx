import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { query } from '@/lib/db/postgres';
import { PortalThreshold } from '@/components/portal/PortalThreshold';

// ─── Auth + member fetch ──────────────────────────────────────────────────────

async function getMemberForPortal() {
  const cookieStore = await cookies();
  let memberId: string | null = null;

  const cookieMemberId = cookieStore.get('maia_member_id')?.value;
  if (cookieMemberId) {
    const r = await query('SELECT id FROM members WHERE id = $1', [cookieMemberId]);
    if (r.rows.length > 0) memberId = cookieMemberId;
  }

  if (!memberId) {
    const sessionToken = cookieStore.get('maia_session')?.value;
    if (sessionToken) {
      const r = await query(
        `SELECT member_id FROM auth_sessions
         WHERE session_token = $1 AND expires_at > NOW() AND revoked = FALSE`,
        [sessionToken]
      );
      if (r.rows.length > 0) memberId = r.rows[0].member_id;
    }
  }

  if (!memberId) return null;

  const r = await query(
    `SELECT id, name, tier FROM members WHERE id = $1`,
    [memberId]
  );
  return r.rows[0] as { id: string; name: string; tier: string } | undefined ?? null;
}

// ─── Gathering strip data ─────────────────────────────────────────────────────

async function getGatheringData(memberId: string) {
  const [sessionR, atomR] = await Promise.all([
    query(
      // Sanctuary sessions never enter continuity (CLAUDE.md, Sanctuary
      // invariants): they are useful in the moment, then gone. Offering one
      // back as somewhere to return would be exactly the retention the mode
      // exists to refuse.
      `SELECT id, created_at, message_count
       FROM maia_sessions
       WHERE member_id = $1
         AND privacy_mode <> 'sanctuary'
       ORDER BY created_at DESC
       LIMIT 1`,
      [memberId]
    ),
    query(
      // memory_scope is a strict containment hierarchy (migration
      // 20260630000005). A practitioner's client- and encounter-scoped atoms
      // are material about someone else, held in a different context; they are
      // never personal-gathering material. status: 'archived' is defined as
      // removed from active recall, and 'protected' (sacred_protected) is
      // non-circulating — neither is ambient.
      `SELECT id, title, body, is_breakthrough, created_at
       FROM member_memory_atoms
       WHERE member_id = $1
         AND memory_scope = 'personal'
         AND status = 'active'
       ORDER BY created_at DESC
       LIMIT 1`,
      [memberId]
    ),
  ]);

  return {
    lastSession: sessionR.rows[0] as {
      id: string;
      created_at: string;
      message_count: number;
    } | undefined ?? null,
    recentAtom: atomR.rows[0] as {
      id: string;
      title: string;
      body: string | null;
      is_breakthrough: boolean;
      created_at: string;
    } | undefined ?? null,
  };
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const member = await getMemberForPortal();
  if (!member) redirect('/signin');

  const { lastSession, recentAtom } = await getGatheringData(member.id);

  return (
    <PortalThreshold
      memberName={member.name}
      storedTier={member.tier}
      lastSession={lastSession}
      recentAtom={recentAtom}
    />
  );
}
