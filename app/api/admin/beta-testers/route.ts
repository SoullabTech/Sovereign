/**
 * GET /api/admin/beta-testers
 *
 * Read model for everyone who carries ANY beta signal. "Beta tester" is not one
 * fact in this system; four different things carry the name and each governs
 * something different:
 *
 *   members.tester                   Field Lab opt-in, member-toggled (Field Lab only)
 *   members.roles ∋ 'beta_tester'    mobile entitlement: bypasses tier gates
 *   ops_contacts beta_tester/active  Writer's Studio pilot, founder pipeline
 *   EARLY_FIELD_MEMBER_IDS (env)     separate experimental cohort
 *
 * No signal is treated as the truth. Each is reported separately so the overlaps
 * and gaps are visible. Read-only: nothing here grants or removes access.
 */
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { checkAdminAuth, adminUnauthorized } from '@/lib/admin/adminAuth';
import { canEnterEarlyField, earlyFieldConfigFromEnv, parseCohort } from '@/lib/access/earlyFieldAccess';

export const dynamic = 'force-dynamic';

type TesterRow = {
  id: string;
  flag: boolean | null;
  has_role: boolean | null;
  has_pipeline: boolean | null;
  name: string | null;
  preferred_name: string | null;
  username: string | null;
  email: string | null;
  tier: string | null;
  roles: string[] | null;
  onboarded: boolean | null;
  password_hash: string | null;
  has_webauthn: boolean | null;
  preferred_auth_method: string | null;
  subscription_active: boolean | null;
  subscription_expires_at: string | Date | null;
  last_sign_in: string | Date | null;
  created_at: string | Date | null;
};

function present(value: string | null | undefined): boolean {
  return typeof value === 'string' && value.trim().length > 0;
}

export async function GET(req: NextRequest) {
  const auth = await checkAdminAuth(req);
  if (!auth.authed) return adminUnauthorized();

  try {
    const cohort = parseCohort(earlyFieldConfigFromEnv().memberIds);
    const cohortIds = cohort ? Array.from(cohort) : [];
    const result = await query<TesterRow>(
      `SELECT
         m.id,
         COALESCE(m.tester, FALSE) AS flag,
         COALESCE(m.roles @> ARRAY['beta_tester']::text[], FALSE) AS has_role,
         EXISTS (
           SELECT 1 FROM ops_contacts c
            WHERE c.member_id = m.id AND c.deleted_at IS NULL
              AND c.contact_type = 'beta_tester' AND c.pipeline_stage = 'active'
         ) AS has_pipeline,
         m.name, m.preferred_name, m.username, m.email, m.tier, m.roles, m.onboarded,
         m.password_hash, m.has_webauthn, m.preferred_auth_method,
         m.subscription_active, m.subscription_expires_at, m.last_sign_in, m.created_at
       FROM members m
       WHERE m.tester = TRUE
          OR m.roles @> ARRAY['beta_tester']::text[]
          OR m.id = ANY($1::uuid[])
          OR EXISTS (
            SELECT 1 FROM ops_contacts c
             WHERE c.member_id = m.id AND c.deleted_at IS NULL
               AND c.contact_type = 'beta_tester' AND c.pipeline_stage = 'active'
          )
       ORDER BY COALESCE(
         NULLIF(m.preferred_name, ''), NULLIF(m.name, ''), NULLIF(m.username, ''), NULLIF(m.email, '')
       ) ASC NULLS LAST, m.created_at ASC`,
      [cohortIds],
    );
    const unlinked = await query<{ n: string | number }>(
      `SELECT COUNT(*) AS n FROM ops_contacts
        WHERE contact_type = 'beta_tester' AND pipeline_stage = 'active'
          AND deleted_at IS NULL AND member_id IS NULL`,
    );
    const unlinkedPipelineContacts = Number(unlinked.rows[0]?.n ?? 0);
    const testers = result.rows.map((row) => {
      const methods: string[] = [];
      if (present(row.email)) methods.push('email-code');
      if (present(row.password_hash) && (present(row.username) || present(row.email))) methods.push('password');
      if (row.has_webauthn === true) methods.push('passkey');

      return {
        id: row.id,
        name: row.preferred_name || row.name || row.username || row.email || 'Unnamed member',
        username: row.username,
        email: row.email,
        tier: row.tier || 'free',
        roles: row.roles || ['member'],
        onboarded: row.onboarded === true,
        signInMethods: methods,
        signInReady: methods.length > 0,
        signals: {
          flag: row.flag === true,
          role: row.has_role === true,
          pipeline: row.has_pipeline === true,
        },
        earlyFieldAdmitted: canEnterEarlyField(row.id),
        subscriptionActive: row.subscription_active === true,
        subscriptionExpiresAt: row.subscription_expires_at,
        lastSignIn: row.last_sign_in,
        createdAt: row.created_at,
        preferredAuthMethod: row.preferred_auth_method,
      };
    });
    return NextResponse.json({
      testers,
      summary: {
        total: testers.length,
        signInReady: testers.filter((t) => t.signInReady).length,
        needsReview: testers.filter((t) => !t.signInReady).length,
        earlyField: testers.filter((t) => t.earlyFieldAdmitted).length,
        onboarded: testers.filter((t) => t.onboarded).length,
        bySignal: {
          flag: testers.filter((t) => t.signals.flag).length,
          role: testers.filter((t) => t.signals.role).length,
          pipeline: testers.filter((t) => t.signals.pipeline).length,
        },
        unlinkedPipelineContacts,
      },
      authority: {
        model: 'union of independent signals; none is treated as the truth',
        signals: [
          { id: 'flag', label: 'Field Lab flag', source: 'members.tester', governs: 'Field Lab access; member opt-in' },
          { id: 'role', label: 'Beta role', source: "members.roles contains beta_tester", governs: 'mobile tier-gate bypass' },
          { id: 'pipeline', label: 'Pipeline contact', source: 'ops_contacts beta_tester, stage active', governs: "Writer's Studio pilot" },
        ],
        platformAccess: 'authenticated member; minimum tier free',
        subscriptionGatesOrdinaryPlatform: false,
        earlyFieldSeparate: true,
      },
    });
  } catch (err) {
    console.error('[admin/beta-testers] DB error:', err);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}
