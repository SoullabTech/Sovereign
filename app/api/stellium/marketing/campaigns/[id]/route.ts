export const dynamic = 'force-dynamic';
export async function generateStaticParams() { return []; }

/**
 * SINGLE CAMPAIGN API
 *
 * Individual campaign operations
 */

import { NextRequest, NextResponse } from 'next/server';
import { updateCampaignStatus, type CampaignStatus } from '@/lib/stellium/marketing';
import { query, queryOne } from '@/lib/db/postgres';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Static export: return stub response during pre-rendering
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ stub: true });
  }
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const includeStats = searchParams.get('includeStats') === 'true';

    const campaign = await queryOne(
      'SELECT * FROM marketing_campaigns WHERE id = $1',
      [id]
    );

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      );
    }

    let stats: Record<string, unknown> | null = null;
    if (includeStats) {
      stats = await queryOne<Record<string, unknown>>(
        `SELECT
          COUNT(*) as total_sends,
          COUNT(*) FILTER (WHERE status = 'delivered') as delivered,
          COUNT(*) FILTER (WHERE opened_at IS NOT NULL) as opened,
          COUNT(*) FILTER (WHERE clicked_at IS NOT NULL) as clicked,
          COUNT(*) FILTER (WHERE unsubscribed_at IS NOT NULL) as unsubscribed
         FROM campaign_sends WHERE campaign_id = $1`,
        [id]
      );
    }

    return NextResponse.json({ campaign, stats });
  } catch (error) {
    console.error('Failed to get campaign:', error);
    return NextResponse.json(
      { error: 'Failed to get campaign' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { action, status, ...data } = body;

    if (action === 'update_status' && status) {
      const campaign = await updateCampaignStatus(id, status as CampaignStatus);
      return NextResponse.json({ campaign });
    }

    // General update
    const updates: string[] = [];
    const params_: unknown[] = [];
    let paramIndex = 1;

    const allowedFields = [
      'name', 'description', 'target_segment', 'sequence_emails',
      'send_at', 'template_id', 'trigger_type', 'trigger_config', 'transit_config'
    ];

    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        updates.push(`${field} = $${paramIndex++}`);
        const value = data[field];
        params_.push(
          typeof value === 'object' && !Array.isArray(value)
            ? JSON.stringify(value)
            : value
        );
      }
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      );
    }

    updates.push('updated_at = NOW()');
    params_.push(id);

    const campaign = await queryOne(
      `UPDATE marketing_campaigns SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      params_
    );

    return NextResponse.json({ campaign });
  } catch (error) {
    console.error('Failed to update campaign:', error);
    return NextResponse.json(
      { error: 'Failed to update campaign' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await query('DELETE FROM marketing_campaigns WHERE id = $1', [id]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete campaign:', error);
    return NextResponse.json(
      { error: 'Failed to delete campaign' },
      { status: 500 }
    );
  }
}
