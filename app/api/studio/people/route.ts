export const dynamic = 'force-dynamic';
export async function generateStaticParams() { return []; }

/**
 * STUDIO PEOPLE API
 *
 * The generalized person + relationships surface. Studio is a relationship-centered
 * workspace, not a client manager: a practitioner stewards clients, colleagues, mentors,
 * referral partners, family, trusted contacts — many relationships to one person.
 *
 * This route models the RELATIONSHIP, not a person type. It reads and writes the same
 * `practitioner_clients` row the /clients route uses (one person record, no parallel
 * table), but in relationship vocabulary and without the client-specific richness
 * (billing, astrology, leadership) — those stay on /clients.
 *
 *   GET    ?relationship=trusted-contact&member=false&search=…  → list people
 *   POST   { name?, email?, phone?, relationships[] }            → save a person (name OR email)
 *   PATCH  { id, addRelationship? | removeRelationship? | … }    → update / re-label
 *
 * Membership is a SEPARATE axis (member_id → members), set only by the registration flow,
 * never here. isMember is derived read-only; this route never creates or links a member
 * account, and never moves data into a member's sovereign space.
 */

import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db/postgres';
import { getCurrentPractitioner } from '@/lib/auth/getCurrentPractitioner';
import { randomUUID } from 'crypto';

// Curated relationship vocabulary. Extensible by adding a value here — the DB column has
// no CHECK by design, so new relationships need no migration. Hyphenated, matching the
// migration comment (20260627000001). Mirror of the clients route's VALID_STATUSES pattern.
const VALID_RELATIONSHIPS = [
  'client', 'former-client', 'colleague', 'mentor', 'advisor', 'peer',
  'trusted-contact', 'referral-partner', 'prospective-member', 'future-practitioner',
  'family', 'spouse', 'friend', 'collaborator', 'assistant',
  'organization-contact', 'emergency-contact', 'guest',
] as const;
const VALID_RELATIONSHIP_SET = new Set<string>(VALID_RELATIONSHIPS);

const VALID_STATUSES = ['invited', 'active', 'paused', 'completed', 'archived'] as const;
type PersonStatus = typeof VALID_STATUSES[number];
function isValidStatus(s: string): s is PersonStatus {
  return (VALID_STATUSES as readonly string[]).includes(s);
}

/** Normalize, lowercase, de-dupe and validate a relationships array. */
function normalizeRelationships(input: unknown): { roles: string[]; invalid: string[] } {
  const raw = (Array.isArray(input) ? input : [])
    .map((r) => String(r).trim().toLowerCase())
    .filter(Boolean);
  const invalid = raw.filter((r) => !VALID_RELATIONSHIP_SET.has(r));
  const roles = Array.from(new Set(raw.filter((r) => VALID_RELATIONSHIP_SET.has(r))));
  return { roles, invalid };
}

