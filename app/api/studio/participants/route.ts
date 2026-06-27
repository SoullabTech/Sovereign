export const dynamic = 'force-dynamic';
export async function generateStaticParams() { return []; }

/**
 * STUDIO ENCOUNTER PARTICIPANTS API — the participation layer.
 *
 * Everyone participates, not only guests. An encounter (session/group/event/workshop/
 * circle) has participants who may be a client, the practitioner, a co-facilitator, an
 * observer, an interpreter, a family member — or a one-time guest. Participation is
 * per-encounter and distinct from the standing relationship: someone may be a mentor in
 * life, an observer today, a co-facilitator tomorrow.
 *
 * Each participant references either a saved Person (personId) or an anonymous identity
 * (name / email with personId null).
 *
 *   GET    ?encounterKind=session&encounterId=…  → participants for an encounter
 *   POST   { encounterKind, encounterId, displayName?, email?, participantRole? }  → add
 *   PATCH  { id, saveAsContact?: true, … }       → update, or PROMOTE to a saved Contact
 *   DELETE ?id=…                                 → remove a participant
 *
 * BOUNDARY (enforced here): adding a participant writes ONLY encounter_participants — never
 * a member, contact, or client; never exposes practitioner notes; never crosses into a
 * sovereign space. Promotion (saveAsContact) writes only practitioner_clients and links
 * personId; it touches neither members, member_memory_atoms, nor case_memories, and it does
 * NOT rewrite participant_role (how someone participated is a historical fact).
 */

import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db/postgres';
import { getCurrentPractitioner } from '@/lib/auth/getCurrentPractitioner';
import { randomUUID } from 'crypto';

// Encounter kinds a participant can attach to. App-validated (no DB CHECK) so new kinds
// need no migration.
const VALID_ENCOUNTER_KINDS = ['session', 'group', 'event', 'workshop', 'circle'] as const;
const VALID_ENCOUNTER_SET = new Set<string>(VALID_ENCOUNTER_KINDS);

// Role IN THE ENCOUNTER (distinct from the standing relationship). Extensible, no DB CHECK.
const VALID_PARTICIPANT_ROLES = [
  'guest', 'client', 'practitioner', 'co-facilitator', 'observer',
  'interpreter', 'family-member', 'attendee', 'speaker',
] as const;
const VALID_PARTICIPANT_ROLE_SET = new Set<string>(VALID_PARTICIPANT_ROLES);

const VALID_CONSENT = ['not_requested', 'requested', 'given', 'declined'] as const;
const VALID_CONSENT_SET = new Set<string>(VALID_CONSENT);

// Standing relationship vocabulary, used only when promoting a participant to a Contact.
const VALID_RELATIONSHIPS = new Set<string>([
  'client', 'former-client', 'colleague', 'mentor', 'advisor', 'peer',
  'trusted-contact', 'referral-partner', 'prospective-member', 'future-practitioner',
  'family', 'spouse', 'friend', 'collaborator', 'assistant',
  'organization-contact', 'emergency-contact', 'guest',
]);

