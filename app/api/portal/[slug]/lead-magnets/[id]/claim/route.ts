export const dynamic = 'force-static';
export async function generateStaticParams() { return []; }

/**
 * LEAD MAGNET CLAIM API
 *
 * Handles lead magnet opt-in and creates marketing contact
 */

import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db/postgres';
import crypto from 'crypto';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; id: string }> }
) {
  try {
    const { slug, id: magnetId } = await params;
    const body = await request.json();
    const { email, name } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Get practitioner ID
    const practitionerResult = await db.query(
      `SELECT id FROM practitioners WHERE slug = $1 AND status = 'active'`,
      [slug]
    );

    if (practitionerResult.rows.length === 0) {
      return NextResponse.json({ error: 'Portal not found' }, { status: 404 });
    }

    const practitionerId = practitionerResult.rows[0].id;

    // Get lead magnet
    const magnetResult = await db.query(
      `SELECT id, name, delivery_type, download_url, thank_you_message
       FROM lead_magnets
       WHERE id = $1 AND practitioner_id = $2 AND is_active = true`,
      [magnetId, practitionerId]
    );

    if (magnetResult.rows.length === 0) {
      return NextResponse.json({ error: 'Lead magnet not found' }, { status: 404 });
    }

    const magnet = magnetResult.rows[0];

    // Check if contact already exists
    const existingContact = await db.query(
      `SELECT id FROM marketing_contacts WHERE practitioner_id = $1 AND email = $2`,
      [practitionerId, email]
    );

    let contactId: string;

    if (existingContact.rows.length > 0) {
      contactId = existingContact.rows[0].id;
      // Update existing contact
      await db.query(
        `UPDATE marketing_contacts
         SET name = COALESCE($1, name),
             lead_score = lead_score + 10,
             updated_at = NOW()
         WHERE id = $2`,
        [name, contactId]
      );
    } else {
      // Create new marketing contact
      contactId = crypto.randomUUID();
      await db.query(
        `INSERT INTO marketing_contacts
         (id, practitioner_id, email, name, status, source, source_detail, lead_score, created_at)
         VALUES ($1, $2, $3, $4, 'lead', 'lead_magnet', $5, 20, NOW())`,
        [contactId, practitionerId, email, name || '', magnet.name]
      );
    }

    // Record the lead magnet claim
    await db.query(
      `INSERT INTO lead_magnet_claims
       (id, lead_magnet_id, contact_id, claimed_at)
       VALUES ($1, $2, $3, NOW())
       ON CONFLICT (lead_magnet_id, contact_id) DO UPDATE SET claimed_at = NOW()`,
      [crypto.randomUUID(), magnetId, contactId]
    );

    // Update lead magnet stats
    await db.query(
      `UPDATE lead_magnets SET downloads = downloads + 1 WHERE id = $1`,
      [magnetId]
    );

    // TODO: Send email with download link or access instructions
    // This would integrate with email service (Resend, etc.)

    return NextResponse.json({
      success: true,
      message: magnet.thank_you_message || 'Check your email for access!',
      delivery_type: magnet.delivery_type,
    });
  } catch (error) {
    console.error('Lead magnet claim error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