function shapePerson(row: any) {
  return {
    personId: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    relationships: row.relationship_roles || [],
    isMember: row.member_id != null,
    status: row.status,
    tags: row.tags || [],
    lastSessionAt: row.last_session_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

const PERSON_COLUMNS = `
  id, practitioner_id, name, email, phone, relationship_roles, member_id,
  status, tags, last_session_at, created_at, updated_at
`;

export async function GET(request: NextRequest) {
  try {
    const identity = await getCurrentPractitioner(request);
    if (!identity) {
      return NextResponse.json({ error: 'Unauthorized or not a practitioner' }, { status: 401 });
    }
    const { practitionerId } = identity;

    const { searchParams } = new URL(request.url);
    const relationship = searchParams.get('relationship');
    const member = searchParams.get('member'); // 'true' | 'false'
    const search = searchParams.get('search');
    const limit = Math.min(parseInt(searchParams.get('limit') || '100'), 200);

    let sql = `SELECT ${PERSON_COLUMNS} FROM practitioner_clients WHERE practitioner_id = $1`;
    const params: (string | number)[] = [practitionerId];

    // Relationship filter (e.g. ?relationship=trusted-contact) — array containment.
    if (relationship) {
      params.push(relationship.trim().toLowerCase());
      sql += ` AND $${params.length} = ANY(relationship_roles)`;
    }

    // Membership axis filter — orthogonal to relationship.
    if (member === 'true') sql += ` AND member_id IS NOT NULL`;
    else if (member === 'false') sql += ` AND member_id IS NULL`;

    if (search) {
      params.push(`%${search}%`);
      sql += ` AND (name ILIKE $${params.length} OR email ILIKE $${params.length})`;
    }

    params.push(limit);
    sql += ` ORDER BY last_session_at DESC NULLS LAST, created_at DESC LIMIT $${params.length}`;

    const result = await db.query(sql, params);
    return NextResponse.json({ people: result.rows.map(shapePerson) });
  } catch (error) {
    console.error('[Studio People] GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch people' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const identity = await getCurrentPractitioner(request);
    if (!identity) {
      return NextResponse.json({ error: 'Unauthorized or not a practitioner' }, { status: 401 });
    }
    const { practitionerId } = identity;

    const body = await request.json();
    const { name, email, phone, status = 'active', tags = [] } = body;

    const cleanName = typeof name === 'string' ? name.trim() : '';
    const cleanEmail = typeof email === 'string' && email.trim() ? email.trim().toLowerCase() : null;
    const cleanPhone = typeof phone === 'string' && phone.trim() ? phone.trim() : null;

    // A person must be identifiable by at least one of name or email (mirrors the
    // encounter_participants identifier CHECK and the name/email-optional generalization).
    if (!cleanName && !cleanEmail) {
      return NextResponse.json({ error: 'A name or an email is required' }, { status: 400 });
    }

    if (!isValidStatus(status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}` },
        { status: 400 }
      );
    }

    // Default to trusted-contact: this surface exists for non-client relationships.
    const { roles, invalid } = normalizeRelationships(
      body.relationships ?? body.relationshipRoles ?? ['trusted-contact']
    );
    if (invalid.length > 0) {
      return NextResponse.json(
        { error: `Unknown relationship(s): ${invalid.join(', ')}. Valid: ${VALID_RELATIONSHIPS.join(', ')}` },
        { status: 400 }
      );
    }
    const rolesToWrite = roles.length > 0 ? roles : ['trusted-contact'];

    // One person, many relationships: if a person with this email already exists for this
    // practitioner, MERGE the new relationships into that row rather than creating a
    // duplicate record (Kelly: "do not create separate records because someone is both a
    // colleague and a client"). Only possible when an email is given (the dedup key).
    if (cleanEmail) {
      const existing = await db.query(
        `SELECT ${PERSON_COLUMNS} FROM practitioner_clients
         WHERE practitioner_id = $1 AND email = $2 LIMIT 1`,
        [practitionerId, cleanEmail]
      );
      if (existing.rows.length > 0) {
        const merged = await db.query(
          `UPDATE practitioner_clients
             SET relationship_roles = (
                   SELECT ARRAY(SELECT DISTINCT unnest(relationship_roles || $3::text[]))
                 ),
                 phone = COALESCE(phone, $4),
                 updated_at = NOW()
           WHERE id = $1 AND practitioner_id = $2
           RETURNING ${PERSON_COLUMNS}`,
          [existing.rows[0].id, practitionerId, rolesToWrite, cleanPhone]
        );
        return NextResponse.json({ person: shapePerson(merged.rows[0]), merged: true });
      }
    }

    const id = randomUUID();
    const result = await db.query(
      `INSERT INTO practitioner_clients
         (id, practitioner_id, name, email, phone, status, tags, relationship_roles)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING ${PERSON_COLUMNS}`,
      [id, practitionerId, cleanName || null, cleanEmail, cleanPhone, status, JSON.stringify(tags), rolesToWrite]
    );
    return NextResponse.json({ person: shapePerson(result.rows[0]) });
  } catch (error) {
    console.error('[Studio People] POST error:', error);
    return NextResponse.json({ error: 'Failed to save person' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const identity = await getCurrentPractitioner(request);
    if (!identity) {
      return NextResponse.json({ error: 'Unauthorized or not a practitioner' }, { status: 401 });
    }
    const { practitionerId } = identity;

    const body = await request.json();
    const { id } = body;
    if (!id) {
      return NextResponse.json({ error: 'Person id is required' }, { status: 400 });
    }

    const updateFields: string[] = [];
    const params: (string | null | number | string[])[] = [id, practitionerId];

    if (body.name !== undefined) {
      const n = typeof body.name === 'string' ? body.name.trim() : '';
      updateFields.push(`name = $${params.length + 1}`);
      params.push(n || null);
    }
    if (body.email !== undefined) {
      const e = typeof body.email === 'string' && body.email.trim() ? body.email.trim().toLowerCase() : null;
      updateFields.push(`email = $${params.length + 1}`);
      params.push(e);
    }
    if (body.phone !== undefined) {
      updateFields.push(`phone = $${params.length + 1}`);
      params.push(typeof body.phone === 'string' && body.phone.trim() ? body.phone.trim() : null);
    }
    if (body.status !== undefined) {
      if (!isValidStatus(body.status)) {
        return NextResponse.json(
          { error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}` },
          { status: 400 }
        );
      }
      updateFields.push(`status = $${params.length + 1}`);
      params.push(body.status);
    }

    // Relationship re-labelling. addRelationship / removeRelationship are the orthogonal-
    // label operations (a person gains/loses a way of being known); `relationships` sets
    // the whole set. All validated against the vocabulary.
    if (body.addRelationship !== undefined || body.removeRelationship !== undefined || body.relationships !== undefined) {
      const candidate = body.relationships ?? body.addRelationship ?? body.removeRelationship;
      const { invalid } = normalizeRelationships(Array.isArray(candidate) ? candidate : [candidate]);
      if (invalid.length > 0) {
        return NextResponse.json(
          { error: `Unknown relationship(s): ${invalid.join(', ')}. Valid: ${VALID_RELATIONSHIPS.join(', ')}` },
          { status: 400 }
        );
      }
    }
    if (body.relationships !== undefined) {
      const { roles } = normalizeRelationships(body.relationships);
      updateFields.push(`relationship_roles = $${params.length + 1}`);
      params.push(roles);
    } else if (body.addRelationship !== undefined) {
      const { roles } = normalizeRelationships(Array.isArray(body.addRelationship) ? body.addRelationship : [body.addRelationship]);
      updateFields.push(
        `relationship_roles = (SELECT ARRAY(SELECT DISTINCT unnest(relationship_roles || $${params.length + 1}::text[])))`
      );
      params.push(roles);
    } else if (body.removeRelationship !== undefined) {
      const { roles } = normalizeRelationships(Array.isArray(body.removeRelationship) ? body.removeRelationship : [body.removeRelationship]);
      // Remove each named role; never let the array become NULL.
      updateFields.push(
        `relationship_roles = COALESCE((SELECT ARRAY(SELECT unnest(relationship_roles) EXCEPT SELECT unnest($${params.length + 1}::text[]))), '{}')`
      );
      params.push(roles);
    }

    if (updateFields.length === 0) {
      return NextResponse.json({ error: 'No updates provided' }, { status: 400 });
    }
    updateFields.push(`updated_at = NOW()`);

    const result = await db.query(
      `UPDATE practitioner_clients SET ${updateFields.join(', ')}
       WHERE id = $1 AND practitioner_id = $2
       RETURNING ${PERSON_COLUMNS}`,
      params
    );
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Person not found' }, { status: 404 });
    }
    return NextResponse.json({ person: shapePerson(result.rows[0]) });
  } catch (error) {
    console.error('[Studio People] PATCH error:', error);
    return NextResponse.json({ error: 'Failed to update person' }, { status: 500 });
  }
}
