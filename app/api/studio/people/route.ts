export const dynamic = 'force-dynamic';
export async function generateStaticParams() { return []; }

/**
 * STUDIO PEOPLE API — Co-Lab scoped
 *
 * Every person record belongs to a Co-Lab (studio_teams.id). The active
 * Co-Lab is resolved from the `colab_team_id` cookie — a practitioner who
 * belongs to multiple Co-Labs sees only the people inside the active one.
 *
 * Constitutional invariant: a member list belongs to a Co-Lab, not the
 * whole platform. Server-side enforcement only — client-side filtering is
 * not enough.
 *
 * Roles (studio_person_roles): client | guest | colleague | mentor |
 *   referral_partner | prospective_member | team_member
 * Account status: DERIVED from member_id — never stored as a role.
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import db from '@/lib/db/postgres';
import { getCurrentPractitioner } from '@/lib/auth/getCurrentPractitioner';
import { resolveCurrentTeamId, COLAB_TEAM_COOKIE } from '@/lib/team/colabTeams';
import { getTeamRole } from '@/lib/auth/teamPermissions';

const VALID_ROLES = [
  'client', 'guest', 'colleague', 'mentor',
  'referral_partner', 'prospective_member', 'team_member',
] as const;
type PersonRole = typeof VALID_ROLES[number];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function sanitizeRoles(input: unknown): PersonRole[] {
  if (!Array.isArray(input)) return [];
  const seen = new Set<PersonRole>();
  for (const r of input) {
    if (typeof r === 'string' && (VALID_ROLES as readonly string[]).includes(r)) {
      seen.add(r as PersonRole);
    }
  }
  return [...seen];
}

const PERSON_SELECT = `
  SELECT sp.id, sp.name, sp.email, sp.phone, sp.member_id, sp.client_id, sp.team_id,
         COALESCE(array_agg(spr.role) FILTER (WHERE spr.role IS NOT NULL), '{}') AS roles
  FROM studio_people sp
  LEFT JOIN studio_person_roles spr ON spr.person_id = sp.id
`;

function mapPerson(row: any) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    teamId: row.team_id,
    roles: (row.roles || []).filter(Boolean),
    accountStatus: row.member_id ? 'linked' : 'none',
    isClient: !!row.client_id,
  };
}

/** Resolve the active Co-Lab for the request. Returns null if unresolvable. */
async function resolveTeam(memberId: string, request: NextRequest): Promise<string | null> {
  const jar = await cookies();
  const cookieTeam = jar.get(COLAB_TEAM_COOKIE)?.value
    ?? request.headers.get('x-colab-team-id')
    ?? null;
  return resolveCurrentTeamId(memberId, cookieTeam);
}

// ── GET — list / search people in the active Co-Lab ──────────────────────────

export async function GET(request: NextRequest) {
  try {
    const identity = await getCurrentPractitioner(request);
    if (!identity) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { practitionerId, memberId } = identity;

    const teamId = await resolveTeam(memberId, request);
    if (!teamId) {
      return NextResponse.json({ people: [] });
    }

    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q')?.trim() || null;
    const role = searchParams.get('role');
    const roleFilter = role && (VALID_ROLES as readonly string[]).includes(role) ? role : null;
    const limit = Math.min(parseInt(searchParams.get('limit') || '100'), 200);

    const result = await db.query(`
      ${PERSON_SELECT}
      WHERE sp.team_id = $1
        AND ($2::text IS NULL OR sp.name ILIKE '%' || $2 || '%' OR sp.email ILIKE '%' || $2 || '%')
      GROUP BY sp.id
      HAVING ($3::text IS NULL OR bool_or(spr.role = $3))
      ORDER BY sp.name ASC
      LIMIT $4
    `, [teamId, q, roleFilter, limit]);

    return NextResponse.json({ people: result.rows.map(mapPerson), teamId });
  } catch (error) {
    console.error('[Studio People] GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch people' }, { status: 500 });
  }
}

// ── POST — create or merge a person inside the active Co-Lab ─────────────────

