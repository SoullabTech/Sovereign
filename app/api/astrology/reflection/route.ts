export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { requireMemberId } from '@/lib/auth/session';
import { transaction } from '@/lib/db/postgres';
import { createCapsule } from '@/lib/capsules/capsuleService';
import { recordFacetCrossing } from '@/lib/house/facetCrossing.server';

const HOUSE_SYSTEMS = new Set(['porphyry', 'placidus', 'whole-sign', 'equal', 'koch']);
const ZODIAC_MODES = new Set(['tropical', 'sidereal']);

function shortTitle(text: string): string {
  const first = text.split(/[\n.!?]/)[0]?.trim() || text.trim();
  const clipped = first.length <= 72 ? first : first.slice(0, 72).trimEnd() + '…';
  return 'Astrology · ' + clipped;
}

function sourceRef(args: {
  zodiacMode: 'tropical' | 'sidereal';
  houseSystem: string;
  ayanamsa?: string | null;
}): string {
  const parts = ['natal', args.zodiacMode, args.houseSystem];
  if (args.zodiacMode === 'sidereal' && args.ayanamsa) parts.push(args.ayanamsa);
  return parts.join(':');
}

export async function POST(request: NextRequest) {
  try {
    const memberId = await requireMemberId();
    const body = await request.json().catch(() => null) as {
      text?: unknown;
      zodiacMode?: unknown;
      houseSystem?: unknown;
      ayanamsa?: unknown;
    } | null;

    const text = typeof body?.text === 'string' ? body.text.trim() : '';
    const zodiacMode = typeof body?.zodiacMode === 'string' ? body.zodiacMode : '';
    const houseSystem = typeof body?.houseSystem === 'string' ? body.houseSystem : '';
    const ayanamsa = typeof body?.ayanamsa === 'string' ? body.ayanamsa.trim() : '';

    if (!text) {
      return NextResponse.json({ error: 'Reflection text is required.' }, { status: 400 });
    }
    if (text.length > 4000) {
      return NextResponse.json({ error: 'Reflection text must be 4000 characters or fewer.' }, { status: 400 });
    }
    if (!ZODIAC_MODES.has(zodiacMode) || !HOUSE_SYSTEMS.has(houseSystem)) {
      return NextResponse.json({ error: 'Invalid astrology lens.' }, { status: 400 });
    }
    if (ayanamsa && !/^[a-z0-9_-]{1,40}$/i.test(ayanamsa)) {
      return NextResponse.json({ error: 'Invalid ayanamsa.' }, { status: 400 });
    }

    const normalizedMode = zodiacMode as 'tropical' | 'sidereal';
    const astrologyRef = sourceRef({
      zodiacMode: normalizedMode,
      houseSystem,
      ayanamsa: ayanamsa || null,
    });

    const result = await transaction(async (client) => {
      const ownedChart = await client.query<{ id: string }>(
        `SELECT id::text AS id
           FROM members
          WHERE id = $1::uuid
            AND birth_date IS NOT NULL
          LIMIT 1`,
        [memberId],
      );
      if (!ownedChart.rows[0]) {
        return { kind: 'no_chart' as const };
      }

      const capsule = await createCapsule({
        userId: memberId,
        sourceType: 'astrology',
        sourceId: astrologyRef,
        title: shortTitle(text),
        summary: text,
        goldLines: [],
        decisions: [],
        nextSteps: [],
        practices: [],
        patterns: [],
        signals: { facet: 'astrology', tone: 'member-recognition' },
        tags: ['member-kept', 'astrology', 'chart-recognition'],
        sourceExcerpt: null,
        draft: false,
        client,
      });

      await recordFacetCrossing(client, {
        memberId,
        crossingId: 'astrology-keep-as-reflection',
        sourceFacet: 'astrology',
        sourceRefId: astrologyRef,
        targetFacet: 'reflections',
        targetRefId: capsule.id,
      });

      return { kind: 'kept' as const, capsule };
    });

    if (result.kind === 'no_chart') {
      return NextResponse.json(
        { error: 'A member-owned birth chart is required before keeping an Astrology reflection.' },
        { status: 409 },
      );
    }

    return NextResponse.json({
      success: true,
      reflection: result.capsule,
      href: '/reflections/' + encodeURIComponent(result.capsule.id),
    }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === 'AUTH_REQUIRED') {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    console.error('[Astrology→Reflections] keep failed');
    return NextResponse.json({ error: 'Could not keep this reflection.' }, { status: 500 });
  }
}
