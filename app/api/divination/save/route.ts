/**
 * Divination Save API
 * POST /api/divination/save
 *
 * Member-explicit crossing:
 *   Divination reading -> Reflection
 *
 * The visible gesture in I Ching / Tarot / Runes is "Save Reading". The whole
 * act is atomic: save the source reading, create the kept Reflection, and record
 * the durable facet crossing. No LLM redistillation occurs at this seam.
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { requireMemberId } from '@/lib/auth/session';
import { transaction } from '@/lib/db/postgres';
import { createCapsule } from '@/lib/capsules/capsuleService';
import { recordFacetCrossing } from '@/lib/house/facetCrossing.server';
import {
  divinationService,
  type SaveIChingInput,
  type SaveTarotInput,
  type SaveRunesInput,
  type DivinationType,
  type DivinationReading,
} from '@/lib/services/divinationService';

function compact(value: string | null | undefined, max = 1200): string {
  const text = value?.trim() || '';
  return text.length <= max ? text : text.slice(0, max).trimEnd() + '…';
}

function shortQuestion(question: string | null | undefined): string | null {
  const text = question?.trim();
  if (!text) return null;
  return text.length <= 82 ? text : text.slice(0, 82).trimEnd() + '…';
}

function reflectionFromReading(reading: DivinationReading): {
  sourceRefId: string;
  title: string;
  summary: string;
  sourceExcerpt: string;
  facet: string;
} {
  const question = shortQuestion(reading.question);

  if (reading.type === 'iching') {
    const title = question
      ? `I Ching · ${question}`
      : `I Ching · Hexagram ${reading.primary_hex}: ${reading.primary_hex_name}`;
    const sourceExcerpt = [
      reading.question ? `Question: ${reading.question}` : '',
      `Hexagram ${reading.primary_hex}: ${reading.primary_hex_name}`,
      reading.interpretation_text || '',
      reading.guidance_text ? `Guidance: ${reading.guidance_text}` : '',
    ].filter(Boolean).join('\n\n');

    return {
      sourceRefId: `iching:${reading.id}`,
      title,
      summary: compact(reading.interpretation_text || reading.guidance_text || sourceExcerpt),
      sourceExcerpt: compact(sourceExcerpt, 1800),
      facet: 'iching',
    };
  }

  if (reading.type === 'tarot') {
    const cards = Array.isArray(reading.cards_json)
      ? reading.cards_json.slice(0, 6).map((card) =>
          `${card.card || 'Card'}${card.reversed ? ' (reversed)' : ''}${card.position ? ' — ' + card.position : ''}`
        ).join('; ')
      : '';
    const spread = reading.spread_type.replace(/_/g, ' ');
    const title = question ? `Tarot · ${question}` : `Tarot · ${spread}`;
    const sourceExcerpt = [
      reading.question ? `Question: ${reading.question}` : '',
      cards ? `Cards: ${cards}` : '',
      reading.interpretation_text || '',
      reading.guidance_text ? `Guidance: ${reading.guidance_text}` : '',
    ].filter(Boolean).join('\n\n');

    return {
      sourceRefId: `tarot:${reading.id}`,
      title,
      summary: compact(reading.interpretation_text || reading.guidance_text || sourceExcerpt),
      sourceExcerpt: compact(sourceExcerpt, 1800),
      facet: 'tarot',
    };
  }

  const runes = Array.isArray(reading.runes_json)
    ? reading.runes_json.slice(0, 6).map((rune) =>
        `${rune.rune || 'Rune'}${rune.reversed ? ' (merkstave)' : ''}${rune.position ? ' — ' + rune.position : ''}`
      ).join('; ')
    : '';
  const cast = reading.cast_type.replace(/_/g, ' ');
  const title = question ? `Runes · ${question}` : `Runes · ${cast}`;
  const sourceExcerpt = [
    reading.question ? `Question: ${reading.question}` : '',
    runes ? `Runes: ${runes}` : '',
    reading.wyrd_message ? `Wyrd: ${reading.wyrd_message}` : '',
    reading.interpretation_text || '',
    reading.guidance_text ? `Guidance: ${reading.guidance_text}` : '',
  ].filter(Boolean).join('\n\n');

  return {
    sourceRefId: `runes:${reading.id}`,
    title,
    summary: compact(
      reading.interpretation_text || reading.guidance_text || reading.wyrd_message || sourceExcerpt,
    ),
    sourceExcerpt: compact(sourceExcerpt, 1800),
    facet: 'runes',
  };
}

export async function POST(request: NextRequest) {
  try {
    let userId: string;
    try {
      userId = await requireMemberId();
    } catch {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 },
      );
    }

    const body = await request.json();
    const { type, reading } = body as { type: DivinationType; reading: unknown };

    if (!type || !reading) {
      return NextResponse.json(
        { success: false, error: 'Missing type or reading data' },
        { status: 400 },
      );
    }

    if (type !== 'iching' && type !== 'tarot' && type !== 'runes') {
      return NextResponse.json(
        { success: false, error: `Invalid divination type: ${type}` },
        { status: 400 },
      );
    }

    const result = await transaction(async (client) => {
      let savedReading: DivinationReading | null = null;

      if (type === 'iching') {
        savedReading = await divinationService.saveIChingReading(
          reading as SaveIChingInput,
          userId,
          client,
        );
      } else if (type === 'tarot') {
        savedReading = await divinationService.saveTarotReading(
          reading as SaveTarotInput,
          userId,
          client,
        );
      } else {
        savedReading = await divinationService.saveRunesReading(
          reading as SaveRunesInput,
          userId,
          client,
        );
      }

      if (!savedReading) {
        throw new Error('DIVINATION_SAVE_FAILED');
      }

      const reflection = reflectionFromReading(savedReading);
      const capsule = await createCapsule({
        userId,
        sourceType: 'divination',
        sourceId: reflection.sourceRefId,
        title: reflection.title,
        summary: reflection.summary || reflection.title,
        sourceExcerpt: reflection.sourceExcerpt || null,
        signals: { facet: reflection.facet, tone: 'symbolic' },
        tags: ['member-kept', 'divination', reflection.facet],
        draft: false,
        client,
      });

      await recordFacetCrossing(client, {
        memberId: userId,
        crossingId: 'divination-save-to-reflections',
        sourceFacet: 'divination',
        sourceRefId: reflection.sourceRefId,
        targetFacet: 'reflections',
        targetRefId: capsule.id,
      });

      return { savedReading, capsule };
    });

    return NextResponse.json({
      success: true,
      reading: result.savedReading,
      reflection: result.capsule,
      message: 'Reading saved to your reflections',
    });
  } catch (error) {
    console.error('[API] Error saving divination reading:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 },
    );
  }
}
