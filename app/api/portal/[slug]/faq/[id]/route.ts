/**
 * PRACTITIONER FAQ ITEM API
 *
 * Update and delete individual FAQs
 */

export const dynamic = 'force-static';
export async function generateStaticParams() { return []; }

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';

// GET - Get a single FAQ
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string; id: string } }
) {
  try {
    const { id } = params;

    const result = await query(
      `SELECT * FROM practitioner_faqs WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'FAQ not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ faq: result.rows[0] });
  } catch (error) {
    console.error('[FAQ API] GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch FAQ' },
      { status: 500 }
    );
  }
}

// PUT - Update a FAQ
export async function PUT(
  request: NextRequest,
  { params }: { params: { slug: string; id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { practitionerId, question, answer, category, is_published, display_order } = body;

    if (!practitionerId) {
      return NextResponse.json(
        { error: 'Practitioner ID is required' },
        { status: 400 }
      );
    }

    // Verify ownership
    const existingResult = await query(
      `SELECT * FROM practitioner_faqs WHERE id = $1`,
      [id]
    );

    if (existingResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'FAQ not found' },
        { status: 404 }
      );
    }

    const existing = existingResult.rows[0];
    if (existing.practitioner_id !== practitionerId) {
      return NextResponse.json(
        { error: 'Not authorized to update this FAQ' },
        { status: 403 }
      );
    }

    // Build update query dynamically
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (question !== undefined) {
      updates.push(`question = $${paramIndex++}`);
      values.push(question);
    }
    if (answer !== undefined) {
      updates.push(`answer = $${paramIndex++}`);
      values.push(answer);
    }
    if (category !== undefined) {
      updates.push(`category = $${paramIndex++}`);
      values.push(category);
    }
    if (is_published !== undefined) {
      updates.push(`is_published = $${paramIndex++}`);
      values.push(is_published);
    }
    if (display_order !== undefined) {
      updates.push(`display_order = $${paramIndex++}`);
      values.push(display_order);
    }

    updates.push(`updated_at = NOW()`);

    if (updates.length === 1) {
      // Only updated_at, nothing to change
      return NextResponse.json({ faq: existing });
    }

    values.push(id);

    const result = await query(
      `UPDATE practitioner_faqs
       SET ${updates.join(', ')}
       WHERE id = $${paramIndex}
       RETURNING *`,
      values
    );

    return NextResponse.json({ faq: result.rows[0] });
  } catch (error) {
    console.error('[FAQ API] PUT error:', error);
    return NextResponse.json(
      { error: 'Failed to update FAQ' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a FAQ
export async function DELETE(
  request: NextRequest,
  { params }: { params: { slug: string; id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { practitionerId } = body;

    if (!practitionerId) {
      return NextResponse.json(
        { error: 'Practitioner ID is required' },
        { status: 400 }
      );
    }

    // Verify ownership
    const existingResult = await query(
      `SELECT * FROM practitioner_faqs WHERE id = $1`,
      [id]
    );

    if (existingResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'FAQ not found' },
        { status: 404 }
      );
    }

    const existing = existingResult.rows[0];
    if (existing.practitioner_id !== practitionerId) {
      return NextResponse.json(
        { error: 'Not authorized to delete this FAQ' },
        { status: 403 }
      );
    }

    await query(
      `DELETE FROM practitioner_faqs WHERE id = $1`,
      [id]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[FAQ API] DELETE error:', error);
    return NextResponse.json(
      { error: 'Failed to delete FAQ' },
      { status: 500 }
    );
  }
}
