/**
 * GET /api/admin/beta-testers
 *
 * Authoritative read model for the beta cohort.
 * members.tester is the cohort authority; browser-local beta lists are not.
 * Early Field remains a separate operational cohort.
 */
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { checkAdminAuth, adminUnauthorized } from '@/lib/admin/adminAuth';
import { canEnterEarlyField } from '@/lib/access/earlyFieldAccess';

export const dynamic = 'force-dynamic';

type TesterRow = {
  id: string;
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
    const result = await query<TesterRow>(
      `SELECT
         id, name, preferred_name, username, email, tier, roles, onboarded,
         password_hash, has_webauthn, preferred_auth_method,
         subscription_active, subscription_expires_at, last_sign_in, created_at
       FROM members
       WHERE tester = TRUE
       ORDER BY COALESCE(
         NULLIF(preferred_name, ''), NULLIF(name, ''), NULLIF(username, ''), NULLIF(email, '')
       ) ASC NULLS LAST, created_at ASC`,
    );
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
      },
      authority: {
        betaCohort: 'members.tester',
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
