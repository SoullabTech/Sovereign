export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import {
  castIChing,
  findHexagramFromLines,
  getHexagram,
  LineValue
} from '@/lib/divination';

/**
 * I Ching Oracle API
 * POST /api/oracle/iching
 *
 * Accepts a query and optional pre-cast lines, returns a complete reading
 */

interface IChingRequest {
  query: string;
  method?: 'yarrow' | 'coins';
  lines?: Array<{ type: 'yang' | 'yin'; changing: boolean; value: number }>;
}

export async function POST(request: NextRequest) {
  try {
    const body: IChingRequest = await request.json();
    const { query, method = 'yarrow', lines } = body;

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      );
    }

    let reading;

    if (lines && Array.isArray(lines) && lines.length === 6) {
      // Use pre-cast lines from frontend animation
      const lineValues = lines.map(l => l.value as LineValue);
      const { hexagram, changingLines, transformedHexagram } = findHexagramFromLines(lineValues);

      // Build the reading response
      reading = {
        hexagram: {
          number: hexagram.number,
          name: hexagram.englishName,
          keyword: hexagram.keyword,
          lines: hexagram.lines.map(l => l === 'yang' ? '-------' : '--- ---'),
          trigrams: {
            upper: hexagram.trigrams.upper,
            lower: hexagram.trigrams.lower
          },
          interpretation: hexagram.soulInterpretation,
          guidance: hexagram.guidance,
          timing: hexagram.timing,
          changingLines: changingLines,
          transformed: transformedHexagram ? {
            number: transformedHexagram.number,
            name: transformedHexagram.englishName,
            keyword: transformedHexagram.keyword
          } : undefined
        },
        insight: hexagram.soulInterpretation,
        guidance: hexagram.guidance,
        sacredTiming: hexagram.timing,
        archetypalTheme: hexagram.archetypeCorrespondence,
        ritual: `Light a candle and meditate on the image of ${hexagram.englishName}. Journal about how this hexagram relates to your question: "${query}". Notice any changing lines as markers of transformation in your situation.`
      };
    } else {
      // Cast fresh using the library
      const castReading = castIChing(query, method);

      reading = {
        hexagram: {
          number: castReading.primaryHexagram.number,
          name: castReading.primaryHexagram.englishName,
          keyword: castReading.primaryHexagram.keyword,
          lines: castReading.primaryHexagram.lines.map(l => l === 'yang' ? '-------' : '--- ---'),
          trigrams: {
            upper: castReading.primaryHexagram.trigrams.upper,
            lower: castReading.primaryHexagram.trigrams.lower
          },
          interpretation: castReading.primaryHexagram.soulInterpretation,
          guidance: castReading.primaryHexagram.guidance,
          timing: castReading.primaryHexagram.timing,
          changingLines: castReading.changingLines,
          transformed: castReading.transformedHexagram ? {
            number: castReading.transformedHexagram.number,
            name: castReading.transformedHexagram.englishName,
            keyword: castReading.transformedHexagram.keyword
          } : undefined
        },
        insight: castReading.insight,
        guidance: castReading.soulGuidance,
        sacredTiming: castReading.primaryHexagram.timing,
        archetypalTheme: castReading.primaryHexagram.archetypeCorrespondence,
        ritual: castReading.ritual?.steps.join(' ')
      };
    }

    return NextResponse.json({ reading });
  } catch (error) {
    console.error('I Ching oracle error:', error);
    return NextResponse.json(
      { error: 'Failed to generate reading' },
      { status: 500 }
    );
  }
}
