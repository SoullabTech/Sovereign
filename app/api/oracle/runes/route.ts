import { NextRequest, NextResponse } from 'next/server';
import {
  castRunes,
  dailyRuneDraw,
  nornsReading,
  getRuneSpread,
  RuneReading
} from '@/lib/divination';

/**
 * Runes Oracle API
 * POST /api/oracle/runes
 *
 * Accepts a query and spread type, returns a complete reading
 */

interface RunesRequest {
  query: string;
  spreadType?: string;
  runeCount?: number;
}

export async function POST(request: NextRequest) {
  try {
    const body: RunesRequest = await request.json();
    const { query, spreadType = 'single', runeCount } = body;

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      );
    }

    let runeReading: RuneReading;

    // Use specialized reading functions for common spreads
    switch (spreadType) {
      case 'single':
        runeReading = dailyRuneDraw(query);
        break;
      case 'norns':
      case 'three-norns':
        runeReading = nornsReading(query);
        break;
      case 'elements':
      case 'elemental-cross':
        const elementsSpread = getRuneSpread('Elemental Cross');
        if (elementsSpread) {
          runeReading = castRunes(query, elementsSpread.name);
        } else {
          runeReading = dailyRuneDraw(query);
        }
        break;
      case 'week':
      case 'week-ahead':
        const weekSpread = getRuneSpread('Week Ahead');
        if (weekSpread) {
          runeReading = castRunes(query, weekSpread.name);
        } else {
          runeReading = dailyRuneDraw(query);
        }
        break;
      default:
        // Try to find the spread by name
        const spread = getRuneSpread(spreadType);
        if (spread) {
          runeReading = castRunes(query, spread.name);
        } else {
          // Default to single rune
          runeReading = dailyRuneDraw(query);
        }
    }

    // Generate a wyrd message based on the reading
    const wyrdMessage = generateWyrdMessage(runeReading);

    // Format the reading for the frontend
    const reading = {
      query: runeReading.query,
      spread: runeReading.spread.name,
      drawnRunes: runeReading.drawnRunes.map(dr => ({
        name: dr.rune.name,
        symbol: dr.rune.symbol,
        meaning: dr.rune.meaning,
        aett: dr.rune.aett,
        element: dr.rune.element,
        isReversed: dr.isReversed,
        position: dr.position.name,
        interpretation: dr.interpretation,
        keywords: dr.rune.keywords,
        magicalUse: dr.rune.magicalUse
      })),
      insight: runeReading.insight,
      soulGuidance: runeReading.soulGuidance,
      wyrdMessage,
      ritual: runeReading.ritual ? runeReading.ritual.steps.join(' ') : generateRitualSuggestion(runeReading)
    };

    return NextResponse.json({ reading });
  } catch (error) {
    console.error('Runes oracle error:', error);
    return NextResponse.json(
      { error: 'Failed to generate reading' },
      { status: 500 }
    );
  }
}

/**
 * Generate a mystical "wyrd" message based on the reading
 */
function generateWyrdMessage(reading: RuneReading): string {
  const runes = reading.drawnRunes;
  const reversedCount = runes.filter(r => r.isReversed).length;
  const elements = runes.map(r => r.rune.element);

  // Determine dominant element
  const elementCounts: Record<string, number> = {};
  elements.forEach(e => {
    elementCounts[e] = (elementCounts[e] || 0) + 1;
  });
  const dominantElement = Object.entries(elementCounts)
    .sort((a, b) => b[1] - a[1])[0]?.[0] || 'aether';

  const wyrdMessages: Record<string, string[]> = {
    fire: [
      'The fires of transformation burn within this reading. Act with courage, but temper passion with wisdom.',
      'Ancestral flames illuminate your path. The gods favor bold action aligned with your true purpose.',
      'Creative fire stirs in your orlog. This is a time to forge new beginnings from the heat of will.'
    ],
    water: [
      'The waters of wyrd run deep here. Trust your intuition as you navigate these emotional currents.',
      'Like the well of Urd, your reading reflects hidden depths. Seek wisdom in stillness and reflection.',
      'The tides of fate are shifting. Flow with change rather than resisting its pull.'
    ],
    earth: [
      'The earth runes speak of foundation and patience. Build slowly, but build to last.',
      'Grounded energies pervade this reading. Practical wisdom and steady progress are favored.',
      'The ancestors call you to honor tradition while creating new legacy. Root yourself in what endures.'
    ],
    air: [
      'The winds of change carry these runes to you. Communication and clarity of thought are essential now.',
      'Swift movement and intellectual power mark this reading. Trust your mind, but verify through action.',
      'The breath of Odin touches this casting. New perspectives and unexpected insights await.'
    ],
    aether: [
      'The runes speak from beyond the veil. Spiritual matters take precedence over worldly concerns.',
      'Divine forces weave through your wyrd. This is a time for sacred work and inner transformation.',
      'The mystery deepens. Trust in the unseen patterns shaping your path.'
    ]
  };

  const baseMessages = wyrdMessages[dominantElement] || wyrdMessages.aether;
  let message = baseMessages[Math.floor(Math.random() * baseMessages.length)];

  // Add reversal context if significant
  if (reversedCount > runes.length / 2) {
    message += ' The merkstave runes suggest inner work is needed before outer progress can manifest.';
  } else if (reversedCount > 0) {
    message += ' Some challenges await, but they serve to strengthen your resolve.';
  }

  return message;
}

/**
 * Generate a ritual suggestion if none exists
 */
function generateRitualSuggestion(reading: RuneReading): string {
  const primaryRune = reading.drawnRunes[0]?.rune;
  if (!primaryRune) {
    return 'Light a candle and meditate on your question. Let the runes speak to your inner wisdom.';
  }

  return `Create sacred space and draw the rune ${primaryRune.name} (${primaryRune.symbol}) on paper or trace it in the air. ` +
    `Speak your question aloud three times, then sit in silence for nine breaths. ` +
    `${primaryRune.magicalUse} Journal any insights that arise.`;
}
