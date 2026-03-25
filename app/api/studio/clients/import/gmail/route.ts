export const dynamic = 'force-dynamic';
export async function generateStaticParams() { return []; }

/**
 * GMAIL CONTACTS IMPORT API
 *
 * GET: Fetch contacts from user's Google account for import preview
 * POST: Import selected contacts as practitioner clients
 */

import { NextRequest, NextResponse } from 'next/server';
import { GoogleContactsService, GoogleContact } from '@/lib/contacts/GoogleContactsService';
import { GoogleCalendarService } from '@/lib/calendar/GoogleCalendarService';
import { getCurrentPractitioner } from '@/lib/auth/getCurrentPractitioner';
import db from '@/lib/db/postgres';
import crypto from 'crypto';

/**
 * GET - Fetch Google contacts for import preview
 *
 * Auth: requires authenticated practitioner session.
 * Uses the practitioner's member_id to look up Google credentials —
 * never accepts userId from query params (that was a data-leak vector).
 */
export async function GET(request: NextRequest) {
  try {
    const identity = await getCurrentPractitioner(request);
    if (!identity) {
      return NextResponse.json({ error: 'Unauthorized or not a practitioner' }, { status: 401 });
    }

    const { memberId, practitionerId } = identity;

    // Check if this practitioner's member has Google connected
    const isConnected = await GoogleCalendarService.isConnected(memberId);
    if (!isConnected) {
      return NextResponse.json({
        error: 'Google not connected',
        needsAuth: true,
      }, { status: 401 });
    }

    // Fetch contacts scoped to this member's Google credentials
    const contacts = await GoogleContactsService.fetchAllContacts(memberId, 200);

    // Get existing client emails for THIS practitioner to mark duplicates
    const existingResult = await db.query(
      `SELECT email FROM practitioner_clients
       WHERE practitioner_id = $1 AND email IS NOT NULL`,
      [practitionerId]
    );
    const existingEmails = new Set(existingResult.rows.map(r => r.email.toLowerCase()));

    // Mark which contacts already exist
    const contactsWithStatus = contacts.map(c => ({
      ...c,
      alreadyExists: c.email ? existingEmails.has(c.email.toLowerCase()) : false,
    }));

    return NextResponse.json({
      contacts: contactsWithStatus,
      total: contacts.length,
      existingCount: contactsWithStatus.filter(c => c.alreadyExists).length,
    });

  } catch (error) {
    console.error('[Gmail Import] Error fetching contacts:', error);

    if (error instanceof Error && error.message.includes('reconnect')) {
      return NextResponse.json({
        error: error.message,
        needsAuth: true,
      }, { status: 401 });
    }

    return NextResponse.json(
      { error: 'Failed to fetch contacts' },
      { status: 500 }
    );
  }
}

/**
 * POST - Import selected contacts as clients
 */
export async function POST(request: NextRequest) {
  try {
    const identity = await getCurrentPractitioner(request);
    if (!identity) {
      return NextResponse.json({ error: 'Unauthorized or not a practitioner' }, { status: 401 });
    }

    const { practitionerId } = identity;

    const body = await request.json();
    const { contacts } = body as {
      contacts: GoogleContact[];
    };

    if (!contacts || !Array.isArray(contacts) || contacts.length === 0) {
      return NextResponse.json({ error: 'No contacts to import' }, { status: 400 });
    }

    // Get existing emails to skip duplicates
    const existingResult = await db.query(
      `SELECT email FROM practitioner_clients
       WHERE practitioner_id = $1 AND email IS NOT NULL`,
      [practitionerId]
    );
    const existingEmails = new Set(existingResult.rows.map(r => r.email.toLowerCase()));

    // Import each contact
    let imported = 0;
    let skipped = 0;
    const errors: string[] = [];
    const createdIds: string[] = [];

    for (const contact of contacts) {
      try {
        // Skip if no email or already exists
        if (!contact.email) {
          skipped++;
          continue;
        }

        if (existingEmails.has(contact.email.toLowerCase())) {
          skipped++;
          continue;
        }

        // Insert client
        const clientId = crypto.randomUUID();
        await db.query(
          `INSERT INTO practitioner_clients (
            id, practitioner_id, name, email, phone, created_at
          ) VALUES ($1, $2, $3, $4, $5, NOW())`,
          [
            clientId,
            practitionerId,
            contact.name || contact.firstName || 'Unknown',
            contact.email,
            contact.phone || null,
          ]
        );

        existingEmails.add(contact.email.toLowerCase());
        createdIds.push(clientId);
        imported++;
      } catch (err) {
        console.error('[Gmail Import] Error importing contact:', err);
        errors.push(contact.email || 'unknown');
      }
    }

    return NextResponse.json({
      success: true,
      imported,
      skipped,
      createdIds,
      errors: errors.length > 0 ? errors : undefined,
    });

  } catch (error) {
    console.error('[Gmail Import] Error:', error);
    return NextResponse.json(
      { error: 'Failed to import contacts' },
      { status: 500 }
    );
  }
}
