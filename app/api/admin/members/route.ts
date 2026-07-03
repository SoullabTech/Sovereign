/**
 * Admin — Member list
 *
 * GET /api/admin/members[?q=search]
 *
 * Returns members with their lifecycle status for the admin management console.
 * Shows ALL statuses (active / disabled / archived) — this is the surface for
 * managing them. Admin-gated via requireAdmin (x-admin-secret).
 *
 * Sensitive credential fields (passkey, password_hash) are never returned.
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { requireAdmin } from '@/lib/auth/requireAdmin';

export async function GET(request: NextRequest) {
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ members: [], count: 0 });
  }

  const denied = requireAdmin(request);
  if (denied) return denied;

  try {
    const q = (new URL(request.url).searchParams.get('q') || '').trim();
    const params: string[] = [];
    let where = '';
    if (q) {
      params.push(`%${q}%`);
      where =
        `WHERE (name ILIKE $1 OR preferred_name ILIKE $1 OR username ILIKE $1 OR email ILIKE $1)`;
    }

    const result = await query(
      `SELECT id, name, preferred_name, username, email, onboarded, tier,
              status, status_changed_at, status_changed_by, status_reason,
              created_at, last_sign_in
         FROM members
         ${where}
        ORDER BY (status <> 'active') DESC, last_sign_in DESC NULLS LAST, created_at DESC
        LIMIT 500`,
      params
    );

    const members = result.rows.map((row) => ({
      id: row.id,
      name: (row.name || '').trim() || null,
      preferredName: (row.preferred_name || '').trim() || null,
      username: row.username,
      email: row.email,
      onboarded: row.onboarded,
      tier: row.tier || 'free',
      status: row.status,
      statusChangedAt: row.status_changed_at ? new Date(row.status_changed_at).toISOString() : null,
      statusChangedBy: row.status_changed_by ?? null,
      statusReason: row.status_reason ?? null,
      createdAt: row.created_at ? new Date(row.created_at).toISOString() : null,
      lastSignIn: row.last_sign_in ? new Date(row.last_sign_in).toISOString() : null,
    }));

    return NextResponse.json({ members, count: members.length });
  } catch (error) {
    console.error('[admin/members] List error:', error);
    return NextResponse.json({ error: 'Failed to list members' }, { status: 500 });
  }
}
