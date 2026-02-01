/**
 * I Ching Oracle API
 *
 * POST /api/oracle/iching
 * Casts hexagram using yarrow stalk method simulation
 */

import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { query, method = 'yarrow', lifeArea } = body;

    // Lazy import to avoid build issues
    const { castHexagram, TRIGRAMS, getHexagramByNumber } = await import('@/lib/oracle/data/iching');

    // Cast the hexagram
    const casting = castHexagram();

    // If hexagram not found in our data, create a basic response
    // (We have a subset of the 64 hexagrams defined)
    if (!casting.hexagram) {
      // Generate the hexagram number from lines
      const binaryValue = casting.lines.map(l => l.yang ? '1' : '0').join('');
      const hexNumber = parseInt(binaryValue, 2) % 64 + 1;

      // Return a generic response for undefined hexagrams
      const genericHexagram = {
        number: hexNumber,
        name: `Hexagram ${hexNumber}`,
        chineseName: '卦',
        character: '☰',
        judgment: 'The oracle speaks through the patterns. Observe what arises.',
        image: 'Heaven and earth in constant motion. The wise one adapts.',
        meaning: 'This hexagram invites contemplation. The lines have spoken; let their wisdom unfold in time.',
        keywords: ['contemplation', 'patience', 'observation'],
        element: 'spirit'
      };

      const lines = casting.lines.map((line, index) => ({
        position: index + 1,
        value: line.value,
        type: line.yang ? 'yang' : 'yin',
        changing: line.changing,
        changingLineMeaning: line.changing ? 'The changing line speaks to transformation in this position.' : undefined
      }));

      const reading = {
        method,
        query: query || null,
        lifeArea: lifeArea || null,
        hexagram: genericHexagram,
        upperTrigram: casting.upperTrigram ? {
          name: casting.upperTrigram.name,
          chineseName: casting.upperTrigram.chineseName,
          attribute: casting.upperTrigram.attribute,
          image: casting.upperTrigram.image,
          element: casting.upperTrigram.element
        } : null,
        lowerTrigram: casting.lowerTrigram ? {
          name: casting.lowerTrigram.name,
          chineseName: casting.lowerTrigram.chineseName,
          attribute: casting.lowerTrigram.attribute,
          image: casting.lowerTrigram.image,
          element: casting.lowerTrigram.element
        } : null,
        lines,
        changingLines: lines.filter(l => l.changing).map(l => l.position),
        transformedHexagram: null,
        synthesis: `The trigrams ${casting.upperTrigram?.name || 'above'} over ${casting.lowerTrigram?.name || 'below'} form a pattern of creative tension. Meditate on how these forces interact in your situation.`,
        timestamp: new Date().toISOString()
      };

      return NextResponse.json({ ok: true, reading });
    }

    // Build line data with changing status
    const lines = casting.lines.map((line, index) => ({
      position: index + 1,
      value: line.value,
      type: line.yang ? 'yang' : 'yin',
      changing: line.changing,
      changingLineMeaning: line.changing
        ? casting.hexagram?.changingLinesMeaning[index + 1]
        : undefined
    }));

    const changingLines = lines.filter(l => l.changing).map(l => l.position);

    // Build reading response
    const reading = {
      method,
      query: query || null,
      lifeArea: lifeArea || null,

      // Primary hexagram
      hexagram: {
        number: casting.hexagram.number,
        name: casting.hexagram.name,
        chineseName: casting.hexagram.chineseName,
        character: casting.hexagram.character,
        judgment: casting.hexagram.judgment,
        image: casting.hexagram.image,
        meaning: casting.hexagram.meaning,
        keywords: casting.hexagram.keywords,
        element: casting.hexagram.element
      },

      // Trigrams
      upperTrigram: casting.upperTrigram ? {
        name: casting.upperTrigram.name,
        chineseName: casting.upperTrigram.chineseName,
        attribute: casting.upperTrigram.attribute,
        image: casting.upperTrigram.image,
        element: casting.upperTrigram.element
      } : null,

      lowerTrigram: casting.lowerTrigram ? {
        name: casting.lowerTrigram.name,
        chineseName: casting.lowerTrigram.chineseName,
        attribute: casting.lowerTrigram.attribute,
        image: casting.lowerTrigram.image,
        element: casting.lowerTrigram.element
      } : null,

      // Lines with changing status
      lines,
      changingLines,

      // Transformed hexagram (if there are changing lines)
      transformedHexagram: casting.transformedHexagram ? {
        number: casting.transformedHexagram.number,
        name: casting.transformedHexagram.name,
        chineseName: casting.transformedHexagram.chineseName,
        character: casting.transformedHexagram.character,
        judgment: casting.transformedHexagram.judgment,
        image: casting.transformedHexagram.image,
        meaning: casting.transformedHexagram.meaning,
        keywords: casting.transformedHexagram.keywords
      } : null,

      // Synthesis
      synthesis: generateSynthesis(casting, query, lifeArea),

      timestamp: new Date().toISOString()
    };

    return NextResponse.json({ ok: true, reading });
  } catch (error) {
    console.error('[I Ching API] Error:', error);
    return NextResponse.json(
      { ok: false, error: 'Failed to cast hexagram' },
      { status: 500 }
    );
  }
}

function generateSynthesis(
  casting: {
    hexagram?: { name: string; number: number; meaning: string };
    transformedHexagram?: { name: string; number: number };
    lines: Array<{ changing: boolean }>;
  },
  query?: string,
  lifeArea?: string
): string {
  if (!casting.hexagram) return '';

  const changingCount = casting.lines.filter(l => l.changing).length;

  let synthesis = `Hexagram ${casting.hexagram.number}: ${casting.hexagram.name}. `;
  synthesis += `${casting.hexagram.meaning} `;

  if (changingCount > 0 && casting.transformedHexagram) {
    synthesis += `With ${changingCount} changing line${changingCount > 1 ? 's' : ''}, `;
    synthesis += `the situation transforms into Hexagram ${casting.transformedHexagram.number}: ${casting.transformedHexagram.name}. `;
    synthesis += `This suggests movement from one state to another. Pay attention to the changing lines—they speak to the specific dynamics of your situation.`;
  } else {
    synthesis += `No lines are changing, indicating a stable situation. The hexagram speaks to the nature of the moment as it is.`;
  }

  if (query && lifeArea) {
    synthesis += ` In matters of ${lifeArea}, consider how this wisdom applies.`;
  }

  return synthesis;
}
