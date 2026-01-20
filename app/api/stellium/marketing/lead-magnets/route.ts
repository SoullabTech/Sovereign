export const dynamic = 'force-dynamic';

/**
 * LEAD MAGNETS API
 *
 * Free offerings to capture leads
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getLeadMagnets,
  createLeadMagnet,
  recordLeadMagnetSubmission,
} from '@/lib/stellium/marketing';
import { queryOne, query } from '@/lib/db/postgres';

export async function GET(request: NextRequest) {
  // Static export: return stub response during pre-rendering
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ stub: true });
  }
  try {
    const { searchParams } = new URL(request.url);
    const practitionerId = searchParams.get('practitionerId');

    if (!practitionerId) {
      return NextResponse.json(
        { error: 'practitionerId is required' },
        { status: 400 }
      );
    }

    const status = searchParams.get('status') || undefined;
    const leadMagnets = await getLeadMagnets(practitionerId, status);

    return NextResponse.json({ leadMagnets });
  } catch (error) {
    console.error('Failed to get lead magnets:', error);
    return NextResponse.json(
      { error: 'Failed to get lead magnets' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, practitionerId, ...data } = body;

    // Handle form submission
    if (action === 'submit') {
      const { leadMagnetId, email, formData, ...trackingData } = data;

      if (!leadMagnetId || !email) {
        return NextResponse.json(
          { error: 'leadMagnetId and email are required' },
          { status: 400 }
        );
      }

      // Get lead magnet to find practitioner and auto-tags
      const leadMagnet = await queryOne<{
        id: string;
        practitioner_id: string;
        auto_tag: string[];
        follow_up_campaign_id: string | null;
      }>(
        'SELECT id, practitioner_id, auto_tag, follow_up_campaign_id FROM lead_magnets WHERE id = $1',
        [leadMagnetId]
      );

      if (!leadMagnet) {
        return NextResponse.json(
          { error: 'Lead magnet not found' },
          { status: 404 }
        );
      }

      // Record submission
      const submissionId = await recordLeadMagnetSubmission(leadMagnetId, {
        email,
        form_data: formData || {},
        ...trackingData,
      });

      // Create or update contact
      const existingContact = await queryOne<{ id: string }>(
        'SELECT id FROM marketing_contacts WHERE practitioner_id = $1 AND email = $2',
        [leadMagnet.practitioner_id, email]
      );

      let contactId: string;

      if (existingContact) {
        // Update existing contact with new tags
        await query(
          `UPDATE marketing_contacts
           SET tags = array_cat(tags, $1::text[]), updated_at = NOW()
           WHERE id = $2`,
          [leadMagnet.auto_tag || [], existingContact.id]
        );
        contactId = existingContact.id;
      } else {
        // Create new contact
        const newContact = await queryOne<{ id: string }>(
          `INSERT INTO marketing_contacts (
            practitioner_id, email, first_name, source, source_detail,
            tags, email_consent, consent_timestamp, consent_source,
            utm_source, utm_medium, utm_campaign
          ) VALUES ($1, $2, $3, 'lead_magnet', $4, $5, true, NOW(), $6, $7, $8, $9)
          RETURNING id`,
          [
            leadMagnet.practitioner_id,
            email,
            formData?.first_name || null,
            leadMagnetId,
            leadMagnet.auto_tag || [],
            `Lead Magnet: ${leadMagnetId}`,
            trackingData.utm_source,
            trackingData.utm_medium,
            trackingData.utm_campaign,
          ]
        );
        contactId = newContact?.id || '';
      }

      // Update submission with contact ID
      await query(
        'UPDATE lead_magnet_submissions SET contact_id = $1 WHERE id = $2',
        [contactId, submissionId]
      );

      // TODO: Trigger follow-up campaign if configured

      return NextResponse.json({
        success: true,
        contactId,
        submissionId,
      });
    }

    // Create new lead magnet
    if (!practitionerId || !data.name) {
      return NextResponse.json(
        { error: 'practitionerId and name are required' },
        { status: 400 }
      );
    }

    const leadMagnet = await createLeadMagnet(practitionerId, data);

    return NextResponse.json({ leadMagnet }, { status: 201 });
  } catch (error) {
    console.error('Failed to process lead magnet request:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
