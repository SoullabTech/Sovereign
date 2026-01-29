export const dynamic = 'force-dynamic';

/**
 * POST /api/capsules/from-oracle
 *
 * Create a capsule from an oracle reading (I Ching, Tarot, Runes)
 * Oracle readings already have structured insight, so minimal distillation needed.
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireMemberId } from '@/lib/auth/session';
import {
  CapsuleCreateFromOracleSchema,
  createCapsule,
} from '@/lib/capsules';

/**
 * Generate a title from the oracle reading
 */
function generateOracleTitle(oracleReading: {
  oracleType: string;
  question: string;
  hexagram?: { name: string; number: number };
  cards?: { name: string }[];
  runes?: { name: string }[];
}): string {
  const { oracleType, question, hexagram, cards, runes } = oracleReading;

  // Truncate question if too long
  const shortQuestion = question.length > 30
    ? question.slice(0, 27) + '...'
    : question;

  switch (oracleType) {
    case 'iching':
      if (hexagram) {
        return `I Ching: ${hexagram.name} (#${hexagram.number})`;
      }
      return `I Ching Reading: ${shortQuestion}`;

    case 'tarot':
      if (cards && cards.length > 0) {
        if (cards.length === 1) {
          return `Tarot: ${cards[0].name}`;
        }
        return `Tarot: ${cards.map(c => c.name).slice(0, 3).join(', ')}${cards.length > 3 ? '...' : ''}`;
      }
      return `Tarot Reading: ${shortQuestion}`;

    case 'runes':
      if (runes && runes.length > 0) {
        if (runes.length === 1) {
          return `Runes: ${runes[0].name}`;
        }
        return `Runes: ${runes.map(r => r.name).slice(0, 3).join(', ')}${runes.length > 3 ? '...' : ''}`;
      }
      return `Rune Reading: ${shortQuestion}`;

    default:
      return `Oracle Reading: ${shortQuestion}`;
  }
}

/**
 * Generate a summary from the oracle reading
 */
function generateOracleSummary(oracleReading: {
  oracleType: string;
  question: string;
  spread?: string;
  insight?: string;
  soulGuidance?: string;
  hexagram?: { name: string; keyword?: string };
  cards?: { name: string; position: string }[];
  runes?: { name: string; position: string }[];
}): string {
  const { oracleType, question, spread, insight, soulGuidance, hexagram, cards, runes } = oracleReading;

  let summary = `Question: "${question}"`;

  if (spread) {
    summary += ` | Spread: ${spread}`;
  }

  switch (oracleType) {
    case 'iching':
      if (hexagram) {
        summary += ` | Hexagram: ${hexagram.name}`;
        if (hexagram.keyword) {
          summary += ` (${hexagram.keyword})`;
        }
      }
      break;

    case 'tarot':
      if (cards && cards.length > 0) {
        summary += ` | Cards: ${cards.map(c => `${c.name} (${c.position})`).join(', ')}`;
      }
      break;

    case 'runes':
      if (runes && runes.length > 0) {
        summary += ` | Runes: ${runes.map(r => `${r.name} (${r.position})`).join(', ')}`;
      }
      break;
  }

  if (insight) {
    summary += `\n\nInsight: ${insight}`;
  }

  if (soulGuidance) {
    summary += `\n\nGuidance: ${soulGuidance}`;
  }

  return summary;
}

/**
 * Generate source excerpt for oracle reading
 */
function generateOracleExcerpt(oracleReading: {
  oracleType: string;
  question: string;
  insight?: string;
}): string {
  const { question, insight } = oracleReading;
  let excerpt = `Question: ${question}`;
  if (insight) {
    excerpt += `\n\nInsight: ${insight.slice(0, 300)}${insight.length > 300 ? '...' : ''}`;
  }
  return excerpt;
}

export async function POST(request: NextRequest) {
  try {
    // Require authentication
    const memberId = await requireMemberId();

    // Parse and validate body
    const body = await request.json();
    const parseResult = CapsuleCreateFromOracleSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Invalid request body', details: parseResult.error.flatten() },
        { status: 400 }
      );
    }

    const { oracleReading, title, tags, signals, draft } = parseResult.data;

    // Generate title and summary from oracle reading
    const generatedTitle = title || generateOracleTitle(oracleReading);
    const generatedSummary = generateOracleSummary(oracleReading);
    const sourceExcerpt = generateOracleExcerpt(oracleReading);

    // Determine element from oracle type
    const elementMap: Record<string, 'fire' | 'water' | 'earth' | 'air' | 'aether'> = {
      iching: 'aether',
      tarot: 'water',
      runes: 'earth',
    };

    // Build gold lines from insight
    const goldLines: { text: string; speaker?: 'user' | 'maia' }[] = [];
    if (oracleReading.insight) {
      goldLines.push({ text: oracleReading.insight, speaker: 'maia' });
    }
    if (oracleReading.soulGuidance) {
      goldLines.push({ text: oracleReading.soulGuidance, speaker: 'maia' });
    }

    // Create the capsule
    const capsule = await createCapsule({
      userId: memberId,
      sourceType: 'oracle',
      title: generatedTitle,
      summary: generatedSummary,
      goldLines,
      decisions: [],
      nextSteps: [],
      practices: [],
      patterns: [],
      signals: signals || {
        element: elementMap[oracleReading.oracleType] || 'aether',
        tone: 'contemplative',
        archetype: oracleReading.oracleType === 'iching' ? 'sage'
                 : oracleReading.oracleType === 'tarot' ? 'mystic'
                 : 'seer',
      },
      tags: tags || [oracleReading.oracleType, 'oracle', oracleReading.spread || 'reading'].filter(Boolean),
      sourceExcerpt,
      draft: draft ?? false,
    });

    console.log(`[API] Created oracle capsule ${capsule.id} for member ${memberId.slice(0, 8)}`);

    return NextResponse.json({ capsule }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === 'AUTH_REQUIRED') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    console.error('[API] POST /api/capsules/from-oracle error:', error);
    return NextResponse.json(
      { error: 'Failed to create capsule' },
      { status: 500 }
    );
  }
}
