export const dynamic = 'force-static';
export async function generateStaticParams() { return [{ cardId: 'default' }]; }

import { NextRequest, NextResponse } from 'next/server';
import { getCardById, getRelatedCards } from '@/lib/askMaia/cardService';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ cardId: string }> }
) {
  try {
    const { cardId } = await params;

    if (!cardId) {
      return NextResponse.json(
        { error: 'Card ID is required' },
        { status: 400 }
      );
    }

    // Get the card
    const card = await getCardById(cardId);

    if (!card) {
      return NextResponse.json(
        { error: 'Card not found' },
        { status: 404 }
      );
    }

    // Get related cards based on tags and type
    const relatedCards = await getRelatedCards(card, 4);

    return NextResponse.json({
      success: true,
      card,
      relatedCards,
    });
  } catch (error: any) {
    console.error('Ask MAIA card GET error:', error);
    return NextResponse.json(
      {
        error: error.message || 'Failed to fetch card',
      },
      { status: 500 }
    );
  }
}
