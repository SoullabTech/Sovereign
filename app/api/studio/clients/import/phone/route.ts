export const dynamic = 'force-dynamic';
export async function generateStaticParams() { return []; }

/**
 * PHONE CONTACTS IMPORT API
 *
 * POST: Import phone contacts (fetched client-side) as practitioner clients
 */

import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db/postgres';
import crypto from 'crypto';

interface PhoneContact {
  id: string;
  name: string | null;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  phone: string | null;
}

/**
 * POST - Import phone contacts as clients
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { contacts } = body as { contacts: PhoneContact[] };

    if (!contacts || !Array.isArray(contacts) || contacts.length === 0) {
      return NextResponse.json({ error: 'No contacts to import' }, { status: 400 });
    }

    // Get practitioner ID (hardcoded for now)
    const practitionerSlug = 'stellium';
    const practResult = await db.query(
      'SELECT id FROM practitioners WHERE slug = $1',
      [practitionerSlug]
    );

    if (practResult.rows.length === 0) {
      return NextResponse.json({ error: 'Practitioner not found' }, { status: 404 });
    }

    const practitionerId = practResult.rows[0].id;

    // Get existing emails and phones to skip duplicates
    const existingResult = await db.query(
      `SELECT email, phone FROM practitioner_clients
       WHERE practitioner_id = $1 AND (email IS NOT NULL OR phone IS NOT NULL)`,
      [practitionerId]
    );

    const existingEmails = new Set(
      existingResult.rows
        .filter(r => r.email)
        .map(r => r.email.toLowerCase())
    );

    const existingPhones = new Set(
      existingResult.rows
        .filter(r => r.phone)
        .map(r => normalizePhone(r.phone))
    );

    // Import each contact
    let imported = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (const contact of contacts) {
      try {
        // Skip if no name
        if (!contact.name) {
          skipped++;
          continue;
        }

        // Check for duplicates by email or phone
        const emailExists = contact.email && existingEmails.has(contact.email.toLowerCase());
        const phoneExists = contact.phone && existingPhones.has(normalizePhone(contact.phone));

        if (emailExists || phoneExists) {
          skipped++;
          continue;
        }

        // Must have either email or phone
        if (!contact.email && !contact.phone) {
          skipped++;
          continue;
        }

        // Insert client
        await db.query(
          `INSERT INTO practitioner_clients (
            id, practitioner_id, name, email, phone, created_at
          ) VALUES ($1, $2, $3, $4, $5, NOW())`,
          [
            crypto.randomUUID(),
            practitionerId,
            contact.name,
            contact.email || null,
            contact.phone || null,
          ]
        );

        // Track for deduplication
        if (contact.email) existingEmails.add(contact.email.toLowerCase());
        if (contact.phone) existingPhones.add(normalizePhone(contact.phone));

        imported++;
      } catch (err) {
        console.error('[Phone Import] Error importing contact:', err);
        errors.push(contact.name || 'unknown');
      }
    }

    return NextResponse.json({
      success: true,
      imported,
      skipped,
      errors: errors.length > 0 ? errors : undefined,
    });

  } catch (error) {
    console.error('[Phone Import] Error:', error);
    return NextResponse.json(
      { error: 'Failed to import contacts' },
      { status: 500 }
    );
  }
}

/**
 * Normalize phone number for comparison
 */
function normalizePhone(phone: string): string {
  // Strip non-digits
  return phone.replace(/\D/g, '');
}
