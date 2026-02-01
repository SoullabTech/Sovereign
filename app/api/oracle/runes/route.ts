/**
 * Runes Oracle API
 *
 * POST /api/oracle/runes
 * Draws runes for a spread and returns reading
 */

import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { query, spreadType = 'single', lifeArea, allowMerkstave = false } = body;

    // Lazy import to avoid build issues
    const { drawRuneSpread, getSpread, ELDER_FUTHARK } = await import('@/lib/oracle/data/runes');

    const spread = getSpread(spreadType);
    if (!spread) {
      return NextResponse.json(
        { ok: false, error: `Unknown spread type: ${spreadType}` },
        { status: 400 }
      );
    }

    // Draw runes for the spread
    const drawnRunes = drawRuneSpread(spreadType, allowMerkstave);

    // Build reading response
    const runes = drawnRunes.map((rune, index) => {
      const positionContext = spread.positions[index];

      return {
        id: rune.id,
        name: rune.name,
        letter: rune.letter,
        unicode: rune.unicode,
        traditionalMeaning: rune.meaning,
        aett: rune.aett,
        element: rune.element,
        keywords: rune.keywords,

        // Position info
        position: positionContext.name,
        positionMeaning: positionContext.meaning,

        // Orientation
        merkstave: rune.merkstave,
        orientation: rune.merkstave ? 'merkstave' : 'upright',

        // Interpretation
        meaning: rune.merkstave ? rune.merkstave : rune.upright,
        practical: rune.practical,
        spiritual: rune.spiritual,
        mythology: rune.mythology,

        // Position-aware interpretation
        interpretation: generateInterpretation(rune, positionContext, lifeArea)
      };
    });

    // Generate synthesis
    const synthesis = generateSynthesis(runes, query, lifeArea, spreadType);

    // Generate wyrd message (mysterious insight)
    const wyrdMessage = generateWyrdMessage(runes);

    const reading = {
      spreadType,
      spreadName: spread.name,
      query: query || null,
      lifeArea: lifeArea || null,
      allowMerkstave,
      runes,
      synthesis,
      wyrdMessage,
      timestamp: new Date().toISOString()
    };

    return NextResponse.json({ ok: true, reading });
  } catch (error) {
    console.error('[Runes API] Error:', error);
    return NextResponse.json(
      { ok: false, error: 'Failed to cast runes' },
      { status: 500 }
    );
  }
}

function generateInterpretation(
  rune: {
    name: string;
    upright: string;
    merkstave: string;
    element: string;
    aett: string;
  } & { merkstave: boolean },
  position: { name: string; meaning: string },
  lifeArea?: string
): string {
  const baseMeaning = rune.merkstave ? rune.merkstave : rune.upright;

  let interpretation = `${rune.name} in the position of "${position.name}" (${position.meaning}): `;
  interpretation += baseMeaning;

  // Add aett context
  const aettContext = {
    freya: 'This rune from Freya\'s Aett speaks to creation, abundance, and the material world.',
    heimdall: 'This rune from Heimdall\'s Aett speaks to transformation, challenge, and inner growth.',
    tyr: 'This rune from Tyr\'s Aett speaks to justice, society, and higher purpose.'
  };

  interpretation += ` ${aettContext[rune.aett as keyof typeof aettContext]}`;

  if (lifeArea) {
    interpretation += ` Consider how this applies to your ${lifeArea}.`;
  }

  return interpretation;
}

function generateSynthesis(
  runes: Array<{ name: string; position: string; orientation: string; element: string; keywords: string[] }>,
  query?: string,
  lifeArea?: string,
  spreadType?: string
): string {
  const runeNames = runes.map(r => `${r.name} (${r.orientation})`).join(', ');
  const dominantElements = [...new Set(runes.map(r => r.element))];

  let synthesis = `The runes reveal: ${runeNames}. `;

  // Element analysis
  if (dominantElements.length === 1) {
    synthesis += `All runes share the ${dominantElements[0]} element, emphasizing its qualities. `;
  } else {
    synthesis += `Elements present: ${dominantElements.join(', ')}. `;
  }

  // Spread-specific synthesis
  if (spreadType === 'three-norns') {
    synthesis += `The Norns speak of your wyrd: what has been woven, what is being woven now, and what may yet be woven. `;
  } else if (spreadType === 'single') {
    synthesis += `This single rune cuts to the heart of the matter. Meditate on its form and sound. `;
  } else if (spreadType === 'elemental-cross') {
    synthesis += `The cross maps your situation across the four directions. Notice where strength lies and where attention is needed. `;
  }

  if (query) {
    synthesis += `Regarding your question: let the runes speak to what you already sense but have not yet named.`;
  }

  return synthesis;
}

function generateWyrdMessage(
  runes: Array<{ name: string; keywords: string[]; mythology: string }>
): string {
  // Pick a mysterious, poetic insight based on the runes
  const allKeywords = runes.flatMap(r => r.keywords);
  const randomKeyword = allKeywords[Math.floor(Math.random() * allKeywords.length)];

  const messages = [
    `The threads of wyrd are woven with ${randomKeyword}. What you seek is also seeking you.`,
    `${runes[0].name} speaks first, but the last whisper holds the deepest truth.`,
    `The runes do not predict—they reveal. What is revealed cannot be unseen.`,
    `In the space between the runes, silence speaks. Listen there.`,
    `The ancestors knew: the question shapes the answer. What are you truly asking?`,
    `${randomKeyword} appears in your wyrd. It has appeared before. It will appear again.`,
    `The runes fall as they will. Your interpretation is the only freedom you have.`
  ];

  return messages[Math.floor(Math.random() * messages.length)];
}