function shapeParticipant(row: any) {
  return {
    id: row.id,
    encounterKind: row.encounter_kind,
    encounterId: row.encounter_id,
    displayName: row.display_name,
    email: row.email,
    phone: row.phone,
    participantRole: row.participant_role,
    roleDetail: row.role_detail,
    consentStatus: row.consent_status,
    notesPrivate: row.notes_private, // practitioner-only; route is practitioner-authenticated
    personId: row.person_id,
    isMember: row.member_id != null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

const COLS = `
  id, practitioner_id, encounter_kind, encounter_id, display_name, email, phone,
  participant_role, role_detail, consent_status, notes_private,
  person_id, member_id, created_at, updated_at
`;

export async function GET(request: NextRequest) {
  try {
    const identity = await getCurrentPractitioner(request);
    if (!identity) {
      return NextResponse.json({ error: 'Unauthorized or not a practitioner' }, { status: 401 });
    }
    const { practitionerId } = identity;

    const { searchParams } = new URL(request.url);
    const encounterKind = searchParams.get('encounterKind');
    const encounterId = searchParams.get('encounterId');
    const limit = Math.min(parseInt(searchParams.get('limit') || '100'), 200);

    let sql = `SELECT ${COLS} FROM encounter_participants WHERE practitioner_id = $1`;
    const params: (string | number)[] = [practitionerId];

    if (encounterKind && encounterId) {
      params.push(encounterKind, encounterId);
      sql += ` AND encounter_kind = $${params.length - 1} AND encounter_id = $${params.length}`;
    }
    params.push(limit);
    sql += ` ORDER BY created_at DESC LIMIT $${params.length}`;

    const result = await db.query(sql, params);
    return NextResponse.json({ participants: result.rows.map(shapeParticipant) });
  } catch (error) {
    console.error('[Studio Participants] GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch participants' }, { status: 500 });
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
    const { encounterKind, encounterId } = body;

    if (!encounterKind || !VALID_ENCOUNTER_SET.has(String(encounterKind))) {
      return NextResponse.json(
        { error: `encounterKind must be one of: ${VALID_ENCOUNTER_KINDS.join(', ')}` },
        { status: 400 }
      );
    }
    if (!encounterId || typeof encounterId !== 'string') {
      return NextResponse.json({ error: 'encounterId is required' }, { status: 400 });
    }

    const displayName = typeof body.displayName === 'string' && body.displayName.trim() ? body.displayName.trim() : null;
    const email = typeof body.email === 'string' && body.email.trim() ? body.email.trim().toLowerCase() : null;
    const phone = typeof body.phone === 'string' && body.phone.trim() ? body.phone.trim() : null;

    if (!displayName && !email) {
      return NextResponse.json({ error: 'A name or an email is required' }, { status: 400 });
    }

    const participantRole = body.participantRole ?? 'guest';
    if (!VALID_PARTICIPANT_ROLE_SET.has(String(participantRole))) {
      return NextResponse.json(
        { error: `participantRole must be one of: ${VALID_PARTICIPANT_ROLES.join(', ')}` },
        { status: 400 }
      );
    }
    if (body.consentStatus != null && !VALID_CONSENT_SET.has(String(body.consentStatus))) {
      return NextResponse.json(
        { error: `consentStatus must be one of: ${VALID_CONSENT.join(', ')}` },
        { status: 400 }
      );
    }

    const id = randomUUID();
    const result = await db.query(
      `INSERT INTO encounter_participants
         (id, practitioner_id, encounter_kind, encounter_id, display_name, email, phone,
          participant_role, role_detail, consent_status, notes_private)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING ${COLS}`,
      [
        id, practitionerId, encounterKind, encounterId, displayName, email, phone,
        participantRole,
        typeof body.roleDetail === 'string' && body.roleDetail.trim() ? body.roleDetail.trim() : null,
        body.consentStatus ?? null,
        typeof body.notesPrivate === 'string' && body.notesPrivate.trim() ? body.notesPrivate.trim() : null,
      ]
    );
    return NextResponse.json({ participant: shapeParticipant(result.rows[0]) });
  } catch (error) {
    console.error('[Studio Participants] POST error:', error);
    return NextResponse.json({ error: 'Failed to add participant' }, { status: 500 });
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
      return NextResponse.json({ error: 'Participant id is required' }, { status: 400 });
    }

    // ── Explicit promotion: save this participant as a permanent Contact ──────────────
    // The ONLY path that creates a practitioner_clients row from a participant, and only by
    // explicit practitioner action. Never creates a member; never crosses into a sovereign
    // space; never rewrites participant_role (the participation is a historical fact). If a
    // contact with the same email already exists, link to it and merge the relationship
    // (one person, many relationships) rather than duplicate.
    if (body.saveAsContact === true) {
      const requested = Array.isArray(body.relationships) ? body.relationships : ['trusted-contact'];
      const roles = Array.from(
        new Set(requested.map((r: unknown) => String(r).trim().toLowerCase()).filter((r: string) => VALID_RELATIONSHIPS.has(r)))
      ) as string[];
      const rolesToWrite = roles.length > 0 ? roles : ['trusted-contact'];

      const promoted = await db.transaction(async (client) => {
        const partRes = await client.query(
          `SELECT ${COLS} FROM encounter_participants WHERE id = $1 AND practitioner_id = $2 LIMIT 1`,
          [id, practitionerId]
        );
        if (partRes.rows.length === 0) return { notFound: true as const };
        const p = partRes.rows[0];

        if (p.person_id) {
          // Already linked to a Person — idempotent; return current linkage.
          const personRes = await client.query(
            `SELECT id, name, email, member_id, relationship_roles FROM practitioner_clients WHERE id = $1`,
            [p.person_id]
          );
          return { participant: p, person: personRes.rows[0], alreadySaved: true as const };
        }

        // Reuse an existing contact with the same email, else create one.
        let personId: string | null = null;
        if (p.email) {
          const existing = await client.query(
            `SELECT id FROM practitioner_clients WHERE practitioner_id = $1 AND email = $2 LIMIT 1`,
            [practitionerId, p.email]
          );
          if (existing.rows.length > 0) {
            personId = existing.rows[0].id;
            await client.query(
              `UPDATE practitioner_clients
                 SET relationship_roles = (SELECT ARRAY(SELECT DISTINCT unnest(relationship_roles || $2::text[]))),
                     phone = COALESCE(phone, $3),
                     internal_notes = COALESCE(internal_notes, $4),
                     updated_at = NOW()
               WHERE id = $1`,
              [personId, rolesToWrite, p.phone, p.notes_private]
            );
          }
        }
        if (!personId) {
          personId = randomUUID();
          await client.query(
            `INSERT INTO practitioner_clients
               (id, practitioner_id, name, email, phone, status, internal_notes, relationship_roles)
             VALUES ($1, $2, $3, $4, $5, 'active', $6, $7)`,
            [personId, practitionerId, p.display_name, p.email, p.phone, p.notes_private, rolesToWrite]
          );
        }

        // Link the participation to the saved Person. Do NOT touch participant_role.
        await client.query(
          `UPDATE encounter_participants SET person_id = $2, updated_at = NOW() WHERE id = $1`,
          [id, personId]
        );
        const personRes = await client.query(
          `SELECT id, name, email, member_id, relationship_roles FROM practitioner_clients WHERE id = $1`,
          [personId]
        );
        const refreshed = await client.query(`SELECT ${COLS} FROM encounter_participants WHERE id = $1`, [id]);
        return { participant: refreshed.rows[0], person: personRes.rows[0] };
      });

      if ('notFound' in promoted) {
        return NextResponse.json({ error: 'Participant not found' }, { status: 404 });
      }
      return NextResponse.json({
        participant: shapeParticipant(promoted.participant),
        person: {
          personId: promoted.person.id,
          name: promoted.person.name,
          email: promoted.person.email,
          isMember: promoted.person.member_id != null,
          relationships: promoted.person.relationship_roles || [],
        },
        saved: true,
      });
    }

    // ── Regular field update ──────────────────────────────────────────────────────────
    const updateFields: string[] = [];
    const params: (string | null)[] = [id, practitionerId];

    if (body.displayName !== undefined) {
      updateFields.push(`display_name = $${params.length + 1}`);
      params.push(typeof body.displayName === 'string' && body.displayName.trim() ? body.displayName.trim() : null);
    }
    if (body.email !== undefined) {
      updateFields.push(`email = $${params.length + 1}`);
      params.push(typeof body.email === 'string' && body.email.trim() ? body.email.trim().toLowerCase() : null);
    }
    if (body.phone !== undefined) {
      updateFields.push(`phone = $${params.length + 1}`);
      params.push(typeof body.phone === 'string' && body.phone.trim() ? body.phone.trim() : null);
    }
    if (body.roleDetail !== undefined) {
      updateFields.push(`role_detail = $${params.length + 1}`);
      params.push(typeof body.roleDetail === 'string' && body.roleDetail.trim() ? body.roleDetail.trim() : null);
    }
    if (body.consentStatus !== undefined) {
      if (body.consentStatus != null && !VALID_CONSENT_SET.has(String(body.consentStatus))) {
        return NextResponse.json(
          { error: `consentStatus must be one of: ${VALID_CONSENT.join(', ')}` },
          { status: 400 }
        );
      }
      updateFields.push(`consent_status = $${params.length + 1}`);
      params.push(body.consentStatus ?? null);
    }
    if (body.notesPrivate !== undefined) {
      updateFields.push(`notes_private = $${params.length + 1}`);
      params.push(typeof body.notesPrivate === 'string' && body.notesPrivate.trim() ? body.notesPrivate.trim() : null);
    }
    if (body.participantRole !== undefined) {
      if (!VALID_PARTICIPANT_ROLE_SET.has(String(body.participantRole))) {
        return NextResponse.json(
          { error: `participantRole must be one of: ${VALID_PARTICIPANT_ROLES.join(', ')}` },
          { status: 400 }
        );
      }
      updateFields.push(`participant_role = $${params.length + 1}`);
      params.push(body.participantRole);
    }

    if (updateFields.length === 0) {
      return NextResponse.json({ error: 'No updates provided' }, { status: 400 });
    }

    const result = await db.query(
      `UPDATE encounter_participants SET ${updateFields.join(', ')}
       WHERE id = $1 AND practitioner_id = $2
       RETURNING ${COLS}`,
      params
    );
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Participant not found' }, { status: 404 });
    }
    return NextResponse.json({ participant: shapeParticipant(result.rows[0]) });
  } catch (error) {
    console.error('[Studio Participants] PATCH error:', error);
    return NextResponse.json({ error: 'Failed to update participant' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const identity = await getCurrentPractitioner(request);
    if (!identity) {
      return NextResponse.json({ error: 'Unauthorized or not a practitioner' }, { status: 401 });
    }
    const { practitionerId } = identity;

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Participant id is required' }, { status: 400 });
    }

    // Hard delete: a participant removed from an encounter is simply gone. Any saved Contact
    // they were promoted into (practitioner_clients) is independent and untouched.
    const result = await db.query(
      `DELETE FROM encounter_participants WHERE id = $1 AND practitioner_id = $2 RETURNING id`,
      [id, practitionerId]
    );
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Participant not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Studio Participants] DELETE error:', error);
    return NextResponse.json({ error: 'Failed to remove participant' }, { status: 500 });
  }
}