export async function POST(request: NextRequest) {
  try {
    const identity = await getCurrentPractitioner(request);
    if (!identity) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { practitionerId, memberId } = identity;

    const teamId = await resolveTeam(memberId, request);
    if (!teamId) {
      return NextResponse.json({ error: 'No active Co-Lab. Select a workspace before adding people.' }, { status: 400 });
    }

    // Verify the caller may act in this team.
    const role = await getTeamRole(memberId, teamId);
    const defaultId = await (await import('@/lib/team/colabTeams')).getDefaultTeamId();
    if (teamId !== defaultId && !role) {
      return NextResponse.json({ error: 'You do not have access to this Co-Lab.' }, { status: 403 });
    }

    const body = await request.json();
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    const email = typeof body.email === 'string' ? body.email.trim() : '';
    const phone = typeof body.phone === 'string' && body.phone.trim() ? body.phone.trim() : null;
    const roles = sanitizeRoles(body.roles);

    if (!name) return NextResponse.json({ error: 'name is required' }, { status: 400 });
    if (!email || !EMAIL_RE.test(email)) return NextResponse.json({ error: 'a valid email is required' }, { status: 400 });

    const rolesToApply = roles.length ? roles : (['guest'] as PersonRole[]);

    const person = await db.transaction(async (client) => {
      // Upsert by (team_id, lower(email)) — one identity per human per Co-Lab.
      const existing = await client.query(
        `SELECT id FROM studio_people WHERE team_id = $1 AND lower(email) = lower($2) LIMIT 1`,
        [teamId, email]
      );

      let personId: string;
      if (existing.rows.length) {
        personId = existing.rows[0].id;
        await client.query(
          `UPDATE studio_people SET name = $2, phone = COALESCE($3, phone), updated_at = NOW() WHERE id = $1`,
          [personId, name, phone]
        );
      } else {
        const inserted = await client.query(
          `INSERT INTO studio_people (team_id, practitioner_id, name, email, phone)
           VALUES ($1, $2, $3, $4, $5) RETURNING id`,
          [teamId, practitionerId, name, email, phone]
        );
        personId = inserted.rows[0].id;
      }

      for (const r of rolesToApply) {
        await client.query(
          `INSERT INTO studio_person_roles (person_id, role) VALUES ($1, $2) ON CONFLICT (person_id, role) DO NOTHING`,
          [personId, r]
        );
      }

      const full = await client.query(`${PERSON_SELECT} WHERE sp.id = $1 GROUP BY sp.id`, [personId]);
      return full.rows[0];
    });

    return NextResponse.json({ person: mapPerson(person) }, { status: 201 });
  } catch (error) {
    console.error('[Studio People] POST error:', error);
    return NextResponse.json({ error: 'Failed to save person' }, { status: 500 });
  }
}

// ── PATCH — edit a person / adjust roles ────────────────────────────────────

export async function PATCH(request: NextRequest) {
  try {
    const identity = await getCurrentPractitioner(request);
    if (!identity) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { practitionerId, memberId } = identity;

    const teamId = await resolveTeam(memberId, request);
    if (!teamId) {
      return NextResponse.json({ error: 'No active Co-Lab.' }, { status: 400 });
    }

    const body = await request.json();
    const id = typeof body.id === 'string' ? body.id : '';
    if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 });

    const name = typeof body.name === 'string' ? body.name.trim() : undefined;
    const phone = typeof body.phone === 'string' ? body.phone.trim() : undefined;
    const email = typeof body.email === 'string' ? body.email.trim() : undefined;
    if (email !== undefined && email !== '' && !EMAIL_RE.test(email)) {
      return NextResponse.json({ error: 'a valid email is required' }, { status: 400 });
    }
    const addRoles = sanitizeRoles(body.addRoles);
    const removeRoles = sanitizeRoles(body.removeRoles);

    const person = await db.transaction(async (client) => {
      // Ownership: person must belong to the active Co-Lab (team_id scope, not practitioner_id).
      const owned = await client.query(
        `SELECT id FROM studio_people WHERE id = $1 AND team_id = $2`,
        [id, teamId]
      );
      if (!owned.rows.length) return null;

      const sets: string[] = [];
      const params: any[] = [id];
      if (name) { params.push(name); sets.push(`name = $${params.length}`); }
      if (phone !== undefined) { params.push(phone || null); sets.push(`phone = $${params.length}`); }
      if (email) { params.push(email); sets.push(`email = $${params.length}`); }
      if (sets.length) {
        sets.push('updated_at = NOW()');
        await client.query(`UPDATE studio_people SET ${sets.join(', ')} WHERE id = $1`, params);
      }

      for (const r of addRoles) {
        await client.query(
          `INSERT INTO studio_person_roles (person_id, role) VALUES ($1, $2) ON CONFLICT (person_id, role) DO NOTHING`,
          [id, r]
        );
      }
      if (removeRoles.length) {
        await client.query(
          `DELETE FROM studio_person_roles WHERE person_id = $1 AND role = ANY($2)`,
          [id, removeRoles]
        );
      }

      const full = await client.query(`${PERSON_SELECT} WHERE sp.id = $1 GROUP BY sp.id`, [id]);
      return full.rows[0];
    });

    if (!person) {
      return NextResponse.json({ error: 'Person not found in this Co-Lab' }, { status: 404 });
    }
    return NextResponse.json({ person: mapPerson(person) });
  } catch (error: any) {
    if (error?.code === '23505') {
      return NextResponse.json({ error: 'Another person already uses that email in this Co-Lab' }, { status: 409 });
    }
    console.error('[Studio People] PATCH error:', error);
    return NextResponse.json({ error: 'Failed to update person' }, { status: 500 });
  }
}
