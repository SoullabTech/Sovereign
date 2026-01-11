import { NextRequest, NextResponse } from 'next/server';
import {
  performReading,
  threeCardReading,
  celticCrossReading,
  getSpread,
  TarotReading
} from '@/lib/divination';

/**
 * Tarot Oracle API
 * POST /api/oracle/tarot
 *
 * Accepts a query and spread type, returns a complete reading
 */

interface TarotRequest {
  query: string;
  spreadType?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: TarotRequest = await request.json();
    const { query, spreadType = 'three-card' } = body;

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      );
    }

    let tarotReading: TarotReading;

    // Use specialized reading functions for common spreads
    switch (spreadType) {
      case 'single':
      case 'daily':
        tarotReading = performReading(query, 'single');
        break;
      case 'three-card':
      case 'past-present-future':
        tarotReading = threeCardReading(query);
        break;
      case 'celtic-cross':
        tarotReading = celticCrossReading(query);
        break;
      default:
        // Try to find the spread by name
        const spread = getSpread(spreadType);
        if (spread) {
          tarotReading = performReading(query, spread.name);
        } else {
          // Default to three-card
          tarotReading = threeCardReading(query);
        }
    }

    // Format the reading for the frontend
    const reading = {
      query: tarotReading.query,
      spread: {
        name: tarotReading.spread.name,
        description: tarotReading.spread.description,
        cardCount: tarotReading.spread.cardCount
      },
      drawnCards: tarotReading.drawnCards.map(dc => ({
        card: {
          id: dc.card.id,
          name: dc.card.name,
          arcana: dc.card.arcana,
          suit: dc.card.suit,
          number: dc.card.number,
          element: dc.card.element,
          keywords: dc.card.keywords,
          uprightMeaning: dc.card.uprightMeaning,
          reversedMeaning: dc.card.reversedMeaning,
          soulGuidance: dc.card.soulGuidance,
          symbolism: dc.card.symbolism,
          astrological: dc.card.astrological
        },
        position: {
          name: dc.position.name,
          description: dc.position.description
        },
        isReversed: dc.isReversed,
        interpretation: dc.interpretation
      })),
      insight: tarotReading.insight,
      soulGuidance: tarotReading.soulGuidance,
      ritual: tarotReading.ritual ? {
        name: tarotReading.ritual.name,
        duration: tarotReading.ritual.duration,
        materials: tarotReading.ritual.materials,
        steps: tarotReading.ritual.steps,
        intention: tarotReading.ritual.intention
      } : undefined
    };

    return NextResponse.json({ reading });
  } catch (error) {
    console.error('Tarot oracle error:', error);
    return NextResponse.json(
      { error: 'Failed to generate reading' },
      { status: 500 }
    );
  }
}
