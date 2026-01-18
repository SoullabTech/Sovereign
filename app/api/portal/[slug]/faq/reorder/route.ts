/**
 * FAQ REORDER API
 *
 * Reorder FAQs within a category
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { query, transaction } from '@/lib/db/postgres';

export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const body = await request.json();
    const { practitionerId, category, order } = body;

    if (!practitionerId) {
      return NextResponse.json(
        { error: 'Practitioner ID is required' },
        { status: 400 }
      );
    }

    if (!category || !order || !Array.isArray(order)) {
      return NextResponse.json(
        { error: 'Category and order array are required' },
        { status: 400 }
      );
    }

    // Update display_order for each FAQ in the new order
    await transaction(async (client) => {
      for (let i = 0; i < order.length; i++) {
        const faqId = order[i];
        await client.query(
          `UPDATE practitioner_faqs
           SET display_order = $1, updated_at = NOW()
           WHERE id = $2 AND practitioner_id = $3 AND category = $4`,
          [i, faqId, practitionerId, category]
        );
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[FAQ Reorder] Error:', error);
    return NextResponse.json(
      { error: 'Failed to reorder FAQs' },
      { status: 500 }
    );
  }
}
