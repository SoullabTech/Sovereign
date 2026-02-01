/**
 * Tarot Oracle API
 *
 * POST /api/oracle/tarot
 * Draws cards for a spread and returns reading
 */

import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { query, spreadType = 'three-card', lifeArea, lens } = body;

    // Lazy import to avoid build issues
    const { drawSpread, getSpread, TAROT_DECK } = await import('@/lib/oracle/data/tarot');

    const spread = getSpread(spreadType);
    if (!spread) {
      return NextResponse.json(
        { ok: false, error: `Unknown spread type: ${spreadType}` },
        { status: 400 }
      );
    }

    // Draw cards for the spread
    const drawnCards = drawSpread(spreadType, true);

    // Build reading response
    const cards = drawnCards.map((card, index) => {
      const positionContext = spread.positions[index];
      const orientation = card.reversed ? 'reversed' : 'upright';

      // Generate position-aware interpretation
      const positionMeaning = generatePositionMeaning(card, positionContext, lens);

      return {
        id: card.id,
        name: card.name,
        arcana: card.arcana,
        suit: card.suit,
        number: card.number,
        orientation,
        position: positionContext.name,
        positionMeaning: positionContext.meaning,
        keywords: card.keywords,
        meaning: positionMeaning,
        baseMeaning: card.reversed ? card.reversed : card.upright,
        element: card.element,
        archetype: card.archetype,
        shadowAspect: card.shadowAspect
      };
    });

    // Generate synthesis
    const synthesis = generateSynthesis(cards, query, lifeArea, lens);

    const reading = {
      spreadType,
      spreadName: spread.name,
      query: query || null,
      lifeArea: lifeArea || null,
      lens: lens || null,
      cards,
      synthesis,
      timestamp: new Date().toISOString()
    };

    return NextResponse.json({ ok: true, reading });
  } catch (error) {
    console.error('[Tarot API] Error:', error);
    return NextResponse.json(
      { ok: false, error: 'Failed to generate reading' },
      { status: 500 }
    );
  }
}

function generatePositionMeaning(
  card: { name: string; upright: string; reversed: string; keywords: string[]; archetype?: string } & { reversed: boolean },
  position: { name: string; meaning: string },
  lens?: string
): string {
  const baseMeaning = card.reversed ? card.reversed : card.upright;

  // Add position context
  let interpretation = `In the position of "${position.name}" (${position.meaning}): ${baseMeaning}`;

  // Add lens-specific perspective
  if (lens === 'shadow') {
    interpretation += card.archetype
      ? ` Consider the shadow aspect: what is this card hiding or protecting?`
      : ` What uncomfortable truth might this card be pointing to?`;
  } else if (lens === 'relationship') {
    interpretation += ` How does this energy show up in your connections with others?`;
  } else if (lens === 'practical') {
    interpretation += ` What concrete action does this suggest?`;
  }

  return interpretation;
}

function generateSynthesis(
  cards: Array<{ name: string; position: string; orientation: string; keywords: string[] }>,
  query?: string,
  lifeArea?: string,
  lens?: string
): string {
  const cardNames = cards.map(c => `${c.name} (${c.orientation})`).join(', ');
  const dominantKeywords = cards.flatMap(c => c.keywords).slice(0, 5);

  let synthesis = `Your reading presents: ${cardNames}. `;
  synthesis += `Dominant themes: ${dominantKeywords.join(', ')}. `;

  if (query) {
    synthesis += `In response to your question about ${lifeArea || 'life'}: `;
  }

  // Add narrative based on card count
  if (cards.length === 1) {
    synthesis += `This single card speaks directly to the heart of your inquiry. Let its image settle before reaching for meaning.`;
  } else if (cards.length === 3) {
    synthesis += `The three cards trace a movement from ${cards[0].position.toLowerCase()} through ${cards[1].position.toLowerCase()} toward ${cards[2].position.toLowerCase()}. Notice what shifts.`;
  } else if (cards.length >= 10) {
    synthesis += `This full spread maps the territory of your question. Begin with the center, then let your eye travel outward. What calls to you?`;
  }

  if (lens === 'shadow') {
    synthesis += ` The shadow lens asks: what are you not seeing? What does the reading protect you from knowing?`;
  }

  return synthesis;
}
