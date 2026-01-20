export const dynamic = 'force-dynamic';

/**
 * Single Contribution API
 *
 * GET - Get contribution by ID
 * PUT - Update contribution (draft or needs_revision only)
 * DELETE - Delete contribution (draft only)
 *
 * See /docs/COMMONS_CONTRIBUTION_SYSTEM.md for context.
 */

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';

async function safeQuery(sql: string, params: unknown[] = []): Promise<{ rows: Record<string, unknown>[]; error?: string }> {
  try {
    const result = await query(sql, params);
    return { rows: result.rows };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    if (message.includes('does not exist') || message.includes('column')) {
      console.warn(`[CONTRIBUTIONS] Query skipped (missing table/column): ${message}`);
      return { rows: [], error: message };
    }
    throw error;
  }
}

// GET - Get contribution by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const result = await safeQuery(
      `SELECT
        cc.id, cc.type, cc.status, cc.title, cc.content, cc.tags,
        cc.attribution, cc.safety_notes, cc.when_helpful, cc.when_not,
        cc.created_at, cc.submitted_at, cc.published_at,
        cc.review_notes, cc.usage_count, cc.save_count,
        m.id as author_id, m.name as author_name, m.preferred_name as author_preferred_name
      FROM commons_contributions cc
      JOIN members m ON cc.created_by = m.id
      WHERE cc.id = $1`,
      [id]
    );

    if (result.error) {
      return NextResponse.json(
        { error: 'Contributions system not yet initialized' },
        { status: 503 }
      );
    }

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Contribution not found' },
        { status: 404 }
      );
    }

    const row = result.rows[0];

    return NextResponse.json({
      contribution: {
        id: row.id,
        type: row.type,
        status: row.status,
        title: row.title,
        content: row.content,
        tags: row.tags,
        attribution: row.attribution,
        safetyNotes: row.safety_notes,
        whenHelpful: row.when_helpful,
        whenNot: row.when_not,
        createdAt: row.created_at,
        submittedAt: row.submitted_at,
        publishedAt: row.published_at,
        reviewNotes: row.review_notes,
        usageCount: row.usage_count,
        saveCount: row.save_count,
        author: {
          id: row.author_id,
          name: row.author_preferred_name || row.author_name,
        },
      },
    });

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[CONTRIBUTIONS] GET error: ${message}`);
    return NextResponse.json(
      { error: 'Failed to fetch contribution' },
      { status: 500 }
    );
  }
}

// PUT - Update contribution
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const {
      memberId,
      status, // optional: 'submitted' to resubmit
      title,
      content,
      tags,
      attribution,
      whenHelpful,
      whenNot,
    } = body;

    if (!memberId) {
      return NextResponse.json(
        { error: 'Missing memberId' },
        { status: 400 }
      );
    }

    // Check existing contribution
    const existing = await safeQuery(
      `SELECT id, status, created_by FROM commons_contributions WHERE id = $1`,
      [id]
    );

    if (existing.error || existing.rows.length === 0) {
      return NextResponse.json(
        { error: 'Contribution not found' },
        { status: 404 }
      );
    }

    const contribution = existing.rows[0];

    // Check ownership
    if (contribution.created_by !== memberId) {
      return NextResponse.json(
        { error: 'You can only edit your own contributions' },
        { status: 403 }
      );
    }

    // Check if editable
    if (!['draft', 'needs_revision'].includes(contribution.status as string)) {
      return NextResponse.json(
        { error: 'Only draft and needs_revision contributions can be edited' },
        { status: 400 }
      );
    }

    // Build update query
    const updates: string[] = [];
    const updateParams: unknown[] = [];
    let paramIndex = 1;

    if (title !== undefined) {
      updates.push(`title = $${paramIndex++}`);
      updateParams.push(title);
    }
    if (content !== undefined) {
      updates.push(`content = $${paramIndex++}`);
      updateParams.push(content);
    }
    if (tags !== undefined) {
      updates.push(`tags = $${paramIndex++}`);
      updateParams.push(JSON.stringify(tags));
    }
    if (attribution !== undefined) {
      updates.push(`attribution = $${paramIndex++}`);
      updateParams.push(attribution || null);
    }
    if (whenHelpful !== undefined) {
      updates.push(`when_helpful = $${paramIndex++}`);
      updateParams.push(whenHelpful || null);
    }
    if (whenNot !== undefined) {
      updates.push(`when_not = $${paramIndex++}`);
      updateParams.push(whenNot || null);
    }

    // Handle resubmission
    if (status === 'submitted') {
      updates.push(`status = $${paramIndex++}`);
      updateParams.push('submitted');
      updates.push(`submitted_at = NOW()`);
      updates.push(`review_notes = NULL`);
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      );
    }

    updateParams.push(id);
    const result = await safeQuery(
      `UPDATE commons_contributions
       SET ${updates.join(', ')}, updated_at = NOW()
       WHERE id = $${paramIndex}
       RETURNING id, type, status, title, updated_at, submitted_at`,
      updateParams
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Update failed' },
        { status: 500 }
      );
    }

    const updated = result.rows[0];
    console.log(`[CONTRIBUTIONS] Updated: ${updated.id} (status: ${updated.status})`);

    return NextResponse.json({
      success: true,
      contribution: {
        id: updated.id,
        type: updated.type,
        status: updated.status,
        title: updated.title,
        updatedAt: updated.updated_at,
        submittedAt: updated.submitted_at,
      },
    });

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[CONTRIBUTIONS] PUT error: ${message}`);
    return NextResponse.json(
      { error: 'Failed to update contribution' },
      { status: 500 }
    );
  }
}

// DELETE - Delete contribution (draft only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const memberId = searchParams.get('memberId');

    if (!memberId) {
      return NextResponse.json(
        { error: 'Missing memberId' },
        { status: 400 }
      );
    }

    // Check existing contribution
    const existing = await safeQuery(
      `SELECT id, status, created_by FROM commons_contributions WHERE id = $1`,
      [id]
    );

    if (existing.error || existing.rows.length === 0) {
      return NextResponse.json(
        { error: 'Contribution not found' },
        { status: 404 }
      );
    }

    const contribution = existing.rows[0];

    // Check ownership
    if (contribution.created_by !== memberId) {
      return NextResponse.json(
        { error: 'You can only delete your own contributions' },
        { status: 403 }
      );
    }

    // Only drafts can be deleted
    if (contribution.status !== 'draft') {
      return NextResponse.json(
        { error: 'Only draft contributions can be deleted' },
        { status: 400 }
      );
    }

    await safeQuery('DELETE FROM commons_contributions WHERE id = $1', [id]);
    console.log(`[CONTRIBUTIONS] Deleted: ${id}`);

    return NextResponse.json({ success: true });

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[CONTRIBUTIONS] DELETE error: ${message}`);
    return NextResponse.json(
      { error: 'Failed to delete contribution' },
      { status: 500 }
    );
  }
}
